-- ============================================================
-- 011: EVENTS GPS COORDINATES & VENUE RENAMING
-- ============================================================

-- 1. Add GPS Coordinate Columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS map_url TEXT;

-- 2. Update existing default events to "UNN Badminton Court" with UNN GPS Coordinates
UPDATE events
SET
  location = 'UNN Badminton Court',
  latitude = 6.8688,
  longitude = 7.4074,
  map_url = 'https://www.google.com/maps/search/?api=1&query=UNN+Badminton+Court+Nsukka',
  updated_at = now()
WHERE location LIKE '%UNN%' OR is_recurring = true;
