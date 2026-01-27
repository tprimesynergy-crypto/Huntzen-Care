# Troubleshooting: Notification Not Sent After Reschedule

## Quick Diagnosis

### Step 1: Check Backend Console Logs

When you reschedule an appointment, check your **backend terminal** (where `npm run start:dev` is running). You should see logs like:

```
[Reschedule] Employee rescheduled, practitionerUserId: <user-id>
[Reschedule] Creating notification for practitioner: <user-id>
[Reschedule] Notification created successfully: <notification-id>
```

**OR** you might see errors:

```
[Reschedule] Failed to create reschedule notification: [error message]
```

### Step 2: Common Issues

#### Issue 1: Enum Value Doesn't Exist (Most Common)

**Error you'll see:**
```
Invalid value for enum NotificationType: CONSULTATION_RESCHEDULED
```

**Fix:**
```bash
cd backend-api
npx prisma migrate dev --name add_consultation_rescheduled_notification
npx prisma generate
# Restart backend
```

#### Issue 2: User ID Not Found

**Log you'll see:**
```
[Reschedule] No practitioner user ID found in consultation
```

**Cause:** The consultation doesn't have the user relation loaded properly.

**Fix:** The code should handle this, but if you see this, the consultation data might be incomplete.

#### Issue 3: Database Connection Issue

**Error you'll see:**
```
PrismaClientKnownRequestError: Can't reach database server
```

**Fix:** Check your database connection and `.env` file.

---

## Step-by-Step Debugging

### 1. Verify Migration Was Run

```bash
cd backend-api

# Check if migration exists
ls prisma/migrations/

# Check database enum values
# Connect to your database and run:
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;
```

You should see `CONSULTATION_RESCHEDULED` in the list.

### 2. Test Notification Creation Directly

Create a test file `test-notification.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    // Get a user ID (replace with actual user ID from your database)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No users found');
      return;
    }

    console.log('Testing notification creation for user:', user.id);

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'CONSULTATION_RESCHEDULED',
        title: 'Test Notification',
        message: 'This is a test notification',
        isRead: false,
      },
    });

    console.log('✅ Notification created successfully:', notification.id);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Run it:
```bash
npx ts-node test-notification.ts
```

### 3. Check Backend Logs During Reschedule

1. Open backend terminal
2. Reschedule an appointment
3. Look for these logs:
   - `[Reschedule] Employee rescheduled, practitionerUserId: ...`
   - `[Reschedule] Creating notification for practitioner: ...`
   - `[Reschedule] Notification created successfully: ...`

### 4. Verify Notification in Database

After rescheduling, check if notification was created:

```sql
-- Connect to your database
SELECT * FROM notifications 
WHERE type = 'CONSULTATION_RESCHEDULED' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

---

## Quick Fixes

### Fix 1: Run Migration (If Not Done)

```bash
cd backend-api
npx prisma migrate dev --name add_consultation_rescheduled_notification
npx prisma generate
npm run start:dev
```

### Fix 2: Manually Add Enum Value (If Migration Fails)

```sql
-- Connect to PostgreSQL
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
```

Then:
```bash
npx prisma generate
npm run start:dev
```

### Fix 3: Check User IDs Are Being Retrieved

The logs will show if user IDs are found. If you see:
```
[Reschedule] No practitioner user ID found
```

This means the consultation query isn't including the user relation. The code should handle this, but verify the consultation has the user data.

---

## Expected Behavior

### When Employee Reschedules:

1. **Backend logs:**
   ```
   [Reschedule] Employee rescheduled, practitionerUserId: abc-123-def
   [Reschedule] Creating notification for practitioner: abc-123-def
   [Reschedule] Notification created successfully: notif-xyz-789
   ```

2. **Database:** A notification is created for the practitioner's user ID

3. **Frontend:** Practitioner sees notification in their notification bell

### When Practitioner Reschedules:

1. **Backend logs:**
   ```
   [Reschedule] Practitioner rescheduled, employeeUserId: abc-123-def
   [Reschedule] Creating notification for employee: abc-123-def
   [Reschedule] Notification created successfully: notif-xyz-789
   ```

2. **Database:** A notification is created for the employee's user ID

3. **Frontend:** Employee sees notification in their notification bell

---

## Still Not Working?

1. **Share the backend logs** - Copy the logs from your backend terminal when you reschedule
2. **Check database** - Verify notifications table has the new notification
3. **Verify user IDs** - Make sure the consultation has both employee and practitioner with user relations
4. **Test enum value** - Run the test script above to verify notification creation works

---

## Next Steps

Once you identify the issue from the logs:
- If enum error → Run migration
- If user ID missing → Check consultation data structure
- If database error → Check connection and permissions
- If no error but no notification → Check notification query/filtering
