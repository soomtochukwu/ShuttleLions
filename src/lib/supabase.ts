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

// ---- Local Storage Database Engine (for Admin Guest Mode / Demo Mode) ----

const STORAGE_PREFIX = 'shuttlelions_mock_';

const MOCK_PROFILES: Profile[] = [
  {
    id: 'student-1',
    auth_user_id: 'auth-student-1',
    email: 'okeke.chukwudi.1234@unn.edu.ng',
    full_name: 'Okeke Chukwudi Emmanuel',
    phone: '+2348031234567',
    faculty: 'Faculty of Engineering',
    department: 'Electrical Engineering',
    level: '300',
    reg_number: '2021/174932',
    avatar_url: null,
    role: 'member',
    is_active: true,
    created_at: '2026-05-10T14:32:00Z',
    updated_at: '2026-05-10T14:32:00Z',
  },
  {
    id: 'student-2',
    auth_user_id: 'auth-student-2',
    email: 'nwachukwu.chioma.89@unn.edu.ng',
    full_name: 'Nwachukwu Chioma Mary',
    phone: '+2347055556677',
    faculty: 'Faculty of Biological Sciences',
    department: 'Biochemistry',
    level: '200',
    reg_number: '2022/245890',
    avatar_url: null,
    role: 'member',
    is_active: true,
    created_at: '2026-06-01T09:15:00Z',
    updated_at: '2026-06-01T09:15:00Z',
  },
  {
    id: 'student-3',
    auth_user_id: 'auth-student-3',
    email: 'eze.kingsley.42@unn.edu.ng',
    full_name: 'Eze Kingsley',
    phone: '+2348123456789',
    faculty: 'Faculty of Physical Sciences',
    department: 'Computer Science',
    level: '400',
    reg_number: '2020/198754',
    avatar_url: null,
    role: 'member',
    is_active: true,
    created_at: '2026-04-15T11:45:00Z',
    updated_at: '2026-04-15T11:45:00Z',
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    profile_id: 'student-1',
    type: 'registration',
    amount_kobo: 500000,
    status: 'success',
    reference: 'SL-PAY-REG-01',
    provider: 'paystack',
    metadata: null,
    created_at: '2026-05-10T14:35:00Z',
    updated_at: '2026-05-10T14:35:00Z',
  },
  {
    id: 'pay-2',
    profile_id: 'student-2',
    type: 'registration',
    amount_kobo: 500000,
    status: 'success',
    reference: 'SL-PAY-REG-02',
    provider: 'paystack',
    metadata: null,
    created_at: '2026-06-01T09:20:00Z',
    updated_at: '2026-06-01T09:20:00Z',
  },
  {
    id: 'pay-3',
    profile_id: 'student-2',
    type: 'monthly',
    amount_kobo: 100000,
    status: 'success',
    reference: 'SL-PAY-MONTH-02',
    provider: 'paystack',
    metadata: { period: '2026-06' },
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
];

const MOCK_ORDERS: RacketOrder[] = [
  {
    id: 'order-1',
    profile_id: 'student-3',
    racket_model: 'Yonex Voltric Lite',
    quantity: 1,
    unit_price_kobo: 2500000,
    total_price_kobo: 2500000,
    status: 'confirmed',
    payment_id: 'pay-4',
    notes: 'Awaiting package arrival from main office.',
    created_at: '2026-04-16T12:00:00Z',
    updated_at: '2026-04-16T12:00:00Z',
  },
];

function getLocalStorageDB<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return initial;
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  if (!data) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveLocalStorageDB<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

// ---- Client Singleton (Lazy Init) ----

function getInitialData(table: string): any[] {
  if (table === 'profiles') return MOCK_PROFILES;
  if (table === 'payments') return MOCK_PAYMENTS;
  return MOCK_ORDERS;
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const isGuestAdmin = typeof window !== 'undefined' && localStorage.getItem('shuttlelions_guest_admin') === 'true';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Force local DB engine if in guest admin mode or missing keys
  if (isGuestAdmin || !supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        verifyOtp: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        signOut: async () => ({ error: null }),
      },
      from: (table: string) => {
        // Simple client mock implementation matching table operations
        return {
          insert: async (rows: any) => {
            const data = getLocalStorageDB(table, getInitialData(table));
            const items = Array.isArray(rows) ? rows : [rows];
            const added = items.map((item: any) => ({
              id: item.id || `mock-id-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...item,
            }));
            saveLocalStorageDB(table, [...data, ...added]);
            return { data: added[0], error: null, select: () => ({ single: async () => ({ data: added[0], error: null }) }) };
          },
          select: (fields = '*') => ({
            eq: (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              const filtered = data.filter((item: any) => item[col] === val);
              return {
                single: async () => ({ data: filtered[0] || null, error: filtered[0] ? null : { message: 'Not found' } }),
                maybeSingle: async () => ({ data: filtered[0] || null, error: null }),
                order: () => ({
                  limit: async () => ({ data: filtered, error: null }),
                }),
              };
            },
            order: (col: string, { ascending = true } = {}) => {
              let data = getLocalStorageDB(table, getInitialData(table));
              data = [...data].sort((a: any, b: any) => {
                const valA = a[col];
                const valB = b[col];
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
              });
              return {
                eq: (column: string, value: any) => {
                  const filtered = data.filter((item: any) => item[column] === value);
                  return filtered;
                },
                then: (cb: any) => cb({ data, error: null }),
              };
            },
            then: (cb: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              return cb({ data, error: null });
            },
          }),
          update: (fields: any) => ({
            eq: async (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              let updatedItem: any = null;
              const next = data.map((item: any) => {
                if (item[col] === val) {
                  updatedItem = { ...item, ...fields, updated_at: new Date().toISOString() };
                  return updatedItem;
                }
                return item;
              });
              saveLocalStorageDB(table, next);
              return { data: updatedItem, error: null };
            },
          }),
          upsert: async (rows: any) => {
            const data = getLocalStorageDB(table, getInitialData(table));
            const items = Array.isArray(rows) ? rows : [rows];
            let lastItem: any = null;
            const next = [...data];
            
            items.forEach((item: any) => {
              const idx = next.findIndex((x: any) => x.id === item.id || (item.auth_user_id && x.auth_user_id === item.auth_user_id));
              if (idx > -1) {
                next[idx] = { ...next[idx], ...item, updated_at: new Date().toISOString() };
                lastItem = next[idx];
              } else {
                const added = {
                  id: item.id || `mock-id-${Math.random().toString(36).substr(2, 9)}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...item,
                };
                next.push(added);
                lastItem = added;
              }
            });
            saveLocalStorageDB(table, next);
            return { data: lastItem, error: null };
          },
          delete: () => ({
            eq: async (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              const next = data.filter((item: any) => item[col] !== val);
              saveLocalStorageDB(table, next);
              return { error: null };
            },
          }),
        };
      },
    } as unknown as SupabaseClient;
  }

  if (_supabase) return _supabase;

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
