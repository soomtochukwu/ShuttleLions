'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion';

interface TiltCardProps extends HTMLMotionProps<'div'> {
 children: React.ReactNode;
 className?: string;
 maxTilt?: number;
 glowEffect?: boolean;
 translateZ?: number;
 sheenOpacity?: number;
}

export function TiltCard({
 children,
 className = '',
 maxTilt = 6,
 glowEffect = true,
 translateZ = 10,
 sheenOpacity = 0.4,
 ...props
}: TiltCardProps) {
 const cardRef = useRef<HTMLDivElement>(null);
 const [isHovered, setIsHovered] = useState(false);

 // Normalized mouse coordinates (-0.5 to 0.5)
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 // Smooth spring physics for rotation (damping: 25, stiffness: 180 prevents shake/jitter)
 const springConfig = { damping: 25, stiffness: 180 };
 const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
 const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

 // Glare / Sheen position
 const sheenX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
 const sheenY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

 const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
 if (!cardRef.current) return;
 const rect = cardRef.current.getBoundingClientRect();
 const x = (e.clientX - rect.left) / rect.width - 0.5;
 const y = (e.clientY - rect.top) / rect.height - 0.5;
 mouseX.set(x);
 mouseY.set(y);
 };

 const handlePointerEnter = () => setIsHovered(true);

 const handlePointerLeave = () => {
 setIsHovered(false);
 mouseX.set(0);
 mouseY.set(0);
 };

 return (
 <div style={{ perspective: 1000 }} className="relative">
 <motion.div
 ref={cardRef}
 onPointerMove={handlePointerMove}
 onPointerEnter={handlePointerEnter}
 onPointerLeave={handlePointerLeave}
 style={{
 rotateX,
 rotateY,
 transformStyle: 'preserve-3d',
 }}
 className={`shuttle-panel relative overflow-hidden transition-shadow duration-300 ${
 isHovered ? 'shadow-[0_20px_50px_rgba(0,200,83,0.15)] border-sl-green/40' : ''
 } ${className}`}
 {...props}
 >
 {/* Dynamic Light Sheen Overlay */}
 {glowEffect && isHovered && (
 <motion.div
 className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
 style={{
 opacity: sheenOpacity,
 background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.45) 0%, transparent 60%)`,
 }}
 />
 )}

 <div className="relative z-10" style={{ transform: `translateZ(${translateZ}px)` }}>
 {children}
 </div>
 </motion.div>
 </div>
 );
}
