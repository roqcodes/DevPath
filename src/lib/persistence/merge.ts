import type {
  Achievement,
  ActivityEntry,
  CompanionMemory,
  EngineState,
  Quest,
  ReviewCard,
  StreakState,
} from "@/lib/engine/types";

/**
 * Pure, deterministic merge of a device-local engine state with the server
 * snapshot. Never loses progress: counters take the max, collections union.
 * Device-local preferences (daily goal, onboarding, pending celebration) win.
 */

const MAX_ACTIVE_DATES = 120;
const MAX_ACTIVITY = 200;
const MAX_WINS = 20;

function unionSorted(a: string[] = [], b: string[] = [], cap?: number): string[] {
  const out = Array.from(new Set([...a, ...b])).sort();
  return cap ? out.slice(-cap) : out;
}

function mergeStreak(local: StreakState, remote: StreakState): StreakState {
  const lDate = local.lastActiveDate ?? "";
  const rDate = remote.lastActiveDate ?? "";
  const primary =
    lDate > rDate ? local : rDate > lDate ? remote : (local.current ?? 0) >= (remote.current ?? 0) ? local : remote;
  return {
    ...primary,
    current: primary.current ?? 0,
    longest: Math.max(local.longest ?? 0, remote.longest ?? 0, primary.current ?? 0),
    lastActiveDate: primary.lastActiveDate ?? "",
    freezes: primary.freezes ?? 0,
    frozenDates: unionSorted(local.frozenDates, remote.frozenDates, MAX_ACTIVE_DATES),
    activeDates: unionSorted(local.activeDates, remote.activeDates, MAX_ACTIVE_DATES),
  };
}

function mergeAchievements(local: Achievement[] = [], remote: Achievement[] = []): Achievement[] {
  const byId = new Map<string, Achievement>();
  for (const a of [...remote, ...local]) {
    const prev = byId.get(a.id);
    if (!prev) {
      byId.set(a.id, a);
      continue;
    }
    const unlockedAt =
      prev.unlockedAt && a.unlockedAt
        ? prev.unlockedAt < a.unlockedAt
          ? prev.unlockedAt
          : a.unlockedAt
        : prev.unlockedAt ?? a.unlockedAt;
    byId.set(a.id, { ...prev, ...a, unlockedAt });
  }
  return Array.from(byId.values());
}

function mergeReviewQueue(local: ReviewCard[] = [], remote: ReviewCard[] = []): ReviewCard[] {
  const byId = new Map<string, ReviewCard>();
  for (const c of [...remote, ...local]) {
    const prev = byId.get(c.id);
    if (!prev || (c.dueAt ?? "") > (prev.dueAt ?? "")) byId.set(c.id, c);
  }
  return Array.from(byId.values());
}

function mergeQuests(
  local: Quest[] = [],
  remote: Quest[] = [],
  localOn: string,
  remoteOn: string
): { quests: Quest[]; questsRefreshedOn: string } {
  if (localOn > remoteOn) return { quests: local, questsRefreshedOn: localOn };
  if (remoteOn > localOn) return { quests: remote, questsRefreshedOn: remoteOn };
  const byId = new Map<string, Quest>();
  for (const q of remote) byId.set(q.id, q);
  for (const q of local) {
    const prev = byId.get(q.id);
    byId.set(
      q.id,
      prev ? { ...q, progress: Math.max(prev.progress, q.progress), claimed: prev.claimed || q.claimed } : q
    );
  }
  return { quests: Array.from(byId.values()), questsRefreshedOn: localOn };
}

function mergeActivity(local: ActivityEntry[] = [], remote: ActivityEntry[] = []): ActivityEntry[] {
  const seen = new Set<string>();
  const out: ActivityEntry[] = [];
  for (const e of [...local, ...remote]) {
    const key = `${e.at}|${e.type}|${e.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, MAX_ACTIVITY);
}

export function mergeCompanionMemory(local: CompanionMemory, remote: CompanionMemory): CompanionMemory {
  const lSeen = local.lastSeenAt ?? "";
  const rSeen = remote.lastSeenAt ?? "";
  const newer = rSeen > lSeen ? remote : local;
  const weakSpots: Record<string, number> = { ...(remote.weakSpots ?? {}) };
  for (const [topic, n] of Object.entries(local.weakSpots ?? {})) {
    weakSpots[topic] = Math.max(weakSpots[topic] ?? 0, n);
  }
  const wins = Array.from(new Set([...(newer.wins ?? []), ...(local.wins ?? []), ...(remote.wins ?? [])])).slice(
    0,
    MAX_WINS
  );
  return {
    ...remote,
    ...local,
    goal: local.goal ?? remote.goal,
    level: local.level ?? remote.level,
    minutesPerDay: local.minutesPerDay ?? remote.minutesPerDay,
    weakSpots,
    wins,
    personality: newer.personality ?? local.personality ?? remote.personality,
    nudgesMuted: newer.nudgesMuted ?? false,
    lastSeenAt: lSeen > rSeen ? local.lastSeenAt : remote.lastSeenAt ?? local.lastSeenAt,
  };
}

export function mergeEngineStates(local: EngineState | null, remote: EngineState | null): EngineState | null {
  if (!local) return remote;
  if (!remote) return local;

  const xpByDay: Record<string, number> = { ...(remote.xpByDay ?? {}) };
  for (const [day, n] of Object.entries(local.xpByDay ?? {})) {
    xpByDay[day] = Math.max(xpByDay[day] ?? 0, n);
  }

  const { quests, questsRefreshedOn } = mergeQuests(
    local.quests,
    remote.quests,
    local.questsRefreshedOn ?? "",
    remote.questsRefreshedOn ?? ""
  );

  return {
    ...remote,
    ...local,
    version: 1,
    xp: Math.max(local.xp ?? 0, remote.xp ?? 0),
    xpByDay,
    dailyGoalXp: local.dailyGoalXp ?? remote.dailyGoalXp,
    streak: mergeStreak(local.streak, remote.streak),
    achievements: mergeAchievements(local.achievements, remote.achievements),
    quests,
    questsRefreshedOn,
    reviewQueue: mergeReviewQueue(local.reviewQueue, remote.reviewQueue),
    activity: mergeActivity(local.activity, remote.activity),
    companion: mergeCompanionMemory(local.companion, remote.companion),
    pendingCelebration: local.pendingCelebration ?? null,
    onboarding: local.onboarding ?? remote.onboarding,
  };
}
