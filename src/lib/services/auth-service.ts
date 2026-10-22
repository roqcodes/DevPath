import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AuthUser } from "@/lib/types/profile";

export type AuthErrorCode =
  | "invalid_credentials"
  | "duplicate_account"
  | "network_error"
  | "weak_password"
  | "not_configured"
  | "unknown";

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  errorCode?: AuthErrorCode;
  /** Supabase may require email confirmation before a session exists. */
  needsEmailVerification?: boolean;
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

function authUnavailable(): AuthResult {
  return {
    success: false,
    error: "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    errorCode: "not_configured",
  };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return authUnavailable();

  const supabase = createClient();
  if (!supabase) return authUnavailable();

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
      needsEmailVerification: !data.session,
    };
  } catch {
    return { success: false, error: "Unable to connect. Check your connection and try again.", errorCode: "network_error" };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return authUnavailable();

  const supabase = createClient();
  if (!supabase) return authUnavailable();

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
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name as string | undefined,
    };
  } catch {
    return null;
  }
}
