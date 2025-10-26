use sqlx::PgPool;
use std::env;

pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    // Get database URL from environment variable
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://user:password@localhost/receipt_db".to_string());

    // Create a pool of connections
    let pool = PgPool::connect(&database_url).await?;

    Ok(pool)
}
