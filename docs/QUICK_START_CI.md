# 🚀 Quick Start: Setup CI/CD in 5 Minutes

Get your GitHub Actions pipelines running right now!

## Step 1: Commit and Push (2 minutes)

```bash
# Make sure you're in the project root
cd /Users/xavierelon/coding/amazon/acarus

# Add all the new CI/CD files
git add .github/workflows/
git add Dockerfile*
git add docker-compose*.yml
git add *.md
git add receipt_processor/src/lib.rs

# Commit
git commit -m "Add CI/CD pipelines and Docker setup"

# Push to GitHub
git push origin dev  # or your current branch
```

That's it! 🎉

---

## Step 2: Watch It Work (1 minute)

1. Go to https://github.com/YOUR_USERNAME/acarus (replace YOUR_USERNAME)
2. Click on the **"Actions"** tab
3. You'll see two workflows running:
   - ✅ Backend CI/CD
   - ✅ Frontend CI/CD

**Wait 2-3 minutes** for them to complete.

---

## Step 3: Check Results (30 seconds)

Click on each workflow run to see:

- ✅ Tests (basic tests will pass)
- ✅ Build Docker images
- ✅ Push to GitHub Container Registry

**Both should have green checkmarks!** ✅

---

## Troubleshooting

### Pipeline Fails on Tests?

The basic test I added should pass. If not:

```bash
# Test locally first
cd receipt_processor
cargo test

# If it fails, the lib.rs file might not be included
# Check main.rs includes it
```

### Want to Skip Tests for Now?

Edit `.github/workflows/backend-ci.yml` line 99:

```yaml
- name: Run tests
  working-directory: receipt_processor
  env:
    DATABASE_URL: postgres://user:password@localhost:5432/receipt_db
    REDIS_URL: redis://localhost:6379
  run: cargo test --all-features || echo "Tests skipped" # Won't fail pipeline
  continue-on-error: true # Add this line
```

### Pipeline Doesn't Appear?

Make sure you:

1. Pushed to GitHub (not just committed locally)
2. Files are in `.github/workflows/` directory
3. Checked the right repository on GitHub

---

## What Happens Next?

Every time you push code:

- ✅ Tests run automatically
- ✅ Code is linted
- ✅ Docker images are built
- ✅ Images are pushed to `ghcr.io`

**No manual steps needed!**

---

## Next Steps

Once it's working:

1. ✅ Read `PIPELINE_SETUP.md` for advanced configuration
2. ✅ Read `DEPLOYMENT_QUICK_REF.md` to deploy to actual servers
3. ✅ Read `DEPLOYMENT_GUIDE.md` for complete deployment guide
4. ✅ Add more tests to your codebase
5. ✅ Configure secrets for production deployment

---

## Quick Reference

**View pipelines:**

```bash
gh run list  # If you have GitHub CLI
```

**Watch a specific run:**

```bash
gh run watch
```

**Rerun a failed workflow:**

```bash
gh run rerun
```

---

**You're done! Your CI/CD is now active! 🎉**
