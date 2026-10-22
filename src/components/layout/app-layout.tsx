import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileTabBar } from "./mobile-tab-bar";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { CommandPalette } from "@/components/command/command-palette";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/60 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <OnboardingGate />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar />
      <CommandPalette />
    </div>
  );
}
