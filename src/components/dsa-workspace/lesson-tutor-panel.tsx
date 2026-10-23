"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { DsaLessonContent } from "@/lib/curriculum/types";
import { consumeAiStream } from "@/lib/ai/stream-client";
import { CompanionAvatar } from "@/components/companion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TutorMessage = { role: "user" | "assistant"; text: string };

export function LessonTutorPanel({ lesson }: { lesson: DsaLessonContent }) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      text: `Ask anything about "${lesson.title}" — concepts, complexity, or how to approach the practice ideas. I'll guide you without spoiling full solutions.`,
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "demo" | null>(null);
  const [mood, setMood] = useState<"idle" | "thinking" | "focused">("idle");

  const lessonContext = {
    surface: "lesson",
    subject: lesson.title,
    detail: (lesson.learn.summary || lesson.learn.hook).slice(0, 2000),
  };

  const send = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const nextUser: TutorMessage = { role: "user", text: trimmed };
    const history = [...messages, nextUser];
    setMessages(history);
    setQuery("");
    setLoading(true);
    setError(null);
    setMood("thinking");

    const apiMessages = history
      .filter((m) => m.role === "user" || (m.role === "assistant" && !m.text.startsWith("Ask anything")))
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((m) => [...m, { role: "assistant", text: "" }]);
    let assistantText = "";
    try {
      const result = await consumeAiStream(
        {
          mode: "chat",
          context: lessonContext,
          messages: apiMessages,
        },
        (delta) => {
          assistantText += delta;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", text: assistantText };
            return copy;
          });
        }
      );
      setSource(result.source);
      setMood("focused");
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", text: result.full };
        return copy;
      });
    } catch {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.text.trim()) copy.pop();
        return copy;
      });
      setError("Network error. Try again.");
      setMood("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <CompanionAvatar mood={loading ? "thinking" : mood} size={28} />
          <span className="text-xs font-bold text-slate-900 truncate">Kip · Lesson guide</span>
        </div>
        <Badge variant="purple" className="text-[10px] shrink-0">
          {source === "live" ? "Live" : source === "demo" ? "Demo" : "AI"}
        </Badge>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl px-3 py-2 text-xs leading-relaxed",
              m.role === "user"
                ? "ml-4 bg-indigo-50 text-indigo-950 border border-indigo-100"
                : "mr-2 bg-slate-50 text-slate-800 border border-slate-100"
            )}
          >
            {m.text}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Thinking…
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <form
        className="border-t border-slate-100 p-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about this lesson…"
          aria-label="Message Kip"
          disabled={loading}
          maxLength={2000}
        />
        <Button type="submit" size="icon" className="shrink-0" disabled={loading || !query.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
