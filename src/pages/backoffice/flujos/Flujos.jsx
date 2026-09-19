// Flujos: el recorrido de cada servicio en un diagrama.
//
// Para que el asesor sepa, de un vistazo, en qué paso está cada cliente, a
// quién le toca mover y qué tiene que hacer él. Los pasos salen de
// flujos.config.js; los clientes de cada paso, de Procesos en vivo.
//
// Acciones en lote (AccionesLote.jsx): se marcan clientes de un paso —o todos
// los del paso— y la barra de abajo aprueba, devuelve o recuerda de una vez.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { ACTORES, FLUJOS } from "./flujos.config";
import { Pagina, Cabecera, Cuerpo } from "../ui";
import RevisionRapida from "../comun/RevisionRapida";
import { BarraLote, VentanaAprobar, AvisoDeshacer, VentanaDevolver, VentanaRecordar } from "./AccionesLote";

function pasoDe(flujo, p) {
  // Estancia manda por su propio expediente; el resto, por la etapa.
  if (flujo.servicio === "ee" && p.ee?.clave) {
    const i = flujo.pasos.findIndex((x) => x.clave?.includes(p.ee.clave));
    if (i >= 0) return i;
  }
  return flujo.pasos.findIndex((x) => x.etapas.includes(p.etapa));
}

