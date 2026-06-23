'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Navbar } from '@/components/Navbar';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { AuthModal } from '@/components/AuthModal';
import { FloatingShuttlecocks } from '@/components/FloatingShuttlecocks';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { formatKobo, REGISTRATION_FEE, MONTHLY_FEE } from '@/lib/constants';
import { audio } from '@/lib/audio';

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
    <div className="flex flex-col min-h-screen relative w-full bg-sl-bg">
      <FloatingShuttlecocks />

      {/* Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 z-10 space-y-16">
        
        {/* Hero Section */}
        <section className="shuttle-panel p-6 sm:p-12 text-center bg-sl-panel relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block bg-sl-green/10 border-2 border-sl-green text-sl-green text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              University of Nigeria, Nsukka
            </span>
            
            <h1
              className="text-4xl sm:text-7xl font-extrabold text-stroke leading-none text-sl-foreground"
              style={{
                fontFamily: 'Bangers, cursive',
                textShadow: '4px 4px 0 var(--sl-border)',
              }}
            >
              JOIN THE SHUTTLELIONS 🏸
            </h1>
            
            <p className="text-base sm:text-xl text-sl-muted max-w-xl mx-auto font-semibold leading-relaxed">
              Welcome to the official badminton club of UNN! Register today to gain access to premium court scheduling, expert coaching, training sessions, and club tournaments.
            </p>

            <div className="pt-4 flex justify-center">
              <ShuttleButton variant="green" onClick={handleCtaClick} className="px-8 py-4 text-lg">
                {isAuthenticated ? 'Go to Student Dashboard 🦁' : 'Register / Login Now ⚡'}
              </ShuttleButton>
            </div>
          </div>
        </section>

        {/* Photo Gallery Carousel */}
        <section className="space-y-6">
          <h2
            className="text-3xl sm:text-5xl text-center text-stroke text-sl-foreground uppercase"
            style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}
          >
            📸 Club Life & Courts
          </h2>
          <PhotoCarousel />
        </section>

        {/* Fee Breakdown Cards */}
        <section className="space-y-8">
          <h2
            className="text-3xl sm:text-5xl text-center text-stroke text-sl-foreground uppercase"
            style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}
          >
            💰 Membership dues & Fees
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Registration */}
            <div className="shuttle-panel p-6 bg-sl-panel flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div className="space-y-3">
                <span className="text-4xl">⚡</span>
                <h3 className="text-xl font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'Bangers, cursive' }}>
                  One-time Registration
                </h3>
                <p className="text-3xl font-black text-sl-green">{formatKobo(REGISTRATION_FEE)}</p>
                <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                  Required for all new club members. This fee covers database registration, membership ID card, and a shuttlecock starter pack.
                </p>
              </div>
            </div>

            {/* Card 2: Monthly Dues */}
            <div className="shuttle-panel p-6 bg-sl-panel flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div className="space-y-3">
                <span className="text-4xl">📅</span>
                <h3 className="text-xl font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'Bangers, cursive' }}>
                  Monthly Membership
                </h3>
                <p className="text-3xl font-black text-sl-green">{formatKobo(MONTHLY_FEE)}<span className="text-xs text-sl-muted"> / mo</span></p>
                <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                  Paid monthly to maintain active membership. Covers indoor court bookings, lighting, net maintenance, and open rally sessions.
                </p>
              </div>
            </div>

            {/* Card 3: Rackets */}
            <div className="shuttle-panel p-6 bg-sl-panel flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div className="space-y-3">
                <span className="text-4xl">🏸</span>
                <h3 className="text-xl font-bold uppercase tracking-wider text-sl-foreground" style={{ fontFamily: 'Bangers, cursive' }}>
                  Racket Purchase
                </h3>
                <p className="text-3xl font-black text-sl-green">Optional</p>
                <p className="text-xs text-sl-muted leading-relaxed font-semibold">
                  Buy professional badminton rackets directly through the club. Payments are verified by the admin, and status can be tracked from order to delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="space-y-8">
          <h2
            className="text-3xl sm:text-5xl text-center text-stroke text-sl-foreground uppercase"
            style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}
          >
            🚀 How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="shuttle-panel p-6 bg-sl-panel text-center relative rotate-[-1deg]">
              <span className="absolute top-[-15px] left-[15px] w-8 h-8 rounded-full border-2 border-sl-border bg-sl-green text-white font-extrabold flex items-center justify-center">
                1
              </span>
              <h3 className="text-lg font-extrabold uppercase mt-2 mb-2" style={{ fontFamily: 'Bangers, cursive' }}>
                Onboard Profile
              </h3>
              <p className="text-xs text-sl-muted font-semibold">
                Sign in using your UNN email or LinkedIn profile, and fill in your faculty, level, and department details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="shuttle-panel p-6 bg-sl-panel text-center relative rotate-[1deg]">
              <span className="absolute top-[-15px] left-[15px] w-8 h-8 rounded-full border-2 border-sl-border bg-sl-green text-white font-extrabold flex items-center justify-center">
                2
              </span>
              <h3 className="text-lg font-extrabold uppercase mt-2 mb-2" style={{ fontFamily: 'Bangers, cursive' }}>
                Make Payments
              </h3>
              <p className="text-xs text-sl-muted font-semibold">
                Pay your registration and monthly dues. Track order statuses if purchasing equipment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="shuttle-panel p-6 bg-sl-panel text-center relative rotate-[-1deg]">
              <span className="absolute top-[-15px] left-[15px] w-8 h-8 rounded-full border-2 border-sl-border bg-sl-green text-white font-extrabold flex items-center justify-center">
                3
              </span>
              <h3 className="text-lg font-extrabold uppercase mt-2 mb-2" style={{ fontFamily: 'Bangers, cursive' }}>
                Hit the Court
              </h3>
              <p className="text-xs text-sl-muted font-semibold">
                Book courts, attend training drills, meet fellow ShuttleLions, and compete in tournaments!
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
