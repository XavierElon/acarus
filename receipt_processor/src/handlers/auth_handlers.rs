use axum::{extract::Extension, http::StatusCode, Json};
use sqlx::PgPool;
use utoipa;

use crate::models::auth::{
    ApiKeyResponse, AuthResponse, CreateApiKeyRequest, ErrorResponse, LoginRequest,
    RegisterRequest, User,
};
use crate::services::auth_service::AuthService;
use crate::utils::auth_extractor::AuthenticatedUser;

/// Register a new user
#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered successfully", body = AuthResponse),
        (status = 400, description = "Invalid request or email already exists"),
        (status = 500, description = "Internal server error")
    ),
    tag = "auth"
)]
pub async fn register_user(
    Extension(pool): Extension<PgPool>,
    Json(request): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, Json<ErrorResponse>)> {
    match AuthService::register_user(&pool, request).await {
        Ok(auth_response) => Ok((StatusCode::CREATED, Json(auth_response))),
        Err(e) => {
            let error_message = e.to_string();
            Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: error_message,
                }),
            ))
        }
    }
}

/// Login user
#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = AuthResponse),
        (status = 401, description = "Invalid credentials"),
        (status = 500, description = "Internal server error")
    ),
    tag = "auth"
)]
pub async fn login_user(
    Extension(pool): Extension<PgPool>,
    Json(request): Json<LoginRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), StatusCode> {
    match AuthService::login_user(&pool, request).await {
        Ok(auth_response) => Ok((StatusCode::OK, Json(auth_response))),
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

/// Create API key
#[utoipa::path(
    post,
    path = "/auth/api-keys",
    request_body = CreateApiKeyRequest,
    responses(
        (status = 201, description = "API key created successfully", body = ApiKeyResponse),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "auth"
)]
pub async fn create_api_key(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Json(request): Json<CreateApiKeyRequest>,
) -> Result<(StatusCode, Json<ApiKeyResponse>), StatusCode> {
    match AuthService::create_api_key(&pool, user.id, request).await {
        Ok(api_key) => Ok((StatusCode::CREATED, Json(api_key))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// List all users (for testing purposes)
#[utoipa::path(
    get,
    path = "/users",
    responses(
        (status = 200, description = "Users retrieved successfully", body = Vec<User>),
        (status = 500, description = "Internal server error")
    ),
    tag = "auth"
)]
pub async fn list_users(Extension(pool): Extension<PgPool>) -> Result<Json<Vec<User>>, StatusCode> {
    match AuthService::list_users(&pool).await {
        Ok(users) => Ok(Json(users)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
