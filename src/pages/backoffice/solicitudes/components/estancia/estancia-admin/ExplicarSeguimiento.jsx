import { useState } from "react";
import { boPOST } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";

/**
 * Le manda al asesorado la guía de cómo seguir su expediente en la sede.
 *
 * Va aquí, pegado a los cuatro datos de consulta, porque es el mismo momento:
 * en cuanto el asesor apunta el número de registro, el asesorado ya puede
 * mirar por su cuenta, y hasta que no se lo explican no sabe que puede.
 *
 * Pide el nº de justificante para habilitarse. Sin él el correo mandaría a un
 * formulario que el asesorado no podría rellenar.
 */
export function ExplicarSeguimiento({ id }) {
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/explicar-seguimiento`);
    setEnviando(false);
    if (r?.ok) dialog.toast(r.msg || "Enviado", "exito");
    else dialog.toast(r?.msg || "No se pudo enviar", "error");
  }

  return (
    <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-neutral-100">
      <p className="text-[11.5px] text-neutral-500 leading-relaxed min-w-0 flex-1">
        Esta guía sale sola al subir el justificante de registro. Desde aquí se le
        vuelve a mandar, por ejemplo cuando ya tengas el nº de expediente formal.
      </p>
      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A]
          text-white hover:opacity-90 disabled:opacity-40"
      >
        {enviando ? "Enviando…" : "Volver a explicarle el seguimiento"}
      </button>
    </div>
  );
}
