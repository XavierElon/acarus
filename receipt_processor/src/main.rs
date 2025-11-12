use axum::{
    routing::{delete, get, post, put},
    Extension, Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod database;
mod handlers;
mod models;
mod services;
mod utils;

mod middleware;
use database::connection::create_pool;
use database::redis::create_redis_pool;
use handlers::{auth_handlers, receipt_handlers};
use models::auth::{
    ApiKeyResponse, AuthResponse, CreateApiKeyRequest, ErrorResponse, LoginRequest,
    RegisterRequest, User,
};
use models::receipt::{
    CreateReceiptItemRequest, CreateReceiptRequest, CurrencyStats, ListReceiptsQuery, MonthlyStats,
    Receipt, ReceiptItem, ReceiptStats, ReceiptsListResponse, SearchReceiptsQuery, StatsQuery,
    UpdateReceiptRequest, VendorStats,
};

/// API Documentation
#[derive(OpenApi)]
#[openapi(
    paths(
        receipt_handlers::create_receipt,
        receipt_handlers::get_receipt,
        receipt_handlers::update_receipt,
        receipt_handlers::delete_receipt,
        receipt_handlers::list_receipts,
        receipt_handlers::search_receipts,
        receipt_handlers::get_stats,
        auth_handlers::register_user,
        auth_handlers::login_user,
        auth_handlers::create_api_key,
        auth_handlers::list_users,
    ),
    components(
        schemas(Receipt, ReceiptItem, CreateReceiptRequest, CreateReceiptItemRequest, ListReceiptsQuery, UpdateReceiptRequest, ReceiptsListResponse, SearchReceiptsQuery
        , ReceiptStats, StatsQuery, VendorStats, CurrencyStats, MonthlyStats, User, ApiKeyResponse, AuthResponse, CreateApiKeyRequest, LoginRequest, RegisterRequest, ErrorResponse)
    ),
    tags(
        (name = "receipts", description = "Receipt management endpoints"),
        (name = "auth", description = "Authentication endpoints")
    ),
    info(
        title = "Receipt Processor API",
        version = "1.0.0",
        description = "API for processing and managing receipts",
        contact(
            name = "API Support",
            email = "support@example.com"
        )
    ),
    modifiers(&SecurityAddon)
)]
struct ApiDoc;

// Add security scheme
struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                utoipa::openapi::security::SecurityScheme::Http(
                    utoipa::openapi::security::HttpBuilder::new()
                        .scheme(utoipa::openapi::security::HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            )
        }
    }
}

#[tokio::main]
async fn main() {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    println!("Starting Receipt Processor...");

    // Create a database pool
    let pool = create_pool().await.expect("Failed to create pool");

    // Create Redis pool (optional - won't fail if Redis is unavailable)
    let redis_pool = create_redis_pool().await.ok().map(Arc::new);

    // Create public routes (no authentication required)
    let public_routes = Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_check))
        .route("/users", get(auth_handlers::list_users))
        .route("/auth/register", post(auth_handlers::register_user))
        .route("/auth/login", post(auth_handlers::login_user));

    // Create protected routes (authentication required)
    let protected_routes = Router::new()
        .route("/auth/api-keys", post(auth_handlers::create_api_key))
        .route("/receipts", get(receipt_handlers::list_receipts))
        .route("/receipts", post(receipt_handlers::create_receipt))
        .route("/receipts/{id}", get(receipt_handlers::get_receipt))
        .route("/receipts/{id}", put(receipt_handlers::update_receipt))
        .route("/receipts/{id}", delete(receipt_handlers::delete_receipt))
        .route("/receipts/search", get(receipt_handlers::search_receipts))
        .route("/receipts/stats", get(receipt_handlers::get_stats));

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Combine all routes
    let app = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(cors)
        .layer(Extension(pool))
        .layer(Extension(redis_pool));

    // Start server
    // Read port from environment variable or default to 3000
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()
        .unwrap_or(8000);
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("Server running on http://{}", addr);
    println!("Swagger UI available at http://{}/swagger-ui", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root_handler() -> &'static str {
    "Welcome to Receipt Processor!"
}

async fn health_check() -> &'static str {
    "Receipt Processor is running!"
}
