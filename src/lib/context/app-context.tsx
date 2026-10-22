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
import type { AppState, UserData } from "@/lib/types/app";
import { loadAppState, saveAppState, getDefaultState } from "@/lib/store/app-store";
import type { SubmissionRecord } from "@/lib/types/sait";
import { computeRankingScore } from "@/lib/services/ranking-service";
import { lessonVisitProgressPatch } from "@/lib/learning/lesson-progress-semantics";
import { todayIsoDate } from "@/lib/utils";
import { dispatchEngine } from "@/lib/engine/store";

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  updateUser: (user: Partial<UserData>) => void;
  completeOnboarding: (user: Partial<UserData>) => void;
  completeLesson: (lessonId: string, mastery?: boolean) => void;
  recordLessonVisit: (moduleSlug: string, lessonSlug: string, lessonId: string) => void;
  submitLessonQuiz: (lessonId: string, correctCount: number, minRequired: number) => boolean;
  confirmLessonCheckpoint: (lessonId: string) => void;
  toggleBookmark: (problemId: string) => void;
  revealHint: (problemId: string) => void;
  recordSubmission: (submission: SubmissionRecord, accepted: boolean) => void;
  setLastActiveProblem: (problemId: string) => void;
  addPracticeMinutes: (minutes: number) => void;
  setWeeklyGoal: (count: number) => void;
  toggleProfilePublic: (value: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function bumpStreak(progress: AppState["progress"]): number {
  const today = todayIsoDate();
  if (progress.lastPracticeDate === today) return progress.streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  if (progress.lastPracticeDate === y) return progress.streak + 1;
  return 1;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadAppState();
    setState(loaded);
    setHydrated(true);
    Promise.all([fetch("/api/me"), fetch("/api/progress")])
      .then(async ([meRes, progressRes]) => {
        const meData = await meRes.json().catch(() => ({}));
        const progressData = await progressRes.json().catch(() => ({}));
        setState((prev) => {
          let next = { ...prev };
          const profile = meData?.profile;
          if (profile) {
            next = {
              ...next,
              user: {
                ...next.user,
                name: profile.fullName || next.user.name,
                displayName: profile.displayName || next.user.displayName,
                email: profile.email || next.user.email,
                phone: profile.phone ?? next.user.phone,
                department: profile.department || next.user.department,
                admissionCohort: profile.admissionCohort || next.user.admissionCohort,
                academicYear: profile.academicYear || next.user.academicYear,
                batch: profile.batch || next.user.batch,
                studentId: profile.studentId ?? next.user.studentId,
                profilePublic: profile.profilePublic,
                weeklyGoalProblems: profile.weeklyGoalProblems,
                preferredLanguage: profile.preferredLanguage || next.user.preferredLanguage,
                dsaExperience: profile.dsaExperience ?? next.user.dsaExperience,
              },
              progress: {
                ...next.progress,
                onboardingComplete: Boolean(meData.onboardingComplete),
                rankingScore: profile.rankingScore ?? next.progress.rankingScore,
                streak: profile.currentStreak ?? next.progress.streak,
              },
            };
          }
          if (progressData?.progress) {
            next = {
              ...next,
              progress: {
                ...next.progress,
                ...progressData.progress,
                dailyGoal: { ...next.progress.dailyGoal, ...progressData.progress.dailyGoal },
                onboardingComplete: next.progress.onboardingComplete,
                rankingScore:
                  progressData.progress.rankingScore ?? next.progress.rankingScore,
                streak: next.progress.streak,
              },
            };
          }
          return next;
        });
      })
      .catch(() => undefined);
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

  const completeOnboarding = useCallback(
    (user: Partial<UserData>) => {
      persist({
        ...state,
        user: { ...state.user, ...user },
        progress: { ...state.progress, onboardingComplete: true },
      });
      dispatchEngine({
        type: "onboarding_completed",
        goal: "dsa_mastery",
        level: user.dsaExperience ?? "beginner",
        minutesPerDay: 20,
      });
    },
    [state, persist]
  );

  const recordLessonVisit = useCallback(
    (moduleSlug: string, lessonSlug: string, lessonId: string) => {
      setState((prev) => {
        const patch = lessonVisitProgressPatch(
          prev.progress,
          moduleSlug,
          lessonSlug,
          lessonId
        );
        if (!patch) return prev;
        const firstView =
          patch.viewedLessons.length > prev.progress.viewedLessons.length;
        const next = {
          ...prev,
          progress: { ...prev.progress, ...patch },
        };
        saveAppState(next);
        if (firstView) {
          dispatchEngine({
            type: "lesson_viewed",
            lessonId,
            moduleSlug,
            lessonSlug,
          });
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "lesson_viewed", lessonId }),
          }).catch(() => undefined);
        }
        return next;
      });
    },
    []
  );

  const completeLesson = useCallback(
    (lessonId: string, mastery = false) => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lesson_complete", lessonId, mastery }),
      }).catch(() => undefined);
      const completed = state.progress.completedLessons.includes(lessonId)
        ? state.progress.completedLessons
        : [...state.progress.completedLessons, lessonId];
      const today = todayIsoDate();
      const daily =
        state.progress.dailyGoal.date === today
          ? state.progress.dailyGoal
          : {
              ...state.progress.dailyGoal,
              date: today,
              completedLessons: 0,
              completedProblems: 0,
              reviewDone: false,
            };
      persist({
        ...state,
        progress: {
          ...state.progress,
          completedLessons: completed,
          lessonMastery: mastery
            ? { ...state.progress.lessonMastery, [lessonId]: true }
            : state.progress.lessonMastery,
          dailyGoal: { ...daily, completedLessons: daily.completedLessons + 1 },
          lastPracticeDate: today,
          streak: bumpStreak(state.progress),
        },
      });
      const mod = state.progress.lastVisitedLesson?.moduleSlug ?? "";
      dispatchEngine({
        type: "lesson_completed",
        lessonId,
        moduleSlug: mod,
        mastery,
      });
    },
    [state, persist]
  );

  const submitLessonQuiz = useCallback(
    (lessonId: string, correctCount: number, minRequired: number): boolean => {
      const passed = correctCount >= minRequired;
      dispatchEngine({
        type: "quiz_finished",
        quizId: lessonId,
        correct: correctCount,
        total: minRequired,
      });
      if (passed) {
        persist({
          ...state,
          progress: {
            ...state.progress,
            lessonQuizPassed: { ...state.progress.lessonQuizPassed, [lessonId]: true },
          },
        });
        if (!state.progress.completedLessons.includes(lessonId)) {
          completeLesson(lessonId, true);
        }
      }
      return passed;
    },
    [state, persist, completeLesson]
  );

  const confirmLessonCheckpoint = useCallback(
    (lessonId: string) => {
      persist({
        ...state,
        progress: {
          ...state.progress,
          lessonCheckpointDone: { ...state.progress.lessonCheckpointDone, [lessonId]: true },
        },
      });
      if (!state.progress.completedLessons.includes(lessonId)) {
        completeLesson(lessonId, false);
      }
    },
    [state, persist, completeLesson]
  );

  const toggleBookmark = useCallback(
    (problemId: string) => {
      const on = !state.progress.bookmarks.includes(problemId);
      const bookmarks = on
        ? [...state.progress.bookmarks, problemId]
        : state.progress.bookmarks.filter((id) => id !== problemId);
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bookmark", problemId, on }),
      }).catch(() => undefined);
      persist({ ...state, progress: { ...state.progress, bookmarks } });
    },
    [state, persist]
  );

  const revealHint = useCallback(
    (problemId: string) => {
      const count = (state.progress.hintsRevealed[problemId] ?? 0) + 1;
      persist({
        ...state,
        progress: {
          ...state.progress,
          hintsRevealed: { ...state.progress.hintsRevealed, [problemId]: count },
        },
      });
    },
    [state, persist]
  );

  const recordSubmission = useCallback(
    (submission: SubmissionRecord, accepted: boolean) => {
      const attempted = state.progress.attemptedProblems.includes(submission.problemId)
        ? state.progress.attemptedProblems
        : [...state.progress.attemptedProblems, submission.problemId];
      let solved = state.progress.solvedProblems;
      if (accepted && !solved.includes(submission.problemId)) {
        solved = [...solved, submission.problemId];
      }
      const today = todayIsoDate();
      const daily =
        state.progress.dailyGoal.date === today
          ? state.progress.dailyGoal
          : {
              ...state.progress.dailyGoal,
              date: today,
              completedLessons: 0,
              completedProblems: 0,
              reviewDone: false,
            };
      const rankingScore = computeRankingScore(solved);
      persist({
        ...state,
        progress: {
          ...state.progress,
          attemptedProblems: attempted,
          solvedProblems: solved,
          submissions: [submission, ...state.progress.submissions].slice(0, 50),
          rankingScore,
          lastActiveProblemId: submission.problemId,
          lastPracticeDate: today,
          streak: bumpStreak(state.progress),
          dailyGoal: accepted
            ? { ...daily, completedProblems: daily.completedProblems + 1 }
            : daily,
        },
      });
      dispatchEngine({
        type: "problem_attempted",
        problemId: submission.problemId,
        accepted,
      });
    },
    [state, persist]
  );

  const setLastActiveProblem = useCallback(
    (problemId: string) => {
      persist({ ...state, progress: { ...state.progress, lastActiveProblemId: problemId } });
    },
    [state, persist]
  );

  const addPracticeMinutes = useCallback(
    (minutes: number) => {
      if (minutes <= 0) return;
      persist({
        ...state,
        progress: {
          ...state.progress,
          activeMinutesThisWeek: state.progress.activeMinutesThisWeek + minutes,
          activeMinutesLast30Days: state.progress.activeMinutesLast30Days + minutes,
          lastPracticeDate: todayIsoDate(),
        },
      });
    },
    [state, persist]
  );

  const setWeeklyGoal = useCallback(
    (count: number) => {
      persist({ ...state, user: { ...state.user, weeklyGoalProblems: count } });
    },
    [state, persist]
  );

  const toggleProfilePublic = useCallback(
    (value: boolean) => {
      persist({ ...state, user: { ...state.user, profilePublic: value } });
    },
    [state, persist]
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      updateUser,
      completeOnboarding,
      completeLesson,
      recordLessonVisit,
      submitLessonQuiz,
      confirmLessonCheckpoint,
      toggleBookmark,
      revealHint,
      recordSubmission,
      setLastActiveProblem,
      addPracticeMinutes,
      setWeeklyGoal,
      toggleProfilePublic,
    }),
    [
      state,
      hydrated,
      updateUser,
      completeOnboarding,
      completeLesson,
      recordLessonVisit,
      submitLessonQuiz,
      confirmLessonCheckpoint,
      toggleBookmark,
      revealHint,
      recordSubmission,
      setLastActiveProblem,
      addPracticeMinutes,
      setWeeklyGoal,
      toggleProfilePublic,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
