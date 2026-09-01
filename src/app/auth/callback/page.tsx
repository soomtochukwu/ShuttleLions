'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Get session (Supabase automatically parses #access_token=... from URL hash)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback session error:', error.message);
          if (isMounted) setErrorMsg(error.message);
          return;
        }

        if (session?.user) {
          const user = session.user;
          const metadata = user.user_metadata || {};
          const fullName =
            metadata.full_name ||
            metadata.name ||
            user.email?.split('@')[0] ||
            'Lion Athlete';
          const avatarUrl = metadata.avatar_url || metadata.picture || null;

          // 2. Sync Google name and picture to public.profiles database table
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
            console.error('Failed to sync profile to database:', dbErr);
          }

          await refreshProfile();
          if (isMounted) {
            router.replace('/dashboard');
          }
        } else {
          // If no session found yet, listen for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (newSession?.user && isMounted) {
                await refreshProfile();
                router.replace('/dashboard');
              }
            }
          );
          return () => subscription.unsubscribe();
        }
      } catch (err: any) {
        console.error('Unexpected auth callback error:', err);
        if (isMounted) setErrorMsg(err.message || 'Authentication failed');
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, refreshProfile]);

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
              onClick={() => router.replace('/')}
              className="px-4 py-2 bg-sl-green text-white text-xs font-black rounded-lg uppercase tracking-wider"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h2
              className="text-base font-black uppercase text-sl-foreground"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Signing In with Google...
            </h2>
            <p className="text-xs text-sl-muted font-medium">
              Establishing your UNN athlete session and entering court.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
