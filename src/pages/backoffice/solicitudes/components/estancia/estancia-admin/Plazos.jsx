/* ── 1 · Datos y plazos ──────────────────────────────────────────────────── */

export function Plazos({ plazos }) {
  if (!plazos) return null;
  const filas = [
    ["Antelación · 2 meses antes de clases", plazos.antelacion],
    ["Tope desde la llegada a España", plazos.tope],
  ].filter(([, d]) => d);
  if (!filas.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {filas.map(([label, d]) => (
        <div key={label} className={`rounded-xl border px-3 py-2.5 ${
          d.a_tiempo ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/50" : "border-red-300 bg-red-50/60"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wide font-mono text-neutral-500 leading-tight">
            {label}
          </p>
          <p className={`text-[17px] font-bold leading-tight mt-0.5 ${
            d.a_tiempo ? "text-[#14532d]" : "text-red-700"
          }`}>{d.limite}</p>
          <p className="text-[11px] text-neutral-500">
            {d.a_tiempo ? `quedan ${d.dias_restantes} días` : `pasado hace ${Math.abs(d.dias_restantes)} días`}
          </p>
        </div>
      ))}
    </div>
  );
}
