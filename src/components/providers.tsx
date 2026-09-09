"use client";

import { AppProvider } from "@/lib/context/app-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
