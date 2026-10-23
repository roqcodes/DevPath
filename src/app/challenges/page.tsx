"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader, PageScroll } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPublishedProblems } from "@/lib/problems/problem-catalog";
import { useApp } from "@/lib/context/app-context";

export default function ChallengesPage() {
  const { state } = useApp();
  const problems = listPublishedProblems();
  const dailyProblem = problems[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklyEnd = new Date(weekStart);
  weeklyEnd.setDate(weeklyEnd.getDate() + 7);

  const weeklySolved = state.progress.solvedProblems.length;
  const weeklyTarget = state.user.weeklyGoalProblems;

  return (
    <AppLayout>
      <PageHeader
        icon={Target}
        title="Challenges"
        description="Daily goals, weekly targets, and consistency tracking — small commitments that compound."
      />
      <PageScroll>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily recommended problem</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyProblem ? (
              <>
                <p className="font-medium">{dailyProblem.title}</p>
                <Badge className="mt-2" variant="outline">{dailyProblem.difficulty}</Badge>
                <Button className="mt-4" asChild>
                  <Link href={`/practice/${dailyProblem.id}`}>Solve today&apos;s problem</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No published problems yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly practice challenge</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              {weekStart.toLocaleDateString()} – {weeklyEnd.toLocaleDateString()}
            </p>
            <p>
              Progress: {weeklySolved} / {weeklyTarget} unique problems (configured goal)
            </p>
            <p className="text-muted-foreground">
              Streak: {state.progress.streak} days · Contest mode will use separate ratings later.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {state.progress.achievements.length === 0 ? (
              <p>Earn badges by completing lessons, maintaining streaks, and solving problems. (Tracked from real activity.)</p>
            ) : (
              <ul>
                {state.progress.achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      </PageScroll>
    </AppLayout>
  );
}
