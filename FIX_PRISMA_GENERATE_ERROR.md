# Fix: Prisma Generate Permission Error

## The Error

```
EPERM: operation not permitted, rename '...query_engine-windows.dll.node'
```

This happens because the **backend server is still running** and has locked the Prisma files.

---

## Quick Fix

### Step 1: Stop the Backend

1. Go to the terminal where the backend is running
2. Press **Ctrl+C** to stop it
3. Wait until you see the terminal prompt (not the "🚀 HuntZen Care API running..." message)

### Step 2: Regenerate Prisma Client

```bash
cd backend-api
npx prisma generate
```

This should work now without the permission error.

### Step 3: Restart Backend

```bash
npm run start:dev
```

---

## Alternative: If Backend Won't Stop

If Ctrl+C doesn't work:

### Windows:
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find `node.exe` processes
3. End the one running your backend
4. Then run `npx prisma generate`

### Or use PowerShell:
```powershell
# Find Node processes
Get-Process node

# Kill all Node processes (be careful - this kills ALL Node processes)
Stop-Process -Name node -Force

# Then regenerate
npx prisma generate
```

---

## Why This Happens

- The backend server loads the Prisma query engine DLL file
- Windows locks the file while it's in use
- Prisma can't replace the locked file
- Solution: Stop the server first

---

## After Fixing

Once you've:
1. ✅ Stopped backend
2. ✅ Regenerated Prisma client (`npx prisma generate`)
3. ✅ Restarted backend

The enum value should be recognized and notifications should work!

---

**Always stop the backend before running `npx prisma generate` on Windows.**
