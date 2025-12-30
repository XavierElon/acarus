# 🚀 AWS Deployment Guide

Complete guide to deploying your application to AWS using ECS (Elastic Container Service) with Fargate.

---

## 📊 Architecture Overview

```
GitHub Actions → ECR (Container Registry) → ECS Fargate → Application Load Balancer → Your Domain
```

**Components:**

- **ECR** - Docker image registry
- **ECS** - Container orchestration
- **Fargate** - Serverless containers
- **ALB** - Application Load Balancer
- **RDS** - Managed PostgreSQL (optional)
- **ElastiCache** - Managed Redis (optional)

---

## 🎯 Prerequisites

Before starting, ensure you have:

- ✅ AWS account
- ✅ AWS CLI installed and configured
- ✅ IAM permissions to create ECS, ECR, ALB resources
- ✅ Domain name (optional, for custom domain)

---

## 📋 Step-by-Step Setup

### Step 1: Configure AWS CLI

```bash
# Install AWS CLI (if not installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Step 2: Create ECR Repositories

ECR stores your Docker images. Create repositories for backend and frontend:

```bash
# Set your AWS account ID and region
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

# Create backend repository
aws ecr create-repository \
  --repository-name receipt-processor-backend \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --image-tag-mutability MUTABLE

# Create frontend repository
aws ecr create-repository \
  --repository-name receipt-processor-frontend \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --image-tag-mutability MUTABLE

# Note the repository URIs (you'll need these)
echo "Backend ECR: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/receipt-processor-backend"
echo "Frontend ECR: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/receipt-processor-frontend"
```

### Step 3: Set Up Database (RDS PostgreSQL)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier receipt-processor-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible

# Note the endpoint (will take ~10 minutes to create)
# Format: receipt-processor-db.xxxxx.us-east-1.rds.amazonaws.com:5432
```

**Alternatively**: Use AWS Secrets Manager for credentials:

```bash
aws secretsmanager create-secret \
  --name receipt-processor/database \
  --secret-string '{"username":"admin","password":"YourSecurePassword123!"}'
```

### Step 4: Set Up Redis (ElastiCache)

```bash
# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id receipt-processor-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-group-name default

# Note the endpoint
```

### Step 5: Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster \
  --cluster-name receipt-processor-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=1

# Create separate clusters for staging/production (optional but recommended)
aws ecs create-cluster --cluster-name receipt-processor-staging
aws ecs create-cluster --cluster-name receipt-processor-production
```

### Step 6: Create IAM Role for ECS Tasks

ECS tasks need permissions to pull images and access other AWS services:

```bash
# Create task execution role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### Step 7: Create Task Definitions

Task definitions specify how to run your containers.

**Backend Task Definition** (`backend-task-def.json`):

```json
{
  "family": "receipt-processor-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/receipt-processor-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "8000"
        },
        {
          "name": "RUST_LOG",
          "value": "info"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:receipt-processor/database"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:receipt-processor/redis"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:receipt-processor/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/receipt-processor-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
```

**Frontend Task Definition** (`frontend-task-def.json`):

```json
{
  "family": "receipt-processor-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/receipt-processor-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:receipt-processor/api-url"
        },
        {
          "name": "NEXTAUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:receipt-processor/nextauth-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/receipt-processor-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 8: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name receipt-processor-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Note the ARN and DNS name
# Create target groups for backend and frontend
aws elbv2 create-target-group \
  --name backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health

aws elbv2 create-target-group \
  --name frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /
```

### Step 9: Create ECS Services

```bash
# Create backend service
aws ecs create-service \
  --cluster receipt-processor-cluster \
  --service-name receipt-processor-backend \
  --task-definition receipt-processor-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/backend-tg/xxxxx,containerName=backend,containerPort=8000"

# Create frontend service
aws ecs create-service \
  --cluster receipt-processor-cluster \
  --service-name receipt-processor-frontend \
  --task-definition receipt-processor-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/frontend-tg/xxxxx,containerName=frontend,containerPort=3000"
```

### Step 10: Configure GitHub Secrets

Go to **GitHub → Settings → Secrets → Actions** and add:

