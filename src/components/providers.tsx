"use client";

import { AppProvider } from "@/lib/context/app-context";
import { Toaster } from "@/components/ui/toast";
import { CelebrationLayer } from "@/components/motion";
import { CompanionPresence } from "@/components/companion";
import { EngineBridge } from "@/lib/engine/bridge";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <EngineBridge />
      {children}
      <CompanionPresence />
      <CelebrationLayer />
      <Toaster />
    </AppProvider>
  );
}
