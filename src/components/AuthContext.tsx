'use client';

import {
 createContext,
 useContext,
 useState,
 useEffect,
 useCallback,
 type ReactNode,
} from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { audio } from '@/lib/audio';

interface AuthContextValue {
 user: Profile | null;
 isLoading: boolean;
 isAuthenticated: boolean;
 loginWithGoogle: () => Promise<{ error: string | null }>;
 loginWithEmail: (email: string) => Promise<{ error: string | null }>;
 verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
 loginWithLinkedIn: () => Promise<{ error: string | null }>;
 loginAsAdminGuest: () => Promise<{ error: string | null }>;
 logout: () => Promise<void>;
 refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
 user: null,
 isLoading: true,
 isAuthenticated: false,
 loginWithGoogle: async () => ({ error: null }),
 loginWithEmail: async () => ({ error: null }),
 verifyOtp: async () => ({ error: null }),
 loginWithLinkedIn: async () => ({ error: null }),
 loginAsAdminGuest: async () => ({ error: null }),
 logout: async () => {},
 refreshProfile: async () => {},
});

async function fetchProfile(authUserId: string, authUser?: any): Promise<Profile | null> {
  try {
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Profile fetch timeout') }), 2500)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      const isAbort =
        error.message?.includes('AbortError') ||
        error.name === 'AbortError' ||
        error.message?.includes('signal is aborted') ||
        error.message?.includes('Profile fetch timeout');
      if (!isAbort) {
        console.warn('Failed to fetch profile:', error.message);
      }
    }

    let profile = data as Profile | null;

    // If user signed in with Google and profile is missing or missing avatar/name
    if (authUser && (!profile || !profile.avatar_url || !profile.full_name)) {
      const meta = authUser.user_metadata || {};
      const googleName = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Lion Athlete';
      const googleAvatar = meta.avatar_url || meta.picture || null;

      if (!profile) {
        try {
          const newProf = {
            auth_user_id: authUserId,
            email: authUser.email || '',
            full_name: googleName,
            avatar_url: googleAvatar,
            faculty: '',
            department: '',
            level: '100',
            role: 'member',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const { data: created } = await supabase.from('profiles').insert(newProf).select().maybeSingle();
          profile = created as Profile;
        } catch (insertErr) {
          console.warn('Failed to auto-create profile:', insertErr);
        }
      } else if (!profile.avatar_url && googleAvatar) {
        try {
          await supabase
            .from('profiles')
            .update({
              avatar_url: googleAvatar,
              full_name: profile.full_name || googleName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
          profile.avatar_url = googleAvatar;
          if (!profile.full_name) profile.full_name = googleName;
        } catch (updateErr) {
          console.warn('Failed to sync google avatar:', updateErr);
        }
      }
    }

    return profile;
  } catch (e) {
    console.warn('Profile fetch exception:', e);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
      if (isGuestAdmin) {
        return {
          id: 'admin-guest-id',
          auth_user_id: 'admin-guest-auth-id',
          email: 'admin@shuttlelions.unn',
          full_name: 'UNN Badminton Coach (Admin)',
          phone: '+2348000000000',
          faculty: 'Faculty of Education',
          department: 'Health & Physical Education',
          level: 'PG',
          reg_number: 'ADMIN-GUEST',
          avatar_url: null,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      const raw = localStorage.getItem('shuttlelions_cached_profile');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
      const hasCachedProfile = localStorage.getItem('shuttlelions_cached_profile') !== null;
      return !(isGuestAdmin || hasCachedProfile);
    } catch (e) {
      return true;
    }
  });

  const persistProfile = useCallback((profile: Profile | null) => {
    setUser(profile);
    if (typeof window !== 'undefined') {
      try {
        if (profile) {
          localStorage.setItem('shuttlelions_cached_profile', JSON.stringify(profile));
        } else {
          localStorage.removeItem('shuttlelions_cached_profile');
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Safety watchdog timer: Never allow isLoading to stay stuck beyond 1.5s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 1500);

    const handleSessionUser = (sessionUser: any) => {
      if (!sessionUser) {
        persistProfile(null);
        if (isMounted) setIsLoading(false);
        return;
      }

      const meta = sessionUser.user_metadata || {};
      const googleName =
        meta.full_name ||
        meta.name ||
        sessionUser.email?.split('@')[0] ||
        'Lion Athlete';
      const googleAvatar = meta.avatar_url || meta.picture || null;

      const fallbackProfile: Profile = {
        id: sessionUser.id,
        auth_user_id: sessionUser.id,
        email: sessionUser.email || '',
        full_name: googleName,
        phone: sessionUser.phone || null,
        faculty: '',
        department: '',
        level: '100',
        reg_number: null,
        avatar_url: googleAvatar,
        role: 'member',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Immediately unblock UI with fallback / cached profile
      persistProfile(fallbackProfile);
      if (isMounted) setIsLoading(false);

      // 2. Fetch rich profile in background and sync
      fetchProfile(sessionUser.id, sessionUser).then((dbProfile) => {
        if (isMounted && dbProfile) {
          persistProfile(dbProfile);
        }
      });
    };

    async function initAuth() {
      try {
        const isGuestAdmin = typeof window !== 'undefined' && localStorage.getItem('shuttlelions_guest_admin') === 'true';
        if (isGuestAdmin) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Direct token or code ingestion if landed directly on dashboard
        if (typeof window !== 'undefined') {
          const hash = window.location.hash.substring(1);
          const search = window.location.search.substring(1);
          const hashParams = new URLSearchParams(hash);
          const searchParams = new URLSearchParams(search);

          const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
          const code = searchParams.get('code') || hashParams.get('code');

          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            if (window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            if (data?.session?.user) {
              handleSessionUser(data.session.user);
              return;
            }
          } else if (code) {
            const { data } = await supabase.auth.exchangeCodeForSession(code);
            if (window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            if (data?.session?.user) {
              handleSessionUser(data.session.user);
              return;
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            handleSessionUser(session.user);
          } else {
            const cached = localStorage.getItem('shuttlelions_cached_profile');
            if (!cached) {
              persistProfile(null);
            }
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.warn('Auth init note:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isGuestAdmin = typeof window !== 'undefined' && localStorage.getItem('shuttlelions_guest_admin') === 'true';
        if (isGuestAdmin) {
          if (isMounted) setIsLoading(false);
          return;
        }

        if (session?.user) {
          handleSessionUser(session.user);
        } else {
          if (isMounted) {
            persistProfile(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [persistProfile]);

 const loginWithGoogle = useCallback(async () => {
 try {
 const { error } = await supabase.auth.signInWithOAuth({
 provider: 'google',
 options: {
 redirectTo: `${window.location.origin}/auth/callback`,
 queryParams: {
 access_type: 'offline',
 prompt: 'select_account',
 },
 },
 });

 if (error) {
 const isAbort =
 error.message?.includes('AbortError') ||
 error.name === 'AbortError' ||
 error.message?.includes('signal is aborted');
 if (!isAbort) {
 console.error('Google OAuth error:', error.message);
 return { error: error.message };
 }
 }
 return { error: null };
 } catch (err: any) {
 const isAbort =
 err?.message?.includes('AbortError') ||
 err?.name === 'AbortError' ||
 err?.message?.includes('signal is aborted');
 if (!isAbort) {
 console.error('Unexpected Google OAuth error:', err);
 return { error: err?.message || 'Google login failed' };
 }
 return { error: null };
 }
 }, []);

 const loginWithEmail = useCallback(async (email: string) => {
 const { error } = await supabase.auth.signInWithOtp({ email });
 return { error: error?.message ?? null };
 }, []);

 const verifyOtp = useCallback(async (email: string, token: string) => {
 const { error } = await supabase.auth.verifyOtp({
 email,
 token,
 type: 'email',
 });
 return { error: error?.message ?? null };
 }, []);

 const loginWithLinkedIn = useCallback(async () => {
 const { error } = await supabase.auth.signInWithOAuth({
 provider: 'linkedin_oidc',
 options: {
 redirectTo: `${window.location.origin}/api/auth/callback`,
 },
 });
 return { error: error?.message ?? null };
 }, []);

 const loginAsAdminGuest = useCallback(async () => {
 audio.play('whistle');
 const mockAdminProfile: Profile = {
 id: 'admin-guest-id',
 auth_user_id: 'admin-guest-auth-id',
 email: 'admin@shuttlelions.unn',
 full_name: 'UNN Badminton Coach (Admin)',
 phone: '+2348000000000',
 faculty: 'Faculty of Education',
 department: 'Health & Physical Education',
 level: 'PG',
 reg_number: 'ADMIN-GUEST',
 avatar_url: null,
 role: 'admin',
 is_active: true,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 
 localStorage.setItem('shuttlelions_guest_admin', 'true');
 setUser(mockAdminProfile);
 setIsLoading(false);
 return { error: null };
 }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('shuttlelions_guest_admin');
    localStorage.removeItem('shuttlelions_cached_profile');
    await supabase.auth.signOut();
    setUser(null);
  }, []);

 const refreshProfile = useCallback(async () => {
 const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
 if (isGuestAdmin) return;

 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 const profile = await fetchProfile(session.user.id);
 setUser(profile);
 }
 }, []);

 return (
 <AuthContext.Provider
 value={{
 user,
 isLoading,
 isAuthenticated:!!user,
 loginWithGoogle,
 loginWithEmail,
 verifyOtp,
 loginWithLinkedIn,
 loginAsAdminGuest,
 logout,
 refreshProfile,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 return useContext(AuthContext);
}
