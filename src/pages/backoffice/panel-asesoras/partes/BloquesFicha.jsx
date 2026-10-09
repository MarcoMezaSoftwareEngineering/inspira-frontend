// src/pages/backoffice/panel-asesoras/partes/BloquesFicha.jsx
// Piezas comunes de los resúmenes del detalle: tarjeta, barra de progreso,
// rejilla de campos y accesos al expediente y a Drive.
import { boGET } from "../../../../services/backofficeApi";
import { DriveIcon, openDriveFolder } from "../../driveToast";
import { irAExpediente, fv } from "./utilidades";
import { CopyBtn } from "./CopyBtn";

export function InfoCard({ title, right, children }) {
  return (
    <section className="border border-neutral-200 bg-neutral-50/60 rounded-xl p-3 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{title}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function ProgresoBar({ progreso }) {
  const pct = progreso?.pct ?? 0;
  return (
    <div className="flex items-center gap-2 w-[130px] shrink-0" title={`Expediente ${progreso?.etiqueta || ""}`}>
      <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-neutral-600 tabular-nums">{pct}%</span>
    </div>
  );
}

export function ExpedienteLink({ c }) {
  return (
    <button
      title="Abrir el expediente completo"
      onClick={() => irAExpediente(c._id)}
      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm active:scale-95 transition-all duration-150 shrink-0 text-[11px]"
    >
      <span className="text-neutral-500 group-hover:text-primary transition-colors font-semibold">
        Expediente #{c._id} ↗
      </span>
    </button>
  );
}

export function FieldGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
      {fields.map(([label, value, isMiss, copyable, manual]) => (
        <div key={label} className="min-w-0">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wide font-bold">
            {label}
            {manual && <span className="ml-1 text-amber-500" title="Valor forzado a mano">✎</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className={`text-xs truncate ${isMiss ? "text-red-500 italic" : "text-neutral-700 font-semibold"}`} title={String(fv(value))}>{fv(value)}</span>
            {copyable && !isMiss && <CopyBtn value={value} label={label} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CarpetaLinks({ c }) {
  return (
    <button
      title="Abrir carpeta en Drive"
      onClick={() => openDriveFolder(() => boGET(`/backoffice/panel-asesoras/${c._id}/drive-folder-url`))}
      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 shrink-0 text-[11px]"
    >
      <DriveIcon size={13} />
      <span className="text-neutral-500 group-hover:text-neutral-800 transition-colors font-semibold">Abrir Drive ↗</span>
    </button>
  );
}
