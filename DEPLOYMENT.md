# Deployment Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- nginx
- PM2 or similar process manager

## Backend Deployment

1. Set up Python environment:
```bash
cd django_backend
python -m venv env
source env/bin/activate  # or `env\Scripts\activate` on Windows
pip install -r requirements.txt
```

2. Environment Variables:
Create `.env` file in django_backend/:
```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com
MONGODB_URI=mongodb://username:password@host:port/database
SECRET_KEY=your-secret-key
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

3. Configure gunicorn:
```bash
gunicorn --bind 0.0.0.0:8000 core.wsgi:application
```

## Frontend Deployment

1. Install dependencies:
```bash
cd frontend
pnpm install
```

2. Environment Variables:
Create `.env` file in frontend/:
```env
VITE_API_URL=https://api.your-domain.com
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
```

3. Build the application:
```bash
pnpm build
```

4. Configure nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml:cursor-crop-project/.github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install frontend dependencies
        run: |
          cd frontend
          pnpm install
          pnpm build

      - name: Install backend dependencies
        run: |
          cd django_backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd django_backend
          pytest
          cd ../frontend
          pnpm test

      - name: Deploy
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_IP: ${{ secrets.SERVER_IP }}
        run: |
          # Add deployment script here
```