function Paso({ paso, i, total, clientes, abierto, onAlternar, onAbrirProceso, seleccion, onMarcar, onMarcarPaso, onRevisar }) {
  const a = ACTORES[paso.actor];
  const ultimo = i === total - 1;
  const marcadosAqui = clientes.filter((p) => seleccion.has(p.id_solicitud)).length;
  const todosAqui = clientes.length > 0 && marcadosAqui === clientes.length;
  return (
    <li className="relative flex gap-3">
      {/* Línea y nodo */}
      <div className="flex flex-col items-center shrink-0">
        <span className="w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold text-white shadow-[0_6px_14px_-8px_rgba(2,58,75,.8)]"
          style={{ background: a.color }}>
          {i + 1}
        </span>
        {!ultimo && <span className="flex-1 w-0.5 my-1 rounded-full" style={{ background: `linear-gradient(${a.color}55, #d4d4d455)` }} />}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="px-3.5 pt-3 pb-2.5 flex items-start gap-2" style={{ background: `linear-gradient(90deg, ${a.suave}, #fff)` }}>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-neutral-900 leading-snug">{paso.titulo}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ background: a.color }}>
                Mueve: {a.t}
              </span>
            </div>
            <button type="button" onClick={onAlternar} disabled={!clientes.length}
              className={`shrink-0 text-right rounded-xl px-2.5 py-1.5 border ${
                clientes.length ? "bg-white border-neutral-200 hover:border-[#1D6A4A]" : "border-transparent"}`}>
              <span className={`block text-[18px] font-bold leading-none tabular-nums ${clientes.length ? "text-[#1A3557]" : "text-neutral-300"}`}>
                {clientes.length}
              </span>
              <span className="block text-[9.5px] text-neutral-500 mt-0.5">
                {clientes.length ? (abierto ? "ocultar" : "ver clientes") : "clientes"}
              </span>
            </button>
          </div>

          <div className="px-3.5 py-3 space-y-2.5">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Qué hacer</p>
              <ul className="space-y-1">
                {paso.hacer.map((h) => (
                  <li key={h} className="flex gap-2 text-[12.5px] text-neutral-700 leading-snug">
                    <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a.color }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#E8F5EE] px-2.5 py-2">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#1D6A4A]">Hecho cuando</p>
                <p className="text-[12px] text-neutral-700 leading-snug mt-0.5">{paso.hecho}</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-2.5 py-2">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-amber-700">Plazo</p>
                <p className="text-[12px] text-neutral-700 leading-snug mt-0.5">{paso.plazo}</p>
              </div>
            </div>
            {paso.donde && <p className="text-[11px] text-neutral-500">Dónde: {paso.donde}</p>}
          </div>

          {clientes.length > 0 && (
            <div className="border-t border-neutral-100 px-3.5 py-1.5 flex items-center gap-2 bg-neutral-50/60">
              <label className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-neutral-600 cursor-pointer">
                <input type="checkbox" checked={todosAqui}
                  ref={(el) => { if (el) el.indeterminate = marcadosAqui > 0 && !todosAqui; }}
                  onChange={() => onMarcarPaso(clientes.map((p) => p.id_solicitud), !todosAqui)} />
                Seleccionar los {clientes.length} de este paso
              </label>
              {marcadosAqui > 0 && <span className="text-[11px] text-[#1D6A4A] font-semibold">{marcadosAqui} marcado{marcadosAqui === 1 ? "" : "s"}</span>}
            </div>
          )}

          {abierto && clientes.length > 0 && (
            <div className="border-t border-neutral-100 divide-y divide-neutral-100">
              {clientes.map((p) => (
                <div key={p.id_solicitud} className={`flex items-center gap-2 pl-3.5 pr-2 ${seleccion.has(p.id_solicitud) ? "bg-[#E8F5EE]/60" : ""}`}>
                  <input type="checkbox" aria-label={`Seleccionar a ${p.cliente}`}
                    checked={seleccion.has(p.id_solicitud)} onChange={() => onMarcar(p.id_solicitud)} />
                  <button type="button" onClick={() => onAbrirProceso(p.id_solicitud)}
                    className="min-w-0 flex-1 text-left py-2 hover:bg-neutral-50 flex items-center gap-2 rounded-lg px-1">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-neutral-800 truncate">{p.cliente}</span>
                      <span className="block text-[10.5px] text-neutral-500 truncate">
                        {p.responsable || "sin responsable"}
                        {p.proximo ? ` · ${p.proximo.etiqueta} ${p.proximo.vencido ? `hace ${-p.proximo.dias}d` : `en ${p.proximo.dias}d`}` : ""}
                      </span>
                    </span>
                    {p.proximo?.vencido && <span className="text-[10px] font-bold text-red-700 bg-red-50 rounded-full px-2 py-0.5">vencido</span>}
                    <span className="text-[11.5px] font-semibold text-[#1D6A4A]">Abrir →</span>
                  </button>
                  <button type="button" onClick={() => onRevisar(p.id_solicitud)} title="Revisar sus documentos uno a uno"
                    className="shrink-0 text-[11px] font-semibold text-[#046C8C] hover:underline px-1">
                    Revisar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Flujos() {
  const [servicio, setServicio] = useState("master");
  const [procesos, setProcesos] = useState([]);
  const [soloMios, setSoloMios] = useState(false);
  const [abiertos, setAbiertos] = useState(new Set());
  // Quién soy, leído del token una sola vez al montar.
  const [yo] = useState(() => {
    try {
      const t = localStorage.getItem("bo_token") || "";
      return JSON.parse(atob(t.split(".")[1] || ""))?.id_usuario || null;
    } catch { return null; }
  });

  const cargar = useCallback(() => boGET("/backoffice/procesos").then((r) => r.ok && setProcesos(r.procesos || [])), []);
  useEffect(() => { cargar(); }, [cargar]);

  // Selección para las acciones en lote (ids de proceso).
  const [seleccion, setSeleccion] = useState(new Set());
  const [ventana, setVentana] = useState(null); // "aprobar" | "devolver" | "recordar"
  const [deshacer, setDeshacer] = useState(null); // { lote, aprobados }
  const [revisando, setRevisando] = useState(null);
  const ids = useMemo(() => [...seleccion], [seleccion]);
  const marcar = (id) => setSeleccion((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const marcarPaso = (lista, si) => setSeleccion((s) => { const n = new Set(s); lista.forEach((id) => (si ? n.add(id) : n.delete(id))); return n; });
  const cerrarVentana = useCallback(() => setVentana(null), []);
  const finDeshacer = useCallback(() => setDeshacer(null), []);

  const flujo = FLUJOS.find((f) => f.servicio === servicio);

  const porPaso = useMemo(() => {
    const listas = flujo.pasos.map(() => []);
    procesos
      .filter((p) => p.servicio === servicio && !p.cerrado)
      .filter((p) => !soloMios || p.id_responsable === yo)
      .forEach((p) => {
        const i = pasoDe(flujo, p);
        if (i >= 0) listas[i].push(p);
      });
    listas.forEach((l) => l.sort((a, b) => (a.proximo?.dias ?? 999) - (b.proximo?.dias ?? 999)));
    return listas;
  }, [procesos, servicio, flujo, soloMios, yo]);

  const abrir = (id) => { window.location.href = `/backoffice/solicitudes/${id}`; };

  return (
    <Pagina>
      <Cabecera
        eyebrow="Flujos"
        titulo="El camino de cada servicio"
        subtitulo="Qué toca en cada paso, quién lo mueve y quién está ahí ahora."
      />
      <Cuerpo className="!max-w-3xl">

      <div className="ase-tira">
        <div className="ase-tira-scroll">
          {FLUJOS.map((f) => {
            const n = procesos.filter((p) => p.servicio === f.servicio && !p.cerrado).length;
            return (
              <button key={f.servicio} type="button" className="ase-tab"
                data-on={servicio === f.servicio ? "1" : "0"} aria-pressed={servicio === f.servicio}
                onClick={() => { setServicio(f.servicio); setAbiertos(new Set()); setSeleccion(new Set()); }}>
                {f.titulo}<span className="ase-tab-n">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl px-3.5 py-3">
        <p className="text-[12.5px] text-neutral-700">{flujo.resumen}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
          {Object.values(ACTORES).map((a) => (
            <span key={a.t} className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />{a.t}
            </span>
          ))}
        </div>
        {yo && (
          <label className="flex items-center gap-1.5 text-[12px] text-neutral-600 mt-2.5">
            <input type="checkbox" checked={soloMios} onChange={(e) => setSoloMios(e.target.checked)} />
            Contar solo mis clientes
          </label>
        )}
      </div>

      <ol>
        {flujo.pasos.map((paso, i) => (
          <Paso key={paso.titulo} paso={paso} i={i} total={flujo.pasos.length}
            clientes={porPaso[i]} abierto={abiertos.has(i)}
            onAlternar={() => setAbiertos((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
            onAbrirProceso={abrir}
            seleccion={seleccion} onMarcar={marcar} onRevisar={setRevisando}
            onMarcarPaso={(lista, si) => { marcarPaso(lista, si); if (si) setAbiertos((x) => new Set(x).add(i)); }} />
        ))}
      </ol>

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        Los pasos 2 y 4 de Máster no tienen etapa propia en Procesos todavía: sus clientes aparecen en el paso anterior.
      </p>
      {/* Hueco para que la barra fija no tape el último paso. */}
      {seleccion.size > 0 && <div className="h-20" />}
      </Cuerpo>

      <BarraLote n={seleccion.size} onLimpiar={() => setSeleccion(new Set())}
        onAprobar={() => setVentana("aprobar")} onDevolver={() => setVentana("devolver")} onRecordar={() => setVentana("recordar")} />
      <VentanaAprobar abierta={ventana === "aprobar"} ids={ids} onCerrar={cerrarVentana}
        onHecho={(r) => { setVentana(null); cargar(); if (r.lote) setDeshacer({ lote: r.lote, aprobados: r.aprobados }); }} />
      <VentanaDevolver abierta={ventana === "devolver"} ids={ids} onCerrar={cerrarVentana} onHecho={() => cargar()} />
      <VentanaRecordar abierta={ventana === "recordar"} ids={ids} onCerrar={cerrarVentana} onHecho={() => cargar()} />
      {deshacer && (
        <AvisoDeshacer key={deshacer.lote} lote={deshacer.lote} aprobados={deshacer.aprobados}
          onFin={finDeshacer} onDeshecho={() => { setDeshacer(null); cargar(); }} />
      )}
      {revisando && <RevisionRapida idSolicitud={revisando} onCerrar={(cambio) => { setRevisando(null); if (cambio) cargar(); }} />}
    </Pagina>
  );
}
