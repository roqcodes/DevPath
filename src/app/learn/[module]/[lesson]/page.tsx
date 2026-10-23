"use client";

import { use } from "react";
import { DsaLessonWorkspace } from "@/components/dsa-workspace/dsa-lesson-workspace";

export default function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleSlug, lesson: lessonSlug } = use(params);
  return <DsaLessonWorkspace moduleSlug={moduleSlug} lessonSlug={lessonSlug} />;
}
