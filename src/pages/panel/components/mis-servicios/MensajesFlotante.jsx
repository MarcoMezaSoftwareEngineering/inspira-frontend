// Mensajes, siempre a mano.
//
// Un botón flotante con los mensajes sin leer y, al abrirlo, el hilo con el
// asesor en una hoja: en el móvil sube desde abajo; en pantalla grande es una
// ventana a la derecha. El hilo es el mismo de siempre, con hora de Perú y
// de España en cada mensaje.
//
// Vivía dentro de DetalleSolicitud (máster). Desde el 18/09/2026 está aparte
// para que el doctorado lo use sin descargar el expediente del máster.
import { useEffect } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
import IconoPaso from "../../../../components/common/IconoPaso";
import HiloMensajes from "../../../../components/common/HiloMensajes";

export default function MensajesFlotante({ abierto, onAbrir, onCerrar, sinLeer, idSolicitud }) {
  useEffect(() => {
    if (!abierto) return undefined;
    function onKey(e) { if (e.key === "Escape") onCerrar(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  return (
    <>
      <button
        type="button"
        onClick={onAbrir}
        aria-label="Mensajes con tu asesor"
        className="ux-tap fixed z-40 right-4 bottom-[calc(76px+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-primary text-white text-[13px] font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
      >
        <IconoPaso nombre="message" className="w-4 h-4" />
        Mensajes
        {sinLeer > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-black grid place-items-center">
            {sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-black/45" onClick={onCerrar}>
          <div
            className="pnl-entra w-full md:w-[520px] md:mr-6 max-h-[88vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mensajes con tu asesor"
          >
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-neutral-100 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary-light/10 text-primary-light grid place-items-center">
                <IconoPaso nombre="message" className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-primary leading-tight">Mensajes con tu asesor</p>
                <p className="text-[11.5px] text-neutral-500">Queda en tu expediente, con hora y constancia de lectura.</p>
              </div>
              <button type="button" onClick={onCerrar} aria-label="Cerrar"
                className="w-9 h-9 rounded-full grid place-items-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <IconoPaso nombre="x" className="w-4 h-4" strokeWidth={2.4} />
              </button>
            </div>
            <div className="px-4 pb-4 pt-2 flex-1 min-h-0 flex flex-col">
              <HiloMensajes
                lado="cliente"
                idSolicitud={idSolicitud}
                aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor. Para lo que importa, mejor aquí que por WhatsApp."
                cargar={() => apiGET(`/solicitudes/${idSolicitud}/mensajes`)}
                enviar={(texto) => apiPOST(`/solicitudes/${idSolicitud}/mensajes`, { texto })}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
