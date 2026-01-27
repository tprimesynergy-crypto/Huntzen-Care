# Fix: Add CONSULTATION_RESCHEDULED Enum Value

## The Error

```
Invalid value for argument `type`. Expected NotificationType.
```

This means the enum value `CONSULTATION_RESCHEDULED` doesn't exist in your database.

---

## Quick Fix (3 Steps)

### Step 1: Add Enum Value to Database

**If using Supabase:**
1. Go to your Supabase project
2. Click **SQL Editor** (left sidebar)
3. Run this SQL:

```sql
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see: `Success. No rows returned`

**If using direct database access:**
Run the same SQL command in your database client.

### Step 2: Regenerate Prisma Client

```bash
cd backend-api
npx prisma generate
```

This updates the Prisma client to recognize the new enum value.

### Step 3: Restart Backend

```bash
# Stop current backend (Ctrl+C in the terminal)
# Then restart:
npm run start:dev
```

---

## Verify It Worked

### 1. Check Enum Value Exists

Run this SQL:
```sql
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;
```

You should see `CONSULTATION_RESCHEDULED` in the list.

### 2. Test Reschedule

1. Reschedule an appointment
2. Check backend logs - you should see:
   ```
   [NotificationsService] Notification created: <id>
   [Reschedule] Notification created successfully: <id>
   ```
3. Check database:
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'CONSULTATION_RESCHEDULED' 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

---

## Why This Happened

- The Prisma schema was updated (enum value added)
- But the **database enum** wasn't updated
- Prisma client was regenerated, but it still fails because the database doesn't have the value

**Solution:** Add the enum value directly to the database using SQL (PostgreSQL doesn't support adding enum values via migrations easily).

---

## After Fixing

Once you've:
1. ✅ Added enum value to database
2. ✅ Regenerated Prisma client
3. ✅ Restarted backend

Try rescheduling again. The notification should be created successfully!

---

## Still Not Working?

If you still get errors after these steps:

1. **Double-check the SQL ran successfully** - No errors in SQL editor
2. **Verify Prisma client regenerated** - Check `node_modules/.prisma/client` was updated
3. **Check backend restarted** - Look for "🚀 HuntZen Care API running..." message
4. **Share the new error** - If there's a different error, share it

---

That's it! The enum value just needs to be added to the database.
