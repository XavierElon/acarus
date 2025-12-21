# Strategy for Shared Files with Separate Repos

When using separate git repositories for each service, you need a strategy for files that should be at the workspace root level, such as:

- Docker Compose files (need to reference multiple services)
- Tiltfile (may configure multiple services)
- Documentation (shared across services)
- Environment files (.env files)
- Shared scripts and utilities

## Option 1: Infrastructure/Deployment Repository (Recommended) ✅

Create a separate `acarus-infra` or `acarus-workspace` repository for all shared infrastructure and configuration files.

### Structure

```
acarus/                          # Workspace (NOT a git repo)
├── frontend/                    # Frontend service repo
│   └── .git/
├── receipt_processor/           # Backend service repo
│   └── .git/
└── infra/                       # Infrastructure repo (NEW)
    ├── .git/
    ├── docker-compose.yml
    ├── docker-compose.local.yml
    ├── docker-compose.prod.yml
    ├── Tiltfile
    ├── docs/
    ├── .env.example
    ├── scripts/
    └── README.md
```

### Setup

```bash
# In workspace root
mkdir infra
cd infra
git init
git add docker-compose.yml Tiltfile docs/ .env.example
git commit -m "Initial infrastructure setup"
git remote add origin <infra-repo-url>
git push -u origin main
```

### Benefits

✅ **Version Controlled**: All shared files are tracked in git  
✅ **Team Collaboration**: Infrastructure team can own this repo  
✅ **CI/CD Integration**: Can have its own deployment pipelines  
✅ **Clear Separation**: Infrastructure concerns separate from service code  
✅ **Easy Updates**: Update docker-compose without touching service repos

### Daily Workflow

```bash
# Work on services (as before)
cd frontend
git commit -m "Frontend changes"
git push

# Update infrastructure
cd ../infra
git commit -m "Update docker-compose for new service"
git push
```

---

## Option 2: Workspace Root as Git Submodule Container

Make the workspace root a git repository that uses submodules for services, and includes shared files.

### Structure

```
acarus/                          # Workspace repo (parent)
├── .git/
├── .gitmodules                  # Defines service submodules
├── docker-compose.yml           # In workspace repo
├── Tiltfile                     # In workspace repo
├── docs/                        # In workspace repo
├── frontend/                    # Git submodule
│   └── .git/
└── receipt_processor/           # Git submodule
    └── .git/
```

### Setup

```bash
# Initialize workspace repo
cd /Users/xavierelon/coding/amazon/acarus
git init

# Add shared files
git add docker-compose.yml Tiltfile docs/ .env.example
git commit -m "Initial workspace setup"

# Add services as submodules
git submodule add <frontend-repo-url> frontend
git submodule add <backend-repo-url> receipt_processor
git commit -m "Add service submodules"
```

### Benefits

✅ **Single Clone**: `git clone --recursive` gets everything  
✅ **Version Tracking**: Can track compatible versions together  
✅ **Unified History**: Shared files versioned with service versions

### Drawbacks

❌ **Submodule Complexity**: Requires submodule commands  
❌ **Mixed Concerns**: Service code mixed with infrastructure

---

## Option 3: Minimal Workspace Root (Current Approach)

Keep workspace root as just a folder, duplicate relevant configs in each service repo.

### Structure

```
acarus/                          # Just a folder
├── frontend/
│   ├── .git/
│   └── docker-compose.yml      # Frontend-specific compose
├── receipt_processor/
│   ├── .git/
│   └── docker-compose.yml      # Backend-specific compose
└── docker-compose.local.yml     # Local dev (not versioned)
```

### Benefits

✅ **Simple**: No extra repos to manage  
✅ **Independent**: Each service is completely self-contained

### Drawbacks

❌ **No Version Control**: Shared files not tracked  
❌ **Duplication**: Need to duplicate configs  
❌ **Hard to Sync**: Changes to docker-compose require manual updates

---

## Recommended: Option 1 (Infrastructure Repo)

For your use case, **Option 1 (Infrastructure Repository)** is recommended because:

1. ✅ **Best of Both Worlds**: Services are independent, but shared files are versioned
2. ✅ **Clear Ownership**: Infrastructure team can own the infra repo
3. ✅ **Flexible**: Can add deployment scripts, CI/CD configs, etc.
4. ✅ **No Submodule Complexity**: Avoids submodule learning curve
5. ✅ **Easy to Maintain**: Update docker-compose without touching service repos

