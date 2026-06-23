'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navbar } from '@/components/Navbar';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { PaymentCard } from '@/components/PaymentCard';
import { RacketTracker } from '@/components/RacketTracker';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { supabase, type Payment, type RacketOrder } from '@/lib/supabase';
import { formatKobo } from '@/lib/constants';
import { audio } from '@/lib/audio';

const RACKET_MODELS = [
  { name: 'Yonex Muscle Power 29', priceKobo: 1500000 },
  { name: 'Yonex Voltric Lite', priceKobo: 2500000 },
  { name: 'Li-Ning G-Tek 98', priceKobo: 1200000 },
  { name: 'Victor Thruster K', priceKobo: 3200000 },
];

export default function DashboardPage() {
  const { user, refreshProfile, logout } = useAuth();
  
  // App state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [racketOrders, setRacketOrders] = useState<RacketOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modal / Payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmountKobo, setCheckoutAmountKobo] = useState(0);
  const [checkoutType, setCheckoutType] = useState<'registration' | 'monthly' | 'racket'>('registration');
  
  // Racket Order Form states
  const [isRacketModalOpen, setIsRacketModalOpen] = useState(false);
  const [selectedRacketIndex, setSelectedRacketIndex] = useState(0);
  const [racketQuantity, setRacketQuantity] = useState(1);

  // Onboarding gate state
  const isProfileIncomplete = !user?.full_name || !user?.faculty || !user?.department;

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingData(true);
    try {
      // 1. Fetch payments
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', user.id);
      
      if (payError) throw payError;
      setPayments(payData || []);

      // 2. Fetch racket orders
      const { data: racketData, error: racketError } = await supabase
        .from('racket_orders')
        .select('*')
        .eq('profile_id', user.id);

      if (racketError) throw racketError;
      setRacketOrders(racketData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isProfileIncomplete && user?.id) {
      fetchData();
    }
  }, [isProfileIncomplete, user?.id, fetchData]);

  // Derived statuses
  const isRegPaid = payments.some(p => p.type === 'registration' && p.status === 'success');
  
  // Mapping of paid months
  const monthlyPaymentsMap: Record<string, boolean> = {};
  payments
    .filter(p => p.type === 'monthly' && p.status === 'success')
    .forEach(p => {
      // Assuming metadata contains period key e.g. { period: '2026-06' }
      const period = (p.metadata as any)?.period;
      if (period) {
        monthlyPaymentsMap[period] = true;
      }
    });

  // Pay CTAs
  const handlePayRegistration = () => {
    setCheckoutType('registration');
    setCheckoutAmountKobo(500000); // ₦5,000
    setIsCheckoutOpen(true);
  };

  const handlePayMonthly = () => {
    setCheckoutType('monthly');
    setCheckoutAmountKobo(100000); // ₦1,000
    setIsCheckoutOpen(true);
  };

  const handleOrderRacketCta = () => {
    audio.play('smash');
    setIsRacketModalOpen(true);
  };

  // Submit new racket order from modal
  const handlePlaceRacketOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.play('serve');
    
    const racket = RACKET_MODELS[selectedRacketIndex];
    const totalCost = racket.priceKobo * racketQuantity;

    setCheckoutType('racket');
    setCheckoutAmountKobo(totalCost);
    setIsRacketModalOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handle successful simulated payment
  const handlePaymentSuccess = async (reference: string) => {
    if (!user?.id) return;
    
    try {
      const currentYear = new Date().getFullYear();
      const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
      const currentMonthKey = `${currentYear}-${currentMonthNum}`;

      // 1. Insert payment record
      const { data: newPayment, error: payError } = await supabase
        .from('payments')
        .insert({
          profile_id: user.id,
          type: checkoutType,
          amount_kobo: checkoutAmountKobo,
          status: 'success',
          reference,
          provider: 'paystack',
          metadata: checkoutType === 'monthly' ? { period: currentMonthKey } : null,
        })
        .select()
        .single();

      if (payError) throw payError;

      // 2. If racket purchase, insert racket order too
      if (checkoutType === 'racket') {
        const racket = RACKET_MODELS[selectedRacketIndex];
        const { error: racketError } = await supabase
          .from('racket_orders')
          .insert({
            profile_id: user.id,
            racket_model: racket.name,
            quantity: racketQuantity,
            unit_price_kobo: racket.priceKobo,
            total_price_kobo: checkoutAmountKobo,
            status: 'confirmed', // payment verified
            payment_id: newPayment.id,
          });

        if (racketError) throw racketError;
      }

      // Success alerts and reload
      audio.play('whistle');
      alert('Payment processed successfully! Your dashboard is updating.');
      fetchData();
    } catch (err: any) {
      audio.play('courtSqueak');
      alert(`Database write failed: ${err.message}`);
    }
  };

  // If onboarding is incomplete, render onboarding form
  if (isProfileIncomplete) {
    return (
      <div className="min-h-screen bg-sl-bg flex flex-col justify-between py-6">
        <div className="flex-grow flex items-center justify-center p-4">
          <OnboardingWizard onComplete={refreshProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-sl-bg">
      {/* Navbar with dummy action (user is already authenticated) */}
      <Navbar onOpenAuth={() => {}} />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 z-10 space-y-8 pb-20">
        
        {/* Profile Card Header */}
        <section className="shuttle-panel p-6 bg-sl-panel flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full border-3 border-sl-border bg-sl-green text-white flex items-center justify-center font-bold text-3xl select-none shadow-[2px_2px_0_var(--sl-shadow)]">
              {user?.full_name?.charAt(0).toUpperCase() || 'L'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-sl-foreground flex items-center gap-2 justify-center sm:justify-start">
                {user?.full_name}
                {(user?.role === 'admin' || user?.role === 'captain') && (
                  <span className="text-[10px] font-bold bg-sl-warning border border-sl-border px-2 py-0.5 rounded shadow-[1px_1px_0_var(--sl-shadow)] text-sl-foreground">
                    ADMIN
                  </span>
                )}
              </h1>
              <p className="text-xs text-sl-muted font-bold">
                🦁 {user?.department} • {user?.faculty} • {user?.level} Level
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {user?.role === 'admin' && (
              <ShuttleButton
                variant="white"
                className="py-2 px-4 text-xs font-bold border-2 border-sl-border"
                onClick={() => {
                  audio.play('serve');
                  window.location.href = '/dashboard/admin';
                }}
              >
                🛡️ Go To Admin Panel
              </ShuttleButton>
            )}
          </div>
        </section>

        {isLoadingData ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl animate-bounce">🏸</div>
            <p className="text-sm font-bold text-sl-muted">Loading your membership data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Fees */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Fee */}
                <PaymentCard
                  type="registration"
                  status={isRegPaid ? 'paid' : 'unpaid'}
                  amountKobo={500000}
                  onPay={handlePayRegistration}
                />

                {/* Monthly Dues */}
                <PaymentCard
                  type="monthly"
                  status="unpaid"
                  amountKobo={100000}
                  onPay={handlePayMonthly}
                  monthlyPayments={monthlyPaymentsMap}
                />
              </div>

              {/* Racket Order Tracker */}
              <RacketTracker
                orders={racketOrders}
                onOrderRacket={handleOrderRacketCta}
              />
            </div>

            {/* Right Column: Information panel */}
            <div className="space-y-8">
              <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
                <h3 className="text-lg font-extrabold uppercase text-sl-green flex items-center gap-1.5" style={{ fontFamily: 'Bangers, cursive' }}>
                  📢 Club Guidelines
                </h3>
                <div className="text-xs text-sl-foreground space-y-3 font-semibold">
                  <div className="p-3 bg-sl-bg rounded border-2 border-sl-border/10">
                    💡 <strong>Court Bookings:</strong> Make sure your monthly dues are paid to reserve courts in the UNN Sports Hall.
                  </div>
                  <div className="p-3 bg-sl-bg rounded border-2 border-sl-border/10">
                    💡 <strong>ID Badge:</strong> Collect your physical ShuttleLions sticker pack from the Captain after showing your verified registration fee screen.
                  </div>
                  <div className="p-3 bg-sl-bg rounded border-2 border-sl-border/10">
                    💡 <strong>Support:</strong> For equipment delivery, reach out to the captain at the indoor hall during open training hours.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Racket Ordering Modal */}
      <ShuttleModal
        isOpen={isRacketModalOpen}
        onClose={() => setIsRacketModalOpen(false)}
        title="Order Professional Racket"
      >
        <form onSubmit={handlePlaceRacketOrder} className="space-y-4">
          <ShuttleSelect
            label="Racket Model"
            value={selectedRacketIndex}
            onChange={(e) => setSelectedRacketIndex(Number(e.target.value))}
            options={RACKET_MODELS.map((rac, i) => ({
              value: String(i),
              label: `${rac.name} (${formatKobo(rac.priceKobo)})`,
            }))}
          />

          <ShuttleInput
            label="Quantity"
            type="number"
            min={1}
            max={5}
            value={racketQuantity}
            onChange={(e) => setRacketQuantity(Math.max(1, Number(e.target.value)))}
          />

          <div className="p-3 bg-sl-bg rounded border border-sl-border text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>Racket Cost:</span>
              <span>{formatKobo(RACKET_MODELS[selectedRacketIndex].priceKobo)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Quantity:</span>
              <span>x{racketQuantity}</span>
            </div>
            <div className="border-t border-sl-border/10 my-2" />
            <div className="flex justify-between font-black text-sm text-sl-green">
              <span>Total Price:</span>
              <span>{formatKobo(RACKET_MODELS[selectedRacketIndex].priceKobo * racketQuantity)}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <ShuttleButton
              type="button"
              variant="white"
              onClick={() => setIsRacketModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </ShuttleButton>
            <ShuttleButton type="submit" variant="green" className="flex-1">
              Proceed to Pay
            </ShuttleButton>
          </div>
        </form>
      </ShuttleModal>

      {/* Checkout Sim Modal */}
      <PaymentWidgetPlaceholder
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        amountKobo={checkoutAmountKobo}
        paymentType={checkoutType}
        racketModel={checkoutType === 'racket' ? RACKET_MODELS[selectedRacketIndex].name : undefined}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
