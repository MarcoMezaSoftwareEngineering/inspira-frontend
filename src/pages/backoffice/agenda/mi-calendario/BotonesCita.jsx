// Acciones sobre una cita del panel lateral: añadir el enlace de Meet y cancelar.
import { useState } from "react";
import { boPATCH } from "../../../../services/backofficeApi";
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
