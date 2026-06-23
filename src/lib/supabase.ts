import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for demo/build mode
    console.warn("Supabase not configured. Running in demo mode.");
    return {
      from: () => ({
        insert: async () => ({ error: { message: "Demo mode" } }),
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Demo mode" } }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: { message: "Demo mode" } }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Convenience export
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export type User = {
  id: string;
  x_user_id: string;
  x_handle: string;
  x_name: string | null;
  x_avatar_url: string | null;
  x_access_token: string;
  x_refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
};

export type CrushRequest = {
  id: string;
  sender_whatsapp: string;
  crush_x_handle: string;
  ai_message: string;
  status: "pending" | "accepted" | "rejected_paid";
  payment_tx_hash: string | null;
  sender_user_id: string | null;
  created_at: string;
};
