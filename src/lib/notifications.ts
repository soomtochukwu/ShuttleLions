/**
 * ShuttleLions Notification Service
 * Manages On-Device Web Notifications, Browser Permissions & Notification Utilities
 */

import { audio } from './audio';

export interface DeviceNotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  vibrate?: number[];
}

/**
 * Checks if the browser supports the Web Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets the current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Web Notifications are not supported in this browser.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      audio.play('whistle');
    }
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers an on-device native browser notification with audio feedback
 */
export function triggerDeviceNotification(
  title: string,
  options: DeviceNotificationOptions
): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/icon.png',
      badge: options.badge || '/icon.png',
      tag: options.tag || `sl-${Date.now()}`,
      data: options.data,
    });

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(options.vibrate || [200, 100, 200]);
      } catch (e) {
        // Ignore vibration errors
      }
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    audio.play('rally');
    return true;
  } catch (err) {
    console.error('Error triggering device notification:', err);
    return false;
  }
}

/**
 * Sends a test push alert to verify the athlete's device setup
 */
export function sendTestDeviceNotification(): boolean {
  return triggerDeviceNotification('ShuttleLions Alert Test', {
    body: 'Your device is successfully configured to receive game reminders and announcements!',
    tag: 'test-notification',
  });
}
