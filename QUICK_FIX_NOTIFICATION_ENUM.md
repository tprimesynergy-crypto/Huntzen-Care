# Quick Fix: Add CONSULTATION_RESCHEDULED Enum Value

## Step 1: Check Current Enum Values

In your database SQL editor (Supabase SQL Editor or your DB client), run:

```sql
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;
```

**Expected output:**
```
notification_type
------------------
CONSULTATION_CONFIRMED
CONSULTATION_CANCELLED
CONSULTATION_REMINDER_24H
MESSAGE_RECEIVED
NEWS_PUBLISHED
SYSTEM
```

**If `CONSULTATION_RESCHEDULED` is missing**, continue to Step 2.

## Step 2: Add the Enum Value

Run this SQL command:

```sql
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

The `IF NOT EXISTS` ensures it won't error if it already exists.

## Step 3: Verify It Was Added

Run Step 1 again. You should now see `CONSULTATION_RESCHEDULED` in the list.

## Step 4: Regenerate Prisma Client

```bash
cd backend-api
npx prisma generate
```

This updates TypeScript types to include the new enum value.

## Step 5: Restart Backend

```bash
npm run start:dev
```

## Step 6: Test

1. Reschedule an appointment
2. Check backend terminal logs - you should see:
   ```
   [Reschedule] Notification created successfully: <id>
   ```
3. Check the other party's notifications - they should see the notification

---

## If Using Supabase

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Paste the SQL command from Step 2
4. Click **Run** (or press Ctrl+Enter)
5. You should see: `Success. No rows returned`

---

## Troubleshooting

### Error: "enum value already exists"
- Good! It means the value is already there
- Skip to Step 4 (regenerate Prisma client)

### Error: "permission denied"
- You might need admin/owner permissions
- Contact your database administrator

### Still not working after adding enum?
- Check backend logs for the actual error
- Verify the notification was created in the database:
  ```sql
  SELECT * FROM notifications 
  WHERE type = 'CONSULTATION_RESCHEDULED' 
  ORDER BY "createdAt" DESC 
  LIMIT 5;
  ```

---

That's it! Once the enum value is added and Prisma client is regenerated, notifications should work.
