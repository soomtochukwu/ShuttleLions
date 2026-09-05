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
 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('auth_user_id', authUserId)
 .maybeSingle();

 if (error) {
 const isAbort = error.message?.includes('AbortError') || error.name === 'AbortError' || error.message?.includes('signal is aborted');
 if (!isAbort) {
 console.error('Failed to fetch profile:', error.message);
 }
 }

 let profile = data as Profile | null;

 // If user signed in with Google and profile is missing or missing avatar/name
 if (authUser && (!profile ||!profile.avatar_url ||!profile.full_name)) {
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
 console.error('Failed to auto-create profile:', insertErr);
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
 console.error('Failed to sync google avatar:', updateErr);
 }
 }
 }

 return profile;
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

    async function initAuth() {
      try {
        const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
        if (isGuestAdmin) {
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const meta = session.user.user_metadata || {};
          const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Lion Athlete';
          const googleAvatar = meta.avatar_url || meta.picture || null;
          const fallbackProfile: Profile = {
            id: session.user.id,
            auth_user_id: session.user.id,
            email: session.user.email || '',
            full_name: googleName,
            phone: session.user.phone || null,
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

          const profile = await fetchProfile(session.user.id, session.user);
          if (isMounted) {
            persistProfile(profile || fallbackProfile);
          }
        } else if (!session?.user && isMounted) {
          // No active session in Supabase, clear cache if not guest admin
          persistProfile(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
        if (isGuestAdmin) return;

        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Lion Athlete';
          const googleAvatar = meta.avatar_url || meta.picture || null;
          const fallbackProfile: Profile = {
            id: session.user.id,
            auth_user_id: session.user.id,
            email: session.user.email || '',
            full_name: googleName,
            phone: session.user.phone || null,
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

          const profile = await fetchProfile(session.user.id, session.user);
          if (isMounted) persistProfile(profile || fallbackProfile);
        } else {
          if (isMounted) persistProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
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
