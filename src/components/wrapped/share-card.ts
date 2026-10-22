import type { WrappedStats } from "./stats";

export const CARD_W = 1080;
export const CARD_H = 1350;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function orb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Kip: a graph node with two satellite edges and a face. */
function kip(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(103,232,249,0.7)";
  ctx.lineWidth = r * 0.14;
  const sats: [number, number][] = [
    [cx + r * 1.9, cy - r * 1.1],
    [cx + r * 2.1, cy + r * 0.9],
  ];
  for (const [sx, sy] of sats) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
  for (const [sx, sy] of sats) {
    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "#22d3ee";
    ctx.fill();
  }
  const body = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  body.addColorStop(0, "#818cf8");
  body.addColorStop(1, "#4f46e5");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  for (const ex of [-0.32, 0.32]) {
    ctx.beginPath();
    ctx.ellipse(cx + ex * r, cy - r * 0.08, r * 0.12, r * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.2, r * 0.26, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.09;
  ctx.stroke();
  ctx.restore();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

export function drawShareCard(canvas: HTMLCanvasElement, s: WrappedStats, fontFamily: string) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const font = (w: number, px: number) => `${w} ${px}px ${fontFamily}`;
  const P = 88;

  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#312e81");
  bg.addColorStop(0.45, "#1e1b4b");
  bg.addColorStop(1, "#020617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  orb(ctx, CARD_W - 120, 160, 420, "rgba(34,211,238,0.28)");
  orb(ctx, 80, CARD_H - 200, 460, "rgba(99,102,241,0.35)");
  orb(ctx, CARD_W - 200, CARD_H - 420, 260, "rgba(251,191,36,0.12)");

  // header
  kip(ctx, P + 30, 128, 30);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(800, 40);
  ctx.textBaseline = "middle";
  ctx.fillText("devpath", P + 140, 128);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(165,180,252,0.9)";
  ctx.font = font(700, 22);
  ctx.fillText("WRAPPED", CARD_W - P, 128);
  ctx.textAlign = "left";

  // archetype
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#67e8f9";
  ctx.font = font(700, 24);
  ctx.fillText("MY LEARNING ARCHETYPE", P, 262);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(800, 80);
  const arch = wrapLines(ctx, s.archetype.name, CARD_W - P * 2).slice(0, 2);
  arch.forEach((l, i) => ctx.fillText(l, P, 345 + i * 88));
  let y = 345 + (arch.length - 1) * 88 + 56;
  ctx.fillStyle = "rgba(199,210,254,0.85)";
  ctx.font = font(400, 30);
  wrapLines(ctx, s.archetype.line, CARD_W - P * 2)
    .slice(0, 2)
    .forEach((l, i) => ctx.fillText(l, P, y + i * 42));
  y += 112;

  // stats grid
  const stats: { label: string; value: string; color: string }[] = [
    { label: "TOTAL XP", value: s.xp.toLocaleString(), color: "#67e8f9" },
    { label: "DAYS ACTIVE", value: String(s.daysActive), color: "#ffffff" },
    { label: "LONGEST STREAK", value: `${s.longestStreak}d`, color: "#fbbf24" },
    { label: "TOP TOPIC", value: s.topTopics[0]?.name ?? "—", color: "#a5b4fc" },
  ];
  const gw = (CARD_W - P * 2 - 20) / 2;
  const gh = 150;
  stats.forEach((st, i) => {
    const x = P + (i % 2) * (gw + 20);
    const yy = y + Math.floor(i / 2) * (gh + 20);
    rr(ctx, x, yy, gw, gh, 28);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(165,180,252,0.9)";
    ctx.font = font(700, 20);
    ctx.fillText(st.label, x + 32, yy + 48);
    ctx.fillStyle = st.color;
    let size = 64;
    ctx.font = font(800, size);
    while (ctx.measureText(st.value).width > gw - 64 && size > 28) {
      size -= 4;
      ctx.font = font(800, size);
    }
    ctx.fillText(st.value, x + 32, yy + 118);
  });
  y += gh * 2 + 20 + 56;

  // heatmap: 12 weeks x 7 days
  ctx.fillStyle = "rgba(165,180,252,0.9)";
  ctx.font = font(700, 20);
  ctx.fillText("LAST 12 WEEKS", P, y);
  y += 20;
  const max = Math.max(1, ...s.heat.map((h) => h.xp));
  const cols = 12;
  const gap = 6;
  const cellW = (CARD_W - P * 2 - gap * (cols - 1)) / cols;
  const cellH = 14;
  s.heat.forEach((h, i) => {
    const c = Math.floor(i / 7);
    const r = i % 7;
    rr(ctx, P + c * (cellW + gap), y + r * (cellH + 5), cellW, cellH, 5);
    ctx.fillStyle = h.xp === 0 ? "rgba(255,255,255,0.06)" : `rgba(34,211,238,${0.25 + (h.xp / max) * 0.75})`;
    ctx.fill();
  });
  y += 7 * (cellH + 5) + 60;

  // Kip verdict
  ctx.fillStyle = "#ffffff";
  ctx.font = font(500, 28);
  const maxLines = Math.max(1, Math.floor((CARD_H - 110 - y) / 40) + 1);
  wrapLines(ctx, `Kip: \u201C${s.verdict}\u201D`, CARD_W - P * 2)
    .slice(0, Math.min(3, maxLines))
    .forEach((l, i) => ctx.fillText(l, P, y + i * 40));

  // footer
  ctx.fillStyle = "rgba(165,180,252,0.7)";
  ctx.font = font(500, 22);
  const date = new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" });
  ctx.fillText(`Level ${s.level} · ${s.levelTitle} · ${date}`, P, CARD_H - 56);
  if (s.isSample) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#fbbf24";
    ctx.font = font(700, 22);
    ctx.fillText("SAMPLE DATA", CARD_W - P, CARD_H - 56);
    ctx.textAlign = "left";
  }
}

export function shareSummary(s: WrappedStats): string {
  return [
    `My DevPath Wrapped${s.isSample ? " (sample data)" : ""}`,
    `Archetype: ${s.archetype.name}`,
    `${s.xp.toLocaleString()} XP · ${s.daysActive} days active · longest streak ${s.longestStreak} days`,
    s.topTopics.length ? `Top topics: ${s.topTopics.map((t) => t.name).join(", ")}` : "",
    `Kip says: "${s.verdict}"`,
  ]
    .filter(Boolean)
    .join("\n");
}
