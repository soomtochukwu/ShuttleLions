'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { audio } from '@/lib/audio';
import {
  ShieldCheck,
  QrCode,
  Settings,
  User,
  GraduationCap,
  Calendar,
  Award,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const fullName = user?.full_name || 'UNN Athlete';
  const regNumber = user?.reg_number || '2024/UNN-SL/89';
  const faculty = user?.faculty || 'Faculty of Education';
  const department = user?.department || 'Department pending';
  const level = user?.level || '100';
  const avatarUrl = user?.avatar_url || null;
  const role = user?.role || 'Member';

  const handlePrintOrSave = () => {
    audio.haptic('tap');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header with Title and Action to Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sl-border/40 pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Digital Lion ID Pass
          </h1>
          <p className="text-xs sm:text-sm text-sl-muted font-medium mt-1">
            Official verified athlete membership pass and court access token for UNN ShuttleLions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintOrSave}
            className="px-3.5 py-2 rounded-xl border border-sl-border bg-sl-panel hover:bg-sl-bg text-sl-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-sl-green" />
            <span>Print Pass</span>
          </button>

          <Link
            href="/dashboard/settings"
            onClick={() => {
              audio.haptic('tap');
              audio.play('rally');
            }}
            className="px-4 py-2 rounded-xl bg-sl-green hover:bg-sl-green-glow hover:text-black text-white text-xs font-black transition-all flex items-center gap-2 shadow-md"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit in Settings</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT / CENTER: 3D HOLOGRAPHIC LION ID PASS                                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <TiltCard className="p-7 bg-gradient-to-br from-[#0c2616] via-[#051408] to-[#010903] text-white border-2 border-sl-green shadow-2xl relative overflow-hidden rounded-3xl">
            {/* Ambient Holographic Accents */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-sl-green/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-sl-green-glow/15 blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sl-green/30 border border-sl-green-glow/50 flex items-center justify-center font-black text-sl-green-glow shadow-[0_0_12px_rgba(0,230,118,0.3)]">
                    SL
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-widest text-sl-green-glow uppercase">
                      SHUTTLELIONS
                    </h3>
                    <p className="text-[9px] text-white/70 tracking-wider">UNN ATHLETICS PASS</p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase bg-sl-green text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-sl-green-glow/40">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ATHLETE
                </span>
              </div>

              {/* Lion Avatar & Info Showcase */}
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-sl-green-glow shadow-[0_0_20px_rgba(0,230,118,0.4)] shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-sl-green/30 border-2 border-sl-green-glow text-white font-black text-3xl flex items-center justify-center shadow-lg shrink-0">
                    {fullName.charAt(0)}
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-lg font-black text-white truncate leading-tight">
                    {fullName}
                  </h4>
                  <p className="text-xs text-sl-green-glow font-mono font-bold">
                    {regNumber}
                  </p>
                  <p className="text-xs text-white/80 truncate">
                    {department}
                  </p>
                </div>
              </div>

              {/* Faculty & Level Specs */}
              <div className="grid grid-cols-2 gap-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    Faculty
                  </span>
                  <p className="font-bold text-white truncate mt-0.5">{faculty}</p>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    Academic Level
                  </span>
                  <p className="font-bold text-sl-green-glow mt-0.5">{level} Level</p>
                </div>
              </div>

              {/* QR Code Barcode Validation */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-white/10 border border-white/20">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/60 uppercase block leading-tight">
                      COURT ENTRY SCAN
                    </span>
                    <span className="text-[10px] font-mono text-sl-green-glow font-bold">
                      SL-VERIFIED-AUTH
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-white/50 uppercase block font-mono">SEASON</span>
                  <span className="text-[11px] font-mono font-black text-white">2026/2027</span>
                </div>
              </div>
            </div>
          </TiltCard>

          <p className="text-xs text-sl-muted text-center italic">
            Tip: Move your mouse or tilt your phone to inspect the 3D holographic foil effect.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: ATHLETE PROFILE & COURT ACCESS PROTOCOLS                           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Official Player Profile Summary */}
          <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
            <div className="flex items-center justify-between border-b border-sl-border/30 pb-3">
              <h3 className="text-sm font-black text-sl-foreground uppercase flex items-center gap-2">
                <User className="w-4 h-4 text-sl-green" /> Athlete Profile Record
              </h3>
              <Link
                href="/dashboard/settings"
                onClick={() => audio.haptic('tap')}
                className="text-xs font-bold text-sl-green hover:underline flex items-center gap-1"
              >
                <span>Update in Settings</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-sl-border/20">
                <span className="text-sl-muted font-semibold">Full Legal Name:</span>
                <span className="font-bold text-sl-foreground">{fullName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-sl-border/20">
                <span className="text-sl-muted font-semibold">Club Designation:</span>
                <span className="font-bold text-sl-green uppercase">{role}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-sl-border/20">
                <span className="text-sl-muted font-semibold">Institution:</span>
                <span className="font-bold text-sl-foreground">University of Nigeria, Nsukka</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-sl-border/20">
                <span className="text-sl-muted font-semibold">Faculty / Department:</span>
                <span className="font-bold text-sl-foreground text-right max-w-[200px] truncate">
                  {department} ({faculty})
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-sl-border/20">
                <span className="text-sl-muted font-semibold">Student Reg Number:</span>
                <span className="font-mono font-bold text-sl-foreground">{regNumber}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-sl-muted font-semibold">Primary Contact:</span>
                <span className="font-bold text-sl-foreground">{user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Court Entry Validation Guidelines */}
          <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
            <h3 className="text-sm font-black text-sl-foreground uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sl-green" /> Court Check-In Rules
            </h3>

            <div className="space-y-3 text-xs text-sl-muted leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
                <span>
                  <strong>Barcode Validation:</strong> Present the Digital Lion ID Pass on your phone at the UNN indoor gymnasium entrance for authorized access.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
                <span>
                  <strong>Footwear Protocol:</strong> Only non-marking indoor court shoes are allowed inside the main badminton courts to protect the wooden surface.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
                <span>
                  <strong>RSVP Confirmation:</strong> Always confirm your game attendance on the Schedule page to guarantee reserved court time.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/schedule"
                onClick={() => {
                  audio.haptic('tap');
                  audio.play('rally');
                }}
                className="w-full py-2.5 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-green hover:text-white text-sl-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Browse Court Schedules & RSVPs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