### Complete Structure with Infrastructure Repo

```
acarus/                          # Workspace (NOT a git repo)
├── frontend/                    # Frontend service (git repo)
│   ├── .git/
│   ├── src/
│   ├── Dockerfile
│   └── README.md
├── receipt_processor/           # Backend service (git repo)
│   ├── .git/
│   ├── src/
│   ├── Dockerfile
│   └── README.md
└── infra/                       # Infrastructure (git repo) ⭐
    ├── .git/
    ├── docker-compose.yml       # Full stack compose
    ├── docker-compose.local.yml # Local development
    ├── docker-compose.prod.yml  # Production
    ├── Tiltfile                 # Tilt configuration
    ├── .env.example             # Shared environment template
    ├── .env.local               # Local environment (gitignored)
    ├── docs/                    # Shared documentation
    │   ├── DEPLOYMENT.md
    │   ├── ARCHITECTURE.md
    │   └── ...
    ├── scripts/                 # Deployment scripts
    │   ├── deploy.sh
    │   └── migrate.sh
    └── README.md                # Infrastructure docs
```

### Implementation Steps

1. **Create infrastructure repository:**

```bash
cd /Users/xavierelon/coding/amazon/acarus

# Move/create infra directory
mkdir infra
cd infra
git init

# Copy/move shared files
cp ../docker-compose.yml .
cp ../docker-compose.dev.yml docker-compose.local.yml
cp ../Tiltfile .
cp -r ../docs .  # Or move if docs are infra-specific

# Create .env.example
cat > .env.example << EOF
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=receipt_db

# Redis
REDIS_PASSWORD=redis123

# Backend
JWT_SECRET=your-jwt-secret-change-in-production
RUST_LOG=info

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this
EOF

# Create .gitignore
cat > .gitignore << EOF
.env.local
.env
*.env
!*.env.example
EOF

# Initial commit
git add .
git commit -m "Initial infrastructure setup"

# Create remote and push
git remote add origin <infra-repo-url>
git branch -M main
git push -u origin main
```

2. **Update docker-compose.yml paths:**

Since services are now sibling directories, paths stay the same:

```yaml
# infra/docker-compose.yml
services:
  backend:
    build:
      context: ../receipt_processor # Relative to infra/ directory
      dockerfile: Dockerfile
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
```

3. **Update workspace README:**

Point to infra repo for docker-compose and shared files.

### Daily Workflow with Infrastructure Repo

```bash
# Clone workspace structure
cd /Users/xavierelon/coding/amazon/acarus
git clone <frontend-repo> frontend
git clone <backend-repo> receipt_processor
git clone <infra-repo> infra

# Run from infra directory
cd infra
docker-compose -f docker-compose.local.yml up

# Or create symlinks for convenience
cd /Users/xavierelon/coding/amazon/acarus
ln -s infra/docker-compose.local.yml docker-compose.yml
ln -s infra/Tiltfile Tiltfile
```

### Alternative: Symlinks in Workspace Root

For convenience, you can create symlinks in workspace root:

```bash
cd /Users/xavierelon/coding/amazon/acarus
ln -s infra/docker-compose.local.yml docker-compose.yml
ln -s infra/Tiltfile Tiltfile
ln -s infra/.env.example .env.example
```

This allows running `docker-compose up` from workspace root while files are versioned in infra repo.

---

## Comparison Table

| Aspect                 | Option 1: Infra Repo | Option 2: Submodules | Option 3: No Repo |
| ---------------------- | -------------------- | -------------------- | ----------------- |
| Version Control        | ✅ Yes               | ✅ Yes               | ❌ No             |
| Simplicity             | ✅ Simple            | ❌ Complex           | ✅ Simple         |
| Service Independence   | ✅ Full              | ⚠️ Linked            | ✅ Full           |
| Shared File Management | ✅ Easy              | ✅ Easy              | ❌ Manual         |
| Team Ownership         | ✅ Clear             | ⚠️ Mixed             | ⚠️ Unclear        |
| Learning Curve         | ✅ Low               | ❌ High              | ✅ None           |

---

## Recommendation

**Use Option 1 (Infrastructure Repository)** because it gives you:

- Version control for shared files
- Independent service repositories
- Clear ownership and organization
- No submodule complexity
- Easy to extend with deployment scripts, CI/CD configs, etc.

The infrastructure repository becomes the "glue" that holds your services together for deployment and development, while keeping each service's code completely independent.
