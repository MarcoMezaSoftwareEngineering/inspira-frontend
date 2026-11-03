import { useState } from "react";
import { horaLimaPE } from "../../../../lib/formatos";
import { pagoEsRedundante } from "../utilidades";
import { CancelBtn, ConfirmarPagoBtn } from "./BotonesCita";
import FichaReserva from "./FichaReserva";

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

const BTN = "px-3 py-2 rounded-xl text-[11.5px] font-bold text-center";

// Fila de cita: quién, cuándo y cómo va, con lo de todos los días a mano (confirmar pago, unirse,
// WhatsApp, cancelar). Todo lo demás —formulario previo, notas, informe, avisos, cotización— está
// dentro de «Administrar», para que con muchas asesorías la lista siga clara.
export default function ApptRow({ reserva: r, onChanged, mostrarAsesor, pasada }) {
  const [ficha, setFicha] = useState(false);
  const pagoManual = ["TRANSFERENCIA", "DESPUES", "PENDIENTE"].includes(r.metodo_pago) && ["CONFIRMADA", "COMPLETADA"].includes(r.estado);
  const pendiente = r.estado === "PENDIENTE_PAGO";

  return (
    <article className={`rounded-xl border border-neutral-200 bg-white p-3 ${pasada ? "opacity-60" : ""}`}>
      <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-2.5 items-start">
        <div>
          <b className="block text-[12px] text-neutral-800">{r.hora_inicio}</b>
          <span className="block text-[9px] text-neutral-400">{r.fecha.slice(5)}</span>
        </div>
        <div className="min-w-0">
          <b className="block text-[12.5px] text-neutral-800 truncate">{r.cliente?.nombre || "Sin nombre"}</b>
          <span className="block text-[10px] text-neutral-400 truncate">
            {r.cliente?.email_contacto}{mostrarAsesor && r.asesor ? ` · ${r.asesor.nombre}` : ""}
          </span>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill tone={r.estado === "CANCELADA" ? "red" : pendiente ? "amber" : "green"}>
              {r.estado === "CANCELADA" ? "Cancelada" : pendiente ? "Pago pendiente" : r.no_asistio_en ? "No asistió" : "Confirmada"}
            </Pill>
            {pagoManual && <Pill tone="green">Pago confirmado manualmente</Pill>}
            {r.metodo_pago === "EQUIPO" && r.estado !== "CANCELADA" && <Pill tone={r.pago_estado === "APROBADO" ? "green" : "primary"}>{r.pago_estado === "APROBADO" ? "Agendada por el equipo · pagada" : "Agendada por el equipo · pago aparte"}</Pill>}
            {pendiente && r.tiene_voucher && <Pill tone="green">subió el voucher</Pill>}
            {pendiente && r.hold_expira_en && <Pill tone="amber">vence {horaLimaPE(r.hold_expira_en)}</Pill>}
            {r.cancelada_por === "INSPIRA" && <Pill tone="red">cancelada por Inspira</Pill>}
            {r.reagenda_autorizada && <Pill tone="amber">reagendar autorizado</Pill>}
            {r.informe_estado === "BORRADOR" && <Pill tone="amber">informe por aprobar</Pill>}
            {r.informe_estado === "ENVIADO" && <Pill tone="green">informe enviado</Pill>}
            {!pagoEsRedundante(r.estado, r.pago_estado) && r.pago_estado === "PENDIENTE" && !pendiente && <Pill tone="neutral">{r.monto} {r.moneda}</Pill>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <ConfirmarPagoBtn reserva={r} onChanged={onChanged} className={`${BTN} bg-emerald-600 text-white hover:opacity-90 disabled:opacity-50`} />
        {r.meet_url && r.estado !== "CANCELADA" && (
          <a href={r.meet_url} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-primary text-white hover:opacity-90`}>Unirse</a>
        )}
        {r.whatsapp_url && (
          <a href={r.whatsapp_url} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-[#25D366] text-white hover:opacity-90`}>Enviar por WhatsApp</a>
        )}
        <CancelBtn reserva={r} onChanged={onChanged} className={`${BTN} bg-white border border-red-200 text-red-500 hover:bg-red-50`} />
        <button type="button" onClick={() => setFicha(true)} className={`${BTN} ml-auto bg-primary-dark text-white hover:opacity-90`}>Administrar</button>
      </div>

      {ficha && <FichaReserva reserva={r} onCerrar={() => setFicha(false)} onChanged={onChanged} />}
    </article>
  );
}
