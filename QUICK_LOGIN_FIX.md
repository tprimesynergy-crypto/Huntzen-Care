# Quick Login Fix Guide

## Step 1: Check what error you're seeing

**Open your browser's Developer Tools:**
- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Go to the **Console** tab
- Go to the **Network** tab

**Try to login and note:**
1. What error message appears on the login page?
2. What error appears in the Console tab?
3. In Network tab, find the `/api/auth/login` request:
   - What's the **Status Code**? (200, 400, 401, 500, etc.)
   - Click on it → **Response** tab: what does it say?

---

## Step 2: Verify backend is running

**Check if backend is running:**
```bash
# In a terminal, go to backend-api
cd backend-api
npm run start:dev
```

**You should see:**
```
🚀 HuntZen Care API running on http://localhost:3000
```

**If you see errors instead:**
- Read the error message - it tells you what's wrong
- Common issues:
  - `Can't reach database server` → Database not running or wrong `DATABASE_URL`
  - `Environment variable not found: DATABASE_URL` → Missing `.env` file
  - `Table 'User' does not exist` → Run migrations: `npm run prisma:migrate`

---

## Step 3: Test API directly

**Open a new terminal and test the API:**

```bash
# Test if backend responds
curl http://localhost:3000/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"marc@huntzen-demo.com","password":"Password123!"}'
```

**Or use PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"marc@huntzen-demo.com","password":"Password123!"}'
```

**Expected response:**
```json
{
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "marc@huntzen-demo.com", "role": "EMPLOYEE" }
}
```

**If you get an error:**
- `Connection refused` → Backend not running
- `500 Internal Server Error` → Check backend console for the actual error
- `401 Unauthorized` → Wrong email/password or user doesn't exist

---

## Step 4: Check frontend proxy

**Verify Vite is proxying correctly:**

1. Open browser DevTools → **Network** tab
2. Try to login
3. Look for the request to `/api/auth/login`
4. Check:
   - **Request URL**: Should be `http://localhost:5173/api/auth/login`
   - **Status**: Should not be `404` or `Failed to fetch`

**If you see `Failed to fetch` or `404`:**
- The Vite proxy isn't working
- Make sure you're running `npm run dev` (not just opening the HTML file)
- Check `vite.config.ts` has the proxy configured

---

## Step 5: Common fixes

### Fix 1: Backend not running
```bash
cd backend-api
npm run start:dev
```

### Fix 2: Missing .env file
```bash
cd backend-api
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_SECRET
```

### Fix 3: Database not migrated
```bash
cd backend-api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Creates demo users
```

### Fix 4: Database not running
- **Windows**: Open Services (`services.msc`), find PostgreSQL, start it
- **Linux/Mac**: `sudo systemctl start postgresql`

### Fix 5: Wrong API URL
Check `src/app/services/api.ts`:
- In development, it should use `/api` (which Vite proxies to `http://localhost:3000`)
- If you see `http://localhost:3000` directly, the proxy might not be working

---

## Step 6: Debug the actual error

**Check backend console:**
When you try to login, the backend terminal should show:
- The request received
- Any errors (database, validation, etc.)

**Check browser console:**
- Look for JavaScript errors
- Check Network tab for failed requests

**Check Network response:**
1. Open DevTools → Network
2. Try login
3. Click on `/api/auth/login` request
4. Go to **Response** tab
5. Copy the error message

---

## Most common issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Failed to fetch" | Backend not running | Start backend: `cd backend-api && npm run start:dev` |
| 500 Internal Server Error | Database issue | Check backend console, run migrations |
| 401 Unauthorized | Wrong credentials | Use: `marc@huntzen-demo.com` / `Password123!` |
| 404 Not Found | Wrong URL or proxy issue | Check Vite proxy config, ensure backend on port 3000 |
| "Cannot GET /" | Frontend trying to hit backend directly | Use `/api` prefix (Vite proxy) |

---

## Still not working?

**Share these details:**
1. What error message do you see? (on page, in console, in network tab)
2. Is the backend running? (check terminal)
3. What's the status code in Network tab for `/api/auth/login`?
4. What does the backend console show when you try to login?

This will help pinpoint the exact issue!
