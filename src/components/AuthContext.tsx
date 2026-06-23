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
  loginWithEmail: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  loginWithLinkedIn: async () => ({ error: null }),
  loginAsAdminGuest: async () => ({ error: null }),
  logout: async () => {},
  refreshProfile: async () => {},
});

async function fetchProfile(authUserId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }

  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const isGuestAdmin = localStorage.getItem('shuttlelions_guest_admin') === 'true';
        if (isGuestAdmin) {
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
          setUser(mockAdminProfile);
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) setUser(profile);
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
        if (isGuestAdmin) return; // ignore standard auth changes in guest admin mode

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) setUser(profile);
        } else {
          if (isMounted) setUser(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
        isAuthenticated: !!user,
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
