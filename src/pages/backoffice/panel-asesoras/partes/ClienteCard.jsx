// src/pages/backoffice/panel-asesoras/partes/ClienteCard.jsx
import { MoreVertical, ChevronDown } from "lucide-react";
import { SVC_LABELS, SVC_COLORS } from "./constantes";
import { estadoLabel, ini, estadoBadgeCls } from "./utilidades";
import { CopyBtn } from "./CopyBtn";
import { ClienteDetail } from "./ClienteDetail";

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE CARD
═══════════════════════════════════════════════════════════════════════════ */
export function ClienteCard({ c, isExp, onToggle, onMenu }) {
  const svc = c._svc;
  const colors = SVC_COLORS[svc] || SVC_COLORS.master;
  const hasBeca = c.beca?.aprobable;
  const hasPend = c.pending?.length > 0;

  let subtitle = `${SVC_LABELS[svc]} · ${c.paquete || "Sin paquete"}`;
  if ((svc === "visa" || svc === "ee") && c.fases) {
    const lastDone = [...(c.fases)].reverse().find(f => f.done);
    subtitle += lastDone ? ` · ${lastDone.label}` : " · Sin iniciar";
  }
  if (c.promedio) subtitle += ` · Prom: ${c.promedio}`;
  if (c.progreso) subtitle += ` · ${c.progreso.pct}% ${c.progreso.etiqueta}`;

  return (
    <div className={`border-t border-neutral-100 first:border-t-0 ${c.portalLinked ? "border-l-[3px] border-l-violet-500" : ""}`}>
      {/* Fila cabecera */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-neutral-50 select-none" onClick={onToggle}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: colors.bg, color: colors.text }}>
          {ini(c.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[13px] font-bold text-neutral-800 truncate max-w-[220px]" title={c.name}>{c.name}</span>
            <CopyBtn value={c.name} label="Nombre" />
            {c.portalLinked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200 shrink-0">portal</span>}
            {hasBeca && <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 shrink-0">🎓 beca</span>}
          </div>
          <div className="text-[11px] text-neutral-400 truncate mt-0.5">{subtitle}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${estadoBadgeCls(c.estado)}`}>
            {estadoLabel(c.estado)}
          </span>
          {hasPend && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {c.pending.length}
            </span>
          )}
          <button onClick={onMenu} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition" aria-label={`Acciones de ${c.name}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
          <button onClick={onToggle} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition" aria-label={isExp ? "Contraer" : "Expandir"}>
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isExp ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {isExp && <ClienteDetail c={c} />}
    </div>
  );
}
