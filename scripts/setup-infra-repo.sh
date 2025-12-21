#!/bin/bash

# Setup script to create infrastructure repository for shared files
# This creates a separate git repo for docker-compose, Tiltfile, docs, etc.

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$WORKSPACE_DIR/infra"

echo "🏗️  Setting up infrastructure repository..."
echo "Workspace: $WORKSPACE_DIR"
echo ""

# Check if infra directory already exists
if [ -d "$INFRA_DIR" ]; then
    echo "⚠️  Infrastructure directory already exists: $INFRA_DIR"
    read -p "Do you want to continue? This will initialize git if not already done. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    mkdir -p "$INFRA_DIR"
fi

cd "$INFRA_DIR"

# Check if already a git repo
if [ -d ".git" ]; then
    echo "⚠️  Infrastructure directory already has a .git directory"
    read -p "Continue with existing repo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Copy/move shared files
echo "📋 Copying shared files..."

# Docker Compose files
if [ -f "$WORKSPACE_DIR/docker-compose.yml" ]; then
    cp "$WORKSPACE_DIR/docker-compose.yml" .
    echo "  ✓ Copied docker-compose.yml"
fi

if [ -f "$WORKSPACE_DIR/docker-compose.local.yml" ]; then
    cp "$WORKSPACE_DIR/docker-compose.local.yml" .
    echo "  ✓ Copied docker-compose.local.yml"
elif [ -f "$WORKSPACE_DIR/docker-compose.dev.yml" ]; then
    cp "$WORKSPACE_DIR/docker-compose.dev.yml" docker-compose.local.yml
    echo "  ✓ Copied docker-compose.dev.yml as docker-compose.local.yml"
fi

if [ -f "$WORKSPACE_DIR/docker-compose.prod.yml.example" ]; then
    cp "$WORKSPACE_DIR/docker-compose.prod.yml.example" .
    echo "  ✓ Copied docker-compose.prod.yml.example"
fi

# Tiltfile
if [ -f "$WORKSPACE_DIR/Tiltfile" ]; then
    cp "$WORKSPACE_DIR/Tiltfile" .
    echo "  ✓ Copied Tiltfile"
fi

# Documentation
if [ -d "$WORKSPACE_DIR/docs" ]; then
    cp -r "$WORKSPACE_DIR/docs" .
    echo "  ✓ Copied docs/ directory"
fi

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# Database Configuration
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=receipt_db
POSTGRES_PORT=5439

# Redis Configuration
REDIS_PASSWORD=redis123
REDIS_PORT=6379

# Backend Configuration
BACKEND_PORT=8000
JWT_SECRET=your-jwt-secret-change-in-production
RUST_LOG=info

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
EOF
    echo "  ✓ Created .env.example"
fi

# Create .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.*.local
*.env
!*.env.example

# Docker volumes (if any)
volumes/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
EOF
    echo "  ✓ Created .gitignore"
fi

# Create README for infra repo
if [ ! -f "README.md" ]; then
    cat > README.md << 'EOF'
# Acarus Infrastructure

This repository contains shared infrastructure and deployment configuration for the Acarus platform.

## Contents

- **docker-compose.yml** - Full stack Docker Compose configuration
- **docker-compose.local.yml** - Local development configuration
- **docker-compose.prod.yml.example** - Production template (copy to docker-compose.prod.yml)
- **Tiltfile** - Tilt configuration for local development
- **docs/** - Shared documentation
- **.env.example** - Environment variable template

## Quick Start

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

2. Start services:
   ```bash
   docker-compose -f docker-compose.local.yml up
   ```

## Repository Structure

This infrastructure repository works alongside separate service repositories:

```
acarus/                          # Workspace root
├── frontend/                    # Frontend service (separate repo)
├── receipt_processor/           # Backend service (separate repo)
└── infra/                       # This repository
    ├── docker-compose.yml
    ├── Tiltfile
    └── docs/
```

## See Also

- [SHARED_FILES_STRATEGY.md](../SHARED_FILES_STRATEGY.md) - Detailed strategy for shared files
- [WORKSPACE_SETUP.md](../WORKSPACE_SETUP.md) - Workspace setup guide
EOF
    echo "  ✓ Created README.md"
fi

# Stage and commit files
echo ""
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit (files may already be committed)"
else
    git commit -m "Initial infrastructure setup

- Docker Compose configurations
- Tiltfile
- Shared documentation
- Environment variable template"
    echo "✅ Files committed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Infrastructure repository setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Create a remote repository on GitHub/GitLab"
echo "2. Add remote and push:"
echo "   cd infra"
echo "   git remote add origin <infra-repo-url>"
echo "   git push -u origin main"
echo ""
echo "3. (Optional) Create symlinks in workspace root for convenience:"
echo "   cd .."
echo "   ln -s infra/docker-compose.local.yml docker-compose.yml"
echo "   ln -s infra/Tiltfile Tiltfile"
echo ""
echo "4. Review SHARED_FILES_STRATEGY.md for more details"
echo ""

