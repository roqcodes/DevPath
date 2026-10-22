"use client";

import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AchievementGrid,
  LevelBadge,
  QuestList,
  StreakCalendar,
  StreakFlame,
  XpBar,
} from "@/components/progression";

export default function AchievementsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Trophy className="h-7 w-7 text-amber-500" aria-hidden />
            Progress & achievements
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-border/80 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Streak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StreakFlame size="lg" />
              <StreakCalendar weeks={8} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/80 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Level & XP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LevelBadge />
              <XpBar />
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Quests</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestList />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementGrid />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
