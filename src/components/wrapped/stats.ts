import { levelFromXp, type EngineState } from "@/lib/engine";

export interface HeatCell {
  date: string;
  xp: number;
}

export interface Archetype {
  name: string;
  line: string;
}

export interface WrappedStats {
  xp: number;
  levelTitle: string;
  level: number;
  daysActive: number;
  longestStreak: number;
  currentStreak: number;
  /** last 84 days, oldest first */
  heat: HeatCell[];
  bestDay: HeatCell | null;
  topTopics: { name: string; count: number }[];
  achievements: number;
  interviewRounds: number;
  archetype: Archetype;
  verdict: string;
  isSample: boolean;
}

const TOPIC_KEYS: [string, RegExp][] = [
  ["Arrays", /\barray|two.?pointer|sliding/i],
  ["Strings", /\bstring|substring|anagram|palindrome/i],
  ["Hashing", /\bhash|map\b|dictionary/i],
  ["Linked Lists", /linked.?list/i],
  ["Stacks & Queues", /\bstack|queue|deque/i],
  ["Trees", /\btree|bst|traversal/i],
  ["Graphs", /\bgraph|bfs|dfs|dijkstra/i],
  ["Recursion", /recurs|backtrack/i],
  ["Dynamic Programming", /\bdp\b|dynamic|memo|knapsack/i],
  ["Sorting", /\bsort/i],
  ["Searching", /binary.?search|\bsearch/i],
  ["Heaps", /\bheap|priority/i],
  ["Complexity", /big.?o|complexity/i],
  ["Mock Interviews", /interview|arena/i],
];

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

export function hasEnoughData(s: EngineState): boolean {
  const days = new Set([...s.streak.activeDates, ...Object.keys(s.xpByDay).filter((k) => s.xpByDay[k] > 0)]).size;
  return s.xp >= 50 && days >= 2;
}

export function computeWrapped(s: EngineState, isSample = false): WrappedStats {
  const activeSet = new Set([...s.streak.activeDates, ...Object.keys(s.xpByDay).filter((k) => s.xpByDay[k] > 0)]);
  const heat = lastDays(84).map((date) => ({ date, xp: s.xpByDay[date] ?? 0 }));
  const bestDay = Object.entries(s.xpByDay).reduce<HeatCell | null>((best, [date, xp]) => (!best || xp > best.xp ? { date, xp } : best), null);

  const counts = new Map<string, number>();
  for (const a of s.activity) {
    const hit = TOPIC_KEYS.find(([, re]) => re.test(a.label)) ?? (a.type === "interview_round" ? TOPIC_KEYS[TOPIC_KEYS.length - 1] : undefined);
    if (hit) counts.set(hit[0], (counts.get(hit[0]) ?? 0) + 1);
  }
  for (const [topic, misses] of Object.entries(s.companion.weakSpots)) {
    if (!counts.has(topic)) counts.set(topic, Math.max(1, Math.floor(misses / 2)));
  }
  const topTopics = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const lvl = levelFromXp(s.xp);
  const interviewRounds = s.activity.filter((a) => a.type === "interview_round").length;
  const base = {
    xp: s.xp,
    levelTitle: lvl.title,
    level: lvl.level,
    daysActive: activeSet.size,
    longestStreak: Math.max(s.streak.longest, s.streak.current),
    currentStreak: s.streak.current,
    heat,
    bestDay,
    topTopics,
    achievements: s.achievements.filter((a) => a.unlockedAt).length,
    interviewRounds,
    isSample,
  };
  const archetype = pickArchetype(s, activeSet);
  return { ...base, archetype, verdict: kipVerdict({ ...base, archetype }) };
}

