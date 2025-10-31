# 🚀 Deployment Guide: Dev & Production Pipelines

Complete guide to deploying your application to actual servers.

## 📊 Current Setup

Your pipelines already support branch-based deployment:

| Branch | Environment | When It Deploys |
|--------|-------------|----------------|
| `dev` | **Staging** | Every push to `dev` |
| `main` | **Production** | Every push to `main` |

---

## 🎯 Deployment Options

Choose based on your hosting needs:

### Option 1: VPS/Server (Recommended for Beginners)
- Deploy to any Ubuntu server
- Uses Docker & docker-compose
- Full control, cost-effective
- Best for: Small to medium apps

### Option 2: AWS/GCP/Azure
- Cloud-managed services
- Auto-scaling, load balancing
- Higher complexity & cost
- Best for: Large-scale applications

### Option 3: Platform-as-a-Service
- Vercel (frontend)
- Railway/Render
- Easiest setup
- Best for: Quick deployment

---

## 📋 Prerequisites for All Options

Before deploying, you need:

1. **GitHub Secrets** - Configure in Settings → Secrets → Actions
2. **Domain Name** (optional but recommended)
3. **SSL Certificate** (Let's Encrypt is free)
4. **Server/Hosting Account**

---

## Option 1: Deploy to VPS (Ubuntu/Debian Server)

**Best for**: You have a server with an IP address

### Step 1: Get Your Server Details

You need:
- Server IP: `123.45.67.89` (example)
- SSH access
- Ubuntu 20.04+ or Debian 11+

### Step 2: Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value | Example |
|--------|-------|---------|
| `DEPLOY_HOST` | Your server IP | `123.45.67.89` |
| `DEPLOY_USER` | SSH username | `ubuntu` or `deploy` |
| `SSH_PRIVATE_KEY` | Your SSH private key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PRODUCTION_DATABASE_URL` | Prod database URL | `postgres://user:pass@db:5432/db` |
| `NEXT_PUBLIC_API_URL` | Your backend URL | `https://api.yourdomain.com` |
| `NEXTAUTH_SECRET` | Random secret | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | Random secret | Generate with `openssl rand -base64 32` |

**Generate SSH key** (if needed):
```bash
ssh-keygen -t ed25519 -C "deploy@github"
# Copy ~/.ssh/id_ed25519.pub to server's authorized_keys
# Copy ~/.ssh/id_ed25519 content to GitHub secret SSH_PRIVATE_KEY
```

### Step 3: Install Docker on Server

SSH into your server:

```bash
ssh ubuntu@123.45.67.89

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Test
docker --version
docker-compose --version
```

### Step 4: Update GitHub Workflows

Edit `.github/workflows/backend-ci.yml` and uncomment/add the deployment section:

```yaml
  deploy-dev:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/dev' && github.event_name == 'push'
    environment:
      name: staging
      url: http://${{ secrets.DEPLOY_HOST }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/receipt-processor
            docker-compose pull backend
            docker-compose up -d backend
            docker system prune -f

  deploy-prod:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: http://${{ secrets.DEPLOY_HOST }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/receipt-processor
            docker-compose pull backend
            docker-compose up -d backend
            docker system prune -f
```

Do the same for `.github/workflows/frontend-ci.yml`.

### Step 5: Setup Server Directory

On your server, create the deployment directory:

```bash
ssh ubuntu@123.45.67.89

# Create app directory
sudo mkdir -p /opt/receipt-processor
cd /opt/receipt-processor

# Clone your repo (or just create docker-compose.yml)
git clone https://github.com/YOUR_USERNAME/acarus.git .
# OR
# Just download docker-compose.yml
wget https://raw.githubusercontent.com/YOUR_USERNAME/acarus/dev/docker-compose.yml

# Create .env file
nano .env
```

**Add to `.env`**:
```bash
DATABASE_URL=postgres://user:password@postgres:5432/receipt_db
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=your-jwt-secret-from-github-secrets
NEXT_PUBLIC_API_URL=http://123.45.67.89:8000
NEXTAUTH_SECRET=your-nextauth-secret-from-github-secrets
```

### Step 6: Initial Deployment

```bash
# Pull images and start
docker-compose pull
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 7: Setup Reverse Proxy (Nginx)

Install Nginx:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create config `/etc/nginx/sites-available/receipt-processor`:

```nginx
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/receipt-processor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Get SSL:
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Step 8: Push to Deploy!

```bash
# Deploy to staging
git checkout dev
git push origin dev

# Deploy to production
git checkout main
git merge dev
git push origin main
```

---

## Option 2: Deploy to AWS (ECS/Fargate)

### Prerequisites
- AWS account
- AWS CLI configured

### Setup ECS

1. Create ECR repositories
2. Create ECS cluster
3. Create task definitions
4. Configure load balancer

### Update GitHub Workflows

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Login to ECR
  uses: aws-actions/amazon-ecr-login@v2

- name: Push to ECR
  run: |
    docker tag ghcr.io/${{ github.repository }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
      YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/receipt-processor:${{ github.sha }}
    docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/receipt-processor:${{ github.sha }}

- name: Deploy to ECS
  run: |
    aws ecs update-service \
      --cluster receipt-processor-cluster \
      --service receipt-processor-service \
      --force-new-deployment
```

Add secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

---

## Option 3: Deploy to Vercel (Frontend Only)

### Setup Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel login`
3. Get token from vercel.com/account/tokens

### Update Frontend Workflow

```yaml
vercel-deploy:
  name: Deploy to Vercel
  runs-on: ubuntu-latest
  needs: docker-build
  if: github.ref == 'refs/heads/dev' && github.event_name == 'push'
  environment:
    name: staging
    url: https://your-app-xyz.vercel.app

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Install Vercel CLI
      run: npm install --global vercel@latest

    - name: Pull Vercel Environment Information
      working-directory: frontend
      run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

    - name: Build Project Artifacts
      working-directory: frontend
      run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

    - name: Deploy Project Artifacts to Vercel
      working-directory: frontend
      run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
```

Add secret: `VERCEL_TOKEN`

---

## 🔐 Setting Up GitHub Environments

For better secret management:

1. Go to **Settings → Environments**
2. Create environments: `staging`, `production`
3. Add environment-specific secrets
4. Set protection rules

Update workflows to use:
```yaml
environment:
  name: production  # Uses production secrets
  url: https://yourdomain.com
```

---

## 🧪 Testing Deployment

### Before Production

1. ✅ Test on staging (dev branch)
2. ✅ Check all endpoints work
3. ✅ Verify database migrations
4. ✅ Test SSL certificates
5. ✅ Check monitoring/logs

### Deployment Checklist

- [ ] All tests passing
- [ ] Secrets configured
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rollback plan ready

---

## 🔄 Rollback Strategy

### Quick Rollback

```bash
# SSH into server
ssh ubuntu@123.45.67.89

# Stop current version
cd /opt/receipt-processor
docker-compose down

# Checkout previous version
git checkout <previous-commit-hash>

# Start old version
docker-compose up -d
```

### In GitHub

1. Go to Actions → Workflow runs
2. Find successful previous deployment
3. Click "Re-run jobs"
4. Or revert commit and push

---

## 📊 Monitoring

### Essential Monitoring

1. **Health Checks**: Set up `/health` endpoint monitoring
2. **Logs**: `docker-compose logs -f`
3. **Metrics**: Consider DataDog, New Relic, or Prometheus
4. **Uptime**: Use UptimeRobot or Pingdom

### GitHub Actions Monitoring

- Go to Actions tab
- Watch deployments
- Set up notification rules
- Enable status checks

---

## 🆘 Troubleshooting

### Deployment Fails

**Check**:
```bash
# On server
docker-compose logs -f
docker ps -a
docker logs receipt-backend
docker logs receipt-frontend
```

**Common issues**:
- Wrong environment variables
- Database connection issues
- Port conflicts
- Missing dependencies

### Images Not Updating

```bash
# Force pull
docker-compose pull --force
docker-compose up -d --force-recreate
```

### Permission Errors

```bash
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
```

---

## 📚 Additional Resources

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [GitHub Actions Deployment](https://docs.github.com/en/actions/deployment)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Let's Encrypt](https://letsencrypt.org/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)

---

## 🎉 Success!

Once deployed, you'll have:

- ✅ Staging environment on `dev` branch
- ✅ Production environment on `main` branch
- ✅ Automatic deployments
- ✅ SSL certificates
- ✅ Health monitoring
- ✅ Easy rollbacks

**Your app is now live!** 🚀

