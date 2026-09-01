-- ============================================================
-- 004: CUSTOM ROLES & EXECUTIVE APPOINTMENTS
-- ============================================================

-- 1. Remove rigid role check constraint on profiles to allow custom role strings
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Create custom_roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  badge_color         TEXT NOT NULL DEFAULT 'green',
  can_upload_media    BOOLEAN NOT NULL DEFAULT false,
  can_audit_finances  BOOLEAN NOT NULL DEFAULT false,
  can_manage_schedule BOOLEAN NOT NULL DEFAULT false,
  is_system           BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on custom_roles
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_roles_select_all ON custom_roles
  FOR SELECT USING (true);

CREATE POLICY custom_roles_admin_all ON custom_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('admin', 'captain')
    )
  );

-- 3. Seed Default System Roles
INSERT INTO custom_roles (id, title, description, badge_color, can_upload_media, can_audit_finances, can_manage_schedule, is_system)
VALUES
  ('admin', 'Executive Coach & Admin', 'Full club administration, finances, role appointments, and roster management.', 'amber', true, true, true, true),
  ('captain', 'Team Captain', 'Varsity athlete leadership, match squad selection, and training session coordination.', 'green', true, true, true, true),
  ('media_personnel', 'Media Personnel & Vlogger', 'Official content creator authorized to upload match highlights, tournament vlogs, and court photography.', 'cyan', true, false, false, true),
  ('treasurer', 'Club Treasurer', 'Financial audit officer managing club dues collection, budgeting, and equipment procurement.', 'emerald', false, true, false, true),
  ('member', 'Student Athlete', 'Active badminton club player participating in weekly drills, leagues, and community chat.', 'gray', false, false, false, true)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  can_upload_media = EXCLUDED.can_upload_media,
  can_audit_finances = EXCLUDED.can_audit_finances,
  can_manage_schedule = EXCLUDED.can_manage_schedule;
