-- Step 1: Check current enum values
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;

-- Step 2: If CONSULTATION_RESCHEDULED is NOT in the list above, run this:
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';

-- Step 3: Verify it was added (run Step 1 again to see the updated list)
