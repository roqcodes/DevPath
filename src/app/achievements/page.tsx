"use client";

import { Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader, PageScroll, SectionBlock } from "@/components/layout/page-shell";
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
      <PageHeader
        backHref="/dashboard"
        backLabel="Dashboard"
        icon={Trophy}
        title="Progress & achievements"
        description="Streaks, levels, quests, and badges — everything that rewards showing up and finishing hard things."
      />
      <PageScroll>
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

        <SectionBlock title="Quests" description="Daily and weekly goals that pay XP when you claim them.">
          <QuestList />
        </SectionBlock>

        <SectionBlock title="Achievements" description="Milestones across lessons, practice, and consistency.">
          <AchievementGrid />
        </SectionBlock>
      </PageScroll>
    </AppLayout>
  );
}
