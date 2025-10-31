use axum::{
    http::{header::AUTHORIZATION, StatusCode},
    response::Response,
};
use sqlx::PgPool;

use crate::models::auth::AuthUser;
use crate::services::auth_service::AuthService;

/// Extract and validate authentication from request headers
/// Returns Ok(AuthUser) if authentication is successful, Err(StatusCode) otherwise
pub async fn authenticate_from_headers(
    headers: &axum::http::HeaderMap,
    pool: &PgPool,
) -> Result<AuthUser, StatusCode> {
    let auth_header = headers.get(AUTHORIZATION).and_then(|h| h.to_str().ok());

    if let Some(auth_header) = auth_header {
        // Check for Bearer token (JWT)
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            if let Ok(claims) = AuthService::verify_token(token) {
                if let Ok(user_id) = uuid::Uuid::parse_str(&claims.sub) {
                    return Ok(AuthUser {
                        id: user_id,
                        email: claims.email,
                        phone_number: claims.phone_number,
                    });
                }
            }
        }

        // Check for API key
        if let Some(api_key) = auth_header.strip_prefix("ApiKey ") {
            if let Ok(user_id) = AuthService::verify_api_key(pool, api_key).await {
                // Get user email and phone_number
                if let Ok(user) = sqlx::query!(
                    "SELECT email, phone_number FROM users WHERE id = $1",
                    user_id
                )
                .fetch_one(pool)
                .await
                {
                    return Ok(AuthUser {
                        id: user_id,
                        email: user.email,
                        phone_number: user.phone_number,
                    });
                }
            }
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

/// Create an unauthorized response
pub fn unauthorized_response() -> Response<axum::body::Body> {
    Response::builder()
        .status(StatusCode::UNAUTHORIZED)
        .body("Unauthorized".into())
        .unwrap()
}
