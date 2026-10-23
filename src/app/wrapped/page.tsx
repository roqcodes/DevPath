import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { Wrapped } from "@/components/wrapped/wrapped";

export const metadata: Metadata = {
  title: "Wrapped · DevPath",
  description: "Your DSA learning recap: XP, streaks, top topics, and your learning archetype.",
};

export default function WrappedPage() {
  return (
    <AppLayout wideContent>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Wrapped />
      </div>
    </AppLayout>
  );
}
