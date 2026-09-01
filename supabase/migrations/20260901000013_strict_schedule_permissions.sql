-- ============================================================
-- 013: STRICT SCHEDULE PERMISSIONS (ADMIN & LOGISTICIAN ONLY)
-- ============================================================

-- 1. Ensure 'logistician' role exists in custom_roles
INSERT INTO custom_roles (id, title, description, badge_color, can_upload_media, can_audit_finances, can_manage_schedule, is_system)
VALUES
  (
    'logistician',
    'Club Logistician',
    'Equipment procurement, court logistics, and training & tournament schedule management.',
    'purple',
    false,
    false,
    true,
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  can_manage_schedule = true;

-- 2. Restrict events write policy strictly to Admin and Logistician roles
DROP POLICY IF EXISTS events_write_authorized ON events;
DROP POLICY IF EXISTS events_write_admin ON events;

CREATE POLICY events_write_authorized ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.auth_user_id = auth.uid()
        AND (
          p.role = 'admin'
          OR p.role ILIKE '%logistician%'
          OR (cr.can_manage_schedule = true AND (cr.id ILIKE '%logistician%' OR cr.title ILIKE '%logistician%'))
        )
    )
  );
