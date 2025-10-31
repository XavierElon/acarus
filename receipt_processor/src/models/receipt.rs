use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct Receipt {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "Target")]
    pub vendor_name: String,
    #[schema(example = 45.67)]
    pub total_amount: f64,
    #[schema(example = "USD")]
    pub currency: String,
    #[schema(example = "2024-01-15T10:30:00Z")]
    pub purchase_date: DateTime<Utc>,
    pub items: Vec<ReceiptItem>,
    #[schema(example = "https://example.com/receipt.jpg")]
    pub receipt_image_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct ReceiptItem {
    pub id: Uuid,
    #[schema(example = "Milk")]
    pub name: String,
    #[schema(example = 2)]
    pub quantity: i32,
    #[schema(example = 4.99)]
    pub unit_price: f64,
    #[schema(example = 9.98)]
    pub total_price: f64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateReceiptRequest {
    #[schema(example = "Target")]
    pub vendor_name: String,
    #[schema(example = 45.67)]
    pub total_amount: f64,
    #[schema(example = "USD")]
    pub currency: String,
    #[schema(example = "2024-01-15T10:30:00Z")]
    pub purchase_date: String,
    pub items: Vec<CreateReceiptItemRequest>,
    #[schema(example = "https://example.com/receipt.jpg")]
    pub receipt_image_url: Option<String>,
    #[schema(example = "+15551234567")]
    pub phone_number: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateReceiptItemRequest {
    #[schema(example = "Milk")]
    pub name: String,
    #[schema(example = 2)]
    pub quantity: i32,
    #[schema(example = 4.99)]
    pub unit_price: f64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateReceiptItemRequest {
    #[schema(example = "Milk")]
    pub name: String,
    #[schema(example = 2)]
    pub quantity: i32,
    #[schema(example = 4.99)]
    pub unit_price: f64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateReceiptRequest {
    #[schema(example = "Target")]
    pub vendor_name: String,
    #[schema(example = 45.67)]
    pub total_amount: f64,
    #[schema(example = "USD")]
    pub currency: String,
    #[schema(example = "2024-01-15T10:30:00Z")]
    pub purchase_date: String,
    #[schema(example = "https://example.com/receipt.jpg")]
    pub receipt_image_url: Option<String>,
    pub items: Vec<UpdateReceiptItemRequest>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct ListReceiptsQuery {
    #[schema(example = 1)]
    pub page: Option<i64>,
    #[schema(example = 20)]
    pub limit: Option<i64>,
    #[schema(example = "Target")]
    pub vendor: Option<String>,
    #[schema(example = "2024-01-01T00:00:00Z")]
    pub start_date: Option<String>,
    #[schema(example = "2024-12-31T23:59:59Z")]
    pub end_date: Option<String>,
    #[schema(example = "purchase_date")]
    pub sort_by: Option<String>,
    #[schema(example = "desc")]
    pub order: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ReceiptsListResponse {
    pub receipts: Vec<Receipt>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub total_pages: i64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct SearchReceiptsQuery {
    #[schema(example = 1)]
    pub page: Option<i64>,
    #[schema(example = 20)]
    pub limit: Option<i64>,

    // Full-text search
    #[schema(example = "Target groceries")]
    pub search: Option<String>,

    // Vendor filter
    #[schema(example = "Target")]
    pub vendor: Option<String>,

    // Date range
    #[schema(example = "2024-01-01T00:00:00Z")]
    pub start_date: Option<String>,
    #[schema(example = "2024-12-31T23:59:59Z")]
    pub end_date: Option<String>,

    // Amount range
    #[schema(example = 10.0)]
    pub min_amount: Option<f64>,
    #[schema(example = 100.0)]
    pub max_amount: Option<f64>,

    // Currency filter
    #[schema(example = "USD")]
    pub currency: Option<String>,

    // Sorting
    #[schema(example = "purchase_date")]
    pub sort_by: Option<String>,
    #[schema(example = "desc")]
    pub order: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ReceiptStats {
    #[schema(example = 150)]
    pub total_receipts: i64,

    #[schema(example = 4567.89)]
    pub total_spent: f64,

    #[schema(example = 30.45)]
    pub average_amount: f64,

    #[schema(example = 150.50)]
    pub max_amount: f64,

    #[schema(example = 5.99)]
    pub min_amount: f64,

    pub by_vendor: Vec<VendorStats>,
    pub by_currency: Vec<CurrencyStats>,
    pub by_month: Vec<MonthlyStats>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct VendorStats {
    #[schema(example = "Target")]
    pub vendor_name: String,
    #[schema(example = 25)]
    pub count: i64,
    #[schema(example = 1234.56)]
    pub total_amount: f64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct CurrencyStats {
    #[schema(example = "USD")]
    pub currency: String,
    #[schema(example = 100)]
    pub count: i64,
    #[schema(example = 3456.78)]
    pub total_amount: f64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct MonthlyStats {
    #[schema(example = "2024-01")]
    pub month: String,
    #[schema(example = 15)]
    pub count: i64,
    #[schema(example = 567.89)]
    pub total_amount: f64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct StatsQuery {
    #[schema(example = "2024-01-01T00:00:00Z")]
    pub start_date: Option<String>,
    #[schema(example = "2024-12-31T23:59:59Z")]
    pub end_date: Option<String>,
    #[schema(example = "Target")]
    pub vendor: Option<String>,
}
