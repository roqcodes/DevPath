"use client";

import Link from "next/link";
import { Check, Lock, Circle, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { JourneyData, JourneyCheckpoint } from "@/lib/types/app";
import { cn } from "@/lib/utils";
import { TOPIC_LABELS } from "@/lib/data/devops-topics";

function StatusIcon({ status }: { status: JourneyCheckpoint["status"] }) {
  if (status === "completed") return <Check className="h-4 w-4 text-success" />;
  if (status === "current") return <Circle className="h-4 w-4 fill-accent text-accent" />;
  if (status === "locked") return <Lock className="h-4 w-4 text-muted-foreground" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

interface JourneyTimelineProps {
  journey: JourneyData;
  userName: string;
  learningGoal: string;
  dailyCommitment: string;
}

export function JourneyTimeline({ journey, userName, learningGoal, dailyCommitment }: JourneyTimelineProps) {
  const currentCheckpoint = journey.phases
    .flatMap((p) => p.checkpoints)
    .find((c) => c.status === "current");

  const mastered = journey.phases
    .flatMap((p) => p.checkpoints)
    .filter((c) => c.status === "completed").length;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        {journey.phases.map((phase) => (
          <div key={phase.id}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Phase {phase.number}
              </span>
              <h3 className="font-semibold">{phase.title}</h3>
            </div>

            <div className="relative space-y-0">
              {phase.checkpoints.map((cp, i) => (
                <div key={cp.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < phase.checkpoints.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      cp.status === "current" && "border-accent bg-accent/10",
                      cp.status === "completed" && "border-success/30 bg-success/10",
                      cp.status === "locked" && "border-border bg-muted",
                    )}
                  >
                    <StatusIcon status={cp.status} />
                  </div>

                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-4 transition-colors",
                      cp.status === "current"
                        ? "border-accent/50 bg-accent/5"
                        : cp.status === "locked"
                        ? "border-border bg-muted/20 opacity-60"
                        : "border-border bg-card hover:border-accent/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{cp.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{cp.description}</p>
                      </div>
                      {cp.status !== "locked" && (
                        <Button variant={cp.status === "current" ? "default" : "outline"} size="sm" asChild>
                          <Link href={`/workspace/${cp.moduleSlug}`}>
                            {cp.status === "completed" ? "Review" : "Start"}
                          </Link>
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {TOPIC_LABELS[cp.domain]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="mr-1 h-3 w-3" />
                        {cp.estimatedMinutes} min
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{cp.difficulty}</Badge>
                      {cp.type === "quiz" && <Badge variant="outline" className="text-[10px]">Quiz</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5 sticky top-6">
          <h3 className="font-semibold mb-4">Journey Summary</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Learner</dt>
              <dd className="font-medium">{userName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Learning goal</dt>
              <dd className="font-medium">{learningGoal}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Daily commitment</dt>
              <dd className="font-medium">{dailyCommitment}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estimated completion</dt>
              <dd className="font-medium">{journey.estimatedCompletion}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Checkpoints mastered</dt>
              <dd className="font-medium">{mastered}</dd>
            </div>
          </dl>

          {currentCheckpoint && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Current checkpoint</p>
              <p className="text-sm font-medium mb-3">{currentCheckpoint.title}</p>
              <Button className="w-full" asChild>
                <Link href={`/workspace/${currentCheckpoint.moduleSlug}`}>
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function JourneyHeader({ journey }: { journey: JourneyData }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{journey.title}</h1>
      <p className="mt-1 text-muted-foreground">
        {journey.durationDays}-day personalized path
      </p>
      <div className="mt-4 max-w-md">
        <Progress value={journey.progress} label="Progress" showLabel />
      </div>
    </div>
  );
}
