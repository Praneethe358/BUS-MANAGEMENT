import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

function normalizeError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }

  return new Error(fallbackMessage);
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Unable to register user at this time.");
    }

    return data.user;
  } catch (error) {
    throw normalizeError(error, "Unable to register user at this time.");
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error("Unable to login at this time.");
    }

    return data.user;
  } catch (error) {
    throw normalizeError(error, "Unable to login at this time.");
  }
}

export async function logout(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    throw normalizeError(error, "Unable to logout at this time.");
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    throw normalizeError(error, "Unable to read user session.");
  }
}
