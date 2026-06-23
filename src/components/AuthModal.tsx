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

type AuthTab = 'email' | 'linkedin';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithEmail, verifyOtp, loginWithLinkedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleTabChange = (tab: AuthTab) => {
    audio.play('rally');
    setActiveTab(tab);
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@unn\.edu\.ng$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      audio.play('courtSqueak');
      setError('Please enter a valid UNN student email (@unn.edu.ng)');
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

  const handleLinkedInLogin = async () => {
    setError(null);
    audio.play('serve');
    const { error: linkedinError } = await loginWithLinkedIn();
    if (linkedinError) {
      audio.play('courtSqueak');
      setError(linkedinError);
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

  return (
    <ShuttleModal isOpen={isOpen} onClose={onClose} title="ShuttleLions Gate">
      {/* Tabs */}
      <div className="flex border-b-2 border-sl-border mb-6">
        <button
          onClick={() => handleTabChange('email')}
          className={`flex-1 py-2 font-bold text-sm uppercase transition-colors ${
            activeTab === 'email'
              ? 'border-b-4 border-sl-green text-sl-green'
              : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          UNN student email
        </button>
        <button
          onClick={() => handleTabChange('linkedin')}
          className={`flex-1 py-2 font-bold text-sm uppercase transition-colors ${
            activeTab === 'linkedin'
              ? 'border-b-4 border-sl-green text-sl-green'
              : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          LinkedIn OAuth
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-sl-error/15 border-2 border-sl-error text-sl-error text-xs font-bold rounded-lg text-center">
          ⚠️ {error}
        </div>
      )}

      {activeTab === 'email' ? (
        !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-sl-muted font-bold leading-relaxed">
              Enter your University of Nigeria, Nsukka student email ending in <strong className="text-sl-green">@unn.edu.ng</strong> to receive an OTP registration code.
            </p>
            <ShuttleInput
              label="UNN Student Email"
              type="email"
              placeholder="first.last.12345@unn.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <ShuttleButton
              type="submit"
              variant="green"
              fullWidth
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Sending code...' : 'Send Verification OTP 🏸'}
            </ShuttleButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center">
              <p className="text-xs font-bold text-sl-muted mb-2">
                We sent a 6-digit verification code to
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
                  className="w-10 h-12 text-center text-xl font-bold border-3 border-sl-border bg-sl-panel rounded shadow-[2px_2px_0_var(--sl-shadow)] focus:shadow-[3px_3px_0_var(--sl-green-glow)] focus:border-sl-green outline-none"
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
              >
                {isLoading ? 'Verifying...' : 'Verify OTP & Enter 🏸'}
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
        )
      ) : (
        <div className="space-y-6 py-4 text-center">
          <p className="text-xs text-sl-muted font-bold leading-relaxed">
            Fast onboard via LinkedIn. Your email from LinkedIn will be checked for eligibility, or authenticated directly.
          </p>
          <ShuttleButton
            variant="dark"
            onClick={handleLinkedInLogin}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            {/* LinkedIn Logo */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            Continue with LinkedIn
          </ShuttleButton>
        </div>
      )}
    </ShuttleModal>
  );
}
