-- ShuttleLions: Badminton Registration Platform for UNN
-- Migration: 001_shuttlelions_init

-- ============================================================
-- Enable required extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id  UUID UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  faculty       TEXT NOT NULL DEFAULT '',
  department    TEXT NOT NULL DEFAULT '',
  level         TEXT NOT NULL DEFAULT '100'
    CHECK (level IN ('100','200','300','400','500','PG')),
  reg_number    TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member','admin','captain')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_faculty ON profiles(faculty);
CREATE INDEX idx_profiles_level ON profiles(level);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
    CHECK (type IN ('registration','monthly','racket')),
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed','refunded')),
  reference     TEXT UNIQUE NOT NULL,
  provider      TEXT NOT NULL DEFAULT 'paystack',
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_profile ON payments(profile_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_reference ON payments(reference);

-- ============================================================
-- RACKET ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS racket_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  racket_model    TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_kobo INTEGER NOT NULL CHECK (unit_price_kobo > 0),
  total_price_kobo INTEGER NOT NULL CHECK (total_price_kobo > 0),
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','ordered','shipped','delivered','cancelled')),
  payment_id      UUID REFERENCES payments(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_racket_orders_profile ON racket_orders(profile_id);
CREATE INDEX idx_racket_orders_status ON racket_orders(status);
CREATE INDEX idx_racket_orders_payment ON racket_orders(payment_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_racket_orders_updated_at
  BEFORE UPDATE ON racket_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE racket_orders ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Admins can see all profiles
CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('admin', 'captain')
    )
  );

-- Payments: users can see their own payments
CREATE POLICY payments_select_own ON payments
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY payments_insert_own ON payments
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can see all payments
CREATE POLICY payments_select_admin ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('admin', 'captain')
    )
  );

-- Racket Orders: users can see their own orders
CREATE POLICY racket_orders_select_own ON racket_orders
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY racket_orders_insert_own ON racket_orders
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can manage all racket orders
CREATE POLICY racket_orders_all_admin ON racket_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('admin', 'captain')
    )
  );
