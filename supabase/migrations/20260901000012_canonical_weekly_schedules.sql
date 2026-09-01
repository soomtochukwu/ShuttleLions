-- ============================================================
-- 012: CANONICAL WEEKLY SCHEDULES IN DATABASE
-- ============================================================

-- Clean up and insert canonical recurring schedules
DELETE FROM events WHERE is_recurring = true;

INSERT INTO events (
  id,
  title,
  description,
  event_type,
  location,
  start_at,
  end_at,
  is_recurring,
  recurrence_rule,
  latitude,
  longitude,
  map_url,
  status
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Tuesday Varsity Training & Footwork Conditioning',
    'High-intensity tactical footwork, multi-shuttle smash-and-net drills, and singles matchplay conditioning.',
    'training',
    'UNN Badminton Court',
    '2026-09-01T16:00:00Z',
    '2026-09-01T18:00:00Z',
    true,
    'WEEKLY:TUE:16:00',
    NULL,
    NULL,
    NULL,
    'upcoming'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Saturday In-House Tournament & Doubles Championship',
    'Weekly club tournament brackets, competitive singles & doubles points league, and varsity match sparring.',
    'competition',
    'UNN Badminton Court',
    '2026-09-05T07:00:00Z',
    '2026-09-05T10:00:00Z',
    true,
    'WEEKLY:SAT:07:00',
    NULL,
    NULL,
    NULL,
    'upcoming'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Sunday Afternoon Open Rallies & Club Matchplay',
    'Casual and competitive open club matchplay, tactical doubles rotations, and umpire practice.',
    'training',
    'UNN Badminton Court',
    '2026-09-06T16:00:00Z',
    '2026-09-06T18:30:00Z',
    true,
    'WEEKLY:SUN:16:00',
    NULL,
    NULL,
    NULL,
    'upcoming'
  );
