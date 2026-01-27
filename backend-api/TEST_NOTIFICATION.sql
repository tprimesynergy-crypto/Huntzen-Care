-- Test script to verify notification creation works
-- Run this in your database SQL editor

-- 1. Check if enum value exists
SELECT unnest(enum_range(NULL::"NotificationType")) AS notification_type;

-- 2. If CONSULTATION_RESCHEDULED is missing, add it:
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';

-- 3. Verify it was added (run step 1 again)

-- 4. Test creating a notification manually (replace USER_ID with an actual user ID from your users table)
-- First, get a user ID:
SELECT id, email FROM users LIMIT 1;

-- Then create a test notification (replace 'USER_ID_HERE' with actual user ID):
-- INSERT INTO notifications ("userId", type, title, message, "isRead", "createdAt")
-- VALUES ('USER_ID_HERE', 'CONSULTATION_RESCHEDULED', 'Test Notification', 'This is a test', false, NOW());

-- 5. Check if it was created:
-- SELECT * FROM notifications WHERE type = 'CONSULTATION_RESCHEDULED' ORDER BY "createdAt" DESC LIMIT 5;
