'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { PARALLAX_ASSETS_CONFIG } from '@/config/parallax-assets';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { KineticSplitReveal, KineticVelocityBadge } from '@/components/ui/KineticText';
import { TiltCard } from '@/components/ui/TiltCard';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { audio } from '@/lib/audio';
import {
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ScrollytellingCourtStageProps {
  onOpenAuth: () => void;
}

export function ScrollytellingCourtStage({ onOpenAuth }: ScrollytellingCourtStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Track scroll through the 320vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 200 });

  // 1. Court Arena Background Transforms (Zoom & Contrast)
  const courtScale = useTransform(smoothProgress, [0, 0.4, 1], [1.25, 1.08, 1.0]);
  const courtBrightness = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.65, 0.75, 0.7, 0.55]);

  // 2. Server Player Cutout (Enters Left at ~20%, swings, recedes at ~65%)
  const serverX = useTransform(smoothProgress, [0.15, 0.35, 0.65, 0.85], [-350, 0, 0, -350]);
  const serverOpacity = useTransform(smoothProgress, [0.15, 0.28, 0.6, 0.8], [0, 1, 1, 0]);
  const serverScale = useTransform(smoothProgress, [0.18, 0.35, 0.65], [0.9, 1.05, 0.95]);

  // 3. Receiver Player Cutout (Enters Right at ~55%, smashes, stays for CTA)
  const receiverX = useTransform(smoothProgress, [0.45, 0.7, 0.95], [350, 0, 0]);
  const receiverOpacity = useTransform(smoothProgress, [0.45, 0.6, 0.95], [0, 1, 1]);
  const receiverScale = useTransform(smoothProgress, [0.48, 0.7, 0.95], [0.9, 1.05, 1.0]);

  // 4. Flying Shuttlecock Trajectory Arc (Curves from Server to Receiver)
  const shuttleX = useTransform(smoothProgress, [0.3, 0.5, 0.7], ['22%', '50%', '78%']);
  const shuttleY = useTransform(smoothProgress, [0.3, 0.5, 0.7], ['65%', '28%', '62%']);
  const shuttleRotate = useTransform(smoothProgress, [0.3, 0.5, 0.7], [-35, 15, 65]);
  const shuttleOpacity = useTransform(smoothProgress, [0.25, 0.32, 0.68, 0.75], [0, 1, 1, 0]);

  // 5. Phase Text Card Opacities & Transforms
  const heroCardOpacity = useTransform(smoothProgress, [0, 0.18, 0.25], [1, 0.8, 0]);
  const heroCardY = useTransform(smoothProgress, [0, 0.25], [0, -60]);

  const serveCardOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.5, 0.58], [0, 1, 1, 0]);
  const serveCardX = useTransform(smoothProgress, [0.25, 0.35, 0.55], [60, 0, 40]);

  const receiveCardOpacity = useTransform(smoothProgress, [0.65, 0.78, 1], [0, 1, 1]);
  const receiveCardX = useTransform(smoothProgress, [0.65, 0.78, 1], [-60, 0, 0]);

  const handleHeroCta = () => {
    if (isAuthenticated) {
      audio.play('serve');
      router.push('/dashboard');
    } else {
      audio.play('smash');
      onOpenAuth();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[320vh] select-none">
      {/* Pinned 100vh Viewport Stage */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Layer 1: Pinned Arena Court Background with Dynamic Zoom & Depth */}
        <motion.div
          style={{
            scale: courtScale,
            filter: useTransform(courtBrightness, (b) => `brightness(${b}) contrast(1.1)`),
          }}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none transform-gpu"
        >
          <img
            src="/images/parallax/court-entrance.jpg"
            alt="UNN Badminton Court Arena"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to court-entrance1.jpg if court-entrance fails
              (e.currentTarget as HTMLImageElement).src = '/images/parallax/court-entrance1.jpg';
            }}
          />
          {/* Emerald Arena Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-radial from-transparent via-sl-green/5 to-black/80" />
        </motion.div>

        {/* Layer 2: Perspective Court Floor Mat Overlay */}
        <motion.div
          className="absolute bottom-0 inset-x-0 h-1/2 z-10 pointer-events-none opacity-40 mix-blend-screen"
        >
          <img
            src="/images/parallax/court-floor.png"
            alt="Court Markings Floor"
            className="w-full h-full object-contain object-bottom"
          />
        </motion.div>

        {/* Layer 3: Server Athlete Cutout (Left Side) */}
        <motion.div
          style={{ x: serverX, opacity: serverOpacity, scale: serverScale }}
          className="absolute left-2 sm:left-12 lg:left-24 bottom-6 sm:bottom-12 z-20 w-64 sm:w-80 lg:w-[420px] aspect-[3/4] pointer-events-none"
        >
          <img
            src="/images/parallax/player-server.png"
            alt="Server Athlete"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,200,83,0.45)]"
          />
          <div className="absolute bottom-4 left-6">
            <KineticVelocityBadge label="Phase" value="01. THE SERVE" />
          </div>
        </motion.div>

        {/* Layer 4: Animated Flying Shuttlecock with Parabolic Motion Trail */}
        <motion.div
          style={{
            left: shuttleX,
            top: shuttleY,
            rotate: shuttleRotate,
            opacity: shuttleOpacity,
          }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="relative">
            {/* Glowing Flight Flare */}
            <div className="absolute -inset-4 rounded-full bg-sl-green-glow/40 blur-lg animate-pulse" />
            <div className="w-12 h-12 text-3xl flex items-center justify-center filter drop-shadow-[0_0_15px_#00E676]">
              🏸
            </div>
          </div>
        </motion.div>

        {/* Layer 5: Receiver Athlete Cutout (Right Side) */}
        <motion.div
          style={{ x: receiverX, opacity: receiverOpacity, scale: receiverScale }}
          className="absolute right-2 sm:right-12 lg:right-24 bottom-6 sm:bottom-12 z-20 w-64 sm:w-80 lg:w-[420px] aspect-[3/4] pointer-events-none"
        >
          <img
            src="/images/parallax/player-receiver.png"
            alt="Receiver Athlete"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,200,83,0.45)]"
          />
          <div className="absolute bottom-4 right-6">
            <KineticVelocityBadge label="Phase" value="02. THE RECEIVE" />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* Layer 6: Dynamic Kinetic Overlay Storycards Swapping On Scroll */}
        {/* ========================================================================= */}

        {/* Storycard 1: Hero Welcome (0% - 25% Scroll) */}
        <motion.div
          style={{ opacity: heroCardOpacity, y: heroCardY }}
          className="absolute z-40 w-full max-w-3xl mx-auto px-6 text-center space-y-6 pointer-events-auto"
        >
          <div className="shuttle-panel p-8 sm:p-12 bg-sl-panel/85 backdrop-blur-2xl border border-sl-border shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-6">
            {/* UNN Badge */}
            <div className="inline-flex items-center gap-2 bg-sl-green/15 border border-sl-green/40 px-4 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-sl-green" />
              <span className="text-xs font-black uppercase tracking-widest text-sl-green">
                University of Nigeria, Nsukka
              </span>
              <Sparkles className="w-3 h-3 text-sl-green-glow" />
            </div>

            {/* Kinetic Main Title */}
            <h1
              className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none drop-shadow-lg"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              <KineticSplitReveal text="ENTER THE LION ARENA 🏸" />
            </h1>

            <p className="text-xs sm:text-base text-white/80 max-w-xl mx-auto font-medium leading-relaxed">
              UNN's premier badminton community. Professional coaching drills, national collegiate leagues, and verified equipment logistics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <ShuttleButton
                variant="green"
                onClick={handleHeroCta}
                className="w-full sm:w-auto px-8 py-4 text-sm font-black shadow-[0_10px_30px_rgba(0,200,83,0.4)]"
              >
                Register / Login to Enter 🦁
              </ShuttleButton>
              <a
                href="#schedule-preview"
                onClick={() => audio.play('rally')}
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur transition-all text-center"
              >
                Weekly Drills 📅
              </a>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="flex items-center justify-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest pointer-events-none"
          >
            <span>Scroll Down to Launch Serve</span>
            <ChevronDown className="w-4 h-4 text-sl-green-glow" />
          </motion.div>
        </motion.div>

        {/* Storycard 2: Serve Narrative (25% - 55% Scroll) */}
        <motion.div
          style={{ opacity: serveCardOpacity, x: serveCardX }}
          className="absolute right-4 sm:right-16 lg:right-24 z-40 w-full max-w-md px-4 pointer-events-auto"
        >
          <TiltCard className="p-6 sm:p-8 bg-sl-panel/90 backdrop-blur-2xl border-2 border-sl-green/40 shadow-2xl space-y-4">
            <span className="text-[11px] font-black uppercase text-sl-green tracking-widest flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> PHASE 01: SERVICE & RALLY LAUNCH
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              HIGH-VELOCITY <span className="text-sl-green">PRECISION</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Every point begins with explosive intention. We drill forehand high-drifts, deceptive flick serves, and rapid court baseline recovery.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-xs space-y-1">
                <span className="text-sl-green font-black flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> 350+ km/h
                </span>
                <p className="text-[10px] text-sl-muted">Smash Velocity Drill</p>
              </div>
              <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-xs space-y-1">
                <span className="text-sl-green font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> BWF Standard
                </span>
                <p className="text-[10px] text-sl-muted">Collegiate Mat Lines</p>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Storycard 3: Receive & Register Dock (65% - 100% Scroll) */}
        <motion.div
          style={{ opacity: receiveCardOpacity, x: receiveCardX }}
          className="absolute left-4 sm:left-16 lg:left-24 z-40 w-full max-w-md px-4 pointer-events-auto"
        >
          <TiltCard className="p-6 sm:p-8 bg-sl-panel/90 backdrop-blur-2xl border-2 border-sl-green shadow-2xl space-y-5">
            <span className="text-[11px] font-black uppercase text-sl-green tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sl-green-glow" /> PHASE 02: THE RECEIVE & ONBOARDING
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              READY TO PLAY YOUR <span className="text-sl-green">RETURN</span>?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              The shuttlecock has landed on your court. Complete your student athlete profile today, access weekly training schedules, and represent your faculty.
            </p>

            <ShuttleButton
              variant="green"
              onClick={handleHeroCta}
              className="w-full py-3.5 text-xs font-black shadow-lg flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Athlete Dashboard 🦁' : 'Join ShuttleLions Now ⚡'}</span>
              <ArrowRight className="w-4 h-4" />
            </ShuttleButton>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  );
}
