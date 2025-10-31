use axum::extract::FromRequestParts;
use axum::http::{header::AUTHORIZATION, request::Parts, StatusCode};

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
                        // Get phone_number directly from JWT claims (no database query needed)
                        return Ok(AuthenticatedUser(AuthUser {
                            id: user_id,
                            email: claims.email,
                            phone_number: claims.phone_number,
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
