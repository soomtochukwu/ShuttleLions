'use client';

import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { formatKobo } from '@/lib/constants';
import { audio } from '@/lib/audio';
import { Check, Calendar as CalendarIcon } from 'lucide-react';

interface PaymentCardProps {
  type: 'registration' | 'monthly';
  amountKobo: number;
  status: 'paid' | 'pending' | 'unpaid';
  onPay: () => void;
  monthlyPayments?: Record<string, boolean>; // e.g. { '2026-01': true, '2026-02': true }
}

const MONTHS = [
  { id: '01', name: 'Jan' },
  { id: '02', name: 'Feb' },
  { id: '03', name: 'Mar' },
  { id: '04', name: 'Apr' },
  { id: '05', name: 'May' },
  { id: '06', name: 'Jun' },
  { id: '07', name: 'Jul' },
  { id: '08', name: 'Aug' },
  { id: '09', name: 'Sep' },
  { id: '10', name: 'Oct' },
  { id: '11', name: 'Nov' },
  { id: '12', name: 'Dec' },
];

export function PaymentCard({
  type,
  amountKobo,
  status,
  onPay,
  monthlyPayments = {},
}: PaymentCardProps) {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYear}-${currentMonthNum}`;

  const isCurrentMonthPaid = monthlyPayments[currentMonthKey] === true;

  const handlePayClick = () => {
    audio.play('smash');
    onPay();
  };

  return (
    <div className="shuttle-panel p-6 flex flex-col justify-between h-full bg-sl-panel">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3
            className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-stroke text-sl-foreground"
            style={{ fontFamily: 'Bangers, cursive' }}
          >
            {type === 'registration' ? 'Registration Fee' : 'Monthly Club Dues'}
          </h3>
          <span
            className={`text-xs font-bold uppercase border-2 border-sl-border px-2 py-0.5 rounded shadow-[1px_1px_0_var(--sl-shadow)] ${
              status === 'paid' || (type === 'monthly' && isCurrentMonthPaid)
                ? 'bg-sl-green text-white'
                : 'bg-sl-warning text-sl-foreground'
            }`}
          >
            {type === 'registration'
              ? status === 'paid'
                ? 'Paid'
                : 'Unpaid'
              : isCurrentMonthPaid
              ? 'Current Month Paid'
              : 'Current Month Unpaid'}
          </span>
        </div>

        <p className="text-3xl font-black text-sl-green mb-3" style={{ textShadow: '1px 1px 0 var(--sl-border)' }}>
          {formatKobo(amountKobo)}
          {type === 'monthly' && <span className="text-xs text-sl-muted font-bold lowercase"> / month</span>}
        </p>

        <p className="text-xs text-sl-muted font-semibold mb-6">
          {type === 'registration'
            ? 'A one-time mandatory fee for all new members to register on the platform and join the club.'
            : 'Recurring monthly membership dues to support badminton court maintenance, equipment, and coach salaries.'}
        </p>

        {/* Visual Calendar Grid for Monthly Dues */}
        {type === 'monthly' && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-sl-foreground mb-3 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-sl-green" />
              <span>Membership Calendar ({currentYear})</span>
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {MONTHS.map((m) => {
                const monthKey = `${currentYear}-${m.id}`;
                const isPaid = monthlyPayments[monthKey] === true;
                const isCurrent = monthKey === currentMonthKey;
                const isFuture = monthKey > currentMonthKey;

                let borderStyle = 'border-2 border-sl-border';
                let bgStyle = 'bg-sl-panel text-sl-foreground';

                if (isPaid) {
                  bgStyle = 'bg-sl-green text-white';
                } else if (isCurrent) {
                  borderStyle = 'border-3 border-sl-green ring-2 ring-sl-green-glow/30';
                  bgStyle = 'bg-sl-warning/20 text-sl-foreground animate-pulse';
                } else if (isFuture) {
                  bgStyle = 'bg-sl-muted/10 text-sl-muted/60 border-sl-border/40';
                }

                return (
                  <div
                    key={m.id}
                    className={`relative p-1.5 sm:p-2 rounded flex flex-col items-center justify-between text-center ${borderStyle} ${bgStyle} select-none`}
                    title={`${m.name} ${currentYear}: ${isPaid ? 'Paid' : isCurrent ? 'Current month due' : isFuture ? 'Upcoming' : 'Unpaid'}`}
                  >
                    <span className="text-[11px] sm:text-xs font-bold uppercase">{m.name}</span>
                    <span className="text-[9px] font-bold block mt-1">
                      {isPaid ? (
                        <Check className="w-3 h-3 text-white inline-block" />
                      ) : isCurrent ? (
                        'DUE'
                      ) : isFuture ? (
                        '--'
                      ) : (
                        'UNPAID'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {type === 'registration' ? (
          status === 'paid' ? (
            <div className="w-full text-center text-xs font-bold text-sl-green bg-sl-green/10 border-2 border-dashed border-sl-green p-3 rounded-lg">
              Lifetime registration completed!
            </div>
          ) : (
            <ShuttleButton variant="green" onClick={handlePayClick} fullWidth>
              Pay Registration Fee
            </ShuttleButton>
          )
        ) : isCurrentMonthPaid ? (
          <div className="w-full text-center text-xs font-bold text-sl-green bg-sl-green/10 border-2 border-dashed border-sl-green p-3 rounded-lg">
            You are up-to-date for this month!
          </div>
        ) : (
          <ShuttleButton variant="green" onClick={handlePayClick} fullWidth>
            Pay {MONTHS.find((m) => `${currentYear}-${m.id}` === currentMonthKey)?.name} Dues
          </ShuttleButton>
        )}
      </div>
    </div>
  );
}
