export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysKey(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return todayKey(d);
}

export function daysBetween(fromDay: string, toDay: string): number {
  const a = new Date(`${fromDay}T12:00:00`).getTime();
  const b = new Date(`${toDay}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Days strictly between from and to (exclusive of endpoints). */
export function daysBetweenExclusive(fromDay: string, toDay: string): string[] {
  const n = daysBetween(fromDay, toDay);
  if (n <= 1) return [];
  const out: string[] = [];
  for (let i = 1; i < n; i++) out.push(addDaysKey(fromDay, i));
  return out;
}

export function weekKey(d = new Date()): string {
  const day = new Date(d);
  day.setHours(12, 0, 0, 0);
  const thursday = new Date(day);
  thursday.setDate(day.getDate() + 3 - ((day.getDay() + 6) % 7));
  const yearStart = new Date(thursday.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((thursday.getTime() - yearStart.getTime()) / 86_400_000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7
    );
  return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
