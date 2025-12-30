# Workspace Setup Guide

This workspace contains multiple services, each in its own git repository, allowing you to develop all services together while maintaining separate version control.

## Workspace Structure

```
acarus/                          # Workspace root (NOT a git repo)
├── frontend/                    # Frontend service (separate git repo)
│   ├── .git/                   # Frontend's git repository
│   ├── .github/workflows/      # Frontend CI/CD
│   └── ...
├── receipt_processor/           # Backend service (separate git repo)
│   ├── .git/                   # Backend's git repository
│   ├── .github/workflows/      # Backend CI/CD
│   └── ...
└── infra/                       # Infrastructure repo (for shared files) ⭐
    ├── .git/                   # Infrastructure's git repository
    ├── docker-compose.yml
    ├── docker-compose.local.yml
    ├── docker-compose.prod.yml.example
    ├── Tiltfile
    ├── docs/
    └── .env.example
```

> **Note**: For details on handling shared files like docker-compose, Tiltfile, and docs, see [SHARED_FILES_STRATEGY.md](./SHARED_FILES_STRATEGY.md)

## Initial Setup

### 1. Clone or Initialize Service Repositories

Each service should be cloned into this workspace:

```bash
cd /Users/xavierelon/coding/amazon/acarus

# Clone frontend (if already exists remotely)
git clone <frontend-repo-url> frontend

# Clone backend (if already exists remotely)
git clone <backend-repo-url> receipt_processor

# OR initialize new repos (see REPO_SPLIT_GUIDE.md)
```

### 2. Install Dependencies

#### Frontend:

```bash
cd frontend
npm install  # or bun install
```

#### Backend:

```bash
cd receipt_processor
# Rust dependencies are managed by Cargo, no manual install needed
```

### 3. Set Up Environment Variables

#### Frontend:

```bash
cd frontend
cp env.template .env.local
# Edit .env.local with your settings
```

#### Backend:

```bash
cd receipt_processor
# Create .env file if needed
```

## Development Workflow

### Running Services Locally

#### Option 1: Using Docker Compose (Recommended for full stack)

```bash
# From workspace root
docker-compose -f docker-compose.local.yml up
```

This will:

- Start PostgreSQL and Redis
- Build and start the backend service
- Build and start the frontend service

#### Option 2: Run Services Individually

**Backend:**

```bash
cd receipt_processor

# Start database first (in another terminal)
docker-compose -f ../docker-compose.dev.yml up postgres redis

# Run backend
cargo run
```

**Frontend:**

```bash
cd frontend

# Ensure backend is running at http://localhost:8000
npm run dev  # or bun run dev
```

#### Option 3: Using Tilt (for hot-reload development)

```bash
# From workspace root
tilt up
```

### Working with Git

Since each service is a separate git repository:

```bash
# Work on frontend
cd frontend
git status
git add .
git commit -m "Frontend changes"
git push

# Work on backend
cd ../receipt_processor
git status
git add .
git commit -m "Backend changes"
git push
```

### Adding New Services

When adding a new service:

1. Create directory: `mkdir new-service`
2. Initialize git: `cd new-service && git init`
3. Set up service code
4. Add to `docker-compose.local.yml`:
   ```yaml
   new-service:
     build:
       context: ./new-service
       dockerfile: Dockerfile
   ```
5. Create remote repository and push

## CI/CD

Each service has its own GitHub Actions workflow:

- `frontend/.github/workflows/ci.yml` - Frontend CI/CD
- `receipt_processor/.github/workflows/ci.yml` - Backend CI/CD

Workflows automatically:

- Run tests on pull requests
- Build Docker images on push
- Deploy to staging (dev branch)
- Deploy to production (main branch)

## Production Deployment

For production, use published Docker images:

1. Copy the example production compose file:

   ```bash
   cp docker-compose.prod.yml.example docker-compose.prod.yml
   ```

2. Update image names in `docker-compose.prod.yml`:

   ```yaml
   frontend:
     image: ghcr.io/your-org/receipt-processor-frontend:main
   backend:
     image: ghcr.io/your-org/receipt-processor:main
   ```

3. Deploy:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Troubleshooting

### Git Commands in Workspace Root

If you accidentally run `git` commands in the workspace root:

- The workspace root should NOT be a git repo
- Use `git -C frontend <command>` to run git in subdirectories
- Or `cd` into the specific service directory first

### Docker Compose Context Issues

If docker-compose can't find services:

- Ensure you're running from workspace root
- Check that service directories exist
- Verify paths in docker-compose files are correct

### Service Communication

Services communicate via:

- **Frontend → Backend**: `NEXT_PUBLIC_API_URL` (default: http://localhost:8000)
- **Backend → Database**: `DATABASE_URL` (in docker-compose network: `postgres:5432`)
- **Backend → Redis**: `REDIS_URL` (in docker-compose network: `redis:6379`)

## Benefits of This Setup

✅ **Independent Repositories**: Each service has its own git history and CI/CD  
✅ **Unified Development**: All services in one workspace for easy development  
✅ **Team Flexibility**: Different teams can own different services  
✅ **Scalability**: Easy to add new services without affecting existing ones  
✅ **Local Testing**: Full stack development with docker-compose
