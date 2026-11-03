// Acciones sobre una cita del panel lateral: añadir el enlace de Meet y cancelar.
import { useState } from "react";
import { boFetch, boPATCH, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

async function editarMeetReserva(r, onChanged, setEditando) {
  const url = await dialog.prompt("Enlace de Google Meet:", r.meet_url || "", "Editar enlace de reunión");
  if (url === null) return;
  setEditando?.(true);
  const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { meet_url: url });
  setEditando?.(false);
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo actualizar", "error");
  onChanged();
}

async function cancelarReserva(r, onChanged) {
  const ok = await dialog.confirm(`¿Cancelar la cita de ${r.cliente?.nombre || r.cliente?.email_contacto}? Esto libera el horario.`, "Cancelar cita");
  if (!ok) return;
  const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { estado: "CANCELADA" });
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo cancelar", "error");
  onChanged();
}

async function confirmarPagoTransferencia(r, onChanged, setEnviando) {
  const ok = await dialog.confirm(
    `¿Ya vio el abono de ${r.monto} ${r.moneda} (referencia RES-${r.id_reserva}) en la cuenta? Se confirmará la cita y se enviará la confirmación a ${r.cliente?.nombre || r.cliente?.email_contacto}.${r.tiene_voucher ? "" : " Ojo: el cliente no subió voucher."}`,
    "Confirmar pago"
  );
  if (!ok) return;
  setEnviando(true);
  const res = await boPOST(`/backoffice/agenda/reservas/${r.id_reserva}/confirmar-pago`);
  setEnviando(false);
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo confirmar el pago", "error");
  dialog.toast("Pago confirmado. Se envió la confirmación al cliente.", "success");
  onChanged();
}

// Abre el voucher que subió el cliente (se pide con la sesión del equipo).
async function abrirVoucher(r, setAbriendo) {
  setAbriendo(true);
  try {
    const res = await boFetch(`/backoffice/agenda/reservas/${r.id_reserva}/voucher`);
    if (!res || !res.ok) return dialog.toast("No se pudo abrir el voucher", "error");
    const url = URL.createObjectURL(await res.blob());
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } finally {
    setAbriendo(false);
  }
}

export function VerVoucherBtn({ reserva, className }) {
  const [abriendo, setAbriendo] = useState(false);
  if (!reserva.tiene_voucher) return null;
  return (
    <button onClick={() => abrirVoucher(reserva, setAbriendo)} disabled={abriendo}
      className={className || "px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-[11px] font-bold hover:bg-neutral-50 disabled:opacity-50"}>
      {abriendo ? "Abriendo…" : "Ver voucher"}
    </button>
  );
}

// Solo para citas por transferencia o «pagar después» que aún esperan el pago.
export function ConfirmarPagoBtn({ reserva, onChanged, className }) {
  const [enviando, setEnviando] = useState(false);
  // Cualquier reserva por pagar: transferencia, pagar después, sin elegir, o tarjeta que no llegó a cobrarse.
  if (reserva.estado !== "PENDIENTE_PAGO") return null;
  return (
    <button onClick={() => confirmarPagoTransferencia(reserva, onChanged, setEnviando)} disabled={enviando}
      className={className || "px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:opacity-90 disabled:opacity-50"}>
      {enviando ? "Confirmando…" : "Confirmar pago"}
    </button>
  );
}

// Informe de la asesoría (borrador de Clawsito): se abre el PDF y, con el visto
// bueno, se envía al asesorado.
async function abrirInforme(r, setAbriendo) {
  setAbriendo(true);
  try {
    const res = await boFetch(`/backoffice/agenda/reservas/${r.id_reserva}/informe.pdf`);
    if (!res || !res.ok) return dialog.toast("No se pudo generar el informe", "error");
    const url = URL.createObjectURL(await res.blob());
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } finally {
    setAbriendo(false);
  }
}

async function enviarInforme(r, onChanged, setEnviando) {
  const quien = r.cliente?.nombre || r.cliente?.email_contacto;
  const ok = await dialog.confirm(`¿Enviar el informe a ${quien}? Le llegará por correo con el PDF adjunto.`, "Enviar informe");
  if (!ok) return;
  setEnviando(true);
  const res = await boPOST(`/backoffice/agenda/reservas/${r.id_reserva}/informe/aprobar`);
  setEnviando(false);
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo enviar el informe", "error");
  dialog.toast("Informe enviado al asesorado.", "success");
  onChanged();
}

export function InformeBtns({ reserva, onChanged }) {
  const [abriendo, setAbriendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  if (!["BORRADOR", "ENVIADO"].includes(reserva.informe_estado)) return null;
  const borrador = reserva.informe_estado === "BORRADOR";
  return (
    <>
      <button onClick={() => abrirInforme(reserva, setAbriendo)} disabled={abriendo}
        className="px-2.5 py-1.5 bg-white border border-primary/30 text-primary rounded-lg text-[10.5px] font-bold hover:bg-primary/5 disabled:opacity-50">
        {abriendo ? "Generando…" : borrador ? "Ver borrador del informe" : "Ver informe enviado"}
      </button>
      {borrador && (
        <button onClick={() => enviarInforme(reserva, onChanged, setEnviando)} disabled={enviando}
          className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10.5px] font-bold hover:opacity-90 disabled:opacity-50">
          {enviando ? "Enviando…" : "Enviar informe al asesorado"}
        </button>
      )}
    </>
  );
}

