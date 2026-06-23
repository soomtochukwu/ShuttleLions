'use client';

import { useState } from 'react';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { formatKobo } from '@/lib/constants';
import { audio } from '@/lib/audio';

interface PaymentWidgetPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
  amountKobo: number;
  paymentType: 'registration' | 'monthly' | 'racket';
  racketModel?: string;
  onSuccess: (reference: string) => void;
}

export function PaymentWidgetPlaceholder({
  isOpen,
  onClose,
  amountKobo,
  paymentType,
  racketModel,
  onSuccess,
}: PaymentWidgetPlaceholderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    audio.play('serve');

    setTimeout(() => {
      setIsProcessing(false);
      audio.play('whistle');
      // Generate a random reference
      const ref = `SL-PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      onSuccess(ref);
      onClose();
    }, 1500);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    audio.play('serve');

    setTimeout(() => {
      setIsProcessing(false);
      audio.play('courtSqueak');
      alert('Simulated transaction failed. Please try again.');
    }, 1500);
  };

  return (
    <ShuttleModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        paymentType === 'registration'
          ? 'Pay Registration Fee'
          : paymentType === 'monthly'
          ? 'Pay Monthly Dues'
          : 'Pay for Racket Order'
      }
    >
      <div className="space-y-6 text-center">
        <div className="p-4 bg-sl-bg border-3 border-dashed border-sl-border rounded-lg select-none">
          <p className="text-xs text-sl-muted font-bold mb-2">
            💳 PAYMENT GATEWAY INTEGRATION PLACEHOLDER
          </p>
          <p className="text-[10px] text-sl-muted italic leading-relaxed">
            In production, this area will render the Paystack or Flutterwave inline checkout widget.
          </p>
          <div className="border-t border-sl-border/10 my-3" />
          <div className="text-left space-y-1 text-xs">
            <div>
              <span className="font-bold text-sl-muted">Fee Type:</span>{' '}
              <span className="font-bold text-sl-foreground capitalize">{paymentType}</span>
            </div>
            {racketModel && (
              <div>
                <span className="font-bold text-sl-muted">Model:</span>{' '}
                <span className="font-bold text-sl-foreground">{racketModel}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-sl-muted">Amount Due:</span>{' '}
              <span className="font-bold text-sl-green">{formatKobo(amountKobo)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-sl-muted font-semibold leading-relaxed">
          Simulate a transaction response to test the dashboard status updates and database writes.
        </p>

        <div className="flex gap-4 pt-2">
          <ShuttleButton
            variant="white"
            onClick={handleSimulateFailure}
            className="flex-1 text-sl-error border-sl-error hover:bg-sl-error/5"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Fail Pay'}
          </ShuttleButton>
          <ShuttleButton
            variant="green"
            onClick={handleSimulateSuccess}
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Success Pay'}
          </ShuttleButton>
        </div>
      </div>
    </ShuttleModal>
  );
}
