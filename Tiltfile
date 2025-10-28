# Tiltfile for Receipt Processor with Postgres

# Clean up any existing postgres container first
local_resource(
    'postgres-cleanup',
    cmd='docker rm -f receipt-postgres 2>/dev/null || true',
    auto_init=True,
    labels=['database']
)

# Clean up any existing redis container first
local_resource(
    'redis-cleanup',
    cmd='docker rm -f receipt-redis 2>/dev/null || true',
    auto_init=True,
    labels=['redis']
)

# Clean up Cargo build cache to prevent corrupted downloads
local_resource(
    'cargo-cleanup',
    cmd='cd receipt_processor && rm -rf target/debug/build/utoipa-swagger-ui-* && cargo clean',
    auto_init=True,
    labels=['build']
)

# Start Postgres in a Docker container
local_resource(
    'postgres',
    serve_cmd='docker run --rm --name receipt-postgres -p 5439:5432 ' +
              '-e POSTGRES_USER=user ' +
              '-e POSTGRES_PASSWORD=password ' +
              '-e POSTGRES_DB=receipt_db ' +
              'postgres:15-alpine',
    resource_deps=['postgres-cleanup'],
    readiness_probe=probe(
        period_secs=2,
        exec=exec_action(['sh', '-c', 'docker exec receipt-postgres pg_isready -U user -d receipt_db || exit 1'])
    ),
    labels=['database']
)

# Start Redis in a Docker container with authentication
local_resource(
    'redis',
    serve_cmd='docker run --rm --name receipt-redis -p 6379:6379 ' +
              '-e REDIS_PASSWORD=redis123 ' +
              'redis:7-alpine redis-server --requirepass redis123',
    resource_deps=['redis-cleanup'],
    readiness_probe=probe(
        period_secs=2,
        exec=exec_action(['sh', '-c', 'docker exec receipt-redis redis-cli -a redis123 ping | grep -q PONG || exit 1'])
    ),
    labels=['redis']
)

# Build and run the Rust application
local_resource(
    'receipt-processor',
    serve_cmd='cd receipt_processor && PORT=8000 cargo run',
    deps=['receipt_processor/src', 'receipt_processor/Cargo.toml', 'receipt_processor/Cargo.lock'],
    env={
        'DATABASE_URL': 'postgres://user:password@localhost:5439/receipt_db',
        'REDIS_URL': 'redis://:redis123@localhost:6379',
        'PORT': '8000'
    },
    resource_deps=['postgres', 'redis', 'migrations', 'cargo-cleanup'],
    readiness_probe=probe(
        period_secs=2,
        http_get=http_get_action(port=8000, path='/health')
    ),
    labels=['backend']
)

# Run migrations automatically with proper waiting and verification
local_resource(
    'migrations',
    cmd='sleep 5 && PGPASSWORD=password psql -h localhost -p 5439 -U user -d receipt_db -f receipt_processor/migrations/001_create_receipts_table.sql && PGPASSWORD=password psql -h localhost -p 5439 -U user -d receipt_db -f receipt_processor/migrations/002_add_users_and_auth.sql',
    resource_deps=['postgres'],
    readiness_probe=probe(
        period_secs=5,
        exec=exec_action(['sh', '-c', 'PGPASSWORD=password psql -h localhost -p 5439 -U user -d receipt_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\' AND table_name IN (\'receipts\', \'receipt_items\', \'users\', \'api_keys\', \'sessions\')" | grep -q "5" 2>/dev/null'])
    ),
    labels=['database']
)

# Frontend development server with Bun
local_resource(
    'frontend',
    serve_cmd='cd frontend && bun run dev',
    deps=['frontend/src', 'frontend/package.json', 'frontend/bun.lockb'],
    env={
        'NEXT_PUBLIC_API_URL': 'http://localhost:8000'
    },
    resource_deps=['receipt-processor'],
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(port=3000, path='/')
    ),
    labels=['frontend']
)