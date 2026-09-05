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

export interface EventOccurrence {
  sessionDate: string; // YYYY-MM-DD
  startAtIso: string;
  endAtIso: string;
  isToday: boolean;
  isOngoing: boolean;
  isPast: boolean;
}

/**
 * Calculates the next active/upcoming occurrence for any event (recurring or one-off) in WAT.
 */
export function getNextEventOccurrence(ev: {
  is_recurring: boolean;
  recurrence_rule?: string | null;
  start_at: string;
  end_at: string;
  title?: string;
}): EventOccurrence {
  const now = new Date();

  // If not recurring, it is a one-off event:
  if (!ev.is_recurring) {
    const sDate = new Date(ev.start_at);
    const eDate = new Date(ev.end_at);
    const sessionDate = sDate.toLocaleDateString('en-CA', { timeZone: WAT_TIMEZONE });
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: WAT_TIMEZONE });
    const isToday = sessionDate === todayStr;
    const isOngoing = now >= sDate && now <= eDate;
    const isPast = now > eDate;
    return {
      sessionDate,
      startAtIso: ev.start_at,
      endAtIso: ev.end_at,
      isToday,
      isOngoing,
      isPast,
    };
  }

  // If recurring, calculate the upcoming occurrence relative to now in WAT:
  const watNowStr = now.toLocaleDateString('en-CA', { timeZone: WAT_TIMEZONE });
  const [year, month, day] = watNowStr.split('-').map(Number);
  const nowInWat = new Date(year, month - 1, day);

  let targetDay = 2; // Default Tuesday
  const rule = (ev.recurrence_rule || '').toUpperCase();
  const title = (ev.title || '').toLowerCase();

  if (rule.includes(':SUN') || title.includes('sunday')) targetDay = 0;
  else if (rule.includes(':MON') || title.includes('monday')) targetDay = 1;
  else if (rule.includes(':TUE') || title.includes('tuesday')) targetDay = 2;
  else if (rule.includes(':WED') || title.includes('wednesday')) targetDay = 3;
  else if (rule.includes(':THU') || title.includes('thursday')) targetDay = 4;
  else if (rule.includes(':FRI') || title.includes('friday')) targetDay = 5;
  else if (rule.includes(':SAT') || title.includes('saturday')) targetDay = 6;
  else {
    const sDate = new Date(ev.start_at);
    targetDay = sDate.getDay();
  }

  const currentDay = nowInWat.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;

  // Extract start and end time strings (HH:mm) from original start_at & end_at
  const origStart = new Date(ev.start_at);
  const origEnd = new Date(ev.end_at);

  const startTimeStr = origStart.toLocaleTimeString('en-GB', {
    timeZone: WAT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTimeStr = origEnd.toLocaleTimeString('en-GB', {
    timeZone: WAT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });

  // Today's occurrence candidate:
  const candidateDate = new Date(year, month - 1, day + daysUntil);
  const candidateDateStr = candidateDate.toLocaleDateString('en-CA');
  const candidateStartIso = createIsoWAT(candidateDateStr, startTimeStr);
  const candidateEndIso = createIsoWAT(candidateDateStr, endTimeStr);

  const candEnd = new Date(candidateEndIso);

  // If today is target day and the session has already ended, advance by 7 days
  if (daysUntil === 0 && now > candEnd) {
    daysUntil = 7;
    const nextDate = new Date(year, month - 1, day + daysUntil);
    const nextDateStr = nextDate.toLocaleDateString('en-CA');
    const nextStartIso = createIsoWAT(nextDateStr, startTimeStr);
    const nextEndIso = createIsoWAT(nextDateStr, endTimeStr);
    return {
      sessionDate: nextDateStr,
      startAtIso: nextStartIso,
      endAtIso: nextEndIso,
      isToday: false,
      isOngoing: false,
      isPast: false,
    };
  }

  const isToday = candidateDateStr === watNowStr;
  const candStart = new Date(candidateStartIso);
  const isOngoing = now >= candStart && now <= candEnd;

  return {
    sessionDate: candidateDateStr,
    startAtIso: candidateStartIso,
    endAtIso: candidateEndIso,
    isToday,
    isOngoing,
    isPast: false,
  };
}
