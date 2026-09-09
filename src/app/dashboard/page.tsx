"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkillBars } from "@/components/shared/skill-bars";
import { LearningIntelligence } from "@/components/dashboard/learning-intelligence";
import { AILearningPlanCard } from "@/components/dashboard/ai-learning-plan";
import { useApp } from "@/lib/context/app-context";
import { getGreeting } from "@/lib/utils";
import { getMockJourney } from "@/lib/mock/journey";
import { ACHIEVEMENTS } from "@/lib/mock/skills";

export default function DashboardPage() {
  const { state } = useApp();
  const journey = state.journey
    ?? getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId);
  const currentCp = journey.phases.flatMap((p) => p.checkpoints).find((c) => c.status === "current");
  const firstName = state.user.name.split(" ")[0];

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Command center for your personalized DevOps training path.
        </p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <LearningIntelligence />
        <AILearningPlanCard />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {currentCp && (
              <Card className="hover-lift border-accent/30 bg-accent/[0.03]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Current Mission</CardTitle>
                    <Badge variant="default">In progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-1">{currentCp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{currentCp.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {currentCp.estimatedMinutes} min · +42 XP
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

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base">Skill Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillBars skills={state.assessmentResult?.skills} compact />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base">Journey Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={journey.progress} className="mb-4" />
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/journey">View full journey</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift">
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
