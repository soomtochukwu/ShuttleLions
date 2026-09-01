'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PARALLAX_ASSETS_CONFIG } from '@/config/parallax-assets';
import { TiltCard } from '@/components/ui/TiltCard';
import { Zap, Activity, ShieldCheck, Trophy } from 'lucide-react';

export function ServeSequence() {
 const containerRef = useRef<HTMLDivElement>(null);
 const [imageError, setImageError] = useState(false);
 const config = PARALLAX_ASSETS_CONFIG.playerServer;

 const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ['start end', 'end start'],
 });

 // Parallax transitions
 const playerX = useTransform(scrollYProgress, [0, 0.45, 0.9], [-120, 0, -40]);
 const playerScale = useTransform(scrollYProgress, [0, 1], config.scaleRange);
 const playerOpacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0, 1, 1, 0.3]);
 const textX = useTransform(scrollYProgress, [0, 0.45, 1], [100, 0, 0]);

 return (
 <section
 ref={containerRef}
 className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-8 py-20 select-none"
 >
 <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
 {/* Left Column: Server Athlete Image Cutout with Parallax */}
 <motion.div
 style={{ x: playerX, scale: playerScale, opacity: playerOpacity }}
 className="relative flex items-center justify-center"
 >
 <div className="relative w-full max-w-md aspect-[3/4] flex items-center justify-center">
 {!imageError ? (
 <img
 src={config.src}
 alt={config.alt}
 onError={() => setImageError(true)}
 className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,200,83,0.35)]"
 />
 ) : (
 /* High-end Vector Stylized Athlete Cutout Silhouette */
 <div className="w-full h-full rounded-3xl shuttle-panel bg-gradient-to-tr from-sl-panel to-sl-green/10 border-2 border-sl-green/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
 <div className="w-24 h-24 rounded-full bg-sl-green/20 border-2 border-sl-green flex items-center justify-center text-4xl shadow-inner">
 
 </div>
 <div>
 <span className="text-xs font-black uppercase tracking-widest text-sl-green">
 Athlete Slot 01
 </span>
 <h3 className="text-xl font-black text-sl-foreground mt-1">
 {config.fallbackTitle}
 </h3>
 <p className="text-xs text-sl-muted mt-1 max-w-xs">
 {config.fallbackSubtitle}
 </p>
 </div>
 <div className="text-[10px] font-mono text-sl-muted bg-sl-bg px-3 py-1 rounded border border-sl-border">
 Drop image: public/images/parallax/player-server.png
 </div>
 </div>
 )}

 {/* Glowing Serve Arc Particle */}
 <motion.div
 animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
 transition={{ repeat: Infinity, duration: 2.4 }}
 className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-sl-green/20 blur-xl pointer-events-none"
 />
 </div>
 </motion.div>

 {/* Right Column: Serve Narrative & Training Metrics */}
 <motion.div style={{ x: textX }} className="space-y-6">
 <div className="space-y-2">
 <span className="text-xs font-black uppercase tracking-widest text-sl-green flex items-center gap-1.5">
 <Zap className="w-3.5 h-3.5" /> PHASE 01: SERVICE & RALLY LAUNCH
 </span>
 <h2
 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-sl-foreground leading-tight"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 HIGH-VELOCITY <span className="text-sl-green">PRECISION</span> ON COURT
 </h2>
 <p className="text-xs sm:text-base text-sl-muted font-medium leading-relaxed">
 Every point begins with explosive intention. At ShuttleLions, we drill serve consistency, deception, and rapid court baseline recovery with professional collegiate coaching.
 </p>
 </div>

 {/* 3D Tilt Feature Highlights */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <TiltCard className="p-5 bg-sl-panel space-y-2">
 <div className="flex items-center gap-2 text-sl-green font-black text-sm">
 <Activity className="w-4 h-4" /> 350+ km/h
 </div>
 <p className="text-xs font-bold text-sl-foreground">Smash Velocity Drills</p>
 <p className="text-[11px] text-sl-muted">
 Biomechanically optimized forearm pronation and wrist snap training.
 </p>
 </TiltCard>

 <TiltCard className="p-5 bg-sl-panel space-y-2">
 <div className="flex items-center gap-2 text-sl-green font-black text-sm">
 <ShieldCheck className="w-4 h-4" /> BWF Certified
 </div>
 <p className="text-xs font-bold text-sl-foreground">Standard Court Dimensions</p>
 <p className="text-[11px] text-sl-muted">
 Official mat lines, tournament net height, and feather shuttlecocks.
 </p>
 </TiltCard>
 </div>
 </motion.div>
 </div>
 </section>
 );
}
