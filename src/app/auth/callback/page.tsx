'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [statusText, setStatusText] = useState('Verifying your athlete credentials...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  const proceedToDashboard = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    setStatusText('Redirecting to dashboard...');
    window.location.replace('/dashboard');
  };

  const syncProfileBackground = async (user: any) => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      user.email?.split('@')[0] ||
      'Lion Athlete';
    const avatarUrl = metadata.avatar_url || metadata.picture || null;

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('profiles')
          .update({
            email: user.email!,
            full_name: existingProfile.full_name || fullName,
            avatar_url: existingProfile.avatar_url || avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('auth_user_id', user.id);
      } else {
        await supabase.from('profiles').insert({
          auth_user_id: user.id,
          email: user.email!,
          full_name: fullName,
          avatar_url: avatarUrl,
          faculty: '',
          department: '',
          level: '100',
          role: 'member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (syncErr) {
      console.warn('Profile background sync notice:', syncErr);
    }
  };

  useEffect(() => {
    // 1. Immediate listener for Supabase auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && !redirectedRef.current) {
          setStatusText('Welcome to ShuttleLions! Loading your dashboard...');
          // Run non-blocking sync with a short timeout race
          Promise.race([
            syncProfileBackground(session.user),
            new Promise((resolve) => setTimeout(resolve, 800)),
          ]).finally(() => {
            proceedToDashboard();
          });
        }
      }
    );

    // 2. Active URL token & code extraction
    async function processAuth() {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
        const search = typeof window !== 'undefined' ? window.location.search.substring(1) : '';
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (error || errorDescription) {
          setErrorMsg(errorDescription || error || 'Authentication failed');
          return;
        }

        const code = searchParams.get('code') || hashParams.get('code');
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        // Strategy A: Exchange PKCE authorization code
        if (code) {
          setStatusText('Authenticating authorization code...');
          const { data, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!codeErr && data?.session?.user) {
            await Promise.race([
              syncProfileBackground(data.session.user),
              new Promise((resolve) => setTimeout(resolve, 800)),
            ]);
            proceedToDashboard();
            return;
          }
        }

        // Strategy B: Set explicit session tokens from hash fragment
        if (accessToken && refreshToken) {
          setStatusText('Authenticating with Google credentials...');
          const { data, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionErr && data?.session?.user) {
            await Promise.race([
              syncProfileBackground(data.session.user),
              new Promise((resolve) => setTimeout(resolve, 800)),
            ]);
            proceedToDashboard();
            return;
          }
        }

        // Strategy C: Check existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          await Promise.race([
            syncProfileBackground(sessionData.session.user),
            new Promise((resolve) => setTimeout(resolve, 800)),
          ]);
          proceedToDashboard();
          return;
        }

        // Strategy D: Check user directly
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          proceedToDashboard();
          return;
        }
      } catch (err: any) {
        console.error('Auth callback processor error:', err);
      }
    }

    processAuth();

    // 3. Fallback safety timer: guarantees the user is never indefinitely stuck
    const fallbackTimer = setTimeout(async () => {
      if (redirectedRef.current) return;

      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          proceedToDashboard();
          return;
        }
      } catch {
        // ignore
      }

      setErrorMsg('Authentication timed out or session expired. Please try signing in again.');
    }, 4500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center text-sl-foreground p-6">
      <div className="shuttle-panel p-8 bg-sl-panel max-w-sm w-full text-center space-y-4 border border-sl-border shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-sl-green text-white font-black text-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,200,83,0.5)] animate-bounce">
          <span className="w-4 h-4 rounded-full bg-white animate-ping" />
        </div>

        {errorMsg ? (
          <div className="space-y-3">
            <h2 className="text-base font-black text-rose-400 uppercase">Authentication Notice</h2>
            <p className="text-xs text-sl-muted leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => {
                window.location.replace('/');
              }}
              className="px-4 py-2 bg-sl-green text-white text-xs font-black rounded-lg uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h2
              className="text-base font-black uppercase text-sl-foreground tracking-wider"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              SHUTTLE<span className="text-sl-green">LIONS</span>
            </h2>
            <p className="text-xs text-sl-muted font-medium animate-pulse">
              {statusText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
