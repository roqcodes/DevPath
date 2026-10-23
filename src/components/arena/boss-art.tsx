import type { BossId } from "./bank";

/** Original geometric boss portraits. Pure SVG, decorative. */
export function BossArt({ id, size = 96, className }: { id: BossId; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={className}>
      {id === "warden" && <Warden />}
      {id === "hydra" && <Hydra />}
      {id === "oracle" && <Oracle />}
    </svg>
  );
}

function Warden() {
  return (
    <g>
      <path d="M50 6 L88 20 V50 C88 72 70 88 50 95 C30 88 12 72 12 50 V20 Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={22 + i * 14.5} y={38} width={12} height={12} rx={2.5} fill={i === 2 ? "#fbbf24" : "#cffafe"} opacity={i === 2 ? 1 : 0.85} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <text key={i} x={28 + i * 14.5} y={60} fontSize="6" textAnchor="middle" fill="#a5f3fc" fontFamily="monospace">
          {i}
        </text>
      ))}
      <circle cx="38" cy="24" r="3.2" fill="#ecfeff" />
      <circle cx="62" cy="24" r="3.2" fill="#ecfeff" />
      <path d="M36 74 H64" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Hydra() {
  const heads = [
    { x: 22, y: 26 },
    { x: 50, y: 14 },
    { x: 78, y: 26 },
  ];
  return (
    <g>
      {heads.map((h, i) => (
        <path key={i} d={`M50 78 Q${(h.x + 50) / 2} ${h.y + 30} ${h.x} ${h.y}`} stroke="#34d399" strokeWidth="5" fill="none" strokeLinecap="round" />
      ))}
      <ellipse cx="50" cy="82" rx="24" ry="12" fill="#065f46" stroke="#6ee7b7" strokeWidth="2" />
      {heads.map((h, i) => (
        <g key={i}>
          <circle cx={h.x} cy={h.y} r="10" fill="#047857" stroke="#a7f3d0" strokeWidth="2" />
          <circle cx={h.x - 3} cy={h.y - 2} r="1.8" fill="#fef3c7" />
          <circle cx={h.x + 3} cy={h.y - 2} r="1.8" fill="#fef3c7" />
        </g>
      ))}
      <text x="50" y="86" fontSize="7" textAnchor="middle" fill="#a7f3d0" fontFamily="monospace">
        f(n-1)
      </text>
    </g>
  );
}

function Oracle() {
  return (
    <g>
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#7c2d12" stroke="#fcd34d" strokeWidth="2" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={18 + c * 17}
            y={18 + r * 17}
            width={13}
            height={13}
            rx={2}
            fill={r + c < 3 ? "#fcd34d" : "#fde68a"}
            opacity={r + c < 3 ? 0.9 : 0.18}
          />
        ))
      )}
      <ellipse cx="50" cy="52" rx="20" ry="11" fill="#1e1b4b" stroke="#fcd34d" strokeWidth="2" />
      <circle cx="50" cy="52" r="6" fill="#fbbf24" />
      <circle cx="51.5" cy="50.5" r="2" fill="#1e1b4b" />
    </g>
  );
}
