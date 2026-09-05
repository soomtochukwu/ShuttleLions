'use client';

import Link from 'next/link';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShoppingBag, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function ShopPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header Banner */}
      <div className="shuttle-panel p-6 sm:p-10 bg-sl-panel border border-sl-border space-y-6 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full font-mono tracking-wider">
            Feature Coming Soon
          </span>
          <h1
            className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Official Equipment Shop
          </h1>
          <p className="text-xs sm:text-sm text-sl-muted font-medium max-w-lg mx-auto leading-relaxed">
            Yonex rackets, feather shuttlecocks, club apparel, and grip restringing with executive on-campus pickup are currently being cataloged.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1.5">
            <span className="text-xs font-black text-sl-foreground uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sl-green" /> Official Gear
            </span>
            <p className="text-[11px] text-sl-muted font-medium">
              Verified Yonex, Victor, and Li-Ning rackets tested for varsity training.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1.5">
            <span className="text-xs font-black text-sl-foreground uppercase flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sl-green" /> Campus Pickup
            </span>
            <p className="text-[11px] text-sl-muted font-medium">
              Direct handoff by designated club executives at the UNN indoor court.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1.5">
            <span className="text-xs font-black text-sl-foreground uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Member Subsidies
            </span>
            <p className="text-[11px] text-sl-muted font-medium">
              Discounted pricing on string tensioning and grip replacements for active athletes.
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full">
          <Link href="/dashboard" onClick={() => audio.play('rally')}>
            <ShuttleButton variant="green" className="py-2.5 px-6 text-xs font-black">
              Back to Dashboard Overview
            </ShuttleButton>
          </Link>
          <Link href="/dashboard/schedule" onClick={() => audio.play('rally')}>
            <ShuttleButton variant="white" className="py-2.5 px-6 text-xs font-black border border-sl-border">
              View Games & Schedules
            </ShuttleButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
