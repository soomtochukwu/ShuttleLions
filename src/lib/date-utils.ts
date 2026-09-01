/**
 * Unified Date and Time utilities enforcing West Africa Time (WAT / UTC+1, 'Africa/Lagos')
 */

export const WAT_TIMEZONE = 'Africa/Lagos';

/**
 * Formats an ISO string or Date object into 12-hour WAT time string.
 * Example: '4:00 PM WAT' or '12:00 PM WAT'
 */
export function formatTimeWAT(dateInput: string | Date): string {
 try {
 const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
 if (isNaN(d.getTime())) return '';
 const timeStr = d.toLocaleTimeString('en-US', {
 timeZone: WAT_TIMEZONE,
 hour: 'numeric',
 minute: '2-digit',
 hour12: true,
 });
 return `${timeStr} WAT`;
 } catch (e) {
 return '';
 }
}

/**
 * Formats start and end times into a clean WAT range.
 * Example: '4:00 PM – 6:30 PM WAT' or '7:00 AM – 12:00 PM WAT'
 */
export function formatTimeRangeWAT(startInput: string | Date, endInput: string | Date): string {
 try {
 const start = typeof startInput === 'string' ? new Date(startInput) : startInput;
 const end = typeof endInput === 'string' ? new Date(endInput) : endInput;

 if (isNaN(start.getTime())) return '';

 const startStr = start.toLocaleTimeString('en-US', {
 timeZone: WAT_TIMEZONE,
 hour: 'numeric',
 minute: '2-digit',
 hour12: true,
 });

 if (isNaN(end.getTime())) {
 return `${startStr} WAT`;
 }

 const endStr = end.toLocaleTimeString('en-US', {
 timeZone: WAT_TIMEZONE,
 hour: 'numeric',
 minute: '2-digit',
 hour12: true,
 });

 return `${startStr} – ${endStr} WAT`;
 } catch (e) {
 return '';
 }
}

/**
 * Formats an ISO string into a full date and time string in WAT.
 * Example: 'Sat, 5 Sep 2026 • 7:00 AM – 12:00 PM WAT'
 */
export function formatFullDateTimeRangeWAT(startInput: string | Date, endInput: string | Date): string {
 try {
 const start = typeof startInput === 'string' ? new Date(startInput) : startInput;
 const end = typeof endInput === 'string' ? new Date(endInput) : endInput;

 if (isNaN(start.getTime())) return '';

 const dateStr = start.toLocaleDateString('en-GB', {
 timeZone: WAT_TIMEZONE,
 weekday: 'short',
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 });

 const rangeStr = formatTimeRangeWAT(start, end);
 return `${dateStr} • ${rangeStr}`;
 } catch (e) {
 return '';
 }
}

/**
 * Constructs an ISO-8601 string explicitly tagged with West Africa Time (+01:00).
 * Example: dateStr: '2026-09-01', timeStr: '16:00' -> '2026-09-01T16:00:00+01:00'
 */
export function createIsoWAT(dateStr: string, timeStr: string): string {
 const cleanDate = dateStr.trim();
 const cleanTime = timeStr.trim().length === 5 ? `${timeStr.trim()}:00` : timeStr.trim();
 return `${cleanDate}T${cleanTime}+01:00`;
}
