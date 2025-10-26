use crate::models::receipt::{
    CreateReceiptRequest, CurrencyStats, ListReceiptsQuery, MonthlyStats, Receipt, ReceiptItem,
    ReceiptStats, ReceiptsListResponse, SearchReceiptsQuery, StatsQuery, UpdateReceiptRequest,
    VendorStats,
};
use chrono::Utc;
use sqlx::{PgPool, Row};
use uuid::Uuid;

pub struct ReceiptService;

impl ReceiptService {
    // Create a new receipt in the database
    pub async fn create_receipt(
        pool: &PgPool,
        user_id: Uuid,
        request: CreateReceiptRequest,
    ) -> Result<Receipt, Box<dyn std::error::Error>> {
        // Start a database transaction (all-or-nothing operation)
        let mut tx = pool.begin().await?;

        // Generate IDs and timestamps
        let id = Uuid::new_v4();
        let now = Utc::now();

        // Parse the purchase date from string
        let purchase_date =
            chrono::DateTime::parse_from_rfc3339(&request.purchase_date)?.with_timezone(&Utc);

        // Insert the receipt into the database
        sqlx::query!(
            r#"
            INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, receipt_image_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            "#,
            id,
            user_id,
            request.vendor_name,
            request.total_amount,
            request.currency,
            purchase_date,
            request.receipt_image_url,
            now,
            now
        ).execute(&mut *tx).await?;

        // Insert all receipt items
        let mut items = Vec::new();
        for item_req in request.items {
            let item_id = Uuid::new_v4();
            let total_price = item_req.quantity as f64 * item_req.unit_price;

            sqlx::query!(
                r#"
                INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
                item_id,
                id,
                item_req.name,
                item_req.quantity,
                item_req.unit_price,
                total_price
            )
            .execute(&mut *tx)
            .await?;

            items.push(ReceiptItem {
                id: item_id,
                name: item_req.name,
                quantity: item_req.quantity,
                unit_price: item_req.unit_price,
                total_price,
            });
        }

        // Commit the transaction
        tx.commit().await?;

        // Return the created receipt
        Ok(Receipt {
            id,
            vendor_name: request.vendor_name,
            total_amount: request.total_amount,
            currency: request.currency,
            purchase_date,
            items,
            receipt_image_url: request.receipt_image_url,
            created_at: now,
            updated_at: now,
        })
    }

    // Get a receipt by ID
    pub async fn get_receipt(
        pool: &PgPool,
        user_id: Uuid,
        id: Uuid,
    ) -> Result<Option<Receipt>, Box<dyn std::error::Error>> {
        // Query the receipt (with user_id check for security)
        let receipt_row = sqlx::query!(
            r#"
            SELECT id, vendor_name, total_amount, currency, purchase_date, receipt_image_url, created_at, updated_at
            FROM receipts
            WHERE id = $1 AND user_id = $2
            "#,
            id,
            user_id
        ).fetch_optional(pool).await?;

        // If no receipt found, return None
        let receipt_row = match receipt_row {
            Some(row) => row,
            None => return Ok(None),
        };

        // Query all items for this receipt
        let item_rows = sqlx::query!(
            r#"
            SELECT id, name, quantity, unit_price, total_price
            FROM receipt_items
            WHERE receipt_id = $1
            "#,
            id
        )
        .fetch_all(pool)
        .await?;

        // Convert rows to ReceiptItem structs
        let items: Vec<ReceiptItem> = item_rows
            .into_iter()
            .map(|row| ReceiptItem {
                id: row.id,
                name: row.name,
                quantity: row.quantity,
                unit_price: row.unit_price.to_string().parse().unwrap(),
                total_price: row.total_price.to_string().parse().unwrap(),
            })
            .collect();

        // Build and return the receipt
        Ok(Some(Receipt {
            id: receipt_row.id,
            vendor_name: receipt_row.vendor_name,
            total_amount: receipt_row.total_amount.to_string().parse().unwrap(),
            currency: receipt_row.currency,
            purchase_date: receipt_row.purchase_date,
            items,
            receipt_image_url: receipt_row.receipt_image_url,
            created_at: receipt_row.created_at,
            updated_at: receipt_row.updated_at,
        }))
    }

