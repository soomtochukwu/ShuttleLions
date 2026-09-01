-- ============================================================
-- 009: WEEKLY TRAINING SCHEDULES & EVENT MANAGEMENT POLICIES
-- ============================================================

-- 1. Ensure RLS on events permits authorized roles
DROP POLICY IF EXISTS events_read_all ON events;
DROP POLICY IF EXISTS events_write_admin ON events;
DROP POLICY IF EXISTS events_write_authorized ON events;

CREATE POLICY events_read_all ON events FOR SELECT USING (true);

CREATE POLICY events_write_authorized ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.auth_user_id = auth.uid()
        AND (
          p.role IN ('admin', 'captain')
          OR cr.can_manage_schedule = true
          OR (p.role IS NOT NULL AND p.role != 'member')
        )
    )
  );

-- 2. Clear old test routine events if any and seed official weekly schedule
DELETE FROM events WHERE is_recurring = true;

INSERT INTO events (title, description, event_type, location, start_at, end_at, is_recurring, recurrence_rule, status)
VALUES
  (
    'Tuesday Varsity Training & Conditioning',
    'High-intensity tactical footwork, multi-shuttle smash-and-net drills, and singles matchplay conditioning.',
    'training',
    'UNN Indoor Sports Hall (Courts 1-3)',
    '2026-09-01T16:00:00Z',
    '2026-09-01T18:00:00Z',
    true,
    'WEEKLY:TUE:16:00',
    'upcoming'
  ),
  (
    'Saturday In-House Tournament & Doubles Championship',
    'Weekly club tournament brackets, competitive singles & doubles points league, and varsity match sparring.',
    'competition',
    'UNN Indoor Sports Hall',
    '2026-09-05T07:00:00Z',
    '2026-09-05T10:00:00Z',
    true,
    'WEEKLY:SAT:07:00',
    'upcoming'
  ),
  (
    'Sunday Afternoon Open Rallies & Club Matchplay',
    'Casual and competitive open club matchplay, tactical doubles rotations, and umpire practice.',
    'training',
    'UNN Main Gymnasium',
    '2026-09-06T16:00:00Z',
    '2026-09-06T18:30:00Z',
    true,
    'WEEKLY:SUN:16:00',
    'upcoming'
  );
