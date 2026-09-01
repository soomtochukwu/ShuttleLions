-- ============================================================
-- 007: MEDIA DELETION & MANAGEMENT POLICIES
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "media_delete_policy" ON media_uploads;
DROP POLICY IF EXISTS "media_update_policy" ON media_uploads;

-- Add DELETE policy on media_uploads:
-- Permitted for: uploader, admins, captains, or media_personnel
CREATE POLICY "media_delete_policy" ON media_uploads
  FOR DELETE USING (
    uploader_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR public.is_admin_or_captain(auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND (p.role = 'media_personnel' OR p.role = 'admin')
    )
  );

-- Add UPDATE policy on media_uploads:
CREATE POLICY "media_update_policy" ON media_uploads
  FOR UPDATE USING (
    uploader_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR public.is_admin_or_captain(auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND (p.role = 'media_personnel' OR p.role = 'admin')
    )
  );
