#!/bin/bash

# Script to switch all repos to master/main branch and pull latest changes
# Usage: ./switch-to-master.sh

# Don't exit on error - we handle errors explicitly
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base directory containing all repos
BASE_DIR="/Users/xavierelon/coding/acarus"

# List of repositories
REPOS=(
    "acarus-infra"
    "acarus-frontend"
    "acarus-backend"
    "ocr"
    "gopher-pos"
)

# Main function
main() {
    echo -e "${BLUE}🚀 Switching all repos to master/main and pulling latest changes...${NC}\n"
    
    local switched_count=0
    local skipped_count=0
    local error_count=0
    local already_on_master_count=0
    
    for repo in "${REPOS[@]}"; do
        repo_path="$BASE_DIR/$repo"
        
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}📦 Processing: ${repo}${NC}"
        
        # Check if directory exists
        if [ ! -d "$repo_path" ]; then
            echo -e "${RED}  ❌ Directory not found: $repo_path${NC}\n"
            ((error_count++))
            continue
        fi
        
        cd "$repo_path"
        
        # Check if it's a git repository
        if [ ! -d ".git" ]; then
            echo -e "${YELLOW}  ⚠️  Not a git repository, skipping...${NC}\n"
            ((skipped_count++))
            continue
        fi
        
        # Get current branch
        current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
        if [ -z "$current_branch" ]; then
            echo -e "${RED}  ❌ Could not determine current branch${NC}\n"
            ((error_count++))
            continue
        fi
        
        # Check if there are uncommitted changes
        if ! git diff-index --quiet HEAD -- 2>/dev/null; then
            echo -e "${YELLOW}  ⚠️  Uncommitted changes detected${NC}"
            echo -e "${YELLOW}     Stashing changes...${NC}"
            if git stash push -m "Auto-stash before switching to master $(date +%Y-%m-%d_%H:%M:%S)" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Changes stashed${NC}"
            else
                echo -e "${RED}  ❌ Failed to stash changes, skipping...${NC}\n"
                ((error_count++))
                continue
            fi
        fi
        
        # Determine base branch (master or main) - check remote first
        base_branch=""
        if git ls-remote --heads origin master 2>/dev/null | grep -q "refs/heads/master"; then
            base_branch="master"
        elif git ls-remote --heads origin main 2>/dev/null | grep -q "refs/heads/main"; then
            base_branch="main"
        else
            echo -e "${YELLOW}  ⚠️  Could not find master or main branch on remote${NC}\n"
            ((error_count++))
            continue
        fi
        
        # Check if already on master/main
        if [ "$current_branch" = "$base_branch" ]; then
            echo -e "${GREEN}  ✓ Already on ${base_branch}${NC}"
            echo -e "${BLUE}  📥 Pulling latest changes...${NC}"
            
            # Set upstream if not set
            git branch --set-upstream-to=origin/"$base_branch" "$base_branch" 2>/dev/null
            
            pull_output=$(git pull 2>&1)
            pull_exit_code=$?
            
            if [ $pull_exit_code -eq 0 ]; then
                echo -e "${GREEN}  ✓ Pulled latest changes${NC}"
                ((already_on_master_count++))
            else
                echo -e "${RED}  ❌ Failed to pull latest changes${NC}"
                echo -e "${RED}  Error: $pull_output${NC}"
                ((error_count++))
            fi
            echo ""
            continue
        fi
        
        # Fetch latest changes first
        echo -e "${BLUE}  📥 Fetching latest changes from remote...${NC}"
        if ! git fetch origin 2>/dev/null; then
            echo -e "${RED}  ❌ Failed to fetch from remote${NC}\n"
            ((error_count++))
            continue
        fi
        echo -e "${GREEN}  ✓ Fetched successfully${NC}"
        
        # Checkout master/main branch
        echo -e "${BLUE}  🔀 Switching to ${base_branch} branch...${NC}"
        
        # Check if local branch exists
        if git show-ref --verify --quiet refs/heads/"$base_branch"; then
            # Local branch exists, checkout and track remote
            if git checkout "$base_branch" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Switched to ${base_branch}${NC}"
            else
                echo -e "${RED}  ❌ Failed to checkout ${base_branch}${NC}\n"
                ((error_count++))
                continue
            fi
            
            # Set upstream if not already set
            git branch --set-upstream-to=origin/"$base_branch" "$base_branch" 2>/dev/null
        else
            # Local branch doesn't exist, create and track remote
            if git checkout -b "$base_branch" origin/"$base_branch" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Created and switched to ${base_branch}${NC}"
            else
                echo -e "${RED}  ❌ Failed to create and checkout ${base_branch}${NC}\n"
                ((error_count++))
                continue
            fi
        fi
        
        # Pull latest changes (use git pull without args since upstream is set, or specify remote/branch)
        echo -e "${BLUE}  📥 Pulling latest changes...${NC}"
        pull_output=$(git pull 2>&1)
        pull_exit_code=$?
        
        if [ $pull_exit_code -eq 0 ]; then
            # Check if there were actual updates or if already up to date
            if echo "$pull_output" | grep -q "Already up to date\|Fast-forward\|Updating"; then
                echo -e "${GREEN}  ✓ Pulled latest changes${NC}"
            else
                # Still succeeded, just show the output
                echo -e "${GREEN}  ✓ Pulled latest changes${NC}"
            fi
            ((switched_count++))
        else
            echo -e "${RED}  ❌ Failed to pull latest changes${NC}"
            echo -e "${RED}  Error: $pull_output${NC}"
            ((error_count++))
        fi
        
        echo ""
    done
    
    # Summary
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Summary:${NC}"
    echo -e "${GREEN}  ✓ Switched and pulled: ${switched_count}${NC}"
    echo -e "${GREEN}  ✓ Already on master/main (pulled): ${already_on_master_count}${NC}"
    echo -e "${YELLOW}  ⚠️  Skipped: ${skipped_count}${NC}"
    echo -e "${RED}  ❌ Errors: ${error_count}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ $((switched_count + already_on_master_count)) -gt 0 ]; then
        echo -e "${GREEN}✅ Successfully updated ${switched_count} repos and pulled latest for ${already_on_master_count} repos already on master/main${NC}"
    fi
}

# Run main function
main
