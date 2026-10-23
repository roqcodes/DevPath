/** Routes that require a session (proxy + docs). `/start` is intentionally public. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/learn",
  "/practice",
  "/challenges",
  "/rankings",
  "/profile",
  "/settings",
  "/onboarding",
  "/path",
  "/review",
  "/achievements",
  "/arena",
  "/wrapped",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export interface AccessInput {
  pathname: string;
  supabaseConfigured: boolean;
  /** `NEXT_PUBLIC_DEVPATH_DEMO === "1"` */
  demoEnv: boolean;
  /** `devpath_demo=1` cookie (or `?demo=1`) present */
  demoCookie: boolean;
}

/**
 * - `pass`: let the request through without touching auth.
 * - `check_session`: Supabase is configured and no demo opt-in; require a user.
 */
export function resolveAccess(input: AccessInput): "pass" | "check_session" {
  if (!isProtectedPath(input.pathname)) return "pass";
  if (!input.supabaseConfigured) return "pass";
  if (input.demoEnv || input.demoCookie) return "pass";
  return "check_session";
}
