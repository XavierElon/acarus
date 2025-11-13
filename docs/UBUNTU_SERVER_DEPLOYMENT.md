# 🚀 Ubuntu Server Deployment Guide

Complete guide to deploying your application to an Ubuntu server using GitHub Actions.

---

## 📊 Architecture Overview

```
GitHub Actions → Build Docker Images → Push to GHCR → SSH to Ubuntu Server → Pull Images → docker-compose up
```

**Flow:**

1. Push code to `dev` or `main` branch
2. GitHub Actions builds Docker images
3. Images pushed to GitHub Container Registry (GHCR)
4. GitHub Actions SSH into your Ubuntu server
5. Server pulls latest images from GHCR
6. docker-compose restarts services with new images

---

## 🎯 Prerequisites

Before starting, ensure you have:

- ✅ Ubuntu server (20.04+ or 22.04+ recommended)
- ✅ SSH access to your server
- ✅ GitHub repository with Actions enabled
- ✅ Docker and docker-compose installed on server
- ✅ Domain name (optional but recommended)

---

## 📋 Step-by-Step Setup

### Step 1: Prepare Your Ubuntu Server

SSH into your server:

```bash
ssh ubuntu@your-server-ip
```

#### Install Docker

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (replace 'ubuntu' with your username)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

#### Create Deployment Directory

```bash
# Create directory for your application
sudo mkdir -p /opt/receipt-processor
cd /opt/receipt-processor

# Clone your repository (or download docker-compose.yml)
git clone https://github.com/YOUR_USERNAME/acarus.git .

# OR just download docker-compose.yml
wget https://raw.githubusercontent.com/YOUR_USERNAME/acarus/main/docker-compose.yml
```

#### Create Environment File

```bash
# Create .env file
nano .env
```

Add the following (adjust values as needed):

```bash
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=receipt_db
POSTGRES_PORT=5439

# Redis
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# Backend
BACKEND_PORT=8000
RUST_LOG=info
JWT_SECRET=your-jwt-secret-generate-with-openssl-rand-base64-32

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://your-server-ip:8000
NEXTAUTH_URL=http://your-server-ip:3000
NEXTAUTH_SECRET=your-nextauth-secret-generate-with-openssl-rand-base64-32
```

**Generate secrets:**

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

#### Update docker-compose.yml for Production

The deployment script will automatically update `docker-compose.yml` to use GHCR images, but you can also manually update it:

```yaml
services:
  backend:
    image: ghcr.io/YOUR_USERNAME/acarus/receipt-processor:main
    # Remove or comment out the 'build:' section
    # build:
    #   context: ./receipt_processor
    #   dockerfile: Dockerfile

  frontend:
    image: ghcr.io/YOUR_USERNAME/acarus/receipt-processor-frontend:main
    # Remove or comment out the 'build:' section
    # build:
    #   context: ./frontend
    #   dockerfile: Dockerfile
```

---

### Step 2: Generate SSH Key for GitHub Actions

On your **local machine** (not the server):

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# This creates:
# ~/.ssh/github_actions_deploy (private key)
# ~/.ssh/github_actions_deploy.pub (public key)
```

#### Add Public Key to Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub ubuntu@your-server-ip

# OR manually add to server
cat ~/.ssh/github_actions_deploy.pub
# Then on server:
# mkdir -p ~/.ssh
# echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys
```

#### Test SSH Connection

```bash
# Test SSH with the new key
ssh -i ~/.ssh/github_actions_deploy ubuntu@your-server-ip
```

---

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Required Secrets

| Secret Name       | Value                                        | Description                 |
| ----------------- | -------------------------------------------- | --------------------------- |
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/github_actions_deploy`   | Your SSH private key        |
| `STAGING_HOST`    | `your-server-ip` or `staging.yourdomain.com` | Staging server IP/domain    |
| `PRODUCTION_HOST` | `your-server-ip` or `yourdomain.com`         | Production server IP/domain |

#### Optional Secrets (with defaults)

| Secret Name       | Value                    | Default                  | Description                    |
| ----------------- | ------------------------ | ------------------------ | ------------------------------ |
| `STAGING_USER`    | `ubuntu`                 | `ubuntu`                 | SSH username for staging       |
| `PRODUCTION_USER` | `ubuntu`                 | `ubuntu`                 | SSH username for production    |
| `SSH_PORT`        | `22`                     | `22`                     | SSH port                       |
| `DEPLOY_PATH`     | `/opt/receipt-processor` | `/opt/receipt-processor` | Deployment directory on server |

#### Application Secrets

| Secret Name           | Value                                                        | Description              |
| --------------------- | ------------------------------------------------------------ | ------------------------ |
| `JWT_SECRET`          | Generate with `openssl rand -base64 32`                      | Backend JWT secret       |
| `NEXTAUTH_SECRET`     | Generate with `openssl rand -base64 32`                      | Frontend NextAuth secret |
| `NEXT_PUBLIC_API_URL` | `http://your-server-ip:8000` or `https://api.yourdomain.com` | Backend API URL          |

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions, no need to add it manually.

