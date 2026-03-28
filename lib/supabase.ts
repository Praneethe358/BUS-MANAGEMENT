import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const missingSupabaseKeys = [
  !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
  !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
].filter((key): key is string => Boolean(key));

if (missingSupabaseKeys.length > 0) {
  console.warn(
    `[Supabase] Missing environment variables: ${missingSupabaseKeys.join(", ")}.`
  );
}

export const hasSupabaseConfig = missingSupabaseKeys.length === 0;

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      `[Supabase] Missing environment variables: ${missingSupabaseKeys.join(", ")}.`
    );
  }

  return supabase;
}