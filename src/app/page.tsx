'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { MainNav } from '@/components/navigation/MainNav';
import { Interactive3DBackground } from '@/components/Interactive3DBackground';
import { CourtEntrance } from '@/components/landing/CourtEntrance';
import { ServeSequence } from '@/components/landing/ServeSequence';
import { StatsRally } from '@/components/landing/StatsRally';
import { ActivitiesHighlight } from '@/components/landing/ActivitiesHighlight';
import { MembershipCards } from '@/components/landing/MembershipCards';
import { ReceiveSequence } from '@/components/landing/ReceiveSequence';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

function AuthParamListener({ onOpenAuth }: { onOpenAuth: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authRequired = searchParams.get('auth');
    if (authRequired === 'required' || authRequired === 'true') {
      onOpenAuth();
    }
  }, [searchParams, onOpenAuth]);

  return null;
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { showAlert } = useFeedback();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmountKobo, setCheckoutAmountKobo] = useState(0);
  const [checkoutType, setCheckoutType] = useState<'registration' | 'monthly' | 'racket'>('registration');

  const handleHeroCta = () => {
    if (isAuthenticated) {
      audio.play('serve');
      router.push('/dashboard');
    } else {
      audio.play('smash');
      setIsAuthOpen(true);
    }
  };

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
      showAlert({
        title: 'Membership Verified! 🏸',
        message: 'Your athlete dues have been recorded. Directing to your athlete dashboard.',
        type: 'success',
        onConfirm: () => router.push('/dashboard'),
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      showAlert({
        title: 'Payment Notice',
        message: 'Could not record payment transaction.',
        type: 'error',
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-sl-bg overflow-x-hidden text-sl-foreground flex flex-col justify-between">
      {/* Auth Query Param Listener */}
      <Suspense fallback={null}>
        <AuthParamListener onOpenAuth={() => setIsAuthOpen(true)} />
      </Suspense>

      {/* 3D WebGL Background Scene */}
      <Interactive3DBackground />

      {/* Professional Sticky Navigation */}
      <MainNav onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Scrollytelling Sections Flow */}
      <main className="relative z-10 flex flex-col space-y-24 sm:space-y-32">
        {/* Section 1: Court Entrance & Zoom */}
        <CourtEntrance onCtaClick={handleHeroCta} />

        {/* Section 2: The Serve (Athlete Cutout & Drill Biomechanics) */}
        <ServeSequence />

        {/* Section 3: The Rally & Key Highlights */}
        <StatsRally />

        {/* Section 4: Activities & Weekly Training Schedules */}
        <ActivitiesHighlight />

        {/* Section 5: Transparent Membership Dues & Racket Pricing */}
        <MembershipCards onSelectTier={handleSelectTier} />

        {/* Section 6: The Receive (Athlete Cutout & Registration Dock) */}
        <ReceiveSequence onOpenAuth={() => setIsAuthOpen(true)} />
      </main>

      {/* Footer */}
      <div className="relative z-10 mt-32">
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
