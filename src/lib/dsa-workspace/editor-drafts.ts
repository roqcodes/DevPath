const KEY = "sait_lesson_editor_drafts";

type DraftStore = Record<string, string>;

function draftKey(lessonId: string, language: string) {
  return `${lessonId}::${language}`;
}

function problemDraftKey(problemId: string, language: string) {
  return `problem:${problemId}::${language}`;
}

export function loadDraft(lessonId: string, language: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as DraftStore;
    return store[draftKey(lessonId, language)] ?? null;
  } catch {
    return null;
  }
}

export function saveDraft(lessonId: string, language: string, code: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const store = (raw ? JSON.parse(raw) : {}) as DraftStore;
    store[draftKey(lessonId, language)] = code;
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function loadProblemDraft(problemId: string, language: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as DraftStore;
    return store[problemDraftKey(problemId, language)] ?? null;
  } catch {
    return null;
  }
}

export function saveProblemDraft(problemId: string, language: string, code: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const store = (raw ? JSON.parse(raw) : {}) as DraftStore;
    store[problemDraftKey(problemId, language)] = code;
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}
