import { useState } from "react";
import { horaLimaPE } from "../../../../lib/formatos";
import { pagoEsRedundante, pagoTone } from "../utilidades";
import { CancelBtn, EditMeetBtn } from "./BotonesCita";

function Pill({ tone, children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-neutral-100 text-neutral-500 border-neutral-200",
    primary: "bg-primary/10 text-primary border-primary/20",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tones[tone]}`}>{children}</span>;
}

// Fila compacta de cita (estilo ".appt" del mock). Clic para expandir y ver
// chips + acciones reales (Unirse / Editar Meet / Cancelar) sin salir de la lista.
export default function ApptRow({ reserva: r, onChanged, mostrarAsesor, pasada }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <article className={`rounded-xl transition-colors ${abierta ? "bg-neutral-50" : "hover:bg-neutral-50"} ${pasada ? "opacity-55" : ""}`}>
      <button onClick={() => setAbierta((v) => !v)}
        className="w-full grid grid-cols-[52px_minmax(0,1fr)] gap-2.5 items-center p-2.5 text-left">
        <div>
          <b className="block text-[11px] text-neutral-800">{r.hora_inicio}</b>
          <span className="block text-[8.5px] text-neutral-400">{r.fecha.slice(5)}</span>
        </div>
        <div className="min-w-0">
          <b className="block text-[10.5px] text-neutral-800 truncate">{r.cliente?.nombre || "Sin nombre"}</b>
          <span className="block text-[9px] text-neutral-400 truncate mt-0.5">
            {r.hora_inicio}{mostrarAsesor && r.asesor ? ` · ${r.asesor.nombre}` : ""}
          </span>
          <span className={`inline-flex items-center mt-[5px] px-1.5 py-[3px] rounded-full text-[8px] font-extrabold ${
            r.estado === "CANCELADA" ? "bg-red-50 text-red-500"
              : !pagoEsRedundante(r.estado, r.pago_estado) && r.pago_estado === "PENDIENTE" ? "bg-[#fff2e7] text-[#b46a37]"
              : "bg-[#edf8f2] text-[#277553]"
          }`}>
            {r.estado === "CANCELADA" ? "Cancelada" : r.estado === "CONFIRMADA" || r.estado === "COMPLETADA" ? "Confirmada" : "Pago pendiente"}
          </span>
        </div>
      </button>

      {abierta && (
        <div className="px-2.5 pb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Pill tone="neutral">{r.monto} {r.moneda}</Pill>
            {!pagoEsRedundante(r.estado, r.pago_estado) && (
              <Pill tone={pagoTone(r.pago_estado)}>Pago {r.pago_estado.toLowerCase()}</Pill>
            )}
            {r.estado === "PENDIENTE_PAGO" && r.hold_expira_en && (
              <Pill tone="amber">vence {horaLimaPE(r.hold_expira_en)}</Pill>
            )}
          </div>
          {r.cliente?.email_contacto && (
            <p className="text-[10px] text-neutral-500 mb-2 truncate">
              {r.cliente.email_contacto}{r.cliente?.telefono ? ` · ${r.cliente.telefono}` : ""}
            </p>
          )}
          <div className="flex gap-1.5 flex-wrap">
            {r.meet_url ? (
              <a href={r.meet_url} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-primary text-white rounded-lg text-[10.5px] font-bold hover:opacity-90">
                Unirse
              </a>
            ) : (
              <EditMeetBtn reserva={r} onChanged={onChanged}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10.5px] font-bold hover:bg-amber-100" />
            )}
            <CancelBtn reserva={r} onChanged={onChanged}
              className="px-2.5 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-[10.5px] font-bold hover:bg-red-50" />
          </div>
        </div>
      )}
    </article>
  );
}
