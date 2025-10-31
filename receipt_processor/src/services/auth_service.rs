use crate::models::auth::{
    ApiKeyResponse, AuthResponse, Claims, CreateApiKeyRequest, LoginRequest, RegisterRequest, User,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use sqlx::PgPool;
use uuid::Uuid;

pub struct AuthService;

impl AuthService {
    // JWT secret - should be from environment variable
    fn get_jwt_secret() -> String {
        std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "your-secret-key-change-this-in-production".to_string())
    }

    // Validate phone number format (basic E.164 validation)
    fn validate_phone_number(phone: &str) -> bool {
        phone.starts_with('+')
            && phone.len() >= 10
            && phone.chars().skip(1).all(|c| c.is_ascii_digit())
    }

    // Register a new user
    pub async fn register_user(
        pool: &PgPool,
        request: RegisterRequest,
    ) -> Result<AuthResponse, Box<dyn std::error::Error>> {
        // Validate phone number is provided
        let phone_number = request
            .phone_number
            .ok_or("Phone number is required")?
            .trim()
            .to_string();

        if phone_number.is_empty() {
            return Err("Phone number is required".into());
        }

        // Validate phone number format
        if !Self::validate_phone_number(&phone_number) {
            return Err(
                "Invalid phone number format. Use E.164 format (e.g., +15551234567)".into(),
            );
        }

        // Hash the password
        let password_hash = hash(request.password.as_str(), DEFAULT_COST)?;

        // Generate a user ID
        let user_id = Uuid::new_v4();
        let now = Utc::now();

        // Insert the user into the database
        sqlx::query!(
            r#"
            INSERT INTO users (id, email, password_hash, phone_number, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            user_id,
            request.email,
            password_hash,
            phone_number,
            now,
            now
        )
        .execute(pool)
        .await?;

        // Create user object
        let user = User {
            id: user_id,
            email: request.email,
            phone_number: phone_number.clone(),
            created_at: now,
            updated_at: now,
        };

        // Generate a JWT token
        let token = Self::generate_jwt_token(&user)?;

        // Return the auth response
        Ok(AuthResponse { user, token })
    }

    // Login a user
    pub async fn login_user(
        pool: &PgPool,
        request: LoginRequest,
    ) -> Result<AuthResponse, Box<dyn std::error::Error>> {
        // Find the user by email
        let user_row = sqlx::query!(
            r#"
            SELECT id, email, password_hash, phone_number, created_at, updated_at
            FROM users
            WHERE email = $1
            "#,
            request.email
        )
        .fetch_optional(pool)
        .await?;

        let user_row = user_row.ok_or("Invalid email or password")?;

        // Verify the password
        let valid = verify(&request.password, &user_row.password_hash)?;
        if !valid {
            return Err("Invalid email or password".into());
        }

        let user = User {
            id: user_row.id,
            email: user_row.email,
            phone_number: user_row.phone_number,
            created_at: user_row.created_at,
            updated_at: user_row.updated_at,
        };

        // Generate a JWT token
        let token = Self::generate_jwt_token(&user)?;

        Ok(AuthResponse { user, token })
    }

    // Generate a JWT token
    pub fn generate_jwt_token(user: &User) -> Result<String, Box<dyn std::error::Error>> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::days(7))
            .expect("valid timestamp")
            .timestamp() as usize;

        let claims = Claims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            exp: expiration,
            phone_number: user.phone_number.clone(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(Self::get_jwt_secret().as_ref()),
        )?;

        Ok(token)
    }

    // Verify a JWT token
    pub fn verify_token(token: &str) -> Result<Claims, Box<dyn std::error::Error>> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(Self::get_jwt_secret().as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }

    // Create a new API key
    pub async fn create_api_key(
        pool: &PgPool,
        user_id: Uuid,
        request: CreateApiKeyRequest,
    ) -> Result<ApiKeyResponse, Box<dyn std::error::Error>> {
        // Generate random API key
        let key = format!("ak_live_{}", Uuid::new_v4().to_string().replace("-", ""));
        let key_hash = hash(&key, DEFAULT_COST)?;

        let id = Uuid::new_v4();
        let now = Utc::now();

        let expires_at = request
            .expires_at
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        sqlx::query!(
            r#"
              INSERT INTO api_keys (id, user_id, key_hash, name, created_at, expires_at)
              VALUES ($1, $2, $3, $4, $5, $6)
              "#,
            id,
            user_id,
            key_hash,
            request.name,
            now,
            expires_at
        )
        .execute(pool)
        .await?;

        Ok(ApiKeyResponse {
            id,
            name: request.name,
            key, // Only returned once!
            created_at: now,
            expires_at,
        })
    }

    // Verify API key and return user ID if valid
    pub async fn verify_api_key(pool: &PgPool, key: &str) -> Result<Uuid, sqlx::Error> {
        // Get all API keys (in production, you'd want to optimize this)
        let keys = sqlx::query!(
            r#"
            SELECT id, user_id, key_hash, expires_at
            FROM api_keys
            WHERE expires_at IS NULL OR expires_at > NOW()
            "#
        )
        .fetch_all(pool)
        .await?;

        // Check each key hash
        for key_row in keys {
            if verify(key, &key_row.key_hash).unwrap_or(false) {
                let now = Utc::now();

                sqlx::query!(
                    "UPDATE api_keys SET last_used_at = $1 WHERE id = $2",
                    now,
                    key_row.id
                )
                .execute(pool)
                .await?;

                return Ok(key_row.user_id);
            }
        }
        Err(sqlx::Error::RowNotFound)
    }

    // List all users (for testing purposes)
    pub async fn list_users(pool: &PgPool) -> Result<Vec<User>, Box<dyn std::error::Error>> {
        let users = sqlx::query_as!(
            User,
            r#"
            SELECT id, email, phone_number, created_at, updated_at
            FROM users
            ORDER BY created_at ASC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(users)
    }

    // Find user by phone number (for receipt matching)
    pub async fn find_user_by_phone(
        pool: &PgPool,
        phone_number: &str,
    ) -> Result<Option<User>, sqlx::Error> {
        let user_row = sqlx::query!(
            r#"
            SELECT id, email, phone_number, created_at, updated_at
            FROM users
            WHERE phone_number = $1
            "#,
            phone_number
        )
        .fetch_optional(pool)
        .await?;

        if let Some(row) = user_row {
            Ok(Some(User {
                id: row.id,
                email: row.email,
                phone_number: row.phone_number,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }))
        } else {
            Ok(None)
        }
    }
}
