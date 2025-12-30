#!/bin/bash

# Migration script to split monorepo into separate git repositories
# This script helps initialize git repos in each service directory

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$WORKSPACE_DIR/frontend"
BACKEND_DIR="$WORKSPACE_DIR/receipt_processor"

echo "🚀 Starting migration to separate repositories..."
echo "Workspace: $WORKSPACE_DIR"
echo ""

# Check if directories exist
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Function to initialize git repo
init_git_repo() {
    local dir=$1
    local service_name=$2
    
    echo "📦 Initializing git repository in $service_name..."
    
    cd "$dir"
    
    # Check if already a git repo
    if [ -d ".git" ]; then
        echo "⚠️  $service_name already has a .git directory"
        read -p "Do you want to reinitialize? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping $service_name..."
            cd "$WORKSPACE_DIR"
            return
        fi
        echo "Removing existing .git directory..."
        rm -rf .git
    fi
    
    # Initialize git
    git init
    git branch -M main
    
    # Create initial commit
    git add .
    git commit -m "Initial commit: $service_name service"
    
    echo "✅ Git repository initialized in $service_name"
    echo "   Next steps:"
    echo "   1. Create a remote repository on GitHub/GitLab"
    echo "   2. Run: git remote add origin <your-$service_name-repo-url>"
    echo "   3. Run: git push -u origin main"
    echo ""
    
    cd "$WORKSPACE_DIR"
}

# Initialize frontend repo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Initialize git repository for frontend? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    init_git_repo "$FRONTEND_DIR" "frontend"
fi

# Initialize backend repo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Initialize git repository for backend? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    init_git_repo "$BACKEND_DIR" "receipt_processor"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Review REPO_SPLIT_GUIDE.md for detailed instructions"
echo "2. Create remote repositories on GitHub/GitLab"
echo "3. Add remotes and push each service repository"
echo "4. Update docker-compose.prod.yml.example with your image names"
echo "5. Review WORKSPACE_SETUP.md for development workflow"
echo ""

