export function DsaGraphMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 280"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        className="motif-line"
        d="M48 196 H372"
        stroke="rgba(165,180,252,0.28)"
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 52}
            y="176"
            width="36"
            height="36"
            rx="8"
            fill={i === 3 ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.06)"}
            stroke={i === 3 ? "rgba(125,211,252,0.7)" : "rgba(165,180,252,0.35)"}
          />
          <text
            x={58 + i * 52}
            y="198"
            textAnchor="middle"
            fill={i === 3 ? "#7dd3fc" : "rgba(199,210,254,0.8)"}
            fontSize="12"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {i === 3 ? 16 : [3, 9, 12, 16, 23, 31, 40][i]}
          </text>
        </g>
      ))}

      <path
        className="motif-line auth-delay-2"
        d="M210 48 L132 108 L88 168 M210 48 L288 108 L332 168 M132 108 L210 108 L288 108"
        stroke="rgba(129,140,248,0.45)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle className="motif-node" cx="210" cy="48" r="9" fill="#38bdf8" />
      <circle className="motif-node auth-delay-1" cx="132" cy="108" r="7" fill="#a5b4fc" />
      <circle className="motif-node auth-delay-2" cx="288" cy="108" r="7" fill="#a5b4fc" />
      <circle className="motif-node auth-delay-3" cx="88" cy="168" r="6" fill="#c7d2fe" />
      <circle className="motif-node auth-delay-4" cx="332" cy="168" r="6" fill="#c7d2fe" />
      <circle cx="210" cy="108" r="4.5" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}
