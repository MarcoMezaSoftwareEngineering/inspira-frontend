// src/pages/panel/components/mis-servicios/sections/EncabezadoSolicitud.jsx
import { formatearFecha, badgeEstadoSolicitud } from "../utils";

export default function EncabezadoSolicitud({ detalle, solicitudBase, progresoChecklist }) {
  const estadoBadge = badgeEstadoSolicitud(detalle?.estado?.nombre, detalle?.estado?.es_final);

  const progresoColor = progresoChecklist >= 100 ? "bg-emerald-500" : "bg-accent";

  return (
    <div className="flex items-center justify-between gap-6">
      {/* Info izquierda */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-primary-light uppercase tracking-widest mb-1">
          Solicitud #{detalle.id_solicitud}
        </p>
        <h2 className="text-xl font-bold text-neutral-900 leading-tight truncate">
          {detalle.titulo || solicitudBase.titulo || "Servicio sin título"}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {detalle.tipo?.nombre && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              {detalle.tipo.nombre}
            </span>
          )}
          <span className={estadoBadge.classes}>{estadoBadge.text}</span>
          <span className="text-xs text-neutral-400 font-mono bg-neutral-100 px-2 py-0.5 rounded hidden sm:inline">
            {detalle.codigo_publico}
          </span>
          <span className="text-xs text-neutral-400">
            · {formatearFecha(detalle.fecha_creacion)}
          </span>
        </div>
      </div>

      {/* Progreso derecha */}
      <div className="shrink-0 w-40 sm:w-52">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs font-semibold text-neutral-600">Progreso</span>
          <span className="text-lg font-bold text-neutral-900">{progresoChecklist}%</span>
        </div>
        <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progresoColor}`}
            style={{ width: `${progresoChecklist}%` }}
          />
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          {progresoChecklist >= 100
            ? "¡Documentos completos!"
            : progresoChecklist === 0
            ? "Sube tus documentos"
            : "En progreso"}
        </p>
      </div>
    </div>
  );
}
