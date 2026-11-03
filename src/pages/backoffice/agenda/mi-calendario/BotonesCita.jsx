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
  if (!["TRANSFERENCIA", "DESPUES"].includes(reserva.metodo_pago) || reserva.estado !== "PENDIENTE_PAGO") return null;
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
