"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { consumeAiStream } from "@/lib/ai/stream-client";
import { kipLine, type KipMoment } from "@/lib/companion/persona";
import type { CompanionContext, CompanionMood, Personality } from "@/lib/companion/types";
import { onEngineEvent } from "@/lib/engine";
import type { EngineEvent } from "@/lib/engine/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ASK_COMPANION_EVENT, type AskCompanionDetail } from "./companion-events";
import { KipAvatar } from "./kip-avatar";

type ChatMessage = { role: "user" | "assistant"; text: string };

interface DockState {
  mood: CompanionMood;
  line: string;
  visible: boolean;
}

export function CompanionPresenceDock() {
  const [personality, setPersonality] = useState<Personality>("playful");
  const [dock, setDock] = useState<DockState>({ mood: "idle", line: "", visible: false });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelContext, setPanelContext] = useState<CompanionContext>({ surface: "app" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [panelMood, setPanelMood] = useState<CompanionMood>("idle");
  const [streaming, setStreaming] = useState(false);
  const correctStreak = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const muted = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const streamingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const flash = useCallback(
    (moment: KipMoment, mood: CompanionMood) => {
      if (muted.current) return;
      const line = kipLine(moment, personality);
      setDock({ mood, line, visible: true });
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setDock((d) => ({ ...d, visible: false })), 9000);
    },
    [personality]
  );

  const sendMessage = useCallback(
    async (prompt: string, context: CompanionContext, prior?: ChatMessage[]) => {
      const trimmed = prompt.trim();
      if (!trimmed || streamingRef.current) return;

      setPanelContext(context);
      streamingRef.current = true;
      setStreaming(true);
      setPanelMood("thinking");

      const userMsg: ChatMessage = { role: "user", text: trimmed };
      const history = [...(prior ?? messagesRef.current), userMsg];
      const apiMessages = history.map((m) => ({ role: m.role, content: m.text }));

      setMessages([...history, { role: "assistant", text: "" }]);

      let assistantText = "";
      try {
        const { full } = await consumeAiStream(
          {
            mode: "chat",
            context,
            personality,
            messages: apiMessages,
          },
          (delta) => {
            assistantText += delta;
            setMessages((current) => {
              const copy = [...current];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") copy[copy.length - 1] = { role: "assistant", text: assistantText };
              return copy;
            });
          }
        );
        setMessages((current) => {
          const copy = [...current];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") copy[copy.length - 1] = { role: "assistant", text: full };
          return copy;
        });
        setPanelMood("focused");
      } catch {
        setMessages((current) => {
          const copy = [...current];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && !last.text.trim()) copy.pop();
          return [
            ...copy,
            { role: "assistant", text: "Couldn't reach Kip right now. Try again in a moment." },
          ];
        });
        setPanelMood("concerned");
      } finally {
        streamingRef.current = false;
        setStreaming(false);
      }
    },
    [personality]
  );

  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<AskCompanionDetail>).detail;
      if (!detail?.prompt) return;
      const ctx = detail.context ?? { surface: "app" };
      setPanelOpen(true);
      void sendMessage(detail.prompt, ctx);
    };
    window.addEventListener(ASK_COMPANION_EVENT, onAsk);
    return () => window.removeEventListener(ASK_COMPANION_EVENT, onAsk);
  }, [sendMessage]);

  useEffect(() => {
    if (!panelOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [panelOpen]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    return onEngineEvent((event: EngineEvent, next) => {
      setPersonality(next.companion.personality);
      muted.current = next.companion.nudgesMuted;

      if (event.type === "quiz_answered") {
        if (event.correct) {
          correctStreak.current += 1;
          if (correctStreak.current >= 3) flash("correct_streak", "proud");
        } else {
          correctStreak.current = 0;
          flash("wrong_answer", "concerned");
        }
      }
      if (event.type === "lesson_completed") flash("lesson_completed", "excited");
      if (event.type === "problem_attempted" && event.accepted) flash("problem_accepted", "proud");

      const celebration = next.pendingCelebration;
      if (celebration?.kind === "level_up") flash("level_up", "excited");
      if (celebration?.kind === "achievement") flash("achievement", "proud");

      if (event.type === "app_opened") {
        const h = new Date().getHours();
        if (h >= 23 || h < 5) flash("late_night", "sleepy");
      }
    });
  }, [flash]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col items-end gap-2">
      <div
        className={cn(
          "transition-all duration-300",
          dock.visible ? "translate-y-0 opacity-100" : "pointer-events-none h-0 overflow-hidden opacity-0"
        )}
        aria-live="polite"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-lg shadow-indigo-900/5 backdrop-blur-sm">
          <KipAvatar mood={dock.mood} size={36} />
          <p className="text-xs leading-relaxed text-slate-700 max-w-[220px]">{dock.line}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {panelOpen && (
          <div
            className="w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-indigo-900/10 overflow-hidden animate-[m-rise-in_0.32s_var(--m-ease-out)]"
            role="dialog"
            aria-label="Ask Kip"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <KipAvatar mood={panelMood} size={28} />
                <span className="text-xs font-bold text-slate-900 truncate">Kip</span>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
                onClick={() => setPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              ref={threadRef}
              className="max-h-56 overflow-y-auto px-3 py-2 space-y-2 text-xs text-slate-800"
            >
              {messages.length === 0 && (
                <p className="text-slate-500 leading-relaxed">
                  Ask about a topic, your path, or what to practice next.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-2.5 py-2 leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-3 bg-indigo-50 text-indigo-950 border border-indigo-100"
                      : "mr-1 bg-slate-50 text-slate-800 border border-slate-100"
                  )}
                >
                  {m.text || (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-slate-100 p-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = draft.trim();
                if (!trimmed) return;
                setDraft("");
                void sendMessage(trimmed, panelContext);
              }}
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message Kip…"
                aria-label="Message Kip"
                disabled={streaming}
                maxLength={2000}
                className="h-9 text-xs"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={streaming || !draft.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors"
          aria-label="Open Kip"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
