"use client";

import { useState } from "react";
import { ChevronRight, Lightbulb, Send, Sparkles, Target, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMockMentorContext, getMockMentorResponse } from "@/lib/mock/mentor";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

interface MentorPanelProps {
  moduleSlug: string;
  checkpointId: string;
  checkpointNumber?: number;
}

export function MentorPanel({ moduleSlug, checkpointId, checkpointNumber = 3 }: MentorPanelProps) {
  const { useHint } = useApp();
  const ctx = getMockMentorContext(moduleSlug);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "mentor" | "user"; text: string }[]>([]);

  const revealNextHint = () => {
    if (revealedHints < ctx.hints.length) {
      setRevealedHints((h) => h + 1);
      useHint(checkpointId);
    }
  };

  const askMentor = () => {
    if (!query.trim()) return;
    const userMsg = query.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setQuery("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "mentor", text: getMockMentorResponse(userMsg, moduleSlug) },
      ]);
    }, 400);
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3 bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Mentor</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                <span className="text-[10px] text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Checkpoint {String(checkpointNumber).padStart(2, "0")}
          </p>
          <p className="text-sm font-medium">{ctx.moduleTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prove that you understand isolated development.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Objective
          </div>
          <p className="text-sm leading-relaxed">{ctx.intro}</p>
        </div>

        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent mb-1">
            <Target className="h-3.5 w-3.5" />
            Current task
          </div>
          <p className="text-sm">{ctx.task}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Progressive hints
          </p>
          {ctx.hints.slice(0, revealedHints).map((hint) => (
            <div key={hint.id} className="flex gap-2 rounded-md border border-border bg-muted/20 p-2.5 text-sm animate-fade-in">
              <span className="text-xs font-medium text-warning shrink-0">H{hint.id}</span>
              <p>{hint.text}</p>
            </div>
          ))}
          {revealedHints < ctx.hints.length && (
            <Button variant="outline" size="sm" className="w-full" onClick={revealNextHint}>
              <ChevronRight className="h-3.5 w-3.5" />
              Reveal Hint {revealedHints + 1}
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-accent/25 bg-gradient-to-r from-accent/[0.06] to-transparent p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent mb-1">
            <Zap className="h-3.5 w-3.5" />
            AI insight
          </div>
          <p className="text-sm text-muted-foreground">
            Focus on creating an isolated branch — this mirrors real team workflows where features never touch main directly.
          </p>
        </div>

        {showSolution && (
          <div className="rounded-md border border-accent/30 bg-accent/5 p-3 animate-fade-in">
            <p className="text-xs font-medium text-accent mb-1">Solution</p>
            <code className="font-mono text-sm">{ctx.solution}</code>
          </div>
        )}

        {!showSolution && revealedHints >= ctx.hints.length && (
          <Button variant="ghost" size="sm" onClick={() => setShowSolution(true)}>
            Reveal solution
          </Button>
        )}

        {messages.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md p-2.5 text-sm animate-fade-in",
                  msg.role === "user" ? "ml-3 bg-muted/50" : "mr-3 border border-border bg-muted/20"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-muted/10">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this checkpoint..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askMentor()}
            aria-label="Ask mentor"
            className="text-sm"
          />
          <Button size="icon" onClick={askMentor} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
