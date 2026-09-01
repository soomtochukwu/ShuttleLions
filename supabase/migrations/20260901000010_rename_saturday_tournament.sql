-- ============================================================
-- 010: RENAME SATURDAY ROUTINE TO IN-HOUSE TOURNAMENT
-- ============================================================

UPDATE events
SET
  title = 'Saturday In-House Tournament & Doubles Championship',
  description = 'Weekly club tournament brackets, competitive singles & doubles points league, and varsity match sparring.',
  event_type = 'competition',
  updated_at = now()
WHERE recurrence_rule = 'WEEKLY:SAT:07:00' OR title LIKE '%Saturday%';
