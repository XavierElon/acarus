#!/bin/bash

# Script to merge pull requests from current branches to master for all repos
# Usage: ./merge-prs-to-master.sh [--dry-run] [--merge-method METHOD]
#   --dry-run: Only show what would be merged, don't actually merge
#   --merge-method: merge|squash|rebase (default: merge)

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

# Default options
DRY_RUN=false
MERGE_METHOD="merge"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --merge-method)
            MERGE_METHOD="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--dry-run] [--merge-method merge|squash|rebase]"
            exit 1
            ;;
    esac
done

# Validate merge method
if [[ ! "$MERGE_METHOD" =~ ^(merge|squash|rebase)$ ]]; then
    echo -e "${RED}❌ Invalid merge method: $MERGE_METHOD${NC}"
    echo "Valid methods: merge, squash, rebase"
    exit 1
fi

# Function to extract owner and repo name from git remote URL
extract_repo_info() {
    local remote_url=$1
    # Handle both SSH (git@github.com:owner/repo.git) and HTTPS (https://github.com/owner/repo.git) formats
    if [[ $remote_url =~ git@github\.com:([^/]+)/([^/]+)\.git ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    elif [[ $remote_url =~ https://github\.com/([^/]+)/([^/]+)\.git ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    elif [[ $remote_url =~ https://github\.com/([^/]+)/([^/]+) ]]; then
        echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    else
        echo ""
    fi
}

# Function to get PR number for a branch
get_pr_number() {
    local owner=$1
    local repo=$2
    local head=$3
    local base=$4
    
    # Get PR number using gh CLI
    gh pr list --repo "$owner/$repo" --head "$head" --base "$base" --state open --json number --jq '.[0].number' 2>/dev/null || echo ""
}

# Function to check if PR is mergeable
is_pr_mergeable() {
    local owner=$1
    local repo=$2
    local pr_number=$3
    
    # Check mergeability status
    local mergeable=$(gh pr view "$pr_number" --repo "$owner/$repo" --json mergeable --jq -r '.mergeable' 2>/dev/null)
    echo "$mergeable"
}

# Function to get PR status
get_pr_status() {
    local owner=$1
    local repo=$2
    local pr_number=$3
    
    # Get PR status - pipe to jq separately since --jq doesn't support -r flag
    gh pr view "$pr_number" --repo "$owner/$repo" --json state,mergeable,mergeStateStatus,isDraft 2>/dev/null | jq -r '[.state, .mergeable, .mergeStateStatus, .isDraft] | @tsv' 2>/dev/null || echo ""
}

# Main function
main() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${CYAN}🔍 DRY RUN MODE - No PRs will be merged${NC}\n"
    fi
    
    echo -e "${BLUE}🚀 Merging pull requests to master...${NC}"
    echo -e "${BLUE}   Merge method: ${MERGE_METHOD}${NC}\n"
    
    # Check if gh CLI is authenticated
    if ! gh auth status &>/dev/null; then
        echo -e "${RED}❌ Error: GitHub CLI is not authenticated.${NC}"
        echo -e "${YELLOW}Please run: gh auth login${NC}"
        exit 1
    fi
    
    # Check if jq is available
    if ! command -v jq &>/dev/null; then
        echo -e "${RED}❌ Error: jq is not installed.${NC}"
        echo -e "${YELLOW}Please install jq: brew install jq${NC}"
        exit 1
    fi
    
    local merged_count=0
    local skipped_count=0
    local error_count=0
    local not_mergeable_count=0
    
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
        
        # Check if on master or main
        if [ "$current_branch" = "master" ] || [ "$current_branch" = "main" ]; then
            echo -e "${GREEN}  ✓ Already on ${current_branch}, no PR to merge${NC}\n"
            ((skipped_count++))
            continue
        fi
        
        # Get remote URL
        remote_url=$(git remote get-url origin 2>/dev/null || echo "")
        if [ -z "$remote_url" ]; then
            echo -e "${RED}  ❌ No remote 'origin' found${NC}\n"
            ((error_count++))
            continue
        fi
        
        # Extract owner and repo name
        repo_info=$(extract_repo_info "$remote_url")
        if [ -z "$repo_info" ]; then
            echo -e "${RED}  ❌ Could not extract repo info from: $remote_url${NC}\n"
            ((error_count++))
            continue
        fi
        
        IFS='/' read -r owner repo_name <<< "$repo_info"
        
        # Determine base branch (master or main) - check remote first
        base_branch=""
        if git ls-remote --heads origin master 2>/dev/null | grep -q "refs/heads/master"; then
            base_branch="master"
        elif git ls-remote --heads origin main 2>/dev/null | grep -q "refs/heads/main"; then
            base_branch="main"
        else
            # Try to get default branch from GitHub API
            default_branch=$(gh repo view "$owner/$repo_name" --json defaultBranchRef --jq -r '.defaultBranchRef.name' 2>/dev/null || echo "")
            if [ -n "$default_branch" ]; then
                base_branch="$default_branch"
            else
                echo -e "${YELLOW}  ⚠️  Could not determine base branch (master/main), skipping...${NC}\n"
                ((skipped_count++))
                continue
            fi
        fi
        
        # Get PR number
        pr_number=$(get_pr_number "$owner" "$repo_name" "$current_branch" "$base_branch")
        if [ -z "$pr_number" ]; then
            echo -e "${YELLOW}  ⚠️  No open PR found from '${current_branch}' to '${base_branch}'${NC}\n"
            ((skipped_count++))
            continue
        fi
        
        echo -e "${BLUE}  📋 Found PR #${pr_number}: ${current_branch} → ${base_branch}${NC}"
        
        # Get PR status
        pr_status=$(get_pr_status "$owner" "$repo_name" "$pr_number")
        if [ -z "$pr_status" ]; then
            echo -e "${RED}  ❌ Could not get PR status${NC}\n"
            ((error_count++))
            continue
        fi
        
        IFS=$'\t' read -r state mergeable merge_state_status is_draft <<< "$pr_status"
        
        # Check if PR is a draft
        if [ "$is_draft" = "true" ]; then
            echo -e "${YELLOW}  ⚠️  PR is a draft, skipping...${NC}\n"
            ((skipped_count++))
            continue
        fi
        
        # Check if PR is already merged or closed
        if [ "$state" != "OPEN" ]; then
            echo -e "${YELLOW}  ⚠️  PR is ${state}, skipping...${NC}\n"
            ((skipped_count++))
            continue
        fi
        
        # Check mergeability (mergeable can be "MERGEABLE", "CONFLICTING", or null)
        if [ "$mergeable" != "MERGEABLE" ]; then
            echo -e "${RED}  ❌ PR is not mergeable (status: ${merge_state_status:-unknown}, mergeable: ${mergeable:-null})${NC}"
            echo -e "${YELLOW}     This may be due to conflicts or failing checks${NC}\n"
            ((not_mergeable_count++))
            continue
        fi
        
        # Show PR URL
        pr_url=$(gh pr view "$pr_number" --repo "$owner/$repo_name" --json url --jq -r '.url' 2>/dev/null)
        echo -e "${CYAN}  🔗 $pr_url${NC}"
        
        if [ "$DRY_RUN" = true ]; then
            echo -e "${CYAN}  🔍 [DRY RUN] Would merge PR #${pr_number} using ${MERGE_METHOD} method${NC}\n"
            ((merged_count++))
        else
            # Merge PR
            echo -e "${BLUE}  🔀 Merging PR #${pr_number} using ${MERGE_METHOD} method...${NC}"
            
            merge_output=$(gh pr merge "$pr_number" \
                --repo "$owner/$repo_name" \
                --"$MERGE_METHOD" \
                --delete-branch=false \
                2>&1)
            
            merge_exit_code=$?
            
            if [ $merge_exit_code -eq 0 ]; then
                echo -e "${GREEN}  ✓ PR merged successfully!${NC}"
                ((merged_count++))
            else
                echo -e "${RED}  ❌ Failed to merge PR${NC}"
                echo -e "${RED}  Error: $merge_output${NC}"
                ((error_count++))
            fi
            echo ""
        fi
    done
    
    # Summary
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Summary:${NC}"
    if [ "$DRY_RUN" = true ]; then
        echo -e "${CYAN}  🔍 Would merge: ${merged_count}${NC}"
    else
        echo -e "${GREEN}  ✓ Merged: ${merged_count}${NC}"
    fi
    echo -e "${YELLOW}  ⚠️  Skipped: ${skipped_count}${NC}"
    echo -e "${RED}  ❌ Not mergeable: ${not_mergeable_count}${NC}"
    echo -e "${RED}  ❌ Errors: ${error_count}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Run main function
main
