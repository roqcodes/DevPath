/** Lesson visit tracking must not imply completion. */
export function applyLessonVisit(
  viewedLessons: string[],
  lessonId: string
): { viewedLessons: string[]; completesLesson: false } {
  if (viewedLessons.includes(lessonId)) {
    return { viewedLessons, completesLesson: false };
  }
  return { viewedLessons: [...viewedLessons, lessonId], completesLesson: false };
}

export type LastVisitedLesson = { moduleSlug: string; lessonSlug: string };

/** Returns null when local progress already reflects this visit (avoids render loops). */
export function lessonVisitProgressPatch(
  progress: {
    viewedLessons: string[];
    lastVisitedLesson?: LastVisitedLesson | null;
  },
  moduleSlug: string,
  lessonSlug: string,
  lessonId: string
): { viewedLessons: string[]; lastVisitedLesson: LastVisitedLesson } | null {
  const { viewedLessons } = applyLessonVisit(progress.viewedLessons, lessonId);
  const last = progress.lastVisitedLesson;
  const sameVisit = last?.moduleSlug === moduleSlug && last?.lessonSlug === lessonSlug;
  const viewedChanged = viewedLessons.length !== progress.viewedLessons.length;
  if (!viewedChanged && sameVisit) return null;
  return { viewedLessons, lastVisitedLesson: { moduleSlug, lessonSlug } };
}

export function shouldCompleteLessonFromQuiz(
  passed: boolean,
  alreadyCompleted: boolean
): boolean {
  return passed && !alreadyCompleted;
}
