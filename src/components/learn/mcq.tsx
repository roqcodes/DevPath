"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { McqItem } from "./practice-types";

export function Mcq({
  item,
  onAnswer,
  disabled,
}: {
  item: McqItem;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = (id: string) => {
    if (disabled || revealed) return;
    setChosen(id);
    setRevealed(true);
    onAnswer(id === item.correctOptionId);
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-semibold text-slate-900 mb-2">{item.prompt}</legend>
      {item.options.map((o) => {
        const isChosen = chosen === o.id;
        const isCorrect = o.id === item.correctOptionId;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => submit(o.id)}
            className={cn(
              "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              !revealed && "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40",
              revealed && isCorrect && "border-emerald-300 bg-emerald-50",
              revealed && isChosen && !isCorrect && "border-rose-300 bg-rose-50"
            )}
          >
            <span className="font-mono text-xs text-slate-400">{o.id}.</span>
            <span>{o.label}</span>
          </button>
        );
      })}
      {revealed && (
        <p className="text-xs text-slate-600 mt-2 border-t border-slate-100 pt-2">{item.explanation}</p>
      )}
    </fieldset>
  );
}
