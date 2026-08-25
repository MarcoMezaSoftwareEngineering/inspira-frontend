// Vista central de procesos.
//
// Responde a "¿qué está pasando hoy con todos mis clientes?" sin abrir nada.
// Tres cosas se hacen desde aquí porque son las que más se repiten y obligaban
// a entrar al expediente: mover un proceso de etapa, registrar un cobro y dar
// de alta a un cliente nuevo.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";
import AltaRapida from "../clientes/AltaRapida";

const COLOR_SERVICIO = {
  master: "bg-[#EEF2F8] text-[#1A3557]",
  visa:   "bg-[#FEF3E7] text-[#B9770E]",
  ee:     "bg-[#F5EEF8] text-[#7D3C98]",
  fp:     "bg-[#E8F5EE] text-[#1D6A4A]",
  legal:  "bg-[#FDEDEC] text-[#C0392B]",
};
const CORTO = { master: "Máster", visa: "Visado", ee: "Estancia", fp: "FP", legal: "Extranjería" };

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

/* Alta de cobro. La tabla de pagos está vacía porque nunca hubo por dónde
   meter nada; sin esto las finanzas parten de cero para siempre. */
function NuevoPago({ proceso, metodos, onHecho, onCerrar }) {
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("EUR");
  const [metodo, setMetodo] = useState("");
  const [cobrado, setCobrado] = useState(true);
  const [vence, setVence] = useState("");
  const [ref, setRef] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState("");

  const input = "text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  async function guardar() {
    setGuardando(true);
    setErr("");
    const r = await boPOST(`/backoffice/procesos/${proceso.id_solicitud}/pago`, {
      monto, moneda, id_metodo_pago: metodo || undefined,
      estado_pago: cobrado ? "aprobado" : "pendiente",
      fecha_vencimiento: vence || undefined,
      referencia: ref || undefined,
    });
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
        {!cobrado && (
          <input className={input} type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
        )}
        <input className={`${input} w-32`} placeholder="Referencia" value={ref} onChange={(e) => setRef(e.target.value)} />
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

  // Un solo panel: la tabla general y los seguimientos por servicio son
  // pestanas, no secciones distintas del menu. Es el mismo dato mirado de
  // otra forma, y tenerlos separados obligaba a saltar entre pantallas.
  const [pestana, setPestana] = useState("metricas");

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

  async function cambiarEtapa(p, nueva) {
    // Optimista: la fila se mueve al instante y se revierte si falla.
    setProcesos((prev) => prev.map((x) =>
      x.id_solicitud === p.id_solicitud
        ? { ...x, etapa: nueva, etapa_deducida: false }
        : x));
    const r = await boPATCH(`/backoffice/procesos/${p.id_solicitud}/etapa`, { etapa: nueva, servicio: p.servicio });
    if (!r.ok) { setError(r.msg || "No se pudo cambiar la etapa"); cargar(); }
  }

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return procesos.filter((p) => {
      if (!verCerrados && p.cerrado) return false;
      // La pestana ES el filtro de servicio.
      if (pestana !== "metricas" && p.servicio !== pestana) return false;
      if (etapa && p.etapa !== etapa) return false;
      if (responsable && String(p.id_responsable) !== responsable) return false;
      if (soloAtencion) {
        const urge = p.docs_observados > 0 || p.proximo?.vencido || p.proximo?.urgente
          || !p.responsable || p.pago?.vencido;
        if (!urge) return false;
      }
      if (texto && !`${p.cliente} ${p.email} ${p.subtipo}`.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [procesos, pestana, q, etapa, responsable, soloAtencion, verCerrados]);

  const resumen = useMemo(() => ({
    activos: procesos.filter((p) => !p.cerrado).length,
    vencidos: procesos.filter((p) => p.proximo?.vencido).length,
    semana: procesos.filter((p) => p.proximo?.urgente).length,
    observados: procesos.filter((p) => p.docs_observados > 0).length,
    sinResp: procesos.filter((p) => !p.responsable && !p.cerrado).length,
    debiendo: procesos.filter((p) => p.pago?.pendiente > 0).length,
  }), [procesos]);

  const svcActivo = pestana !== "metricas" ? pestana : null;
  const etapasDelFiltro = svcActivo ? (filtros.etapas?.[svcActivo] || []) : [];
  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      {/* Cabecera compacta: título y la acción que más se busca */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[19px] text-[#1A3557] leading-tight">Procesos</h1>
          <p className="text-[11.5px] text-neutral-500">Todo lo que está en marcha</p>
        </div>
        <button
          type="button" onClick={() => setAltaAbierta((v) => !v)}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#1D6A4A] text-white text-[12.5px] font-semibold rounded-lg hover:bg-[#15533a] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {altaAbierta ? "Cerrar" : "Nuevo cliente"}
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}>
        {[{ clave: "metricas", label: "Métricas" }, ...(filtros.servicios || [])].map((sv) => {
          const t = { id: sv.clave, txt: sv.label };
          const n = sv.clave === "metricas"
            ? null
            : procesos.filter((p) => p.servicio === sv.clave && !p.cerrado).length;
          return (
          <button
            key={t.id} type="button" onClick={() => setPestana(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
              pestana === t.id
                ? "border-[#1D6A4A] text-[#1D6A4A]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t.txt}
            {n !== null && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                pestana === t.id ? "bg-[#1D6A4A] text-white" : "bg-neutral-100 text-neutral-500"
              }`}>{n}</span>
            )}
          </button>
          );
        })}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { n: resumen.activos,    t: "Procesos activos",   c: "text-[#1A3557]", d: "En marcha ahora mismo" },
              { n: resumen.vencidos,   t: "Vencidos",           c: "text-red-600",   d: "Su fecha ya pasó" },
              { n: resumen.semana,     t: "Esta semana",        c: "text-amber-600", d: "Vencen en 7 días o menos" },
              { n: resumen.observados, t: "Con observaciones",  c: "text-red-600",   d: "Documentos que corregir" },
              { n: resumen.sinResp,    t: "Sin responsable",    c: "text-amber-600", d: "Nadie los está llevando" },
              { n: resumen.debiendo,   t: "Con deuda",          c: "text-red-600",   d: "Queda dinero por cobrar" },
            ].map((c) => (
              <div key={c.t} className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
                <p className={`text-[26px] font-bold leading-none ${c.c}`}>{c.n}</p>
                <p className="text-[12.5px] font-semibold text-neutral-700 mt-1.5">{c.t}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{c.d}</p>
              </div>
            ))}
          </div>

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
                    <div className="h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#1D6A4A] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {pestana !== "metricas" && (<>

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
          <input type="checkbox" checked={verCerrados} onChange={(e) => setVerCerrados(e.target.checked)} />
          Cerrados
        </label>
        <span className="text-[11px] text-neutral-400 ml-auto">{visibles.length}/{procesos.length}</span>
      </div>

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
                {["Cliente", "Servicio", "Etapa", "Responsable", "Próximo", "Pago", ""].map((h) => (
                  <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-2.5 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <>
                  <tr key={p.id_solicitud} className="border-b border-neutral-100 hover:bg-neutral-50/60">
                    <td className="px-2.5 py-2">
                      <p className="text-[12.5px] font-semibold text-neutral-800 leading-tight">{p.cliente}</p>
                      <p className="text-[10.5px] text-neutral-400 truncate max-w-[170px]">{p.subtipo || p.email}</p>
                      {(p.docs_observados > 0 || p.docs_pendientes > 0) && (
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
                      <td colSpan={7} className="p-0">
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
              <div key={p.id_solicitud} className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1" onClick={() => onAbrirProceso?.(p.id_solicitud)}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${COLOR_SERVICIO[p.servicio]}`}>
                        {CORTO[p.servicio]}
                      </span>
                      <p className="text-[13px] font-semibold text-neutral-800 truncate">{p.cliente}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {!p.responsable && <span className="text-[10.5px] font-semibold text-amber-600">sin asignar</span>}
                      {p.docs_observados > 0 && <span className="text-[10.5px] font-semibold text-red-600">{p.docs_observados} obs</span>}
                      {p.pago.pendiente > 0 && (
                        <span className={`text-[10.5px] font-semibold ${p.pago.vencido ? "text-red-600" : "text-neutral-500"}`}>
                          debe {p.pago.pendiente.toFixed(0)}
                        </span>
                      )}
                      <span className="ml-auto"><Proximo p={p.proximo} /></span>
                    </div>
                  </div>
                </div>
                <div className="mt-1.5"><Etapa p={p} onCambiar={cambiarEtapa} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      </>)}
    </div>
  );
}
