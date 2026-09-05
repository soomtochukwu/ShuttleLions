import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendEmail, buildAdminBroadcastEmail } from '@/lib/email';

interface SendNotificationBody {
  recipient_ids?: string[]; // Empty or omitted for all athletes
  title: string;
  message: string;
  type?: 'game_reminder' | 'admin_broadcast' | 'rsvp_confirmation' | 'schedule_update' | 'system';
  channels?: ('email' | 'device' | 'in_app')[];
  event_details?: {
    title: string;
    location: string;
    start_at: string;
    end_at: string;
    map_url?: string | null;
    session_date?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendNotificationBody;
    const {
      recipient_ids,
      title,
      message,
      type = 'admin_broadcast',
      channels = ['email', 'device', 'in_app'],
      event_details,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // 1. Fetch target recipient profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('id, email, full_name, role, notify_email, notify_device');

    if (recipient_ids && recipient_ids.length > 0) {
      profilesQuery = profilesQuery.in('id', recipient_ids);
    }

    const { data: targetProfiles, error: profErr } = await profilesQuery;
    if (profErr) {
      console.error('Failed to fetch recipient profiles:', profErr);
    }

    const recipients = targetProfiles || [];

    // 2. Insert In-App notifications into the database
    const notificationInserts = recipients.map((p) => ({
      profile_id: p.id,
      recipient_id: p.id,
      title,
      body: message,
      message,
      type,
      channels,
      metadata: event_details || {},
      is_read: false,
      email_sent: channels.includes('email') && p.notify_email !== false,
      device_sent: channels.includes('device') && p.notify_device !== false,
    }));

    if (notificationInserts.length > 0) {
      const { error: insertErr } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (insertErr) {
        console.error('Error inserting notifications records:', insertErr);
      }
    }

    // 3. Dispatch Emails via Nodemailer if email channel is active
    let emailDispatchedCount = 0;
    if (channels.includes('email')) {
      const eligibleEmailRecipients = recipients.filter(
        (p) => p.notify_email !== false && p.email && p.email.includes('@')
      );

      const emailPromises = eligibleEmailRecipients.map(async (p) => {
        const { subject, html } = buildAdminBroadcastEmail({
          recipientName: p.full_name || 'Lion Athlete',
          title,
          message,
        });

        const res = await sendEmail({
          to: p.email,
          subject,
          html,
          text: `${title}\n\n${message}`,
        });

        if (res.success) {
          emailDispatchedCount++;
        }
      });

      await Promise.allSettled(emailPromises);
    }

    const deviceRecipients = recipients.filter(
      (p) => channels.includes('device') && p.notify_device !== false
    );

    return NextResponse.json({
      success: true,
      delivered_count: recipients.length,
      email_dispatched: emailDispatchedCount,
      device_dispatched: deviceRecipients.length,
      recipients: recipients.map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
      })),
    });
  } catch (err: any) {
    console.error('Notification dispatch error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error dispatching notification.' },
      { status: 500 }
    );
  }
}
