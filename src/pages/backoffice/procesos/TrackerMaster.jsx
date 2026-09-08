// Tracker de máster: la hoja MACRO, dentro del sistema.
//
// Una fila por postulación —cliente × universidad—, como está montada la hoja
// y como se trabaja: un cliente postula a seis sitios y cada uno va a su
// ritmo. Todo se edita en la celda; entrar al expediente para cambiar un
// estado es lo que hace que la gente vuelva al Excel.
//
// La hoja se mira desde el móvil tanto como desde el escritorio, y son dos
// trabajos distintos. En el escritorio es una tabla: veinte filas comparadas
// columna contra columna. En el móvil esa misma tabla obligaba a arrastrar en
// horizontal y cortaba el nombre de la universidad a la mitad, así que abajo
// de `lg` cada postulación se dibuja como ficha, con la etiqueta delante del
// dato. Es la misma fila, no un resumen: se edita todo igual.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// El mismo color, en sólido, para el punto del resumen de la tarjeta plegada.
const PUNTOS = {
  neutral: "#cbd5d3", sky: "#38bdf8", amber: "#f0b429", violet: "#a78bfa",
  green: "#1D6A4A", teal: "#2dd4bf", red: "#dc2626", pink: "#f9a8d4", slate: "#64748b",
};

// Los tres momentos por los que se pregunta de verdad al abrir la hoja.
const GRUPOS = {
  postulado: (e) => e === "POSTULADO",
  espera:    (e) => e.startsWith("LISTA DE ESPERA"),
  admitido:  (e) => e === "ADMITIDO",
};

const CLAVE_PLEGADOS = "inspira.tracker-master.plegados";

function leerPlegados() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_PLEGADOS) || "[]");
    return new Set(Array.isArray(v) ? v : []);
  } catch { return new Set(); }
}

/* Celda que guarda al salir del campo. Sin botones: escribir y pasar a la
   siguiente es exactamente el gesto de la hoja de cálculo.

   Lo que se le añade es el acuse: al salir del campo no pasaba nada visible y
   la duda —«¿se ha guardado?»— acababa en recargar la página para comprobar.
   Ahora la celda dice que está guardando, que guardó, o que no pudo. */
function Celda({ valor, onGuardar, placeholder, etiqueta, multilinea }) {
  const [v, setV] = useState(valor || "");
  const [estado, setEstado] = useState("quieto"); // quieto | guardando | ok | error

  // El valor de fuera manda cuando cambia por su cuenta (una recarga tras un
  // fallo, otra asesora tocando la misma fila). Antes esto se resolvía
  // remontando la celda con una `key` que llevaba el valor dentro, pero eso
  // borraba el acuse justo cuando había que enseñarlo. Se ajusta durante el
  // render y no en un efecto: así no hay un fotograma con el valor viejo.
  const [visto, setVisto] = useState(valor || "");
  if ((valor || "") !== visto) {
    setVisto(valor || "");
    setV(valor || "");
  }

  // El visto se apaga solo: es un acuse, no un estado de la fila.
  useEffect(() => {
    if (estado !== "ok") return undefined;
    const t = setTimeout(() => setEstado("quieto"), 1800);
    return () => clearTimeout(t);
  }, [estado]);

  async function salir() {
    if ((v || "") === (valor || "")) return;
    setEstado("guardando");
    const ok = await onGuardar(v);
    setEstado(ok === false ? "error" : "ok");
  }

  const comunes = {
    value: v, placeholder, "aria-label": etiqueta,
    disabled: estado === "guardando",
    onChange: (e) => { setV(e.target.value); if (estado === "error") setEstado("quieto"); },
    onBlur: salir,
  };

  return (
    <span className="ase-tm-celda" data-estado={estado}>
      {multilinea ? (
        <textarea rows={2} {...comunes} />
      ) : (
        <input {...comunes} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      )}
      {estado === "guardando" && <span className="ase-tm-aviso" data-tipo="guardando" />}
      {estado === "ok" && (
        <span className="ase-tm-aviso" data-tipo="ok" title="Guardado">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      )}
      {estado === "error" && (
        <span className="ase-tm-aviso" data-tipo="error" title="No se pudo guardar; vuelve a intentarlo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" d="M12 6v8m0 3.5v.5" />
          </svg>
        </span>
      )}
    </span>
  );
}

