"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { getEngineState } from "@/lib/engine";

const START_NUDGE_KEY = "devpath_start_nudged_v1";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/start", "/onboarding"];

/**
 * - First visit to /dashboard with no engine onboarding: route to /start once (flag in localStorage).
 * - Supabase users whose academic profile is incomplete: /onboarding (only when /api/me says so).
 * Never blocks rendering; never redirects when /api/me fails (demo / zero-config).
 */
export function OnboardingGate() {
  const { hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")))) return;

    if (pathname === "/dashboard" && !getEngineState().onboarding) {
      let nudged = true;
      try {
        nudged = window.localStorage.getItem(START_NUDGE_KEY) === "1";
        if (!nudged) window.localStorage.setItem(START_NUDGE_KEY, "1");
      } catch {
        /* storage blocked: never redirect */
      }
      if (!nudged) {
        router.replace("/start");
        return;
      }
    }

    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.user && d.onboardingComplete === false) router.replace("/onboarding");
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [hydrated, pathname, router]);

  return null;
}
