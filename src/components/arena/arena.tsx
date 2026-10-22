"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, BookmarkPlus, Pause, Play, RotateCcw, Swords, Timer, TimerOff, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CompanionNote, type CompanionMood } from "@/components/companion";
import { celebrate, CountUp } from "@/components/motion";
import { dispatchEngine, updateEngine, type ReviewCard } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { BOSSES, ROUND_META, getBoss, pickRounds, type ArenaQuestion, type Boss, type BossId } from "./bank";
import { gradeAnswer, type GradeResult } from "./grader";
import { BossArt } from "./boss-art";

const ROUND_SECONDS = 90;
const DIFF_TONE: Record<Boss["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
  Hard: "bg-rose-50 text-rose-700 ring-rose-100",
};

type Phase = "select" | "round" | "grading" | "graded" | "end";

interface RoundRecord {
  question: ArenaQuestion;
  answer: string;
  result: GradeResult;
}

export function Arena() {
  const [phase, setPhase] = useState<Phase>("select");
  const [bossId, setBossId] = useState<BossId>("warden");
  const [questions, setQuestions] = useState<ArenaQuestion[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [records, setRecords] = useState<RoundRecord[]>([]);
  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [hp, setHp] = useState(200);
  const [hit, setHit] = useState<{ key: number; dmg: number } | null>(null);
  const [timerOn, setTimerOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [secs, setSecs] = useState(ROUND_SECONDS);
  const [reviewAdded, setReviewAdded] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const boss = getBoss(bossId);
  const question = questions[roundIdx];
  const last = records[records.length - 1];

  useEffect(() => {
    if (phase !== "round" || !timerOn || paused || secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, timerOn, paused, secs]);

  useEffect(() => {
    if (phase === "round") answerRef.current?.focus();
    if (phase === "graded" || phase === "end") headingRef.current?.focus();
  }, [phase, roundIdx]);

  const start = useCallback(
    (id: BossId, avoid: string[] = []) => {
      const b = getBoss(id);
      setBossId(id);
      setQuestions(pickRounds(b, avoid));
      setRoundIdx(0);
      setRecords([]);
      setAnswer("");
      setCode("");
      setShowCode(false);
      setHp(b.hp);
      setHit(null);
      setSecs(ROUND_SECONDS);
      setPaused(false);
      setReviewAdded(false);
      setPhase("round");
    },
    []
  );

  const submit = useCallback(async () => {
    if (!question || phase !== "round" || answer.trim().length === 0) return;
    setPhase("grading");
    const result = await gradeAnswer(boss, question, answer, code);
    const dmg = result.score * 10;
    const nextHp = Math.max(0, hp - dmg);
    setRecords((r) => [...r, { question, answer, result }]);
    setHp(nextHp);
    setHit({ key: Date.now(), dmg });
    dispatchEngine({ type: "interview_round", roundId: `arena:${boss.id}:${question.id}`, score: result.score, maxScore: 10 });
    const finished = roundIdx === questions.length - 1 || nextHp === 0;
    if (finished && nextHp === 0) celebrate({ kind: "big" });
    else if (result.score >= 8) celebrate({ kind: "small" });
    setPhase(finished ? "end" : "graded");
  }, [question, phase, answer, code, boss, hp, roundIdx, questions.length]);

  const next = () => {
    setRoundIdx((i) => i + 1);
    setAnswer("");
    setCode("");
    setShowCode(false);
    setSecs(ROUND_SECONDS);
    setPaused(false);
    setPhase("round");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  };

  const addWeakSpots = () => {
    const weak = records.filter((r) => r.result.score < 7);
    const now = new Date().toISOString();
    updateEngine((s) => {
      const existing = new Set(s.reviewQueue.map((c) => c.id));
      const cards: ReviewCard[] = weak
        .map((r) => ({
          id: `arena:${boss.id}:${r.question.id}`,
          front: r.question.prompt,
          back: `A strong answer covers:\n${r.question.rubric.map((p) => `- ${p.point}`).join("\n")}`,
          topic: boss.topic,
          sourceHref: "/arena",
          ease: 2.5,
          intervalDays: 0,
          dueAt: now,
          reps: 0,
          lapses: 0,
        }))
        .filter((c) => !existing.has(c.id));
      return {
        ...s,
        reviewQueue: [...s.reviewQueue, ...cards],
        companion: {
          ...s.companion,
          weakSpots: { ...s.companion.weakSpots, [boss.topic]: (s.companion.weakSpots[boss.topic] ?? 0) + weak.length },
        },
      };
    });
    setReviewAdded(true);
    toast({
      title: weak.length ? `${weak.length} review card${weak.length > 1 ? "s" : ""} added` : "Nothing weak to add",
      description: weak.length ? "They'll show up in your review queue today." : "Every round scored 7 or above.",
      tone: "success",
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <ArenaStyles />
      <header className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 px-4 py-3.5 text-white md:px-5 md:py-4">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">The Arena</p>
            <h1 className="mt-0.5 text-lg font-bold tracking-tight md:text-xl">Mock interviews, as boss fights</h1>
            <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-indigo-200/95 text-pretty md:text-xs">
              Three rounds — concept, trade-offs, and a real problem. Strong answers deal damage. Kip coaches from the sideline.
            </p>
          </div>
          {phase !== "select" && (
            <button
              type="button"
              onClick={() => setPhase("select")}
              className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Change boss
            </button>
          )}
        </div>
      </header>

      {phase === "select" && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
          <BossSelect onPick={(id) => start(id)} />
        </div>
      )}

      {phase !== "select" && (
        <div className="grid min-h-0 flex-1 gap-3 overflow-hidden md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] md:gap-4 lg:grid-cols-[minmax(260px,300px)_1fr]">
          <BossPanel boss={boss} hp={hp} hit={hit} roundIdx={roundIdx} total={questions.length} records={records} />

          <div className="flex min-h-0 flex-col overflow-hidden">
            {(phase === "round" || phase === "grading") && question && (
              <section
                aria-labelledby="round-title"
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5"
              >
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Round {roundIdx + 1} of {questions.length} · {ROUND_META[question.kind].label}
                  </p>
                  <RoundTimer on={timerOn} paused={paused} secs={secs} onToggle={() => setTimerOn((v) => !v)} onPause={() => setPaused((p) => !p)} />
                </div>
                <div className="mt-3 shrink-0 space-y-2">
                  <h2
                    id="round-title"
                    className="text-base font-semibold leading-snug text-slate-900 text-justify md:text-lg"
                  >
                    {question.prompt}
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-500 text-justify">{ROUND_META[question.kind].hint}</p>
                </div>

                {roundIdx === 0 && records.length === 0 && (
                  <CompanionNote
                    mood="focused"
                    className="mt-3 shrink-0 rounded-xl border-indigo-100/80 bg-indigo-50/50 p-3 text-xs text-slate-700"
                  >
                    <p className="leading-relaxed text-justify">
                      I&apos;m in your corner. Concept round first: define it cleanly, then show where it breaks. Structure beats length.
                    </p>
                  </CompanionNote>
                )}

                <div className="mt-3 flex min-h-0 flex-1 flex-col">
                  <label
                    htmlFor="arena-answer"
                    className="block shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Your answer
                  </label>
                  <textarea
                    id="arena-answer"
                    ref={answerRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={onKey}
                    disabled={phase === "grading"}
                    placeholder="Talk it through like you would out loud…"
                    className="mt-1.5 min-h-[6rem] w-full flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:opacity-60 [text-align:justify]"
                  />

                  {question.kind === "approach" && (
                    <div className="mt-2 shrink-0">
                      <button
                        type="button"
                        aria-expanded={showCode}
                        onClick={() => setShowCode((v) => !v)}
                        className="rounded-md text-[11px] font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                      >
                        {showCode ? "Hide pseudo-code" : "Add pseudo-code (optional)"}
                      </button>
                      {showCode && (
                        <textarea
                          aria-label="Pseudo-code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={onKey}
                          disabled={phase === "grading"}
                          rows={4}
                          spellCheck={false}
                          placeholder={"function solve(nums):\n  ..."}
                          className="mt-1.5 max-h-28 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-cyan-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-3">
                  {timerOn && secs === 0 && (
                    <p className="mr-auto text-[11px] font-medium text-amber-600 text-pretty">
                      Time&apos;s up — finish your thought and submit.
                    </p>
                  )}
                  <Button variant="accent" onClick={() => void submit()} disabled={phase === "grading" || answer.trim().length === 0}>
                    <Swords className="h-4 w-4" aria-hidden />
                    {phase === "grading" ? "The boss is judging…" : "Submit answer"}
                  </Button>
                </div>
              </section>
            )}

            {phase === "graded" && last && (
              <section className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5" aria-live="polite">
                <RoundResult record={last} headingRef={headingRef} roundNumber={records.length} />
                <CompanionNote
                  mood={coachMood(last.result.score)}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-slate-700"
                >
                  <p className="text-pretty leading-relaxed">{coachLine(last, boss, hp)}</p>
                </CompanionNote>
                <div className="flex justify-end">
                  <Button variant="accent" onClick={next}>
                    Next round <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </section>
            )}

            {phase === "end" && (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
              <EndScreen
                boss={boss}
                records={records}
                victory={hp === 0}
                headingRef={headingRef}
                reviewAdded={reviewAdded}
                onRematch={() => start(boss.id, questions.map((q) => q.id))}
                onAddWeak={addWeakSpots}
              />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BossSelect({ onPick }: { onPick: (id: BossId) => void }) {
  return (
    <section aria-labelledby="pick-boss" className="space-y-3">
      <h2 id="pick-boss" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Choose your opponent
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {BOSSES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0"
          >
            <div className={cn("flex h-28 items-center justify-center rounded-xl bg-gradient-to-br", b.tint)}>
              <BossArt id={b.id} size={84} className="arena-idle" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">{b.name}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1", DIFF_TONE[b.difficulty])}>
                {b.difficulty}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{b.epithet}</p>
            <p className="mt-3 text-xs italic leading-relaxed text-slate-600 text-pretty">&ldquo;{b.taunt}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
              <span className="font-medium text-slate-500">{b.topic}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                Fight <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function BossPanel({
  boss,
  hp,
  hit,
  roundIdx,
  total,
  records,
}: {
  boss: Boss;
  hp: number;
  hit: { key: number; dmg: number } | null;
  roundIdx: number;
  total: number;
  records: RoundRecord[];
}) {
  const pct = hp / boss.hp;
  return (
    <aside className="flex min-h-0 flex-col rounded-2xl bg-gradient-to-b from-indigo-950 to-slate-950 p-4 text-white md:h-full md:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Interviewer</p>
      <p className="mt-0.5 text-sm font-semibold">{boss.name}</p>
      <div className="relative mt-3 flex min-h-[7rem] flex-1 items-center justify-center md:mt-4 md:min-h-0">
        <div aria-hidden className={cn("absolute inset-6 rounded-full bg-gradient-to-br opacity-30 blur-2xl", boss.tint)} />
        <div key={hit?.key ?? "still"} className={cn("relative", hit && "arena-shake")}>
          <BossArt id={boss.id} size={120} className={cn(!hit && "arena-idle", hp === 0 && "opacity-40 grayscale")} />
        </div>
        {hit && hit.dmg > 0 && (
          <span key={`d${hit.key}`} aria-hidden className="arena-dmg absolute top-2 text-2xl font-black tabular-nums text-amber-300 drop-shadow">
            -{hit.dmg}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-indigo-200">HP</span>
          <span className="tabular-nums text-white">
            {hp} / {boss.hp}
          </span>
        </div>
        <div
          className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10"
          role="meter"
          aria-label={`${boss.name} health`}
          aria-valuemin={0}
          aria-valuemax={boss.hp}
          aria-valuenow={hp}
        >
          <div
            className={cn(
              "h-full w-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              pct > 0.5 ? "bg-gradient-to-r from-rose-500 to-amber-400" : pct > 0.2 ? "bg-amber-400" : "bg-rose-500"
            )}
            style={{ transform: `scaleX(${pct})` }}
          />
        </div>
      </div>
      <ol className="mt-5 flex gap-2" aria-label="Rounds">
        {Array.from({ length: total }).map((_, i) => {
          const r = records[i];
          return (
            <li
              key={i}
              className={cn(
                "flex h-8 flex-1 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums ring-1",
                r
                  ? r.result.score >= 7
                    ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30"
                    : "bg-amber-400/15 text-amber-300 ring-amber-400/30"
                  : i === roundIdx
                    ? "bg-cyan-400/15 text-cyan-200 ring-cyan-300/40"
                    : "bg-white/5 text-indigo-300 ring-white/10"
              )}
            >
              {r ? `${r.result.score}/10` : `R${i + 1}`}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 shrink-0 text-[11px] leading-relaxed text-indigo-300/95 text-pretty">
        {boss.hp / 10} damage per point. Knock HP to zero to win.
      </p>
    </aside>
  );
}

function RoundTimer({ on, paused, secs, onToggle, onPause }: { on: boolean; paused: boolean; secs: number; onToggle: () => void; onPause: () => void }) {
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");
  const btn =
    "inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
  return (
    <div className="flex items-center gap-1.5">
      {on && (
        <>
          <span
            className={cn("rounded-lg px-2 py-1 font-mono text-xs font-semibold tabular-nums", secs <= 15 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700")}
            aria-live={secs <= 10 ? "polite" : "off"}
            aria-label={`${secs} seconds left`}
          >
            {mm}:{ss}
          </span>
          <button type="button" onClick={onPause} className={btn} aria-label={paused ? "Resume timer" : "Pause timer"}>
            {paused ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />}
          </button>
        </>
      )}
      <button type="button" onClick={onToggle} className={btn} aria-pressed={on}>
        {on ? <TimerOff className="h-3 w-3" aria-hidden /> : <Timer className="h-3 w-3" aria-hidden />}
        {on ? "No timer" : "Timer"}
      </button>
    </div>
  );
}

function RoundResult({
  record,
  roundNumber,
  headingRef,
}: {
  record: RoundRecord;
  roundNumber: number;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { result } = record;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Round {roundNumber} · {ROUND_META[record.question.kind].label}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-sm font-semibold text-slate-900 focus:outline-none">
            {result.verdict}
          </h2>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold tabular-nums tracking-tight", result.score >= 7 ? "text-emerald-600" : result.score >= 4 ? "text-amber-600" : "text-rose-600")}>
            {result.score}
            <span className="text-sm text-slate-400">/10</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">{result.source === "ai" ? "AI graded" : "Rubric graded"}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FeedbackList title="Landed" tone="emerald" items={result.strengths} />
        <FeedbackList title="Sharpen" tone="amber" items={result.improvements.length ? result.improvements : ["Nothing major. Practise saying it in half the time."]} />
      </div>
    </div>
  );
}

function FeedbackList({ title, tone, items }: { title: string; tone: "emerald" | "amber"; items: string[] }) {
  return (
    <div>
      <p className={cn("text-[10px] font-bold uppercase tracking-wider", tone === "emerald" ? "text-emerald-600" : "text-amber-600")}>{title}</p>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-700 text-pretty">
            <span aria-hidden className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tone === "emerald" ? "bg-emerald-500" : "bg-amber-500")} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EndScreen({
  boss,
  records,
  victory,
  headingRef,
  reviewAdded,
  onRematch,
  onAddWeak,
}: {
  boss: Boss;
  records: RoundRecord[];
  victory: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  reviewAdded: boolean;
  onRematch: () => void;
  onAddWeak: () => void;
}) {
  const total = records.reduce((s, r) => s + r.result.score, 0);
  const pct = Math.round((total / (records.length * 10 || 1)) * 100);
  const missed = Array.from(new Set(records.flatMap((r) => r.result.missed))).slice(0, 5);
  const weakCount = records.filter((r) => r.result.score < 7).length;

  return (
    <section aria-live="polite" className="space-y-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 text-white",
          victory ? "bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950" : "bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-950"
        )}
      >
        <div aria-hidden className={cn("pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl", victory ? "bg-amber-400/30" : "bg-cyan-400/15")} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", victory ? "text-amber-300" : "text-cyan-300")}>
              {victory ? "Victory" : "Not this time"}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-bold tracking-tight focus:outline-none">
              {victory ? `${boss.name} has been defeated.` : boss.defeatLine}
            </h2>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-indigo-200 text-pretty">
              {victory
                ? "You explained it, priced it, and solved it. That's the whole interview loop."
                : "Losing here is cheap. Losing in the real room is not. You now know exactly what to study."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {victory && <Trophy className="h-8 w-8 text-amber-300" aria-hidden />}
            <div className="text-right">
              <p className="text-4xl font-black tabular-nums tracking-tight">
                <CountUp value={pct} />%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                {total} / {records.length * 10} points
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rubric breakdown</p>
        <ul className="mt-3 divide-y divide-slate-100">
          {records.map((r, i) => (
            <li key={r.question.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    R{i + 1} · {ROUND_META[r.question.kind].label}
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-800 text-pretty">{r.question.prompt}</p>
                </div>
                <span className={cn("shrink-0 text-sm font-bold tabular-nums", r.result.score >= 7 ? "text-emerald-600" : "text-amber-600")}>{r.result.score}/10</span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {r.question.rubric.map((p) => {
                  const hitIt = r.result.covered.includes(p.point);
                  return (
                    <li
                      key={p.point}
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] ring-1",
                        hitIt ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-slate-200"
                      )}
                    >
                      <span className="sr-only">{hitIt ? "Covered: " : "Missed: "}</span>
                      {p.point}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <CompanionNote
        mood={victory ? "proud" : "concerned"}
        className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-slate-700"
      >
        <p className="text-pretty leading-relaxed">
          {victory
            ? weakCount
              ? `Good fight. ${weakCount === 1 ? "One round was" : `${weakCount} rounds were`} shaky though. Bank those as review cards so it holds.`
              : "Clean sweep. Try a harder boss before this starts feeling comfortable."
            : `Study list: ${(missed.length ? missed : boss.study).slice(0, 3).join("; ")}. Then come back. It'll still be here.`}
        </p>
      </CompanionNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="accent" onClick={onRematch}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Rematch
        </Button>
        <Button variant="outline" onClick={onAddWeak} disabled={reviewAdded}>
          <BookmarkPlus className="h-4 w-4" aria-hidden /> {reviewAdded ? "Added to review" : "Add weak spots to review"}
        </Button>
        {reviewAdded && (
          <Link href="/review" className="rounded-md text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
            Open review queue
          </Link>
        )}
      </div>
    </section>
  );
}

function coachMood(score: number): CompanionMood {
  if (score >= 8) return "excited";
  if (score >= 5) return "focused";
  return "concerned";
}

function coachLine(r: RoundRecord, boss: Boss, hp: number): string {
  const s = r.result.score;
  const gap = r.result.missed[0];
  const tail = hp > 0 ? ` ${boss.name.replace("The ", "")} is at ${hp} HP.` : "";
  if (s >= 9) return `That landed hard. Keep the same shape next round: claim, reason, complexity.${tail}`;
  if (s >= 7) return `Good hit.${gap ? ` You skipped "${gap.toLowerCase()}". Interviewers will ask.` : ""}${tail}`;
  if (s >= 4) return `Glancing blow.${gap ? ` The missing piece was "${gap.toLowerCase()}".` : ""} Slow down and structure it.${tail}`;
  return `That one bounced off. It happens. Next round, start with the simplest correct idea and build from there.${tail}`;
}

/** Scoped keyframes. Only applied when the user has not asked for reduced motion. */
function ArenaStyles() {
  return (
    <style>{`
@media (prefers-reduced-motion: no-preference) {
  @keyframes arena-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px) rotate(-3deg)} 30%{transform:translateX(7px) rotate(2deg)} 45%{transform:translateX(-5px)} 60%{transform:translateX(4px)} 75%{transform:translateX(-2px)} }
  @keyframes arena-dmg { 0%{opacity:0;transform:translateY(8px) scale(.8)} 15%{opacity:1;transform:translateY(0) scale(1.15)} 100%{opacity:0;transform:translateY(-36px) scale(1)} }
  @keyframes arena-idle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .arena-shake { animation: arena-shake 480ms cubic-bezier(0.16,1,0.3,1); }
  .arena-dmg { animation: arena-dmg 1100ms cubic-bezier(0.16,1,0.3,1) forwards; }
  .arena-idle { animation: arena-idle 3.2s ease-in-out infinite; }
}
`}</style>
  );
}
