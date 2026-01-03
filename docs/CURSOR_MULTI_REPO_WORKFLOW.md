# Working with Multiple Git Repos in Cursor

## How Cursor Handles Multiple Repositories

Cursor (like VS Code) primarily detects the git repository at the **workspace root level**. With your current structure:

```
acarus/                          # Infrastructure repo (workspace root)
├── .git/                        # Cursor will detect this
├── frontend/.git/               # Nested repo (may not show in Source Control)
└── backend/.git/                # Nested repo (may not show in Source Control)
```

### What You'll See in Source Control

- ✅ **Infrastructure repo** - Will appear in Source Control tab
- ⚠️ **Frontend repo** - Typically won't appear automatically
- ⚠️ **Backend repo** - Typically won't appear automatically

## Solutions

### Option 1: Use Git Command Line (Recommended)

The simplest approach is to use the terminal for each repo:

```bash
# Work on infrastructure
cd /Users/xavierelon/coding/amazon/acarus
git status
git add .
git commit -m "Update infrastructure"
git push

# Work on frontend
cd frontend
git status
git add .
git commit -m "Frontend changes"
git push

# Work on backend
cd ../backend
git status
git add .
git commit -m "Backend changes"
git push
```

### Option 2: Open Folders in Separate Windows/Tabs

Open each repository as a separate workspace:

1. **File → Open Folder** → Select `acarus/` (for infrastructure)
2. **File → Open Folder** → Select `acarus/frontend/` (for frontend)
3. **File → Open Folder** → Select `acarus/backend/` (for backend)

Each will show its own Source Control tab.

### Option 3: Use Git Extensions

Install a Git extension that better handles multi-repo workspaces:

- **Git Graph** - Visual git history
- **GitLens** - Enhanced Git capabilities

### Option 4: Add Workspace Folders (Multi-root Workspace)

You can create a multi-root workspace configuration:

1. **File → Save Workspace As...** → Save as `acarus.code-workspace`
2. Edit the workspace file to include all repos:

```json
{
  "folders": [
    {
      "name": "Infrastructure",
      "path": "."
    },
    {
      "name": "Frontend",
      "path": "./frontend"
    },
    {
      "name": "Backend",
      "path": "./backend"
    }
  ],
  "settings": {
    // Workspace settings
  }
}
```

This may help, but Source Control still typically shows only the root repo.

### Option 5: Use Git Aliases for Quick Access

Create git aliases in your `~/.gitconfig`:

```bash
[alias]
    infra = !cd /Users/xavierelon/coding/amazon/acarus && git
    fe = !cd /Users/xavierelon/coding/amazon/acarus/frontend && git
    be = !cd /Users/xavierelon/coding/amazon/acarus/backend && git
```

Then use:

```bash
git infra status    # Infrastructure repo
git fe status       # Frontend repo
git be status       # Backend repo
```

## Recommended Workflow

For your multi-repo setup, I recommend:

1. **Use Cursor's Source Control for infrastructure** (workspace root)
2. **Use terminal for service repos** (frontend/backend)
3. **Use separate Cursor windows** if you need visual git UI for services

This approach:

- ✅ Keeps things simple
- ✅ Works reliably
- ✅ Matches the independent nature of your repos
- ✅ No special configuration needed

## Quick Terminal Commands

Since you'll frequently switch between repos, here are helpful commands:

```bash
# From workspace root, quickly check all repos
echo "=== Infrastructure ===" && git status --short && \
echo "=== Frontend ===" && cd frontend && git status --short && \
echo "=== Backend ===" && cd ../backend && git status --short && cd ..

# Or create a helper script
cat > check-all-repos.sh << 'EOF'
#!/bin/bash
echo "=== Infrastructure ==="
git status --short
echo ""
echo "=== Frontend ==="
cd frontend && git status --short && cd ..
echo ""
echo "=== Backend ==="
cd backend && git status --short && cd ..
EOF
chmod +x check-all-repos.sh
```

## Summary

**Short Answer**: Cursor's Source Control tab will show only the infrastructure repo (workspace root), not the nested frontend and backend repos.

**Best Practice**: Use terminal commands for service repos and Cursor's Source Control for infrastructure files. This aligns with treating each repo independently.