function pickArchetype(s: EngineState, active: Set<string>): Archetype {
  const hours = s.activity.map((a) => new Date(a.at).getHours()).filter((h) => !Number.isNaN(h));
  const night = hours.length ? hours.filter((h) => h >= 21 || h < 4).length / hours.length : 0;
  const days = [...active].map((d) => new Date(`${d}T12:00:00`).getDay());
  const weekend = days.length ? days.filter((d) => d === 0 || d === 6).length / days.length : 0;
  const avgXp = active.size ? s.xp / active.size : 0;
  const sorted = [...active].sort();
  const spanDays = sorted.length
    ? Math.max(1, Math.round((Date.now() - new Date(`${sorted[0]}T00:00:00`).getTime()) / 86_400_000) + 1)
    : 1;
  const consistency = active.size / spanDays;

  if (hours.length >= 5 && night >= 0.4)
    return { name: "The Night-Shift Optimizer", line: "Most of your learning happens after 9 PM, when the notifications go quiet." };
  if (days.length >= 4 && weekend >= 0.5)
    return { name: "The Weekend Warrior", line: "Weekdays are for surviving. Weekends are when you level up." };
  if (active.size >= 2 && avgXp >= 120)
    return { name: "The Deep Diver", line: "Fewer sessions, but long ones. You'd rather understand one thing fully than skim five." };
  if (active.size >= 5 && (consistency >= 0.55 || s.streak.longest >= 7))
    return { name: "The Consistent Climber", line: "No heroics, just showing up. That's the pattern that actually gets offers." };
  return { name: "The Curious Starter", line: "Early days. You're sampling the map before picking a road." };
}

function kipVerdict(s: Omit<WrappedStats, "verdict">): string {
  if (s.longestStreak >= 14) return `A ${s.longestStreak}-day streak isn't luck. Protect it, but don't let it make you skip the hard topics.`;
  if (s.interviewRounds >= 3) return "You've been taking punches in the Arena. That's the fastest way to get interview-ready. Keep going.";
  if (s.longestStreak >= 5) return `${s.longestStreak} days in a row at your best. Next goal: make that your floor, not your peak.`;
  if (s.daysActive >= 10) return "You keep coming back, which matters more than any single session. Now push one topic deeper.";
  if (s.xp > 0) return "A real start. Short daily sessions will beat the occasional marathon. Pick a time and defend it.";
  return "Nothing to judge yet. Do one lesson today and this recap gets a lot more interesting.";
}

/** Deterministic sample learner, used only behind the clearly labeled preview toggle. */
export function sampleEngineState(base: EngineState): EngineState {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const xpByDay: Record<string, number> = {};
  const activeDates: string[] = [];
  const days = lastDays(84);
  days.forEach((d, i) => {
    const weekday = new Date(`${d}T12:00:00`).getDay();
    const chance = i > 50 ? 0.85 : 0.55;
    if (rand() < chance || weekday === 0) {
      const xp = Math.round(20 + rand() * (weekday === 0 || weekday === 6 ? 160 : 90));
      xpByDay[d] = xp;
      activeDates.push(d);
    }
  });
  const labels = [
    "Completed Sliding Window",
    "Quiz: Binary Search",
    "Solved Two Sum with a hash map",
    "Completed Tree Traversals",
    "Completed Recursion Basics",
    "Quiz: Dynamic Programming intro",
    "Solved Valid Parentheses (stack)",
    "Completed Hash Map internals",
    "Arena: The Array Warden",
  ];
  const activity = Array.from({ length: 60 }, (_, i) => {
    const d = activeDates[Math.floor(rand() * activeDates.length)];
    const hour = rand() < 0.55 ? 22 : 18;
    return {
      at: new Date(`${d}T${String(hour).padStart(2, "0")}:15:00`).toISOString(),
      type: (i % 9 === 8 ? "interview_round" : "lesson_completed") as EngineState["activity"][number]["type"],
      label: labels[Math.floor(rand() * labels.length)],
      xp: 25,
    };
  });
  const xp = Object.values(xpByDay).reduce((a, b) => a + b, 0);
  return {
    ...base,
    xp,
    xpByDay,
    activity,
    streak: { ...base.streak, current: 9, longest: 16, activeDates },
    achievements: [
      { id: "s1", title: "First steps", description: "", icon: "Footprints", unlockedAt: days[3] },
      { id: "s2", title: "Week streak", description: "", icon: "Flame", unlockedAt: days[40] },
    ],
    companion: { ...base.companion, weakSpots: { "Dynamic Programming": 4 } },
  };
}
