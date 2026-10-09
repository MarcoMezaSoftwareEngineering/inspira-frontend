/* ── Mi calendario (sistema propio: AgendaSlot / ReservaCita) ──── */
/* Vista de calendario semanal estilo Calendly: columnas = días, filas = medias horas. */
import useMiCalendario from "./useMiCalendario";
import BarraCalendario from "./BarraCalendario";
import CuadriculaCalendario from "./CuadriculaCalendario";
import PanelLateral from "./PanelLateral";

export default function MiCalendarioTab() {
  const {
    esAdmin, setWeekStart, asesores, filtro, setFiltro, viewMode, setViewMode,
    slotMap, loading, error, busyCell,
    showBulk, setShowBulk, bulkFecha, setBulkFecha, bulkDesde, setBulkDesde, bulkHasta, setBulkHasta, creando,
    combinado, cargar, todayKey, esPasado, crearSlotRapido, onClickSlot, bloquearSlot, crearBulk,
    reservasActivas, reservasOrdenadas, horasLibres, ocupacionPct, pagosPendientes,
    reservaPorClave, claveDeSlot, displayedDays, stepDias, nowLineTop, mostrarNowLine,
    rangoTexto, tituloCalendario,
  } = useMiCalendario();

  return (
    <div className="h-full flex flex-col min-h-0 p-3 sm:p-4 gap-3">
      {/* Toolbar: navegación + filtro + vista + acciones */}
      <BarraCalendario
        setWeekStart={setWeekStart} stepDias={stepDias} rangoTexto={rangoTexto}
        esAdmin={esAdmin} filtro={filtro} setFiltro={setFiltro} asesores={asesores}
        viewMode={viewMode} setViewMode={setViewMode}
        showBulk={showBulk} setShowBulk={setShowBulk} combinado={combinado} crearBulk={crearBulk}
        bulkFecha={bulkFecha} setBulkFecha={setBulkFecha} bulkDesde={bulkDesde} setBulkDesde={setBulkDesde}
        bulkHasta={bulkHasta} setBulkHasta={setBulkHasta} creando={creando}
      />

      {error && <div className="flex-none bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">Error: {error}</div>}

      {/* ===== Calendario + panel lateral ===== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_336px] gap-3">
        {/* Calendario */}
        <CuadriculaCalendario
          tituloCalendario={tituloCalendario} viewMode={viewMode} combinado={combinado}
          displayedDays={displayedDays} todayKey={todayKey} loading={loading}
          mostrarNowLine={mostrarNowLine} nowLineTop={nowLineTop}
          slotMap={slotMap} esPasado={esPasado} busyCell={busyCell} crearSlotRapido={crearSlotRapido}
          reservaPorClave={reservaPorClave} claveDeSlot={claveDeSlot}
          onClickSlot={onClickSlot} bloquearSlot={bloquearSlot}
        />

        {/* Panel lateral */}
        <PanelLateral
          reservasActivas={reservasActivas} combinado={combinado} horasLibres={horasLibres}
          pagosPendientes={pagosPendientes} ocupacionPct={ocupacionPct}
          reservasOrdenadas={reservasOrdenadas} cargar={cargar} esPasado={esPasado}
        />
      </div>
    </div>
  );
}
