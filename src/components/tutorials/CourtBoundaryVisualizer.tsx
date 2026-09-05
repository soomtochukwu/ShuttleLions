'use client';

import React, { useState } from 'react';
import { audio } from '@/lib/audio';
import { Users, User, Info, CheckCircle2 } from 'lucide-react';

export type CourtViewMode = 'singles_serve' | 'singles_rally' | 'doubles_serve' | 'doubles_rally';

interface ModeInfo {
  title: string;
  subtitle: string;
  ruleSummary: string;
  sideLines: 'inner' | 'outer';
  backLine: 'baseline' | 'doubles_service_line';
  servingCourt: 'right' | 'both' | 'all';
}

const MODE_CONFIGS: Record<CourtViewMode, ModeInfo> = {
  singles_serve: {
    title: 'Singles Service Zone',
    subtitle: 'Long & Narrow Service Box',
    ruleSummary:
      'In singles, the serve must land in the diagonally opposite service box. The boundaries are narrow (inner sidelines) and long (extending all the way back to the rear baseline). The short service line is in-bounds.',
    sideLines: 'inner',
    backLine: 'baseline',
    servingCourt: 'right',
  },
  singles_rally: {
    title: 'Singles Rally Boundary',
    subtitle: 'Full Length, Narrow Width (5.18m × 13.40m)',
    ruleSummary:
      'Once the serve is returned, the entire singles court is in play. The side tramlines (alleys) are out of bounds. The rear baseline is the end boundary.',
    sideLines: 'inner',
    backLine: 'baseline',
    servingCourt: 'all',
  },
  doubles_serve: {
    title: 'Doubles Service Zone',
    subtitle: 'Short & Wide Service Box',
    ruleSummary:
      'In doubles, the serve is short and wide. It extends out to the outer sidelines (tramlines in-bounds), but MUST NOT pass the inside long service line (0.76m before baseline).',
    sideLines: 'outer',
    backLine: 'doubles_service_line',
    servingCourt: 'right',
  },
  doubles_rally: {
    title: 'Doubles Rally Boundary',
    subtitle: 'Full Court In-Bounds (6.10m × 13.40m)',
    ruleSummary:
      'During doubles rallies, the entire court is in play: both side tramlines and the full rear baseline are valid playing zones.',
    sideLines: 'outer',
    backLine: 'baseline',
    servingCourt: 'all',
  },
};

