"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { consumeAiStream } from "@/lib/ai/stream-client";
import { kipLine, type KipMoment } from "@/lib/companion/persona";
import type { AiMode, CompanionContext, CompanionMood, Personality } from "@/lib/companion/types";
import { onEngineEvent } from "@/lib/engine";
import type { EngineEvent } from "@/lib/engine/types";
import { cn } from "@/lib/utils";
import { ASK_COMPANION_EVENT, type AskCompanionDetail } from "./companion-events";
import { KipAvatar } from "./kip-avatar";

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
  const [panelPrompt, setPanelPrompt] = useState("");
  const [panelReply, setPanelReply] = useState("");
  const [panelMood, setPanelMood] = useState<CompanionMood>("idle");
  const [streaming, setStreaming] = useState(false);
  const correctStreak = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const muted = useRef(false);

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

  const runChat = useCallback(
    async (prompt: string, context: CompanionContext) => {
      setStreaming(true);
      setPanelMood("thinking");
      setPanelReply("");
      try {
        const { full } = await consumeAiStream(
          {
            mode: "chat",
            context,
            personality,
            messages: [{ role: "user", content: prompt }],
          },
          (delta) => setPanelReply((r) => r + delta)
        );
        setPanelReply(full);
        setPanelMood("focused");
      } catch {
        setPanelReply("Couldn't reach Kip right now. Try again in a moment.");
        setPanelMood("concerned");
      } finally {
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
      setPanelContext(ctx);
      setPanelPrompt(detail.prompt);
      setPanelOpen(true);
      void runChat(detail.prompt, ctx);
    };
    window.addEventListener(ASK_COMPANION_EVENT, onAsk);
    return () => window.removeEventListener(ASK_COMPANION_EVENT, onAsk);
  }, [runChat]);

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
            <div className="max-h-56 overflow-y-auto px-3 py-2 space-y-2 text-xs text-slate-800">
              <p className="text-slate-500">{panelPrompt}</p>
              <p className="whitespace-pre-wrap leading-relaxed">{panelReply || (streaming ? "…" : "")}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setPanelOpen((o) => !o);
            if (!panelOpen && !panelReply) {
              setPanelContext({ surface: "app" });
              setPanelPrompt("What should I focus on next?");
              void runChat("What should I focus on next?", { surface: "app" });
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors"
          aria-label="Open Kip"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
