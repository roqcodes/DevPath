"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppState, UserData, AssessmentResult } from "@/lib/types/app";
import {
  loadAppState,
  saveAppState,
  getDefaultState,
  buildJourneyFromProgress,
  hydrateJourney,
} from "@/lib/store/app-store";
import { calculateAssessmentResult } from "@/lib/mock/assessment";

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  updateUser: (user: Partial<UserData>) => void;
  setAssessmentAnswer: (questionId: string, answerIndex: number) => void;
  submitAssessment: () => AssessmentResult;
  completePreferences: (prefs: Partial<UserData>) => void;
  generateJourney: () => Promise<void>;
  completeCheckpoint: (checkpointId: string, nextCheckpointId?: string) => void;
  useHint: (checkpointId: string) => void;
  setQuizScore: (quizId: string, score: number) => void;
  completeProjectStage: (stageId: string) => void;
  completeProject: () => void;
  earnCertificate: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = hydrateJourney(loadAppState());
    setState(loaded);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AppState) => {
    setState(next);
    saveAppState(next);
  }, []);

  const updateUser = useCallback(
    (user: Partial<UserData>) => {
      persist({ ...state, user: { ...state.user, ...user } });
    },
    [state, persist]
  );

  const setAssessmentAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      persist({
        ...state,
        assessmentAnswers: { ...state.assessmentAnswers, [questionId]: answerIndex },
      });
    },
    [state, persist]
  );

  const submitAssessment = useCallback(() => {
    const result = calculateAssessmentResult(state.assessmentAnswers);
    const next: AppState = {
      ...state,
      assessmentResult: result,
      progress: { ...state.progress, assessmentComplete: true },
    };
    persist(next);
    return result;
  }, [state, persist]);

  const completePreferences = useCallback(
    (prefs: Partial<UserData>) => {
      const next: AppState = {
        ...state,
        user: { ...state.user, ...prefs },
        progress: {
          ...state.progress,
          preferencesComplete: true,
          onboardingComplete: true,
        },
      };
      persist(next);
    },
    [state, persist]
  );

  const generateJourney = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 3200));
    const progress = {
      ...state.progress,
      journeyGenerated: true,
    };
    const next: AppState = {
      ...state,
      progress,
      journey: buildJourneyFromProgress(progress),
    };
    persist(next);
  }, [state, persist]);

  const completeCheckpoint = useCallback(
    (checkpointId: string, nextCheckpointId?: string) => {
      const completed = state.progress.completedCheckpoints.includes(checkpointId)
        ? state.progress.completedCheckpoints
        : [...state.progress.completedCheckpoints, checkpointId];
      const progress = {
        ...state.progress,
        completedCheckpoints: completed,
        currentCheckpointId: nextCheckpointId ?? checkpointId,
        xp: state.progress.xp + 120,
        readinessScore: Math.min(100, state.progress.readinessScore + 3),
      };
      persist({
        ...state,
        progress,
        journey: state.progress.journeyGenerated ? buildJourneyFromProgress(progress) : state.journey,
      });
    },
    [state, persist]
  );

  const useHint = useCallback(
    (checkpointId: string) => {
      const count = (state.progress.hintsUsed[checkpointId] ?? 0) + 1;
      persist({
        ...state,
        progress: {
          ...state.progress,
          hintsUsed: { ...state.progress.hintsUsed, [checkpointId]: count },
        },
      });
    },
    [state, persist]
  );

  const setQuizScore = useCallback(
    (quizId: string, score: number) => {
      persist({
        ...state,
        progress: {
          ...state.progress,
          quizScores: { ...state.progress.quizScores, [quizId]: score },
        },
      });
    },
    [state, persist]
  );

  const completeProjectStage = useCallback(
    (stageId: string) => {
      const stages = state.progress.projectStagesCompleted.includes(stageId)
        ? state.progress.projectStagesCompleted
        : [...state.progress.projectStagesCompleted, stageId];
      persist({
        ...state,
        progress: { ...state.progress, projectStagesCompleted: stages },
      });
    },
    [state, persist]
  );

  const completeProject = useCallback(() => {
    persist({
      ...state,
      progress: { ...state.progress, projectComplete: true },
    });
  }, [state, persist]);

  const earnCertificate = useCallback(() => {
    persist({
      ...state,
      progress: { ...state.progress, certificateEarned: true },
    });
  }, [state, persist]);

  const resetDemo = useCallback(() => {
    const fresh = getDefaultState();
    persist(fresh);
  }, [persist]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      updateUser,
      setAssessmentAnswer,
      submitAssessment,
      completePreferences,
      generateJourney,
      completeCheckpoint,
      useHint,
      setQuizScore,
      completeProjectStage,
      completeProject,
      earnCertificate,
      resetDemo,
    }),
    [
      state,
      hydrated,
      updateUser,
      setAssessmentAnswer,
      submitAssessment,
      completePreferences,
      generateJourney,
      completeCheckpoint,
      useHint,
      setQuizScore,
      completeProjectStage,
      completeProject,
      earnCertificate,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
