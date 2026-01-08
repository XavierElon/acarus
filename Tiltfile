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
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/006_add_phone_number_to_receipts.sql && ' +
        'docker exec -i receipt-postgres psql -U user -d receipt_db < ../acarus-backend/migrations/007_add_payment_methods.sql',
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
        'NEXT_PUBLIC_API_URL': 'http://localhost:8000',
        'NEXTAUTH_URL': 'http://localhost:3000',
        'NEXTAUTH_SECRET': '8OLuwkVizRF6DAcmf1M7z6bGd04VuHJ5PJWhYCabnVg='
    },
    resource_deps=['backend'],
    readiness_probe=probe(
        period_secs=30,
        http_get=http_get_action(port=3000, path='/api/health')
    ),
    labels=['frontend']
)

# POS Terminal Service (Go) - Updated to write logs to file
local_resource(
    'pos-terminal',
    serve_cmd='cd ../gopher-pos && ' +
              'mkdir -p logs && ' +
              'PORT=1019 REDIS_URL=redis://:redis123@localhost:6379 BACKEND_URL=http://localhost:8000 ' +
            'STRIPE_PUBLISHABLE_KEY=pk_test_51MHeHKJrkE18sY2VnOE9RJ7HdUTnCvrlzftwvrdFllNoaoI09umomUyz8wjKgHC2y7cDyt9izeL89OlaQWMctvK400qk5aMEg8 ' +
              'go run ./cmd/pos-terminal > logs/pos-terminal.log 2>&1',
    deps=['../gopher-pos/cmd', '../gopher-pos/internal', '../gopher-pos/pkg', '../gopher-pos/go.mod', '../gopher-pos/go.sum'],
    env={
        'PORT': '1019',
        'REDIS_URL': 'redis://:redis123@localhost:6379',
        'BACKEND_URL': 'http://localhost:8000',
        'STRIPE_PUBLISHABLE_KEY': 'pk_test_51MHeHKJrkE18sY2VnOE9RJ7HdUTnCvrlzftwvrdFllNoaoI09umomUyz8wjKgHC2y7cDyt9izeL89OlaQWMctvK400qk5aMEg8'
    },
    resource_deps=['redis', 'backend'],
    readiness_probe=probe(
        period_secs=2,
        http_get=http_get_action(port=1019, path='/health')
    ),
    labels=['pos']
)

# Cloudflare Tunnel for POS Terminal
# Requires cloudflared installed locally: brew install cloudflared (macOS) or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
# The tunnel URL will be displayed in the logs (format: https://xxxxx.trycloudflare.com)
local_resource(
    'cloudflare-pos',
    serve_cmd='PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" /opt/homebrew/bin/cloudflared tunnel --url http://localhost:1019',
    resource_deps=['pos-terminal'],
    labels=['cloudflare', 'pos']
)

# Clean up existing Loki/Promtail/Grafana containers
local_resource(
    'logging-cleanup',
    cmd='docker rm -f loki promtail grafana 2>/dev/null || true',
    auto_init=True,
    labels=['logging']
)

# Loki - Log aggregation system
local_resource(
    'loki',
    serve_cmd='docker run --rm --name loki -p 3100:3100 ' +
              '-v $(pwd)/loki-config.yml:/etc/loki/local-config.yaml ' +
              'grafana/loki:latest -config.file=/etc/loki/local-config.yaml',
    resource_deps=['logging-cleanup'],
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(port=3100, path='/ready')
    ),
    labels=['logging', 'monitoring']
)

# Promtail - Log shipper (reads logs and sends to Loki)
local_resource(
    'promtail',
    serve_cmd='docker run --rm --name promtail --link loki:loki -p 9080:9080 ' +
              '-v $(pwd)/promtail-config.yml:/etc/promtail/config.yml ' +
              '-v $(pwd)/../gopher-pos/logs:/var/log:ro ' +
              'grafana/promtail:latest -config.file=/etc/promtail/config.yml',
    resource_deps=['loki', 'logging-cleanup'],
    labels=['logging']
)

# Grafana - Visualization and dashboards
local_resource(
    'grafana',
    serve_cmd='docker run --rm --name grafana -p 3001:3000 ' +
              '--add-host=host.docker.internal:host-gateway ' +
              '-e GF_AUTH_ANONYMOUS_ENABLED=true ' +
              '-e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin ' +
              '-e GF_SERVER_ROOT_URL=http://localhost:3001 ' +
              'grafana/grafana:latest',
    resource_deps=['loki'],
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(port=3001, path='/api/health')
    ),
    labels=['logging', 'monitoring', 'dashboard']
)