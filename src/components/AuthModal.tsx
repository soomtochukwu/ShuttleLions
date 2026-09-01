'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { audio } from '@/lib/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, verifyOtp, loginAsAdminGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Count down timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    audio.play('serve');
    const { error: googleError } = await loginWithGoogle();
    setIsGoogleLoading(false);

    if (googleError) {
      audio.play('courtSqueak');
      setError(googleError);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Universal email regex validation (accepts any email provider)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      audio.play('courtSqueak');
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    audio.play('serve');
    const { error: sendError } = await loginWithEmail(email.trim().toLowerCase());
    setIsLoading(false);

    if (sendError) {
      audio.play('courtSqueak');
      setError(sendError);
    } else {
      audio.play('whistle');
      setOtpSent(true);
      setResendTimer(60);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, ''); // only allow digits
    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const singleDigit = cleanValue[cleanValue.length - 1]; // take the last entered char
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Move to next input if not the last one
    if (index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpCode = otpDigits.join('');

    if (otpCode.length < 6) {
      audio.play('courtSqueak');
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    audio.play('serve');
    const { error: verifyError } = await verifyOtp(email.trim().toLowerCase(), otpCode);
    setIsLoading(false);

    if (verifyError) {
      audio.play('courtSqueak');
      setError(verifyError);
    } else {
      audio.play('whistle');
      onClose();
      // Reset state
      setEmail('');
      setOtpDigits(Array(6).fill(''));
      setOtpSent(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setIsLoading(true);
    audio.play('serve');
    const { error: sendError } = await loginWithEmail(email.trim().toLowerCase());
    setIsLoading(false);

    if (sendError) {
      audio.play('courtSqueak');
      setError(sendError);
    } else {
      audio.play('whistle');
      setResendTimer(60);
    }
  };

  const handleAdminBypass = async () => {
    await loginAsAdminGuest();
    onClose();
  };

  return (
    <ShuttleModal isOpen={isOpen} onClose={onClose} title="ShuttleLions Gate 🦁">
      {error && (
        <div className="mb-4 p-3 bg-sl-error/15 border border-sl-error text-sl-error text-xs font-bold rounded-xl text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Option 1: One-Click Google Sign-In */}
        {!otpSent && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {/* Official Google Multi-Color SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-sl-border/60"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-mono font-bold text-sl-muted">
                or sign in with email OTP
              </span>
              <div className="flex-grow border-t border-sl-border/60"></div>
            </div>
          </div>
        )}

        {/* Option 2: Email OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <ShuttleInput
              label="Email Address"
              type="email"
              placeholder="e.g. athlete@gmail.com, student@unn.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
            <ShuttleButton
              type="submit"
              variant="green"
              fullWidth
              disabled={isLoading || isGoogleLoading}
              className="py-3 text-xs font-black shadow-md"
            >
              {isLoading ? 'Sending Access Code...' : 'Send One-Time Code ⚡'}
            </ShuttleButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center">
              <p className="text-xs font-bold text-sl-muted mb-1">
                We sent a 6-digit access code to
              </p>
              <p className="text-sm font-extrabold text-sl-green truncate">{email}</p>
            </div>

            {/* OTP Input Grid */}
            <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-10 h-12 text-center text-xl font-bold border-2 border-sl-border bg-sl-bg text-sl-foreground rounded-xl focus:border-sl-green focus:ring-2 focus:ring-sl-green-glow/20 outline-none transition-all"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={isLoading}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <ShuttleButton
                type="submit"
                variant="green"
                fullWidth
                disabled={isLoading}
                className="py-3 text-xs font-black"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP & Enter 🦁'}
              </ShuttleButton>

              <div className="text-center mt-2">
                {resendTimer > 0 ? (
                  <p className="text-xs text-sl-muted font-bold">
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs text-sl-green font-bold hover:underline"
                    disabled={isLoading}
                  >
                    Didn&apos;t get a code? Resend OTP
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Admin Instant Bypass Button */}
        <div className="border-t border-sl-border/40 pt-4 text-center">
          <button
            type="button"
            onClick={handleAdminBypass}
            className="text-xs font-bold text-sl-warning hover:text-sl-warning/80 hover:underline uppercase tracking-wide flex items-center justify-center gap-1.5 mx-auto"
          >
            🛡️ Login as Coach (Admin Guest Mode)
          </button>
        </div>
      </div>
    </ShuttleModal>
  );
}
