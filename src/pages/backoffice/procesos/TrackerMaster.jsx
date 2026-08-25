// Tracker de máster: la hoja MACRO, dentro del sistema.
//
// Una fila por postulación —cliente × universidad—, como está montada la hoja
// y como se trabaja: un cliente postula a seis sitios y cada uno va a su
// ritmo. Todo se edita en la celda; entrar al expediente para cambiar un
// estado es lo que hace que la gente vuelva al Excel.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPATCH, boPOST, boDELETE } from "../../../services/backofficeApi";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  sky:     "bg-sky-50 text-sky-800 border-sky-200",
  amber:   "bg-amber-50 text-amber-900 border-amber-300",
  violet:  "bg-violet-200 text-violet-900 border-violet-300",
  green:   "bg-[#1D6A4A] text-white border-[#1D6A4A]",
  teal:    "bg-teal-100 text-teal-800 border-teal-300",
  red:     "bg-red-600 text-white border-red-600",
  pink:    "bg-pink-100 text-pink-800 border-pink-200",
  slate:   "bg-slate-600 text-white border-slate-600",
};

/* Celda que guarda al salir del campo. Sin botones: escribir y pasar a la
   siguiente es exactamente el gesto de la hoja de cálculo. */
function Celda({ valor, onGuardar, placeholder, ancho = "w-32", multilinea }) {
  const [v, setV] = useState(valor || "");
  const [guardando, setGuardando] = useState(false);

  async function salir() {
    if ((v || "") === (valor || "")) return;
    setGuardando(true);
    await onGuardar(v);
    setGuardando(false);
  }

  const clase = `${ancho} text-[11.5px] text-neutral-800 bg-transparent border border-transparent rounded px-1.5 py-1
    hover:border-neutral-200 focus:border-[#1D6A4A] focus:bg-white outline-none
    placeholder:text-neutral-300 disabled:opacity-50`;

  if (multilinea) {
    return (
      <textarea rows={2} value={v} placeholder={placeholder} disabled={guardando}
        onChange={(e) => setV(e.target.value)} onBlur={salir}
        className={`${clase} resize-y leading-snug`} />
    );
  }
  return (
    <input value={v} placeholder={placeholder} disabled={guardando}
      onChange={(e) => setV(e.target.value)} onBlur={salir}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      className={clase} />
  );
}

