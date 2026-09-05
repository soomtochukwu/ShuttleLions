/**
 * ShuttleLions Nodemailer Service
 * Manages transactional SMTP email dispatching for pre-game reminders, RSVP confirmations, and announcements
 */

import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Checks if SMTP credentials are configured in the current environment
 */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Creates and returns a reusable Nodemailer transporter instance
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email using Nodemailer or logs to console if SMTP is unconfigured in development
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<EmailResult> {
  const from = process.env.SMTP_FROM || '"ShuttleLions UNN" <notifications@shuttlelions.unn>';

  if (!isSmtpConfigured()) {
    console.info(
      `\n================ [NODEMAILER LOCAL PREVIEW] ================\n` +
      `To: ${to}\n` +
      `From: ${from}\n` +
      `Subject: ${subject}\n` +
      `Notice: SMTP credentials not set in .env.local. Email preview logged.\n` +
      `============================================================\n`
    );
    return { success: true, simulated: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err: any) {
    console.error('Nodemailer transmission error:', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email via SMTP',
    };
  }
}

/**
 * Generates branded HTML template for Game Reminders (1 hour / 30 minutes)
 */
export function buildGameReminderEmail({
  recipientName,
  eventTitle,
  location,
  timeString,
  sessionDate,
  countdownLabel,
}: {
  recipientName: string;
  eventTitle: string;
  location: string;
  timeString: string;
  sessionDate: string;
  countdownLabel: '1 Hour' | '30 Minutes';
}): { subject: string; html: string } {
  const subject = `[Reminder] "${eventTitle}" starts in ${countdownLabel}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F0A; font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F0F7F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #1A1F1A; border: 2px solid #00875A; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #00875A 0%, #004D40 100%); text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #FFFFFF;">
                SHUTTLELIONS UNN
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #A7F3D0;">
                Official Badminton Athletics Notification
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <div style="display: inline-block; background-color: rgba(0, 135, 90, 0.2); border: 1px solid #00875A; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; color: #00E676; text-transform: uppercase; margin-bottom: 16px;">
                GAME IN ${countdownLabel.toUpperCase()}
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 900; color: #FFFFFF;">
                Hello ${recipientName},
              </h2>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
                Your confirmed badminton session is starting soon! Please ensure you have your racket, non-marking indoor court shoes, and hydration ready.
              </p>

              <!-- Session Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111611; border: 1px solid #2D372E; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #00E676;">
                      ${eventTitle}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #E2E8F0;">
                      <strong>Date:</strong> ${sessionDate}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #E2E8F0;">
                      <strong>Time:</strong> ${timeString}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #E2E8F0;">
                      <strong>Venue:</strong> ${location}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                Remember to present your Digital Lion ID Pass at the court entrance for verified check-in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #111611; border-top: 1px solid #2D372E; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                University of Nigeria, Nsukka • ShuttleLions Badminton Club<br>
                You received this because you RSVPed for this session. Configure notifications in Dashboard Settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Generates branded HTML template for Admin Broadcast Announcements
 */
export function buildAdminBroadcastEmail({
  recipientName,
  title,
  message,
}: {
  recipientName: string;
  title: string;
  message: string;
}): { subject: string; html: string } {
  const subject = `[ShuttleLions Alert] ${title}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F0A; font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F0F7F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #1A1F1A; border: 2px solid #00875A; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #00875A 0%, #004D40 100%); text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #FFFFFF;">
                SHUTTLELIONS UNN
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #A7F3D0;">
                Club Announcement
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 14px 0; font-size: 20px; font-weight: 900; color: #FFFFFF;">
                ${title}
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; font-weight: 600; color: #00E676;">
                Attention ${recipientName}:
              </p>

              <div style="background-color: #111611; border: 1px solid #2D372E; border-radius: 14px; padding: 20px; margin-bottom: 24px; font-size: 14px; line-height: 1.7; color: #E2E8F0; white-space: pre-wrap;">${message}</div>

              <p style="margin: 0 0 20px 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                This message was dispatched from the Executive Admin Command Room to all registered members.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #111611; border-top: 1px solid #2D372E; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                University of Nigeria, Nsukka • ShuttleLions Badminton Club<br>
                Manage your delivery preferences in Dashboard Settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}
