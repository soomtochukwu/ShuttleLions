'use client';

import React, { useState } from 'react';
import { audio } from '@/lib/audio';
import { Target, Zap, CheckCircle2, Shield } from 'lucide-react';

export type ShotType = 'clear' | 'drop' | 'smash' | 'drive' | 'net' | 'lift';

interface ShotMetadata {
  name: string;
  category: 'Attacking' | 'Defensive' | 'Neutral';
  speedKmH: string;
  contactHeight: string;
  pathD: string;
  color: string;
  purpose: string;
  keyCoachingCue: string;
}

const SHOT_DETAILS: Record<ShotType, ShotMetadata> = {
  smash: {
    name: 'Overhead Jump Smash',
    category: 'Attacking',
    speedKmH: '300 – 420+ km/h',
    contactHeight: 'High overhead (2.6m – 3.2m in air)',
    // Steep downward line from high left to opponent mid-front floor
    pathD: 'M 100 80 L 700 370',
    color: '#EF5350', // Red/Orange for attack
    purpose: 'Direct point-winning terminal shot aimed steep into opponent body or open court floor.',
    keyCoachingCue: 'Strike 30cm in front of your body with full forearm pronation and steep wrist angle.',
  },
  drop: {
    name: 'Slice Drop Shot',
    category: 'Attacking',
    speedKmH: '120 – 160 km/h',
    contactHeight: 'High overhead (2.5m)',
    // Arced trajectory from rear court, dipping steeply over net to front court
    pathD: 'M 100 80 Q 400 120 530 200 Q 560 220 580 370',
    color: '#00E676', // Green
    purpose: 'Disguised as a smash to draw opponent forward; drops steeply right after clearing the net tape.',
    keyCoachingCue: 'Match your smash preparation arm speed, then gently slice the outer feathers upon contact.',
  },
  clear: {
    name: 'High Defensive Clear',
    category: 'Defensive',
    speedKmH: '180 – 220 km/h',
    contactHeight: 'Overhead (2.4m – 2.8m)',
    // High looping arch from near baseline (x=100, y=100) soaring high (y=20) down to far baseline (x=860, y=370)
    pathD: 'M 100 90 Q 450 -40 860 370',
    color: '#38BDF8', // Cyan/Sky
    purpose: 'Buys recovery time to reset to the central T-base while pinning opponent to their far baseline.',
    keyCoachingCue: 'Aim for high vertical ceiling apex so the shuttlecock falls perpendicular into the back court.',
  },
  drive: {
    name: 'Flat Midcourt Drive',
    category: 'Neutral',
    speedKmH: '220 – 280 km/h',
    contactHeight: 'Chest/Waist height (1.4m)',
    // Flat line skimming just above net tape (y=210) to mid/rear
    pathD: 'M 220 200 L 780 230',
    color: '#FBBF24', // Amber
    purpose: 'High-speed flat exchange in doubles designed to bypass the opponent front-court player.',
    keyCoachingCue: 'Keep racket head upright with a short, compact forearm snap; no looping backswing.',
  },
  net: {
    name: 'Tumbling Hairpin Net Shot',
    category: 'Attacking',
    speedKmH: '40 – 60 km/h',
    contactHeight: 'At net tape height (1.55m)',
    // Soft curve starting at near net (x=450, y=210) rising just over tape (x=500, y=190) dropping to (x=540, y=370)
    pathD: 'M 440 220 Q 500 175 540 370',
    color: '#A855F7', // Purple
    purpose: 'Tumbles across the net tape forcing opponent to lift defensively or commit a net fault.',
    keyCoachingCue: 'Relax your grip to zero tension right before impact; slice gently under the cork base.',
  },
  lift: {
    name: 'Underhand Defensive Lift',
    category: 'Defensive',
    speedKmH: '160 – 200 km/h',
    contactHeight: 'Low floor level (0.3m – 0.6m)',
    // Underhand scoop from net floor (x=450, y=360) looping high over net down to rear baseline (x=880, y=370)
    pathD: 'M 450 350 Q 550 -10 880 370',
    color: '#F472B6', // Pink
    purpose: 'Rescues tight opponent drop shots or net tumbles, sending the shuttle safe and deep into the rear corners.',
    keyCoachingCue: 'Lunge with racket foot forward, contact the shuttle high, and flick your wrist upwards.',
  },
};

