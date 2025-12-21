# Repository Split Guide

This guide explains how to split the monorepo into separate git repositories while maintaining a unified workspace.

> **Note**: This guide covers the "separate repos side-by-side" approach. For comparison with Git Submodules (another valid approach), see [GIT_SUBMODULES_VS_SEPARATE_REPOS.md](./GIT_SUBMODULES_VS_SEPARATE_REPOS.md).

## Overview

After splitting, you'll have:

- **Separate git repos**: `frontend` and `receipt_processor` (and future services)
- **Unified workspace**: All services can still be developed together in the same directory structure
- **Independent CI/CD**: Each service has its own GitHub Actions workflows

## Structure After Split

```
acarus/                          # Your workspace directory (NOT a git repo)
├── frontend/                    # Separate git repo for frontend
│   ├── .git/
│   ├── src/
│   ├── package.json
│   └── ...
├── receipt_processor/           # Separate git repo for backend
│   ├── .git/
│   ├── src/
│   ├── Cargo.toml
│   └── ...
├── docker-compose.yml          # Shared docker-compose (local development)
└── docs/                       # Shared documentation (optional)
```

## Step-by-Step Migration

### Step 1: Create Separate Git Repositories

#### For Frontend:

```bash
cd frontend
git init
git add .
git commit -m "Initial commit: Frontend service"

# Create remote repository on GitHub/GitLab first, then:
git remote add origin <your-frontend-repo-url>
git branch -M main
git push -u origin main
```

#### For Backend:

```bash
cd receipt_processor
git init
git add .
git commit -m "Initial commit: Receipt processor backend"

# Create remote repository on GitHub/GitLab first, then:
git remote add origin <your-backend-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Remove .git from Workspace Root (if exists)

The workspace root (`acarus/`) should NOT be a git repository. If it currently is:

```bash
cd /Users/xavierelon/coding/amazon/acarus
# Backup first!
# Then remove .git if you want the workspace root to not be a repo
# Or keep it if you want a "meta" repo for shared files
```

### Step 3: Copy GitHub Workflows

The workflows have been updated for separate repos:

- `frontend/.github/workflows/ci.yml` - Frontend CI/CD
- `receipt_processor/.github/workflows/ci.yml` - Backend CI/CD

Each workflow no longer uses path filters since the repos are separate.

### Step 4: Update Docker Compose for Local Development

For local development, you can use the workspace-level `docker-compose.yml` which references both services.

For production, you'll need to either:

1. Use published Docker images from each repo's CI/CD
2. Create a separate "deployment" or "infra" repo that pulls images from both services

## Working with Multiple Repos in One Workspace

### Daily Workflow

```bash
# Navigate to workspace
cd /Users/xavierelon/coding/amazon/acarus

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

### Running Services Locally

```bash
# From workspace root
docker-compose up

# Or run individually
cd frontend && npm run dev
cd receipt_processor && cargo run
```

## CI/CD Changes

### Before (Monorepo):

- Workflows used path filters (`paths: - 'frontend/**'`)
- Both workflows were in `.github/workflows/`

### After (Separate Repos):

- Each repo has its own `.github/workflows/ci.yml`
- No path filters needed (each repo only contains its own code)
- Image names may need adjustment if repos have different names

## Adding New Services

When you add a new service in the future:

1. Create the service directory: `mkdir new-service`
2. Initialize git: `cd new-service && git init`
3. Copy workflow template from existing service
4. Update workspace `docker-compose.yml` to include the new service
5. Commit and push to new remote repository

## Handling Shared Files (Docker Compose, Tiltfile, Docs, etc.)

Files like `docker-compose.yml`, `Tiltfile`, and `docs/` need to be version controlled but don't belong in individual service repos. See **[SHARED_FILES_STRATEGY.md](./SHARED_FILES_STRATEGY.md)** for detailed strategies.

### Recommended: Infrastructure Repository

Create a separate `infra/` repository for shared infrastructure files:

```bash
# Run the setup script
./setup-infra-repo.sh

# Or manually:
mkdir infra
cd infra
git init
# Copy docker-compose.yml, Tiltfile, docs/, etc.
git add .
git commit -m "Initial infrastructure setup"
```

This keeps shared files version controlled while maintaining service independence. See `SHARED_FILES_STRATEGY.md` for complete details.

## Deployment Considerations

For production deployment, use the infrastructure repository's `docker-compose.prod.yml` which references published Docker images from each service's CI/CD pipeline.

## Troubleshooting

### Git Commands in Wrong Directory

If you run `git` commands in the workspace root and get confused:

- Use `git -C frontend status` to run git commands in subdirectories
- Or always `cd` into the specific service directory first

### Docker Compose Context Issues

If docker-compose can't find services:

- Ensure you're running from the workspace root
- Check that paths in docker-compose.yml are relative to workspace root
- Or update docker-compose.yml to use absolute paths or image names

## Benefits of This Approach

✅ **Independent versioning**: Each service has its own git history  
✅ **Separate CI/CD**: Each service can deploy independently  
✅ **Team flexibility**: Different teams can own different services  
✅ **Clean workspace**: Still develop all services together locally  
✅ **Easy scaling**: Add new services without affecting existing ones
