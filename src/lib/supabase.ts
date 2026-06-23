import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ---- Types ----

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  faculty: string;
  department: string;
  level: string;
  reg_number: string | null;
  avatar_url: string | null;
  role: 'member' | 'admin' | 'captain';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  profile_id: string;
  type: 'registration' | 'monthly' | 'racket';
  amount_kobo: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  reference: string;
  provider: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type RacketOrder = {
  id: string;
  profile_id: string;
  racket_model: string;
  quantity: number;
  unit_price_kobo: number;
  total_price_kobo: number;
  status: 'pending' | 'confirmed' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ---- Client Singleton (Lazy Init) ----

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured. Running in demo mode.');
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Demo mode' } }),
        verifyOtp: async () => ({ data: null, error: { message: 'Demo mode' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Demo mode' } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        insert: async () => ({ error: { message: 'Demo mode' } }),
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: 'Demo mode' } }),
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: { message: 'Demo mode' } }),
        }),
        upsert: async () => ({ error: { message: 'Demo mode' } }),
        delete: () => ({
          eq: async () => ({ error: { message: 'Demo mode' } }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Convenience Proxy export
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// ---- Server-side Admin Client ----

let _serverSupabase: SupabaseClient | null = null;

export function createServerSupabase(): SupabaseClient {
  if (_serverSupabase) return _serverSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Server Supabase not configured. Falling back to anon client.');
    return getSupabase();
  }

  _serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serverSupabase;
}
