# Acarus - Receipt Processing Platform

A multi-service receipt processing platform with separate git repositories for each service, allowing independent versioning and deployment while maintaining a unified development workspace.

## 🏗️ Architecture

This workspace uses a **multi-repository structure**:

- **Workspace Root** - Infrastructure repository (contains `.github/`, `.cursor/`, docker-compose, docs, scripts)
- **frontend/** - Frontend service (separate git repo)
- **receipt_processor/** - Backend service (separate git repo)

See **[WORKSPACE_STRUCTURE.md](./WORKSPACE_STRUCTURE.md)** for detailed structure explanation.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (or Bun) for frontend development
- Rust 1.70+ for backend development
- Git

### Setup

1. **Initialize workspace infrastructure repository:**

   ```bash
   cd /Users/xavierelon/coding/amazon/acarus
   ./setup-workspace-repos.sh
   ```

2. **Clone or initialize service repositories:**

   ```bash
   # Clone frontend (if remote exists)
   git clone <frontend-repo-url> frontend

   # Clone backend (if remote exists)
   git clone <backend-repo-url> backend

   # Or initialize locally (see WORKSPACE_STRUCTURE.md)
   ```

3. **Start services with Docker Compose:**

   ```bash
   docker-compose -f docker-compose.local.yml up
   ```

   This will start:

   - PostgreSQL database (port 5439)
   - Redis cache (port 6379)
   - Backend API (port 8000)
   - Frontend application (port 3000)

## 📚 Documentation

- **[WORKSPACE_STRUCTURE.md](./WORKSPACE_STRUCTURE.md)** ⭐ - Complete explanation of repository structure
- **[docs/](./docs/)** - Additional documentation for deployment, CI/CD, and architecture

## 🔧 Development

### Working with Multiple Repos

Each service is a separate git repository:

```bash
# Work on frontend
cd frontend
git status
git commit -m "Frontend changes"
git push

# Work on backend
cd ../backend
git status
git commit -m "Backend changes"
git push
```

### Running Services Locally

**Option 1: Docker Compose (Recommended)**

```bash
docker-compose -f docker-compose.local.yml up
```

**Option 2: Run Individually**

Frontend:

```bash
cd frontend
npm run dev  # or bun run dev
```

Backend:

```bash
cd backend
cargo run
```

**Option 3: Tilt (Hot-reload)**

```bash
tilt up
```

## 🚢 CI/CD

Each service has its own GitHub Actions workflow:

- **Frontend**: `frontend/.github/workflows/ci.yml`
- **Backend**: `backend/.github/workflows/ci.yml`

Workflows automatically:

- ✅ Run tests on pull requests
- ✅ Build Docker images on push
- ✅ Deploy to staging (dev branch)
- ✅ Deploy to production (main branch)

## 📦 Production Deployment

For production deployments, use published Docker images:

1. Copy the production compose template:

   ```bash
   cp docker-compose.prod.yml.example docker-compose.prod.yml
   ```

2. Update image names in `docker-compose.prod.yml` with your registry URLs

3. Deploy:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🎯 Benefits of This Setup

✅ **Independent Repositories** - Each service has its own git history and CI/CD  
✅ **Unified Development** - All services in one workspace for easy development  
✅ **Team Flexibility** - Different teams can own different services  
✅ **Scalability** - Easy to add new services without affecting existing ones  
✅ **Independent Deployment** - Deploy services independently

## 🔄 Adding New Services

When adding a new service:

1. Create directory: `mkdir new-service`
2. Initialize git: `cd new-service && git init`
3. Set up service code and CI/CD
4. Add to `docker-compose.local.yml`
5. Create remote repository and push

See [REPO_SPLIT_GUIDE.md](./REPO_SPLIT_GUIDE.md) for detailed instructions.

## 📝 Project Structure

```
acarus/                          # Infrastructure repository (root is a git repo)
├── .git/                        # Infra repo's git
├── .github/                     # Workspace-level workflows
├── .cursor/                     # Cursor IDE config
├── docker-compose.yml           # Full stack
├── docker-compose.local.yml     # Local development
├── Tiltfile                     # Tilt configuration
├── docs/                        # Shared documentation
├── scripts/                     # Utility scripts
├── frontend/                    # Frontend service (separate git repo)
│   ├── .git/
│   ├── .github/workflows/
│   └── src/
└── backend/                     # Backend service (separate git repo)
    ├── .git/
    ├── .github/workflows/
    └── src/
```

See **[WORKSPACE_STRUCTURE.md](./WORKSPACE_STRUCTURE.md)** for detailed explanation.

## 🤝 Contributing

Each service repository can be worked on independently. Follow the development workflow in [WORKSPACE_SETUP.md](./WORKSPACE_SETUP.md).

## 📄 License

[Your license here]
