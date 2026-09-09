import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLocalUser, localStore } from "./local-store";
import type { AuthUser } from "@/lib/types/profile";

export type AuthErrorCode =
  | "invalid_credentials"
  | "duplicate_account"
  | "network_error"
  | "weak_password"
  | "unknown";

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  errorCode?: AuthErrorCode;
}

function mapAuthError(message: string): { error: string; errorCode: AuthErrorCode } {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return { error: "Invalid email or password. Please try again.", errorCode: "invalid_credentials" };
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return { error: "An account with this email already exists.", errorCode: "duplicate_account" };
  }
  if (lower.includes("password") && lower.includes("short")) {
    return { error: "Password must be at least 8 characters.", errorCode: "weak_password" };
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return { error: "Unable to connect. Check your connection and try again.", errorCode: "network_error" };
  }
  return { error: "Something went wrong. Please try again.", errorCode: "unknown" };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    const existing = localStore.getSession();
    if (existing?.email === email) {
      return { success: false, error: "An account with this email already exists.", errorCode: "duplicate_account" };
    }
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters.", errorCode: "weak_password" };
    }
    const user = createLocalUser(email, fullName);
    localStore.setSession(user);
    return { success: true, user };
  }

  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Authentication is unavailable.", errorCode: "network_error" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      const mapped = mapAuthError(error.message);
      return { success: false, ...mapped };
    }

    if (!data.user) {
      return { success: false, error: "Unable to create account.", errorCode: "unknown" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName,
      },
    };
  } catch {
    return { success: false, error: "Unable to connect. Check your connection and try again.", errorCode: "network_error" };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    const user = localStore.getSession();
    if (!user || user.email !== email) {
      return { success: false, error: "Invalid email or password. Please try again.", errorCode: "invalid_credentials" };
    }
    return { success: true, user };
  }

  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Authentication is unavailable.", errorCode: "network_error" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const mapped = mapAuthError(error.message);
      return { success: false, ...mapped };
    }

    if (!data.user) {
      return { success: false, error: "Invalid email or password. Please try again.", errorCode: "invalid_credentials" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName: data.user.user_metadata?.full_name as string | undefined,
      },
    };
  } catch {
    return { success: false, error: "Unable to connect. Check your connection and try again.", errorCode: "network_error" };
  }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) {
    localStore.clearSession();
    return;
  }

  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return localStore.getSession();
  }

  const supabase = createClient();
  if (!supabase) return localStore.getSession();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name as string | undefined,
    };
  } catch {
    return localStore.getSession();
  }
}
