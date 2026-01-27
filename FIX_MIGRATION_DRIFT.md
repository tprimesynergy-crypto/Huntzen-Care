# Fix Migration Drift - Add CONSULTATION_RESCHEDULED Enum

## Problem
Your database has migrations that aren't in your local directory, causing a "drift" error. We'll add the enum value directly without creating a migration.

## Solution: Add Enum Value Directly

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

4. Click **Run**

### Option 2: Using psql Command Line

```bash
# Connect to your database
psql "your-database-connection-string"

# Then run:
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

### Option 3: Using Prisma Studio

1. Open Prisma Studio:
```bash
cd backend-api
npx prisma studio
```

2. This won't let you run SQL directly, but you can verify the enum exists after running Option 1 or 2.

---

## After Adding the Enum Value

### Step 1: Regenerate Prisma Client

```bash
cd backend-api
npx prisma generate
```

This updates the TypeScript types to include the new enum value.

### Step 2: Restart Backend

```bash
npm run start:dev
```

### Step 3: Test

1. Reschedule an appointment
2. Check backend logs - you should see:
   ```
   [Reschedule] Notification created successfully: <id>
   ```
3. Check the other party's notifications - they should see the notification

---

## Verify It Worked

### Check Enum Values in Database

Run this SQL query:

```sql
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;
```

You should see `CONSULTATION_RESCHEDULED` in the list.

### Check Backend Logs

When you reschedule, you should see:
- `[Reschedule] Creating notification for practitioner/employee: <user-id>`
- `[Reschedule] Notification created successfully: <notification-id>`

No errors about enum values.

---

## Why This Approach?

- **Safe**: Doesn't require resetting the database
- **Quick**: Just one SQL command
- **No data loss**: All existing data remains intact
- **Works with drift**: Doesn't require fixing migration history

---

## Alternative: Fix Migration Drift (If Needed Later)

If you want to sync your local migrations with the database later:

```bash
# Mark existing migrations as applied (without running them)
npx prisma migrate resolve --applied 20250122_create_roles
npx prisma migrate resolve --applied 20250122_fix_roles_ids_and_defaults
npx prisma migrate resolve --applied 20250122_create_all_tables

# Then you can create new migrations normally
```

But for now, just adding the enum value directly is the safest and quickest solution.

---

## Files Created

- `ADD_ENUM_VALUE.sql` - SQL script to add the enum value
- This guide

Run the SQL command, regenerate Prisma client, and restart your backend. The notifications should work!
