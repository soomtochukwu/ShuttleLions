'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { audio } from '@/lib/audio';
import { Image as ImageIcon } from 'lucide-react';

const CAROUSEL_IMAGES = [
  {
    src: '/images/carousel/court-1.jpg',
    title: 'Nsukka Court A',
    desc: 'Our main indoor badminton court at UNN.',
  },
  {
    src: '/images/carousel/court-2.jpg',
    title: 'Outdoor Training Ground',
    desc: 'Sunny morning drill sessions with the captain.',
  },
  {
    src: '/images/carousel/team-1.jpg',
    title: 'The Lions Team',
    desc: 'Unleashing the spirit of sportsmanship.',
  },
  {
    src: '/images/carousel/team-2.jpg',
    title: 'Championship Trophy',
    desc: 'Celebrating our victories across campuses.',
  },
];

export function PhotoCarousel() {
 const [index, setIndex] = useState(0);
 const [direction, setDirection] = useState(0); // -1 for left, 1 for right
 const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

 useEffect(() => {
 const timer = setInterval(() => {
 handleNext(true);
 }, 5000);
 return () => clearInterval(timer);
 }, [index]);

 const handleNext = (isAuto = false) => {
 if (!isAuto) audio.play('rally');
 setDirection(1);
 setIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
 };

 const handlePrev = () => {
 audio.play('rally');
 setDirection(-1);
 setIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
 };

 const handleDotClick = (i: number) => {
 if (i === index) return;
 audio.play('netDrop');
 setDirection(i > index ? 1 : -1);
 setIndex(i);
 };

 const handleImageError = (i: number) => {
 setImageErrors((prev) => ({ ...prev, [i]: true }));
 };

 const slideVariants: Variants = {
 enter: (dir: number) => ({
 x: dir > 0 ? 300 : -300,
 opacity: 0,
 rotate: dir > 0 ? 6 : -6,
 }),
 center: {
 x: 0,
 opacity: 1,
 rotate: 0,
 transition: {
 x: { type: 'spring', stiffness: 300, damping: 25 },
 opacity: { duration: 0.2 },
 rotate: { type: 'spring', stiffness: 300, damping: 25 },
 },
 },
 exit: (dir: number) => ({
 x: dir > 0 ? -300 : 300,
 opacity: 0,
 rotate: dir > 0 ? -6 : 6,
 transition: {
 x: { duration: 0.25 },
 opacity: { duration: 0.2 },
 },
 }),
 };

 return (
 <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
 {/* Outer Polaroid Frame */}
 <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden shuttle-panel bg-sl-panel p-4 md:p-6 mb-6">
 <div className="w-full h-full relative overflow-hidden bg-sl-bg rounded border-2 border-sl-border flex items-center justify-center">
 <AnimatePresence initial={false} custom={direction} mode="wait">
 <motion.div
 key={index}
 custom={direction}
 variants={slideVariants}
 initial="enter"
 animate="center"
 exit="exit"
 className="absolute inset-0 w-full h-full flex flex-col justify-between"
 >
 {/* Image Area */}
 <div className="relative flex-1 w-full h-full bg-sl-muted/10 overflow-hidden">
 {!imageErrors[index] ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={CAROUSEL_IMAGES[index].src}
 alt={CAROUSEL_IMAGES[index].title}
 className="w-full h-full object-cover"
 onError={() => handleImageError(index)}
 />
 ) : (
 /* SVG Fallback Placeholder when images don't exist yet */
 <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-sl-panel border-b-2 border-sl-border">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-sl-green/10 border-2 border-sl-green/30 flex items-center justify-center text-sl-green">
              <ImageIcon className="w-8 h-8 animate-pulse" />
            </div>
 <h4 className="text-lg font-extrabold uppercase tracking-wide text-sl-green" style={{ fontFamily: 'Bangers, cursive' }}>
 {CAROUSEL_IMAGES[index].title}
 </h4>
 <p className="text-xs text-sl-muted font-bold max-w-xs mt-1">
 {CAROUSEL_IMAGES[index].desc}
 </p>
 <p className="text-[9px] text-sl-green font-mono uppercase bg-sl-green/10 border border-sl-green/30 px-2 py-0.5 rounded-full mt-4">
 Reads from public{CAROUSEL_IMAGES[index].src}
 </p>
 </div>
 )}

 {/* Caption Banner (Brutalist style overlapping bottom of image) */}
 {!imageErrors[index] && (
 <div className="absolute bottom-0 left-0 right-0 bg-sl-panel border-t-3 border-sl-border p-3 flex justify-between items-center z-10">
 <div>
 <h4 className="font-extrabold text-sm sm:text-base text-sl-foreground flex items-center gap-1.5">
 {CAROUSEL_IMAGES[index].title}
 </h4>
 <p className="text-xs text-sl-muted font-bold truncate max-w-[280px] sm:max-w-md">
 {CAROUSEL_IMAGES[index].desc}
 </p>
 </div>
 <span className="text-xs font-mono font-bold bg-sl-bg border-2 border-sl-border px-2 py-0.5 rounded">
 {index + 1}/{CAROUSEL_IMAGES.length}
 </span>
 </div>
 )}
 </div>
 </motion.div>
 </AnimatePresence>

 {/* Navigation Buttons */}
 <button
 onClick={handlePrev}
 className="absolute left-4 z-20 w-10 h-10 border-3 border-sl-border bg-sl-panel text-sl-foreground rounded-full flex items-center justify-center font-bold hover:bg-sl-bg active:translate-y-[2px] shadow-[2px_2px_0_var(--sl-shadow)] text-lg transition-transform hover:scale-105 active:shadow-none"
 aria-label="Previous image"
 >
 ←
 </button>
 <button
 onClick={() => handleNext()}
 className="absolute right-4 z-20 w-10 h-10 border-3 border-sl-border bg-sl-panel text-sl-foreground rounded-full flex items-center justify-center font-bold hover:bg-sl-bg active:translate-y-[2px] shadow-[2px_2px_0_var(--sl-shadow)] text-lg transition-transform hover:scale-105 active:shadow-none"
 aria-label="Next image"
 >
 →
 </button>
 </div>
 </div>

 {/* Dots Indicator */}
 <div className="flex gap-2">
 {CAROUSEL_IMAGES.map((_, i) => (
 <button
 key={i}
 onClick={() => handleDotClick(i)}
 className={`w-3.5 h-3.5 border-2 border-sl-border rounded-full transition-all ${
 i === index
 ? 'bg-sl-green scale-110 shadow-[1px_1px_0_var(--sl-shadow)]'
 : 'bg-sl-panel hover:bg-sl-bg'
 }`}
 aria-label={`Go to slide ${i + 1}`}
 />
 ))}
 </div>
 </div>
 );
}
