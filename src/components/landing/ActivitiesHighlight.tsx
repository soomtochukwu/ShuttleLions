'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { audio } from '@/lib/audio';

const HIGHLIGHTS = [
  {
    id: 1,
    title: 'Weekend Singles Open Knockout',
    date: 'Saturday Open Drill',
    location: 'UNN Indoor Sports Hall',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    desc: 'High-intensity rally matchplay testing player endurance and cross-court drop accuracy.',
  },
  {
    id: 2,
    title: 'Beginner & Intermediate Footwork Masterclass',
    date: 'Monday Drills',
    location: 'Court 1 & 2',
    image: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=1200&auto=format&fit=crop&q=80',
    desc: 'Focusing on 6-corner split steps, explosive scissor jumps, and injury prevention mechanics.',
  },
  {
    id: 3,
    title: 'Inter-Faculty Doubles Showdown',
    date: 'Monthly Championship',
    location: 'Main Gymnasium',
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=1200&auto=format&fit=crop&q=80',
    desc: 'Engineering, Medicine, Arts, and Sciences clash for collegiate glory and Yonex gear medals.',
  },
];

export function ActivitiesHighlight() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    audio.play('rally');
    setCurrentIndex((prev) => (prev === 0 ? HIGHLIGHTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    audio.play('rally');
    setCurrentIndex((prev) => (prev === HIGHLIGHTS.length - 1 ? 0 : prev + 1));
  };

  const current = HIGHLIGHTS[currentIndex];

  return (
    <section id="schedule-preview" className="relative w-full py-20 px-4 sm:px-8 select-none z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-sl-green">
              COURT LIFE & RECENT ACTION
            </span>
            <h2
              className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              PREVIOUS <span className="text-sl-green">ACTIVITIES</span> HIGHLIGHT
            </h2>
            <p className="text-xs sm:text-sm text-sl-muted font-medium">
              Take a look at varsity training sessions, tactical drills, and tournament matches.
            </p>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-sl-panel border border-sl-border text-sl-foreground hover:bg-sl-green hover:text-white transition-all shadow-md active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono font-bold text-sl-muted">
              {currentIndex + 1} / {HIGHLIGHTS.length}
            </span>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-sl-panel border border-sl-border text-sl-foreground hover:bg-sl-green hover:text-white transition-all shadow-md active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Card with 3D Tilt */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <TiltCard className="p-4 sm:p-6 bg-sl-panel overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Image Banner */}
                <div className="lg:col-span-7 relative aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden border border-sl-border">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover filter brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                      <Calendar className="w-3.5 h-3.5 text-sl-green-glow" /> {current.date}
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                      <MapPin className="w-3.5 h-3.5 text-sl-green-glow" /> {current.location}
                    </span>
                  </div>
                </div>

                {/* Right: Copy & Highlights */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="inline-block bg-sl-green/10 border border-sl-green/30 text-sl-green text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                    Featured Session
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-sl-foreground">
                    {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-sl-muted leading-relaxed font-medium">
                    {current.desc}
                  </p>
                  <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-xs space-y-1 font-semibold">
                    <div className="text-sl-green font-black flex items-center gap-1">
                      🏸 Training Schedule
                    </div>
                    <p className="text-sl-muted">
                      Monday (16:00 - 18:00) • Wednesday (16:00 - 18:00) • Saturday (08:00 - 11:30)
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
