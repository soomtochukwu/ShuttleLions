'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [statusText, setStatusText] = useState('Establishing your athlete session...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isHandled = false;

    async function handleAuth() {
      if (isHandled) return;
      isHandled = true;

      try {
        // 1. Check for tokens in hash fragment (#access_token=...&refresh_token=...)
        const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
        const search = typeof window !== 'undefined' ? window.location.search.substring(1) : '';
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        let userSession = null;

        if (accessToken && refreshToken) {
          setStatusText('Authenticating with Google credentials...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('setSession error:', error);
            setErrorMsg(error.message);
            return;
          }
          userSession = data.session;
        } else {
          // Fallback to getSession or onAuthStateChange
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('getSession error:', error);
          }
          userSession = data?.session;
        }

        // If session was retrieved or established
        if (userSession?.user) {
          const user = userSession.user;
          const metadata = user.user_metadata || {};
          const fullName =
            metadata.full_name ||
            metadata.name ||
            user.email?.split('@')[0] ||
            'Lion Athlete';
          const avatarUrl = metadata.avatar_url || metadata.picture || null;

          setStatusText('Syncing profile details to court roster...');

          // Sync with database
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
          } catch (dbErr) {
            console.error('Profile DB sync notice:', dbErr);
          }

          setStatusText('Redirecting to dashboard...');
          // Full window redirect guarantees all state and localStorage are re-read cleanly
          window.location.href = '/dashboard';
        } else {
          // Wait briefly for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user) {
                subscription.unsubscribe();
                window.location.href = '/dashboard';
              }
            }
          );

          // Fallback timeout in case auth failed completely
          setTimeout(() => {
            if (!userSession?.user) {
              setErrorMsg('Unable to retrieve active session. Please try signing in again.');
            }
          }, 3500);
        }
      } catch (err: any) {
        console.error('Fatal auth callback error:', err);
        setErrorMsg(err.message || 'Authentication failed');
      }
    }

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center text-sl-foreground p-6">
      <div className="shuttle-panel p-8 bg-sl-panel max-w-sm w-full text-center space-y-4 border border-sl-border shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-sl-green text-white font-black text-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,200,83,0.5)] animate-bounce">
          🏸
        </div>

        {errorMsg ? (
          <div className="space-y-3">
            <h2 className="text-base font-black text-rose-400 uppercase">Authentication Notice</h2>
            <p className="text-xs text-sl-muted leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-sl-green text-white text-xs font-black rounded-lg uppercase tracking-wider hover:brightness-110 shadow-md"
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
