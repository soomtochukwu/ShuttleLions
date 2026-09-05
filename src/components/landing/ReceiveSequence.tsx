'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useParallaxConfig } from '@/config/parallax-assets';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { audio } from '@/lib/audio';

interface ReceiveSequenceProps {
 onOpenAuth: () => void;
}

export function ReceiveSequence({ onOpenAuth }: ReceiveSequenceProps) {
 const containerRef = useRef<HTMLDivElement>(null);
 const [imageError, setImageError] = useState(false);
 const { config: parallaxMap } = useParallaxConfig();
 const config = parallaxMap.playerReceiver;
 const { isAuthenticated } = useAuth();
 const router = useRouter();

 const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ['start end', 'end start'],
 });

 // Parallax transitions
 const playerX = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, 40]);
 const playerScale = useTransform(scrollYProgress, [0, 1], config.scaleRange);
 const playerOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0.3]);
 const textX = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, 0]);

 const handleCta = () => {
 if (isAuthenticated) {
 audio.play('serve');
 router.push('/dashboard');
 } else {
 audio.play('smash');
 onOpenAuth();
 }
 };

 return (
 <section
 ref={containerRef}
 className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-8 py-20 select-none"
 >
 <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
 {/* Left Column: Receiver Narrative & Registration Action Dock */}
 <motion.div style={{ x: textX }} className="space-y-8 order-2 lg:order-1">
 <div className="space-y-3">
 <span className="text-xs font-black uppercase tracking-widest text-sl-green flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-sl-green-glow" /> PHASE 02: THE RECEIVE & ONBOARDING
 </span>
 <h2
 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-sl-foreground leading-tight"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 READY TO PLAY YOUR <span className="text-sl-green">RETURN</span>?
 </h2>
 <p className="text-xs sm:text-base text-sl-muted font-medium leading-relaxed">
 The service has landed on your court. Complete your student athlete profile today, access live training schedules, participate in community voting, and represent your faculty.
 </p>
 </div>

 {/* Action Card Dock */}
 <div className="shuttle-panel p-6 bg-sl-panel space-y-5 border-2 border-sl-green/30">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-sl-green/20 text-sl-green flex items-center justify-center font-bold">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-sm font-black text-sl-foreground uppercase">
 UNN Student Verification
 </h4>
 <p className="text-xs text-sl-muted">
 Use your student email or LinkedIn profile to register instantly.
 </p>
 </div>
 </div>

 <ShuttleButton
 variant="green"
 onClick={handleCta}
 className="w-full py-4 text-sm font-black shadow-lg flex items-center justify-center gap-2"
 >
 <span>{isAuthenticated ? 'Open Student Dashboard ' : 'Join ShuttleLions Now '}</span>
 <ArrowRight className="w-4 h-4" />
 </ShuttleButton>
 </div>
 </motion.div>

 {/* Right Column: Receiver Athlete Cutout with Parallax */}
 <motion.div
 style={{ x: playerX, scale: playerScale, opacity: playerOpacity }}
 className="relative flex items-center justify-center order-1 lg:order-2"
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
 <div className="w-full h-full rounded-3xl shuttle-panel bg-gradient-to-tl from-sl-panel to-sl-green/10 border-2 border-sl-green/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
 <div className="w-24 h-24 rounded-full bg-sl-green/20 border-2 border-sl-green flex items-center justify-center text-4xl shadow-inner">
 
 </div>
 <div>
 <span className="text-xs font-black uppercase tracking-widest text-sl-green">
 Athlete Slot 02
 </span>
 <h3 className="text-xl font-black text-sl-foreground mt-1">
 {config.fallbackTitle}
 </h3>
 <p className="text-xs text-sl-muted mt-1 max-w-xs">
 {config.fallbackSubtitle}
 </p>
 </div>
 <div className="text-[10px] font-mono text-sl-muted bg-sl-bg px-3 py-1 rounded border border-sl-border">
 Drop image: public/images/parallax/player-receiver.png
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </div>
 </section>
 );
}
