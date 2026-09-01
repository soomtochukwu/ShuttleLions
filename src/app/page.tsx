'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { MainNav } from '@/components/navigation/MainNav';
import { Interactive3DBackground } from '@/components/Interactive3DBackground';
import { ScrollytellingCourtStage } from '@/components/landing/ScrollytellingCourtStage';
import { KineticMarquee } from '@/components/ui/KineticText';
import { StatsRally } from '@/components/landing/StatsRally';
import { ActivitiesHighlight } from '@/components/landing/ActivitiesHighlight';
import { MembershipCards } from '@/components/landing/MembershipCards';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmountKobo, setCheckoutAmountKobo] = useState(0);
  const [checkoutType, setCheckoutType] = useState<'registration' | 'monthly' | 'racket'>('registration');

  const handleSelectTier = (type: 'registration' | 'monthly' | 'racket') => {
    if (!isAuthenticated) {
      audio.play('smash');
      setIsAuthOpen(true);
      return;
    }

    if (type === 'racket') {
      audio.play('serve');
      router.push('/dashboard/shop');
      return;
    }

    setCheckoutType(type);
    setCheckoutAmountKobo(type === 'registration' ? 500000 : 100000);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user?.id) return;
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const periodKey = `${currentYear}-${currentMonth}`;

      await supabase.from('payments').insert({
        profile_id: user.id,
        type: checkoutType,
        amount_kobo: checkoutAmountKobo,
        status: 'success',
        reference,
        provider: 'simulated',
        metadata: checkoutType === 'monthly' ? { period: periodKey } : null,
      });

      audio.play('whistle');
      alert('Membership dues recorded and verified! Directing to your active dashboard.');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-sl-bg overflow-x-hidden text-sl-foreground flex flex-col justify-between">
      {/* 3D WebGL Background Ambient Mesh */}
      <Interactive3DBackground />

      {/* Professional Sticky Navigation */}
      <MainNav onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Experience Flow */}
      <main className="relative z-10 flex flex-col">
        {/* Continuous Sticky 3D Court Scrollytelling Stage (Entrance -> Serve -> Flight Arc -> Receive) */}
        <ScrollytellingCourtStage onOpenAuth={() => setIsAuthOpen(true)} />

        {/* Kinetic Marquee Velocity Divider */}
        <div className="py-12 bg-black/40 border-y border-sl-border/40 backdrop-blur">
          <KineticMarquee
            items={['SPEED', 'POWER', 'SMASH', 'AGILITY', 'UNN LIONS', 'PRECISION', 'CHAMPIONSHIP']}
            direction="left"
          />
        </div>

        {/* Section 2: The Rally & Key Highlights */}
        <div className="py-16">
          <StatsRally />
        </div>

        {/* Kinetic Marquee Reverse Track */}
        <div className="py-12 bg-black/40 border-y border-sl-border/40 backdrop-blur">
          <KineticMarquee
            items={['COLLEGIATE EXCELLENCE', 'BADMINTON DRILLS', 'VARSITY ATHLETES', 'TACTICAL DOUBLES']}
            direction="right"
          />
        </div>

        {/* Section 3: Activities & Weekly Training Schedules */}
        <div className="py-16">
          <ActivitiesHighlight />
        </div>

        {/* Section 4: Transparent Membership Dues & Racket Pricing */}
        <div className="py-16">
          <MembershipCards onSelectTier={handleSelectTier} />
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 mt-20">
        <Footer />
      </div>

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Payment Sim Modal */}
      <PaymentWidgetPlaceholder
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        amountKobo={checkoutAmountKobo}
        paymentType={checkoutType}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
