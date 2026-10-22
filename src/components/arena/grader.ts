import type { ArenaQuestion, Boss } from "./bank";

export interface GradeResult {
  score: number; // 0-10
  verdict: string;
  strengths: string[];
  improvements: string[];
  /** rubric lines the answer covered (local grader only; AI results leave empty) */
  covered: string[];
  missed: string[];
  source: "ai" | "local";
}

const COMPLEXITY_RE = /o\s*\(\s*[^)]{1,20}\)/i;
const STEP_RE = /(^|\n)\s*(\d+[.)]|[-*]|first|then|next|finally|step)/i;
const EXAMPLE_RE = /\b(e\.g\.?|for example|example|for instance|say we have|input)\b/i;
const TRADEOFF_RE = /\b(trade-?off|but|however|at the cost|whereas|instead)\b/i;

/** Local heuristic grader: rubric coverage + length + structure. Deterministic. */
export function gradeLocally(q: ArenaQuestion, answer: string, code = ""): GradeResult {
  const text = `${answer}\n${code}`.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  const covered: string[] = [];
  const missed: string[] = [];
  for (const r of q.rubric) {
    (r.keys.some((k) => text.includes(k)) ? covered : missed).push(r.point);
  }
  const coverage = covered.length / q.rubric.length;

  let lengthScore = 0;
  if (words >= 15) lengthScore = 0.75;
  if (words >= 35 && words <= 320) lengthScore = 1.5;
  else if (words > 320) lengthScore = 1;

  const hasComplexity = COMPLEXITY_RE.test(text);
  const hasSteps = STEP_RE.test(answer) || code.trim().length > 20;
  const hasExample = EXAMPLE_RE.test(answer);
  const hasTradeoff = TRADEOFF_RE.test(answer);
  const structure =
    (hasComplexity ? 0.5 : 0) + (hasSteps ? 0.4 : 0) + (hasExample ? 0.3 : 0) + (q.kind === "complexity" && hasTradeoff ? 0.3 : 0.15);

  const raw = words < 5 ? 0 : coverage * 7 + lengthScore + Math.min(1.5, structure);
  const score = Math.max(0, Math.min(10, Math.round(raw)));

  const strengths: string[] = covered.slice(0, 3).map((c) => `Covered: ${c.charAt(0).toLowerCase()}${c.slice(1)}.`);
  if (hasComplexity) strengths.push("You stated a complexity bound explicitly.");
  if (hasExample) strengths.push("Grounding it in an example made the reasoning easy to follow.");
  if (hasSteps && q.kind === "approach") strengths.push("Your approach had a clear step-by-step shape.");

  const improvements: string[] = missed.slice(0, 3).map((m) => `Bring in: ${m.charAt(0).toLowerCase()}${m.slice(1)}.`);
  if (words < 35) improvements.push("Say more. Interviewers grade reasoning, and two sentences rarely show enough of it.");
  if (!hasComplexity && q.kind !== "concept") improvements.push("Close with the time and space complexity in Big-O.");
  if (!hasExample && q.kind === "approach") improvements.push("Trace a small input out loud before claiming it works.");
  if (q.kind === "complexity" && !hasTradeoff) improvements.push("Name the trade-off: what you pay for the faster option.");

  return {
    score,
    verdict: verdictFor(score),
    strengths: strengths.length ? strengths.slice(0, 3) : ["You gave it a go under pressure. That counts in a real interview too."],
    improvements: improvements.slice(0, 3),
    covered,
    missed,
    source: "local",
  };
}

export function verdictFor(score: number): string {
  if (score >= 9) return "Hire signal. Crisp and complete.";
  if (score >= 7) return "Solid. A couple of gaps an interviewer would probe.";
  if (score >= 5) return "On the right track, but missing key pieces.";
  if (score >= 3) return "Partial. The core idea needs more depth.";
  return "Not there yet. Worth a focused review.";
}

/** Try the AI grader; fall back to the local heuristic on any failure. */
export async function gradeAnswer(boss: Boss, q: ArenaQuestion, answer: string, code: string): Promise<GradeResult> {
  const local = gradeLocally(q, answer, code);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        kind: "interview_grade",
        context: { surface: "arena", subject: boss.topic, detail: `${boss.name}, ${q.kind} round` },
        input: { question: q.prompt, answer: code.trim() ? `${answer}\n\nPseudo-code:\n${code}` : answer, rubric: q.rubric.map((r) => r.point) },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return local;
    const json = (await res.json()) as {
      source?: string;
      data?: { score?: number; verdict?: string; strengths?: string[]; improvements?: string[] };
    };
    const d = json?.data;
    if (!d || typeof d.score !== "number" || json.source === "fallback" || json.source === "local") return local;
    const score = Math.max(0, Math.min(10, Math.round(d.score)));
    return {
      score,
      verdict: d.verdict || verdictFor(score),
      strengths: Array.isArray(d.strengths) && d.strengths.length ? d.strengths.slice(0, 3) : local.strengths,
      improvements: Array.isArray(d.improvements) ? d.improvements.slice(0, 3) : local.improvements,
      covered: local.covered,
      missed: local.missed,
      source: "ai",
    };
  } catch {
    return local;
  }
}
