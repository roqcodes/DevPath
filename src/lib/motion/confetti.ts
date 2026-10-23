import { prefersReducedMotion } from "./reduced-motion";

export interface CelebrateOptions {
  kind?: "small" | "big";
  /** Burst origin. Values in 0..1 are viewport fractions; larger values are CSS pixels. Default: upper center. */
  origin?: { x: number; y: number };
}

type Shape = "square" | "circle" | "node";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: Shape;
  age: number;
  life: number;
}

const COLORS = ["#4f46e5", "#22d3ee", "#f59e0b", "#10b981", "#818cf8"];
const SHAPES: Shape[] = ["square", "square", "circle", "circle", "node"];
const GRAVITY = 0.22;
const DRAG = 0.985;
const MAX_PARTICLES = 400;

let canvas: HTMLCanvasElement | null = null;
let c2d: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let raf = 0;
let last = 0;
let dpr = 1;

function resize() {
  if (!canvas || !c2d) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function mount(): boolean {
  if (canvas) return true;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000;";
  c2d = canvas.getContext("2d");
  if (!c2d) {
    canvas = null;
    return false;
  }
  document.body.appendChild(canvas);
  resize();
  window.addEventListener("resize", resize);
  return true;
}

function unmount() {
  cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener("resize", resize);
  canvas?.remove();
  canvas = null;
  c2d = null;
  particles = [];
}

function draw(p: Particle, ctx: CanvasRenderingContext2D) {
  const fade = p.age > p.life * 0.7 ? 1 - (p.age - p.life * 0.7) / (p.life * 0.3) : 1;
  ctx.globalAlpha = Math.max(0, fade);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.color;
  if (p.shape === "square") {
    // Flip on the Y axis to fake a 3D tumble.
    ctx.scale(1, Math.cos(p.rot * 2));
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
  } else if (p.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Graph node: ring + core + a short edge.
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, p.size / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.size / 2, 0);
    ctx.lineTo(p.size * 1.1, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function frame(now: number) {
  if (!canvas || !c2d) return;
  const dt = Math.min((now - last) / 16.667, 3);
  last = now;
  const w = window.innerWidth;
  const h = window.innerHeight;
  c2d.clearRect(0, 0, w, h);
  const drag = Math.pow(DRAG, dt);
  particles = particles.filter((p) => {
    p.age += dt * 16.667;
    if (p.age >= p.life || p.y > h + 40) return false;
    p.vx *= drag;
    p.vy = p.vy * drag + GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    draw(p, c2d!);
    return true;
  });
  c2d.globalAlpha = 1;
  if (particles.length === 0) unmount();
  else raf = requestAnimationFrame(frame);
}

function resolve(v: number, extent: number) {
  return v >= 0 && v <= 1 ? v * extent : v;
}

/** Full-screen canvas particle burst. Self-removing, pointer-events none, no-op under reduced motion. */
export function celebrate(opts?: CelebrateOptions): void {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  if (!mount()) return;
  const big = opts?.kind === "big";
  const count = big ? 160 : 80;
  const ox = resolve(opts?.origin?.x ?? 0.5, window.innerWidth);
  const oy = resolve(opts?.origin?.y ?? 0.3, window.innerHeight);
  const power = big ? 15 : 11;
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    // Mostly upward fan, a little full-circle spray.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (big ? Math.PI * 1.5 : Math.PI * 1.1);
    const speed = power * (0.35 + Math.random() * 0.65);
    particles.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: SHAPES[(Math.random() * SHAPES.length) | 0],
      age: 0,
      life: (big ? 2200 : 1600) + Math.random() * 900,
    });
  }
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}
