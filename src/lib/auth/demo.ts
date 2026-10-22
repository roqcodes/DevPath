import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Client + server safe. No "use client" so proxy / route handlers can import it. */

export const DEMO_COOKIE = "devpath_demo";
const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function isDemoEnvEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEVPATH_DEMO === "1";
}

function hasDemoCookieInDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim() === `${DEMO_COOKIE}=1`);
}

/**
 * True when the visitor is using DevPath without an account: Supabase is not
 * configured, the deployment opts in via `NEXT_PUBLIC_DEVPATH_DEMO=1`, or (in
 * the browser) the `devpath_demo=1` cookie is set. Server callers that need
 * the cookie should read it from the request and use `isDemoCookieValue`.
 */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured() || isDemoEnvEnabled() || hasDemoCookieInDocument();
}

export function isDemoCookieValue(value: string | undefined | null): boolean {
  return value === "1";
}

/** Client helper: opt this browser into demo mode (e.g. a "Try without an account" button). */
export function enableDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=1; Path=/; Max-Age=${DEMO_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function disableDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
