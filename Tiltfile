# Tiltfile for Receipt Processor
# Updated to work with the multi-repo structure
# Roots are siblings: acarus-infra, acarus-backend, acarus-frontend, ocr, gopher-pos

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

# OCR Service (Python FastAPI)
# Create venv if it doesn't exist, then run
local_resource(
    'ocr',
    serve_cmd='cd ../ocr && ' +
              '(test -d venv || python3 -m venv venv) && ' +
              'venv/bin/pip install -q -r requirements.txt && ' +
              'venv/bin/python main.py',
    deps=['../ocr/main.py', '../ocr/models.py', '../ocr/ocr_processor.py', '../ocr/requirements.txt'],
    env={
        'PYTHONUNBUFFERED': '1'
    },
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(port=8081, path='/health')
    ),
    labels=['ocr']
)

# Build and run the Rust backend application
local_resource(
    'backend',
    serve_cmd='cd ../acarus-backend && PORT=8000 OCR_SERVICE_URL=http://localhost:8081 DATABASE_URL=postgres://user:password@localhost:5439/receipt_db REDIS_URL=redis://:redis123@localhost:6379 cargo run',
    deps=['../acarus-backend/src', '../acarus-backend/Cargo.toml', '../acarus-backend/Cargo.lock'],
    env={
        'DATABASE_URL': 'postgres://user:password@localhost:5439/receipt_db',
        'REDIS_URL': 'redis://:redis123@localhost:6379',
        'PORT': '8000',
        'OCR_SERVICE_URL': 'http://localhost:8081'
    },
    resource_deps=['postgres', 'redis', 'migrations', 'ocr'],
    readiness_probe=probe(
        period_secs=2,
        http_get=http_get_action(port=8000, path='/health')
    ),
    labels=['backend']
)

# Run migrations automatically with proper waiting and verification
# Using docker exec to run psql inside the postgres container
local_resource(
    'migrations',
    cmd='sleep 5 && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/001_create_receipts_table.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/002_add_users_and_auth.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/003_seed_test_data.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/004_add_receipts_to_15_per_user.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/005_add_phone_number_to_users.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/006_add_phone_number_to_receipts.sql',
    resource_deps=['postgres'],
    readiness_probe=probe(
        period_secs=5,
        exec=exec_action(['sh', '-c', 'docker exec receipt-postgres psql -U user -d receipt_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\' AND table_name IN (\'receipts\', \'receipt_items\', \'users\', \'api_keys\', \'sessions\')" | grep -q "5" 2>/dev/null'])
    ),
    labels=['database']
)

# Frontend development server with Bun
local_resource(
    'frontend',
    serve_cmd='cd ../acarus-frontend && bun run dev',
    deps=['../acarus-frontend/src', '../acarus-frontend/package.json', '../acarus-frontend/bun.lockb'],
    env={
        'NEXT_PUBLIC_API_URL': 'http://localhost:8000'
    },
    resource_deps=['backend'],
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(port=3000, path='/')
    ),
    labels=['frontend']
)

# POS Terminal Service (Go)
local_resource(
    'pos-terminal',
    serve_cmd='cd ../gopher-pos && PORT=1019 REDIS_URL=redis://:redis123@localhost:6379 go run ./cmd/pos-terminal',
    deps=['../gopher-pos/cmd', '../gopher-pos/internal', '../gopher-pos/pkg', '../gopher-pos/go.mod', '../gopher-pos/go.sum'],
    env={
        'PORT': '1019',
        'REDIS_URL': 'redis://:redis123@localhost:6379'
    },
    resource_deps=['redis'],
    readiness_probe=probe(
        period_secs=2,
        http_get=http_get_action(port=1019, path='/health')
    ),
    labels=['pos']
)

# Ngrok tunnel for POS Terminal
# Requires ngrok installed locally.
local_resource(
    'ngrok-pos',
    serve_cmd='ngrok http 1019 --log=stdout',
    resource_deps=['pos-terminal'],
    labels=['ngrok', 'pos']
)