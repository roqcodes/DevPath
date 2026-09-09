"use client";

import { useState } from "react";
import { Bot, ChevronRight, Lightbulb, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMockMentorContext, getMockMentorResponse } from "@/lib/mock/mentor";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

interface MentorPanelProps {
  moduleSlug: string;
  checkpointId: string;
}

export function MentorPanel({ moduleSlug, checkpointId }: MentorPanelProps) {
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
    <div className="flex h-full flex-col border-l border-border bg-card/50">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Mentor</h3>
            <p className="text-xs text-muted-foreground">Guiding you through this checkpoint</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">{ctx.moduleTitle}</Badge>
          <Badge variant="outline" className="text-[10px]">{ctx.checkpointTitle}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3 animate-fade-in">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-accent">
            <Bot className="h-3.5 w-3.5" />
            Contextual guidance
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{ctx.intro}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Progressive hints</p>
          {ctx.hints.slice(0, revealedHints).map((hint) => (
            <div
              key={hint.id}
              className="flex gap-2 rounded-md border border-border bg-muted/20 p-3 text-sm animate-fade-in"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <span className="text-xs font-medium text-muted-foreground">Hint {hint.id}</span>
                <p className="mt-0.5">{hint.text}</p>
              </div>
            </div>
          ))}
          {revealedHints < ctx.hints.length && (
            <Button variant="outline" size="sm" className="w-full" onClick={revealNextHint}>
              <ChevronRight className="h-3.5 w-3.5" />
              Reveal Hint {revealedHints + 1}
            </Button>
          )}
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
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ask Mentor</p>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md p-2.5 text-sm animate-fade-in",
                  msg.role === "user"
                    ? "ml-4 bg-muted/50 text-foreground"
                    : "mr-4 border border-border bg-muted/20"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">Ask about this checkpoint</p>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this checkpoint..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askMentor()}
            aria-label="Ask mentor"
          />
          <Button size="icon" onClick={askMentor} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
