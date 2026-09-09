"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJourneyAIInsight } from "@/lib/mock/intelligence";

export function AIInsightPanel() {
  const insight = getJourneyAIInsight();

  return (
    <div className="mb-6 rounded-lg border border-accent/25 bg-gradient-to-r from-accent/[0.05] to-transparent p-5 animate-fade-in hover-lift">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
            AI recommends your next step
          </p>
          <p className="text-sm leading-relaxed">{insight.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href={`/workspace/${insight.recommendedCheckpointSlug}`}>
                Continue recommended path
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="#journey-timeline">View full journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
