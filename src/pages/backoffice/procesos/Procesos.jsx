// Vista central de procesos.
//
// Solicitudes, Panel Asesoras y Tracker leen la misma tabla; lo que cambiaba
// era el recorte. Esta es la vista que responde a "¿qué está pasando hoy con
// todos mis clientes?": una fila por proceso, filtros encima, y las columnas
// que de verdad se miran — qué falta, qué vence y cuánto deben.
import { useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const COLOR_SERVICIO = {
  master: "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/20",
  visa:   "bg-[#FEF3E7] text-[#B9770E] border-[#B9770E]/25",
  ee:     "bg-[#F5EEF8] text-[#7D3C98] border-[#7D3C98]/25",
  fp:     "bg-[#E8F5EE] text-[#1D6A4A] border-[#1D6A4A]/25",
  legal:  "bg-[#FDEDEC] text-[#C0392B] border-[#C0392B]/25",
};

function Etiqueta({ children, clase }) {
  return (
    <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${clase}`}>
      {children}
    </span>
  );
}

/* La columna que más se mira: dice qué toca y cuándo, sin abrir nada. */
function ProximoEvento({ p }) {
  if (!p) return <span className="text-[11.5px] text-neutral-300">—</span>;
  const tono = p.vencido
    ? "text-red-700 bg-red-50 border-red-200"
    : p.urgente
      ? "text-amber-800 bg-amber-50 border-amber-200"
      : "text-neutral-600 bg-neutral-50 border-neutral-200";
  const cuando = p.vencido
    ? `hace ${Math.abs(p.dias)} d`
    : p.dias === 0 ? "hoy" : `en ${p.dias} d`;
  return (
    <div className={`inline-flex flex-col rounded-lg border px-2 py-1 ${tono}`}>
      <span className="text-[11px] font-semibold leading-tight">{p.etiqueta}</span>
      <span className="text-[10px] leading-tight opacity-80">{p.fecha} · {cuando}</span>
    </div>
  );
}

function Dinero({ pago }) {
  if (pago.sin_registro) {
    return <span className="text-[11px] text-neutral-300">sin registrar</span>;
  }
  return (
    <div className="text-[11.5px] leading-tight">
      <span className="font-semibold text-[#1D6A4A]">{pago.pagado.toFixed(0)}</span>
      {pago.pendiente > 0 && (
        <span className="text-red-600"> · debe {pago.pendiente.toFixed(0)}</span>
      )}
    </div>
  );
}

export default function Procesos({ onAbrirProceso }) {
  const [procesos, setProcesos] = useState([]);
  const [filtros, setFiltros] = useState({ servicios: [], estados: [], responsables: [], origenes: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [servicio, setServicio] = useState("");
  const [estado, setEstado] = useState("");
  const [responsable, setResponsable] = useState("");
  const [origen, setOrigen] = useState("");
  const [soloAtencion, setSoloAtencion] = useState(false);
  const [verCerrados, setVerCerrados] = useState(false);

  useEffect(() => {
    boGET("/backoffice/procesos")
      .then((r) => {
        if (r.ok) { setProcesos(r.procesos || []); setFiltros(r.filtros || filtros); }
        else setError(r.msg || "No se pudieron cargar los procesos");
      })
      .catch(() => setError("No se pudieron cargar los procesos"))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return procesos.filter((p) => {
      if (!verCerrados && p.cerrado) return false;
      if (servicio && p.servicio !== servicio) return false;
      if (estado && p.estado !== estado) return false;
      if (responsable && String(p.id_responsable) !== responsable) return false;
      if (origen && p.origen !== origen) return false;
      if (soloAtencion) {
        const urge = p.docs_observados > 0 || p.proximo?.vencido || p.proximo?.urgente || !p.responsable;
        if (!urge) return false;
      }
      if (texto && !`${p.cliente} ${p.email} ${p.subtipo}`.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [procesos, q, servicio, estado, responsable, origen, soloAtencion, verCerrados]);

  // Lo que se mira antes que la tabla.
  const resumen = useMemo(() => ({
    activos: procesos.filter((p) => !p.cerrado).length,
    observados: procesos.filter((p) => p.docs_observados > 0).length,
    vencidos: procesos.filter((p) => p.proximo?.vencido).length,
    estaSemana: procesos.filter((p) => p.proximo?.urgente).length,
    sinResponsable: procesos.filter((p) => !p.responsable && !p.cerrado).length,
  }), [procesos]);

  const selectCls =
    "text-[12px] font-medium text-neutral-700 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white " +
    "focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-[20px] text-[#1A3557]">Procesos</h1>
        <p className="text-[12.5px] text-neutral-500 mt-0.5">
          Todo lo que está en marcha, de todos los clientes y servicios.
        </p>
      </div>

      {/* Resumen: los números que hacen actuar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { n: resumen.activos, t: "Activos", cls: "text-[#1A3557]" },
          { n: resumen.vencidos, t: "Vencidos", cls: "text-red-600", filtro: () => setSoloAtencion(true) },
          { n: resumen.estaSemana, t: "Esta semana", cls: "text-amber-600", filtro: () => setSoloAtencion(true) },
          { n: resumen.observados, t: "Con observaciones", cls: "text-red-600", filtro: () => setSoloAtencion(true) },
          { n: resumen.sinResponsable, t: "Sin responsable", cls: "text-neutral-500", filtro: () => setSoloAtencion(true) },
        ].map((c) => (
          <button
            key={c.t} type="button" onClick={c.filtro}
            className={`text-left bg-white border border-neutral-200 rounded-xl px-3 py-2.5 ${c.filtro ? "hover:border-neutral-300" : "cursor-default"}`}
          >
            <p className={`text-[20px] font-bold leading-none ${c.cls}`}>{c.n}</p>
            <p className="text-[11px] text-neutral-500 mt-1">{c.t}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-wrap items-center gap-2">
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente, correo o paquete…"
          className={`${selectCls} flex-1 min-w-[180px]`}
        />
        <select className={selectCls} value={servicio} onChange={(e) => setServicio(e.target.value)}>
          <option value="">Todos los servicios</option>
          {filtros.servicios.map((s) => <option key={s.clave} value={s.clave}>{s.label}</option>)}
        </select>
        <select className={selectCls} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {filtros.estados.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className={selectCls} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
          <option value="">Cualquier responsable</option>
          {filtros.responsables.map((r) => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
        </select>
        <select className={selectCls} value={origen} onChange={(e) => setOrigen(e.target.value)}>
          <option value="">Cualquier origen</option>
          {filtros.origenes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-600">
          <input type="checkbox" checked={soloAtencion} onChange={(e) => setSoloAtencion(e.target.checked)} />
          Solo lo que necesita atención
        </label>
        <label className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-600">
          <input type="checkbox" checked={verCerrados} onChange={(e) => setVerCerrados(e.target.checked)} />
          Ver cerrados
        </label>

        <span className="ml-auto text-[11.5px] text-neutral-400">
          {visibles.length} de {procesos.length}
        </span>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Cargando procesos…</p>
      ) : error ? (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      ) : visibles.length === 0 ? (
        <p className="text-[13px] text-neutral-400 py-10 text-center">
          Ningún proceso coincide con estos filtros.
        </p>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden lg:block bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    {["Cliente", "Servicio", "Paquete", "Estado", "Responsable", "Próximo evento", "Pago", ""]
                      .map((h) => (
                        <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-3 py-2.5">
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id_solicitud} className="border-b border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-3 py-2.5">
                        <p className="text-[13px] font-semibold text-neutral-800">{p.cliente}</p>
                        <p className="text-[11px] text-neutral-400">{p.email}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <Etiqueta clase={COLOR_SERVICIO[p.servicio]}>{p.servicio_label}</Etiqueta>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-neutral-600 max-w-[180px] truncate">{p.subtipo}</td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] font-medium text-neutral-700">{p.estado}</p>
                        <div className="h-1 w-16 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-[#1D6A4A] rounded-full" style={{ width: `${p.progreso}%` }} />
                        </div>
                        {(p.docs_observados > 0 || p.docs_pendientes > 0) && (
                          <p className="text-[10.5px] mt-1">
                            {p.docs_observados > 0 && <span className="text-red-600 font-semibold">{p.docs_observados} obs. </span>}
                            {p.docs_pendientes > 0 && <span className="text-neutral-400">{p.docs_pendientes} pend.</span>}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-neutral-600">
                        {p.responsable || <span className="text-amber-600 font-semibold">sin asignar</span>}
                      </td>
                      <td className="px-3 py-2.5"><ProximoEvento p={p.proximo} /></td>
                      <td className="px-3 py-2.5"><Dinero pago={p.pago} /></td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button" onClick={() => onAbrirProceso?.(p.id_solicitud)}
                          className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline whitespace-nowrap"
                        >
                          Abrir →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Móvil: tarjetas */}
          <div className="lg:hidden space-y-2">
            {visibles.map((p) => (
              <button
                key={p.id_solicitud} type="button" onClick={() => onAbrirProceso?.(p.id_solicitud)}
                className="w-full text-left bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-neutral-800 truncate">{p.cliente}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{p.subtipo || p.email}</p>
                  </div>
                  <Etiqueta clase={COLOR_SERVICIO[p.servicio]}>{p.servicio_label}</Etiqueta>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11.5px] text-neutral-600">{p.estado}</span>
                  {p.docs_observados > 0 && (
                    <span className="text-[11px] font-semibold text-red-600">{p.docs_observados} obs.</span>
                  )}
                  {!p.responsable && (
                    <span className="text-[11px] font-semibold text-amber-600">sin asignar</span>
                  )}
                  <span className="ml-auto"><ProximoEvento p={p.proximo} /></span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
