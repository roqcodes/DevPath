"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAILearningPlan } from "@/lib/mock/intelligence";

export function AILearningPlanCard() {
  const plan = getAILearningPlan();

  return (
    <Card className="hover-lift border-accent/20 bg-gradient-to-r from-accent/[0.03] via-transparent to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Your AI Learning Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your assessment, goals and available time, DevPath AI has prioritized:
            </p>
            <ol className="mt-4 space-y-2">
              {plan.priorities.map((item, i) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-md border border-accent/20 bg-accent/5 px-3 py-2.5 text-sm leading-relaxed">
              <span className="font-medium text-accent">AI insight: </span>
              {plan.insight}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
