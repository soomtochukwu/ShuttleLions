'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useParallaxConfig } from '@/config/parallax-assets';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { audio } from '@/lib/audio';
import { MapPin, ChevronDown, Sparkles } from 'lucide-react';

interface CourtEntranceProps {
 onCtaClick: () => void;
}

export function CourtEntrance({ onCtaClick }: CourtEntranceProps) {
 const containerRef = useRef<HTMLDivElement>(null);
 const [imageError, setImageError] = useState(false);
 const { config: parallaxMap } = useParallaxConfig();
 const config = parallaxMap.courtEntrance;

 const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ['start start', 'end start'],
 });

 // Parallax scale and translation
 const scale = useTransform(scrollYProgress, [0, 1], config.scaleRange);
 const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.8, 0.2]);
 const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);

 return (
 <motion.section
 ref={containerRef}
 style={{ opacity }}
 className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20 select-none"
 >
 {/* Background Court Entrance Layer with Parallax Zoom */}
 <motion.div
 style={{ scale }}
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 >
 {!imageError ? (
 <img
 src={config.src}
 alt={config.alt}
 onError={() => setImageError(true)}
 className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.1] transition-opacity duration-700"
 />
 ) : (
 /* High-Contrast Stylized Fallback Arena */
 <div className="w-full h-full bg-gradient-to-b from-[#031508] via-[#08200f] to-[#040a05] flex items-center justify-center">
 {/* Perspective Court Grid Lines */}
 <div
 className="absolute inset-0 opacity-20"
 style={{
 backgroundImage: `
 linear-gradient(rgba(0, 200, 83, 0.2) 2px, transparent 2px),
 linear-gradient(90deg, rgba(0, 200, 83, 0.2) 2px, transparent 2px)
 `,
 backgroundSize: '80px 80px',
 transform: 'perspective(600px) rotateX(60deg) scale(1.5)',
 }}
 />
 </div>
 )}

 {/* Ambient Emerald Vignette */}
 <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
 </motion.div>

 {/* Foreground Hero Content Card */}
 <motion.div
 style={{ y: textY }}
 className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 px-6 sm:px-12 py-12 rounded-3xl shuttle-panel bg-sl-panel/80 backdrop-blur-2xl border border-sl-border shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
 >
 {/* UNN Badge */}
 <div className="inline-flex items-center gap-2 bg-sl-green/15 border border-sl-green/40 px-4 py-1.5 rounded-full">
 <MapPin className="w-3.5 h-3.5 text-sl-green" />
 <span className="text-xs font-black uppercase tracking-widest text-sl-green">
 University of Nigeria, Nsukka
 </span>
 <Sparkles className="w-3 h-3 text-sl-green-glow" />
 </div>

 {/* Main Title */}
 <h1
 className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none drop-shadow-lg"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 ENTER THE <span className="text-sl-green">LION</span> ARENA 
 </h1>

 {/* Subtitle */}
 <p className="text-sm sm:text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
 Step into UNN's premier badminton community. Professional coaching drills, national collegiate leagues, community tournaments, and official equipment logistics.
 </p>

 {/* Action CTAs */}
 <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
 <ShuttleButton
 variant="green"
 onClick={onCtaClick}
 className="w-full sm:w-auto px-8 py-4 text-sm font-black shadow-[0_10px_30px_rgba(0,200,83,0.4)]"
 >
 Register / Login to Enter 
 </ShuttleButton>

 <a
 href="#schedule-preview"
 onClick={() => audio.play('rally')}
 className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur transition-all text-center"
 >
 View Weekly Schedule 
 </a>
 </div>
 </motion.div>

 {/* Scroll Down Prompt Indicator */}
 <motion.div
 animate={{ y: [0, 8, 0] }}
 transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
 className="absolute bottom-6 z-10 flex flex-col items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-widest pointer-events-none"
 >
 <span>Scroll to Start Serve</span>
 <ChevronDown className="w-4 h-4 text-sl-green-glow" />
 </motion.div>
 </motion.section>
 );
}
