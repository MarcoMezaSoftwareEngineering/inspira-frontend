// src/pages/backoffice/panel-asesoras/partes/PagosSection.jsx
import { fv, miss, mkPagos } from "./utilidades";

export function PagosSection({ pagos }) {
  const p = pagos || mkPagos();
  const pct = p.total ? Math.min(100, Math.round((parseFloat(p.pagadas)||0) / parseFloat(p.total) * 100)) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[["Tipo", p.tipo], ["Total (€)", p.total], ["Cuotas", p.cuotas], ["Pagado (€)", p.pagadas]].map(([l,v]) => (
          <div key={l} className="border border-neutral-200 bg-neutral-50/60 rounded-lg p-2.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wide font-bold">{l}</div>
            <div className="text-xs font-bold text-neutral-700 mt-0.5">{fv(v)}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-neutral-400 min-w-[68px]">Progreso</span>
        <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[11px] font-bold min-w-[100px] text-right ${miss(p.pendiente) ? "text-red-500" : "text-green-700"}`}>
          Pendiente: {fv(p.pendiente)}
        </span>
      </div>
    </div>
  );
}