    pub async fn update_receipt(
        pool: &PgPool,
        user_id: Uuid,
        id: Uuid,
        request: UpdateReceiptRequest,
    ) -> Result<Option<Receipt>, Box<dyn std::error::Error>> {
        // Check if receipt exists and belongs to user
        let exists = sqlx::query!(
            "SELECT id FROM receipts WHERE id = $1 AND user_id = $2",
            id,
            user_id
        )
        .fetch_optional(pool)
        .await?;

        if exists.is_none() {
            return Ok(None);
        }

        // Start a database transaction
        let mut tx = pool.begin().await?;

        let now = Utc::now();
        let purchase_date =
            chrono::DateTime::parse_from_rfc3339(&request.purchase_date)?.with_timezone(&Utc);

        // Update the receipt
        sqlx::query!(
            r#"
            UPDATE receipts
            SET vendor_name = $1, total_amount = $2, currency = $3, purchase_date = $4, receipt_image_url = $5, updated_at = $6
            WHERE id = $7
            "#,
            request.vendor_name,
            request.total_amount,
            request.currency,
            purchase_date,
            request.receipt_image_url,
            now,
            id
        ).execute(&mut *tx).await?;

        // Delete old items
        sqlx::query!("DELETE FROM receipt_items WHERE receipt_id = $1", id)
            .execute(&mut *tx)
            .await?;

        // Insert new items
        let mut items = Vec::new();

        for item_req in request.items {
            let item_id = Uuid::new_v4();
            let total_price = item_req.quantity as f64 * item_req.unit_price;

            sqlx::query!(
                r#"
                INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
                item_id,
                id,
                item_req.name,
                item_req.quantity,
                item_req.unit_price,
                total_price
            )
            .execute(&mut *tx)
            .await?;

            items.push(ReceiptItem {
                id: item_id,
                name: item_req.name,
                quantity: item_req.quantity,
                unit_price: item_req.unit_price,
                total_price,
            });
        }

        tx.commit().await?;

        // Get created_at from original receipt
        let created_at = sqlx::query!("SELECT created_at FROM receipts WHERE id = $1", id)
            .fetch_one(pool)
            .await?
            .created_at;

        Ok(Some(Receipt {
            id,
            vendor_name: request.vendor_name,
            total_amount: request.total_amount,
            currency: request.currency,
            purchase_date,
            items,
            receipt_image_url: request.receipt_image_url,
            created_at,
            updated_at: now,
        }))
    }

