"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SimpleCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  dark?: boolean;
  "aria-label"?: string;
}

export function SimpleCodeEditor({
  value,
  onChange,
  className,
  dark = false,
  "aria-label": ariaLabel = "Code editor",
}: SimpleCodeEditorProps) {
  const lines = useMemo(() => value.split("\n"), [value]);
  const lineCount = Math.max(lines.length, 1);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const insert = "  ";
        const next = value.slice(0, start) + insert + value.slice(end);
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + insert.length;
        });
      }
    },
    [onChange, value]
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 overflow-hidden rounded-md border font-mono text-xs leading-relaxed",
        dark ? "border-[#333] bg-[#1e1e1e] text-[#d4d4d4]" : "border-border bg-muted/20",
        className
      )}
    >
      <div
        className={cn(
          "select-none shrink-0 overflow-hidden py-3 pr-2 pl-2 text-right tabular-nums",
          dark ? "text-[#666] border-r border-[#333]" : "text-muted-foreground border-r border-border"
        )}
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        className={cn(
          "flex-1 min-h-[120px] w-full resize-none bg-transparent p-3 focus:outline-none",
          dark ? "text-[#d4d4d4]" : ""
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        aria-label={ariaLabel}
      />
    </div>
  );
}
