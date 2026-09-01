-- ============================================================
-- 006: MEDIA STORAGE BUCKET & FILE UPLOAD CAPABILITIES
-- ============================================================

-- 1. Create public storage bucket for media gallery & avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-gallery',
  'media-gallery',
  true,
  104857600, -- 100MB max
  ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies
-- Public Read for all files in media-gallery
CREATE POLICY "media_gallery_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-gallery');

-- Authenticated upload for media-gallery
CREATE POLICY "media_gallery_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-gallery' AND auth.role() = 'authenticated'
  );

-- Uploader/admin update and delete
CREATE POLICY "media_gallery_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media-gallery' AND auth.role() = 'authenticated'
  );

CREATE POLICY "media_gallery_auth_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media-gallery' AND auth.role() = 'authenticated'
  );

-- 3. Ensure columns exist on media_uploads table
ALTER TABLE media_uploads
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;
