import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { CommandPaletteProvider } from "@/components/command/command-palette";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-slate-50/60 text-slate-900">
        <OnboardingGate />
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto pb-20 lg:pb-0">
            <div className="mx-auto max-w-6xl px-4 py-6 pt-16 lg:px-8 lg:pt-8">
              {children}
            </div>
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
