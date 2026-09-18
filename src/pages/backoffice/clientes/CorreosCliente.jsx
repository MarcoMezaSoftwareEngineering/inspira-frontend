// Pestaña «Correos» de la ficha: todo lo escrito con este cliente, y escribirle
// desde la dirección de su servicio.
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { boGET } from "../../../services/backofficeApi";
import VistaHilo from "../correo/VistaHilo";
import Redactar from "../correo/Redactar";

const DESDE_SERVICIO = {
  master: "asesorados.master", visa: "asesorados.visados", ee: "asesorados.estancia.estudios",
  fp: "asesorados.fp", legal: "asesorados.extranjeria",
  // Doctorado aún no tiene buzón propio: sale del genérico.
  doc: "asesorados",
};

export default function CorreosCliente({ idCliente, correo, procesos = [] }) {
  const [hilos, setHilos] = useState(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(null);
  const [redactar, setRedactar] = useState(false);
  const activo = procesos.find((p) => !p.cerrado) || procesos[0];

  const cargar = useCallback(() => boGET(`/backoffice/correo/cliente/${idCliente}`).then((r) => {
    if (r.ok) { setHilos(r.hilos || []); setError(""); } else { setHilos([]); setError(r.msg || "No se pudo cargar el correo"); }
  }), [idCliente]);
  useEffect(() => { cargar(); }, [cargar]);

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[9px] font-bold uppercase tracking-widest font-mono text-[#62808f]">Correos · {correo || "sin correo"}</p>
        {correo && (
          <button type="button" onClick={() => setRedactar(true)}
            className="text-[12.5px] font-semibold text-white bg-[#013446] rounded-lg px-3 min-h-[36px]">Escribir correo</button>
        )}
      </div>
      {error && <p className="text-[12.5px] text-[#c0392b]">{error}</p>}
      {hilos === null ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="ase-esq" style={{ height: 56 }} />)}</div>
      ) : !hilos.length ? (
        <p className="text-[12.5px] text-[#62808f] py-4 text-center">No hay correos con este cliente.</p>
      ) : (
        <div className="divide-y divide-[#eef2f6]">
          {hilos.map((h) => (
            <button key={h.id} type="button" onClick={() => setAbierto(h.id)} className="w-full text-left py-2.5 hover:bg-[#f7fafc] rounded-lg px-1">
              <span className="flex items-center gap-2">
                {h.no_leido && <span className="w-2 h-2 rounded-full bg-[#fa943a]" />}
                <span className="flex-1 truncate text-[13px] font-semibold text-[#0d2c3a]">{h.asunto}</span>
                <span className={`text-[11px] ${h.respondido ? "text-[#62808f]" : "text-[#c0392b] font-semibold"}`}>
                  {h.respondido ? new Date(h.fecha).toLocaleDateString("es-PE") : "sin responder"}
                </span>
              </span>
              <span className="block truncate text-[12px] text-[#62808f]">{h.fragmento}</span>
            </button>
          ))}
        </div>
      )}

      {abierto && createPortal(
        <div className="fixed inset-0 z-[84] bg-[#011c26]/60 sm:p-4 grid sm:place-items-center">
          <div className="w-full sm:max-w-3xl h-[100dvh] sm:h-[88vh] sm:rounded-2xl overflow-hidden bg-white">
            <VistaHilo id={abierto} onVolver={() => { setAbierto(null); cargar(); }} onRespondido={cargar} />
          </div>
        </div>,
        document.body,
      )}
      {redactar && (
        <Redactar para={correo} idSolicitud={activo?.id_solicitud}
          desde={DESDE_SERVICIO[activo?.servicio] ? `${DESDE_SERVICIO[activo.servicio]}@inspira-legal.cloud` : ""}
          onCerrar={() => setRedactar(false)} onEnviado={cargar} />
      )}
    </section>
  );
}
