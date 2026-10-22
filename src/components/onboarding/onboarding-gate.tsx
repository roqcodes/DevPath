"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { isDemoMode } from "@/lib/auth/demo";

const START_KEY = "devpath_start_v1";

function hasCompletedStart(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(START_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw) as { complete?: boolean };
    return d.complete === true;
  } catch {
    return false;
  }
}

export function OnboardingGate() {
  const { hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/start" ||
      pathname === "/onboarding" ||
      pathname.startsWith("/onboarding/")
    ) {
      return;
    }

    if (isDemoMode() && hasCompletedStart()) return;
    if (isDemoMode()) return;

    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.user && d.onboardingComplete === false) {
          router.replace("/onboarding");
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [hydrated, pathname, router]);

  return null;
}
