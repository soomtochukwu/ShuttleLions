-- ============================================================
-- ShuttleLions: Fix Notifications Constraints & Align Schema
-- Migration: 20260905000003_fix_notifications_schema.sql
-- ============================================================

-- 1. Drop NOT NULL on profile_id and body if present
ALTER TABLE notifications
  ALTER COLUMN profile_id DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'body' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE notifications ALTER COLUMN body DROP NOT NULL;
  END IF;
END $$;

-- 2. Drop type check constraint if present to allow 'game_reminder', 'admin_broadcast', etc.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

-- 3. Trigger to keep profile_id & recipient_id, body & message synchronized
CREATE OR REPLACE FUNCTION sync_notification_recipient()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_id IS NULL AND NEW.recipient_id IS NOT NULL THEN
    NEW.profile_id := NEW.recipient_id;
  END IF;
  IF NEW.recipient_id IS NULL AND NEW.profile_id IS NOT NULL THEN
    NEW.recipient_id := NEW.profile_id;
  END IF;
  IF NEW.body IS NULL AND NEW.message IS NOT NULL THEN
    NEW.body := NEW.message;
  END IF;
  IF NEW.message IS NULL AND NEW.body IS NOT NULL THEN
    NEW.message := NEW.body;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notification_recipient ON notifications;
CREATE TRIGGER trg_sync_notification_recipient
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_notification_recipient();
