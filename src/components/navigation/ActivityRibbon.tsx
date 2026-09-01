'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Trophy, Zap, ChevronRight } from 'lucide-react';

export function ActivityRibbon() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    // Next Saturday Training countdown
    const calculateTime = () => {
      const now = new Date();
      const target = new Date();
      const day = now.getDay();
      const diff = (6 - day + 7) % 7 || 7; // days until next Saturday
      target.setDate(now.getDate() + diff);
      target.setHours(8, 0, 0, 0);

      const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);

      setTimeLeft({ days, hours, mins });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-[#031508] via-[#08200f] to-[#031508] border-b border-sl-border/40 text-sl-foreground py-1 px-4 text-xs font-semibold select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Next Training Countdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 bg-sl-green/20 border border-sl-green/40 text-sl-green-glow px-2 py-0.5 rounded text-[11px] font-bold">
            <Calendar className="w-3 h-3 text-sl-green" /> NEXT DRILL
          </span>
          <span className="text-white/80 text-[11px]">
            Saturday 08:00 AM • UNN Sports Hall (
            <strong className="text-sl-green-glow font-mono">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m
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
            <span>Lion Den Inter-Faculty Cup Registration Open</span>
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