export function ShotTrajectoryVisualizer() {
  const [selectedShot, setSelectedShot] = useState<ShotType>('smash');
  const details = SHOT_DETAILS[selectedShot];

  const handleSelectShot = (shot: ShotType) => {
    audio.haptic('tap');
    if (shot === 'smash') audio.play('smash');
    else if (shot === 'clear') audio.play('rally');
    else audio.play('courtSqueak');
    setSelectedShot(shot);
  };

  return (
    <div className="p-3 sm:p-4 bg-sl-panel border border-sl-border rounded-2xl space-y-3">
      {/* Header & Shot Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 border-b border-sl-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 border border-sl-green/30 px-2.5 py-0.5 rounded-full font-mono">
              Biomechanics Simulator
            </span>
            <span className="text-xs font-mono text-sl-muted">Side Elevation View</span>
          </div>
          <h2
            className="text-lg sm:text-xl font-black uppercase text-sl-foreground mt-1"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Interactive Shot Trajectory Simulator
          </h2>
          <p className="text-xs sm:text-sm text-sl-muted font-medium">
            Explore flight arcs, release velocity, and contact height for all 6 core badminton strokes.
          </p>
        </div>

        {/* Shot Selection Buttons */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 bg-sl-bg p-1 sm:p-1.5 rounded-xl border border-sl-border">
          {(['smash', 'drop', 'clear', 'drive', 'net', 'lift'] as ShotType[]).map((shot) => {
            const isSelected = selectedShot === shot;
            return (
              <button
                key={shot}
                type="button"
                onClick={() => handleSelectShot(shot)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-sl-green text-white shadow-md'
                    : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-panel'
                }`}
              >
                <span>{shot}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trajectory Side-Profile SVG Graphic */}
      <div className="bg-[#080d08] p-2.5 sm:p-4 rounded-xl border border-sl-border shadow-inner relative overflow-hidden">
        <svg viewBox="0 0 1000 420" className="w-full h-auto max-h-[280px] sm:max-h-[320px] drop-shadow-lg">
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B2E1B" />
              <stop offset="100%" stopColor="#0B140B" />
            </linearGradient>
            {/* Trajectory glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ceiling Height Guide Lines */}
          <line x1="40" y1="60" x2="960" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <text
            x="960"
            y="55"
            fill="rgba(255,255,255,0.3)"
            fontSize="15"
            textAnchor="end"
            fontFamily="monospace"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Ceiling Clearance (9.0m min)
          </text>

          <line x1="40" y1="150" x2="960" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <text
            x="960"
            y="145"
            fill="rgba(255,255,255,0.3)"
            fontSize="15"
            textAnchor="end"
            fontFamily="monospace"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Jump Smash Apex (3.0m)
          </text>

          {/* Court Floor Baseline (y = 370) */}
          <rect x="40" y="370" width="920" height="40" fill="url(#floorGrad)" rx="6" />
          <line x1="40" y1="370" x2="960" y2="370" stroke="#F0F7F0" strokeWidth="4" />

          {/* Court Floor Markings (Baselines, Short Service Lines) */}
          {/* Left Baseline */}
          <line x1="80" y1="360" x2="80" y2="375" stroke="#00E676" strokeWidth="4" />
          <text
            x="80"
            y="405"
            fill="#00E676"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Rear Baseline
          </text>

          {/* Left Short Service Line (1.98m from net) */}
          <line x1="360" y1="360" x2="360" y2="375" stroke="#F0F7F0" strokeWidth="3" />
          <text
            x="360"
            y="405"
            fill="#F0F7F0"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Short Service
          </text>

          {/* Center Net at x = 500. Net height: 1.55m at posts, corresponds to y = 200 */}
          {/* Post */}
          <rect x="496" y="200" width="8" height="170" fill="#F9A825" rx="2" />
          {/* Net Mesh */}
          <rect x="494" y="200" width="12" height="90" fill="#3A3A3A" stroke="#00E676" strokeWidth="1" />
          {/* Top White Tape (75mm white tape) */}
          <rect x="492" y="196" width="16" height="8" fill="#FFFFFF" rx="1" />
          <text
            x="500"
            y="180"
            fill="#00E676"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
            stroke="#080d08"
            strokeWidth="4"
            paintOrder="stroke fill"
          >
            Net (1.55m)
          </text>

          {/* Right Short Service Line */}
          <line x1="640" y1="360" x2="640" y2="375" stroke="#F0F7F0" strokeWidth="3" />
          <text
            x="640"
            y="405"
            fill="#F0F7F0"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Short Service
          </text>

          {/* Right Baseline */}
          <line x1="920" y1="360" x2="920" y2="375" stroke="#00E676" strokeWidth="4" />
          <text
            x="920"
            y="405"
            fill="#00E676"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
            stroke="#080d08"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            Rear Baseline
          </text>

          {/* Left Striker Silhouette representation */}
          <g transform="translate(90, 240)">
            <circle cx="20" cy="30" r="14" fill="#00E676" opacity="0.8" />
            <line x1="20" y1="44" x2="20" y2="95" stroke="#00E676" strokeWidth="6" strokeLinecap="round" />
            <line x1="20" y1="95" x2="5" y2="130" stroke="#00E676" strokeWidth="6" strokeLinecap="round" />
            <line x1="20" y1="95" x2="35" y2="130" stroke="#00E676" strokeWidth="6" strokeLinecap="round" />
            {/* Raised Racket Arm */}
            <line x1="20" y1="55" x2="45" y2="25" stroke="#00E676" strokeWidth="5" strokeLinecap="round" />
            <line x1="45" y1="25" x2="65" y2="-20" stroke="#F9A825" strokeWidth="3" />
            <ellipse cx="72" cy="-30" rx="10" ry="14" fill="none" stroke="#F9A825" strokeWidth="2" />
          </g>

          {/* Right Opponent Receiver Silhouette representation */}
          <g transform="translate(740, 260)">
            <circle cx="20" cy="30" r="14" fill="#A0B0A0" opacity="0.6" />
            <line x1="20" y1="44" x2="20" y2="85" stroke="#A0B0A0" strokeWidth="6" strokeLinecap="round" />
            <line x1="20" y1="85" x2="8" y2="110" stroke="#A0B0A0" strokeWidth="6" strokeLinecap="round" />
            <line x1="20" y1="85" x2="32" y2="110" stroke="#A0B0A0" strokeWidth="6" strokeLinecap="round" />
            {/* Ready racket in front */}
            <line x1="20" y1="55" x2="5" y2="40" stroke="#A0B0A0" strokeWidth="5" />
            <ellipse cx="-2" cy="35" rx="8" ry="12" fill="none" stroke="#A0B0A0" strokeWidth="2" />
          </g>

          {/* THE ACTIVE SHOT TRAJECTORY PATH */}
          <g filter="url(#glow)">
            {/* Glowing trajectory curve */}
            <path
              d={details.pathD}
              fill="none"
              stroke={details.color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Moving dash animation */}
            <path
              d={details.pathD}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="10 14"
              className="animate-pulse"
            />
          </g>

          {/* Impact / Target Landing Marker */}
          {selectedShot === 'smash' && <circle cx="700" cy="370" r="8" fill="#EF5350" />}
          {selectedShot === 'drop' && <circle cx="580" cy="370" r="8" fill="#00E676" />}
          {selectedShot === 'clear' && <circle cx="860" cy="370" r="8" fill="#38BDF8" />}
          {selectedShot === 'net' && <circle cx="540" cy="370" r="8" fill="#A855F7" />}
          {selectedShot === 'lift' && <circle cx="880" cy="370" r="8" fill="#F472B6" />}
          {selectedShot === 'drive' && <circle cx="780" cy="230" r="8" fill="#FBBF24" />}
        </svg>
      </div>

      {/* Trajectory Technical Diagnostics Cards (Mobile 2-Column Balanced Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1 col-span-1">
          <span className="text-xs font-black uppercase text-sl-muted flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sl-green" /> Velocity
          </span>
          <p className="text-base sm:text-lg font-black text-sl-foreground font-mono">{details.speedKmH}</p>
          <p className="text-xs text-sl-muted">Feather shuttle launch</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1 col-span-1">
          <span className="text-xs font-black uppercase text-sl-muted flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sl-green" /> Contact Point
          </span>
          <p className="text-sm sm:text-base font-black text-sl-foreground leading-snug">{details.contactHeight}</p>
          <p className="text-xs text-sl-muted">Extension apex</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-sl-bg border border-sl-border space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-black uppercase text-sl-muted flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sl-green" /> Tactical Intent
          </span>
          <p className="text-xs sm:text-sm text-sl-foreground font-medium leading-relaxed">{details.purpose}</p>
        </div>
      </div>

      {/* Coaching Cue Advice */}
      <div className="p-3.5 rounded-xl bg-sl-green/10 border border-sl-green/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sl-green/20 text-sl-green flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-sl-green uppercase tracking-wide">Varsity Coach Cue: </span>
          <span className="text-sl-foreground font-medium">{details.keyCoachingCue}</span>
        </div>
      </div>
    </div>
  );
}
