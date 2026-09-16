// «Mi día»: la bandeja única de quien entra.
//
// Junta lo que antes había que ir a buscar a tres sitios: las tareas vencidas
// y de hoy (automáticas y a mano), los clientes que esperan algo de mí y los
// que me asignaron y aún no abrí. Cada fila lleva su acción al lado.
import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import RevisionRapida from "../comun/RevisionRapida";

const PRIORIDAD = { URGENTE: "bg-red-600 text-white", ALTA: "bg-amber-100 text-amber-800", MEDIA: "bg-neutral-100 text-neutral-600", BAJA: "bg-neutral-50 text-[#62808f]" };

export default function MiDia() {
  const [tareas, setTareas] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [revisar, setRevisar] = useState(null);

  const cargar = useCallback(() => {
    Promise.all([
      boGET("/backoffice/tareas?alcance=mias&vence=vencidas&cerradas=no"),
      boGET("/backoffice/tareas?alcance=mias&vence=hoy&cerradas=no"),
      boGET("/backoffice/clientes?filtro=mios&pageSize=200&orden=urgentes"),
    ]).then(([v, h, c]) => {
      const vistas = new Set();
      const lista = [...(v.tareas || []), ...(h.tareas || [])].filter((t) => !vistas.has(t.id_tarea) && vistas.add(t.id_tarea));
      setTareas(lista);
      setClientes((c.clientes || []).filter((x) => x.sin_abrir?.length || (x.etapas || []).some((e) => e.le_toca === "asesor")));
    });
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (tareas === null) return null;
  const nada = !tareas.length && !clientes.length;

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <h2 className="text-[15px] font-extrabold text-[#1A3557]">Mi día</h2>
        <span className="text-[11px] text-neutral-500">{tareas.length} tarea(s) · {clientes.length} cliente(s) esperan algo de ti</span>
        <button type="button" onClick={() => navigate("/backoffice/tareas")} className="ml-auto text-[11.5px] font-semibold text-[#1D6A4A]">Ver tareas →</button>
      </div>

      {nada ? (
        <p className="px-4 pb-4 text-[13px] text-[#1D6A4A] font-semibold">Nada vencido ni para hoy. Buen trabajo.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {tareas.slice(0, 12).map((t) => {
            const esRevision = t.regla === "rev" && t.id_solicitud;
            return (
              <div key={t.id_tarea} className="flex items-center gap-2.5 px-4 py-2.5">
                <span className={`shrink-0 text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORIDAD[t.prioridad] || PRIORIDAD.MEDIA}`}>
                  {t.vencida ? "Vencida" : "Hoy"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-neutral-800 truncate">{t.titulo}</span>
                  {t.origen === "AUTO" && <span className="block text-[10.5px] text-[#62808f]">Automática · se cierra sola al resolverse</span>}
                </span>
                {esRevision ? (
                  <button type="button" onClick={() => setRevisar(t.id_solicitud)}
                    className="shrink-0 text-[12px] font-bold text-white bg-[#1A3557] rounded-lg px-3 py-1.5">Revisar</button>
                ) : t.id_solicitud ? (
                  <button type="button" onClick={() => navigate(`/backoffice/solicitudes/${t.id_solicitud}`)}
                    className="shrink-0 text-[12px] font-semibold text-[#1D6A4A] border border-[#1D6A4A]/30 rounded-lg px-3 py-1.5">Abrir</button>
                ) : (
                  <button type="button" onClick={() => navigate(`/backoffice/tareas?tarea=${t.id_tarea}`)}
                    className="shrink-0 text-[12px] font-semibold text-[#1D6A4A] border border-[#1D6A4A]/30 rounded-lg px-3 py-1.5">Ver</button>
                )}
              </div>
            );
          })}
          {clientes.slice(0, 8).map((c) => {
            const e = (c.etapas || []).find((x) => x.le_toca === "asesor");
            return (
              <div key={`c${c.id_cliente}`} className="flex items-center gap-2.5 px-4 py-2.5">
                <span className={`shrink-0 text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded ${c.sin_abrir?.length ? "bg-red-50 text-red-700" : "bg-[#EEF2F8] text-[#1A3557]"}`}>
                  {c.sin_abrir?.length ? "Sin abrir" : "Te toca"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-neutral-800 truncate">{c.nombre}</span>
                  {e && <span className="block text-[11px] text-neutral-500 truncate">{e.que}{e.proximo ? ` · ${e.proximo.etiqueta} ${e.proximo.vencido ? `hace ${-e.proximo.dias} d` : `en ${e.proximo.dias} d`}` : ""}</span>}
                </span>
                {e && /^Revisar/.test(e.que || "") ? (
                  <button type="button" onClick={() => setRevisar(e.id_solicitud)}
                    className="shrink-0 min-h-[36px] text-[12px] font-bold text-white bg-[#013446] rounded-lg px-3">Revisar</button>
                ) : (
                  <button type="button" onClick={() => navigate(`/backoffice/clientes?cliente=${c.id_cliente}`)}
                    className="shrink-0 min-h-[36px] text-[12px] font-semibold text-[#1D6A4A] border border-[#1D6A4A]/30 rounded-lg px-3">Abrir</button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {revisar && <RevisionRapida idSolicitud={revisar} onCerrar={(cambio) => { setRevisar(null); if (cambio) cargar(); }} />}
    </section>
  );
}
