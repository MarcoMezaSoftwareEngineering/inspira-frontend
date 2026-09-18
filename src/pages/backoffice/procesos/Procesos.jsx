// Vista central de procesos.
//
// Responde a "¿qué está pasando hoy con todos mis clientes?" sin abrir nada.
// Tres cosas se hacen desde aquí porque son las que más se repiten y obligaban
// a entrar al expediente: mover un proceso de etapa, registrar un cobro y dar
// de alta a un cliente nuevo.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";
import AltaRapida from "../clientes/AltaRapida";
import ProximasFechas from "./ProximasFechas";
import TrackerVisa from "./TrackerVisa";
import TrackerMaster from "./TrackerMaster";
import { Pagina, Cabecera, Boton } from "../ui";
import { Plus, X } from "lucide-react";
import { cambiarEtapa as patchEtapa } from "../comun/cambiarEtapa";

const COLOR_SERVICIO = {
  master: "bg-[#EEF2F8] text-[#1A3557]",
  visa:   "bg-[#FEF3E7] text-[#B9770E]",
  ee:     "bg-[#F5EEF8] text-[#7D3C98]",
  fp:     "bg-[#E8F5EE] text-[#1D6A4A]",
  legal:  "bg-[#FDEDEC] text-[#C0392B]",
  doc:    "bg-[#E6F4F6] text-[#0E5E6B]",
};
const CORTO = { master: "Máster", visa: "Visado", ee: "Estancia",
  mod: "Modificatoria", fp: "FP", legal: "Extranjería", doc: "Doctorado" };

// Los colores salen de las hojas de seguimiento del equipo: verde admitido,
// morado lista de espera, marrón cita completada, rojo excluido. En una tabla
// de noventa filas el color es lo que se lee, no el texto.
const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  sky:     "bg-sky-50 text-sky-800 border-sky-200",
  blue:    "bg-[#1A3557] text-white border-[#1A3557]",
  amber:   "bg-amber-50 text-amber-800 border-amber-300",
  violet:  "bg-violet-100 text-violet-800 border-violet-300",
  brown:   "bg-[#6B4423] text-white border-[#6B4423]",
  green:   "bg-[#1D6A4A] text-white border-[#1D6A4A]",
  red:     "bg-red-100 text-red-800 border-red-300",
  slate:   "bg-slate-200 text-slate-700 border-slate-300",
};

/* La etapa se ve como etiqueta de color y se cambia pulsandola. El <select>
   va superpuesto y transparente: conserva el desplegable nativo —que en movil
   es el que mejor funciona— sin renunciar al color, que es lo que hace legible
   la tabla de un vistazo. */
