'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion';

// 1. Kinetic Marquee that speeds up & shifts horizontally based on scroll velocity
interface KineticMarqueeProps {
  items: string[];
  baseVelocity?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function KineticMarquee({
  items,
  baseVelocity = 100,
  direction = 'left',
  className = '',
}: KineticMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  // Map scroll velocity to dynamic x shift
  const xOffset = useTransform(smoothVelocity, [-1000, 0, 1000], [
    direction === 'left' ? -120 : 120,
    0,
    direction === 'left' ? 120 : -120,
  ]);

  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden whitespace-nowrap py-3 select-none pointer-events-none ${className}`}
    >
      <motion.div
        style={{ x: xOffset }}
        className="flex items-center gap-6 text-2xl sm:text-5xl font-black uppercase tracking-tighter"
      >
        {repeatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-6">
            <span
              className={
                idx % 2 === 0
                  ? 'text-sl-green drop-shadow-[0_0_12px_rgba(0,200,83,0.4)]'
                  : 'text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)]'
              }
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {item}
            </span>
            <span className="text-sl-green-glow text-xl">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// 2. Kinetic Split-Word Reveal with 3D Perspective Flip
interface KineticSplitRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function KineticSplitReveal({
  text,
  className = '',
  delay = 0,
}: KineticSplitRevealProps) {
  const words = text.split(' ');

  return (
    <div className={`overflow-hidden inline-flex flex-wrap gap-x-3 gap-y-1 ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden">
          <motion.span
            initial={{ y: '100%', rotateX: -60, opacity: 0 }}
            whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: delay + wordIndex * 0.08,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="inline-block transform-gpu origin-bottom"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

// 3. Kinetic Velocity Badge indicating smash speed
interface KineticVelocityBadgeProps {
  label: string;
  value: string;
}

export function KineticVelocityBadge({ label, value }: KineticVelocityBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: -2 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sl-panel/90 border-2 border-sl-green/40 backdrop-blur shadow-[0_10px_25px_rgba(0,200,83,0.25)]"
    >
      <span className="w-2 h-2 rounded-full bg-sl-green-glow animate-ping" />
      <span className="text-[10px] font-black uppercase tracking-widest text-sl-muted">{label}:</span>
      <span className="text-xs font-mono font-black text-sl-green-glow">{value}</span>
    </motion.div>
  );
}
