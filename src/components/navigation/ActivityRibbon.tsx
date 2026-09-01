'use client';

import { useEffect, useState } from 'react';
import { supabase, type EventItem } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, Trophy, Zap, ChevronRight } from 'lucide-react';

export function ActivityRibbon() {
  const [dbEvents, setDbEvents] = useState<EventItem[]>([]);
  const [nextActivity, setNextActivity] = useState<{
    label: string;
    venue: string;
    name: string;
    timeLeft: { days: number; hours: number; mins: number };
  }>({
    label: 'Saturday 07:00 AM',
    venue: 'UNN Badminton Court',
    name: 'In-House Tournament',
    timeLeft: { days: 0, hours: 0, mins: 0 },
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await supabase
          .from('events')
          .select('*')
          .order('start_at', { ascending: true });
        if (data && data.length > 0) {
          setDbEvents(data);
        }
      } catch (e) {
        console.error('Error fetching ribbon schedule from database:', e);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    const calculateNextSession = () => {
      const now = new Date();

      // Use database events if loaded
      const recurring = dbEvents.filter((e) => e.is_recurring);

      if (recurring.length > 0) {
        let closestTarget: Date | null = null;
        let closestEvent: EventItem | null = null;

        for (const ev of recurring) {
          const evDate = new Date(ev.start_at);
          const targetDay = evDate.getDay();
          const targetHours = evDate.getHours();
          const targetMins = evDate.getMinutes();

          const target = new Date(now);
          let dayDiff = (targetDay - now.getDay() + 7) % 7;
          target.setDate(now.getDate() + dayDiff);
          target.setHours(targetHours, targetMins, 0, 0);

          if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 7);
          }

          if (!closestTarget || target.getTime() < closestTarget.getTime()) {
            closestTarget = target;
            closestEvent = ev;
          }
        }

        if (closestTarget && closestEvent) {
          const totalSeconds = Math.max(0, Math.floor((closestTarget.getTime() - now.getTime()) / 1000));
          const days = Math.floor(totalSeconds / (3600 * 24));
          const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
          const mins = Math.floor((totalSeconds % 3600) / 60);

          const dayName = closestTarget.toLocaleDateString('en-GB', { weekday: 'long' });
          const timeFormatted = closestTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setNextActivity({
            label: `${dayName} ${timeFormatted}`,
            venue: closestEvent.location || 'UNN Badminton Court',
            name: closestEvent.title,
            timeLeft: { days, hours, mins },
          });
          return;
        }
      }

      // Fallback calculation until DB loads
      const fallbackTarget = new Date(now);
      let dayDiff = (6 - now.getDay() + 7) % 7 || 7;
      fallbackTarget.setDate(now.getDate() + dayDiff);
      fallbackTarget.setHours(7, 0, 0, 0);

      const totalSeconds = Math.max(0, Math.floor((fallbackTarget.getTime() - now.getTime()) / 1000));
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);

      setNextActivity((prev) => ({
        ...prev,
        timeLeft: { days, hours, mins },
      }));
    };

    calculateNextSession();
    const interval = setInterval(calculateNextSession, 60000);
    return () => clearInterval(interval);
  }, [dbEvents]);

  return (
    <div className="w-full bg-gradient-to-r from-[#031508] via-[#08200f] to-[#031508] border-b border-sl-border/40 text-sl-foreground py-1 px-4 text-xs font-semibold select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Next Training / Tournament Countdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 bg-sl-green/20 border border-sl-green/40 text-sl-green-glow px-2 py-0.5 rounded text-[11px] font-bold">
            <Calendar className="w-3 h-3 text-sl-green" /> NEXT ACTIVITY
          </span>
          <span className="text-white/90 text-[11px]">
            {nextActivity.label} • {nextActivity.venue} ({nextActivity.name}) (
            <strong className="text-sl-green-glow font-mono">
              {nextActivity.timeLeft.days}d {nextActivity.timeLeft.hours}h {nextActivity.timeLeft.mins}m
            </strong>
            )
          </span>
        </div>

        {/* Center/Right: Next Tournament Announcement */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-1.5 text-sl-muted hover:text-white transition-colors text-[11px] group"
          >
            <Trophy className="w-3.5 h-3.5 text-sl-warning" />
            <span>Lion Den Inter-Faculty Cup & Tournament Hub</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <span className="hidden md:flex items-center gap-1 text-[10px] text-sl-green font-mono bg-sl-green/10 border border-sl-green/20 px-2 py-0.5 rounded">
            <Zap className="w-2.5 h-2.5" /> LIVE COMMUNITY
          </span>
        </div>
      </div>
    </div>
  );
}
