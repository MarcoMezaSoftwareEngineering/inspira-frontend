import { addDays, startOfDay } from "../utilidades";

/* Toolbar: navegación + filtro + vista + acciones */
export default function BarraCalendario({
  setWeekStart, stepDias, rangoTexto,
  esAdmin, filtro, setFiltro, asesores,
  viewMode, setViewMode,
  showBulk, setShowBulk, combinado, crearBulk,
  bulkFecha, setBulkFecha, bulkDesde, setBulkDesde, bulkHasta, setBulkHasta, creando,
}) {
  return (
    <div className="flex-none grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-2.5 items-stretch">
      <div className="flex items-center gap-1.5 flex-wrap bg-white border border-neutral-200 rounded-2xl shadow-sm px-2 py-1.5 min-h-[46px]">
        <button onClick={() => setWeekStart((d) => addDays(d, -stepDias))}
          className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] border border-neutral-200 text-neutral-500 font-extrabold hover:border-primary hover:text-primary transition-colors bg-white flex-shrink-0">
          ‹
        </button>
        <div className="text-[11.5px] font-extrabold text-neutral-800 capitalize min-w-[150px] text-center">
          {rangoTexto()}
        </div>
        <button onClick={() => setWeekStart((d) => addDays(d, stepDias))}
          className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] border border-neutral-200 text-neutral-500 font-extrabold hover:border-primary hover:text-primary transition-colors bg-white flex-shrink-0">
          ›
        </button>
        <button onClick={() => setWeekStart(startOfDay(new Date()))}
          className="h-[34px] px-3 rounded-[10px] text-[11px] font-extrabold border border-neutral-200 text-neutral-600 hover:bg-secondary-light hover:text-primary hover:border-primary/30 bg-white flex-shrink-0">
          Hoy
        </button>
        {esAdmin && (
          <div className="relative min-w-[170px] max-w-[240px] flex-1">
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
              className="w-full h-[34px] border border-neutral-200 rounded-[10px] px-3 text-[11px] font-bold text-neutral-700 focus:outline-none focus:border-primary bg-white appearance-none">
              <option value="todos">Todo el equipo</option>
              <option value="yo">Yo</option>
              {asesores.map((a) => (
                <option key={a.id_usuario} value={a.id_usuario}>{a.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center bg-white border border-neutral-200 rounded-2xl shadow-sm px-1.5 min-h-[46px]">
        <div className="flex gap-0.5 bg-neutral-100 p-[3px] rounded-[10px]">
          <button onClick={() => setViewMode("semana")}
            className={`px-2.5 py-[7px] rounded-[8px] text-[10.5px] font-extrabold transition-colors ${viewMode === "semana" ? "bg-white text-primary-dark shadow-sm" : "text-neutral-500"}`}>
            Semana
          </button>
          <button onClick={() => setViewMode("dia")}
            className={`px-2.5 py-[7px] rounded-[8px] text-[10.5px] font-extrabold transition-colors ${viewMode === "dia" ? "bg-white text-primary-dark shadow-sm" : "text-neutral-500"}`}>
            Día
          </button>
        </div>
      </div>

      <div className="relative">
        <button onClick={() => setShowBulk((v) => !v)} disabled={combinado}
          title={combinado ? "Elige un asesor específico para crear horarios" : undefined}
          className="w-full lg:w-auto h-full min-h-[46px] flex items-center justify-center gap-1.5 px-[17px] rounded-2xl text-white text-[11px] font-extrabold shadow-[0_10px_24px_rgba(229,147,87,.22)] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
          style={{ background: "radial-gradient(circle at 85% 15%,rgba(255,255,255,.28),transparent 30%), linear-gradient(135deg,#efaa73,#f5c49e)" }}>
          + Generar horarios
        </button>

        {/* Panel "generar varios de una vez" — popover anclado al botón */}
        {showBulk && !combinado && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowBulk(false)} />
            <form onSubmit={crearBulk}
              className="absolute right-0 top-[calc(100%+8px)] z-30 w-[290px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3">
              <label className="text-xs text-neutral-500">
                Fecha
                <input type="date" value={bulkFecha} onChange={(e) => setBulkFecha(e.target.value)} required
                  className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </label>
              <div className="flex gap-2">
                <label className="text-xs text-neutral-500 flex-1">
                  Desde
                  <input type="time" step="1800" value={bulkDesde} onChange={(e) => setBulkDesde(e.target.value)} required
                    className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </label>
                <label className="text-xs text-neutral-500 flex-1">
                  Hasta
                  <input type="time" step="1800" value={bulkHasta} onChange={(e) => setBulkHasta(e.target.value)} required
                    className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </label>
              </div>
              <button type="submit" disabled={creando}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-light disabled:opacity-50 transition-colors">
                {creando ? "Creando…" : "Generar bloques de 30 min"}
              </button>
              <p className="text-[10.5px] text-neutral-400">
                También puedes hacer clic directo en una celda vacía del calendario para crear un solo horario de 30 min.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
