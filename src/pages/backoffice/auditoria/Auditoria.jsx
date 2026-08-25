// Registro de cambios.
//
// Hasta ahora nada dejaba rastro: fusionar dos clientes, borrar un cobro o
// desactivar setenta procesos no se distinguía de que nunca hubieran pasado.
// Esto responde a "¿quién movió esto?" meses después.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const TONOS = {
  red:     "bg-red-50 text-red-700 border-red-200",
  amber:   "bg-amber-50 text-amber-700 border-amber-200",
  green:   "bg-[#E8F5EE] text-[#1D6A4A] border-[#1D6A4A]/20",
  blue:    "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/20",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

/* Se agrupa por día: el historial se lee por jornadas ("¿qué pasó el
   martes?"), no como una lista continua de marcas de tiempo. */
function diaDe(iso) {
  return new Date(iso).toLocaleDateString("es-PE", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function hora(iso) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function iniciales(nombre) {
  return String(nombre || "?").trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function Detalle({ detalle }) {
  const [abierto, setAbierto] = useState(false);
  if (!detalle || typeof detalle !== "object") return null;

  return (
    <>
      <button type="button" onClick={() => setAbierto((v) => !v)}
        className="text-[10.5px] font-semibold text-neutral-400 hover:text-neutral-700">
        {abierto ? "ocultar detalle" : "ver detalle"}
      </button>
      {abierto && (
        <pre className="mt-1 text-[10.5px] leading-relaxed bg-neutral-50 border border-neutral-200 rounded-lg p-2 overflow-x-auto text-neutral-600">
          {JSON.stringify(detalle, null, 2)}
        </pre>
      )}
    </>
  );
}

export default function Auditoria() {
  const [datos, setDatos] = useState({ registros: [], acciones: [], usuarios: [] });
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState("");
  const [usuario, setUsuario] = useState("");
  const [dias, setDias] = useState(30);

  const cargar = useCallback((f) => {
    const q = new URLSearchParams({ dias: String(f.dias) });
    if (f.accion) q.set("accion", f.accion);
    if (f.usuario) q.set("usuario", f.usuario);
    return boGET(`/backoffice/auditoria?${q}`).then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    });
  }, []);

  useEffect(() => { cargar({ accion, usuario, dias }); }, [cargar, accion, usuario, dias]);

  const porDia = useMemo(() => {
    const g = new Map();
    datos.registros.forEach((r) => {
      const d = diaDe(r.fecha);
      if (!g.has(d)) g.set(d, []);
      g.get(d).push(r);
    });
    return [...g.entries()];
  }, [datos.registros]);

  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Registro de cambios</h1>
        <p className="text-sm text-neutral-500">
          Quién cambió qué y cuándo. Se anotan las fusiones de clientes, los cobros,
          las etapas y los plazos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={sel} value={accion} onChange={(e) => setAccion(e.target.value)}>
          <option value="">Todo tipo de cambio</option>
          {datos.acciones?.map((a) => (
            <option key={a.accion} value={a.accion}>{a.label} · {a.n}</option>
          ))}
        </select>
        <select className={sel} value={usuario} onChange={(e) => setUsuario(e.target.value)}>
          <option value="">Todo el equipo</option>
          {datos.usuarios?.map((u) => (
            <option key={u.id_usuario ?? u.nombre} value={u.id_usuario ?? ""}>
              {u.nombre} · {u.n}
            </option>
          ))}
        </select>
        <select className={sel} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
          <option value={7}>Última semana</option>
          <option value={30}>Último mes</option>
          <option value={90}>Últimos 3 meses</option>
          <option value={365}>Último año</option>
        </select>
        <span className="text-[11.5px] text-neutral-400 ml-auto self-center">
          {datos.total ?? 0} cambio{datos.total === 1 ? "" : "s"}
        </span>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-10 text-center">Leyendo el registro…</p>
      ) : porDia.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">
            No hay cambios anotados en este periodo
          </p>
          <p className="text-[12px] text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
            El registro empezó a funcionar hoy, así que aquí solo aparece lo que
            pase de ahora en adelante. Lo anterior no quedó grabado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {porDia.map(([dia, lista]) => (
            <div key={dia}>
              <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
                {dia} · {lista.length}
              </p>
              <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                {lista.map((r) => (
                  <div key={r.id_registro} className="px-3 py-2.5 flex items-start gap-2.5">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-[#023A4B] text-white grid place-items-center text-[10px] font-bold">
                      {iniciales(r.usuario)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${TONOS[r.tono]}`}>
                          {r.accion_label}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-700">{r.usuario}</span>
                        {r.rol && <span className="text-[10.5px] text-neutral-400">{r.rol}</span>}
                      </div>
                      <p className="text-[12.5px] text-neutral-800 mt-0.5 leading-snug">{r.resumen}</p>
                      <Detalle detalle={r.detalle} />
                    </div>
                    <span className="shrink-0 text-[10.5px] text-neutral-400 font-mono">{hora(r.fecha)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
