# Deploy HuntZen Care on Hostinger (VPS)

This guide walks you through deploying the **HuntZen Care** app (Vite + React frontend, NestJS + PostgreSQL backend) on a **Hostinger VPS**.

> **Important:** Hostinger **shared hosting** does **not** support Node.js. You **must** use a **VPS** plan (or Cloud hosting with Node.js support).

---

## Quick steps (overview)

1. **VPS:** Node 20, PM2, Nginx, PostgreSQL.
2. **DB:** Create user `huntzen` and database `huntzen_care`.
3. **Backend:** Clone → `backend-api/.env` → `prisma generate` → `prisma migrate deploy` → `npm run build` → `pm2 start dist/main.js --name huntzen-api`.
4. **Frontend:** `VITE_API_URL="https://yourdomain.com/api" npm run build` → Nginx serves `dist/`, proxies `/api/` to API.
5. **Nginx:** Use `deploy/nginx-huntzen.conf`, enable site, reload.
6. **SSL:** `certbot --nginx -d yourdomain.com`.

---

## Prerequisites

- [ ] Hostinger VPS subscription (e.g. KVM 1, KVM 2, or higher)
- [ ] A domain name (e.g. `huntzen-care.com`) pointed to your VPS IP (A record)
- [ ] SSH access to your VPS (IP, root or sudo user, password or SSH key)
- [ ] Git installed on your machine (for pushing code)

---

## Part 1 — Server preparation

### Step 1.1 — Connect via SSH

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP from your Hostinger VPS panel. Use your root password or SSH key.

### Step 1.2 — Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 1.3 — Install Node.js 20 (LTS) via NodeSource

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should show v20.x.x
npm -v
```

### Step 1.4 — Install PM2 (process manager)

```bash
sudo npm install -g pm2
pm2 -v
```

### Step 1.5 — Install Nginx (reverse proxy + static files)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 1.6 — Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Step 1.7 — Create PostgreSQL database and user

```bash
sudo -u postgres psql
```

In the `psql` prompt:

```sql
CREATE USER huntzen WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD';
CREATE DATABASE huntzen_care OWNER huntzen;
\q
```

Replace `CHOOSE_A_STRONG_PASSWORD` with a strong password. Remember it for `DATABASE_URL` later.

---

## Part 2 — Deploy the backend (NestJS API)

### Step 2.1 — Create app directory

```bash
sudo mkdir -p /var/www/huntzen
sudo chown $USER:$USER /var/www/huntzen
cd /var/www/huntzen
```

### Step 2.2 — Clone your repository

```bash
git clone https://github.com/YOUR_USERNAME/Huntzen.git .
```

If the repo is private, use a **Personal Access Token** or **deploy key** instead of a password. Alternatively, upload the project via **SFTP** (e.g. FileZilla) to `/var/www/huntzen`.

### Step 2.3 — Install backend dependencies and build

```bash
cd /var/www/huntzen/backend-api
npm ci
npm run prisma:generate
```

### Step 2.4 — Configure production database URL

A template lives in `deploy/env.backend.example`. Create `/var/www/huntzen/backend-api/.env`:

```bash
nano /var/www/huntzen/backend-api/.env
```

Add (adjust password and DB name if you changed them):

```env
DATABASE_URL="postgresql://huntzen:CHOOSE_A_STRONG_PASSWORD@localhost:5432/huntzen_care?schema=public"
JWT_SECRET="GENERATE_A_LONG_RANDOM_STRING"
JWT_REFRESH_SECRET="ANOTHER_LONG_RANDOM_STRING"
FRONTEND_URL="https://yourdomain.com"
PORT=3000
```

- Replace `CHOOSE_A_STRONG_PASSWORD` with the PostgreSQL password from Step 1.7.
- Replace `yourdomain.com` with your actual domain.
- Generate secure secrets, e.g.:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Run twice to get `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Step 2.5 — Run migrations and seed (optional)

```bash
cd /var/www/huntzen/backend-api
npx prisma migrate deploy
npm run prisma:seed
```

Use `prisma migrate deploy` in production (not `migrate dev`).

### Step 2.6 — Build the NestJS app

```bash
npm run build
```

### Step 2.7 — Start API with PM2

```bash
cd /var/www/huntzen/backend-api
pm2 start dist/main.js --name huntzen-api
pm2 save
pm2 startup
```

Follow the command PM2 prints for `pm2 startup` (usually a `sudo env ...` line).  
Verify:

```bash
pm2 status
curl -s http://localhost:3000
```

You should get a response from the API (e.g. 404 for `/` is fine; auth endpoints should work).

---

