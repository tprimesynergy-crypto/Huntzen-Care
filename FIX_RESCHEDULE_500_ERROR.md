# Fix: Reschedule 500 Error

## Problem
When rescheduling an appointment, you get a **500 Internal Server Error**, but the appointment time is actually updated. This happens because the notification creation fails.

## Root Cause
The `CONSULTATION_RESCHEDULED` enum value doesn't exist in the database yet. The migration hasn't been run.

## Solution

### Step 1: Run the Database Migration

```bash
cd backend-api
npx prisma migrate dev --name add_consultation_rescheduled_notification
```

This will:
- Create a migration file
- Add `CONSULTATION_RESCHEDULED` to the `NotificationType` enum
- Apply the migration to your database

### Step 2: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 3: Restart Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
npm run start:dev
```

### Step 4: Test Again

1. Try rescheduling an appointment
2. It should work without the 500 error
3. The other party should receive a notification

---

## What Was Fixed

1. **Error Handling**: Added try-catch around notification creation so rescheduling won't fail even if notifications fail
2. **Migration Required**: You need to run the migration to add the new enum value

---

## If Migration Fails

If you get an error like "enum value already exists", you can manually add it:

```sql
-- Connect to your database
-- Then run:
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

Then regenerate Prisma client:
```bash
npx prisma generate
```

---

## Verify It's Working

After running the migration:

1. **Reschedule an appointment** as an employee
2. **Check practitioner's notifications** - they should see "Consultation reprogrammée"
3. **Reschedule as practitioner** (if that feature exists)
4. **Check employee's notifications** - they should see the notification

---

## Backend Console

Check your backend terminal - you should see:
- No errors when rescheduling
- If notification creation fails, you'll see: `Failed to create reschedule notification: [error]` (but reschedule still succeeds)

---

## Quick Fix Summary

```bash
# 1. Navigate to backend
cd backend-api

# 2. Create and run migration
npx prisma migrate dev --name add_consultation_rescheduled_notification

# 3. Regenerate Prisma client
npx prisma generate

# 4. Restart backend
npm run start:dev
```

That's it! The reschedule should now work without errors, and notifications will be created.
