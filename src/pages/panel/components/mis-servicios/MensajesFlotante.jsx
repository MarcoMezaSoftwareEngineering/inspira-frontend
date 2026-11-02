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
        className="pnl-mensajes-boton fixed z-40 right-4 bottom-[calc(16px+var(--pnl-barra-abajo,0px)+env(safe-area-inset-bottom,0px))] md:right-6 md:bottom-6"
      >
        <IconoPaso nombre="message" className="w-4 h-4" />
        Mensajes
        {sinLeer > 0 && (
          <span className="pnl-badge pnl-mensajes-cuenta">
            {sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="pnl-velo-token fixed inset-0 z-50 flex items-end md:items-center md:justify-end" onClick={onCerrar}>
          <div
            className="pnl-hoja pnl-mensajes-hoja pnl-entra w-full md:w-[520px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mensajes con tu asesor"
          >
            <span className="pnl-hoja-tirador" aria-hidden="true" />
            <div className="pnl-mensajes-cab shrink-0">
              <span className="pnl-ico" data-talla="m">
                <IconoPaso nombre="message" className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="pnl-mensajes-titulo">Mensajes con tu asesor</p>
                <p className="pnl-mensajes-sub">Queda en tu expediente, con hora y constancia de lectura.</p>
              </div>
              <button type="button" onClick={onCerrar} aria-label="Cerrar"
                className="pnl-btn-icono">
                <IconoPaso nombre="x" className="w-4 h-4" strokeWidth={2.4} />
              </button>
            </div>
            <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 flex-1 min-h-0 flex flex-col">
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
