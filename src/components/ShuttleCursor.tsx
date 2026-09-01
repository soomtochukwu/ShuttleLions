'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function ShuttleCursor() {
 const [isVisible, setIsVisible] = useState(false);
 const [isClicking, setIsClicking] = useState(false);
 const [rotation, setRotation] = useState(0);

 // Raw mouse coordinates
 const mouseX = useMotionValue(-100);
 const mouseY = useMotionValue(-100);

 // Spring physics for smooth trailing
 const springConfig = { damping: 24, stiffness: 280, mass: 0.5 };
 const smoothX = useSpring(mouseX, springConfig);
 const smoothY = useSpring(mouseY, springConfig);

 useEffect(() => {
 // Only activate cursor on devices with fine pointer (mouse/trackpad, not touchscreens)
 if (typeof window === 'undefined' ||!window.matchMedia('(pointer: fine)').matches) {
 return;
 }

 let prevX = 0;
 let prevY = 0;

 const handleMouseMove = (e: MouseEvent) => {
 if (!isVisible) setIsVisible(true);
 mouseX.set(e.clientX);
 mouseY.set(e.clientY);

 // Compute trajectory tangent angle
 const dx = e.clientX - prevX;
 const dy = e.clientY - prevY;
 const dist = Math.hypot(dx, dy);

 if (dist > 3) {
 // Point shuttle nose towards motion direction (+ 90deg offset for SVG orientation)
 const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
 setRotation(angleDeg);
 prevX = e.clientX;
 prevY = e.clientY;
 }
 };

 const handleMouseDown = () => setIsClicking(true);
 const handleMouseUp = () => setIsClicking(false);
 const handleMouseLeave = () => setIsVisible(false);
 const handleMouseEnter = () => setIsVisible(true);

 window.addEventListener('mousemove', handleMouseMove, { passive: true });
 window.addEventListener('mousedown', handleMouseDown);
 window.addEventListener('mouseup', handleMouseUp);
 document.addEventListener('mouseleave', handleMouseLeave);
 document.addEventListener('mouseenter', handleMouseEnter);

 return () => {
 window.removeEventListener('mousemove', handleMouseMove);
 window.removeEventListener('mousedown', handleMouseDown);
 window.removeEventListener('mouseup', handleMouseUp);
 document.removeEventListener('mouseleave', handleMouseLeave);
 document.removeEventListener('mouseenter', handleMouseEnter);
 };
 }, [isVisible, mouseX, mouseY]);

 if (!isVisible) return null;

 return (
 <motion.div
 className="fixed top-0 left-0 pointer-events-none z-[9999]"
 style={{
 x: smoothX,
 y: smoothY,
 translateX: '-50%',
 translateY: '-50%',
 }}
 >
 <motion.div
 animate={{
 rotate: rotation,
 scale: isClicking ? 0.75 : 1,
 }}
 transition={{
 rotate: { type: 'spring', damping: 20, stiffness: 200 },
 scale: { type: 'spring', damping: 15, stiffness: 400 },
 }}
 className="relative w-8 h-8 filter drop-shadow-[0_4px_8px_rgba(0,200,83,0.4)]"
 >
 {/* Vector 3D Shuttlecock */}
 <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
 {/* Feather Cone */}
 <path
 d="M8 8 L32 8 L24 26 L16 26 Z"
 fill="rgba(255, 255, 255, 0.95)"
 stroke="var(--sl-green)"
 strokeWidth="1.5"
 strokeLinejoin="round"
 />
 {/* Feather Ribs */}
 <line x1="12" y1="8" x2="17.5" y2="26" stroke="var(--sl-green)" strokeWidth="1" opacity="0.6" />
 <line x1="20" y1="8" x2="20" y2="26" stroke="var(--sl-green)" strokeWidth="1" opacity="0.6" />
 <line x1="28" y1="8" x2="22.5" y2="26" stroke="var(--sl-green)" strokeWidth="1" opacity="0.6" />
 {/* Feather Cross Ring */}
 <path d="M11 16 Q20 18 29 16" stroke="var(--sl-green)" strokeWidth="1" fill="none" opacity="0.8" />
 {/* Green Binding Collar */}
 <rect x="15.5" y="25" width="9" height="3" rx="1" fill="var(--sl-green)" />
 {/* Cork Dome */}
 <path
 d="M16 28 C16 33, 24 33, 24 28 Z"
 fill="#FFFFFF"
 stroke="var(--sl-border)"
 strokeWidth="1"
 />
 </svg>

 {/* Glow particle spark on click */}
 {isClicking && (
 <motion.div
 initial={{ scale: 0.5, opacity: 1 }}
 animate={{ scale: 2.2, opacity: 0 }}
 className="absolute inset-0 rounded-full border-2 border-sl-green-glow"
 />
 )}
 </motion.div>
 </motion.div>
 );
}
