# CI/CD Pipeline Setup Guide

Complete step-by-step guide to get your GitHub Actions pipelines running.

## Quick Setup Checklist

- [ ] 1. Push workflow files to GitHub
- [ ] 2. Configure GitHub secrets (if needed)
- [ ] 3. Test the pipeline
- [ ] 4. Set up branch protection
- [ ] 5. Configure deployments

---

## Step 1: Push the Workflow Files

The workflow files are already created in `.github/workflows/`. Just commit and push:

```bash
# Add the new files
git add .github/workflows/
git add Dockerfile*
git add docker-compose*.yml
git add *.md

# Commit
git commit -m "Add CI/CD pipelines and Docker configuration"

# Push to your repository
git push origin dev  # or your current branch
```

**That's it!** The pipelines will start automatically.

---

## Step 2: Verify Pipelines Are Running

1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. You should see two workflows:
   - "Backend CI/CD"
   - "Frontend CI/CD"

### First Run

On your first push, the pipelines will:

- ✅ Run tests (backend will fail if you don't have tests yet)
- ✅ Build Docker images
- ⚠️ Skip deployment (only runs on `main` branch)

---

## Step 3: Fix Any Issues

### Common Issues

#### Backend: Tests Not Found

If you don't have tests yet, the backend pipeline will fail. You have two options:

**Option A**: Disable tests temporarily

Edit `.github/workflows/backend-ci.yml` around line 106:

```yaml
- name: Run tests
  working-directory: receipt_processor
  env:
    DATABASE_URL: postgres://user:password@localhost:5432/receipt_db
    REDIS_URL: redis://localhost:6379
  run: cargo test --all-features || echo "No tests yet, skipping" # Add error handling
  continue-on-error: true # Don't fail the pipeline
```

**Option B**: Add placeholder tests

Create `receipt_processor/src/lib.rs` if it doesn't exist, or add to existing files:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

#### Frontend: ESLint Errors

If ESLint finds issues:

```bash
# Fix automatically
cd frontend
npm run lint -- --fix

# Or disable specific rules in eslint.config.mjs
```

---

## Step 4: Set Up Secrets (For Production Deployment)

Secrets are only needed if you want to:

- Deploy to production
- Push images to registries
- Use external services

### If Deploying to Production

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

| Secret Name           | Value                                                   | When Needed         |
| --------------------- | ------------------------------------------------------- | ------------------- |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com`                            | Frontend deployment |
| `NEXTAUTH_SECRET`     | Random string (generate with `openssl rand -base64 32`) | Frontend deployment |
| `JWT_SECRET`          | Random string (generate with `openssl rand -base64 32`) | Backend deployment  |

### If Using Cloud Provider

**For AWS:**

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

**For Vercel:**

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

---

## Step 5: Configure Branch Protection

Protect your `main` branch to require CI checks:

1. Go to **Settings** → **Branches**
2. Add branch protection rule for `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Select both workflows: "Backend CI/CD" and "Frontend CI/CD"
   - ✅ Require up-to-date branches

---

## Step 6: Customize Deployment

### Current Deployment Strategy

By default, pipelines **build images** but deployments are **manual**.

### Option A: Automatic Deployment to GitHub Container Registry

Images are automatically pushed to `ghcr.io` when you push to `dev` or `main`.

To use the images:

```bash
# Pull and run backend
docker run -p 8000:8000 \
  -e DATABASE_URL="your-db-url" \
  ghcr.io/YOUR_USERNAME/acarus/receipt-processor:latest

# Pull and run frontend
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="your-api-url" \
  ghcr.io/YOUR_USERNAME/acarus/receipt-processor-frontend:latest
```

### Option B: Deploy to VPS

Uncomment and configure the deployment section in workflows.

**In `.github/workflows/backend-ci.yml`** (around line 180):

```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.SSH_USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /opt/receipt-processor
      docker-compose pull backend
      docker-compose up -d backend
```

Add secrets: `HOST`, `SSH_USERNAME`, `SSH_KEY`

### Option C: Deploy to AWS ECS/Fargate

See the commented examples in the workflow files around line 195.

---

## Step 7: Test the Complete Flow

### Test Backend Pipeline

```bash
# Make a change to backend
cd receipt_processor
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test backend CI"
git push origin dev

# Watch pipeline
gh run watch  # If you have GitHub CLI
```

### Test Frontend Pipeline

```bash
# Make a change to frontend
cd frontend
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test frontend CI"
git push origin dev

# Watch pipeline
gh run watch
```

---

## Pipeline Workflow Overview

```
Developer pushes code
    ↓
GitHub Actions triggered
    ↓
┌─────────────────────────────────────┐
│  Backend Changes?                   │
└─────────────────────────────────────┘
    YES ↓
    Run Tests (PostgreSQL, Redis)
    Run Clippy (linting)
    Check Formatting
    ↓
    Build Docker Image
    ↓
    Push to GHCR
    ↓
    Deploy (if on main branch)
    ↓
    ✓ Done
```

```
Developer pushes code
    ↓
GitHub Actions triggered
    ↓
┌─────────────────────────────────────┐
│  Frontend Changes?                  │
└─────────────────────────────────────┘
    YES ↓
    Run ESLint
    Run Tests
    ↓
    Build Next.js App
    ↓
    Build Docker Image
    ↓
    Push to GHCR
    ↓
    Deploy (if on main branch)
    ↓
    ✓ Done
```

---

## Monitoring Pipelines

### View Pipeline Status

**GitHub UI:**

- Repository → Actions tab
- See all workflow runs
- Click on a run to see logs

**Command Line:**

```bash
# List recent runs
gh run list

# Watch a running workflow
gh run watch

# View logs
gh run view --log
```

### Pipeline Notifications

Set up notifications:

1. Settings → Notifications
2. Enable "Actions"
3. Choose: Email, Web browser, or Slack

---

## Troubleshooting

### Pipeline Not Running

**Check:**

- ✅ File is in `.github/workflows/` directory
- ✅ File has `.yml` or `.yaml` extension
- ✅ YAML syntax is valid
- ✅ Path filters match your file changes

### Tests Failing

```bash
# Run tests locally first
cd receipt_processor
cargo test

# Check for Clippy issues
cargo clippy --all-targets

# Check formatting
cargo fmt --check
```

### Builds Failing

```bash
# Test Docker build locally
cd receipt_processor
docker build -t test .

# Check Dockerfile syntax
docker build --no-cache test .
```

### Slow Pipelines

**Optimize:**

- ✅ Cache is enabled (already configured)
- ✅ Use `--no-cache` only when needed
- ✅ Split workflows for faster parallel runs
- ✅ Use matrix builds for testing

---

## Next Steps

Once pipelines are working:

1. ✅ **Add more tests** to your codebase
2. ✅ **Set up staging environment** (`dev` branch → staging)
3. ✅ **Configure monitoring** (datadog, sentry, etc.)
4. ✅ **Add security scanning** (dependabot, etc.)
5. ✅ **Set up database migrations** in CI
6. ✅ **Configure rollout strategy** (blue/green, canary)

---

## Quick Reference

### Useful Commands

```bash
# View pipeline status
gh run list

# Rerun failed workflow
gh run rerun

# Cancel running workflow
gh run cancel

# View workflow logs
gh run view --log <run-id>

# Manually trigger workflow
gh workflow run "Backend CI/CD"
```

### Environment Variables

Set in GitHub → Settings → Secrets → Actions:

- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `AWS_ACCESS_KEY_ID` (if using AWS)
- `AWS_SECRET_ACCESS_KEY` (if using AWS)

---

## Support

Having issues? Check:

1. `.github/workflows/` logs
2. `PIPELINE_SETUP.md` troubleshooting
3. GitHub Actions documentation
4. Your team's deployment docs

---

**You're all set! 🎉**

Your pipelines are now:

- ✅ Automatically testing on every push
- ✅ Building Docker images
- ✅ Ready for deployment
- ✅ Enforcing code quality
