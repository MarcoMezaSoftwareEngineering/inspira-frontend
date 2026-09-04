// El hilo con el asesorado, en el expediente del asesor. Va arriba del todo y
// en cualquier tipo de expediente: si hay un mensaje sin leer, es lo primero.
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../../services/backofficeApi";
import HiloMensajes from "../../../../components/common/HiloMensajes";

export default function MensajesAdmin({ idSolicitud }) {
  const [abierto, setAbierto] = useState(false);
  const [sinLeer, setSinLeer] = useState(0);

  // Solo para el contador: el hilo se carga (y marca como leído) al abrirlo.
  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/solicitudes/${idSolicitud}/mensajes?solo=cuenta`)
      .then((r) => { if (vivo && r?.ok) setSinLeer((r.mensajes || []).filter((m) => m.autor_tipo !== "ASESOR" && !m.leido_at).length); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [idSolicitud]);

  return (
    <div className="mb-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
      <button type="button" onClick={() => { setAbierto((v) => !v); setSinLeer(0); }}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left">
        <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-black">✉</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold text-neutral-900">Mensajes con el asesorado</span>
          <span className="block text-[11.5px] text-neutral-500">Lo que se dice aquí queda en el expediente, con hora y constancia de lectura.</span>
        </span>
        {sinLeer > 0 && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-accent text-white">{sinLeer} sin leer</span>
        )}
        <span className="text-[11px] text-neutral-400">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <div className="px-5 pb-5 border-t border-neutral-100 pt-4">
          <HiloMensajes
            lado="asesor"
            cargar={() => boGET(`/backoffice/solicitudes/${idSolicitud}/mensajes`)}
            enviar={(texto) => boPOST(`/backoffice/solicitudes/${idSolicitud}/mensajes`, { texto })}
          />
        </div>
      )}
    </div>
  );
}
