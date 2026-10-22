"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";
import { useApp } from "@/lib/context/app-context";
import { getNextIncompleteLesson } from "@/lib/data/dsa-syllabus";

export default function DashboardPage() {
  const { state } = useApp();
  const nextLesson = getNextIncompleteLesson(state.progress.completedLessons);

  const continueHref = useMemo(() => {
    if (state.progress.lastVisitedLesson) {
      return `/learn/${state.progress.lastVisitedLesson.moduleSlug}/${state.progress.lastVisitedLesson.lessonSlug}`;
    }
    if (nextLesson) {
      return `/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`;
    }
    if (state.progress.lastActiveProblemId) {
      return `/practice/${state.progress.lastActiveProblemId}`;
    }
    return "/path";
  }, [state.progress, nextLesson]);

  return (
    <AppLayout>
      <div className="space-y-8 m-page">
        <DashboardHero continueHref={continueHref} />
        <DashboardHub />
      </div>
    </AppLayout>
  );
}
