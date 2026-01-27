-- Add CONSULTATION_RESCHEDULED to NotificationType enum
-- Run this directly in your database (via psql, Supabase SQL editor, or your DB client)

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONSULTATION_RESCHEDULED';