function Etapa({ p, onCambiar }) {
  const [guardando, setGuardando] = useState(false);
  const def = (p.pipeline || []).find((e) => e.valor === p.etapa);
  const tono = TONOS[def?.tono || "neutral"];

  async function cambiar(nueva) {
    if (nueva === p.etapa) return;
    setGuardando(true);
    await onCambiar(p, nueva);
    setGuardando(false);
  }

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide
          px-2 py-1 rounded border whitespace-nowrap ${tono}
          ${p.etapa_deducida ? "border-dashed opacity-80" : ""}
          ${guardando ? "opacity-50" : ""}`}
        title={p.etapa_deducida ? "Deducida del expediente, nadie la ha confirmado" : undefined}
      >
        {p.etapa}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
      <select
        value={p.etapa}
        disabled={guardando}
        onChange={(e) => cambiar(e.target.value)}
        aria-label="Cambiar etapa"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {(p.pipeline || []).map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
      </select>
    </div>
  );
}

/* Plazo legal del proceso. Estancia y extranjeria no tienen expediente donde
   anotar sus fechas de caducidad, y son las que no se pueden pasar. */
function PlazoLegal({ proceso, onGuardar }) {
  const [v, setV] = useState(proceso.fecha_limite || "");
  return (
    <input
      value={v}
      placeholder="—"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== (proceso.fecha_limite || "")) onGuardar(proceso, v); }}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      title={proceso.fecha_limite_nota || "Fecha límite o plazo legal"}
      className="w-24 text-[11px] text-neutral-700 bg-transparent border border-transparent rounded px-1.5 py-1
        hover:border-neutral-200 focus:border-[#1D6A4A] focus:bg-white outline-none placeholder:text-neutral-300"
    />
  );
}

function Proximo({ p }) {
  if (!p) return <span className="text-[11px] text-neutral-300">—</span>;
  const tono = p.vencido ? "text-red-700" : p.urgente ? "text-amber-700" : "text-neutral-500";
  const cuando = p.vencido ? `hace ${Math.abs(p.dias)}d` : p.dias === 0 ? "hoy" : `en ${p.dias}d`;
  return (
    <div className={`text-[11px] leading-tight ${tono}`}>
      <p className="font-semibold">{p.etiqueta}</p>
      <p className="opacity-80">{cuando}</p>
    </div>
  );
}

/* Estancia: fase real del expediente, a quién le toca, documentos y plazo.
   Sin esto la fila solo decía «Nuevo» aunque el expediente supiera más. */
const LE_TOCA_TONO = {
  asesor: "bg-[#EEF2F8] text-[#1A3557] border-[#c9d6e6]",
  asesorado: "bg-amber-50 text-amber-800 border-amber-200",
  "extranjería": "bg-violet-50 text-violet-700 border-violet-200",
  nadie: "bg-neutral-50 text-neutral-500 border-neutral-200",
};
function DetalleEstancia({ ee }) {
  if (!ee) return <p className="text-[10.5px] text-neutral-400 mt-1">Sin expediente de estancia abierto</p>;
  const d = ee.docs;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10.5px] text-neutral-500">
      <span className="font-semibold text-neutral-700">{ee.fase}</span>
      {ee.le_toca !== "nadie" && (
        <span className={`font-semibold px-1.5 py-0.5 rounded border ${LE_TOCA_TONO[ee.le_toca] || LE_TOCA_TONO.nadie}`}>
          le toca: {ee.le_toca}
        </span>
      )}
      {d.total > 0 && <span>docs {d.aprobados}/{d.total}</span>}
      {d.por_revisar > 0 && <span className="text-[#1A3557] font-semibold">{d.por_revisar} por revisar</span>}
      {d.observados > 0 && <span className="text-red-600 font-semibold">{d.observados} observados</span>}
      {ee.sin_fechas && <span className="text-amber-700 font-semibold">sin fechas de clases/llegada</span>}
      {ee.expediente && <span>exp. {ee.expediente}</span>}
    </div>
  );
}

/* Alta de cobro.
 *
 * Casi todo entra por transferencia, así que el sistema no se entera solo:
 * alguien tiene que registrarlo, y la prueba de que llegó es el voucher. Va
 * en el mismo formulario a propósito —lo que se deja para adjuntar después no
 * se adjunta— y la fecha se pide en vez de dar por hecho "hoy", porque el
 * aviso de la transferencia casi siempre llega más tarde que el dinero.
 */
function NuevoPago({ proceso, metodos, onHecho, onCerrar }) {
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("EUR");
  const [metodo, setMetodo] = useState("");
  const [cobrado, setCobrado] = useState(true);
  const [vence, setVence] = useState("");
  const [ref, setRef] = useState("");
  const [cuando, setCuando] = useState(() => new Date().toISOString().slice(0, 10));
  const [voucher, setVoucher] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState("");

  const input = "text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  async function guardar() {
    setGuardando(true);
    setErr("");

    // FormData porque puede llevar el voucher adjunto; el cliente HTTP lo
    // detecta y deja que el navegador ponga el Content-Type.
    const datos = new FormData();
    datos.append("monto", monto);
    datos.append("moneda", moneda);
    datos.append("estado_pago", cobrado ? "aprobado" : "pendiente");
    if (metodo) datos.append("id_metodo_pago", metodo);
    if (ref) datos.append("referencia", ref);
    if (cobrado && cuando) datos.append("fecha_pago", cuando);
    if (!cobrado && vence) datos.append("fecha_vencimiento", vence);
    if (voucher) datos.append("comprobante", voucher);

    const r = await boPOST(`/backoffice/procesos/${proceso.id_solicitud}/pago`, datos);
    setGuardando(false);
    if (r.ok) onHecho();
    else setErr(r.msg || "No se pudo registrar");
  }

  return (
    <div className="bg-[#F4F6F9] border-t border-neutral-200 px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        Registrar cobro · {proceso.cliente}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input className={`${input} w-24`} type="number" placeholder="Importe"
          value={monto} onChange={(e) => setMonto(e.target.value)} />
        <select className={input} value={moneda} onChange={(e) => setMoneda(e.target.value)}>
          <option>EUR</option><option>PEN</option><option>USD</option>
        </select>
        <select className={input} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
          <option value="">Método…</option>
          {metodos.map((m) => <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
          <input type="checkbox" checked={cobrado} onChange={(e) => setCobrado(e.target.checked)} />
          Ya cobrado
        </label>
        {cobrado ? (
          <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
            Pagó el
            <input className={input} type="date" value={cuando}
              onChange={(e) => setCuando(e.target.value)} aria-label="Fecha del pago" />
          </label>
        ) : (
          <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
            Vence el
            <input className={input} type="date" value={vence}
              onChange={(e) => setVence(e.target.value)} aria-label="Fecha de vencimiento" />
          </label>
        )}
        <input className={`${input} w-32`} placeholder="Nº de operación" value={ref} onChange={(e) => setRef(e.target.value)} />

        <label className={`${input} cursor-pointer flex items-center gap-1.5 ${
          voucher ? "border-[#1D6A4A] text-[#1D6A4A] font-semibold" : "text-neutral-500"
        }`}>
          {voucher ? `✓ ${voucher.name.slice(0, 22)}` : "📎 Voucher"}
          <input type="file" className="hidden" accept="image/*,application/pdf"
            onChange={(e) => setVoucher(e.target.files?.[0] || null)} />
        </label>
        {voucher && (
          <button type="button" onClick={() => setVoucher(null)}
            className="text-[11px] text-neutral-400 hover:text-red-600">quitar</button>
        )}

        <button type="button" onClick={guardar} disabled={guardando || !monto}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
          {guardando ? "…" : "Guardar"}
        </button>
        <button type="button" onClick={onCerrar} className="text-[12px] text-neutral-500 hover:text-neutral-800">
          Cancelar
        </button>
        {err && <span className="text-[11.5px] text-red-600">{err}</span>}
      </div>
    </div>
  );
}

/* Las tarjetas de Métricas. Cada una dice qué cuenta, por qué importa y, al
   abrirla, quiénes son y el motivo de cada uno: una cifra sola no se trabaja. */
const cuando = (d) => (d < 0 ? `hace ${-d} días` : d === 0 ? "hoy" : `en ${d} días`);
const METRICAS = [
  { k: "vencidos", t: "Fecha vencida", c: "text-red-600", tono: "rojo",
    d: "Una fecha clave ya pasó",
    explica: "Cita, plazo de presentación o de requerimiento que ya pasó sin cerrarse. Revisar hoy.",
    pasa: (p) => p.proximo?.vencido, motivo: (p) => `${p.proximo.etiqueta}: ${cuando(p.proximo.dias)}` },
  { k: "semana", t: "Vence esta semana", c: "text-amber-600", tono: "ambar",
    d: "Fecha clave en 7 días o menos",
    explica: "Lo que hay que preparar ya para no llegar tarde.",
    pasa: (p) => p.proximo?.urgente, motivo: (p) => `${p.proximo.etiqueta}: ${cuando(p.proximo.dias)}` },
  { k: "observados", t: "Documentos observados", c: "text-red-600", tono: "rojo",
    d: "El asesorado tiene que corregir",
    explica: "Documentos devueltos con observaciones. Le toca al asesorado; conviene recordárselo.",
    pasa: (p) => p.docs_observados > 0 || p.ee?.docs?.observados > 0,
    motivo: (p) => `${p.ee?.docs?.observados || p.docs_observados} documento(s) por corregir` },
  { k: "sin_resp", t: "Sin responsable", c: "text-amber-600", tono: "ambar",
    d: "Nadie los está llevando",
    explica: "Procesos sin asesor asignado. Asignar uno desde la ficha (le llega un correo).",
    pasa: (p) => !p.responsable, motivo: (p) => `${p.etapa} · alta ${new Date(p.creado).toLocaleDateString("es-PE")}` },
  { k: "deuda", t: "Con deuda", c: "text-red-600", tono: "rojo",
    d: "Queda dinero por cobrar",
    explica: "Cobros registrados que aún no están pagados del todo.",
    pasa: (p) => p.pago?.pendiente > 0,
    motivo: (p) => `Debe ${p.pago.pendiente.toFixed(0)}${p.pago.vencido ? " · cuota vencida" : ""}` },
  { k: "activos", t: "Procesos en marcha", c: "text-[#1A3557]", tono: "azul",
    d: "Todos los que no están cerrados",
    explica: "Todo lo activo, de cualquier servicio.",
    pasa: () => true, motivo: (p) => `${p.etapa}${p.responsable ? ` · ${p.responsable}` : " · sin asignar"}` },
];

export default function Procesos({ onAbrirProceso }) {
  const [procesos, setProcesos] = useState([]);
  const [filtros, setFiltros] = useState({ servicios: [], etapas: {}, responsables: [], origenes: [] });
  const [metodos, setMetodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState("");
  const [responsable, setResponsable] = useState("");
  const [soloAtencion, setSoloAtencion] = useState(false);
  const [verCerrados, setVerCerrados] = useState(false);

  const [altaAbierta, setAltaAbierta] = useState(false);
  const [pagoDe, setPagoDe] = useState(null);

  // Cierre en lote. La mayoria de lo cargado ya termino —el cliente ya entro o
  // ya tiene su visa— y cerrarlos de uno en uno son decenas de clics.
  const [seleccion, setSeleccion] = useState(new Set());
  const [antiguos, setAntiguos] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Un solo panel: la tabla general y los seguimientos por servicio son
  // pestanas, no secciones distintas del menu. Es el mismo dato mirado de
  // otra forma, y tenerlos separados obligaba a saltar entre pantallas.
  const [pestana, setPestana] = useState("metricas");
  const [metrica, setMetrica] = useState("");

  // Volcado de la respuesta al estado. Aparte de la peticion para que tanto el
  // efecto como el refresco manual usen exactamente el mismo tratamiento.
  const aplicar = useCallback((r) => {
    if (r.ok) {
      const pipelines = r.filtros?.etapas || {};
      setProcesos((r.procesos || []).map((p) => ({ ...p, pipeline: pipelines[p.servicio] || [] })));
      setFiltros(r.filtros || {});
      setError("");
    } else {
      setError(r.msg || "No se pudieron cargar los procesos");
    }
    setCargando(false);
  }, []);

  const cargar = useCallback(() => {
    return boGET("/backoffice/procesos").then(aplicar);
  }, [aplicar]);

  useEffect(() => {
    // Nada de setState sincrono aqui: `cargando` ya nace en true y todo lo
    // demas ocurre cuando responde la peticion.
    boGET("/backoffice/procesos").then(aplicar);
    boGET("/backoffice/procesos/metodos-pago").then((r) => r.ok && setMetodos(r.metodos || []));
  }, [aplicar]);

  async function guardarPlazo(p, valor) {
    setProcesos((prev) => prev.map((x) =>
      x.id_solicitud === p.id_solicitud ? { ...x, fecha_limite: valor } : x));
    const r = await boPATCH(`/backoffice/procesos/${p.id_solicitud}/plazo`, { fecha_limite: valor });
    if (!r.ok) { setError(r.msg || "No se pudo guardar el plazo"); cargar(); }
  }

  async function cambiarEtapa(p, nueva) {
    // Optimista: la fila se mueve al instante y se revierte si falla.
    setProcesos((prev) => prev.map((x) =>
      x.id_solicitud === p.id_solicitud
        ? { ...x, etapa: nueva, etapa_deducida: false }
        : x));
    const r = await patchEtapa(p.id_solicitud, nueva, p.servicio);
    if (!r.ok) { if (!r.cancelado) setError(r.msg || "No se pudo cambiar la etapa"); cargar(); }
  }

  // Se fija una sola vez al montar: leer el reloj durante el render hace que
  // el resultado cambie en cada pasada sin que nada haya cambiado de verdad.
  const [corteAntiguos] = useState(() => Date.now() - 4 * 30 * 86400000);

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return procesos.filter((p) => {
      if (!verCerrados && p.cerrado) return false;
      // La pestana ES el filtro de servicio.
      if (pestana !== "metricas" && p.servicio !== pestana) return false;
      if (etapa && p.etapa !== etapa) return false;
      if (responsable && String(p.id_responsable) !== responsable) return false;
      // Cuatro meses es el corte practico: un proceso de master o visado que
      // sigue "activo" pasado ese tiempo casi siempre es que nadie lo cerro.
      if (antiguos && new Date(p.creado).getTime() > corteAntiguos) return false;
      if (soloAtencion) {
        const urge = p.docs_observados > 0 || p.proximo?.vencido || p.proximo?.urgente
          || !p.responsable || p.pago?.vencido;
        if (!urge) return false;
      }
      if (texto && !`${p.cliente} ${p.email} ${p.subtipo}`.toLowerCase().includes(texto)) return false;
      return true;
    }).sort((a, b) => {
      // Lo que tiene fecha más cerca, arriba; lo que no tiene fecha, al final.
      const da = a.proximo ? a.proximo.dias : 9999;
      const db = b.proximo ? b.proximo.dias : 9999;
      return da - db;
    });
  }, [procesos, pestana, q, etapa, responsable, soloAtencion, verCerrados, antiguos, corteAntiguos]);

  const resumen = useMemo(() => ({
    activos: procesos.filter((p) => !p.cerrado).length,
    vencidos: procesos.filter((p) => p.proximo?.vencido).length,
    semana: procesos.filter((p) => p.proximo?.urgente).length,
    observados: procesos.filter((p) => p.docs_observados > 0).length,
    sinResp: procesos.filter((p) => !p.responsable && !p.cerrado).length,
    debiendo: procesos.filter((p) => p.pago?.pendiente > 0).length,
  }), [procesos]);

  const svcActivo = pestana !== "metricas" ? pestana : null;
  function alternarUno(id) {
    setSeleccion((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function alternarTodos() {
    setSeleccion((prev) =>
      prev.size === visibles.length ? new Set() : new Set(visibles.map((p) => p.id_solicitud))
    );
  }

  async function cerrarLote(nuevaEtapa) {
    if (!seleccion.size || cerrando) return;
    setCerrando(true);
    const r = await boPATCH("/backoffice/procesos/lote/etapa", {
      ids: [...seleccion], etapa: nuevaEtapa, servicio: pestana,
    });
    setCerrando(false);
    if (r.ok) { setSeleccion(new Set()); cargar(); }
    else setError(r.msg || "No se pudieron actualizar");
  }

  // La tira de pestañas no cabe entera en el móvil: al cambiar de vista, la
  // pestaña activa se trae al centro para que se vea cuál está abierta.
  const tiraRef = useRef(null);
  useEffect(() => {
    tiraRef.current?.querySelector('[data-on="1"]')
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pestana]);

  const etapasDelFiltro = svcActivo ? (filtros.etapas?.[svcActivo] || []) : [];
  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <Pagina>
      <Cabecera
        eyebrow="Procesos"
        titulo="Todo lo que está en marcha"
        subtitulo="Por servicio, con sus etapas, fechas y cobros. Toca una cifra para verla."
        acciones={
          <Boton tono="cta" icono={altaAbierta ? X : Plus} onClick={() => setAltaAbierta((v) => !v)}>
            {altaAbierta ? "Cerrar" : "Nuevo cliente"}
          </Boton>
        }
        stats={[
          { n: resumen.activos, l: "procesos activos", tono: "ok", onClick: () => setPestana("metricas") },
          { n: resumen.vencidos, l: "con fecha vencida", tono: resumen.vencidos ? "rojo" : undefined, onClick: () => setPestana("fechas") },
          { n: resumen.semana, l: "vencen esta semana", tono: resumen.semana ? "alerta" : undefined, onClick: () => setPestana("fechas") },
          { n: resumen.sinResp, l: "sin responsable", tono: resumen.sinResp ? "alerta" : undefined },
          { n: resumen.debiendo, l: "con deuda", tono: resumen.debiendo ? "rojo" : undefined },
        ]}
      />
    <div className="px-3 pb-6 sm:px-6 space-y-3 max-w-[1240px] mx-auto">
      <div className="ase-sticky -mx-3 px-3 sm:-mx-6 sm:px-6 pt-3 pb-2 space-y-2.5">
        <div className="ase-tira">
          <div className="ase-tira-scroll" ref={tiraRef}>
            {[
              { clave: "metricas", label: "Métricas" },
              { clave: "fechas", label: "Próximas fechas" },
              ...(filtros.servicios || []),
            ].map((sv) => {
              const n = ["metricas", "fechas"].includes(sv.clave)
                ? null
                : procesos.filter((p) => p.servicio === sv.clave && !p.cerrado).length;
              return (
                <button
                  key={sv.clave} type="button" onClick={() => setPestana(sv.clave)}
                  className="ase-tab" data-on={pestana === sv.clave ? "1" : "0"}
                  aria-pressed={pestana === sv.clave}
                >
                  {sv.label}
                  {n !== null && <span className="ase-tab-n">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {altaAbierta && (
        <div className="bg-white border-2 border-[#1D6A4A]/25 rounded-xl p-4">
          <AltaRapida onCancelar={() => setAltaAbierta(false)}
            onCreado={() => { setAltaAbierta(false); cargar(); }} />
        </div>
      )}

      {/* MÉTRICAS · sin tabla: es la vista de "cómo vamos", no de trabajar */}
      {pestana === "metricas" && (
        <div className="space-y-3">
          <p className="text-[12px] text-neutral-500 leading-relaxed">
            Toca una tarjeta para ver <b>quiénes son</b> y abrir su proceso. Solo cuenta lo que está en marcha.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {METRICAS.map((c) => {
              const lista = procesos.filter((p) => !p.cerrado && c.pasa(p));
              const n = lista.length;
              const on = metrica === c.k;
              // Un cero no es una alarma: la franja de color solo se enciende
              // cuando de verdad hay algo que atender.
              const tono = n > 0 ? c.tono : "calma";
              return (
                <button key={c.k} type="button" className="ase-metrica text-left" data-tono={tono}
                  aria-pressed={on} disabled={n === 0}
                  onClick={() => setMetrica(on ? "" : c.k)}
                  style={on ? { outline: "2px solid #1D6A4A", outlineOffset: 1 } : undefined}>
                  <span className={`ase-metrica-n ${n > 0 ? c.c : "text-neutral-300"}`}>{n}</span>
                  <span className="ase-metrica-t">{c.t}</span>
                  <span className="ase-metrica-d">{c.d}</span>
                  {n > 0 && <span className="ase-metrica-ir">{on ? "cerrar" : "ver quiénes →"}</span>}
                </button>
              );
            })}
          </div>

          {metrica && (() => {
            const def = METRICAS.find((m) => m.k === metrica);
            const lista = procesos.filter((p) => !p.cerrado && def.pasa(p));
            return (
              <div className="bg-white border-2 border-[#1D6A4A]/25 rounded-xl overflow-hidden">
                <p className="px-3.5 pt-3 pb-2 text-[12.5px] font-bold text-[#1A3557]">
                  {def.t} · {lista.length}
                  <span className="block text-[11px] font-normal text-neutral-500">{def.explica}</span>
                </p>
                <div className="divide-y divide-neutral-100">
                  {lista.map((p) => (
                    <button key={p.id_solicitud} type="button" onClick={() => onAbrirProceso?.(p.id_solicitud)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-50 flex items-start gap-2">
                      <span className={`shrink-0 text-[9.5px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${COLOR_SERVICIO[p.servicio] || ""}`}>
                        {CORTO[p.servicio]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-neutral-800 truncate">{p.cliente}</span>
                        <span className="block text-[11px] text-neutral-500">{def.motivo(p)}</span>
                      </span>
                      <span className="shrink-0 text-[11.5px] font-semibold text-[#1D6A4A]">Abrir →</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Reparto por servicio: pulsando se va a esa pestaña */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-3">
              Procesos activos por servicio
            </p>
            <div className="space-y-2">
              {(filtros.servicios || []).map((sv) => {
                const delSvc = procesos.filter((p) => p.servicio === sv.clave && !p.cerrado);
                const pct = resumen.activos ? Math.round((delSvc.length / resumen.activos) * 100) : 0;
                return (
                  <button key={sv.clave} type="button" onClick={() => setPestana(sv.clave)}
                    className="w-full text-left group">
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <span className="font-semibold text-neutral-700 group-hover:text-[#1D6A4A]">{sv.label}</span>
                      <span className="ml-auto font-bold text-neutral-800">{delSvc.length}</span>
                      <span className="text-neutral-400 w-9 text-right">{pct}%</span>
                    </div>
                    <div className="ase-barra h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {pestana === "fechas" && (
        <ProximasFechas onAbrirProceso={onAbrirProceso} />
      )}

      {/* Visado tiene su propia hoja de seguimiento, con las columnas con las
          que ya trabaja el equipo y edicion en la celda. */}
      {pestana === "visa" && (
        <TrackerVisa onAbrirProceso={onAbrirProceso} />
      )}

      {pestana === "master" && (
        <TrackerMaster onAbrirProceso={onAbrirProceso} />
      )}

      {!["metricas", "fechas", "visa", "master"].includes(pestana) && (<>

      {/* Filtros en una línea */}
      <div className="flex flex-wrap items-center gap-1.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…"
          className={`${sel} flex-1 min-w-[140px]`} />
        <select className={sel} value={etapa} onChange={(e) => setEtapa(e.target.value)}>
          <option value="">Todas las etapas</option>
          {etapasDelFiltro.map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
        </select>
        <select className={sel} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
          <option value="">Responsable</option>
          {filtros.responsables?.map((r) => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
        </select>
        <label className="flex items-center gap-1 text-[11.5px] text-neutral-600 whitespace-nowrap">
          <input type="checkbox" checked={soloAtencion} onChange={(e) => setSoloAtencion(e.target.checked)} />
          Necesita atención
        </label>
        <label className="flex items-center gap-1 text-[11.5px] text-neutral-600 whitespace-nowrap">
          <input type="checkbox" checked={antiguos} onChange={(e) => setAntiguos(e.target.checked)} />
          Más de 4 meses
        </label>
        <label className="flex items-center gap-1 text-[11.5px] text-neutral-600 whitespace-nowrap">
          <input type="checkbox" checked={verCerrados} onChange={(e) => setVerCerrados(e.target.checked)} />
          Cerrados
        </label>
        <span className="text-[11px] text-neutral-400 ml-auto">{visibles.length}/{procesos.length}</span>
      </div>

      {seleccion.size > 0 && (
        <div className="sticky bottom-3 z-30 flex items-center gap-2 flex-wrap bg-[#023A4B] text-white rounded-xl px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(2,58,75,.9)]">
          <span className="text-[12.5px] font-semibold">
            {seleccion.size} seleccionado{seleccion.size > 1 ? "s" : ""}
          </span>
          <button type="button" onClick={() => cerrarLote("Finalizado")} disabled={cerrando}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-white text-[#023A4B] disabled:opacity-50">
            {cerrando ? "Guardando…" : "Marcar como finalizado"}
          </button>
          <button type="button" onClick={() => cerrarLote(pestana === "visa" ? "Suspendida" : "Suspendido")}
            disabled={cerrando}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-white/40 text-white disabled:opacity-50">
            Suspender
          </button>
          <button type="button" onClick={() => setSeleccion(new Set())}
            className="text-[12px] text-white/70 hover:text-white ml-auto">
            Quitar selección
          </button>
        </div>
      )}

      {error && <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Nada coincide con estos filtros.</p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {/* Escritorio */}
          <table className="w-full text-left hidden lg:table">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-2.5 py-2 w-8">
                  <input type="checkbox" aria-label="Seleccionar todos"
                    checked={visibles.length > 0 && seleccion.size === visibles.length}
                    onChange={alternarTodos} />
                </th>
                {["Cliente", "Servicio", "Etapa", "Responsable", "Plazo legal", "Próximo", "Pago", ""].map((h) => (
                  <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-2.5 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <>
                  <tr key={p.id_solicitud}
                    className={`border-b border-neutral-100 hover:bg-neutral-50/60 ${
                      seleccion.has(p.id_solicitud) ? "bg-[#E8F5EE]" : ""
                    }`}>
                    <td className="px-2.5 py-2">
                      <input type="checkbox" aria-label={`Seleccionar ${p.cliente}`}
                        checked={seleccion.has(p.id_solicitud)}
                        onChange={() => alternarUno(p.id_solicitud)} />
                    </td>
                    <td className="px-2.5 py-2">
                      <p className="text-[12.5px] font-semibold text-neutral-800 leading-tight">{p.cliente}</p>
                      <p className="text-[10.5px] text-neutral-400 truncate max-w-[170px]">{p.subtipo || p.email}</p>
                      {p.servicio === "ee" && <DetalleEstancia ee={p.ee} />}
                      {p.servicio !== "ee" && (p.docs_observados > 0 || p.docs_pendientes > 0) && (
                        <p className="text-[10px] mt-0.5">
                          {p.docs_observados > 0 && <span className="text-red-600 font-semibold">{p.docs_observados} obs </span>}
                          {p.docs_pendientes > 0 && <span className="text-neutral-400">{p.docs_pendientes} pend</span>}
                        </p>
                      )}
                    </td>
                    <td className="px-2.5 py-2">
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${COLOR_SERVICIO[p.servicio]}`}>
                        {CORTO[p.servicio]}
                      </span>
                    </td>
                    <td className="px-2.5 py-2"><Etapa p={p} onCambiar={cambiarEtapa} /></td>
                    <td className="px-2.5 py-2 text-[11.5px] text-neutral-600">
                      {p.responsable || <span className="text-amber-600 font-semibold">sin asignar</span>}
                    </td>
                    <td className="px-2.5 py-2">
                      <PlazoLegal proceso={p} onGuardar={guardarPlazo} />
                    </td>
                    <td className="px-2.5 py-2"><Proximo p={p.proximo} /></td>
                    <td className="px-2.5 py-2">
                      {p.pago.sin_registro ? (
                        <button type="button" onClick={() => setPagoDe(pagoDe === p.id_solicitud ? null : p.id_solicitud)}
                          className="text-[11px] font-semibold text-[#046C8C] hover:underline">+ cobro</button>
                      ) : (
                        <div className="text-[11px] leading-tight">
                          <span className="font-semibold text-[#1D6A4A]">{p.pago.pagado.toFixed(0)}</span>
                          {p.pago.pendiente > 0 && (
                            <span className={p.pago.vencido ? "text-red-600 font-semibold" : "text-neutral-500"}>
                              {" "}· debe {p.pago.pendiente.toFixed(0)}
                            </span>
                          )}
                          <button type="button" onClick={() => setPagoDe(pagoDe === p.id_solicitud ? null : p.id_solicitud)}
                            className="block text-[10px] text-[#046C8C] hover:underline">+ cobro</button>
                        </div>
                      )}
                    </td>
                    <td className="px-2.5 py-2">
                      <button type="button" onClick={() => onAbrirProceso?.(p.id_solicitud)}
                        className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline">Abrir</button>
                    </td>
                  </tr>
                  {pagoDe === p.id_solicitud && (
                    <tr key={`pago-${p.id_solicitud}`}>
                      <td colSpan={9} className="p-0">
                        <NuevoPago proceso={p} metodos={metodos}
                          onHecho={() => { setPagoDe(null); cargar(); }}
                          onCerrar={() => setPagoDe(null)} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {/* Móvil: filas densas, no tarjetas grandes */}
          <div className="lg:hidden divide-y divide-neutral-100">
            {visibles.map((p) => (
              <div key={p.id_solicitud} className="px-3 py-3 active:bg-neutral-50 transition-colors">
                <div className="flex items-start gap-2">
                  {/* Solo el nombre abre el expediente: la etapa se cambia sin
                      salir de la lista, y va fuera de esta zona. */}
                  <button type="button" className="min-w-0 flex-1 text-left"
                    onClick={() => onAbrirProceso?.(p.id_solicitud)}>
                    <span className="flex items-center gap-1.5">
                      <span className={`shrink-0 text-[9.5px] font-bold px-1.5 py-0.5 rounded ${COLOR_SERVICIO[p.servicio]}`}>
                        {CORTO[p.servicio]}
                      </span>
                      <span className="text-[13px] font-semibold text-neutral-800 truncate">{p.cliente}</span>
                    </span>
                  </button>
                  <span className="shrink-0 text-right"><Proximo p={p.proximo} /></span>
                </div>
                {/* Etapa y avisos comparten línea: la fila pasa de tres alturas
                    a dos y en el móvil caben el doble de procesos. */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Etapa p={p} onCambiar={cambiarEtapa} />
                  {p.responsable
                    ? <span className="text-[10.5px] text-neutral-500">{p.responsable}</span>
                    : <span className="text-[10.5px] font-semibold text-amber-600">sin asignar</span>}
                  {p.servicio !== "ee" && p.docs_observados > 0 && <span className="text-[10.5px] font-semibold text-red-600">{p.docs_observados} obs</span>}
                  {p.pago.pendiente > 0 && (
                    <span className={`text-[10.5px] font-semibold ${p.pago.vencido ? "text-red-600" : "text-neutral-500"}`}>
                      debe {p.pago.pendiente.toFixed(0)}
                    </span>
                  )}
                </div>
                {p.servicio === "ee" && <DetalleEstancia ee={p.ee} />}
              </div>
            ))}
          </div>
        </div>
      )}

      </>)}
    </div>
    </Pagina>
  );
}
