import { useMemo, useState } from "react";
import { boPOST } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";

/**
 * Lo que aún no se le ha comunicado al asesorado.
 *
 * El correo sale a mano y con todo junto: revisar un expediente son seis o
 * siete documentos seguidos, y avisando al observar cada uno el asesorado se
 * encontraría seis correos en cinco minutos sin saber cuál mirar.
 */
export default function AvisoObservaciones({ id, docs, onCambio }) {
  const [enviando, setEnviando] = useState(false);

  const pendientes = useMemo(() => Object.values(docs?.ranuras || {})
    .flatMap((d) => d.archivos?.[0]?.observaciones || [])
    .filter((o) => !o.avisada_at), [docs]);

  if (!pendientes.length) return null;

  async function avisar() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/modificatoria/avisar-observaciones`);
    setEnviando(false);
    if (r?.ok) {
      dialog.toast(r.msg || "Avisado", r.avisado ? "exito" : "info");
      onCambio();
    } else dialog.toast(r?.msg || "No se pudo avisar", "error");
  }

  return (
    <div className="flex items-center gap-3 flex-wrap mb-3 rounded-xl border
      border-amber-300 bg-amber-50 px-3 py-2.5">
      <p className="text-[12px] text-amber-900 leading-relaxed min-w-0 flex-1">
        <b>{pendientes.length} observaci{pendientes.length === 1 ? "ón" : "ones"} sin
        comunicar.</b> Termina de revisar y mándaselas todas de una vez.
      </p>
      <button type="button" onClick={avisar} disabled={enviando}
        className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#B45309]
          text-white hover:opacity-90 disabled:opacity-40">
        {enviando ? "Enviando…" : "Avisar al asesorado"}
      </button>
    </div>
  );
}
