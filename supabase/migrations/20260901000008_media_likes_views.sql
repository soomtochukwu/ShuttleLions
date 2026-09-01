-- ============================================================
-- 008: ATOMIC MEDIA LIKES & VIEWS FUNCTIONS
-- ============================================================

-- 1. Ensure media_likes table exists with proper unique constraint
CREATE TABLE IF NOT EXISTS media_likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id    UUID NOT NULL REFERENCES media_uploads(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(media_id, profile_id)
);

ALTER TABLE media_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_likes_read_all" ON media_likes;
DROP POLICY IF EXISTS "media_likes_manage_own" ON media_likes;

CREATE POLICY "media_likes_read_all" ON media_likes FOR SELECT USING (true);
CREATE POLICY "media_likes_manage_own" ON media_likes FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- 2. Atomic Toggle Like Function
CREATE OR REPLACE FUNCTION public.toggle_media_like(p_media_id UUID, p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_new_count INTEGER;
BEGIN
  -- Check if already liked
  SELECT EXISTS(
    SELECT 1 FROM media_likes
    WHERE media_id = p_media_id AND profile_id = p_profile_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Unlike: Remove record and decrement counter
    DELETE FROM media_likes
    WHERE media_id = p_media_id AND profile_id = p_profile_id;

    UPDATE media_uploads
    SET likes_count = GREATEST(0, likes_count - 1),
        updated_at = now()
    WHERE id = p_media_id
    RETURNING likes_count INTO v_new_count;

    RETURN jsonb_build_object('liked', false, 'likes_count', COALESCE(v_new_count, 0));
  ELSE
    -- Like: Insert record and increment counter
    INSERT INTO media_likes (media_id, profile_id)
    VALUES (p_media_id, p_profile_id)
    ON CONFLICT (media_id, profile_id) DO NOTHING;

    UPDATE media_uploads
    SET likes_count = likes_count + 1,
        updated_at = now()
    WHERE id = p_media_id
    RETURNING likes_count INTO v_new_count;

    RETURN jsonb_build_object('liked', true, 'likes_count', COALESCE(v_new_count, 1));
  END IF;
END;
$$;

-- 3. Atomic Increment Views Function
CREATE OR REPLACE FUNCTION public.increment_media_views(p_media_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_views INTEGER;
BEGIN
  UPDATE media_uploads
  SET views_count = views_count + 1
  WHERE id = p_media_id
  RETURNING views_count INTO v_views;

  RETURN COALESCE(v_views, 1);
END;
$$;

-- Grant execution to authenticated & anon
GRANT EXECUTE ON FUNCTION public.toggle_media_like(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_media_views(UUID) TO authenticated, anon;
