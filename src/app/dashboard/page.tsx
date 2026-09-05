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
 Clock,
 MapPin,
} from 'lucide-react';
import { formatFullDateTimeRangeWAT, getNextEventOccurrence } from '@/lib/date-utils';

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

  // 2. Cached Schedule Events synchronized with the Schedule page
  const { data: events, isLoading: isEventsLoading } = useCachedQuery<EventItem[]>({
    key: 'schedule_events',
    initialFallback: [],
    fetcher: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });
      return data || [];
    },
  });

  // Cached RSVPs for attendee counts and user status
  const { data: rsvpData } = useCachedQuery<{ userRsvps: Record<string, boolean>; attendeeCounts: Record<string, number> }>({
    key: `schedule_rsvps_${user?.id || 'guest'}`,
    initialFallback: { userRsvps: {}, attendeeCounts: {} },
    fetcher: async () => {
      const { data: allRsvps } = await supabase
        .from('event_rsvps')
        .select('event_id, session_date, profile_id, status')
        .eq('status', 'going');

      const countMap: Record<string, number> = {};
      const userMap: Record<string, boolean> = {};

      if (allRsvps) {
        allRsvps.forEach((r) => {
          const key = `${r.event_id}_${r.session_date}`;
          countMap[key] = (countMap[key] || 0) + 1;
          if (user?.id && r.profile_id === user.id) {
            userMap[key] = true;
          }
        });
      }
      return { userRsvps: userMap, attendeeCounts: countMap };
    },
  });

  // Unified next upcoming activity calculation in sync with Schedule page
  const weeklyRoutines = events.filter((e) => e.is_recurring);
  const recurringOccurrences = weeklyRoutines
    .map((routine) => {
      const occ = getNextEventOccurrence(routine);
      return {
        ...routine,
        session_date: occ.sessionDate,
        start_at: occ.startAtIso,
        end_at: occ.endAtIso,
        is_next_routine: true,
      };
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const nextImmediateWeeklyRoutine = recurringOccurrences[0] || null;

  const customEvents = events
    .filter((e) => !e.is_recurring)
    .map((ev) => {
      const occ = getNextEventOccurrence(ev);
      return {
        ...ev,
        session_date: occ.sessionDate,
        start_at: occ.startAtIso,
        end_at: occ.endAtIso,
        is_next_routine: false,
        is_past: occ.isPast,
      };
    })
    .filter((ev) => !ev.is_past);

  const upcomingStreamlinedEvents = [
    ...(nextImmediateWeeklyRoutine ? [nextImmediateWeeklyRoutine] : []),
    ...customEvents,
  ].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const nextUpcomingGame = upcomingStreamlinedEvents[0] || null;
  const sessionDate = nextUpcomingGame?.session_date || (nextUpcomingGame ? getNextEventOccurrence(nextUpcomingGame).sessionDate : '');
  const rsvpKey = nextUpcomingGame ? `${nextUpcomingGame.id}_${sessionDate}` : '';
  const isGoing = Boolean(rsvpData.userRsvps[rsvpKey]);
  const attendeeCount = rsvpData.attendeeCounts[rsvpKey] || 0;

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
        {/* Next Training Session / Upcoming Game Card */}
        <TiltCard maxTilt={3} className="p-6 bg-sl-panel flex flex-col justify-between space-y-4 border border-sl-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-sl-green border border-sl-border">
                <Calendar className="w-5 h-5" />
              </div>
              {nextUpcomingGame ? (
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    nextUpcomingGame.event_type === 'competition'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : nextUpcomingGame.is_recurring
                      ? 'bg-sl-green/20 text-sl-green border border-sl-green/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {nextUpcomingGame.event_type === 'competition'
                    ? 'Tournament'
                    : nextUpcomingGame.is_recurring
                    ? 'Weekly Routine'
                    : 'Impromptu'}
                </span>
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-sl-green animate-pulse" />
                <h3 className="text-xs font-black text-sl-muted uppercase tracking-wider">
                  Next Scheduled Game
                </h3>
              </div>
              {nextUpcomingGame ? (
                <div className="space-y-2 mt-1">
                  <p className="text-sm font-black text-sl-foreground leading-snug line-clamp-1">
                    {nextUpcomingGame.title}
                  </p>
                  
                  <div className="space-y-1 text-xs text-sl-muted">
                    <p className="font-bold text-sl-green flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{formatFullDateTimeRangeWAT(nextUpcomingGame.start_at, nextUpcomingGame.end_at)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-sl-muted" />
                      <span className="truncate">{nextUpcomingGame.location || 'UNN Badminton Court'}</span>
                    </p>
                  </div>

                  <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-sl-muted">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sl-green" />
                      <span>{attendeeCount} Athlete{attendeeCount === 1 ? '' : 's'} Going</span>
                    </div>
                    {isGoing && (
                      <span className="text-[9px] font-black uppercase text-sl-green bg-sl-green/10 border border-sl-green/30 px-2 py-0.5 rounded-full">
                        RSVP Confirmed
                      </span>
                    )}
                  </div>
                </div>
              ) : isEventsLoading ? (
                <p className="text-xs text-sl-muted animate-pulse">Syncing schedule...</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-sl-foreground">Saturday Morning Open Court</p>
                  <p className="text-xs text-sl-muted">Saturday 07:00 AM – 12:00 PM WAT • UNN Badminton Court</p>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/schedule"
            onClick={() => audio.play('rally')}
            className="text-xs font-black text-sl-green hover:underline flex items-center gap-1.5 pt-2 border-t border-sl-border/40"
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