function Estado({ valor, estados, onCambiar }) {
  const def = estados.find((e) => e.valor === valor);
  return (
    <span className="relative inline-block">
      <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide
        px-2 py-1.5 rounded-lg border whitespace-nowrap ${TONOS[def?.tono || "neutral"]}`}>
        {valor}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
      <select value={valor} onChange={(e) => onCambiar(e.target.value)} aria-label="Cambiar estado"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
        {estados.map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
      </select>
    </span>
  );
}

/* Aviso de plazo. Rojo sólo cuando quedan dos semanas o menos: si todo urge,
   nada urge, y la hoja tiene noventa filas. */
function Plazo({ dias, cerrado, abierto }) {
  if (dias === null || dias === undefined) return null;
  if (dias < 0) return <span className="ase-tm-plazo">{cerrado} hace {Math.abs(dias)}d</span>;
  return (
    <span className="ase-tm-plazo" data-urge={dias <= 7 ? "1" : dias <= 21 ? "2" : "0"}>
      {abierto} {dias === 0 ? "hoy" : `en ${dias}d`}
    </span>
  );
}

/* Quitar en dos toques. Borraba a la primera, y en el móvil basta con rozar
   la pantalla al desplazar para perder una postulación cargada a mano. */
function Quitar({ onQuitar }) {
  const [confirmar, setConfirmar] = useState(false);
  useEffect(() => {
    if (!confirmar) return undefined;
    const t = setTimeout(() => setConfirmar(false), 4000);
    return () => clearTimeout(t);
  }, [confirmar]);
  return (
    <button type="button" className="ase-tm-quitar" data-confirmar={confirmar ? "1" : "0"}
      onClick={() => (confirmar ? onQuitar() : setConfirmar(true))}>
      {confirmar ? "¿Seguro?" : "Quitar"}
    </button>
  );
}

export default function TrackerMaster({ onAbrirProceso }) {
  const [datos, setDatos] = useState({ filas: [], sin_postulacion: [], estados: [], resumen: {} });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [uni, setUni] = useState("");
  const [grupo, setGrupo] = useState("");
  const [nuevaUni, setNuevaUni] = useState({});
  const [plegados, setPlegados] = useState(leerPlegados);
  const sinRef = useRef(null);

  const cargar = useCallback(() => (
    boGET("/backoffice/tracker-master").then((r) => {
      if (r.ok) { setDatos(r); setError(""); }
      else setError(r.msg || "No se pudo cargar la hoja");
      setCargando(false);
    })
  ), []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    try { localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify([...plegados])); } catch { /* modo privado */ }
  }, [plegados]);

  // Optimista: la celda se queda con lo escrito y sólo se recarga si falla.
  // Devuelve si fue bien para que la celda pueda acusar recibo.
  async function guardar(id_acceso, campo, valor) {
    setDatos((d) => ({
      ...d,
      filas: d.filas.map((f) => (f.id_acceso === id_acceso ? { ...f, [campo]: valor } : f)),
    }));
    const r = await boPATCH(`/backoffice/tracker-master/${id_acceso}`, { [campo]: valor });
    if (!r.ok) { setError(r.msg || "No se pudo guardar"); cargar(); return false; }
    setError("");
    return true;
  }

  async function anadirUni(id_solicitud) {
    const universidad = (nuevaUni[id_solicitud] || "").trim();
    if (!universidad) return;
    const r = await boPOST("/backoffice/tracker-master", { id_solicitud, universidad });
    if (r.ok) {
      setNuevaUni((n) => ({ ...n, [id_solicitud]: "" }));
      // Quien acaba de cargar su primera universidad tiene que verla, aunque
      // dejara la tarjeta plegada la última vez.
      setPlegados((p) => { const n = new Set(p); n.delete(id_solicitud); return n; });
      cargar();
    } else setError(r.msg || "No se pudo añadir la universidad");
  }

  async function quitar(id_acceso) {
    const r = await boDELETE(`/backoffice/tracker-master/${id_acceso}`);
    if (r.ok) cargar();
    else setError(r.msg || "No se pudo quitar");
  }

  // Las universidades del desplegable salen de la propia hoja, con cuántos
  // van a cada una: un catálogo fijo se quedaría corto en cuanto alguien
  // escriba una nueva.
  const universidades = useMemo(() => {
    const c = new Map();
    datos.filas.forEach((f) => {
      const u = (f.universidad || "").trim();
      if (u) c.set(u, (c.get(u) || 0) + 1);
    });
    return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [datos.filas]);

  // Se agrupa por cliente: la hoja se lee por persona, no por universidad
  // suelta, y así se ve de un golpe a cuántos sitios va cada uno.
  const porCliente = useMemo(() => {
    const t = q.trim().toLowerCase();
    const pasa = GRUPOS[grupo];
    const g = new Map();
    datos.filas.forEach((f) => {
      if (uni && (f.universidad || "").trim() !== uni) return;
      if (pasa && !pasa(f.estado || "")) return;
      if (t && !`${f.cliente} ${f.universidad} ${f.master}`.toLowerCase().includes(t)) return;
      if (!g.has(f.id_solicitud)) {
        g.set(f.id_solicitud, { cliente: f.cliente, paquete: f.paquete, responsable: f.responsable, filas: [] });
      }
      g.get(f.id_solicitud).filas.push(f);
    });
    return [...g.entries()];
  }, [datos.filas, q, uni, grupo]);

  const sinPost = useMemo(() => {
    // Con un filtro puesto —una universidad, un estado— quien no tiene ninguna
    // postulación no pinta nada: se está mirando otra cosa.
    if (uni || grupo) return [];
    const t = q.trim().toLowerCase();
    return (datos.sin_postulacion || []).filter((s) => !t || s.cliente.toLowerCase().includes(t));
  }, [datos.sin_postulacion, q, uni, grupo]);

  const r = datos.resumen || {};
  const filtrando = Boolean(q.trim() || uni || grupo);
  const todosPlegados = porCliente.length > 0 && porCliente.every(([id]) => plegados.has(id));

  const input = "text-[12.5px] text-neutral-700 border border-neutral-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-[#1D6A4A] focus:ring-4 focus:ring-[#1D6A4A]/10 transition-shadow";

  function alternarPlegado(id) {
    setPlegados((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function plegarTodos() {
    setPlegados(todosPlegados ? new Set() : new Set(porCliente.map(([id]) => id)));
  }

  return (
    <div className="space-y-3">
      {/* Resumen. Los tres momentos del proceso filtran la hoja al pulsarlos:
          antes eran números que no llevaban a ninguna parte. */}
      <div className="ase-tira">
        <div className="ase-tira-scroll">
          {[
            { n: r.clientes,      t: "Clientes" },
            { n: r.postulaciones, t: "Postulaciones" },
            { n: r.postulados,    t: "Postulados",      c: "text-amber-600",   k: "postulado" },
            { n: r.en_espera,     t: "Lista de espera", c: "text-violet-700",  k: "espera" },
            { n: r.admitidos,     t: "Admitidos",       c: "text-[#1D6A4A]",   k: "admitido" },
            { n: r.sin_mover,     t: "Sin postular",    c: "text-red-600",     ir: true },
          ].map((c) => {
            const on = c.k && grupo === c.k;
            const clase = `shrink-0 rounded-xl px-3 py-2 min-w-[94px] text-left border transition-all ${
              on ? "border-[#1D6A4A] bg-[#E8F5EE] shadow-[0_10px_22px_-16px_rgba(29,106,74,.95)]"
                 : "border-neutral-200 bg-white"}`;
            const dentro = (
              <>
                <p className={`text-[18px] font-bold leading-none ase-num ${c.c || "text-[#1A3557]"}`}>{c.n ?? 0}</p>
                <p className="text-[10px] text-neutral-500 mt-1 whitespace-nowrap">
                  {c.t}{on && " ·"}{on && <span className="text-[#1D6A4A] font-bold"> quitar</span>}
                </p>
              </>
            );
            if (c.k) {
              return (
                <button key={c.t} type="button" aria-pressed={on}
                  onClick={() => setGrupo(on ? "" : c.k)}
                  title={on ? "Quitar el filtro" : `Ver sólo ${c.t.toLowerCase()}`}
                  className={`${clase} hover:border-[#1D6A4A]/50 active:scale-[.97]`}>
                  {dentro}
                </button>
              );
            }
            if (c.ir && (c.n ?? 0) > 0) {
              return (
                <button key={c.t} type="button" title="Ir a quien no tiene ninguna universidad cargada"
                  onClick={() => {
                    // El bloque no se dibuja con un filtro puesto, así que hay
                    // que quitarlos antes de intentar bajar hasta él.
                    setUni(""); setGrupo(""); setQ("");
                    requestAnimationFrame(() =>
                      sinRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
                  }}
                  className={`${clase} hover:border-amber-300 active:scale-[.97]`}>
                  {dentro}
                </button>
              );
            }
            return <div key={c.t} className={clase}>{dentro}</div>;
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cliente, universidad o máster…"
            className={`${input} w-full pr-8`} />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Limpiar la búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-[15px] leading-none">
              ×
            </button>
          )}
        </div>
        <select value={uni} onChange={(e) => setUni(e.target.value)} aria-label="Filtrar por universidad"
          className={`${input} sm:max-w-[300px]`}>
          <option value="">Todas las universidades ({universidades.length})</option>
          {universidades.map(([u, n]) => (
            <option key={u} value={u}>{u} · {n}</option>
          ))}
        </select>
      </div>

      {/* Lo que está filtrando, siempre a la vista y siempre quitable de un
          toque: con tres filtros a la vez, «no aparece nadie» casi nunca es
          que no haya nadie. */}
      {(filtrando || porCliente.length > 1) && (
        <div className="flex items-center gap-1.5 flex-wrap text-[11.5px]">
          {uni && (
            <button type="button" onClick={() => setUni("")}
              className="inline-flex items-center gap-1.5 font-semibold text-[#1A3557] bg-[#EEF2F8] border border-[#d6e0ee] rounded-full pl-2.5 pr-2 py-1 hover:bg-[#e3ebf5]">
              {uni} <span className="text-neutral-400 text-[13px] leading-none">×</span>
            </button>
          )}
          {grupo && (
            <button type="button" onClick={() => setGrupo("")}
              className="inline-flex items-center gap-1.5 font-semibold text-[#1D6A4A] bg-[#E8F5EE] border border-[#c7e2d4] rounded-full pl-2.5 pr-2 py-1 hover:bg-[#dbeee4]">
              {{ postulado: "Postulados", espera: "Lista de espera", admitido: "Admitidos" }[grupo]}
              <span className="text-neutral-400 text-[13px] leading-none">×</span>
            </button>
          )}
          <span className="text-neutral-400">
            {porCliente.length} cliente{porCliente.length === 1 ? "" : "s"}
            {filtrando && ` · ${porCliente.reduce((n, [, g]) => n + g.filas.length, 0)} postulaciones`}
          </span>
          {/* Con un filtro puesto todo va desplegado a la fuerza: plegar no
              haría nada visible, así que el botón tampoco está. */}
          {!filtrando && porCliente.length > 1 && (
            <button type="button" onClick={plegarTodos}
              className="ml-auto font-semibold text-neutral-500 hover:text-[#1D6A4A]">
              {todosPlegados ? "Desplegar todo" : "Plegar todo"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12.5px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => { setError(""); cargar(); }}
            className="font-semibold underline shrink-0">Reintentar</button>
        </p>
      )}

      {/* Las universidades ya escritas sirven de sugerencia al añadir: casi
          siempre se repite una que ya está en la hoja, y escribirla distinta
          la parte en dos en el desplegable de arriba. */}
      <datalist id="ase-tm-unis">
        {universidades.map(([u]) => <option key={u} value={u} />)}
      </datalist>

      {cargando ? (
        <div className="space-y-3" aria-busy="true" aria-label="Cargando la hoja">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-3 space-y-2">
              <div className="ase-esq h-4 w-1/3" />
              <div className="ase-esq h-9 w-full" />
              <div className="ase-esq h-9 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {porCliente.length === 0 && sinPost.length === 0 && (
            <div className="ase-vacio">
              <p className="ase-vacio-t">Nada coincide</p>
              <p className="ase-vacio-p">
                {filtrando
                  ? "Prueba a quitar alguno de los filtros de arriba."
                  : "Todavía no hay ninguna postulación cargada en la hoja."}
              </p>
              {filtrando && (
                <div className="ase-vacio-acc">
                  <button type="button" onClick={() => { setQ(""); setUni(""); setGrupo(""); }}
                    className="text-[12px] font-semibold text-white bg-[#1D6A4A] rounded-lg px-3.5 py-2">
                    Quitar los filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {porCliente.map(([id_solicitud, g]) => {
            // Con un filtro puesto se despliega igualmente: lo que se busca no
            // puede quedar escondido detrás de una tarjeta plegada.
            const abierto = filtrando || !plegados.has(id_solicitud);
            const cuenta = new Map();
            g.filas.forEach((f) => cuenta.set(f.estado, (cuenta.get(f.estado) || 0) + 1));
            const resumenEstados = [...cuenta.entries()].sort((a, b) => b[1] - a[1]);

            return (
              <article key={id_solicitud} className="ase-tm-cli" data-abierto={abierto ? "1" : "0"}>
                <div className="ase-tm-cab">
                  <button type="button" className="ase-tm-plegar"
                    onClick={() => alternarPlegado(id_solicitud)}
                    aria-expanded={abierto} disabled={filtrando}
                    title={abierto ? "Plegar" : "Desplegar"}>
                    <span className="ase-tm-chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="ase-tm-nombre">{g.cliente}</span>
                      <span className="ase-tm-meta">
                        {g.paquete && <><b>{g.paquete}</b> · </>}
                        {g.filas.length} universidad{g.filas.length === 1 ? "" : "es"} ·{" "}
                        {g.responsable || <i>sin asignar</i>}
                      </span>
                    </span>
                  </button>
                  <button type="button" className="ase-tm-abrir"
                    onClick={() => onAbrirProceso?.(id_solicitud)}
                    title={`Abrir el expediente de ${g.cliente}`}>
                    Ficha
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18v4.5M17.5 6.5L10 14M16 14v4H6V8h4" />
                    </svg>
                  </button>
                </div>

                {/* Plegada, la tarjeta sigue diciendo en qué punto está: sin
                    esto habría que abrir las quince para saber a quién le
                    falta moverse. */}
                {!abierto && resumenEstados.length > 0 && (
                  <div className="ase-tm-puntos">
                    {resumenEstados.map(([e, n]) => {
                      const tono = datos.estados.find((x) => x.valor === e)?.tono || "neutral";
                      return (
                        <span key={e} className="ase-tm-punto">
                          <i style={{ background: PUNTOS[tono] }} />
                          <b>{n}</b> {e.replace("LISTA DE ESPERA ", "L. ESPERA ")}
                        </span>
                      );
                    })}
                  </div>
                )}

                {abierto && (<>
                  {/* Escritorio: la tabla, que es para comparar. */}
                  <div className="ase-tabla-scroll hidden lg:block">
                    <table className="w-full text-left min-w-[780px]">
                      <colgroup>
                        <col style={{ width: "22%" }} /><col style={{ width: "13%" }} />
                        <col style={{ width: "28%" }} /><col style={{ width: "17%" }} />
                        <col style={{ width: "14%" }} /><col style={{ width: "6%" }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-neutral-100">
                          {["Universidad y máster", "Estado", "Detalle personalizado", "Fase de postulación", "Fecha de resultados", ""]
                            .map((h) => (
                              <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-2 py-2 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {g.filas.map((f) => (
                          <tr key={f.id_acceso} className="border-b border-neutral-50 last:border-b-0 align-top hover:bg-neutral-50/60 transition-colors">
                            <td className="px-2 py-2 space-y-1">
                              <Celda valor={f.universidad} placeholder="Vigo" etiqueta="Universidad"
                                onGuardar={(v) => guardar(f.id_acceso, "universidad", v)} />
                              <Celda valor={f.master} placeholder="máster…" etiqueta="Máster"
                                onGuardar={(v) => guardar(f.id_acceso, "master", v)} />
                            </td>
                            <td className="px-2 py-2">
                              <Estado valor={f.estado} estados={datos.estados}
                                onCambiar={(v) => guardar(f.id_acceso, "estado", v)} />
                            </td>
                            <td className="px-2 py-2">
                              <Celda valor={f.detalle} multilinea etiqueta="Detalle personalizado"
                                placeholder="Esperando resultados, se presentó reclamación…"
                                onGuardar={(v) => guardar(f.id_acceso, "detalle", v)} />
                            </td>
                            <td className="px-2 py-2 space-y-1">
                              <Celda valor={f.fase_postulacion} placeholder="22 junio - 16 julio" etiqueta="Fase de postulación"
                                onGuardar={(v) => guardar(f.id_acceso, "fase_postulacion", v)} />
                              <Plazo dias={f.dias_cierre} cerrado="cerró" abierto="cierra" />
                            </td>
                            <td className="px-2 py-2 space-y-1">
                              <Celda valor={f.fecha_resultado} placeholder="22 de julio" etiqueta="Fecha de resultados"
                                onGuardar={(v) => guardar(f.id_acceso, "fecha_resultado", v)} />
                              <Plazo dias={f.dias_resultado} cerrado="salió" abierto="salen" />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Quitar onQuitar={() => quitar(f.id_acceso)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Móvil: la misma fila, en pie. Nada se corta y no hay que
                      arrastrar en horizontal para leer el estado. */}
                  <div className="lg:hidden">
                    {g.filas.map((f) => (
                      <div key={f.id_acceso} className="ase-tm-post">
                        <div className="ase-tm-post-cab">
                          <Estado valor={f.estado} estados={datos.estados}
                            onCambiar={(v) => guardar(f.id_acceso, "estado", v)} />
                          <Plazo dias={f.dias_cierre} cerrado="cerró" abierto="cierra" />
                          <span className="ml-auto"><Quitar onQuitar={() => quitar(f.id_acceso)} /></span>
                        </div>
                        <dl className="ase-tm-campos">
                          <dt>Universidad</dt>
                          <dd>
                            <Celda valor={f.universidad} placeholder="Vigo" etiqueta="Universidad"
                              onGuardar={(v) => guardar(f.id_acceso, "universidad", v)} />
                          </dd>
                          <dt>Máster</dt>
                          <dd>
                            <Celda valor={f.master} placeholder="Máster Universitario en…" etiqueta="Máster"
                              onGuardar={(v) => guardar(f.id_acceso, "master", v)} />
                          </dd>
                          <dt>Detalle</dt>
                          <dd>
                            <Celda valor={f.detalle} multilinea etiqueta="Detalle personalizado"
                              placeholder="Esperando resultados, se presentó reclamación…"
                              onGuardar={(v) => guardar(f.id_acceso, "detalle", v)} />
                          </dd>
                          <dt>Fase</dt>
                          <dd>
                            <Celda valor={f.fase_postulacion} placeholder="22 junio - 16 julio" etiqueta="Fase de postulación"
                              onGuardar={(v) => guardar(f.id_acceso, "fase_postulacion", v)} />
                          </dd>
                          <dt>Resultados</dt>
                          <dd>
                            <Celda valor={f.fecha_resultado} placeholder="22 de julio" etiqueta="Fecha de resultados"
                              onGuardar={(v) => guardar(f.id_acceso, "fecha_resultado", v)} />
                            <span className="block mt-1">
                              <Plazo dias={f.dias_resultado} cerrado="salió" abierto="salen" />
                            </span>
                          </dd>
                        </dl>
                      </div>
                    ))}
                  </div>

                  <div className="ase-tm-anadir">
                    <input
                      list="ase-tm-unis"
                      value={nuevaUni[id_solicitud] || ""}
                      onChange={(e) => setNuevaUni((n) => ({ ...n, [id_solicitud]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") anadirUni(id_solicitud); }}
                      placeholder="Añadir universidad…"
                      aria-label={`Añadir una universidad a ${g.cliente}`}
                    />
                    <button type="button" onClick={() => anadirUni(id_solicitud)}
                      disabled={!(nuevaUni[id_solicitud] || "").trim()}>
                      Añadir
                    </button>
                  </div>
                </>)}
              </article>
            );
          })}

          {/* Clientes activos a los que nadie ha cargado ninguna universidad:
              si no salen aquí, se quedan invisibles justo cuando toca moverlos. */}
          {sinPost.length > 0 && (
            <div ref={sinRef} className="bg-white border border-amber-200 rounded-2xl px-3.5 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-amber-700 mb-1.5">
                Sin ninguna universidad cargada · {sinPost.length}
              </p>
              <div className="ase-tm-sin">
                {sinPost.map((s) => (
                  <div key={s.id_solicitud} className="ase-tm-sin-fila">
                    <button type="button" className="ase-tm-sin-nom"
                      onClick={() => onAbrirProceso?.(s.id_solicitud)}
                      title={`Abrir el expediente de ${s.cliente}`}>
                      {s.cliente}
                    </button>
                    {(s.paquete || s.comunidades?.length > 0) && (
                      <div className="ase-tm-sin-etq">
                        {s.paquete && <span>{s.paquete}</span>}
                        {s.comunidades?.map((c) => <span key={c}>{c}</span>)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        list="ase-tm-unis"
                        value={nuevaUni[s.id_solicitud] || ""}
                        onChange={(e) => setNuevaUni((n) => ({ ...n, [s.id_solicitud]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") anadirUni(s.id_solicitud); }}
                        placeholder="Primera universidad…"
                        aria-label={`Primera universidad de ${s.cliente}`}
                        className="flex-1 min-w-0 text-[12.5px] border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-[#1D6A4A] focus:ring-4 focus:ring-[#1D6A4A]/10"
                      />
                      <button type="button" onClick={() => anadirUni(s.id_solicitud)}
                        disabled={!(nuevaUni[s.id_solicitud] || "").trim()}
                        className="shrink-0 text-[12px] font-bold text-white bg-[#1D6A4A] rounded-lg px-3.5 py-2 disabled:bg-neutral-300 hover:bg-[#15533a] active:scale-95 transition-all">
                        Añadir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        Las fechas se escriben como en la hoja —«22 junio - 16 julio», «10 de septiembre»— y se
        guardan al salir de la celda; el visto verde confirma que quedó guardado. De un rango se
        toma el cierre para avisar del plazo.
      </p>
    </div>
  );
}
