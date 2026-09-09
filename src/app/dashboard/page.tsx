"use client";

import Link from "next/link";
import { ArrowRight, Flame, Trophy, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkillBars } from "@/components/shared/skill-bars";
import { useApp } from "@/lib/context/app-context";
import { getGreeting } from "@/lib/utils";
import { getMockJourney } from "@/lib/mock/journey";
import { ACHIEVEMENTS } from "@/lib/mock/skills";
import { buildJourneyFromProgress } from "@/lib/store/app-store";

export default function DashboardPage() {
  const { state } = useApp();
  const journey = state.journey
    ?? getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId);
  const currentCp = journey.phases.flatMap((p) => p.checkpoints).find((c) => c.status === "current");
  const firstName = state.user.name.split(" ")[0];

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          You&apos;re {journey.progress}% through your DevOps journey.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {currentCp && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Current Mission</CardTitle>
                  <Badge variant="default">In progress</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-1">{currentCp.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{currentCp.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {currentCp.estimatedMinutes} min
                  </span>
                  <Button asChild>
                    <Link href={`/workspace/${currentCp.moduleSlug}`}>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillBars
                skills={state.assessmentResult?.skills}
                compact
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journey Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={journey.progress} className="mb-4" />
              <div className="space-y-2">
                {journey.phases.slice(0, 3).map((phase) => {
                  const cp = phase.checkpoints.find((c) => c.status === "current" || c.status === "completed");
                  if (!cp) return null;
                  return (
                    <div key={phase.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phase {phase.number}: {phase.title}</span>
                      <Badge variant={cp.status === "completed" ? "success" : "default"} className="text-[10px]">
                        {cp.status === "completed" ? "Done" : "Active"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/journey">View full journey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">7</p>
                  <p className="text-xs text-muted-foreground">Day streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.id} className="flex items-start justify-between text-sm">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{a.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {journey.phases
                .flatMap((p) => p.checkpoints)
                .filter((c) => c.status === "locked")
                .slice(0, 3)
                .map((cp) => (
                  <div key={cp.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cp.title}</span>
                    <span className="text-xs text-muted-foreground">{cp.estimatedMinutes}m</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
