"use client";

import { Flame, Calendar, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { Progress } from "@/components/ui/progress";
import { getLearningIntelligence } from "@/lib/mock/intelligence";
import { useApp } from "@/lib/context/app-context";
import { getMockJourney } from "@/lib/mock/journey";

export function LearningIntelligence() {
  const { state } = useApp();
  const journey = state.journey
    ?? getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId);
  const intel = getLearningIntelligence(state.progress, journey.progress);

  const stats = [
    { icon: TrendingUp, label: "Journey", value: `${intel.journeyProgress}%` },
    { icon: Flame, label: "Streak", value: `${intel.streak} days` },
    { icon: Calendar, label: "Remaining", value: `${intel.daysRemaining} days` },
    { icon: Zap, label: "Level", value: intel.competencyLevel },
  ];

  return (
    <Card className="hover-lift overflow-hidden border-accent/20 bg-gradient-to-br from-accent/[0.04] to-transparent">
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Learning Intelligence
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <ReadinessRing score={intel.readinessScore} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">DevOps Readiness</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {intel.readinessScore}
                <span className="text-lg text-muted-foreground font-normal"> / 100</span>
              </p>
              <p className="text-sm text-accent mt-2 max-w-xs">{intel.paceMessage}</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card/80 p-3">
                <s.icon className="h-4 w-4 text-accent mb-2" />
                <p className="text-lg font-semibold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Progress value={intel.journeyProgress} label="Journey completion" showLabel />
        </div>
      </CardContent>
    </Card>
  );
}
