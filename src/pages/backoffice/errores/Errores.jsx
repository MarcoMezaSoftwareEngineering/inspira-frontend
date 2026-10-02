// Errores de la web, de la API y del login (solo admin).
//
// Hasta el 02/10/2026 solo se veían entrando al servidor a leer `pm2 logs`: el
// login que devolvía a la portada a asesorados con la ficha desactivada pasó
// dos semanas sin que nadie del equipo pudiera enterarse. Aquí se agrupan por
// huella —el mismo fallo suma «veces»— y se marcan resueltos cuando se arreglan.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

const ORIGENES = {
  login:    { label: "Login",    tono: "bg-amber-50 text-amber-700 border-amber-200" },
  web:      { label: "Web",      tono: "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/20" },
  api:      { label: "API",      tono: "bg-red-50 text-red-700 border-red-200" },
  servidor: { label: "Servidor", tono: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

function cuando(iso) {
  const d = new Date(iso);
  const min = Math.round((Date.now() - d.getTime()) / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  if (min < 24 * 60) return `hace ${Math.round(min / 60)} h`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Fila({ e, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const o = ORIGENES[e.origen] || ORIGENES.servidor;

  async function alternar() {
    setGuardando(true);
    const r = await boPATCH(`/backoffice/errores/${e.id_error}`, { resuelto: !e.resuelto });
    setGuardando(false);
    if (r.ok) onCambiar(r.error);
  }

  return (
    <div className={`px-3 py-2.5 ${e.resuelto ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${o.tono}`}>
              {o.label}
            </span>
            <span className="text-[11px] font-mono text-neutral-600 break-all">{e.donde}</span>
            {e.veces > 1 && (
              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                ×{e.veces}
              </span>
            )}
            <span className="text-[10px] text-neutral-400 font-mono">#{e.id_error}</span>
          </div>
          <p className="text-[12.5px] text-neutral-800 mt-0.5 leading-snug break-words">{e.mensaje}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <button type="button" onClick={() => setAbierto((v) => !v)}
              className="text-[10.5px] font-semibold text-neutral-400 hover:text-neutral-700">
              {abierto ? "ocultar detalle" : "ver detalle"}
            </button>
            {e.resuelto && e.resuelto_por && (
              <span className="text-[10.5px] text-[#1D6A4A]">Resuelto por {e.resuelto_por} · {cuando(e.resuelto_en)}</span>
            )}
          </div>
          {abierto && (
            <div className="mt-1.5 space-y-1 text-[10.5px] text-neutral-600">
              <p>Primera vez: {new Date(e.primera_vez).toLocaleString("es-PE")} · Última: {new Date(e.ultima_vez).toLocaleString("es-PE")}</p>
              {e.url && <p className="break-all">URL: {e.url}</p>}
              {e.agente && <p className="break-all">Navegador: {e.agente}</p>}
              {e.version && <p className="break-all">Versión: {e.version}</p>}
              {e.detalle && <p className="break-all">Detalle: {JSON.stringify(e.detalle)}</p>}
              {e.pila && (
                <pre className="leading-relaxed bg-neutral-50 border border-neutral-200 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all">
                  {e.pila}
                </pre>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <span className="text-[10.5px] text-neutral-400 font-mono">{cuando(e.ultima_vez)}</span>
          <button type="button" disabled={guardando} onClick={alternar}
            className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition disabled:opacity-50 ${
              e.resuelto
                ? "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                : "border-[#1D6A4A]/30 text-[#1D6A4A] hover:bg-[#E8F5EE]"
            }`}>
            {e.resuelto ? "Reabrir" : "Resuelto"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Errores() {
  const [datos, setDatos] = useState({ errores: [], origenes: [], abiertos: 0 });
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState("");
  const [estado, setEstado] = useState("abiertos");
  const [origen, setOrigen] = useState("");
  const [dias, setDias] = useState(30);

  const cargar = useCallback((f) => {
    const q = new URLSearchParams({ estado: f.estado, dias: String(f.dias) });
    if (f.origen) q.set("origen", f.origen);
    return boGET(`/backoffice/errores?${q}`).then((r) => {
      if (r.ok) { setDatos(r); setFallo(""); } else setFallo(r.msg || r.message || "No se pudo leer el registro");
      setCargando(false);
    });
  }, []);

  useEffect(() => { cargar({ estado, origen, dias }); }, [cargar, estado, origen, dias]);

  // Al resolver en la vista de abiertos, la fila se va; en «todos», se queda.
  function cambiar(actualizado) {
    setDatos((d) => ({
      ...d,
      abiertos: d.abiertos + (actualizado.resuelto ? -1 : 1),
      errores: d.errores
        .map((x) => (x.id_error === actualizado.id_error ? actualizado : x))
        .filter((x) => estado === "todos" || (estado === "abiertos" ? !x.resuelto : x.resuelto)),
    }));
  }

  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          Errores {datos.abiertos > 0 && <span className="text-red-700 text-lg">· {datos.abiertos} abiertos</span>}
        </h1>
        <p className="text-sm text-neutral-500">
          Lo que falla en la web, en la API y en el inicio de sesión. El mismo fallo
          repetido se suma en una sola fila; márquelo como resuelto cuando esté arreglado
          y, si vuelve, aparecerá de nuevo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={sel} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="abiertos">Abiertos</option>
          <option value="resueltos">Resueltos</option>
          <option value="todos">Todos</option>
        </select>
        <select className={sel} value={origen} onChange={(e) => setOrigen(e.target.value)}>
          <option value="">Todo origen</option>
          {datos.origenes?.map((o) => (
            <option key={o.origen} value={o.origen}>{ORIGENES[o.origen]?.label || o.origen} · {o.n}</option>
          ))}
        </select>
        <select className={sel} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
          <option value={1}>Últimas 24 h</option>
          <option value={7}>Última semana</option>
          <option value={30}>Último mes</option>
          <option value={90}>Últimos 3 meses</option>
        </select>
        <span className="text-[11.5px] text-neutral-400 ml-auto self-center">
          {datos.errores.length} fila{datos.errores.length === 1 ? "" : "s"}
        </span>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-10 text-center">Leyendo el registro…</p>
      ) : fallo ? (
        <p className="text-[13px] text-red-700 py-10 text-center">{fallo}</p>
      ) : datos.errores.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">
            {estado === "abiertos" ? "No hay errores abiertos en este periodo" : "No hay errores en este periodo"}
          </p>
          <p className="text-[12px] text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
            El registro empezó el 02/10/2026: lo anterior solo está en los registros del servidor.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
          {datos.errores.map((e) => <Fila key={e.id_error} e={e} onCambiar={cambiar} />)}
        </div>
      )}
    </div>
  );
}
