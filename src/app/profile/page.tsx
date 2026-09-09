"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillBars } from "@/components/shared/skill-bars";
import { useApp } from "@/lib/context/app-context";
import { getMockJourney } from "@/lib/mock/journey";
import { Award, BookOpen, Clock, Target } from "lucide-react";

export default function ProfilePage() {
  const { state } = useApp();
  const journey = state.journey ?? getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId);
  const completedCount = state.progress.completedCheckpoints.length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Your learning profile and progress.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium mt-0.5">{state.user.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium mt-0.5">{state.user.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium mt-0.5">{state.user.role}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Learning goal</dt>
                  <dd className="font-medium mt-0.5">{state.user.learningGoal}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillBars skills={state.assessmentResult?.skills} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completed Checkpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {journey.phases.flatMap((p) => p.checkpoints)
                  .filter((c) => c.status === "completed" || state.progress.completedCheckpoints.includes(c.id))
                  .map((cp) => (
                    <div key={cp.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-success" />
                        <span>{cp.title}</span>
                      </div>
                      <Badge variant="success" className="text-[10px]">Complete</Badge>
                    </div>
                  ))}
                {completedCount === 0 && (
                  <p className="text-sm text-muted-foreground">No checkpoints completed yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold tabular-nums">{journey.progress}%</p>
                  <p className="text-xs text-muted-foreground">Journey progress</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold tabular-nums">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Checkpoints completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{state.user.dailyCommitment}</p>
                  <p className="text-xs text-muted-foreground">Daily commitment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-warning" />
                Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.progress.certificateEarned || state.progress.projectComplete ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    DevOps Fundamentals — Certificate earned
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/certificate">View Certificate</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete the final project to earn your certificate.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
