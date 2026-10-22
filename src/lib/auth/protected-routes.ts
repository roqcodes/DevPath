/** Routes that require a session (middleware + docs). */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/learn",
  "/practice",
  "/challenges",
  "/rankings",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
