# Deployment Guide

This guide covers deploying the Receipt Processor application (backend and frontend) using Docker and CI/CD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Tilt vs Docker Compose](#tilt-vs-docker-compose)
- [Docker Deployment](#docker-deployment)
- [CI/CD Setup](#cicd-setup)
- [Production Deployment](#production-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### Required Software

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git** (for version control)

### For Production

- **Container Registry** (GitHub Container Registry, Docker Hub, AWS ECR, etc.)
- **Hosting Platform** (AWS, GCP, Azure, DigitalOcean, etc.)
- **Domain Name** (optional)
- **SSL Certificate** (Let's Encrypt or commercial)

## Local Development

### Quick Start with Docker Compose

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd acarus
   ```

2. **Set up environment variables**

   ```bash
   cp docker-compose.env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   docker-compose exec postgres psql -U user -d receipt_db -f /docker-entrypoint-initdb.d/001_create_receipts_table.sql
   # Repeat for all migration files
   ```

5. **Verify services are running**

   ```bash
   docker-compose ps
   ```

6. **Access the application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Backend Health: http://localhost:8000/health
   - PostgreSQL: localhost:5439
   - Redis: localhost:6379

## Tilt vs Docker Compose

This project provides **two complementary options** for local development:

### Tilt (Recommended for Active Development)

**Purpose**: Optimized for developer productivity with hot reloading and live updates

**Use when**:

- Actively writing code
- Need instant feedback on changes
- Want auto-rebuild on file changes
- Prefer simplified commands

**Start development**:

```bash
tilt up
```

**What it does**:

- Runs PostgreSQL and Redis as services
- Runs backend with `cargo run` (hot reload)
- Runs frontend with `bun run dev` (hot reload)
- Provides unified UI for logs
- Auto-rebuilds on code changes

**Note**: Your current Tiltfile only sets up database services. The backend/frontend resources are commented out.

### Docker Compose (Recommended for CI/CD & Production-like)

**Purpose**: Production-like containerized environment

**Use when**:

- Testing Docker builds
- Validating production setup
- Preparing for deployment
- Team members prefer Docker
- CI/CD pipeline testing

**Start services**:

```bash
docker-compose up
```

**What it does**:

- Runs all services in containers
- Builds Docker images
- Mimics production environment
- Includes pgAdmin and Redis Insight
- Easier to share with team

### Quick Comparison

| Feature         | Tilt                  | Docker Compose         |
| --------------- | --------------------- | ---------------------- |
| Hot Reload      | ✅ Yes                | ❌ No (rebuild needed) |
| Build Time      | Fast (no image build) | Slower (image build)   |
| Production-like | ❌ Local execution    | ✅ Containers          |
| Setup           | Already configured    | Added in this setup    |
| CI/CD Ready     | ❌ No                 | ✅ Yes                 |
| Best For        | Development           | Testing & Deployment   |

### Development with Tilt

For active development with hot reloading:

```bash
tilt up
```

**Benefits**:

- Instant feedback on code changes
- No image rebuilds
- Faster iteration
- Better debugging experience

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Docker Deployment

### Building Images Locally

**Backend:**

```bash
cd receipt_processor
docker build -t receipt-processor:latest .
```

**Frontend:**

```bash
cd frontend
docker build -t receipt-processor-frontend:latest .
```

### Running with Docker Compose

```bash
# Production build
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

### Using Development Services Only

If you want to run only the database and cache services:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:

- PostgreSQL
- Redis
- pgAdmin (http://localhost:5050)
- Redis Insight (http://localhost:5540)

## CI/CD Setup

### GitHub Actions

The project includes GitHub Actions workflows for:

1. **Backend CI/CD** (`.github/workflows/backend-ci.yml`)

   - Runs tests with PostgreSQL and Redis
   - Checks code formatting with `cargo fmt`
   - Runs `cargo clippy` for linting
   - Builds Docker images on push
   - Deploys to production on main branch

2. **Frontend CI/CD** (`.github/workflows/frontend-ci.yml`)
   - Runs ESLint
   - Builds the Next.js application
   - Builds Docker images on push
   - Deploys to staging on dev branch
   - Deploys to production on main branch

### Setting Up GitHub Secrets

Add the following secrets to your GitHub repository:

**Required for all deployments:**

- `GITHUB_TOKEN` (automatically provided)

**Production environment:**

- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `JWT_SECRET` - JWT signing secret

**Cloud Provider Secrets (example for AWS):**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Workflow Triggers

**Automatic:**

- Push to `main` or `dev` branches
- Pull requests to `main` or `dev` branches
- Changes in `receipt_processor/` trigger backend CI/CD
- Changes in `frontend/` trigger frontend CI/CD

**Manual:**

```bash
# Trigger via GitHub CLI
gh workflow run "Backend CI/CD"
gh workflow run "Frontend CI/CD"
```

## Production Deployment

### Option 1: Docker Compose on VPS

**Requirements:**

- Ubuntu 20.04+ or similar
- Docker and Docker Compose installed
- Domain name pointing to server

**Steps:**

1. **Prepare server**

   ```bash
   ssh user@your-server
   sudo apt update && sudo apt upgrade -y
   sudo apt install docker.io docker-compose git -y
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Clone repository**

   ```bash
   git clone <your-repo-url> /opt/receipt-processor
   cd /opt/receipt-processor
   ```

3. **Configure environment**

   ```bash
   cp docker-compose.env.example .env
   nano .env  # Update with production values
   ```

4. **Set up reverse proxy (Nginx)**

   ```nginx
   # /etc/nginx/sites-available/receipt-processor
   server {
       listen 80;
       server_name yourdomain.com api.yourdomain.com;

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

5. **Start services**

   ```bash
   docker-compose up -d --build
   ```

6. **Set up SSL with Let's Encrypt**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

### Option 2: AWS ECS/Fargate

1. **Build and push images to ECR**

   ```bash
   aws ecr create-repository --repository-name receipt-processor
   aws ecr create-repository --repository-name receipt-processor-frontend

   docker tag receipt-processor:latest <account-id>.dkr.ecr.<region>.amazonaws.com/receipt-processor:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/receipt-processor:latest
   ```

2. **Create ECS task definitions** (see AWS docs)

3. **Deploy using GitHub Actions** (update deploy step in workflows)

### Option 3: Kubernetes

1. **Create namespace**

   ```bash
   kubectl create namespace receipt-processor
   ```

2. **Create ConfigMaps and Secrets**

   ```bash
   kubectl create configmap db-config --from-env-file=.env -n receipt-processor
   ```

3. **Apply manifests**

   ```bash
   kubectl apply -f k8s/ -n receipt-processor
   ```

4. **Set up ingress**

   ```bash
   kubectl apply -f k8s/ingress.yaml -n receipt-processor
   ```

### Option 4: Serverless (AWS Lambda/API Gateway)

For Rust backend:

- Use `lambda-web-adapter`
- Build with `cargo lambda build`

For Next.js frontend:

- Use Vercel or AWS Amplify
- Configure environment variables in platform UI

## Monitoring and Maintenance

### Health Checks

All services include health check endpoints:

- **Backend**: `GET /health`
- **Frontend**: `GET /api/health` (add if not exists)

### Logs

**View logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Export logs:**

```bash
docker-compose logs --no-color > logs.txt
```

### Database Backups

**Manual backup:**

```bash
docker-compose exec postgres pg_dump -U user receipt_db > backup.sql
```

**Automated backup script:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/receipt-processor"
mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U user receipt_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
```

**Restore from backup:**

```bash
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U user -d receipt_db
```

### Updates and Rollbacks

**Update application:**

```bash
git pull
docker-compose up -d --build
```

**Rollback to previous version:**

```bash
git checkout <previous-commit>
docker-compose up -d --build
```

### Resource Monitoring

**Check resource usage:**

```bash
docker stats
```

**Clean up unused resources:**

```bash
docker system prune -a
```

## Troubleshooting

### Common Issues

**1. Port already in use**

```bash
# Find process using port
lsof -i :8000
# Kill process
kill -9 <PID>
```

**2. Database connection errors**

```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# Check logs
docker-compose logs postgres
```

**3. Redis connection errors**

```bash
# Verify Redis password
docker-compose exec redis redis-cli -a redis123 ping
```

**4. Docker build failures**

```bash
# Clean build cache
docker builder prune -a
# Rebuild without cache
docker-compose build --no-cache
```

## Security Considerations

1. **Change default passwords** in production
2. **Use secrets management** (AWS Secrets Manager, HashiCorp Vault)
3. **Enable HTTPS** everywhere
4. **Regular security updates**: `docker-compose pull && docker-compose up -d`
5. **Limit network exposure** (use firewalls)
6. **Implement rate limiting** on API
7. **Regular backups** of database
8. **Monitor logs** for suspicious activity

## Support

For issues or questions:

- Check this documentation
- Review application logs
- Check GitHub Issues
- Contact development team

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Rust Deployment Guide](https://doc.rust-lang.org/book/ch01-00-getting-started.html)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)
- [Redis Documentation](https://redis.io/documentation)
