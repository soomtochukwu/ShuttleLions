-- ============================================================
-- ShuttleLions: RSVPs, Notification Preferences & Dispatches
-- Migration: 20260905000001_rsvps_and_notifications.sql
-- ============================================================

-- 1. Add notification preference columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_device BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_1h_before BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_30m_before BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;

-- 2. Enhance event_rsvps table with session_date
ALTER TABLE event_rsvps
  ADD COLUMN IF NOT EXISTS session_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Drop old unique constraint if present to allow session_date unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'event_rsvps_event_id_profile_id_key'
  ) THEN
    ALTER TABLE event_rsvps DROP CONSTRAINT event_rsvps_event_id_profile_id_key;
  END IF;
END $$;

-- Create session-date based unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'event_rsvps_event_id_profile_id_session_date_key'
  ) THEN
    ALTER TABLE event_rsvps
      ADD CONSTRAINT event_rsvps_event_id_profile_id_session_date_key
      UNIQUE (event_id, profile_id, session_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rsvps_event_session ON event_rsvps(event_id, session_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_profile_session ON event_rsvps(profile_id, session_date);

-- 3. In-App Notifications & Audit Logs Table
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id  UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL if broadcast to all
  title         TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  type          TEXT NOT NULL DEFAULT 'game_reminder',
  channels      TEXT[] NOT NULL DEFAULT ARRAY['in_app', 'email', 'device'],
  metadata      JSONB DEFAULT '{}'::jsonb,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  email_sent    BOOLEAN NOT NULL DEFAULT false,
  device_sent   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist on notifications
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'game_reminder',
  ADD COLUMN IF NOT EXISTS channels TEXT[] NOT NULL DEFAULT ARRAY['in_app', 'email', 'device'],
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 4. Notification Dispatches (Deduplication table for 1h and 30m reminders)
CREATE TABLE IF NOT EXISTS notification_dispatches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type   TEXT NOT NULL CHECK (reminder_type IN ('1h_before', '30m_before', 'admin_manual', 'rsvp_confirm')),
  dispatched_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, session_date, profile_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_notif_dispatches_lookup ON notification_dispatches(event_id, session_date, profile_id, reminder_type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can read their own notifications'
  ) THEN
    CREATE POLICY "Users can read their own notifications"
      ON notifications FOR SELECT
      USING (recipient_id IS NULL OR auth.uid()::text = recipient_id::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Authenticated users can read RSVPs'
  ) THEN
    CREATE POLICY "Authenticated users can read RSVPs"
      ON event_rsvps FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can insert their own RSVPs'
  ) THEN
    CREATE POLICY "Users can insert their own RSVPs"
      ON event_rsvps FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid()::text = profile_id::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can update their own RSVPs'
  ) THEN
    CREATE POLICY "Users can update their own RSVPs"
      ON event_rsvps FOR UPDATE
      TO authenticated
      USING (auth.uid()::text = profile_id::text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can delete their own RSVPs'
  ) THEN
    CREATE POLICY "Users can delete their own RSVPs"
      ON event_rsvps FOR DELETE
      TO authenticated
      USING (auth.uid()::text = profile_id::text);
  END IF;
END $$;
