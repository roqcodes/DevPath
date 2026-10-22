"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CompanionNote } from "@/components/companion";
import { StreakFlame, LevelBadge } from "@/components/progression";
import { useEngine } from "@/lib/engine";
import { celebrate } from "@/lib/motion/confetti";
import { cn } from "@/lib/utils";
import { buildSlides, deriveWrappedStats } from "./derive-stats";
import { sampleWrappedStats } from "./sample-data";
import { downloadWrappedPng, WRAPPED_EXPORT_SIZE } from "./export-card";
import type { WrappedSlide } from "./types";

const ACCENT_BG: Record<WrappedSlide["accent"], string> = {
  indigo: "from-indigo-600 to-indigo-950",
  cyan: "from-cyan-600 to-slate-900",
  amber: "from-amber-500 to-orange-950",
  emerald: "from-emerald-600 to-slate-900",
};

export function WrappedExperience({ period }: { period: string }) {
  const engine = useEngine();
  const [useSample, setUseSample] = useState(false);
  const [index, setIndex] = useState(0);

  const stats = useMemo(
    () => (useSample ? sampleWrappedStats(period) : deriveWrappedStats(engine, period)),
    [useSample, engine, period],
  );
  const slides = useMemo(() => buildSlides(stats), [stats]);
  const slide = slides[index];

  const exportSlide = () => {
    downloadWrappedPng(stats, slide.id);
    celebrate({ kind: "small", origin: { x: 0.5, y: 0.4 } });
  };

  const go = (delta: number) => {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return slides.length - 1;
      if (next >= slides.length) return 0;
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                <Sparkles className="mr-1 h-3 w-3" />
                Wrapped
              </Badge>
              <Badge variant="outline">{period}</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Your learning story</h1>
            <p className="text-sm text-muted-foreground">
              Tap through slides · export {WRAPPED_EXPORT_SIZE.width}×{WRAPPED_EXPORT_SIZE.height} PNG
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LevelBadge className="text-sm font-semibold text-indigo-700" />
            <StreakFlame size="sm" className="text-sm font-semibold text-amber-700" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Switch id="sample-data" checked={useSample} onCheckedChange={setUseSample} />
            <Label htmlFor="sample-data" className="text-sm">
              Sample data (demo shares)
            </Label>
          </div>
          {useSample && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700">Preview mode</span>
          )}
        </div>

        <CompanionNote
          mood="excited"
          className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-slate-700">
            {useSample
              ? "Sample stats loaded — perfect for screenshots without grinding XP first."
              : "Pulled from your engine graph. Toggle sample data anytime."}
          </p>
        </CompanionNote>

        <Card className="overflow-hidden border-slate-200/80">
          <CardContent className="p-0">
            <div
              className={cn(
                "relative min-h-[420px] bg-gradient-to-br p-8 text-white transition-colors duration-300 lg:min-h-[480px] lg:p-12",
                ACCENT_BG[slide.accent],
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    {index + 1} / {slides.length}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{slide.title}</h2>
                  {slide.subtitle && <p className="mt-1 text-indigo-100/90">{slide.subtitle}</p>}
                </div>
                <div className="mt-8 space-y-4">
                  {slide.metric && (
                    <p className="text-5xl font-bold tabular-nums tracking-tight lg:text-6xl">{slide.metric}</p>
                  )}
                  {slide.metricLabel && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/70">{slide.metricLabel}</p>
                  )}
                  <p className="max-w-lg text-base leading-relaxed text-white/90 lg:text-lg">{slide.body}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous slide">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next slide">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      i === index ? "w-6 bg-indigo-600" : "bg-slate-300 hover:bg-slate-400",
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <Button onClick={exportSlide} className="gap-2">
                <Download className="h-4 w-4" />
                Export PNG
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
