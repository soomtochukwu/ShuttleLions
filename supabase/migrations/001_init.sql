-- Neo-Pop Crush Confessor - Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  sender_whatsapp TEXT NOT NULL,
  crush_x_handle TEXT NOT NULL,
  ai_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected_paid')),
  payment_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for creating requests)
CREATE POLICY "Allow anonymous inserts" ON requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous reads (for viewing request by link ID)
CREATE POLICY "Allow anonymous reads" ON requests
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous updates (for status changes)
CREATE POLICY "Allow anonymous updates" ON requests
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