    // Delete a receipt
    pub async fn delete_receipt(
        pool: &PgPool,
        user_id: Uuid,
        id: Uuid,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let result = sqlx::query!(
            "DELETE FROM receipts WHERE id = $1 AND user_id = $2",
            id,
            user_id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    // List Receipts with Pagination, Filtering, and Sorting
    pub async fn list_receipts(
        pool: &PgPool,
        user_id: Uuid,
        query: ListReceiptsQuery,
    ) -> Result<ReceiptsListResponse, Box<dyn std::error::Error>> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        // Build WHERE clause for filtering
        let mut conditions = Vec::new();
        let mut param_count = 1;

        // Always filter by user_id
        conditions.push(format!("user_id = ${}", param_count));
        param_count += 1;

        let vendor_filter = query.vendor.as_ref();
        if vendor_filter.is_some() {
            conditions.push(format!("vendor_name ILIKE ${}", param_count));
            param_count += 1;
        }

        let start_date_parsed = query
            .start_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        let end_date_parsed = query
            .end_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        if start_date_parsed.is_some() {
            conditions.push(format!("purchase_date >= ${}", param_count));
            param_count += 1;
        }

        if end_date_parsed.is_some() {
            conditions.push(format!("purchase_date <= ${}", param_count));
            param_count += 1;
        }

        let where_clause = format!("WHERE {}", conditions.join(" AND "));

        let sort_by = query.sort_by.as_deref().unwrap_or("created_at");
        let order = query.order.as_deref().unwrap_or("desc");
        let order_clause = match sort_by {
            "vendor_name" | "total_amount" | "purchase_date" | "created_at" => {
                format!("ORDER BY {} {}", sort_by, order.to_uppercase())
            }
            _ => "ORDER BY created_at DESC".to_string(),
        };

        // Count total mathcing receipts
        let count_query = format!("SELECT COUNT(*) as count FROM receipts {}", where_clause);
        let mut count_query_builder = sqlx::query_scalar::<_, i64>(&count_query);

        // Bind user_id first
        count_query_builder = count_query_builder.bind(user_id);

        if let Some(vendor) = vendor_filter {
            count_query_builder = count_query_builder.bind(format!("%{}%", vendor));
        }

        if let Some(start) = start_date_parsed {
            count_query_builder = count_query_builder.bind(start);
        }

        if let Some(end) = end_date_parsed {
            count_query_builder = count_query_builder.bind(end);
        }

        let total: i64 = count_query_builder.fetch_one(pool).await?;

        // Fetch receipts
        let receipts_query = format!(
            "SELECT id, vendor_name, total_amount, currency, purchase_date, receipt_image_url, created_at, updated_at 
             FROM receipts {} {} LIMIT ${} OFFSET ${}",
            where_clause, order_clause, param_count, param_count + 1
        );

        let mut receipts_query_builder = sqlx::query(&receipts_query);

        // Bind user_id first
        receipts_query_builder = receipts_query_builder.bind(user_id);

        if let Some(vendor) = vendor_filter {
            receipts_query_builder = receipts_query_builder.bind(format!("%{}%", vendor));
        }

        if let Some(start) = start_date_parsed {
            receipts_query_builder = receipts_query_builder.bind(start);
        }

        if let Some(end) = end_date_parsed {
            receipts_query_builder = receipts_query_builder.bind(end);
        }

        receipts_query_builder = receipts_query_builder.bind(limit).bind(offset);

        let receipt_rows = receipts_query_builder.fetch_all(pool).await?;

        // Fetch items for each receipt
        let mut receipts = Vec::new();
        for row in receipt_rows {
            let receipt_id: Uuid = row.try_get("id")?;

            let item_rows = sqlx::query!(
                "SELECT id, name, quantity, unit_price, total_price FROM receipt_items WHERE receipt_id = $1",
                receipt_id
            )
            .fetch_all(pool)
            .await?;

            let items: Vec<ReceiptItem> = item_rows
                .into_iter()
                .map(|item| ReceiptItem {
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                })
                .collect();

            receipts.push(Receipt {
                id: receipt_id,
                vendor_name: row.try_get("vendor_name")?,
                total_amount: row.try_get("total_amount")?,
                currency: row.try_get("currency")?,
                purchase_date: row.try_get("purchase_date")?,
                items,
                receipt_image_url: row.try_get("receipt_image_url")?,
                created_at: row.try_get("created_at")?,
                updated_at: row.try_get("updated_at")?,
            });
        }

        let total_pages = (total as f64 / limit as f64).ceil() as i64;

        Ok(ReceiptsListResponse {
            receipts,
            total,
            page,
            limit,
            total_pages,
        })
    }

    // Advanced search receipts
    pub async fn search_receipts(
        pool: &PgPool,
        user_id: Uuid,
        query: SearchReceiptsQuery,
    ) -> Result<ReceiptsListResponse, Box<dyn std::error::Error>> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        // Build dynamic WHERE conditions
        let mut conditions = Vec::new();
        let mut bind_count = 1;

        // Always filter by user_id
        conditions.push(format!("user_id = ${}", bind_count));
        bind_count += 1;

        // Full-text search (vendor name or items)
        if query.search.is_some() {
            conditions.push(format!(
                "(vendor_name ILIKE ${} OR id IN (SELECT DISTINCT receipt_id FROM receipt_items WHERE name ILIKE ${}))",
                bind_count, bind_count
            ));
            bind_count += 1;
        }

        // Vendor filter
        if query.vendor.is_some() {
            conditions.push(format!("vendor_name ILIKE ${}", bind_count));
            bind_count += 1;
        }

        // Date range
        let start_date = query
            .start_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        let end_date = query
            .end_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        if start_date.is_some() {
            conditions.push(format!("purchase_date >= ${}", bind_count));
            bind_count += 1;
        }

        if end_date.is_some() {
            conditions.push(format!("purchase_date <= ${}", bind_count));
            bind_count += 1;
        }

        // Amount range
        if query.min_amount.is_some() {
            conditions.push(format!("total_amount >= ${}", bind_count));
            bind_count += 1;
        }

        if query.max_amount.is_some() {
            conditions.push(format!("total_amount <= ${}", bind_count));
            bind_count += 1;
        }

        // Currency filter
        if query.currency.is_some() {
            conditions.push(format!("currency = ${}", bind_count));
            bind_count += 1;
        }

        let where_clause = format!("WHERE {}", conditions.join(" AND "));

        // Order by
        let sort_by = query.sort_by.as_deref().unwrap_or("created_at");
        let order = query.order.as_deref().unwrap_or("desc");
        let order_clause = match sort_by {
            "vendor_name" | "total_amount" | "purchase_date" | "created_at" => {
                format!("ORDER BY {} {}", sort_by, order.to_uppercase())
            }
            _ => "ORDER BY created_at DESC".to_string(),
        };

        // Count query
        let count_sql = format!("SELECT COUNT(*) FROM receipts {}", where_clause);
        let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);

        // Bind user_id first
        count_query = count_query.bind(user_id);

