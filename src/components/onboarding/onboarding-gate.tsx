"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";

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
      pathname === "/onboarding" ||
      pathname.startsWith("/onboarding/")
    ) {
      return;
    }

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
