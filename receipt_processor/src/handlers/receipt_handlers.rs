use axum::{
    extract::{Extension, Path, Query},
    http::StatusCode,
    Json,
};
use sqlx::PgPool;
use utoipa;
use uuid::Uuid;

use crate::models::receipt::{
    CreateReceiptRequest, ListReceiptsQuery, Receipt, ReceiptStats, ReceiptsListResponse,
    SearchReceiptsQuery, StatsQuery, UpdateReceiptRequest,
};
use crate::services::receipt_service::ReceiptService;
use crate::utils::auth_extractor::AuthenticatedUser;

/// Create a new receipt
///
/// Creates a new receipt with items and stores it in the database
#[utoipa::path(
    post,
    path = "/receipts",
    request_body = CreateReceiptRequest,
    responses(
        (status = 201, description = "Receipt created successfully", body = Receipt),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn create_receipt(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Json(request): Json<CreateReceiptRequest>,
) -> Result<(StatusCode, Json<Receipt>), StatusCode> {
    match ReceiptService::create_receipt(&pool, user.id, request).await {
        Ok(receipt) => Ok((StatusCode::CREATED, Json(receipt))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Get receipt by ID
///
/// Retrieves a receipt and its items by the receipt's UUID
#[utoipa::path(
    get,
    path = "/receipts/{id}",
    params(
        ("id" = String, Path, description = "Receipt UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    ),
    responses(
        (status = 200, description = "Receipt found", body = Receipt),
        (status = 404, description = "Receipt not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn get_receipt(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Receipt>, StatusCode> {
    match ReceiptService::get_receipt(&pool, user.id, id).await {
        Ok(Some(receipt)) => Ok(Json(receipt)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Update an existing receipt
///
/// Updates a receipt and replaces all its items
#[utoipa::path(
    put,
    path = "/receipts/{id}",
    request_body = UpdateReceiptRequest,
    params(
        ("id" = String, Path, description = "Receipt UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    ),
    responses(
        (status = 200, description = "Receipt updated successfully", body = Receipt),
        (status = 404, description = "Receipt not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn update_receipt(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateReceiptRequest>,
) -> Result<Json<Receipt>, StatusCode> {
    match ReceiptService::update_receipt(&pool, user.id, id, request).await {
        Ok(Some(receipt)) => Ok(Json(receipt)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Delete a receipt
///
/// Permanently deletes a receipt and all its items
#[utoipa::path(
    delete,
    path = "/receipts/{id}",
    params(
        ("id" = String, Path, description = "Receipt UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    ),
    responses(
        (status = 204, description = "Receipt deleted successfully"),
        (status = 404, description = "Receipt not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn delete_receipt(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    match ReceiptService::delete_receipt(&pool, user.id, id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// List all receipts with pagination and filtering
///
/// Returns a paginated list of receipts with optional filtering by vendor and date range
#[utoipa::path(
    get,
    path = "/receipts",
    params(
        ("page" = Option<i64>, Query, description = "Page number (default: 1)", example = 1),
        ("limit" = Option<i64>, Query, description = "Items per page (default: 20, max: 100)", example = 20),
        ("vendor" = Option<String>, Query, description = "Filter by vendor name (case-insensitive partial match)", example = "Target"),
        ("start_date" = Option<String>, Query, description = "Filter by start date (ISO 8601)", example = "2024-01-01T00:00:00Z"),
        ("end_date" = Option<String>, Query, description = "Filter by end date (ISO 8601)", example = "2024-12-31T23:59:59Z"),
        ("sort_by" = Option<String>, Query, description = "Sort field: vendor_name, total_amount, purchase_date, created_at", example = "purchase_date"),
        ("order" = Option<String>, Query, description = "Sort order: asc or desc", example = "desc")
    ),
    responses(
        (status = 200, description = "Receipts retrieved successfully", body = ReceiptsListResponse),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn list_receipts(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Query(query): Query<ListReceiptsQuery>,
) -> Result<Json<ReceiptsListResponse>, StatusCode> {
    match ReceiptService::list_receipts(&pool, user.id, query).await {
        Ok(response) => Ok(Json(response)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Search receipts with advanced filters
///
/// Full-text search with filters for date range, amount range, and currency
#[utoipa::path(
    get,
    path = "/receipts/search",
    params(
        ("page" = Option<i64>, Query, description = "Page number", example = 1),
        ("limit" = Option<i64>, Query, description = "Items per page", example = 20),
        ("search" = Option<String>, Query, description = "Search in vendor name and item names", example = "milk"),
        ("vendor" = Option<String>, Query, description = "Filter by vendor", example = "Target"),
        ("start_date" = Option<String>, Query, description = "Start date", example = "2024-01-01T00:00:00Z"),
        ("end_date" = Option<String>, Query, description = "End date", example = "2024-12-31T23:59:59Z"),
        ("min_amount" = Option<f64>, Query, description = "Minimum amount", example = 10.0),
        ("max_amount" = Option<f64>, Query, description = "Maximum amount", example = 100.0),
        ("currency" = Option<String>, Query, description = "Filter by currency", example = "USD"),
        ("sort_by" = Option<String>, Query, description = "Sort field", example = "total_amount"),
        ("order" = Option<String>, Query, description = "Sort order", example = "desc")
    ),
    responses(
        (status = 200, description = "Search results", body = ReceiptsListResponse),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn search_receipts(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Query(query): Query<SearchReceiptsQuery>,
) -> Result<Json<ReceiptsListResponse>, StatusCode> {
    match ReceiptService::search_receipts(&pool, user.id, query).await {
        Ok(response) => Ok(Json(response)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Get receipt statistics
///
/// Returns comprehensive statistics about receipts including totals, averages, and breakdowns
#[utoipa::path(
    get,
    path = "/receipts/stats",
    params(
        ("start_date" = Option<String>, Query, description = "Start date for stats", example = "2024-01-01T00:00:00Z"),
        ("end_date" = Option<String>, Query, description = "End date for stats", example = "2024-12-31T23:59:59Z"),
        ("vendor" = Option<String>, Query, description = "Filter by vendor", example = "Target")
    ),
    responses(
        (status = 200, description = "Statistics retrieved", body = ReceiptStats),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "receipts"
)]
pub async fn get_stats(
    Extension(pool): Extension<PgPool>,
    AuthenticatedUser(user): AuthenticatedUser,
    Query(query): Query<StatsQuery>,
) -> Result<Json<ReceiptStats>, StatusCode> {
    match ReceiptService::get_stats(&pool, user.id, query).await {
        Ok(stats) => Ok(Json(stats)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
