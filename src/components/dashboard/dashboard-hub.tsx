"use client";

import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Medal,
  RotateCcw,
  Sparkles,
  Swords,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestList, AchievementGrid, StreakCalendar } from "@/components/progression";
import { CountUp, Reveal } from "@/components/motion";
import { useEngine, levelFromXp } from "@/lib/engine";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/path",
    title: "Path map",
    desc: "One glowing node — your next 5 minutes.",
    icon: GitBranch,
    tone: "from-sky-500/10 to-indigo-500/5 border-sky-200/60",
  },
  {
    href: "/review",
    title: "Review queue",
    desc: "Spaced cards before they pile up.",
    icon: RotateCcw,
    tone: "from-emerald-500/10 to-teal-500/5 border-emerald-200/60",
  },
  {
    href: "/arena",
    title: "Arena",
    desc: "Mock rounds with Kip in the corner.",
    icon: Swords,
    tone: "from-violet-500/10 to-purple-500/5 border-violet-200/60",
  },
  {
    href: "/achievements",
    title: "Achievements",
    desc: "Identity cards, not just ranks.",
    icon: Medal,
    tone: "from-amber-500/10 to-orange-500/5 border-amber-200/60",
  },
  {
    href: "/wrapped",
    title: "Wrapped",
    desc: "Shareable story of your term.",
    icon: Sparkles,
    tone: "from-pink-500/10 to-rose-500/5 border-pink-200/60",
  },
] as const;

export function DashboardHub() {
  const engine = useEngine();
  const level = levelFromXp(engine.xp);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 m-stagger">
        {QUICK_LINKS.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.href} delay={i * 60}>
              <Link
                href={item.href}
                className={cn(
                  "hover-lift flex h-full flex-col rounded-2xl border bg-gradient-to-br p-5 transition-colors",
                  item.tone
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-slate-200/80 shadow-xs">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">{item.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Engine snapshot</CardTitle>
            <p className="text-xs text-slate-500">XP, quests, and level from the shared engine.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <CountUp value={engine.xp} className="text-3xl font-bold tabular-nums text-slate-900" />
              <span className="text-xs text-slate-500">total XP</span>
            </div>
            <p className="text-sm text-slate-700">
              Level <span className="font-bold tabular-nums">{level.level}</span> ·{" "}
              <span className="text-indigo-700">{level.title}</span> ·{" "}
              <span className="tabular-nums">{level.pct}%</span> to next
            </p>
            <QuestList period="daily" limit={3} className="min-h-[4rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Consistency</CardTitle>
            <p className="text-xs text-slate-500">Streak calendar fills in as you study.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <StreakCalendar weeks={8} className="min-h-[5rem] rounded-xl bg-slate-50/80 p-3" />
            <AchievementGrid limit={4} className="min-h-[4rem] rounded-xl border border-slate-100 p-3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
