use axum::{
    http::{header::AUTHORIZATION, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;

use crate::models::auth::AuthUser;
use crate::services::auth_service::AuthService;

pub async fn auth_middleware(
    pool: PgPool,
    mut request: Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    if let Some(auth_header) = auth_header {
        // Check for Bearer token (JWT)
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            if let Ok(claims) = AuthService::verify_token(token) {
                if let Ok(user_id) = uuid::Uuid::parse_str(&claims.sub) {
                    let auth_user = AuthUser {
                        id: user_id,
                        email: claims.email,
                        phone_number: claims.phone_number,
                    };

                    request.extensions_mut().insert(auth_user);
                    return Ok(next.run(request).await);
                }
            }
        }

        // Check for API key
        if let Some(api_key) = auth_header.strip_prefix("ApiKey ") {
            if let Ok(user_id) = AuthService::verify_api_key(&pool, api_key).await {
                // Get user email and phone_number
                if let Ok(user) = sqlx::query!(
                    "SELECT email, phone_number FROM users WHERE id = $1",
                    user_id
                )
                .fetch_one(&pool)
                .await
                {
                    let auth_user = AuthUser {
                        id: user_id,
                        email: user.email,
                        phone_number: user.phone_number,
                    };

                    request.extensions_mut().insert(auth_user);
                    return Ok(next.run(request).await);
                }
            }
        }
    }

    // Return unauthorized response
    Err(StatusCode::UNAUTHORIZED)
}
