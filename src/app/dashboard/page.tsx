'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { PaymentCard } from '@/components/PaymentCard';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { supabase, type Payment, type EventItem, type Poll } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';
import { useCachedQuery } from '@/lib/client-cache';
import Link from 'next/link';
import {
 Calendar,
 Users,
 MessageSquare,
 Vote,
 ShoppingBag,
 Sparkles,
 ArrowRight,
 ShieldCheck,
 Zap,
} from 'lucide-react';

export default function DashboardOverviewPage() {
 const { user, refreshProfile } = useAuth();
 const { showAlert } = useFeedback();

 // 1. Cached Payments with instant hydration (shared across Overview & Community)
 const {
  data: payments,
  setData: setPayments,
  refetch: refetchPayments,
 } = useCachedQuery<Payment[]>({
  key: `user_payments_${user?.id || 'guest'}`,
  initialFallback: [],
  enabled: Boolean(user?.id),
  fetcher: async () => {
   if (!user?.id) return [];
   const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('profile_id', user.id);
   return data || [];
  },
 });

 // 2. Cached Upcoming Events
 const { data: upcomingEvents } = useCachedQuery<EventItem[]>({
  key: 'dashboard_upcoming_events',
  initialFallback: [],
  fetcher: async () => {
   const { data } = await supabase
    .from('events')
    .select('*')
    .order('start_at', { ascending: true })
    .limit(3);
   return data || [];
  },
 });

 // 3. Cached Active Polls
 const { data: activePolls } = useCachedQuery<Poll[]>({
  key: 'dashboard_active_polls',
  initialFallback: [],
  fetcher: async () => {
   const { data } = await supabase
    .from('polls')
    .select('*')
    .eq('status', 'active')
    .limit(1);
   return data || [];
  },
 });

 // Payment sim state
 const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
 const [checkoutAmountKobo, setCheckoutAmountKobo] = useState(0);
 const [checkoutType, setCheckoutType] = useState<'registration' | 'monthly'>('registration');

 const isProfileIncomplete =!user?.full_name ||!user?.faculty ||!user?.department;

 const isRegPaid = payments.some((p) => p.type === 'registration' && p.status === 'success');
 const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
 const isMonthPaid = payments.some(
 (p) => p.type === 'monthly' && p.status === 'success' && (p.metadata as any)?.period === currentMonthKey
 );

 const monthlyPaymentsMap: Record<string, boolean> = {};
 payments
 .filter((p) => p.type === 'monthly' && p.status === 'success')
 .forEach((p) => {
 const period = (p.metadata as any)?.period;
 if (period) monthlyPaymentsMap[period] = true;
 });

 const handlePay = (type: 'registration' | 'monthly') => {
 setCheckoutType(type);
 setCheckoutAmountKobo(type === 'registration' ? 500000 : 100000);
 setIsCheckoutOpen(true);
 };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user?.id) return;
    try {
      const newPayment: Payment = {
        id: 'pay_' + Date.now(),
        profile_id: user.id,
        type: checkoutType,
        amount_kobo: checkoutAmountKobo,
        status: 'success',
        reference,
        provider: 'simulated',
        metadata: checkoutType === 'monthly' ? { period: currentMonthKey } : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistic instant cache update across all pages
      setPayments((prev) => [newPayment, ...(prev || [])]);

      await supabase.from('payments').insert({
        profile_id: user.id,
        type: checkoutType,
        amount_kobo: checkoutAmountKobo,
        status: 'success',
        reference,
        provider: 'simulated',
        metadata: checkoutType === 'monthly' ? { period: currentMonthKey } : null,
      });

      showAlert({
        title: 'Payment Confirmed!',
        message: 'Your athlete dues have been recorded and your dashboard privileges updated.',
        type: 'success',
      });
      refetchPayments();
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: 'Payment Notice',
        message: 'Could not record payment transaction.',
        type: 'error',
      });
    }
  };

 if (isProfileIncomplete) {
 return (
 <div className="flex items-center justify-center py-12">
 <OnboardingWizard onComplete={refreshProfile} />
 </div>
 );
 }

 return (
 <div className="space-y-8">
 {/* Welcome Banner */}
 <div className="shuttle-panel p-6 sm:p-8 bg-gradient-to-r from-sl-panel via-sl-green/10 to-sl-panel border border-sl-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 px-3 py-1 rounded-full flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-sl-green-glow" /> Lion Portal
 </span>
 {isRegPaid && isMonthPaid && (
 <span className="text-xs font-black uppercase text-white bg-sl-green px-3 py-1 rounded-full flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5" /> Full Access Member
 </span>
 )}
 </div>
 <h1 className="text-2xl sm:text-4xl font-black text-sl-foreground uppercase">
 Welcome back, <span className="text-sl-green">{user?.full_name?.split(' ')[0]}</span>! 
 </h1>
 <p className="text-xs sm:text-sm text-sl-muted font-medium">
 Your UNN Badminton dashboard: track court training, community votes & dues records.
 </p>
 </div>

 <Link href="/dashboard/profile">
 <ShuttleButton variant="green" className="py-2.5 px-5 text-xs font-black shrink-0">
 View Digital Member ID 
 </ShuttleButton>
 </Link>
 </div>

 {/* Dues & Payment Status Cards */}
 <div className="space-y-4">
 <h2 className="text-sm font-black text-sl-muted uppercase tracking-wider flex items-center gap-2">
 <Zap className="w-4 h-4 text-sl-green" /> Membership & Dues Ledger
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <PaymentCard
 type="registration"
 status={isRegPaid ? 'paid' : 'unpaid'}
 amountKobo={500000}
 onPay={() => handlePay('registration')}
 />
 <PaymentCard
 type="monthly"
 status={isMonthPaid ? 'paid' : 'unpaid'}
 amountKobo={100000}
 onPay={() => handlePay('monthly')}
 monthlyPayments={monthlyPaymentsMap}
 />
 </div>
 </div>

 {/* 3-Column Community Quick Access Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Next Training Session */}
 <TiltCard className="p-6 bg-sl-panel flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-sl-green border border-sl-border">
 <Calendar className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-black text-sl-foreground uppercase">
 Upcoming Training
 </h3>
 {upcomingEvents.length > 0 ? (
 <div className="space-y-1">
 <p className="text-xs font-bold text-sl-green">{upcomingEvents[0].title}</p>
 <p className="text-[11px] text-sl-muted">{upcomingEvents[0].location}</p>
 </div>
 ) : (
 <p className="text-xs text-sl-muted">Saturday 07:00 AM • UNN Badminton Court</p>
 )}
 </div>
 <Link
 href="/dashboard/schedule"
 onClick={() => audio.play('rally')}
 className="text-xs font-black text-sl-green hover:underline flex items-center gap-1"
 >
 <span>Full Schedule & RSVPs</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </TiltCard>

        {/* Community Chat - Coming Soon */}
        <TiltCard className="p-6 bg-sl-panel/60 border border-sl-border/60 opacity-60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-sl-muted border border-sl-border">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                Coming Soon
              </span>
            </div>
            <h3 className="text-sm font-black text-sl-foreground/80 uppercase">
              Community Chat
            </h3>
            <p className="text-xs text-sl-muted leading-relaxed">
              Inter-faculty chat rooms, match strategy channels, and direct coaching communications are currently in development.
            </p>
          </div>
          <Link
            href="/dashboard/community/chat"
            onClick={() => audio.play('rally')}
            className="text-xs font-bold text-sl-muted hover:text-sl-foreground flex items-center gap-1"
          >
            <span>Preview Feature</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </TiltCard>

        {/* Community Voting - Coming Soon */}
        <TiltCard className="p-6 bg-sl-panel/60 border border-sl-border/60 opacity-60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-sl-muted border border-sl-border">
                <Vote className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                Coming Soon
              </span>
            </div>
            <h3 className="text-sm font-black text-sl-foreground/80 uppercase">
              Community Voting
            </h3>
            <p className="text-xs text-sl-muted leading-relaxed">
              Democratic athlete voting on tournament rules, varsity match schedules, and equipment surveys.
            </p>
          </div>
          <Link
            href="/dashboard/community/votes"
            onClick={() => audio.play('rally')}
            className="text-xs font-bold text-sl-muted hover:text-sl-foreground flex items-center gap-1"
          >
            <span>Preview Feature</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </TiltCard>
      </div>

 {/* Checkout Sim Modal */}
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