export function CourtBoundaryVisualizer() {
  const [mode, setMode] = useState<CourtViewMode>('singles_serve');
  const config = MODE_CONFIGS[mode];

  const handleSelectMode = (newMode: CourtViewMode) => {
    audio.haptic('tap');
    audio.play('rally');
    setMode(newMode);
  };

  return (
    <div className="shuttle-panel p-5 sm:p-7 bg-sl-panel border border-sl-border space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sl-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-sl-green bg-sl-green/15 border border-sl-green/30 px-2.5 py-0.5 rounded-full font-mono">
              BWF Standard Court
            </span>
            <span className="text-[10px] font-mono text-sl-muted">13.40m × 6.10m</span>
          </div>
          <h2
            className="text-lg sm:text-xl font-black uppercase text-sl-foreground mt-1"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Interactive Court Boundary Visualizer
          </h2>
          <p className="text-xs text-sl-muted font-medium">
            Toggle between singles and doubles to visualize legal service boxes versus rally boundaries.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 bg-sl-bg p-1 sm:p-1.5 rounded-xl border border-sl-border">
          <button
            type="button"
            onClick={() => handleSelectMode('singles_serve')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              mode === 'singles_serve'
                ? 'bg-sl-green text-white shadow-md'
                : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-panel'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Singles Serve</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('singles_rally')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              mode === 'singles_rally'
                ? 'bg-sl-green text-white shadow-md'
                : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-panel'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Singles Rally</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('doubles_serve')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              mode === 'doubles_serve'
                ? 'bg-sl-green text-white shadow-md'
                : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-panel'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Doubles Serve</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('doubles_rally')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              mode === 'doubles_rally'
                ? 'bg-sl-green text-white shadow-md'
                : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-panel'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Doubles Rally</span>
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Top-Down Court Graphic */}
        <div className="lg:col-span-7 bg-[#070b07] p-3 sm:p-6 rounded-2xl border-2 border-sl-border relative overflow-hidden shadow-inner flex flex-col items-center">
          <svg
            viewBox="0 0 610 1340"
            className="w-full max-h-[380px] sm:max-h-[480px] md:max-h-[520px] object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Active Zone Glow Pattern */}
              <pattern id="sl-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Dark Court Mat Background */}
            <rect x="0" y="0" width="610" height="1340" fill="#0D160D" />
            <rect x="0" y="0" width="610" height="1340" fill="url(#sl-grid)" />

            {/* Dynamic Active In-Bounds Zone Highlighting */}
            {mode === 'singles_serve' && (
              // Highlight server box (near right) & receiver target box (far left diagonally)
              <g>
                {/* Receiver Target Box: Far Left (diagonal from server) */}
                <rect
                  x="46"
                  y="0"
                  width="259"
                  height="472"
                  fill="rgba(0, 230, 118, 0.28)"
                  stroke="#00E676"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                {/* Server Standing Box: Near Right (even score 0, 2, 4...) */}
                <rect
                  x="305"
                  y="868"
                  width="259"
                  height="472"
                  fill="rgba(0, 230, 118, 0.15)"
                  stroke="#00E676"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              </g>
            )}

            {mode === 'singles_rally' && (
              // Full Singles Court (inner sidelines, full length)
              <rect
                x="46"
                y="0"
                width="518"
                height="1340"
                fill="rgba(0, 230, 118, 0.22)"
                stroke="#00E676"
                strokeWidth="3"
              />
            )}

            {mode === 'doubles_serve' && (
              // Highlight server box (short & wide) & receiver box (short & wide)
              <g>
                {/* Receiver Target Box: Far Left (outer sideline, stops at doubles service line y=76) */}
                <rect
                  x="0"
                  y="76"
                  width="305"
                  height="396"
                  fill="rgba(0, 230, 118, 0.28)"
                  stroke="#00E676"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                {/* Server Box: Near Right (outer sideline to center, y=868 to 1264) */}
                <rect
                  x="305"
                  y="868"
                  width="305"
                  height="396"
                  fill="rgba(0, 230, 118, 0.15)"
                  stroke="#00E676"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              </g>
            )}

            {mode === 'doubles_rally' && (
              // Entire Full Court (610 x 1340)
              <rect
                x="0"
                y="0"
                width="610"
                height="1340"
                fill="rgba(0, 230, 118, 0.22)"
                stroke="#00E676"
                strokeWidth="3"
              />
            )}

            {/* Out-of-bounds indicators for tramlines in singles */}
            {(mode === 'singles_serve' || mode === 'singles_rally') && (
              <g fill="rgba(211, 47, 47, 0.15)">
                {/* Left side tramline */}
                <rect x="0" y="0" width="46" height="1340" />
                {/* Right side tramline */}
                <rect x="564" y="0" width="46" height="1340" />
              </g>
            )}

            {/* Out-of-bounds back alley for doubles serve */}
            {mode === 'doubles_serve' && (
              <g fill="rgba(211, 47, 47, 0.18)">
                {/* Far back service alley (y: 0 to 76) */}
                <rect x="0" y="0" width="610" height="76" />
                {/* Near back service alley (y: 1264 to 1340) */}
                <rect x="0" y="1264" width="610" height="76" />
              </g>
            )}

            {/* Permanent Court Boundary Lines (White 40mm lines) */}
            <g stroke="#F0F7F0" strokeWidth="4" fill="none">
              {/* Outer Boundary Perimeter (Doubles) */}
              <rect x="0" y="0" width="610" height="1340" />

              {/* Inner Sidelines (Singles) - 46px from edge */}
              <line x1="46" y1="0" x2="46" y2="1340" />
              <line x1="564" y1="0" x2="564" y2="1340" />

              {/* Doubles Long Service Lines - 76px from baselines */}
              <line x1="0" y1="76" x2="610" y2="76" strokeDasharray={mode.includes('doubles') ? undefined : '4 4'} />
              <line x1="0" y1="1264" x2="610" y2="1264" strokeDasharray={mode.includes('doubles') ? undefined : '4 4'} />

              {/* Short Service Lines - 198px from center net (y=472, y=868) */}
              <line x1="0" y1="472" x2="610" y2="472" strokeWidth="5" />
              <line x1="0" y1="868" x2="610" y2="868" strokeWidth="5" />

              {/* Center Line (from short service line to baseline on both halves) */}
              <line x1="305" y1="0" x2="305" y2="472" />
              <line x1="305" y1="868" x2="305" y2="1340" />
            </g>

            {/* Net (Center at y = 670) with post indicators */}
            <g>
              <rect x="-10" y="666" width="630" height="8" fill="#F0F7F0" />
              <line x1="-15" y1="670" x2="625" y2="670" stroke="#00E676" strokeWidth="3" />
              {/* Net posts */}
              <circle cx="-15" cy="670" r="7" fill="#F9A825" />
              <circle cx="625" cy="670" r="7" fill="#F9A825" />
              <text
                x="305"
                y="676"
                fill="#00E676"
                fontSize="24"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="3"
                stroke="#070b07"
                strokeWidth="4"
                paintOrder="stroke fill"
              >
                NET (1.55m / 5ft 1in)
              </text>
            </g>

            {/* Dynamic Annotations & Labels */}
            <g fill="#F0F7F0" fontSize="20" fontWeight="900" fontFamily="sans-serif" stroke="#070b07" strokeWidth="4" paintOrder="stroke fill">
              {/* Far Baseline Label */}
              <text x="305" y="38" textAnchor="middle">BACK BASELINE (13.40m)</text>

              {/* Doubles Long Service Line Label */}
              <text x="305" y="104" textAnchor="middle" fill="#00E676">
                DOUBLES LONG SERVICE LINE
              </text>

              {/* Far Short Service Line Label */}
              <text x="305" y="460" textAnchor="middle">
                SHORT SERVICE LINE (1.98m from net)
              </text>

              {/* Near Short Service Line Label */}
              <text x="305" y="895" textAnchor="middle">
                SHORT SERVICE LINE
              </text>

              {/* Near Baseline Label */}
              <text x="305" y="1325" textAnchor="middle">NEAR BASELINE</text>
            </g>

            {/* Diagonal Service Flight Path Arrow */}
            {(mode === 'singles_serve' || mode === 'doubles_serve') && (
              <g>
                <path
                  d="M 434 1100 Q 305 670 175 236"
                  fill="none"
                  stroke="#F9A825"
                  strokeWidth="5"
                  strokeDasharray="12 8"
                  className="animate-pulse"
                />
                <circle cx="434" cy="1100" r="10" fill="#00E676" />
                <circle cx="175" cy="236" r="12" fill="#F9A825" />
                <text
                  x="434"
                  y="1140"
                  fill="#00E676"
                  fontSize="22"
                  fontWeight="900"
                  textAnchor="middle"
                  stroke="#070b07"
                  strokeWidth="4"
                  paintOrder="stroke fill"
                >
                  Server (Even 0, 2...)
                </text>
                <text
                  x="175"
                  y="210"
                  fill="#F9A825"
                  fontSize="22"
                  fontWeight="900"
                  textAnchor="middle"
                  stroke="#070b07"
                  strokeWidth="4"
                  paintOrder="stroke fill"
                >
                  Legal Target Box
                </text>
              </g>
            )}
          </svg>

          {/* Court Legend Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-3 sm:mt-4 text-[10px] sm:text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-sl-green">
              <span className="w-3 h-3 rounded bg-sl-green/30 border border-sl-green inline-block" />
              <span>In-Bounds Active Zone</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-block" />
              <span>Out-of-Bounds Zone</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3.5 h-0.5 bg-amber-400 inline-block" />
              <span>Diagonal Flight Path</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Explanation & Rule Analysis */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-sl-bg border border-sl-border space-y-3">
            <div className="flex items-center gap-2 text-sl-green">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-black uppercase">{config.title}</h3>
            </div>
            <p className="text-xs text-sl-muted leading-relaxed font-medium">
              {config.ruleSummary}
            </p>
          </div>

          {/* Key Rule Breakdown Points */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-sl-panel border border-sl-border/60 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sl-green/15 text-sl-green flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-black">
                1
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-sl-foreground">The 1.15-Meter Service Rule:</span>
                <p className="text-sl-muted leading-relaxed text-[11px]">
                  Under BWF Law 9.1.6, the entire shuttlecock must be below 1.15 meters from the court floor surface at the exact instant of impact.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sl-panel border border-sl-border/60 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sl-green/15 text-sl-green flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-black">
                2
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-sl-foreground">Stationary Feet Rule:</span>
                <p className="text-sl-muted leading-relaxed text-[11px]">
                  Both server and receiver must remain motionless within their respective service boxes until the racket contacts the shuttlecock. Touching boundary lines is a fault.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sl-panel border border-sl-border/60 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sl-green/15 text-sl-green flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-black">
                3
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-sl-foreground">Even / Odd Serving Sides:</span>
                <p className="text-sl-muted leading-relaxed text-[11px]">
                  When the server has an even score (0, 2, 4, 6...), serve from the <strong>Right Service Box</strong>. When odd (1, 3, 5, 7...), serve from the <strong>Left Service Box</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tip Pill */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Memory Trick:</strong> Singles serve is <em>&quot;Long & Narrow&quot;</em>. Doubles serve is <em>&quot;Short & Wide&quot;</em>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
