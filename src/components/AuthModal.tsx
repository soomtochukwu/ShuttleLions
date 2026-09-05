'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { audio } from '@/lib/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    audio.play('serve');
    try {
      const { error: googleError } = await loginWithGoogle();
      if (googleError) {
        setIsGoogleLoading(false);
        audio.play('courtSqueak');
        if (
          googleError.toLowerCase().includes('unsupported provider') ||
          googleError.toLowerCase().includes('not enabled')
        ) {
          setError(
            'Google Auth is not enabled in your Supabase project yet. Please enable Google in Supabase Dashboard > Authentication > Providers.'
          );
        } else {
          setError(googleError);
        }
      }
    } catch (err: any) {
      const isAbort =
        err?.message?.includes('AbortError') ||
        err?.name === 'AbortError' ||
        err?.message?.includes('signal is aborted');
      if (!isAbort) {
        setIsGoogleLoading(false);
        setError(err?.message || 'Failed to initialize Google login');
      }
    }
  };

  return (
    <ShuttleModal isOpen={isOpen} onClose={onClose} title="ShuttleLions Gate 🦁">
      {error && (
        <div className="mb-4 p-3 bg-sl-error/15 border border-sl-error text-sl-error text-xs font-bold rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Option 1: One-Click Google Sign-In (Active) */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
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
              alternative sign-in methods
            </span>
            <div className="flex-grow border-t border-sl-border/60"></div>
          </div>
        </div>

        {/* Option 2: Email OTP Form (Disabled - Coming Soon) */}
        <div className="space-y-3 opacity-60 select-none">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
              <span>Email Address</span>
            </label>
            <span className="text-[9px] font-black uppercase bg-sl-warning/15 text-sl-warning border border-sl-warning/30 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. athlete@gmail.com, student@unn.edu.ng"
              disabled
              readOnly
              className="w-full p-3.5 rounded-xl bg-sl-bg/50 border border-sl-border/60 text-xs font-bold text-sl-muted cursor-not-allowed outline-none select-none"
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full py-3 px-4 rounded-xl bg-sl-panel border border-sl-border/60 text-sl-muted font-black text-xs cursor-not-allowed flex items-center justify-center gap-2 shadow-none select-none"
          >
            <span>Send One-Time Code</span>
            <span className="text-[9px] font-black uppercase bg-sl-warning/15 text-sl-warning border border-sl-warning/30 px-1.5 py-0.5 rounded">
              Coming Soon
            </span>
          </button>
        </div>

        {/* Option 3: Admin Guest Mode (Disabled - Coming Soon) */}
        <div className="border-t border-sl-border/40 pt-4 text-center">
          <div className="inline-flex items-center justify-center gap-2 cursor-not-allowed opacity-60 select-none">
            <span className="text-xs font-bold text-sl-muted uppercase tracking-wide">
              Login as Coach (Admin Guest Mode)
            </span>
            <span className="text-[9px] font-black uppercase bg-sl-warning/15 text-sl-warning border border-sl-warning/30 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </ShuttleModal>
  );
}
