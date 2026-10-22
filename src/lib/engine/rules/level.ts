import type { LevelInfo } from "../types";

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  const titles = ["Newcomer", "Tracer", "Iterator", "Builder", "Optimizer", "Architect", "Grandmaster"];
  return {
    level,
    title: titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))],
    xpIntoLevel: rest,
    xpForNext: need,
    pct: Math.round((rest / need) * 100),
  };
}
