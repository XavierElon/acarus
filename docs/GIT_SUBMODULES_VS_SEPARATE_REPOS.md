# Git Submodules vs Separate Repos: Which Should You Use?

## What Are Git Submodules?

Git submodules allow you to include one git repository as a subdirectory inside another git repository. The parent repository tracks a specific commit of the child repository.

## Structure Comparison

### Approach 1: Separate Repos Side-by-Side (Current Setup)

```
acarus/                          # Workspace (NOT a git repo)
├── frontend/                    # Separate git repo
│   └── .git/
├── receipt_processor/           # Separate git repo
│   └── .git/
└── docker-compose.yml
```

**How it works:**

- Each service is an independent git repository
- No parent repository
- You `cd` into each directory to run git commands
- Completely independent version control

### Approach 2: Git Submodules

```
acarus/                          # Parent git repo
├── .git/
├── .gitmodules                  # Submodule configuration
├── frontend/                    # Git submodule (separate repo)
│   └── .git/ (as submodule)
├── receipt_processor/           # Git submodule (separate repo)
│   └── .git/ (as submodule)
└── docker-compose.yml
```

**How it works:**

- Parent repository tracks which commit each submodule is on
- Submodules are separate repos but linked to parent
- You can clone parent and all submodules together
- Version control is shared between parent and submodules

## Detailed Comparison

### Separate Repos (Current Approach) ✅

**Pros:**

- ✅ **Simplicity**: No special git commands needed, just normal git
- ✅ **Complete Independence**: Each service is truly independent
- ✅ **Easy Mental Model**: Just separate repos in a folder
- ✅ **No Submodule Complexity**: No need to learn submodule commands
- ✅ **Easy to Add/Remove**: Just create/delete directories
- ✅ **CI/CD Simplicity**: Each repo's CI/CD is completely independent

**Cons:**

- ❌ **No Unified Versioning**: Can't easily track "which versions work together"
- ❌ **Manual Cloning**: Need to clone each repo separately
- ❌ **No Atomic Updates**: Can't update all services to compatible versions atomically

**When to Use:**

- Multiple independent services (like microservices)
- Different teams owning different services
- Services that evolve independently
- When you don't need to track compatible versions together

### Git Submodules ✅

**Pros:**

- ✅ **Unified Cloning**: `git clone --recursive` gets everything
- ✅ **Version Tracking**: Parent repo can track compatible versions of submodules
- ✅ **Atomic Updates**: Update all submodules together
- ✅ **Single Repository URL**: One URL to share the whole workspace
- ✅ **Version Pinning**: Lock submodules to specific commits

**Cons:**

- ❌ **Complexity**: Special git commands (`git submodule update`, `git submodule foreach`, etc.)
- ❌ **Easy to Get Out of Sync**: Submodules can be in detached HEAD state
- ❌ **Learning Curve**: Developers need to understand submodule workflow
- ❌ **CI/CD Complexity**: Need to handle submodules in CI/CD pipelines
- ❌ **Not True Independence**: Submodules are linked to parent repo

**When to Use:**

- Services that need to be versioned together
- You want to track "which versions work together" in one place
- Sharing a complete workspace setup with one URL
- Library dependencies that are also separate repos
- When you need atomic version updates across services

## Example Workflows

### Separate Repos (Current)

**Daily Work:**

```bash
# Work on frontend
cd frontend
git status
git commit -m "Frontend changes"
git push

# Work on backend
cd ../receipt_processor
git status
git commit -m "Backend changes"
git push
```

**Cloning:**

```bash
# Clone each separately
git clone <frontend-repo> frontend
git clone <backend-repo> receipt_processor
```

### Git Submodules

**Initial Setup:**

```bash
# In parent repo
git submodule add <frontend-repo-url> frontend
git submodule add <backend-repo-url> receipt_processor
git commit -m "Add submodules"
```

**Daily Work:**

```bash
# Work on frontend
cd frontend
git checkout main
git pull
# Make changes
git commit -m "Frontend changes"
git push

# Update parent repo to track new commit
cd ..
git add frontend
git commit -m "Update frontend submodule"
git push
```

**Cloning:**

```bash
# Clone parent and all submodules
git clone --recursive <parent-repo-url> acarus

# Or clone parent first, then init submodules
git clone <parent-repo-url> acarus
cd acarus
git submodule update --init --recursive
```

**Updating All Submodules:**

```bash
# Update all submodules to latest
git submodule update --remote

# Or update each individually
git submodule foreach git pull origin main
```

## Recommendation for Your Use Case

For **multiple independent services** (like frontend and backend microservices), **separate repos side-by-side** (current approach) is usually better because:

1. ✅ **Services are Independent**: Frontend and backend don't need to be versioned together
2. ✅ **Simpler Workflow**: Your team doesn't need to learn submodule commands
3. ✅ **Independent Deployment**: Each service deploys on its own schedule
4. ✅ **Team Autonomy**: Different teams can work on different services without coordination
5. ✅ **CI/CD Simplicity**: Each service's CI/CD is independent

**Use Git Submodules If:**

- You want to share the entire workspace with one URL
- You need to track "known good combinations" of service versions
- Services must be updated together atomically
- You're treating services more like library dependencies

## Migration: Separate Repos → Submodules

If you want to switch to submodules later, you can:

```bash
# 1. Initialize parent repo at workspace root
cd /Users/xavierelon/coding/amazon/acarus
git init
git add docker-compose.yml README.md docs/ .github/ .cursor/ docker-compose*
git commit -m "Initial workspace setup"

# 2. Add existing repos as submodules
git submodule add <frontend-repo-url> frontend
git submodule add <backend-repo-url> receipt_processor

# 3. Commit submodule configuration
git add .gitmodules
git commit -m "Add service submodules"
```

## Migration: Submodules → Separate Repos

If you have submodules and want to switch to separate repos:

```bash
# 1. Remove submodule configuration
git submodule deinit -f frontend
git rm frontend
git rm receipt_processor

# 2. Keep the directories (they're now just folders)
# Each still has its .git directory, so they're independent repos
```

## Conclusion

**For your use case** (independent microservices), the **separate repos approach** is recommended. Git submodules are powerful but add complexity that you may not need. You can always migrate to submodules later if you find you need to track compatible versions together.
