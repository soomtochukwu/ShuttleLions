import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { formatTimeRangeWAT } from '@/lib/date-utils';
import { sendEmail, buildGameReminderEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const now = new Date();

    // 1. Fetch upcoming events for today
    const { data: events, error: evErr } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'cancelled');

    if (evErr || !events) {
      return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
    }

    const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
    const remindersTriggered: any[] = [];

    for (const event of events) {
      const eventStart = new Date(event.start_at);
      const diffMs = eventStart.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      let reminderType: '1h_before' | '30m_before' | null = null;

      // 1-hour window: 50 to 70 mins before start
      if (diffMinutes >= 50 && diffMinutes <= 70) {
        reminderType = '1h_before';
      }
      // 30-min window: 20 to 40 mins before start
      else if (diffMinutes >= 20 && diffMinutes <= 40) {
        reminderType = '30m_before';
      }

      if (!reminderType) continue;

      // Fetch confirmed RSVPs for this event on today's session_date
      const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select('profile_id, session_date, profiles:profile_id(id, email, full_name, notify_email, notify_device, notify_1h_before, notify_30m_before)')
        .eq('event_id', event.id)
        .eq('session_date', todayDateStr)
        .eq('status', 'going');

      if (!rsvps || rsvps.length === 0) continue;

      for (const rsvp of rsvps) {
        const profile = (rsvp as any).profiles;
        if (!profile) continue;

        // Check if user enabled this specific countdown reminder
        if (reminderType === '1h_before' && profile.notify_1h_before === false) continue;
        if (reminderType === '30m_before' && profile.notify_30m_before === false) continue;

        // Check if already dispatched to avoid duplicate alert
        const { data: existingDispatch } = await supabase
          .from('notification_dispatches')
          .select('id')
          .eq('event_id', event.id)
          .eq('session_date', todayDateStr)
          .eq('profile_id', profile.id)
          .eq('reminder_type', reminderType)
          .maybeSingle();

        if (existingDispatch) continue;

        // Record dispatch
        await supabase.from('notification_dispatches').insert({
          event_id: event.id,
          session_date: todayDateStr,
          profile_id: profile.id,
          reminder_type: reminderType,
        });

        const countdownLabel = reminderType === '1h_before' ? '1 Hour' : '30 Minutes';
        const timeRange = formatTimeRangeWAT(event.start_at, event.end_at);

        const notifMsg = `Your RSVPed session "${event.title}" begins at ${timeRange} at ${event.location}. Get your racket ready!`;

        // Insert notification record
        await supabase.from('notifications').insert({
          profile_id: profile.id,
          recipient_id: profile.id,
          title: `Game Starts in ${countdownLabel}!`,
          body: notifMsg,
          message: notifMsg,
          type: 'game_reminder',
          channels: [
            ...(profile.notify_email !== false ? ['email'] : []),
            ...(profile.notify_device !== false ? ['device'] : []),
            'in_app',
          ],
          metadata: {
            event_id: event.id,
            session_date: todayDateStr,
            location: event.location,
            start_at: event.start_at,
          },
          email_sent: profile.notify_email !== false,
          device_sent: profile.notify_device !== false,
        });

        // Dispatch Nodemailer Email if email notifications are enabled
        if (profile.notify_email !== false && profile.email && profile.email.includes('@')) {
          const { subject, html } = buildGameReminderEmail({
            recipientName: profile.full_name || 'Lion Athlete',
            eventTitle: event.title,
            location: event.location,
            timeString: timeRange,
            sessionDate: todayDateStr,
            countdownLabel,
          });

          await sendEmail({
            to: profile.email,
            subject,
            html,
            text: `Game Reminder: "${event.title}" starts in ${countdownLabel} at ${event.location} (${timeRange}).`,
          });
        }

        remindersTriggered.push({
          profile_id: profile.id,
          email: profile.email,
          event: event.title,
          reminder_type: reminderType,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      reminders_triggered: remindersTriggered,
    });
  } catch (err: any) {
    console.error('Reminder evaluator error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
