import { scoreColor, scoreStroke } from "./utilidades";

// ── Score ring SVG ─────────────────────────────────────────────────────────────

export default function ScoreRing({ score }) {
  const r = 16;
  const circ = 2 * Math.PI * r; // ≈ 100.53
  const pct = score != null ? score : 0;
  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke={scoreStroke(score)}
          strokeWidth="3.5"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-[10px] font-black leading-none ${scoreColor(score)}`}>
          {score != null ? score : "—"}
        </span>
      </div>
    </div>
  );
}