---

### Step 4: Initial Server Setup

On your server, pull and start the services:

```bash
cd /opt/receipt-processor

# Login to GHCR (you'll need a GitHub Personal Access Token)
# Create token at: https://github.com/settings/tokens
# Scopes needed: read:packages
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull images
docker-compose pull

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

### Step 5: Test Deployment

#### Deploy to Staging

```bash
# Push to dev branch
git checkout dev
git push origin dev
```

Watch the deployment in GitHub Actions:

- Go to **Actions** tab in your repository
- Watch the "Backend CI/CD" and "Frontend CI/CD" workflows
- Check the "Deploy to Staging" jobs

#### Deploy to Production

```bash
# Push to main branch
git checkout main
git merge dev
git push origin main
```

---

## 🔧 Server Configuration

### Setup Reverse Proxy (Nginx)

Install Nginx:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create Nginx config `/etc/nginx/sites-available/receipt-processor`:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/receipt-processor /etc/nginx/sites-enabled/
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 🔍 Monitoring & Troubleshooting

### Check Service Status

```bash
# On server
cd /opt/receipt-processor
docker-compose ps
docker-compose logs -f
```

### View Deployment Logs

In GitHub Actions:

- Go to **Actions** tab
- Click on the workflow run
- Click on "Deploy to Staging" or "Deploy to Production"
- View the logs

### Common Issues

#### Deployment Fails: SSH Connection

**Problem:** Cannot connect to server

**Solution:**

```bash
# Test SSH manually
ssh -i ~/.ssh/github_actions_deploy ubuntu@your-server-ip

# Check SSH key format in GitHub secrets
# Should start with: -----BEGIN OPENSSH PRIVATE KEY-----
```

#### Deployment Fails: Docker Login

**Problem:** Cannot pull images from GHCR

**Solution:**

```bash
# On server, manually login
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Check token has read:packages scope
```

#### Services Not Starting

**Problem:** Containers exit immediately

**Solution:**

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check environment variables
docker-compose config

# Verify docker-compose.yml
cat docker-compose.yml
```

#### Images Not Updating

**Problem:** Old version still running

**Solution:**

```bash
# Force pull and recreate
docker-compose pull
docker-compose up -d --force-recreate

# Remove old images
docker image prune -a
```

---

## 🔄 Deployment Flow

### Staging (dev branch)

1. Developer pushes to `dev` branch
2. GitHub Actions runs tests
3. Builds Docker images
4. Pushes to GHCR with tag `dev`
5. SSH to staging server
6. Pulls `dev` tagged images
7. Restarts services

### Production (main branch)

1. Developer merges `dev` to `main` and pushes
2. GitHub Actions runs tests
3. Builds Docker images
4. Pushes to GHCR with tag `main` and `latest`
5. SSH to production server
6. Pulls `main` tagged images
7. Restarts services

---

## 📊 Branch Strategy

| Branch | Environment | Auto-Deploy | Image Tag        |
| ------ | ----------- | ----------- | ---------------- |
| `dev`  | Staging     | ✅ Yes      | `dev`            |
| `main` | Production  | ✅ Yes      | `main`, `latest` |

---

## 🔐 Security Best Practices

1. **Use strong passwords** for database and Redis
2. **Rotate secrets** regularly (JWT_SECRET, NEXTAUTH_SECRET)
3. **Limit SSH access** - use firewall rules
4. **Keep server updated** - `sudo apt update && sudo apt upgrade`
5. **Use SSL/TLS** - Always use HTTPS in production
6. **Monitor logs** - Set up log aggregation
7. **Backup database** - Regular automated backups

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Docker and docker-compose installed on server
- [ ] SSH key configured and tested
- [ ] GitHub secrets configured
- [ ] Environment variables set in `.env` file
- [ ] Initial deployment tested on staging
- [ ] Nginx reverse proxy configured
- [ ] SSL certificates obtained
- [ ] Database migrations run
- [ ] Health checks working
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎉 Success!

Once everything is set up:

- ✅ **Staging**: Auto-deploys on push to `dev`
- ✅ **Production**: Auto-deploys on push to `main`
- ✅ **Images**: Stored in GHCR
- ✅ **SSL**: Secured with Let's Encrypt
- ✅ **Monitoring**: Logs available in GitHub Actions

**Your app is now live!** 🚀
