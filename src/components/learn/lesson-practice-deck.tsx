"use client";

import { useCallback, useState } from "react";
import { dispatchEngine } from "@/lib/engine";
import { CompanionNote, askCompanion, type CompanionContext } from "@/components/companion";
import { celebrate } from "@/components/motion";
import { practiceItemsForModule } from "./practice-bank";
import type { PracticeItem } from "./practice-types";
import { Mcq } from "./mcq";
import { PredictOutput } from "./predict-output";
import { OrderSteps } from "./order-steps";
import { FillBlank } from "./fill-blank";
import { cn } from "@/lib/utils";

export function LessonPracticeDeck({
  moduleSlug,
  lessonTitle,
  className,
}: {
  moduleSlug: string;
  lessonTitle: string;
  className?: string;
}) {
  const items = practiceItemsForModule(moduleSlug);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongHint, setWrongHint] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const item = items[index];
  const companionCtx: CompanionContext = {
    surface: "lesson",
    subject: lessonTitle,
    detail: item?.prompt,
  };

  const handleAnswer = useCallback(
    (practiceItem: PracticeItem, correct: boolean) => {
      dispatchEngine({
        type: "quiz_answered",
        itemId: practiceItem.id,
        correct,
        topic: practiceItem.topic,
        prompt: practiceItem.prompt,
      });

      if (correct) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setWrongHint(null);
        if (nextStreak >= 3) celebrate({ kind: "small" });
        setDoneIds((s) => new Set(s).add(practiceItem.id));
        if (index < items.length - 1) {
          setTimeout(() => setIndex((i) => i + 1), 600);
        }
      } else {
        setStreak(0);
        setWrongHint(practiceItem.hint ?? practiceItem.prompt);
      }
    },
    [index, items.length, streak]
  );

  if (!item) return null;

  const finished = doneIds.size >= items.length;

  return (
    <section className={cn("rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-4", className)} aria-label="Try it practice">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-indigo-900">Try it</h3>
        <span className="text-[11px] font-medium text-indigo-600 tabular-nums">
          {Math.min(index + 1, items.length)} / {items.length}
        </span>
      </div>

      {finished ? (
        <p className="text-sm text-emerald-800 font-medium">Nice — you cleared this lesson&apos;s practice deck.</p>
      ) : (
        <>
          {item.kind === "mcq" && (
            <Mcq item={item} onAnswer={(c) => handleAnswer(item, c)} disabled={doneIds.has(item.id)} />
          )}
          {item.kind === "predict" && (
            <PredictOutput item={item} onAnswer={(c) => handleAnswer(item, c)} disabled={doneIds.has(item.id)} />
          )}
          {item.kind === "order" && (
            <OrderSteps item={item} onAnswer={(c) => handleAnswer(item, c)} disabled={doneIds.has(item.id)} />
          )}
          {item.kind === "fill" && (
            <FillBlank item={item} onAnswer={(c) => handleAnswer(item, c)} disabled={doneIds.has(item.id)} />
          )}
        </>
      )}

      {wrongHint && (
        <CompanionNote
          mood="concerned"
          className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950 space-y-2"
          actions={[
            {
              label: "Explain",
              onClick: () => askCompanion(`Help me understand: ${item.prompt}`, companionCtx),
            },
            {
              label: "Try again",
              onClick: () => setWrongHint(null),
            },
          ]}
        >
          Stuck? {wrongHint}
        </CompanionNote>
      )}
    </section>
  );
}
