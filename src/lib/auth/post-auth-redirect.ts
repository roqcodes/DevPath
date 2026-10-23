export async function resolvePathAfterAuth(
  nextPath: string | null
): Promise<{ path: string; onboardingComplete: boolean }> {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

  try {
    const res = await fetch("/api/me", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    const onboardingComplete = Boolean(data?.onboardingComplete);

    if (!onboardingComplete) {
      return { path: "/onboarding", onboardingComplete: false };
    }

    return { path: safeNext ?? "/dashboard", onboardingComplete: true };
  } catch {
    return { path: safeNext ?? "/onboarding", onboardingComplete: false };
  }
}
