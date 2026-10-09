import StatTile from "./StatTile";
import ApptRow from "./ApptRow";

/* Panel lateral: métricas, capacidad semanal y próximas citas. */
export default function PanelLateral({
  reservasActivas, combinado, horasLibres, pagosPendientes, ocupacionPct,
  reservasOrdenadas, cargar, esPasado,
}) {
  return (
    <aside className="min-w-0 min-h-0 grid grid-rows-[auto_auto_minmax(0,1fr)] gap-2.5 overflow-hidden">
      <div className="grid grid-cols-2 gap-2">
        <StatTile k="Citas esta semana" value={reservasActivas.length} note={combinado ? "en todo el equipo" : "tuyas"} />
        <StatTile k="Disponibilidad libre" value={`${horasLibres} h`} note={combinado ? "en todo el equipo" : "tuya"} />
        <StatTile k="Pagos pendientes" value={pagosPendientes} note="requieren revisión" />
        <StatTile k="Ocupación semanal" value={`${ocupacionPct}%`} note="objetivo 70%" />
      </div>

      <div className="relative overflow-hidden rounded-2xl p-4 text-white"
        style={{ background: "radial-gradient(circle at 95% 0%,rgba(122,232,174,.32),transparent 35%), linear-gradient(145deg,#125a40,#0b432f)" }}>
        <div className="flex items-center justify-between gap-2">
          <b className="text-xs">Capacidad semanal</b>
          <span className="text-[8.5px] text-emerald-200 bg-white/10 border border-white/10 rounded-full px-2 py-1">Objetivo 70%</span>
        </div>
        <div className="h-[7px] bg-white/15 rounded-full overflow-hidden my-2.5">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, ocupacionPct)}%`, background: "linear-gradient(90deg,#6ee0aa,#b9f1d2)" }} />
        </div>
        <div className="flex justify-between text-white/60 text-[8.5px]">
          <span>{ocupacionPct}% ocupado</span>
          <span>{horasLibres} h libres</span>
        </div>
      </div>

      <section className="min-h-0 flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex-none flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-neutral-100">
          <div>
            <span className="block text-[8.5px] uppercase tracking-[.12em] text-neutral-400 font-extrabold mb-0.5">Prioridad</span>
            <b className="text-[12px] text-neutral-800">Próximas citas</b>
          </div>
          <span className="min-w-[24px] h-6 px-2 rounded-full grid place-items-center bg-secondary text-primary text-[10px] font-extrabold">
            {reservasOrdenadas.length}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
          {reservasOrdenadas.length === 0 ? (
            <p className="text-[10px] text-neutral-400 text-center py-6">No hay citas en este rango.</p>
          ) : (
            reservasOrdenadas.map((r) => (
              <ApptRow key={r.id_reserva} reserva={r} onChanged={cargar} mostrarAsesor={combinado}
                pasada={esPasado(r.fecha, r.hora_inicio)} />
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
