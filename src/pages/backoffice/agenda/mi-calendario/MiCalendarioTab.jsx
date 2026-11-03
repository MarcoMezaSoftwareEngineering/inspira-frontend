/* ── Mi calendario (sistema propio: AgendaSlot / ReservaCita) ──── */
/* Vista de calendario semanal estilo Calendly: columnas = días, filas = medias horas. */
import useMiCalendario from "./useMiCalendario";
import BarraCalendario from "./BarraCalendario";
import CuadriculaCalendario from "./CuadriculaCalendario";
import PanelLateral from "./PanelLateral";
import GestionHorarios from "./GestionHorarios";
import HorariosMovil from "./HorariosMovil";
import { useSyncExternalStore } from "react";

// En el teléfono la cuadrícula semanal no cabe: se cambia por la vista por día.
const MQ = "(max-width: 639px)";
const suscribir = (cb) => { const m = window.matchMedia?.(MQ); m?.addEventListener?.("change", cb); return () => m?.removeEventListener?.("change", cb); };
const esMovilAhora = () => !!window.matchMedia?.(MQ)?.matches;

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

  const esMovil = useSyncExternalStore(suscribir, esMovilAhora, () => false);

  if (esMovil) {
    return (
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 p-3">
          <p className="text-[12.5px] leading-snug text-[#4f6672]">Los horarios en que la gente puede reservar. Las citas se administran en <strong className="text-primary-dark">Reservas</strong>.</p>
          {error && <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700">Error: {error}</div>}
          <HorariosMovil
            displayedDays={displayedDays} slotMap={slotMap} reservaPorClave={reservaPorClave} claveDeSlot={claveDeSlot}
            setWeekStart={setWeekStart} rangoTexto={rangoTexto} esAdmin={esAdmin} filtro={filtro} setFiltro={setFiltro}
            asesores={asesores} combinado={combinado} onClickSlot={onClickSlot} bloquearSlot={bloquearSlot}
            cargar={cargar} esPasado={esPasado} todayKey={todayKey} loading={loading}
          />
          <GestionHorarios onChanged={cargar} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 p-3 sm:p-4 gap-3">
      {/* Para qué sirve esta pestaña */}
      <p className="flex-none rounded-xl bg-sky-50 px-3.5 py-2.5 text-[12px] leading-snug text-sky-900">
        Aquí abres y cierras los <strong>horarios en los que la gente puede reservar</strong> (verde = libre, amarillo = separado, azul = con cita).
        Las citas ya reservadas se administran en la pestaña <strong>Reservas</strong>.
      </p>
      {/* Cerrar o abrir la agenda y el horario fijo semanal */}
      <GestionHorarios onChanged={cargar} />
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
