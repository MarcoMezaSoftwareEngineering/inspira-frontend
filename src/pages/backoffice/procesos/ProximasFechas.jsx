// Próximas fechas: todo lo que vence, de todos los clientes y servicios.
//
// Las fechas estaban repartidas en cinco sitios y varias escritas a mano en
// texto libre, así que se vigilaban desde el Excel. Aquí se ven juntas y
// ordenadas por cuánto falta.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const TONOS = {
  red:    "bg-red-50 text-red-800 border-red-200",
  blue:   "bg-[#1A3557] text-white border-[#1A3557]",
  amber:  "bg-amber-50 text-amber-800 border-amber-300",
  violet: "bg-violet-100 text-violet-800 border-violet-300",
  sky:    "bg-sky-50 text-sky-800 border-sky-200",
  green:  "bg-[#1D6A4A] text-white border-[#1D6A4A]",
};

function cuando(f) {
  if (f.dias === 0) return "hoy";
  if (f.dias === 1) return "mañana";
  if (f.dias === -1) return "ayer";
  return f.vencido ? `hace ${Math.abs(f.dias)} días` : `en ${f.dias} días`;
}

/* Agrupa por cercanía: es como se mira una lista de plazos, no por fecha
   exacta sino por "esto es de ahora" o "esto ya se pasó". */
function grupoDe(f) {
  if (f.vencido) return "Vencidas";
  if (f.dias === 0) return "Hoy";
  if (f.dias <= 7) return "Esta semana";
  if (f.dias <= 30) return "Este mes";
  return "Más adelante";
}
const ORDEN_GRUPOS = ["Vencidas", "Hoy", "Esta semana", "Este mes", "Más adelante"];

export default function ProximasFechas({ onAbrirProceso }) {
  const [datos, setDatos] = useState({ fechas: [], resumen: {}, tipos: [] });
  const [cargando, setCargando] = useState(true);
  const [tipo, setTipo] = useState("");
  const [verVencidas, setVerVencidas] = useState(true);
  const [horizonte, setHorizonte] = useState(90);

  const cargar = useCallback((dias) => {
    return boGET(`/backoffice/vencimientos?dias=${dias}&atras=60`).then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    });
  }, []);

  useEffect(() => { cargar(horizonte); }, [cargar, horizonte]);

  const visibles = useMemo(() => datos.fechas.filter((f) => {
    if (tipo && f.tipo !== tipo) return false;
    if (!verVencidas && f.vencido) return false;
    return true;
  }), [datos.fechas, tipo, verVencidas]);

  const grupos = useMemo(() => {
    const g = {};
    visibles.forEach((f) => {
      const k = grupoDe(f);
      (g[k] = g[k] || []).push(f);
    });
    return ORDEN_GRUPOS.filter((k) => g[k]?.length).map((k) => [k, g[k]]);
  }, [visibles]);

  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <select className={sel} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todo tipo de fecha</option>
          {datos.tipos?.map((t) => <option key={t.clave} value={t.clave}>{t.label}</option>)}
        </select>
        <select className={sel} value={horizonte} onChange={(e) => setHorizonte(Number(e.target.value))}>
          <option value={30}>Próximo mes</option>
          <option value={90}>Próximos 3 meses</option>
          <option value={180}>Próximos 6 meses</option>
          <option value={365}>Próximo año</option>
        </select>
        <label className="flex items-center gap-1 text-[11.5px] text-neutral-600">
          <input type="checkbox" checked={verVencidas} onChange={(e) => setVerVencidas(e.target.checked)} />
          Ver vencidas
        </label>
        <span className="text-[11px] text-neutral-400 ml-auto">{visibles.length} fechas</span>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Leyendo fechas…</p>
      ) : visibles.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">No hay nada en este plazo</p>
          <p className="text-[12px] text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
            Las fechas salen de las citas, los plazos de subsanación, los cierres de
            postulación de cada universidad, las sesiones y los vencimientos de cuota.
            Si esperabas ver algo, comprueba que esté cargado en su proceso.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(([nombre, lista]) => (
            <div key={nombre}>
              <p className={`text-[9px] font-bold uppercase tracking-widest font-mono mb-2 ${
                nombre === "Vencidas" ? "text-red-600" : nombre === "Hoy" ? "text-amber-600" : "text-neutral-400"
              }`}>
                {nombre} · {lista.length}
              </p>
              <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                {lista.map((f, i) => (
                  <button
                    key={`${f.id_solicitud}-${f.tipo}-${i}`}
                    type="button"
                    onClick={() => onAbrirProceso?.(f.id_solicitud)}
                    className="w-full text-left px-3 py-2.5 hover:bg-neutral-50/60 flex items-center gap-2.5"
                  >
                    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${TONOS[f.tono]}`}>
                      {f.tipo_label}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-neutral-800 truncate">
                        {f.cliente}
                      </span>
                      <span className="block text-[11px] text-neutral-400 truncate">
                        {f.detalle || f.responsable || "sin responsable"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`block text-[12px] font-bold ${
                        f.vencido ? "text-red-600" : f.urgente ? "text-amber-700" : "text-neutral-600"
                      }`}>
                        {cuando(f)}
                      </span>
                      <span className="block text-[10.5px] text-neutral-400">{f.fecha}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
