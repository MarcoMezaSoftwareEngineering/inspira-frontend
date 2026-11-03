import { useState } from "react";
import { horaLimaPE } from "../../../../lib/formatos";
import Icono from "../../../../components/common/Icono";
import { CancelBtn, ConfirmarPagoBtn } from "./BotonesCita";
import FichaReserva from "./FichaReserva";
import { Avatar, Chip } from "../../crm/kit";
import { BOTON } from "../../crm/estilos";

// Fila de cita al estilo CRM: la persona (avatar, nombre, hora, estado) se toca entera para abrir su
// ficha; debajo, solo lo de todos los días (confirmar pago, unirse, WhatsApp, cancelar). Formulario,
// notas, informe, avisos y cotización viven en la ficha, para que con muchas asesorías la lista siga clara.
export default function ApptRow({ reserva: r, onChanged, mostrarAsesor, pasada }) {
  const [ficha, setFicha] = useState(false);
  const pagoManual = ["TRANSFERENCIA", "DESPUES", "PENDIENTE"].includes(r.metodo_pago) && ["CONFIRMADA", "COMPLETADA"].includes(r.estado);
  const pendiente = r.estado === "PENDIENTE_PAGO";
  const cancelada = r.estado === "CANCELADA";
  const nombre = r.cliente?.nombre || r.cliente?.email_contacto || "Sin nombre";

  const estado = cancelada ? <Chip tono="mal">{r.cancelada_por === "INSPIRA" ? "Cancelada por Inspira" : "Cancelada"}</Chip>
    : pendiente ? <Chip tono="ojo">Pago pendiente{r.hold_expira_en ? ` · vence ${horaLimaPE(r.hold_expira_en)}` : ""}</Chip>
    : r.no_asistio_en ? <Chip tono="mal">No asistió</Chip>
    : <Chip tono="ok">Confirmada</Chip>;

  return (
    <article className={`rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80 ${pasada ? "opacity-75" : ""}`}>
      <button type="button" onClick={() => setFicha(true)} aria-label={`Abrir la reserva de ${nombre}`}
        className="flex w-full items-start gap-3 rounded-2xl p-3.5 text-left hover:bg-neutral-50/70">
        <Avatar nombre={nombre} tam={42} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[15px] font-bold text-neutral-900">{nombre}</span>
            <span className="shrink-0 text-[15px] font-bold tabular-nums text-primary-dark">{r.hora_inicio}</span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-[#4f6672]">
            {[r.cliente?.email_contacto, mostrarAsesor && r.asesor ? r.asesor.nombre : null].filter(Boolean).join(" · ")}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {estado}
            {pagoManual && <Chip tono="ok">Pago confirmado a mano</Chip>}
            {r.metodo_pago === "EQUIPO" && !cancelada && <Chip tono={r.pago_estado === "APROBADO" ? "ok" : "marca"}>{r.pago_estado === "APROBADO" ? "Equipo · pagada" : "Equipo · pago aparte"}</Chip>}
            {pendiente && r.tiene_voucher && <Chip tono="ok">Subió voucher</Chip>}
            {r.informe_estado === "BORRADOR" && <Chip tono="ojo">Informe por aprobar</Chip>}
            {r.informe_estado === "ENVIADO" && <Chip tono="ok">Informe enviado</Chip>}
            {r.reagenda_autorizada && <Chip tono="ojo">Reagendar autorizado</Chip>}
          </span>
        </span>
        <span aria-hidden className="mr-1 h-2.5 w-2.5 shrink-0 self-center rotate-45 border-r-2 border-t-2 border-neutral-400" />
      </button>

      {!cancelada && (
        <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-3.5 py-2.5 [&>*]:flex-1">
          <ConfirmarPagoBtn reserva={r} onChanged={onChanged} className={BOTON.exito} />
          {r.meet_url && !pasada && <a href={r.meet_url} target="_blank" rel="noopener noreferrer" className={BOTON.principal}><Icono nombre="video" size={16} />Unirse</a>}
          {r.whatsapp_url && <a href={r.whatsapp_url} target="_blank" rel="noopener noreferrer" className={BOTON.whatsapp}><Icono nombre="whatsapp" size={16} />WhatsApp</a>}
          <CancelBtn reserva={r} onChanged={onChanged} className={`${BOTON.peligro} !flex-none`} />
        </div>
      )}

      {ficha && <FichaReserva reserva={r} onCerrar={() => setFicha(false)} onChanged={onChanged} />}
    </article>
  );
}
