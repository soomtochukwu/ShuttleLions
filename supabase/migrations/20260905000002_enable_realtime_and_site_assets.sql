-- ============================================================
-- Migration: 20260905000002_enable_realtime_and_site_assets.sql
-- Seed default parallax assets and add tables to supabase_realtime
-- ============================================================

-- 1. Create site_assets table if not exists
CREATE TABLE IF NOT EXISTS site_assets (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  asset_url        TEXT NOT NULL,
  alt_text         TEXT NOT NULL DEFAULT '',
  depth_multiplier NUMERIC NOT NULL DEFAULT 0.0,
  scale_min        NUMERIC NOT NULL DEFAULT 1.0,
  scale_max        NUMERIC NOT NULL DEFAULT 1.0,
  updated_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_assets ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_assets' AND policyname = 'site_assets_read_public'
  ) THEN
    CREATE POLICY site_assets_read_public ON site_assets FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_assets' AND policyname = 'site_assets_write_all'
  ) THEN
    CREATE POLICY site_assets_write_all ON site_assets FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. Seed default parallax assets if not already populated
INSERT INTO site_assets (id, name, asset_url, alt_text, depth_multiplier, scale_min, scale_max)
VALUES
  ('courtEntrance', 'Badminton Court Arena Entrance', '/images/parallax/court-entrance.jpg', 'UNN Indoor Badminton Arena Court Entrance', -0.25, 1.0, 1.15),
  ('playerServer', 'Serving Badminton Athlete', '/images/parallax/player-server.png', 'ShuttleLions varsity athlete preparing explosive service', 0.15, 0.95, 1.05),
  ('playerReceiver', 'Receiving Badminton Athlete', '/images/parallax/player-receiver.png', 'ShuttleLions varsity athlete in ready stance to smash return', 0.18, 0.95, 1.05),
  ('courtFloorOverlay', 'Perspective Court Markings', '/images/parallax/court-floor.png', 'Standard BWF Badminton Court Green Mat & Boundary Lines', -0.10, 1.0, 1.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Add notifications and site_assets to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_assets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE site_assets;
  END IF;
END $$;
