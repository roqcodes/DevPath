import type { WrappedStats } from "./types";

const W = 1080;
const H = 1350;

const ACCENT: Record<string, [string, string]> = {
  indigo: ["#312e81", "#4f46e5"],
  cyan: ["#0e7490", "#22d3ee"],
  amber: ["#b45309", "#fbbf24"],
  emerald: ["#047857", "#34d399"],
};

export function renderWrappedCardToCanvas(stats: WrappedStats, slideId: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const accent = slideId === "persona" ? ACCENT.indigo : slideId === "bigo" ? ACCENT.cyan : ACCENT.indigo;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, accent[0]);
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.12, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.15, H * 0.75, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillText("DEVPATH WRAPPED", 72, 100);

  ctx.fillStyle = "#e0e7ff";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText(stats.periodLabel, 72, 145);

  let title = stats.persona;
  let metric = stats.bigOAge;
  let body = stats.personaBlurb;

  if (slideId === "share" || slideId === "intro") {
    title = "Algorithm persona";
    metric = stats.persona;
    body = `${stats.headline}\n\n${stats.topWin}`;
  } else if (slideId === "xp") {
    title = "XP this period";
    metric = stats.totalXpInPeriod.toLocaleString();
    body = `Level ${stats.level} · ${stats.levelTitle}`;
  } else if (slideId === "streak") {
    title = "Streak";
    metric = `${stats.streakCurrent}d`;
    body = `Longest: ${stats.streakLongest} days`;
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px system-ui, sans-serif";
  wrapText(ctx, title, 72, 280, W - 144, 64);

  ctx.fillStyle = "#a5f3fc";
  ctx.font = "bold 72px system-ui, sans-serif";
  ctx.fillText(metric, 72, 420);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "32px system-ui, sans-serif";
  wrapText(ctx, body, 72, 520, W - 144, 42);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText("devpath · share your graph", 72, H - 80);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = text.split("\n");
  let cy = y;
  for (const paragraph of lines) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        line = word;
        cy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lineHeight;
    }
  }
}

export function downloadWrappedPng(stats: WrappedStats, slideId: string, filename?: string): void {
  const canvas = renderWrappedCardToCanvas(stats, slideId);
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `devpath-wrapped-${slideId}.png`;
  a.click();
}

export const WRAPPED_EXPORT_SIZE = { width: W, height: H };
