import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CURRICULUM_MODULES } from "./module-defs";
import {
  getAllLessonPaths,
  getLessonContent,
  getModule,
  getNextLesson,
  isStubLessonContent,
  lessonId,
} from "./index";
import { PUBLISHED_QUESTIONS } from "@/lib/questions/published-meta";

const PUBLISHED_IDS = new Set(PUBLISHED_QUESTIONS.map((q) => q.id));

function validateQuiz(content: ReturnType<typeof getLessonContent>) {
  if (!content || content.completion.type !== "quiz" || !content.completion.quiz) return;
  for (const q of content.completion.quiz) {
    const ids = new Set(q.options.map((o) => o.id));
    assert.equal(ids.size, q.options.length, `duplicate option ids in ${content.id}`);
    assert.ok(ids.has(q.correctOptionId), `correct option missing in ${content.id}`);
    assert.ok(q.explanation.trim().length > 0, `explanation empty ${content.id}`);
  }
}

describe("DSA curriculum", () => {
  it("resolves every module and lesson path", () => {
    const paths = getAllLessonPaths();
    assert.equal(paths.length, 89);
    for (const p of paths) {
      assert.equal(p.id, lessonId(p.moduleSlug, p.lessonSlug));
      const mod = getModule(p.moduleSlug);
      assert.ok(mod, `module ${p.moduleSlug}`);
      const lesson = mod!.lessons.find((l) => l.slug === p.lessonSlug);
      assert.ok(lesson, `lesson ${p.lessonSlug}`);
      const content = getLessonContent(p.moduleSlug, p.lessonSlug);
      assert.ok(content, `content ${p.id}`);
      assert.equal(content!.id, p.id);
    }
  });

  it("has 12 modules", () => {
    assert.equal(CURRICULUM_MODULES.length, 12);
  });

  it("has no placeholder stub lessons after Phase 5", () => {
    for (const p of getAllLessonPaths()) {
      const content = getLessonContent(p.moduleSlug, p.lessonSlug)!;
      assert.equal(
        isStubLessonContent(content),
        false,
        `stub content remains for ${p.id}`
      );
    }
  });

  it("practiceProblemIds reference published problems only", () => {
    for (const p of getAllLessonPaths()) {
      const content = getLessonContent(p.moduleSlug, p.lessonSlug)!;
      for (const pid of content.practiceProblemIds) {
        assert.ok(PUBLISHED_IDS.has(pid), `unknown problem id ${pid} in ${content.id}`);
      }
      for (const pid of content.practice.linkedProblemIds) {
        assert.ok(PUBLISHED_IDS.has(pid), `unknown linked problem ${pid} in ${content.id}`);
      }
    }
  });

  it("validates quiz definitions", () => {
    for (const p of getAllLessonPaths()) {
      validateQuiz(getLessonContent(p.moduleSlug, p.lessonSlug));
    }
  });

  it("next lesson navigates within and across modules", () => {
    const first = CURRICULUM_MODULES[0].lessons[0];
    const next = getNextLesson("foundations", first.slug);
    assert.ok(next);
    assert.notEqual(next!.lessonSlug, first.slug);
  });

  it("every lesson has complexity.measured field", () => {
    for (const p of getAllLessonPaths()) {
      const c = getLessonContent(p.moduleSlug, p.lessonSlug)!;
      assert.ok(c.complexity.measured?.trim(), `missing measured for ${c.id}`);
    }
  });
});
