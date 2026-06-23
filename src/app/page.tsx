'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Navbar } from '@/components/Navbar';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { AuthModal } from '@/components/AuthModal';
import { Interactive3DBackground } from '@/components/Interactive3DBackground';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { Footer } from '@/components/Footer';
import { formatKobo, REGISTRATION_FEE, MONTHLY_FEE } from '@/lib/constants';
import { audio } from '@/lib/audio';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      audio.play('serve');
      router.push('/dashboard');
    } else {
      audio.play('smash');
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-sl-bg overflow-x-hidden">
      <Interactive3DBackground />

      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      </div>
        
        {/* SECTION 1: HERO (Fade & Scale Effect) */}
        <motion.section
          id="hero-section"
          className="scroll-section w-full px-4 pt-20 flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0.2, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.94 }}
          viewport={{ amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="glow-light top-[20%] left-[15%]" />
          
          {/* Left Column: Hero copy card */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 z-10">
            <div 
              className="w-full text-left space-y-6 sm:space-y-8 py-10 px-8 sm:px-10 rounded-2xl shuttle-panel"
              style={{ background: 'var(--sl-glass-bg)' }}
            >
              <span className="inline-block bg-sl-green/10 border border-sl-green text-sl-green text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                University of Nigeria, Nsukka
              </span>
              
              <h1
                className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-sl-foreground uppercase"
                style={{
                  fontFamily: 'var(--font-title)',
                }}
              >
                UNLEASH THE <span className="text-sl-green">LION</span> WITHIN 🏸
              </h1>
              
              <p className="text-xs sm:text-base text-sl-muted font-medium leading-relaxed">
                Step onto the court with ShuttleLions. Register now for professional training drills, national collegiate leagues, and verified equipment logistics at UNN.
              </p>

              <div className="pt-2 flex justify-start">
                <ShuttleButton variant="green" onClick={handleCtaClick} className="px-6 py-3 text-sm font-bold shadow-lg">
                  {isAuthenticated ? 'Go to Student Dashboard 🦁' : 'Register / Login Now ⚡'}
                </ShuttleButton>
              </div>
            </div>
          </div>
          
          {/* Right Column: Empty space for 3D Serve Athlete (WebGL) */}
          <div className="w-full md:w-1/2 h-[35vh] md:h-full pointer-events-none z-10" />
        </motion.section>

        {/* SECTION 2: GALLERY CAROUSEL (Slide in from Left Effect) */}
        <motion.section
          id="gallery-section"
          className="scroll-section w-full px-4 pt-20 flex flex-col justify-center items-center"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 22 }}
        >
          <div className="glow-light bottom-[20%] right-[10%]" />
          <div className="w-full space-y-6 z-10 px-6 sm:px-12 md:px-20">
            <div className="text-center space-y-2">
              <h2
                className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                📸 Club Gallery
              </h2>
              <p className="text-xs sm:text-sm text-sl-muted font-medium">Explore training courts and athletic life at UNN</p>
            </div>
            <PhotoCarousel />
          </div>
        </motion.section>

        {/* SECTION 3: ABOUT & TRAINING SCHEDULE (Zoom In Effect) */}
        <motion.section
          id="about-section"
          className="scroll-section w-full px-4 pt-20 flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.82 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          <div className="glow-light top-[30%] right-[15%]" />
          <div className="w-full space-y-6 z-10 px-6 sm:px-12 md:px-20">
            <div className="text-center space-y-2">
              <h2
                className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                🦁 Our Mission
              </h2>
              <p className="text-xs sm:text-sm text-sl-muted font-medium">Fostering badminton athleticism at the Lion Den</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Statement */}
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-sl-green" style={{ fontFamily: 'var(--font-sub)' }}>
                  Athletic Excellence
                </h3>
                <p className="text-xs sm:text-sm text-sl-foreground leading-relaxed font-medium">
                  We are dedicated to building national collegiate athletes. ShuttleLions connects you with qualified coaching resources, standard indoor training court times, and tournament schedules.
                </p>
                <p className="text-xs text-sl-muted leading-relaxed font-medium">
                  From racket purchase validation to monthly progress tracking, we leverage modern software automation to run badminton operations seamlessly.
                </p>
              </div>

              {/* Training Schedule */}
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-sl-green" style={{ fontFamily: 'var(--font-sub)' }}>
                  📅 Weekly Training Schedule
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-bold text-sl-foreground">
                  <div className="flex justify-between border-b border-sl-border/10 pb-1">
                    <span className="font-semibold">🗓️ Mon (Beginners & Drills)</span>
                    <span className="text-sl-green font-mono">16:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between border-b border-sl-border/10 pb-1">
                    <span className="font-semibold">🗓️ Wed (Tactical Plays)</span>
                    <span className="text-sl-green font-mono">16:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between border-b border-sl-border/10 pb-1">
                    <span className="font-semibold">🗓️ Sat (Open Rally Match)</span>
                    <span className="text-sl-green font-mono">08:00 - 11:30</span>
                  </div>
                </div>
                <p className="text-[10px] text-sl-muted font-semibold italic mt-2">
                  * Drill hours take place at the UNN Indoor Sports Hall.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 4: FEES & DUES (3D Flip Entry Effect) */}
        <motion.section
          id="fees-section"
          className="scroll-section w-full px-4 pt-20 flex flex-col justify-center items-center"
          initial={{ opacity: 0, y: 100, rotateX: 18 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        >
          <div className="glow-light bottom-[10%] left-[20%]" />
          <div className="w-full space-y-8 z-10 px-6 sm:px-12 md:px-20">
            <div className="text-center space-y-2">
              <h2
                className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                💰 Membership Dues
              </h2>
              <p className="text-xs sm:text-sm text-sl-muted font-medium">Affordable athletic pricing mapped out transparently</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fee Card 1 */}
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-2xl text-sl-green">⚡</div>
                  <h3 className="text-md font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                    Registration
                  </h3>
                  <p className="text-3xl font-black text-sl-green">{formatKobo(REGISTRATION_FEE)}</p>
                  <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                    A one-time mandatory fee for all new club members. This covers database registration, membership ID card, and a shuttlecock starter pack.
                  </p>
                </div>
              </div>

              {/* Fee Card 2 */}
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-2xl text-sl-green">📅</div>
                  <h3 className="text-md font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                    Monthly dues
                  </h3>
                  <p className="text-3xl font-black text-sl-green">{formatKobo(MONTHLY_FEE)}<span className="text-xs text-sl-muted font-semibold lowercase">/mo</span></p>
                  <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                    Paid monthly to maintain active membership. Covers indoor court bookings, lighting, net maintenance, and open training rally sessions.
                  </p>
                </div>
              </div>

              {/* Fee Card 3 */}
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-2xl text-sl-green">🏸</div>
                  <h3 className="text-md font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                    Rackets
                  </h3>
                  <p className="text-3xl font-black text-sl-green">Optional</p>
                  <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                    Order professional badminton rackets directly. Racket orders are confirmed by the admin and shipped straight to the UNN training hall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5: HOW IT WORKS + FOOTER (Slide in from Right Effect) */}
        <motion.section
          id="onboard-section"
          className="scroll-section w-full pt-20 flex flex-col justify-between"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 22 }}
        >
          <div className="glow-light top-[10%] left-[50%]" />
          
          {/* Two column split */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between z-10 px-6 sm:px-12 md:px-20 mt-auto mb-auto">
            {/* Left Column: How it Works vertical steps */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div 
                className="w-full space-y-6 p-8 sm:p-10 rounded-2xl shuttle-panel text-left"
                style={{ background: 'var(--sl-glass-bg)' }}
              >
                <div className="space-y-2">
                  <h2
                    className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
                    style={{ fontFamily: 'var(--font-title)' }}
                  >
                    🚀 How It Works
                  </h2>
                  <p className="text-xs sm:text-sm text-sl-muted font-medium">Join and scale your badminton skills in 3 steps</p>
                </div>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start border-b border-sl-border/10 pb-3">
                    <span className="w-8 h-8 shrink-0 rounded-full border-2 border-sl-border bg-sl-green/10 text-sl-green font-bold flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                        Onboard Profile
                      </h3>
                      <p className="text-xs text-sl-muted font-semibold mt-1">
                        Sign in using your UNN email or LinkedIn profile, and select your faculty, level, and department details.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start border-b border-sl-border/10 pb-3">
                    <span className="w-8 h-8 shrink-0 rounded-full border-2 border-sl-border bg-sl-green/10 text-sl-green font-bold flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                        Pay Dues
                      </h3>
                      <p className="text-xs text-sl-muted font-semibold mt-1">
                        Pay your registration and monthly dues directly. Track order statuses if purchasing rackets.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start">
                    <span className="w-8 h-8 shrink-0 rounded-full border-2 border-sl-border bg-sl-green/10 text-sl-green font-bold flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'var(--font-sub)' }}>
                        Smash Courts
                      </h3>
                      <p className="text-xs text-sl-muted font-semibold mt-1">
                        Book courts, attend coaching drills, meet fellow ShuttleLions, and compete in campus tournaments!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Empty space for 3D Receiver Athlete (WebGL) */}
            <div className="w-full md:w-1/2 h-[35vh] md:h-full pointer-events-none z-10" />
          </div>

          {/* Footer inside the final snap viewport (visible only when scrolled to bottom) */}
          <div className="w-full mt-auto">
            <Footer />
          </div>
        </motion.section>

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
