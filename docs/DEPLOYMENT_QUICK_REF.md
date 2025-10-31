# 🚀 Quick Reference: Deploy to Production

One-page cheat sheet for deploying your application.

---

## 📊 Deployment Flow

```
dev branch →  Push  →  GitHub Actions  →  Staging Server  →  staging.yourdomain.com
                                                                    ↓
                                                               Manual Approval
                                                                    ↓
main branch →  Push  →  GitHub Actions  →  Production Server  →  yourdomain.com
```

---

## 🎯 Branch Strategy

| Branch | Environment | Auto-Deploy | URL |
|--------|-------------|-------------|-----|
| `dev` | **Staging** | ✅ Yes | staging.yourdomain.com |
| `main` | **Production** | ✅ Yes | yourdomain.com |

---

## 🔧 Most Common: Deploy to VPS (Ubuntu Server)

### Step 1: Configure Secrets

GitHub → **Settings → Secrets → Actions** → Add:

```
STAGING_HOST=staging.yourdomain.com
STAGING_USER=ubuntu
PRODUCTION_HOST=yourdomain.com
PRODUCTION_USER=ubuntu
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
JWT_SECRET=<generate with: openssl rand -base64 32>
```

### Step 2: Enable Deployment in Workflows

**Uncomment these sections in your workflow files:**

`.github/workflows/backend-ci.yml` (lines ~175-186):
```yaml
- name: Deploy to staging server via SSH
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.STAGING_HOST }}
    username: ${{ secrets.STAGING_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /opt/receipt-processor-staging
      docker-compose pull backend
      docker-compose up -d backend
```

Do the same in `frontend-ci.yml`.

### Step 3: Setup Server

```bash
ssh ubuntu@yourdomain.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Install Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/receipt-processor-staging /opt/receipt-processor
cd /opt/receipt-processor-staging
git clone https://github.com/YOUR_USERNAME/acarus.git .
cp .env.example .env
# Edit .env with your values
```

### Step 4: Deploy!

```bash
# Deploy to staging
git push origin dev

# Deploy to production
git push origin main
```

---

## 🌐 Setup Domain & SSL

### 1. Point DNS to Your Server

```
A Record:  yourdomain.com       →  123.45.67.89
A Record:  api.yourdomain.com   →  123.45.67.89
A Record:  staging.yourdomain.com →  123.45.67.89
```

### 2. Install Nginx

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 3. Create Config

`/etc/nginx/sites-available/receipt-processor`:
```nginx
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### 4. Enable & Get SSL

```bash
sudo ln -s /etc/nginx/sites-available/receipt-processor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## ⚡ Alternative Platforms

### Railway (Easiest!)

1. Connect GitHub repo to Railway
2. Add environment variables
3. Auto-deploy on push ✨

### Vercel (Frontend)

1. Connect repo to Vercel
2. Set `VERCEL_TOKEN` secret in GitHub
3. Uncomment Vercel section in workflow
4. Auto-deploy! ✨

### AWS ECS (Scalable)

1. Create ECR repositories
2. Create ECS cluster & services
3. Set AWS secrets in GitHub
4. Uncomment AWS section in workflow
5. Deploy! ✨

---

## 🔍 Verify Deployment

```bash
# Check staging
curl http://staging.yourdomain.com/api/health

# Check production
curl https://yourdomain.com/api/health

# Check logs
ssh ubuntu@yourdomain.com
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Deployment Fails

```bash
# SSH into server
ssh ubuntu@yourdomain.com

# Check logs
docker-compose logs -f
docker ps -a

# Restart services
docker-compose restart
```

### No Updates Showing

```bash
# Force pull latest images
docker-compose pull --force
docker-compose up -d --force-recreate
```

### Permission Errors

```bash
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📋 Deployment Checklist

Before going to production:

- [ ] All tests passing
- [ ] Secrets configured
- [ ] DNS pointing to server
- [ ] SSL certificates valid
- [ ] Database migrations run
- [ ] Health checks working
- [ ] Logs being monitored
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Team notified

---

## 🎉 Success!

Once deployed:

✅ **Staging**: `http://staging.yourdomain.com`  
✅ **Production**: `https://yourdomain.com`  
✅ **Auto-deploy** on every push  
✅ **SSL** secured  
✅ **Monitoring** active  

**Your app is live!** 🚀

---

## 📚 Full Guides

- **Complete Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Pipeline Setup**: [PIPELINE_SETUP.md](PIPELINE_SETUP.md)
- **Quick Start**: [QUICK_START_CI.md](QUICK_START_CI.md)