function Estado({ valor, estados, onCambiar }) {
  const def = estados.find((e) => e.valor === valor);
  return (
    <div className="relative inline-block">
      <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide
        px-1.5 py-1 rounded border whitespace-nowrap ${TONOS[def?.tono || "neutral"]}`}>
        {valor}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
      <select value={valor} onChange={(e) => onCambiar(e.target.value)} aria-label="Cambiar estado"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
        {estados.map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
      </select>
    </div>
  );
}

export default function TrackerMaster({ onAbrirProceso }) {
  const [datos, setDatos] = useState({ filas: [], sin_postulacion: [], estados: [], resumen: {} });
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState("");
  const [nuevaUni, setNuevaUni] = useState({});

  const cargar = useCallback(() => (
    boGET("/backoffice/tracker-master").then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    })
  ), []);

  useEffect(() => {
    boGET("/backoffice/tracker-master").then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    });
  }, []);

  // Optimista: la celda se queda con lo escrito y sólo se recarga si falla.
  async function guardar(id_acceso, campo, valor) {
    setDatos((d) => ({
      ...d,
      filas: d.filas.map((f) => (f.id_acceso === id_acceso ? { ...f, [campo]: valor } : f)),
    }));
    const r = await boPATCH(`/backoffice/tracker-master/${id_acceso}`, { [campo]: valor });
    if (!r.ok) cargar();
  }

  async function anadirUni(id_solicitud) {
    const universidad = (nuevaUni[id_solicitud] || "").trim();
    if (!universidad) return;
    const r = await boPOST("/backoffice/tracker-master", { id_solicitud, universidad });
    if (r.ok) { setNuevaUni((n) => ({ ...n, [id_solicitud]: "" })); cargar(); }
  }

  async function quitar(id_acceso) {
    const r = await boDELETE(`/backoffice/tracker-master/${id_acceso}`);
    if (r.ok) cargar();
  }

  // Se agrupa por cliente: la hoja se lee por persona, no por universidad
  // suelta, y así se ve de un golpe a cuántos sitios va cada uno.
  const porCliente = useMemo(() => {
    const t = q.trim().toLowerCase();
    const g = new Map();
    datos.filas.forEach((f) => {
      if (t && !`${f.cliente} ${f.universidad} ${f.master}`.toLowerCase().includes(t)) return;
      if (!g.has(f.id_solicitud)) g.set(f.id_solicitud, { cliente: f.cliente, paquete: f.paquete, responsable: f.responsable, filas: [] });
      g.get(f.id_solicitud).filas.push(f);
    });
    return [...g.entries()];
  }, [datos.filas, q]);

  const sinPost = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (datos.sin_postulacion || []).filter((s) => !t || s.cliente.toLowerCase().includes(t));
  }, [datos.sin_postulacion, q]);

  const r = datos.resumen || {};
  const input = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {[
          { n: r.clientes, t: "Clientes" },
          { n: r.postulaciones, t: "Postulaciones" },
          { n: r.postulados, t: "Postulados", c: "text-amber-600" },
          { n: r.en_espera, t: "Lista de espera", c: "text-violet-700" },
          { n: r.admitidos, t: "Admitidos", c: "text-[#1D6A4A]" },
          { n: r.sin_mover, t: "Sin postular", c: "text-red-600" },
        ].map((c) => (
          <div key={c.t} className="shrink-0 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 min-w-[88px]">
            <p className={`text-[17px] font-bold leading-none ${c.c || "text-[#1A3557]"}`}>{c.n ?? 0}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">{c.t}</p>
          </div>
        ))}
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, universidad o máster…"
        className={`${input} w-full`} />

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Cargando…</p>
      ) : (
        <div className="space-y-3">
          {porCliente.map(([id_solicitud, g]) => (
            <div key={id_solicitud} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border-b border-neutral-200 flex-wrap">
                <button type="button" onClick={() => onAbrirProceso?.(id_solicitud)}
                  className="text-[13px] font-bold text-[#1A3557] hover:underline">{g.cliente}</button>
                {g.paquete && <span className="text-[11px] text-neutral-500">· {g.paquete}</span>}
                <span className="text-[11px] text-neutral-400">
                  · {g.filas.length} universidad{g.filas.length === 1 ? "" : "es"}
                </span>
                <span className="ml-auto text-[11px] text-neutral-400">
                  {g.responsable || <span className="text-amber-600 font-semibold">sin asignar</span>}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[860px]">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      {["Universidad", "Estado", "Detalle personalizado", "Fase de postulación", "Fecha de resultados", ""]
                        .map((h) => (
                          <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-2 py-1.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.filas.map((f) => (
                      <tr key={f.id_acceso} className="border-b border-neutral-50 last:border-b-0 align-top">
                        <td className="px-2 py-1.5">
                          <Celda key={`u-${f.id_acceso}-${f.universidad}`} valor={f.universidad}
                            placeholder="Vigo" ancho="w-28"
                            onGuardar={(v) => guardar(f.id_acceso, "universidad", v)} />
                          <Celda key={`m-${f.id_acceso}-${f.master}`} valor={f.master}
                            placeholder="máster…" ancho="w-28"
                            onGuardar={(v) => guardar(f.id_acceso, "master", v)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <Estado valor={f.estado} estados={datos.estados}
                            onCambiar={(v) => guardar(f.id_acceso, "estado", v)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <Celda key={`d-${f.id_acceso}-${f.detalle}`} valor={f.detalle} multilinea
                            placeholder="Esperando resultados, se presentó reclamación…" ancho="w-56"
                            onGuardar={(v) => guardar(f.id_acceso, "detalle", v)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <Celda key={`fp-${f.id_acceso}-${f.fase_postulacion}`} valor={f.fase_postulacion}
                            placeholder="22 junio - 16 julio" ancho="w-36"
                            onGuardar={(v) => guardar(f.id_acceso, "fase_postulacion", v)} />
                          {f.dias_cierre !== null && (
                            <span className={`block text-[10px] px-1.5 ${
                              f.dias_cierre < 0 ? "text-neutral-400"
                                : f.dias_cierre <= 15 ? "text-red-600 font-semibold" : "text-neutral-400"
                            }`}>
                              {f.dias_cierre < 0 ? `cerró hace ${Math.abs(f.dias_cierre)}d` : `cierra en ${f.dias_cierre}d`}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <Celda key={`fr-${f.id_acceso}-${f.fecha_resultado}`} valor={f.fecha_resultado}
                            placeholder="22 de julio" ancho="w-32"
                            onGuardar={(v) => guardar(f.id_acceso, "fecha_resultado", v)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <button type="button" onClick={() => quitar(f.id_acceso)}
                            className="text-[10.5px] text-neutral-300 hover:text-red-600">Quitar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-100">
                <input
                  value={nuevaUni[id_solicitud] || ""}
                  onChange={(e) => setNuevaUni((n) => ({ ...n, [id_solicitud]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") anadirUni(id_solicitud); }}
                  placeholder="Añadir universidad…"
                  className="text-[12px] border border-neutral-200 rounded-lg px-2 py-1 w-48 focus:outline-none focus:border-[#1D6A4A]"
                />
                <button type="button" onClick={() => anadirUni(id_solicitud)}
                  disabled={!(nuevaUni[id_solicitud] || "").trim()}
                  className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline disabled:opacity-40">
                  + Añadir
                </button>
              </div>
            </div>
          ))}

          {/* Clientes activos a los que nadie ha cargado ninguna universidad:
              si no salen aquí, se quedan invisibles justo cuando toca moverlos. */}
          {sinPost.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-amber-700 mb-2">
                Sin ninguna universidad cargada · {sinPost.length}
              </p>
              <div className="space-y-2">
                {sinPost.map((s) => (
                  <div key={s.id_solicitud} className="flex items-center gap-2 flex-wrap">
                    <button type="button" onClick={() => onAbrirProceso?.(s.id_solicitud)}
                      className="text-[12.5px] font-semibold text-[#1A3557] hover:underline">{s.cliente}</button>
                    {s.paquete && <span className="text-[11px] text-neutral-500">{s.paquete}</span>}
                    {s.comunidades?.length > 0 && (
                      <span className="text-[11px] text-neutral-400">{s.comunidades.join(", ")}</span>
                    )}
                    <input
                      value={nuevaUni[s.id_solicitud] || ""}
                      onChange={(e) => setNuevaUni((n) => ({ ...n, [s.id_solicitud]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") anadirUni(s.id_solicitud); }}
                      placeholder="Primera universidad…"
                      className="ml-auto text-[12px] border border-neutral-200 rounded-lg px-2 py-1 w-44 focus:outline-none focus:border-[#1D6A4A]"
                    />
                    <button type="button" onClick={() => anadirUni(s.id_solicitud)}
                      disabled={!(nuevaUni[s.id_solicitud] || "").trim()}
                      className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline disabled:opacity-40">
                      + Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        Las fechas se escriben como en la hoja —«22 junio - 16 julio», «10 de septiembre»— y se
        guardan al salir de la celda. De un rango se toma el cierre para avisar del plazo.
      </p>
    </div>
  );
}
