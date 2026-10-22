import type { SyllabusLesson, SyllabusModule } from "@/lib/types/sait";
import { CURRICULUM_MODULES } from "./module-defs";
import type { DsaLessonContent, VisualizerKind } from "./types";
import { FOUNDATIONS_LESSONS } from "./content/foundations";
import { ARRAYS_LESSONS } from "./content/arrays-strings";
import { SEARCH_SORT_LESSONS } from "./content/search-sort";
import { HASHING_LESSONS } from "./content/hashing";
import { LINKED_LISTS_LESSONS } from "./content/linked-lists";
import { STACKS_QUEUES_LESSONS } from "./content/stacks-queues";
import { RECURSION_LESSONS } from "./content/recursion-backtracking";
import { TREES_HEAPS_LESSONS } from "./content/trees-heaps";
import { GRAPHS_LESSONS } from "./content/graphs";
import { GREEDY_LESSONS } from "./content/greedy";
import { DP_LESSONS } from "./content/dynamic-programming";
import { INTERVIEW_LESSONS } from "./content/interview-prep";
import { buildStubLesson } from "./content/stub-builder";

const DETAILED: Record<string, DsaLessonContent> = {
  ...FOUNDATIONS_LESSONS,
  ...ARRAYS_LESSONS,
  ...SEARCH_SORT_LESSONS,
  ...HASHING_LESSONS,
  ...LINKED_LISTS_LESSONS,
  ...STACKS_QUEUES_LESSONS,
  ...RECURSION_LESSONS,
  ...TREES_HEAPS_LESSONS,
  ...GRAPHS_LESSONS,
  ...GREEDY_LESSONS,
  ...DP_LESSONS,
  ...INTERVIEW_LESSONS,
};

/** Detect generic Phase-4 stub copy (should not appear after Phase 5). */
export const STUB_HOOK_PREFIX = 'Why does "';

