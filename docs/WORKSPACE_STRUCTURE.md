# Workspace Repository Structure

This document explains the repository structure for the Acarus workspace.

## Structure Overview

```
acarus/                          # Infrastructure repository (root is a git repo)
├── .git/                        # Infrastructure repo's git
├── .github/                     # Workspace-level GitHub workflows
│   └── workflows/
│       ├── backend-ci.yml       # (legacy - services have their own workflows)
│       └── frontend-ci.yml      # (legacy - services have their own workflows)
├── .cursor/                     # Cursor IDE configuration
├── docker-compose.yml           # Full stack compose
├── docker-compose.local.yml     # Local development
├── docker-compose.dev.yml       # Dev database tools
├── docker-compose.prod.yml.example  # Production template
├── Tiltfile                     # Tilt configuration
├── docs/                        # Shared documentation
├── scripts/                     # Utility scripts
├── README.md                    # Workspace README
├── .gitignore                   # Excludes frontend/ and backend/
│
├── frontend/                    # Frontend service (separate git repo)
│   ├── .git/                   # Frontend's git repository
│   ├── .github/workflows/      # Frontend CI/CD
│   ├── src/
│   ├── package.json
│   └── ...
│
└── backend/                     # Backend service (separate git repo)
    ├── .git/                   # Backend's git repository
    ├── .github/workflows/      # Backend CI/CD
    ├── src/
    ├── Cargo.toml
    └── ...
```

## Repository Breakdown

### 1. Infrastructure Repository (Workspace Root)

**Location**: `/Users/xavierelon/coding/amazon/acarus/`

**Contains**:

- ✅ `.github/` - Workspace-level GitHub workflows (if any)
- ✅ `.cursor/` - Cursor IDE configuration
- ✅ `docker-compose*.yml` - All Docker Compose configurations
- ✅ `Tiltfile` - Tilt development configuration
- ✅ `docs/` - Shared documentation
- ✅ `scripts/` - Utility and setup scripts
- ✅ `README.md` - Workspace documentation

**Excludes** (via `.gitignore`):

- ❌ `frontend/` - Separate repository
- ❌ `backend/` - Separate repository

### 2. Frontend Repository

**Location**: `/Users/xavierelon/coding/amazon/acarus/frontend/`

**Contains**:

- Frontend source code
- Frontend-specific CI/CD workflows (`.github/workflows/ci.yml`)
- Frontend Dockerfile and build configuration
- Frontend dependencies (package.json, etc.)

### 3. Backend Repository

**Location**: `/Users/xavierelon/coding/amazon/acarus/backend/`

**Contains**:

- Backend source code
- Backend-specific CI/CD workflows (`.github/workflows/ci.yml`)
- Backend Dockerfile and build configuration
- Database migrations
- Backend dependencies (Cargo.toml, etc.)

## Setup Instructions

### Initial Setup

1. **Initialize infrastructure repository** (workspace root):

   ```bash
   cd /Users/xavierelon/coding/amazon/acarus
   ./setup-workspace-repos.sh
   ```

   Or manually:

   ```bash
   git init
   git branch -M main
   # Create .gitignore (see below)
   git add .github/ .cursor/ docker-compose*.yml Tiltfile docs/ scripts/ README.md
   git commit -m "Initial infrastructure setup"
   ```

2. **Create .gitignore** in workspace root:

   ```gitignore
   # Service directories (separate git repos)
   /frontend/
   /backend/

   # Environment files
   .env
   .env.local
   *.env
   !*.env.example

   # IDE and OS files
   .vscode/
   .idea/
   .DS_Store
   node_modules/
   /target/
   ```

3. **Initialize service repositories**:

   ```bash
   # Frontend
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin <frontend-repo-url>
   git push -u origin main

   # Backend
   cd ../backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin <backend-repo-url>
   git push -u origin main
   ```

### Cloning the Workspace

**Option 1: Clone Infrastructure First, Then Services**

```bash
# Clone infrastructure
git clone <infra-repo-url> acarus
cd acarus

# Clone services
git clone <frontend-repo-url> frontend
git clone <backend-repo-url> backend
```

**Option 2: If Services Already Exist, Clone Infrastructure**

```bash
# If frontend and backend already exist
cd /Users/xavierelon/coding/amazon/acarus
git clone <infra-repo-url> .
# This will pull infra files, service dirs are excluded
```

## Daily Workflow

### Working on Infrastructure

```bash
cd /Users/xavierelon/coding/amazon/acarus

# Edit docker-compose.yml, docs, etc.
git add .
git commit -m "Update docker-compose configuration"
git push
```

### Working on Frontend

```bash
cd /Users/xavierelon/coding/amazon/acarus/frontend

# Make changes
git add .
git commit -m "Frontend feature"
git push
```

### Working on Backend

```bash
cd /Users/xavierelon/coding/amazon/acarus/backend

# Make changes
git add .
git commit -m "Backend feature"
git push
```

## Why This Structure?

### Benefits

✅ **Clear Separation**: Infrastructure (docker, docs, scripts) separate from service code  
✅ **Version Control**: All shared files are tracked in the infra repo  
✅ **Service Independence**: Each service has its own repository and CI/CD  
✅ **Tool Compatibility**: `.github` and `.cursor` at root level work with IDE/tooling  
✅ **No Submodules**: Simpler than git submodules, just separate repos

### Key Points

1. **Workspace root IS a git repo** (the infrastructure repository)
2. **Service directories are excluded** from the infra repo via `.gitignore`
3. **Each service is a separate git repo** with its own `.git/` directory
4. **`.github` and `.cursor`** are in the infra repo at root level

## FAQ

### Q: Why is the workspace root a git repo?

A: To version control shared infrastructure files (docker-compose, docs, scripts, `.github`, `.cursor`) that don't belong in individual service repos.

### Q: How do I prevent git from tracking service directories?

A: Add `/frontend/` and `/backend/` to the workspace root's `.gitignore`.

### Q: Can I use git submodules instead?

A: Yes, but it adds complexity. See `GIT_SUBMODULES_VS_SEPARATE_REPOS.md` for comparison.

### Q: What if I accidentally commit a service directory?

A: Remove it from git tracking:

```bash
git rm -r --cached frontend/
git commit -m "Remove frontend from infra repo"
```

### Q: How do I add a new service?

A:

1. Create service directory: `mkdir new-service`
2. Initialize as git repo: `cd new-service && git init`
3. Ensure it's in `.gitignore`: Add `/new-service/` to workspace root `.gitignore`
4. Add to docker-compose.yml in infra repo

### Q: Will Cursor show all repos in the Source Control tab?

A: No, Cursor typically shows only the workspace root repository (infrastructure repo) in Source Control. For service repos, use terminal commands or open them as separate folders. See [CURSOR_MULTI_REPO_WORKFLOW.md](./CURSOR_MULTI_REPO_WORKFLOW.md) for details and workarounds.