        // Bind parameters for count
        if let Some(ref search) = query.search {
            count_query = count_query.bind(format!("%{}%", search));
        }
        if let Some(ref vendor) = query.vendor {
            count_query = count_query.bind(format!("%{}%", vendor));
        }
        if let Some(start) = start_date {
            count_query = count_query.bind(start);
        }
        if let Some(end) = end_date {
            count_query = count_query.bind(end);
        }
        if let Some(min) = query.min_amount {
            count_query = count_query.bind(min);
        }
        if let Some(max) = query.max_amount {
            count_query = count_query.bind(max);
        }
        if let Some(ref currency) = query.currency {
            count_query = count_query.bind(currency);
        }

        let total = count_query.fetch_one(pool).await?;

        // Fetch receipts
        let fetch_sql = format!(
            "SELECT id, vendor_name, total_amount, currency, purchase_date, receipt_image_url, created_at, updated_at 
             FROM receipts {} {} LIMIT ${} OFFSET ${}",
            where_clause, order_clause, bind_count, bind_count + 1
        );

        let mut fetch_query = sqlx::query(&fetch_sql);

        // Bind user_id first
        fetch_query = fetch_query.bind(user_id);

        // Bind parameters for fetch
        if let Some(ref search) = query.search {
            fetch_query = fetch_query.bind(format!("%{}%", search));
        }
        if let Some(ref vendor) = query.vendor {
            fetch_query = fetch_query.bind(format!("%{}%", vendor));
        }
        if let Some(start) = start_date {
            fetch_query = fetch_query.bind(start);
        }
        if let Some(end) = end_date {
            fetch_query = fetch_query.bind(end);
        }
        if let Some(min) = query.min_amount {
            fetch_query = fetch_query.bind(min);
        }
        if let Some(max) = query.max_amount {
            fetch_query = fetch_query.bind(max);
        }
        if let Some(ref currency) = query.currency {
            fetch_query = fetch_query.bind(currency);
        }

        let receipt_rows = fetch_query.bind(limit).bind(offset).fetch_all(pool).await?;

        // Fetch items for each receipt
        let mut receipts = Vec::new();
        for row in receipt_rows {
            let receipt_id: Uuid = row.try_get("id")?;

            let item_rows = sqlx::query!(
                "SELECT id, name, quantity, unit_price, total_price FROM receipt_items WHERE receipt_id = $1",
                receipt_id
            )
            .fetch_all(pool)
            .await?;

            let items: Vec<ReceiptItem> = item_rows
                .into_iter()
                .map(|item| ReceiptItem {
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                })
                .collect();

            receipts.push(Receipt {
                id: receipt_id,
                vendor_name: row.try_get("vendor_name")?,
                total_amount: row.try_get("total_amount")?,
                currency: row.try_get("currency")?,
                purchase_date: row.try_get("purchase_date")?,
                items,
                receipt_image_url: row.try_get("receipt_image_url")?,
                created_at: row.try_get("created_at")?,
                updated_at: row.try_get("updated_at")?,
            });
        }

        let total_pages = (total as f64 / limit as f64).ceil() as i64;