export function lessonId(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}--${lessonSlug}`;
}

export function getCurriculumModule(slug: string) {
  return CURRICULUM_MODULES.find((m) => m.slug === slug);
}

export function getLessonContentById(id: string): DsaLessonContent | null {
  const sep = id.indexOf("--");
  if (sep === -1) return null;
  return getLessonContent(id.slice(0, sep), id.slice(sep + 2));
}

export function getLessonContent(moduleSlug: string, lessonSlug: string): DsaLessonContent | null {
  const key = lessonSlug;
  if (DETAILED[key] && DETAILED[key].moduleSlug === moduleSlug) return DETAILED[key];

  const mod = getCurriculumModule(moduleSlug);
  const meta = mod?.lessons.find((l) => l.slug === lessonSlug);
  if (!mod || !meta) return null;

  return buildStubLesson(
    moduleSlug,
    lessonSlug,
    meta.title,
    meta.minutes,
    (meta.visualizer as VisualizerKind) ?? "none",
    []
  );
}

export function isStubLessonContent(content: DsaLessonContent): boolean {
  return content.learn.hook.startsWith(STUB_HOOK_PREFIX);
}

export function getAllLessonPaths(): { moduleSlug: string; lessonSlug: string; id: string }[] {
  const paths: { moduleSlug: string; lessonSlug: string; id: string }[] = [];
  for (const mod of CURRICULUM_MODULES) {
    for (const les of mod.lessons) {
      paths.push({ moduleSlug: mod.slug, lessonSlug: les.slug, id: lessonId(mod.slug, les.slug) });
    }
  }
  return paths;
}

function toSyllabusLesson(modSlug: string, meta: { slug: string; title: string; minutes: number }): SyllabusLesson {
  const content = getLessonContent(modSlug, meta.slug);
  const body = content?.learn.summary ?? meta.title;
  return {
    id: lessonId(modSlug, meta.slug),
    slug: meta.slug,
    title: meta.title,
    estimatedMinutes: meta.minutes,
    practiceProblemIds: content?.practiceProblemIds ?? [],
    sections: [
      { type: "concept", title: "Learn", body: content?.learn.hook ?? body },
      { type: "example", title: "Example", body: content?.examples.title ?? "Worked example" },
      { type: "complexity", title: "Complexity", body: content?.complexity.time ?? "See lesson workspace." },
      { type: "practice", title: "Practice", body: content?.practice.warmup ?? "Practice in workspace." },
      { type: "checkpoint", title: "Review", body: "Complete the knowledge check in the workspace." },
    ],
  };
}

export const DSA_SYLLABUS: SyllabusModule[] = CURRICULUM_MODULES.map((m) => ({
  id: m.slug,
  slug: m.slug,
  title: m.title,
  description: m.description,
  sortOrder: m.sortOrder,
  prerequisiteModuleIds: m.prerequisiteModuleIds,
  difficultyRange: m.difficultyRange,
  estimatedHours: m.estimatedHours,
  topicTags: m.topicTags,
  lessons: m.lessons.map((l) => toSyllabusLesson(m.slug, l)),
}));

export function getModule(slug: string): SyllabusModule | undefined {
  return DSA_SYLLABUS.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  return mod?.lessons.find((l) => l.slug === lessonSlug);
}

export function getNextLesson(moduleSlug: string, lessonSlug: string): { moduleSlug: string; lessonSlug: string } | null {
  const mod = getModule(moduleSlug);
  if (!mod) return null;
  const idx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx >= 0 && idx < mod.lessons.length - 1) {
    return { moduleSlug, lessonSlug: mod.lessons[idx + 1].slug };
  }
  const modIdx = DSA_SYLLABUS.findIndex((m) => m.slug === moduleSlug);
  for (let i = modIdx + 1; i < DSA_SYLLABUS.length; i++) {
    const next = DSA_SYLLABUS[i];
    if (next.lessons[0]) return { moduleSlug: next.slug, lessonSlug: next.lessons[0].slug };
  }
  return null;
}

export function getPrevLesson(moduleSlug: string, lessonSlug: string): { moduleSlug: string; lessonSlug: string } | null {
  const mod = getModule(moduleSlug);
  if (!mod) return null;
  const idx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx > 0) return { moduleSlug, lessonSlug: mod.lessons[idx - 1].slug };
  const modIdx = DSA_SYLLABUS.findIndex((m) => m.slug === moduleSlug);
  if (modIdx > 0) {
    const prev = DSA_SYLLABUS[modIdx - 1];
    const last = prev.lessons[prev.lessons.length - 1];
    if (last) return { moduleSlug: prev.slug, lessonSlug: last.slug };
  }
  return null;
}

export function getNextIncompleteLesson(completedLessonIds: string[]): { moduleSlug: string; lessonSlug: string } | null {
  for (const mod of DSA_SYLLABUS) {
    for (const les of mod.lessons) {
      if (!completedLessonIds.includes(les.id)) {
        return { moduleSlug: mod.slug, lessonSlug: les.slug };
      }
    }
  }
  return null;
}

export function syllabusProgress(completedLessonIds: string[]): number {
  const total = DSA_SYLLABUS.reduce((n, m) => n + m.lessons.length, 0);
  if (total === 0) return 0;
  const done = completedLessonIds.filter((id) =>
    DSA_SYLLABUS.some((m) => m.lessons.some((l) => l.id === id))
  ).length;
  return Math.round((done / total) * 100);
}

export function moduleProgress(moduleSlug: string, completedLessonIds: string[]): number {
  const mod = getModule(moduleSlug);
  if (!mod || mod.lessons.length === 0) return 0;
  const done = mod.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  return Math.round((done / mod.lessons.length) * 100);
}

export function isModuleLocked(moduleSlug: string, completedLessonIds: string[]): boolean {
  const mod = getCurriculumModule(moduleSlug);
  if (!mod) return true;
  return mod.prerequisiteModuleIds.some((pre) => {
    const preMod = getModule(pre);
    if (!preMod) return true;
    const allDone = preMod.lessons.every((l) => completedLessonIds.includes(l.id));
    return !allDone;
  });
}
