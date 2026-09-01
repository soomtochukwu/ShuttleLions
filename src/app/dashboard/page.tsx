'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { PaymentCard } from '@/components/PaymentCard';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { supabase, type Payment, type EventItem, type Poll } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';
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

 const [payments, setPayments] = useState<Payment[]>([]);
 const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
 const [activePolls, setActivePolls] = useState<Poll[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 // Payment sim state
 const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
 const [checkoutAmountKobo, setCheckoutAmountKobo] = useState(0);
 const [checkoutType, setCheckoutType] = useState<'registration' | 'monthly'>('registration');

 const isProfileIncomplete =!user?.full_name ||!user?.faculty ||!user?.department;

 const fetchData = useCallback(async () => {
 if (!user?.id) return;
 setIsLoading(true);
 try {
 // 1. Payments
 const { data: payData } = await supabase
 .from('payments')
 .select('*')
 .eq('profile_id', user.id);
 setPayments(payData || []);

 // 2. Upcoming events
 const { data: eventData } = await supabase
 .from('events')
 .select('*')
 .order('start_at', { ascending: true })
 .limit(3);
 setUpcomingEvents(eventData || []);

 // 3. Active Polls
 const { data: pollData } = await supabase
 .from('polls')
 .select('*')
 .eq('status', 'active')
 .limit(1);
 setActivePolls(pollData || []);
 } catch (err) {
 console.error('Failed to fetch dashboard data:', err);
 } finally {
 setIsLoading(false);
 }
 }, [user?.id]);

 useEffect(() => {
 if (!isProfileIncomplete && user?.id) {
 fetchData();
 }
 }, [isProfileIncomplete, user?.id, fetchData]);

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
 title: 'Payment Confirmed! ',
 message: 'Your athlete dues have been recorded and your dashboard privileges updated.',
 type: 'success',
 });
 fetchData();
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

 {/* Live Community Chat */}
 <TiltCard className="p-6 bg-sl-panel flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-sl-green border border-sl-border">
 <MessageSquare className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-black text-sl-foreground uppercase">
 Community Chat
 </h3>
 <p className="text-xs text-sl-muted leading-relaxed">
 Connect with fellow athletes across departments. Strategy, match banter & gear advice.
 </p>
 </div>
 <Link
 href="/dashboard/community/chat"
 onClick={() => audio.play('rally')}
 className="text-xs font-black text-sl-green hover:underline flex items-center gap-1"
 >
 <span>Open Chat Channels</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </TiltCard>

 {/* Active Poll */}
 <TiltCard className="p-6 bg-sl-panel flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="p-2.5 rounded-xl bg-sl-bg w-fit text-amber-500 border border-sl-border">
 <Vote className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-black text-sl-foreground uppercase">
 Community Voting
 </h3>
 {activePolls.length > 0 ? (
 <p className="text-xs text-sl-foreground font-semibold line-clamp-2">
 {activePolls[0].title}
 </p>
 ) : (
 <p className="text-xs text-sl-muted">Vote on tournament rules and varsity match schedules.</p>
 )}
 </div>
 <Link
 href="/dashboard/community/votes"
 onClick={() => audio.play('rally')}
 className="text-xs font-black text-sl-green hover:underline flex items-center gap-1"
 >
 <span>Cast Your Vote</span>
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