        Ok(ReceiptsListResponse {
            receipts,
            total,
            page,
            limit,
            total_pages,
        })
    }

    // Get receipt statistics
    pub async fn get_stats(
        pool: &PgPool,
        user_id: Uuid,
        query: StatsQuery,
    ) -> Result<ReceiptStats, Box<dyn std::error::Error>> {
        // Build WHERE clause for date filtering
        let mut conditions = Vec::new();
        let mut bind_count = 1;

        // Always filter by user_id
        conditions.push(format!("user_id = ${}", bind_count));
        bind_count += 1;

        let start_date = query
            .start_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        let end_date = query
            .end_date
            .as_ref()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
            .map(|d| d.with_timezone(&Utc));

        if start_date.is_some() {
            conditions.push(format!("purchase_date >= ${}", bind_count));
            bind_count += 1;
        }

        if end_date.is_some() {
            conditions.push(format!("purchase_date <= ${}", bind_count));
            bind_count += 1;
        }

        if query.vendor.is_some() {
            conditions.push(format!("vendor_name ILIKE ${}", bind_count));
            bind_count += 1;
        }

        let where_clause = format!("WHERE {}", conditions.join(" AND "));

        // Overall statistics
        let overall_sql = format!(
            "SELECT 
                    COUNT(*) as total_receipts,
                    COALESCE(SUM(total_amount), 0) as total_spent,
                    COALESCE(AVG(total_amount), 0) as average_amount,
                    COALESCE(MAX(total_amount), 0) as max_amount,
                    COALESCE(MIN(total_amount), 0) as min_amount
                 FROM receipts {}",
            where_clause
        );

        let mut overall_query = sqlx::query(&overall_sql);

        // Bind user_id first
        overall_query = overall_query.bind(user_id);

        if let Some(start) = start_date {
            overall_query = overall_query.bind(start);
        }
        if let Some(end) = end_date {
            overall_query = overall_query.bind(end);
        }
        if let Some(ref vendor) = query.vendor {
            overall_query = overall_query.bind(format!("%{}%", vendor));
        }

        let overall_row = overall_query.fetch_one(pool).await?;

        // By vendor
        let vendor_sql = format!(
            "SELECT 
                    vendor_name,
                    COUNT(*) as count,
                    SUM(total_amount) as total_amount
                 FROM receipts {}
                 GROUP BY vendor_name
                 ORDER BY total_amount DESC
                 LIMIT 10",
            where_clause
        );

        let mut vendor_query = sqlx::query(&vendor_sql);

        // Bind user_id first
        vendor_query = vendor_query.bind(user_id);

        if let Some(start) = start_date {
            vendor_query = vendor_query.bind(start);
        }
        if let Some(end) = end_date {
            vendor_query = vendor_query.bind(end);
        }
        if let Some(ref vendor) = query.vendor {
            vendor_query = vendor_query.bind(format!("%{}%", vendor));
        }

        let vendor_rows = vendor_query.fetch_all(pool).await?;

        let by_vendor: Vec<VendorStats> = vendor_rows
            .into_iter()
            .map(|row| VendorStats {
                vendor_name: row.try_get("vendor_name").unwrap_or_default(),
                count: row.try_get("count").unwrap_or(0),
                total_amount: row.try_get("total_amount").unwrap_or(0.0),
            })
            .collect();

        // By currency
        let currency_sql = format!(
            "SELECT 
                    currency,
                    COUNT(*) as count,
                    SUM(total_amount) as total_amount
                 FROM receipts {}
                 GROUP BY currency
                 ORDER BY count DESC",
            where_clause
        );

        let mut currency_query = sqlx::query(&currency_sql);

        // Bind user_id first
        currency_query = currency_query.bind(user_id);

        if let Some(start) = start_date {
            currency_query = currency_query.bind(start);
        }
        if let Some(end) = end_date {
            currency_query = currency_query.bind(end);
        }
        if let Some(ref vendor) = query.vendor {
            currency_query = currency_query.bind(format!("%{}%", vendor));
        }

        let currency_rows = currency_query.fetch_all(pool).await?;

        let by_currency: Vec<CurrencyStats> = currency_rows
            .into_iter()
            .map(|row| CurrencyStats {
                currency: row.try_get("currency").unwrap_or_default(),
                count: row.try_get("count").unwrap_or(0),
                total_amount: row.try_get("total_amount").unwrap_or(0.0),
            })
            .collect();

        // By month
        let monthly_sql = format!(
            "SELECT 
                    TO_CHAR(purchase_date, 'YYYY-MM') as month,
                    COUNT(*) as count,
                    SUM(total_amount) as total_amount
                 FROM receipts {}
                 GROUP BY TO_CHAR(purchase_date, 'YYYY-MM')
                 ORDER BY month DESC
                 LIMIT 12",
            where_clause
        );

        let mut monthly_query = sqlx::query(&monthly_sql);

        // Bind user_id first
        monthly_query = monthly_query.bind(user_id);

        if let Some(start) = start_date {
            monthly_query = monthly_query.bind(start);
        }
        if let Some(end) = end_date {
            monthly_query = monthly_query.bind(end);
        }
        if let Some(ref vendor) = query.vendor {
            monthly_query = monthly_query.bind(format!("%{}%", vendor));
        }

        let monthly_rows = monthly_query.fetch_all(pool).await?;

        let by_month: Vec<MonthlyStats> = monthly_rows
            .into_iter()
            .map(|row| MonthlyStats {
                month: row.try_get("month").unwrap_or_default(),
                count: row.try_get("count").unwrap_or(0),
                total_amount: row.try_get("total_amount").unwrap_or(0.0),
            })
            .collect();

        Ok(ReceiptStats {
            total_receipts: overall_row.try_get("total_receipts")?,
            total_spent: overall_row.try_get("total_spent")?,
            average_amount: overall_row.try_get("average_amount")?,
            max_amount: overall_row.try_get("max_amount")?,
            min_amount: overall_row.try_get("min_amount")?,
            by_vendor,
            by_currency,
            by_month,
        })
    }
}