// Avisos al asesorado: recordar el pago, reenviar los accesos de la cita, recordarla y mandar el formulario previo.
async function avisar(r, { ruta, cuerpo, pregunta, titulo, hecho, recarga }, setEnviando, onChanged) {
  const quien = r.cliente?.nombre || r.cliente?.email_contacto;
  const ok = await dialog.confirm(`${pregunta} ${quien} (${r.cliente?.email_contacto || "sin correo"})?`, titulo);
  if (!ok) return;
  setEnviando(ruta);
  const res = await boPOST(`/backoffice/agenda/reservas/${r.id_reserva}/${ruta}`, cuerpo);
  setEnviando("");
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo enviar", "error");
  dialog.toast(hecho, "success");
  if (recarga) onChanged?.();
}

// Acciones agrupadas de una reserva (el panel «Más acciones»): avisar al asesorado, cambios de la
// cita según la política y otras. Cada botón pide confirmación y dice a quién le llega.
const BTN = "w-full text-left px-3 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-[11.5px] font-semibold hover:bg-neutral-50 disabled:opacity-50";
const GRUPO = "text-[9px] uppercase tracking-[.12em] text-neutral-400 font-extrabold mb-1.5";

export function GruposAcciones({ reserva, onChanged, children, sinOtras = false }) {
  const [enviando, setEnviando] = useState("");
  const boton = (ruta, texto, datos, ayuda) => (
    <button key={ruta + texto} disabled={!!enviando} className={BTN} title={ayuda}
      onClick={() => avisar(reserva, { ruta, ...datos }, setEnviando, onChanged)}>
      {enviando === ruta ? "Enviando…" : texto}
    </button>
  );
  const pendiente = reserva.estado === "PENDIENTE_PAGO";
  const confirmada = reserva.estado === "CONFIRMADA";
  const cotizar = `/backoffice/presupuesto?cliente=${encodeURIComponent(reserva.cliente?.nombre || "")}&correo=${encodeURIComponent(reserva.cliente?.email_contacto || "")}`;
  return (
    <div className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      {pendiente && (
        <section>
          <p className={GRUPO}>Avisar al asesorado</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {boton("recordar", "Recordar el pago", { cuerpo: { tipo: "pago" }, pregunta: "¿Enviar el enlace para completar el pago a", titulo: "Recordar pago", hecho: "Se envió el recordatorio de pago." }, "Le llega el enlace para pagar")}
          </div>
        </section>
      )}
      {confirmada && (
        <>
          <section>
            <p className={GRUPO}>Avisar al asesorado</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {boton("reenviar-accesos", "Reenviar accesos", { pregunta: "¿Reenviar la confirmación con el enlace de la reunión a", titulo: "Reenviar accesos", hecho: "Se reenviaron los accesos." }, "Confirmación con Meet, calendario y política")}
              {boton("recordar", "Recordar la cita", { cuerpo: { tipo: "cita" }, pregunta: "¿Enviar un recordatorio de la asesoría a", titulo: "Recordar la cita", hecho: "Se envió el recordatorio." })}
              {boton("formulario-previo", "Enviar formulario previo", { pregunta: "¿Enviar el formulario previo a la asesoría a", titulo: "Formulario previo", hecho: "Se envió el formulario previo." })}
            </div>
          </section>
          <section>
            <p className={GRUPO}>Si la cita cambia</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {boton("cobro-reagendamiento", "Cobrar 50 % para reagendar", { pregunta: "¿Enviar el cobro del 50 % para reagendar a", titulo: "Cobro por reagendar", hecho: "Se envió el cobro del 50 %." }, "Con menos de 24 h, previa coordinación")}
              {boton("autorizar-reagendamiento", "Autorizar reagendar", { pregunta: "¿Ya vio el abono del 50 % y habilita que reagende, avisando a", titulo: "Autorizar reagendamiento", hecho: reserva.reagenda_autorizada ? "Se volvió a enviar la autorización." : "Se autorizó el reagendamiento y se avisó al asesorado." }, "Cuando ya se verificó el 50 %")}
              {boton("no-asistio", "No asistió · sin devolución", { cuerpo: { quien: "cliente" }, pregunta: "¿Marcar que no asistió y avisar, sin devolución, a", titulo: "Inasistencia", hecho: "Se marcó la inasistencia y se avisó al asesorado.", recarga: true })}
              {boton("no-asistio", "Canceló Inspira · devolver o reagendar", { cuerpo: { quien: "inspira" }, pregunta: "¿Cancelar por responsabilidad de Inspira y ofrecer nuevo horario o devolución íntegra a", titulo: "Cancelada por Inspira", hecho: "Se canceló y se avisó al asesorado y al equipo.", recarga: true })}
            </div>
          </section>
        </>
      )}
      {!sinOtras && (
        <section>
          <p className={GRUPO}>Otras</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <a href={cotizar} className={`${BTN} block`}>Preparar cotización</a>
            {children}
          </div>
        </section>
      )}
    </div>
  );
}

export function EditMeetBtn({ reserva, onChanged, className }) {
  const [editando, setEditando] = useState(false);
  return (
    <button onClick={() => editarMeetReserva(reserva, onChanged, setEditando)} disabled={editando}
      className={className || "px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold hover:bg-amber-100 disabled:opacity-50"}>
      {editando ? "Guardando…" : "Añadir Meet"}
    </button>
  );
}

export function CancelBtn({ reserva, onChanged, className }) {
  if (reserva.estado === "CANCELADA") return null;
  return (
    <button onClick={() => cancelarReserva(reserva, onChanged)}
      className={className || "px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-50"}>
      Cancelar
    </button>
  );
}
