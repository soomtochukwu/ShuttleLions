'use client';

import { motion } from 'framer-motion';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { FloatingShuttlecocks } from '@/components/FloatingShuttlecocks';
import { springIn, slideUp, staggerContainer } from '@/lib/animations';
import { audio } from '@/lib/audio';
import Link from 'next/link';

export default function AboutPage() {
  const handleBackClick = () => {
    audio.play('netDrop');
  };

  return (
    <div className="flex flex-col items-center justify-start pt-12 md:pt-16 px-4 sm:p-6 pb-24 relative w-full min-h-full bg-sl-bg">
      <FloatingShuttlecocks />

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={springIn}
          initial="hidden"
          animate="visible"
        >
          <h1
            className="text-3xl sm:text-6xl mb-2 text-stroke text-sl-green"
            style={{
              fontFamily: 'Bangers, cursive',
              textShadow: '3px 3px 0 var(--sl-border)',
            }}
          >
            WHO ARE THE SHUTTLELIONS?
          </h1>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Origin Story */}
          <motion.div
            variants={slideUp}
            className="shuttle-panel p-5 sm:p-8 relative overflow-hidden bg-sl-panel"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-9xl">
              🏸
            </div>
            <h2
              className="text-2xl mb-4 text-sl-green"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              OUR MISSION 🦁
            </h2>
            <p
              className="text-base sm:text-lg text-sl-foreground leading-relaxed mb-4 font-semibold"
            >
              Founded in the heart of the University of Nigeria, Nsukka, the ShuttleLions Badminton Club is dedicated to fostering athletic excellence, physical wellness, and camaraderie among UNN students.
            </p>
            <p
              className="text-base sm:text-lg text-sl-muted leading-relaxed font-semibold"
            >
              Whether you are a seasoned champion prepping for the West African University Games (WAUG) or a complete novice looking to serve your first shuttle, ShuttleLions offers a welcoming environment, professional training equipment, and competitive tournaments.
            </p>
          </motion.div>

          {/* Training Schedule */}
          <motion.div variants={slideUp} className="shuttle-panel p-5 sm:p-8 bg-sl-panel">
            <h2
              className="text-2xl mb-4 text-sl-green"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              📅 WEEKLY TRAINING SCHEDULE
            </h2>
            
            <div className="space-y-3 text-xs sm:text-sm font-bold text-sl-foreground">
              <div className="flex justify-between border-b-2 border-sl-border/10 pb-1">
                <span>🗓️ Monday (Beginners & Drills)</span>
                <span className="text-sl-green">4:00 PM - 6:00 PM</span>
              </div>
              <div className="flex justify-between border-b-2 border-sl-border/10 pb-1">
                <span>🗓️ Wednesday (Tactical & Doubles play)</span>
                <span className="text-sl-green">4:00 PM - 6:00 PM</span>
              </div>
              <div className="flex justify-between border-b-2 border-sl-border/10 pb-1">
                <span>🗓️ Saturday (Open Court / Club Ladder)</span>
                <span className="text-sl-green">8:00 AM - 11:30 AM</span>
              </div>
            </div>
            
            <p className="text-[11px] text-sl-muted font-bold mt-4 italic">
              * Training takes place at the UNN Indoor Sports Hall. Active monthly dues are required to access the courts during official training hours.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div variants={slideUp} className="text-center pt-4">
            <p
              className="text-lg mb-4 font-bold text-sl-foreground"
            >
              Ready to smash your goals?
            </p>
            <ShuttleButton
              variant="green"
              onClick={handleBackClick}
              className="w-full sm:w-auto"
            >
              <Link href="/">
                👈 BACK TO LANDING PAGE
              </Link>
            </ShuttleButton>
          </motion.div>

          <div className="h-12"></div> {/* Spacer */}
        </motion.div>
      </div>
    </div>
  );
}
