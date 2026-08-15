// src/pages/backoffice/precios/ServiciosList.jsx
import { useMemo, useState } from "react";

const CURRENCY_SYMBOL = { EUR: "€", USD: "$", PEN: "S/" };

export default function ServiciosList({ servicios, loading, onEditar, onChecklist }) {
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const ordenados = [...servicios].sort((a, b) => Number(b.activo) - Number(a.activo));
    const q = query.trim().toLowerCase();
    if (!q) return ordenados;
    return ordenados.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        (s.codigo || "").toLowerCase().includes(q) ||
        (s.descripcion || "").toLowerCase().includes(q)
    );
  }, [servicios, query]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-800">Servicios configurados</h2>
          <span className="text-[11px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full leading-none">
            {servicios.length}
          </span>
        </div>
        {loading && (
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando…
          </span>
        )}
      </div>

      {/* Buscador */}
      <div className="px-5 pt-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, código o descripción…"
            className="w-full border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="p-5 space-y-2.5">
        {loading && servicios.length === 0 &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[78px] rounded-xl bg-neutral-100 animate-pulse" />
          ))}

        {!loading && filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4m5.5 2a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-600">
              {servicios.length === 0 ? "Aún no hay servicios configurados" : "Sin resultados"}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {servicios.length === 0
                ? "Crea el primero desde el panel de la derecha."
                : "Prueba con otro término de búsqueda."}
            </p>
          </div>
        )}

        {filtrados.map((s) => {
          const symbol = s.precio_actual ? (CURRENCY_SYMBOL[s.precio_actual.moneda] || s.precio_actual.moneda) : null;
          return (
            <div
              key={s.id_servicio}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border p-4 transition-all ${
                s.activo
                  ? "border-neutral-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  : "border-neutral-100 bg-neutral-50/60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold ${s.activo ? "text-neutral-900" : "text-neutral-500"}`}>
                    {s.nombre}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500 tracking-wide">
                    {s.codigo}
                  </span>
                  {!s.activo && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Inactivo
                    </span>
                  )}
                </div>

                {s.descripcion && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{s.descripcion}</p>
                )}

                <div className="mt-2 flex items-baseline gap-2">
                  {s.precio_actual ? (
                    <>
                      <span className="font-['Fraunces',serif] text-lg font-semibold text-primary">
                        {symbol} {s.precio_actual.monto.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        desde{" "}
                        {new Date(s.precio_actual.vigente_desde).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">Sin precio configurado</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                {onChecklist && (
                  <button
                    onClick={() => onChecklist(s)}
                    title="Ver checklist"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Checklist</span>
                  </button>
                )}
                {onEditar && (
                  <button
                    onClick={() => onEditar(s)}
                    title="Editar servicio"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:border-primary/30 hover:bg-secondary hover:text-primary transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
