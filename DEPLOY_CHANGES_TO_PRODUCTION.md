# Deploy Recent Changes to Production

This guide covers deploying the recent fixes to your Hostinger VPS production environment.

## Changes to Deploy

1. ✅ Export button fix (HR Dashboard - company optional)
2. ✅ "Rejoindre RDV" button logic (10-minute rule in prod, always enabled in dev)
3. ✅ Practitioner consultations view (shows patient info correctly)
4. ✅ Practitioner dashboard "Démarrer" button (joins meetings with correct roomName)
5. ✅ Sidebar navigation fix (ADMIN_RH routes to HR dashboard)

---

## Step 1: Build Frontend Locally (or on Server)

### Option A: Build on Your Local Machine

```bash
# Navigate to project root
cd c:\Stage_PSG\Huntzen

# Build frontend with production API URL
# Replace app.huntzen.space with your actual domain
$env:VITE_API_URL="https://app.huntzen.space/api"
npm run build

# The build output will be in: Huntzen-Care/dist/
```

### Option B: Build on Server (Recommended)

SSH into your server and build there to avoid file transfer issues.

---

## Step 2: Deploy to Server

### Option A: If Built Locally - Transfer Files

```bash
# From your local machine, transfer the dist folder
# Replace USERNAME and SERVER_IP with your details
scp -r dist/* root@YOUR_SERVER_IP:/var/www/huntzen/Huntzen-Care/dist/
```

### Option B: If Building on Server

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to project directory
cd /var/www/huntzen/Huntzen-Care

# Pull latest changes from Git (if using Git)
git pull origin main  # or your branch name

# Install dependencies if needed
npm install

# Build with production API URL
export VITE_API_URL="https://app.huntzen.space/api"
npm run build

# The dist/ folder is now updated
```

---

## Step 3: Restart Backend (If Needed)

If you made any backend changes (we didn't in this case, but good to check):

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to backend directory
cd /var/www/huntzen/backend-api

# Pull latest changes (if using Git)
git pull origin main  # or your branch name

# Install dependencies if needed
npm install

# Run migrations if schema changed
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate

# Build backend
npm run build

# Restart PM2 process
pm2 restart huntzen-api

# Check status
pm2 status
pm2 logs huntzen-api --lines 50
```

---

## Step 4: Restart Nginx (If Needed)

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx
```

---

## Step 5: Verify Deployment

1. **Clear browser cache** (important for frontend changes):
   - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Clear cached images and files
   - Or use incognito/private browsing

2. **Test the changes**:
   - ✅ Login as ADMIN_RH → Click "Tableau de Bord" → Should go to HR Dashboard
   - ✅ Login as PRACTITIONER (Sophie) → "Mes Consultations" → Should show patient names (Marc Dupont), not "Sophie Martin"
   - ✅ HR Dashboard → Export button should be enabled (if stats are loaded)
   - ✅ "Rejoindre RDV" button → Should be disabled until 10 minutes before (in production)
   - ✅ Practitioner Dashboard → "Démarrer" button should join the meeting

3. **Check browser console** for any errors:
   - Press `F12` → Console tab
   - Look for any red errors

---

## Quick Deployment Script (All-in-One)

If you prefer a single script, here's a complete deployment process:

```bash
#!/bin/bash
# Save as: deploy-production.sh

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Configuration
SERVER_IP="YOUR_SERVER_IP"
DOMAIN="app.huntzen.space"
PROJECT_DIR="/var/www/huntzen/Huntzen-Care"
BACKEND_DIR="/var/www/huntzen/backend-api"

# SSH into server and deploy
ssh root@$SERVER_IP << 'ENDSSH'
  set -e
  
  echo "📦 Updating frontend..."
  cd /var/www/huntzen/Huntzen-Care
  git pull origin main  # or your branch
  npm install
  export VITE_API_URL="https://app.huntzen.space/api"
  npm run build
  
  echo "🔄 Restarting services..."
  pm2 restart huntzen-api || echo "Backend not running or no changes"
  sudo systemctl reload nginx
  
  echo "✅ Deployment complete!"
ENDSSH

echo "✅ Deployment finished. Test at https://$DOMAIN"
```

Make it executable and run:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

---

## Troubleshooting

### Frontend not updating?
- Clear browser cache (hard refresh: `Ctrl+F5`)
- Check if `dist/` folder was updated: `ls -la /var/www/huntzen/Huntzen-Care/dist/`
- Check Nginx is serving the correct directory

### Backend errors?
- Check PM2 logs: `pm2 logs huntzen-api --lines 100`
- Check if backend is running: `pm2 status`
- Verify environment variables: Check `.env` file in backend directory

### 404 errors?
- Verify Nginx configuration: `sudo nginx -t`
- Check if site is enabled: `ls -la /etc/nginx/sites-enabled/`
- Verify SSL certificates: `sudo certbot certificates`

### "Rejoindre" button still enabled too early?
- Verify you're in production (not dev mode)
- Check browser console for `import.meta.env.DEV` value
- The build should have `import.meta.env.DEV = false`

---

## Notes

- **No database migrations needed** for these changes
- **No backend code changes** - all changes were frontend-only
- **Environment variable**: Make sure `VITE_API_URL` is set correctly during build
- **Cache**: Always clear browser cache after deploying frontend changes

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
ssh root@YOUR_SERVER_IP

# Restore previous frontend build (if you have a backup)
cd /var/www/huntzen/Huntzen-Care
git checkout HEAD~1  # or specific commit
npm run build

# Or restore from backup
# cp -r /backup/dist/* ./dist/

# Reload Nginx
sudo systemctl reload nginx
```

---

**Ready to deploy?** Follow the steps above, or use the quick script if you prefer automation.
