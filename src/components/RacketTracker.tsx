'use client';

import { type RacketOrder } from '@/lib/supabase';
import { RACKET_STATUS_LABELS, formatKobo } from '@/lib/constants';
import { StepProgress } from '@/components/ui/StepProgress';

interface RacketTrackerProps {
 orders: RacketOrder[];
 onOrderRacket?: () => void;
}

const ORDER_STEPS = [
 'Payment Confirmed',
 'Yet to be Purchased',
 'Purchased',
 'Delivering',
 'Delivered',
];

// Helper to map DB status to step index in ORDER_STEPS
function getStepIndex(status: RacketOrder['status']): number {
 switch (status) {
 case 'pending':
 return 0; // Payment not confirmed yet
 case 'confirmed':
 return 0; // Payment confirmed, proceeding to purchase
 case 'ordered':
 return 2; // Purchased
 case 'shipped':
 return 3; // Delivering
 case 'delivered':
 return 4; // Delivered
 case 'cancelled':
 return -1;
 default:
 return 0;
 }
}

export function RacketTracker({ orders, onOrderRacket }: RacketTrackerProps) {
 return (
 <div className="shuttle-panel p-6 bg-sl-panel">
 <div className="flex justify-between items-center mb-6">
 <h3
 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-stroke text-sl-foreground"
 style={{ fontFamily: 'Bangers, cursive' }}
 >
 Racket Orders & Status
 </h3>
 {onOrderRacket && (
 <button
 onClick={onOrderRacket}
 className="shuttle-btn shuttle-btn-green py-2 px-4 text-xs font-bold border-2 border-sl-border"
 >
 Order New Racket
 </button>
 )}
 </div>

 {orders.length === 0 ? (
 <div className="text-center py-8 border-2 border-dashed border-sl-border/30 rounded-lg">
 <span className="text-4xl mb-2 block"></span>
 <p className="text-xs text-sl-muted font-bold">No racket orders placed yet.</p>
 <p className="text-[10px] text-sl-muted mt-1">Need a professional racket? Request one above!</p>
 </div>
 ) : (
 <div className="space-y-6">
 {orders.map((order) => {
 const stepIndex = getStepIndex(order.status);
 const isCancelled = order.status === 'cancelled';

 return (
 <div
 key={order.id}
 className="border-2 border-sl-border p-4 rounded-lg bg-sl-bg/25 relative overflow-hidden"
 >
 {/* Header info */}
 <div className="flex flex-wrap justify-between items-start gap-2 mb-4 border-b-2 border-sl-border/10 pb-2">
 <div>
 <h4 className="font-extrabold text-sm text-sl-foreground uppercase">
 {order.racket_model}
 </h4>
 <p className="text-[10px] font-mono text-sl-muted">
 Order ID: {order.id.slice(0, 8)} • Qty: {order.quantity}
 </p>
 </div>
 <div className="text-right">
 <p className="font-bold text-sm text-sl-green">
 {formatKobo(order.total_price_kobo)}
 </p>
 <p className="text-[9px] text-sl-muted font-bold">
 Ordered: {new Date(order.created_at).toLocaleDateString()}
 </p>
 </div>
 </div>

 {/* Notes from Admin */}
 {order.notes && (
 <div className="mb-4 p-2 bg-sl-warning/10 border border-sl-warning/30 rounded text-[11px] text-sl-muted italic">
 <strong className="text-sl-foreground not-italic font-bold">Admin Note:</strong> {order.notes}
 </div>
 )}

 {/* Progress bar / Cancelled State */}
 {isCancelled ? (
 <div className="py-2 text-center text-xs font-bold text-sl-error bg-sl-error/10 border border-dashed border-sl-error rounded">
 This order has been cancelled.
 </div>
 ) : (
 <div className="py-2">
 <StepProgress
 steps={ORDER_STEPS}
 currentStep={stepIndex}
 />
 {order.status === 'pending' && (
 <p className="text-[10px] text-sl-warning font-bold text-center mt-3 animate-pulse">
 Awaiting admin payment confirmation...
 </p>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
