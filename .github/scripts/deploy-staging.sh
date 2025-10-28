#!/bin/bash
set -e

echo "==> Setting up SSH..."
mkdir -p ~/.ssh
echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh-keyscan -H "$STAGING_SERVER_IP" >> ~/.ssh/known_hosts

echo "==> Cloning repository to remote server..."
ssh -i ~/.ssh/id_rsa "$STAGING_SERVER_USER@$STAGING_SERVER_IP" << 'ENDSSH'
  cd /home/josh
  echo "Removing existing repository if present..."
  rm -rf web-app
  echo "Cloning repository..."
  git clone https://github.com/Black-Relay/web-app.git
  cd web-app
  echo "Checking out staging branch..."
  git checkout staging
  echo "✓ Repository cloned and staging branch checked out successfully"
ENDSSH

echo "==> Pruning Docker images and volumes..."
ssh -i ~/.ssh/id_rsa "$STAGING_SERVER_USER@$STAGING_SERVER_IP" << 'ENDSSH'
  echo "Pruning Docker images and volumes..."
  docker system prune -af
  docker volume prune -af
  echo "✓ Docker cleanup completed"
ENDSSH

echo "==> Creating .env file on remote server..."
ssh -i ~/.ssh/id_rsa "$STAGING_SERVER_USER@$STAGING_SERVER_IP" << ENDSSH
  cd /home/josh/web-app/docker-compose/staging
  echo "Creating .env file..."
  cat > .env << 'EOF'
MONGO_USER=$MONGO_USER
MONGO_PASSWORD=$MONGO_PASSWORD
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
EOF
  echo "✓ Environment file created"
ENDSSH

echo "==> Deploying with Docker Compose..."
ssh -i ~/.ssh/id_rsa "$STAGING_SERVER_USER@$STAGING_SERVER_IP" << 'ENDSSH'
  cd /home/josh/web-app/docker-compose/staging
  echo "Starting Docker Compose services..."
  docker compose up -d
  echo "✓ Docker Compose services started successfully"
  echo "✓ Deployment finished"
ENDSSH

echo "==> Deployment complete!"
