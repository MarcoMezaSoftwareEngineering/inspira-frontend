// src/pages/backoffice/panel-asesoras/partes/Metricas.jsx

export function Metricas({ visible, act, noact, activar, pend }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {[
        ["Total", visible.length, "text-neutral-800"],
        ["Activos", act, "text-emerald-600"],
        ["No activos", noact, "text-neutral-800"],
        ["Por activar", activar, "text-amber-600"],
        ["Con pendientes", pend, "text-red-600"],
      ].map(([label, n, cls]) => (
        <div key={label} className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-neutral-400 font-bold">{label}</div>
          <div className={`text-xl font-extrabold mt-1 ${cls}`}>{n}</div>
        </div>
      ))}
    </div>
  );
}
