use redis::aio::ConnectionManager;
use redis::Client;
use std::env;

pub type RedisPool = ConnectionManager;

pub async fn create_redis_pool() -> Result<RedisPool, redis::RedisError> {
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string());

    let client = Client::open(redis_url)?;
    let manager = ConnectionManager::new(client).await?;

    Ok(manager)
}
