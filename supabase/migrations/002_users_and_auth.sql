-- Rizz-14: Users & Auth Migration
-- Run this in your Supabase SQL Editor (or via the migration script)

-- ─── Users Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_user_id TEXT UNIQUE NOT NULL,
  x_handle TEXT NOT NULL,
  x_name TEXT,
  x_avatar_url TEXT,
  x_access_token TEXT,
  x_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by X user id
CREATE INDEX IF NOT EXISTS idx_users_x_user_id ON users(x_user_id);

-- ─── Add sender_user_id to requests ───────────────────────
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS sender_user_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_requests_sender_user_id ON requests(sender_user_id);

-- ─── RLS Policies for users ──────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow server-side inserts/updates (via anon key with service role or RLS bypass)
CREATE POLICY "Allow anonymous inserts on users" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous reads on users" ON users
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anonymous updates on users" ON users
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Auto-update updated_at ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
