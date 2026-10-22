import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileTabBar } from "./mobile-tab-bar";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { CommandPalette } from "@/components/command/command-palette";

import { cn } from "@/lib/utils";

export function AppLayout({
  children,
  fillViewport = true,
  wideContent = false,
}: {
  children: React.ReactNode;
  /** Lock shell to viewport; children should use PageScroll or PageFill. */
  fillViewport?: boolean;
  wideContent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full bg-slate-50/60 text-slate-900",
        fillViewport ? "h-dvh max-h-dvh overflow-hidden" : "min-h-screen"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <OnboardingGate />
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader />
        <main
          id="main"
          tabIndex={-1}
          className={cn(
            "flex-1 focus:outline-none",
            fillViewport && "flex min-h-0 flex-col overflow-hidden"
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full flex-col",
              wideContent ? "max-w-none" : "max-w-6xl",
              fillViewport
                ? "min-h-0 flex-1 px-4 py-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-3 lg:px-8 lg:py-4 lg:pb-4"
                : "px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-8 lg:pb-8"
            )}
          >
            {fillViewport ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
      <MobileTabBar />
      <CommandPalette />
    </div>
  );
}
