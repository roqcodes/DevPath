"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { JourneyHeader, JourneyTimeline } from "@/components/journey/journey-timeline";
import { useApp } from "@/lib/context/app-context";
import { getMockJourney } from "@/lib/mock/journey";
import { buildJourneyFromProgress } from "@/lib/store/app-store";

export default function JourneyPage() {
  const { state } = useApp();
  const journey = state.journey
    ?? (state.progress.journeyGenerated
      ? buildJourneyFromProgress(state.progress)
      : getMockJourney(state.progress.completedCheckpoints, state.progress.currentCheckpointId));

  return (
    <AppLayout>
      <JourneyHeader journey={journey} />
      <JourneyTimeline
        journey={journey}
        userName={state.user.name}
        learningGoal={state.user.learningGoal}
        dailyCommitment={state.user.dailyCommitment}
      />
    </AppLayout>
  );
}
