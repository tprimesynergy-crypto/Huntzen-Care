# Debug: Notification Not Being Created

## Step 1: Check Backend Console Logs

When you reschedule an appointment, check your **backend terminal** (where `npm run start:dev` is running).

You should see logs like:
```
[Reschedule] Employee rescheduled, practitionerUserId: <id>
[Reschedule] Creating notification for practitioner: <id>
[NotificationsService] Creating notification: { userId: '...', type: 'CONSULTATION_RESCHEDULED', ... }
```

**OR** you'll see an error. Common errors:

### Error 1: Enum Value Doesn't Exist
```
Invalid value for enum NotificationType: CONSULTATION_RESCHEDULED
```
**Fix:** Add the enum value to the database (see Step 2)

### Error 2: Prisma Client Not Regenerated
```
Type 'CONSULTATION_RESCHEDULED' is not assignable to type 'NotificationType'
```
**Fix:** Run `npx prisma generate` (see Step 3)

### Error 3: User ID Not Found
```
[Reschedule] No practitioner user ID found in consultation
```
**Fix:** Check if consultation has proper relations loaded

---

## Step 2: Add Enum Value to Database

### If Using Supabase:

1. Go to **SQL Editor**
2. Run this SQL:

```sql
-- Check current enum values
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;

-- Add the enum value if missing
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';

-- Verify it was added (run first query again)
```

### If Using Direct Database Access:

Run the same SQL commands in your database client.

---

## Step 3: Regenerate Prisma Client

After adding the enum value:

```bash
cd backend-api
npx prisma generate
```

This updates TypeScript types to include the new enum value.

---

## Step 4: Restart Backend

```bash
# Stop current backend (Ctrl+C)
npm run start:dev
```

---

## Step 5: Test Again

1. Reschedule an appointment
2. **Check backend console** - you should see:
   ```
   [NotificationsService] Notification created: <id>
   ```
3. **Check database** - run this SQL:
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'CONSULTATION_RESCHEDULED' 
   ORDER BY "createdAt" DESC 
   LIMIT 5;
   ```

---

## Step 6: Manual Test (If Still Not Working)

Create a test notification directly in the database to verify everything works:

```sql
-- Get a user ID
SELECT id, email FROM users WHERE role = 'PRACTITIONER' LIMIT 1;

-- Create test notification (replace USER_ID with actual ID from above)
INSERT INTO notifications ("userId", type, title, message, "isRead", "createdAt")
VALUES (
  'USER_ID_FROM_ABOVE',
  'CONSULTATION_RESCHEDULED',
  'Test Notification',
  'This is a test notification',
  false,
  NOW()
);

-- Check if it was created
SELECT * FROM notifications WHERE type = 'CONSULTATION_RESCHEDULED' ORDER BY "createdAt" DESC;
```

If this works, the issue is in the code. If it fails, the enum value doesn't exist.

---

## Common Issues Checklist

- [ ] Enum value `CONSULTATION_RESCHEDULED` exists in database
- [ ] Prisma client regenerated (`npx prisma generate`)
- [ ] Backend restarted after changes
- [ ] Backend logs show notification creation attempt
- [ ] No errors in backend console
- [ ] User IDs are being retrieved correctly (check logs)

---

## What to Share for Debugging

If it's still not working, share:

1. **Backend console logs** when you reschedule (copy the entire output)
2. **Result of this SQL query:**
   ```sql
   SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;
   ```
3. **Any errors** from the backend terminal

This will help identify the exact issue.
