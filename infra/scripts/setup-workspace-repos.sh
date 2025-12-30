#!/bin/bash

# Setup script to initialize workspace as infrastructure repo
# and set up frontend and backend as separate repos
# 
# Structure:
# acarus/ (infra repo - contains .github, .cursor, docker-compose, docs, etc.)
# ├── frontend/ (separate repo)
# └── backend/ (separate repo)

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🏗️  Setting up workspace repository structure..."
echo "Workspace: $WORKSPACE_DIR"
echo ""
echo "This will:"
echo "  1. Initialize workspace root as infra repository"
echo "  2. Create .gitignore to exclude frontend/ and backend/"
echo "  3. Optionally initialize frontend and backend as separate repos"
echo ""

cd "$WORKSPACE_DIR"

# Check if workspace is already a git repo
if [ -d ".git" ]; then
    echo "⚠️  Workspace root already has a .git directory"
    read -p "Continue? This will use the existing repo. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    echo "📦 Initializing infrastructure repository in workspace root..."
    git init
    git branch -M main
fi

# Create .gitignore if it doesn't exist or update it
echo "📋 Setting up .gitignore..."

if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Service directories (separate git repos)
/frontend/
/backend/

# Environment files
.env
.env.local
.env.*.local
*.env
!*.env.example

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Build artifacts
/target/
node_modules/

# Docker volumes
volumes/
EOF
    echo "  ✓ Created .gitignore"
else
    # Check if it already excludes service directories
    if ! grep -q "^/frontend/" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# Service directories (separate git repos)" >> .gitignore
        echo "/frontend/" >> .gitignore
        echo "/backend/" >> .gitignore
        echo "  ✓ Updated .gitignore to exclude service directories"
    else
        echo "  ✓ .gitignore already excludes service directories"
    fi
fi

# Stage and commit infrastructure files
echo ""
echo "📝 Staging infrastructure files..."

# Add all files except frontend and receipt_processor
git add .gitignore

# Add other infrastructure files
git add docker-compose*.yml docker-compose*.yaml Tiltfile README.md scripts/ docs/ 2>/dev/null || true

# Check if .github exists and add it
if [ -d ".github" ]; then
    git add .github/ 2>/dev/null || true
    echo "  ✓ Added .github/"
fi

# Check if .cursor exists and add it (usually not ignored, but check anyway)
if [ -d ".cursor" ]; then
    if ! git check-ignore -q .cursor 2>/dev/null; then
        git add .cursor/ 2>/dev/null || true
        echo "  ✓ Added .cursor/"
    else
        echo "  ⚠️  .cursor/ exists but is ignored (this is OK if intentional)"
    fi
fi

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit (files may already be committed)"
else
    git commit -m "Initial infrastructure repository setup

- Docker Compose configurations
- Tiltfile
- Shared documentation
- Scripts
- GitHub workflows (.github/)
- Cursor configuration (.cursor/)
- Excludes frontend/ and backend/ (separate repos)"
    echo "✅ Infrastructure files committed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Infrastructure repository setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Structure:"
echo "  acarus/                    # Infrastructure repo (this repo)"
echo "  ├── .git/                 # Infra repo's git"
echo "  ├── .github/              # Workspace-level workflows"
echo "  ├── .cursor/              # Cursor config"
echo "  ├── docker-compose.yml"
echo "  ├── docs/"
echo "  ├── scripts/"
echo "  ├── frontend/             # Separate repo (excluded from infra)"
echo "  │   └── .git/"
echo "  └── backend/              # Separate repo (excluded from infra)"
echo "      └── .git/"
echo ""
echo "Next steps:"
echo ""
echo "1. Create remote repository for infrastructure:"
echo "   git remote add origin <infra-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Initialize frontend as separate repo (if not already):"
echo "   cd frontend"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial frontend commit'"
echo "   git remote add origin <frontend-repo-url>"
echo "   git push -u origin main"
echo ""
echo "3. Initialize backend as separate repo (if not already):"
echo "   cd ../backend"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial backend commit'"
echo "   git remote add origin <backend-repo-url>"
echo "   git push -u origin main"
echo ""

