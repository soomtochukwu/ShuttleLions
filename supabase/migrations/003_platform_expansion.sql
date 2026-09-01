-- ============================================================
-- ShuttleLions: Full Platform Expansion Migration
-- Migration: 003_platform_expansion.sql
-- ============================================================

-- 1. EVENTS & SCHEDULES
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  event_type      TEXT NOT NULL DEFAULT 'training'
    CHECK (event_type IN ('training', 'competition', 'social', 'meeting', 'workshop')),
  location        TEXT NOT NULL DEFAULT 'UNN Indoor Sports Hall',
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  is_recurring    BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT, -- e.g. 'WEEKLY:MON,WED,SAT'
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 2. EVENT RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'going'
    CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_profile ON event_rsvps(profile_id);

-- 3. CHAT CHANNELS
CREATE TABLE IF NOT EXISTS chat_channels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  icon        TEXT NOT NULL DEFAULT '💬',
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id    UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  message_type  TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'system', 'announcement')),
  media_url     TEXT,
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_channel_created ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id);

-- 5. POLLS & VOTING
CREATE TABLE IF NOT EXISTS polls (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  poll_type     TEXT NOT NULL DEFAULT 'single'
    CHECK (poll_type IN ('single', 'multi')),
  status        TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),
  closes_at     TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id       UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  vote_count    INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);

CREATE TABLE IF NOT EXISTS poll_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id     UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id   UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  voter_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(poll_id, option_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter ON poll_votes(voter_id);

-- 6. MEDIA & VLOGS
CREATE TABLE IF NOT EXISTS media_uploads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  media_type    TEXT NOT NULL DEFAULT 'video'
    CHECK (media_type IN ('video', 'image', 'vlog')),
  media_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  category      TEXT NOT NULL DEFAULT 'training'
    CHECK (category IN ('training', 'competition', 'social', 'highlights', 'drills')),
  likes_count   INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  views_count   INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_category ON media_uploads(category);
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media_uploads(uploader_id);

CREATE TABLE IF NOT EXISTS media_comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id      UUID NOT NULL REFERENCES media_uploads(id) ON DELETE CASCADE,
  commenter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_comments_media ON media_comments(media_id);

CREATE TABLE IF NOT EXISTS media_likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id    UUID NOT NULL REFERENCES media_uploads(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(media_id, profile_id)
);

-- 7. SHOP PRODUCTS & EXECUTIVE PROCUREMENT ORDERS
CREATE TABLE IF NOT EXISTS shop_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'racket'
    CHECK (category IN ('racket', 'shuttlecock', 'grip', 'string', 'shoes', 'bag', 'apparel')),
  brand           TEXT NOT NULL DEFAULT 'Yonex',
  price_kobo      INTEGER NOT NULL CHECK (price_kobo > 0),
  image_url       TEXT,
  stock_status    TEXT NOT NULL DEFAULT 'in_stock'
    CHECK (stock_status IN ('in_stock', 'pre_order', 'out_of_stock')),
  specs           JSONB, -- e.g. { "weight": "4U (83g)", "balance": "Head Heavy", "flex": "Medium" }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_category ON shop_products(category);

CREATE TABLE IF NOT EXISTS shop_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
  quantity              INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price_kobo      INTEGER NOT NULL CHECK (total_price_kobo > 0),
  assigned_executive_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'procuring', 'ready_for_pickup', 'delivered', 'cancelled')),
  payment_id            UUID REFERENCES payments(id) ON DELETE SET NULL,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_profile ON shop_orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);

-- 8. TUTORIALS
CREATE TABLE IF NOT EXISTS tutorials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL DEFAULT '',
  content_md    TEXT NOT NULL,
  video_url     TEXT,
  thumbnail_url TEXT,
  category      TEXT NOT NULL DEFAULT 'basics'
    CHECK (category IN ('basics', 'footwork', 'strokes', 'tactics', 'rules', 'conditioning')),
  difficulty    TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  read_time_min INTEGER NOT NULL DEFAULT 5,
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_difficulty ON tutorials(difficulty);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'general'
    CHECK (type IN ('general', 'payment', 'event', 'poll', 'order', 'chat')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  link_url    TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id, is_read);

-- 10. SITE ASSETS (PERSISTENCE FOR PARALLAX & LANDING)
CREATE TABLE IF NOT EXISTS site_assets (
  id            TEXT PRIMARY KEY, -- e.g. 'courtEntrance', 'playerServer'
  name          TEXT NOT NULL,
  asset_url     TEXT NOT NULL,
  alt_text      TEXT NOT NULL DEFAULT '',
  depth_multiplier NUMERIC NOT NULL DEFAULT 0.0,
  scale_min     NUMERIC NOT NULL DEFAULT 1.0,
  scale_max     NUMERIC NOT NULL DEFAULT 1.0,
  updated_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_polls_updated_at BEFORE UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_media_uploads_updated_at BEFORE UPDATE ON media_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shop_products_updated_at BEFORE UPDATE ON shop_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shop_orders_updated_at BEFORE UPDATE ON shop_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tutorials_updated_at BEFORE UPDATE ON tutorials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_assets ENABLE ROW LEVEL SECURITY;

-- Events: Everyone can view events, admins/captains can modify
CREATE POLICY events_read_all ON events FOR SELECT USING (true);
CREATE POLICY events_write_admin ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'captain'))
);

-- RSVPs: Authenticated users manage own RSVPs
CREATE POLICY rsvps_read_all ON event_rsvps FOR SELECT USING (true);
CREATE POLICY rsvps_manage_own ON event_rsvps FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Chat: Channels public to view, messages accessible to authenticated profiles
CREATE POLICY chat_channels_read_all ON chat_channels FOR SELECT USING (true);
CREATE POLICY chat_messages_read ON chat_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Polls: Public to read, votes managed by individual voter
CREATE POLICY polls_read_all ON polls FOR SELECT USING (true);
CREATE POLICY poll_options_read_all ON poll_options FOR SELECT USING (true);
CREATE POLICY poll_votes_read_all ON poll_votes FOR SELECT USING (true);
CREATE POLICY poll_votes_insert ON poll_votes FOR INSERT WITH CHECK (
  voter_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Media & Tutorials: Public read
CREATE POLICY media_read_all ON media_uploads FOR SELECT USING (true);
CREATE POLICY media_insert_auth ON media_uploads FOR INSERT WITH CHECK (
  uploader_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY media_comments_read_all ON media_comments FOR SELECT USING (true);
CREATE POLICY media_comments_insert ON media_comments FOR INSERT WITH CHECK (
  commenter_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY media_likes_manage ON media_likes FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY shop_products_read_all ON shop_products FOR SELECT USING (true);
CREATE POLICY shop_orders_read_own ON shop_orders FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'captain'))
);
CREATE POLICY shop_orders_insert_own ON shop_orders FOR INSERT WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY tutorials_read_all ON tutorials FOR SELECT USING (is_published = true);
CREATE POLICY notifications_read_own ON notifications FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY site_assets_read_all ON site_assets FOR SELECT USING (true);
CREATE POLICY site_assets_write_admin ON site_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'captain'))
);
