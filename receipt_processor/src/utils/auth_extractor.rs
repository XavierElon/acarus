use axum::extract::FromRequestParts;
use axum::http::{header::AUTHORIZATION, request::Parts, StatusCode};
use sqlx::PgPool;

use crate::models::auth::AuthUser;
use crate::services::auth_service::AuthService;

/// Custom extractor for authenticated users
#[derive(Clone, Debug)]
pub struct AuthenticatedUser(pub AuthUser);

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Get the database pool from extensions
        let _pool = parts
            .extensions
            .get::<PgPool>()
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

        // Get the Authorization header
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|h| h.to_str().ok());

        if let Some(auth_header) = auth_header {
            // Check for Bearer token (JWT)
            if let Some(token) = auth_header.strip_prefix("Bearer ") {
                if let Ok(claims) = AuthService::verify_token(token) {
                    if let Ok(user_id) = uuid::Uuid::parse_str(&claims.sub) {
                        return Ok(AuthenticatedUser(AuthUser {
                            id: user_id,
                            email: claims.email,
                        }));
                    }
                }
            }

            // Check for API key
            // TODO: API key validation requires async database queries which aren't supported in FromRequestParts
            // Consider implementing a custom middleware or using a different approach for API key auth
            if let Some(_api_key) = auth_header.strip_prefix("ApiKey ") {
                return Err(StatusCode::UNAUTHORIZED);
            }
        }

        Err(StatusCode::UNAUTHORIZED)
    }
}
