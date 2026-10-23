"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { consumeAiStream } from "@/lib/ai/stream-client";
import { awayBucket, greetingFor, KIP } from "@/lib/companion/persona";
import type { CompanionMood } from "@/lib/companion/types";
import { useEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { KipAvatar } from "./kip-avatar";

export function CompanionBriefingCard({ className }: { className?: string }) {
  const engine = useEngine();
  const personality = engine.companion.personality;
  const todayKey = new Date().toISOString().slice(0, 10);
  const xpToday = engine.xpByDay[todayKey] ?? 0;
  const bucket = awayBucket(engine.companion.lastSeenAt);
  const greeting = greetingFor(bucket, personality);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<CompanionMood>("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const streak = engine.streak.current;
    const detail = [
      `Streak: ${streak} days`,
      `XP today: ${xpToday}`,
      `Daily goal XP: ${engine.dailyGoalXp}`,
      engine.companion.goal ? `Goal: ${engine.companion.goal}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setBody("");
    setMood("thinking");
    setLoading(true);
    void consumeAiStream(
      {
        mode: "briefing",
        context: { surface: "dashboard", subject: "today", detail },
        personality,
      },
      (delta) => {
        if (!cancelled) setBody((b) => b + delta);
      }
    )
      .then(() => {
        if (!cancelled) setMood("focused");
      })
      .catch(() => {
        if (!cancelled) {
          setBody("Pick one small win today — a review card or a 5-minute lesson.");
          setMood("concerned");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [engine.companion.goal, engine.companion.lastSeenAt, engine.dailyGoalXp, engine.streak.current, personality, xpToday]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <KipAvatar mood={mood} size={44} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{KIP.name}</p>
          <p className="text-sm font-semibold text-slate-900 leading-snug">{greeting}</p>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[2.5rem]">
            {body || (loading ? "" : KIP.tagline)}
          </p>
          {loading && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Composing briefing…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
