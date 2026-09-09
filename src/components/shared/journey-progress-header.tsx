"use client";

import { getMockSkillScores } from "@/lib/mock/skills";
import { useApp } from "@/lib/context/app-context";
import { getMockJourney } from "@/lib/mock/journey";

export function JourneyProgressHeader() {
  const { state } = useApp();
  const journey = state.journey
    ?? getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId);
  const skills = state.assessmentResult?.skills ?? getMockSkillScores();

  return (
    <div className="border-b border-border bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-4 overflow-x-auto text-[11px]">
        <span className="shrink-0 font-semibold uppercase tracking-wider text-muted-foreground">
          DevOps Journey
        </span>
        <span className="shrink-0 font-bold tabular-nums text-accent">{journey.progress}%</span>
        <div className="flex items-center gap-3 min-w-0">
          {skills.map((s) => (
            <div key={s.domain} className="flex items-center gap-1.5 shrink-0">
              <span className="text-muted-foreground w-14 truncate">{s.label}</span>
              <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent/70 transition-all duration-500"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
