'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { triggerDeviceNotification, isNotificationSupported } from '@/lib/notifications';
import { supabase, type EventRSVP, type EventItem } from '@/lib/supabase';
import { formatTimeWAT } from '@/lib/date-utils';

export function NotificationScheduler() {
  const { user, isAuthenticated } = useAuth();
  const dispatchedLocalRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (user.notify_device === false) return;

    // Check interval every 60 seconds
    const interval = setInterval(async () => {
      try {
        const now = new Date();
        const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

        // 1. Fetch user's RSVPs for today
        const { data: userRsvps } = await supabase
          .from('event_rsvps')
          .select('event_id, session_date')
          .eq('profile_id', user.id)
          .eq('session_date', todayDateStr)
          .eq('status', 'going');

        if (!userRsvps || userRsvps.length === 0) return;

        const eventIds = userRsvps.map((r) => r.event_id);
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (!events || events.length === 0) return;

        for (const event of events) {
          const eventStart = new Date(event.start_at);
          const diffMs = eventStart.getTime() - now.getTime();
          const diffMinutes = Math.round(diffMs / (1000 * 60));

          // 1 Hour Reminder (50 to 65 mins)
          if (diffMinutes >= 50 && diffMinutes <= 65 && user.notify_1h_before !== false) {
            const key = `${event.id}-1h-${todayDateStr}`;
            if (!dispatchedLocalRef.current.has(key)) {
              dispatchedLocalRef.current.add(key);
              triggerDeviceNotification('Game in 1 Hour!', {
                body: `"${event.title}" starts at ${formatTimeWAT(event.start_at)} at ${event.location}. Ready your gear!`,
                tag: key,
              });
            }
          }

          // 30 Min Reminder (20 to 35 mins)
          if (diffMinutes >= 20 && diffMinutes <= 35 && user.notify_30m_before !== false) {
            const key = `${event.id}-30m-${todayDateStr}`;
            if (!dispatchedLocalRef.current.has(key)) {
              dispatchedLocalRef.current.add(key);
              triggerDeviceNotification('Game in 30 Minutes!', {
                body: `"${event.title}" starts at ${formatTimeWAT(event.start_at)} at ${event.location}. Warm-up begins soon!`,
                tag: key,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error in NotificationScheduler:', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  return null;
}
