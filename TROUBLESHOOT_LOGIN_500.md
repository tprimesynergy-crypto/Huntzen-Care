# Troubleshooting: Login 500 Internal Server Error

When you get a **500 Internal Server Error** on `POST /api/auth/login`, the backend is receiving the request but encountering an error. Here's how to diagnose and fix it.

## Quick checks

### 1. Is the backend running?

```bash
# In backend-api directory
cd backend-api
npm run start:dev
```

You should see:
```
🚀 HuntZen Care API running on http://localhost:3000
```

If not, start it and check for errors.

---

### 2. Check backend console logs

The **backend terminal** will show the actual error. Look for:
- Database connection errors
- Missing environment variables
- Prisma errors

**Common errors you might see:**

```
Error: Can't reach database server
→ Database not running or DATABASE_URL wrong
```

```
Error: Environment variable not found: DATABASE_URL
→ Missing .env file or DATABASE_URL not set
```

```
Error: P1001: Can't reach database server at 'localhost:5432'
→ PostgreSQL not running or wrong connection string
```

```
Error: Table 'User' does not exist
→ Database not migrated (run: npm run prisma:migrate)
```

---

### 3. Verify `.env` file exists and has correct values

**Location:** `backend-api/.env`

```bash
cd backend-api
cat .env
```

**Required variables:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/huntzen_care?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="another-secret-key-here"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

**If `.env` is missing:**

```bash
cd backend-api
cp .env.example .env
# Then edit .env and set DATABASE_URL and JWT_SECRET
```

---

### 4. Is PostgreSQL running?

**On Windows:**
```bash
# Check if PostgreSQL service is running
# Open Services (services.msc) and look for "postgresql"
```

**On Linux/Mac:**
```bash
sudo systemctl status postgresql
# Or: pg_isready
```

**If not running, start it:**
```bash
# Windows: Start service from Services panel
# Linux: sudo systemctl start postgresql
```

---

### 5. Test database connection

```bash
cd backend-api
npx prisma db pull
```

If this fails, your `DATABASE_URL` is wrong or the database isn't accessible.

---

### 6. Are database migrations applied?

```bash
cd backend-api
npm run prisma:migrate
```

This creates the tables. If tables don't exist, Prisma queries will fail with 500 errors.

---

### 7. Check Prisma client is generated

```bash
cd backend-api
npm run prisma:generate
```

This generates the Prisma Client. If missing, imports will fail.

---

## Step-by-step fix

### Step 1: Verify backend is running

```bash
cd backend-api
npm run start:dev
```

**Expected output:**
```
🚀 HuntZen Care API running on http://localhost:3000
```

If you see errors, **read them** — they tell you what's wrong.

---

### Step 2: Check `.env` file

```bash
cd backend-api
ls -la .env  # or: dir .env (Windows)
```

**If missing:**
```bash
cp .env.example .env
nano .env  # or: notepad .env (Windows)
```

**Set at minimum:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/huntzen_care?schema=public"
JWT_SECRET="change-this-to-a-random-string"
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 3: Ensure database exists and is accessible

**Create database (if using local PostgreSQL):**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE huntzen_care;
\q
```

**Or use Supabase/remote database:**
- Copy the connection string from your Supabase dashboard
- Paste it as `DATABASE_URL` in `.env`

---

### Step 4: Run migrations

```bash
cd backend-api
npm run prisma:generate
npm run prisma:migrate
```

**Expected:** "Migration applied successfully"

---

### Step 5: Seed database (optional, for test users)

```bash
cd backend-api
npm run prisma:seed
```

This creates demo users:
- `marc@huntzen-demo.com` / `Password123!` (employee)
- `sophie.martin@huntzen-care.com` / `Password123!` (practitioner)

---

### Step 6: Restart backend

```bash
# Stop current backend (Ctrl+C)
# Then:
cd backend-api
npm run start:dev
```

---

### Step 7: Test login again

Try logging in from the frontend. Check the **backend console** for any errors.

---

## Common error messages and fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Can't reach database server` | PostgreSQL not running or wrong `DATABASE_URL` | Start PostgreSQL, check `DATABASE_URL` |
| `Environment variable not found: DATABASE_URL` | Missing `.env` or variable | Create `.env` with `DATABASE_URL` |
| `Table 'User' does not exist` | Migrations not run | Run `npm run prisma:migrate` |
| `P1001: Can't reach database server` | Database connection failed | Check PostgreSQL is running, verify `DATABASE_URL` |
| `JWT_SECRET is required` | Missing `JWT_SECRET` in `.env` | Add `JWT_SECRET="..."` to `.env` |
| `PrismaClientInitializationError` | Prisma Client not generated | Run `npm run prisma:generate` |

---

## Still not working?

1. **Check backend logs** — the terminal running `npm run start:dev` shows the actual error.
2. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"marc@huntzen-demo.com","password":"Password123!"}'
   ```
3. **Check browser Network tab** — look at the response body for error details.
4. **Verify frontend proxy** — ensure Vite is proxying `/api` to `http://localhost:3000`.

---

## Quick checklist

- [ ] Backend is running (`npm run start:dev` in `backend-api`)
- [ ] `.env` file exists in `backend-api/`
- [ ] `DATABASE_URL` is set and correct in `.env`
- [ ] `JWT_SECRET` is set in `.env`
- [ ] PostgreSQL is running (or remote DB is accessible)
- [ ] Database `huntzen_care` exists
- [ ] Migrations applied (`npm run prisma:migrate`)
- [ ] Prisma Client generated (`npm run prisma:generate`)
- [ ] No errors in backend console when starting

Once all are checked, login should work!
