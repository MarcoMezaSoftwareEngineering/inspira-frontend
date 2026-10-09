// src/pages/backoffice/panel-asesoras/partes/Cabecera.jsx
import { exportJSON } from "./utilidades";

export function Cabecera({ data, setAddMode, setEditTarget }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-primary mb-1.5">Operación de clientes</div>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-primary leading-tight">Panel asesoras</h1>
        <p className="text-[13px] text-neutral-500 mt-0.5">Información completa, compacta y sin perder datos operativos.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => exportJSON(data)}
          className="h-10 px-3.5 text-[13px] rounded-lg border border-neutral-200 bg-white text-neutral-600 font-semibold hover:bg-neutral-50 transition">
          Exportar JSON
        </button>
        <button onClick={() => { setAddMode(true); setEditTarget(null); }}
          className="h-10 px-3.5 text-[13px] rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition">
          + Agregar cliente
        </button>
      </div>
    </div>
  );
}