## Part 3 — Build and deploy the frontend

### Step 3.1 — Set API URL and build

The frontend calls the API via `VITE_API_URL`. Build with your production API URL:

```bash
cd /var/www/huntzen
VITE_API_URL="https://yourdomain.com/api" npm run build
```

Replace `yourdomain.com` with your real domain. We will proxy `/api` to the backend in Nginx.

### Step 3.2 — Serve frontend files via Nginx

The Vite build outputs to `dist/`. We will configure Nginx to serve `dist/` as the site root (see Part 4).

---

## Part 4 — Configure Nginx

### Step 4.1 — Create Nginx site config

A sample config is in `deploy/nginx-huntzen.conf`. Create the file:

```bash
sudo nano /etc/nginx/sites-available/huntzen
```

Paste the following (replace `yourdomain.com` with your domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/huntzen/dist;
    index index.html;

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (strip /api prefix so backend receives /auth/login, etc.)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static assets caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 4.2 — Enable site and test config

```bash
sudo ln -s /etc/nginx/sites-available/huntzen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Part 5 — SSL with Let’s Encrypt (HTTPS)

### Step 5.1 — Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 5.2 — Obtain certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts (email, agree to terms). Certbot will adjust your Nginx config for HTTPS.

### Step 5.3 — Verify renewal

```bash
sudo certbot renew --dry-run
```

---

## Part 6 — Final checks

1. **Frontend:**  
   Open `https://yourdomain.com` — you should see the HuntZen Care app.

2. **API:**  
   The app uses `VITE_API_URL="https://yourdomain.com/api"`, so all API calls go to `https://yourdomain.com/api/...`.  
   Test login with a demo account (after `prisma:seed`): e.g. `marc@huntzen-demo.com` / `Password123!` (employee) or `sophie.martin@huntzen-care.com` / `Password123!` (practitioner).

3. **CORS:**  
   The NestJS app uses `FRONTEND_URL`. Ensure `FRONTEND_URL="https://yourdomain.com"` in `backend-api/.env` (no trailing slash).

---

## Part 7 — Updates and maintenance

### Redeploy after code changes

```bash
cd /var/www/huntzen
git pull

# Backend
cd backend-api
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart huntzen-api

# Frontend
cd /var/www/huntzen
VITE_API_URL="https://yourdomain.com/api" npm run build
```

Nginx already serves `dist/`, so no Nginx reload is needed for frontend-only updates.

### Useful commands

| Task              | Command                          |
|-------------------|----------------------------------|
| API logs          | `pm2 logs huntzen-api`           |
| API restart       | `pm2 restart huntzen-api`        |
| PM2 status        | `pm2 status`                     |
| Nginx reload      | `sudo systemctl reload nginx`    |
| Nginx error log   | `sudo tail -f /var/log/nginx/error.log` |

---

## Optional — Use Supabase instead of local PostgreSQL

If you prefer a managed database:

1. Create a project at [Supabase](https://supabase.com).
2. In **Settings → Database**, copy the **Connection string** (URI format).
3. In `backend-api/.env`, set:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   ```
4. Skip **Part 1.6** and **1.7** (no local PostgreSQL). Run migrations from your VPS:
   ```bash
   cd /var/www/huntzen/backend-api
   npx prisma migrate deploy
   npm run prisma:seed
   ```

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| 502 Bad Gateway | API not running: `pm2 status`, `pm2 logs huntzen-api`. Ensure NestJS listens on `PORT=3000` and Nginx proxies `/api/` to `http://127.0.0.1:3000`. |
| CORS errors | `FRONTEND_URL` in `.env` must match the real frontend origin (e.g. `https://yourdomain.com`). |
| Blank page | Build with `VITE_API_URL="https://yourdomain.com/api"`. Confirm `dist/index.html` and `dist/assets/*` exist and Nginx `root` points to `dist/`. |
| Database connection | Verify `DATABASE_URL`, PostgreSQL is running (`sudo systemctl status postgresql`), and credentials match. |

---

## Summary

1. **VPS setup:** Node 20, PM2, Nginx, PostgreSQL (or Supabase).
2. **Backend:** Clone → `.env` → `prisma generate` → `prisma migrate deploy` → `npm run build` → PM2.
3. **Frontend:** `VITE_API_URL="https://yourdomain.com/api" npm run build` → Nginx serves `dist/` and proxies `/api` to the API.
4. **SSL:** `certbot --nginx -d yourdomain.com`.
5. **Updates:** `git pull` → rebuild backend + frontend → `pm2 restart huntzen-api`.

Your HuntZen Care app should be live at `https://yourdomain.com`.