| Secret Name              | Value                          |
| ------------------------ | ------------------------------ |
| `AWS_ACCESS_KEY_ID`      | Your AWS access key            |
| `AWS_SECRET_ACCESS_KEY`  | Your AWS secret key            |
| `AWS_REGION`             | `us-east-1` (or your region)   |
| `AWS_ACCOUNT_ID`         | Your AWS account ID            |
| `ECS_CLUSTER_STAGING`    | `receipt-processor-staging`    |
| `ECS_CLUSTER_PRODUCTION` | `receipt-processor-production` |
| `ECS_SERVICE_BACKEND`    | `receipt-processor-backend`    |
| `ECS_SERVICE_FRONTEND`   | `receipt-processor-frontend`   |
| `ECR_BACKEND_REPO`       | `receipt-processor-backend`    |
| `ECR_FRONTEND_REPO`      | `receipt-processor-frontend`   |

### Step 11: Update GitHub Workflows

The workflows are already set up! Just uncomment the AWS sections. See the workflow files for details.

---

## 🔧 Quick Setup Script

Create `setup-aws.sh`:

```bash
#!/bin/bash
set -e

# Configuration
export AWS_REGION=${AWS_REGION:-us-east-1}
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export PROJECT_NAME=receipt-processor

echo "Setting up AWS resources for $PROJECT_NAME..."

# Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name ${PROJECT_NAME}-backend --region $AWS_REGION || true
aws ecr create-repository --repository-name ${PROJECT_NAME}-frontend --region $AWS_REGION || true

# Create ECS clusters
echo "Creating ECS clusters..."
aws ecs create-cluster --cluster-name ${PROJECT_NAME}-staging || true
aws ecs create-cluster --cluster-name ${PROJECT_NAME}-production || true

# Create CloudWatch log groups
echo "Creating log groups..."
aws logs create-log-group --log-group-name /ecs/${PROJECT_NAME}-backend || true
aws logs create-log-group --log-group-name /ecs/${PROJECT_NAME}-frontend || true

echo "✅ Basic AWS resources created!"
echo "Next steps:"
echo "1. Configure RDS and ElastiCache manually"
echo "2. Create task definitions"
echo "3. Set up ALB and target groups"
echo "4. Configure GitHub secrets"
```

Run: `chmod +x setup-aws.sh && ./setup-aws.sh`

---

## 📝 Cost Estimation

**Approximate monthly costs**:

- ECS Fargate (2 tasks): ~$30/month
- ALB: ~$16/month
- RDS db.t3.micro: ~$15/month
- ElastiCache cache.t3.micro: ~$13/month
- Data transfer: ~$10/month
- **Total**: ~$84/month

**With free tier** (first 12 months):

- ~$30/month

---

## 🚀 Deployment Process

Once everything is set up:

1. **Push to dev** → Builds image → Pushes to ECR → Deploys to staging ECS
2. **Push to main** → Builds image → Pushes to ECR → Deploys to production ECS

Everything is automated! 🎉

---

## 🐛 Troubleshooting

### Task fails to start

```bash
# Check task logs
aws logs tail /ecs/receipt-processor-backend --follow

# Check task status
aws ecs describe-tasks --cluster receipt-processor-cluster --tasks TASK_ID
```

### Image pull errors

```bash
# Ensure ECR login works
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Service won't update

```bash
# Force new deployment
aws ecs update-service \
  --cluster receipt-processor-cluster \
  --service receipt-processor-backend \
  --force-new-deployment
```

---

## 📚 Additional Resources

- [ECS Fargate Documentation](https://docs.aws.amazon.com/ecs/latest/userguide/AWS_Fargate.html)
- [ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [AWS CloudFormation Templates](https://github.com/aws-samples/ecs-refarch-cloudformation)

---

## ✅ Next Steps

1. ✅ Run `setup-aws.sh` to create basic resources
2. ✅ Create RDS and ElastiCache
3. ✅ Register task definitions
4. ✅ Create ALB and services
5. ✅ Configure GitHub secrets
6. ✅ Uncomment AWS deployment in workflows
7. ✅ Push to deploy!

**Ready to deploy!** 🚀
