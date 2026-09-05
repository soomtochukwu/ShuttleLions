'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, X, ChevronRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import Link from 'next/link';

export interface ActiveHeadsUpNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  metadata?: any;
  created_at?: string;
}

// Global dispatcher to allow testing from Settings page
let triggerLocalAlertHandler: ((notif: ActiveHeadsUpNotification) => void) | null = null;

export function triggerSimulatedNotification(notif: { title: string; message: string; type?: string }) {
  if (triggerLocalAlertHandler) {
    triggerLocalAlertHandler({
      id: `sim-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'game_reminder',
      created_at: new Date().toISOString(),
    });
  }
}

export function RealtimeNotificationListener() {
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState<ActiveHeadsUpNotification | null>(null);

  const displayNotificationAlert = useCallback((notif: ActiveHeadsUpNotification) => {
    // 1. Play soft audio cue & haptic vibration
    audio.play('serve');
    audio.haptic('success');

    // 2. Trigger native OS / Device notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.png',
          badge: '/favicon.png',
        });
      } catch (err) {
        console.warn('Native notification trigger failed:', err);
      }
    }

    // 3. Display heads-up slide-down notification banner
    setActiveAlert(notif);
  }, []);

  useEffect(() => {
    triggerLocalAlertHandler = displayNotificationAlert;
    return () => {
      triggerLocalAlertHandler = null;
    };
  }, [displayNotificationAlert]);

  // Request browser notification permission if user enabled on-device alerts
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (user?.notify_device !== false && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [user?.notify_device]);

  // Subscribe to Supabase Realtime channel for notifications
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `realtime-notifications-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.title && newRow.message) {
            displayNotificationAlert({
              id: newRow.id,
              title: newRow.title,
              message: newRow.message,
              type: newRow.type,
              metadata: newRow.metadata,
              created_at: newRow.created_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, displayNotificationAlert]);

  // Auto-dismiss heads-up banner after 6.5 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  if (!activeAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activeAlert.id}
        initial={{ y: -80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -80, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="fixed top-4 left-4 right-4 max-w-lg mx-auto z-50 pointer-events-auto"
      >
        <div className="bg-[#121812]/95 border-2 border-[#00875A] text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
          {/* Subtle green ambient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00875A] via-[#00E676] to-[#00875A]" />

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00875A]/25 border border-[#00875A]/40 flex items-center justify-center shrink-0 text-[#00E676] mt-0.5">
              {activeAlert.type === 'game_reminder' ? (
                <Calendar className="w-4.5 h-4.5" />
              ) : activeAlert.type === 'admin_broadcast' ? (
                <ShieldAlert className="w-4.5 h-4.5" />
              ) : (
                <Bell className="w-4.5 h-4.5" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#00875A]/20 text-[#00E676] border border-[#00875A]/40">
                  {activeAlert.type === 'game_reminder'
                    ? 'Game Alert'
                    : activeAlert.type === 'admin_broadcast'
                    ? 'Announcement'
                    : 'Notification'}
                </span>
                <span className="text-[11px] text-zinc-400">Just now</span>
              </div>

              <h4 className="text-sm font-bold text-white mt-1 leading-snug truncate">
                {activeAlert.title}
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">
                {activeAlert.message}
              </p>

              {activeAlert.type === 'game_reminder' && (
                <Link
                  href="/dashboard/schedule"
                  onClick={() => {
                    audio.haptic('tap');
                    setActiveAlert(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00E676] hover:underline mt-2"
                >
                  <span>View Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <button
              onClick={() => {
                audio.haptic('tap');
                setActiveAlert(null);
              }}
              aria-label="Close notification"
              className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
