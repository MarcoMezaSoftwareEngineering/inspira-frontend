import { ESTADO_DOT, ESTADO_LABEL, ESTADO_NOMBRE, EVENT_TONE, ROWS, ROW_H, WEEKDAY_SHORT } from "../constantes";
import { iniciales, rowLabel, toISODate } from "../utilidades";

/* Calendario: cabecera con leyenda, cuadrícula de horas × días y pie de ayuda. */
export default function CuadriculaCalendario({
  tituloCalendario, viewMode, combinado,
  displayedDays, todayKey, loading,
  mostrarNowLine, nowLineTop,
  slotMap, esPasado, busyCell, crearSlotRapido,
  reservaPorClave, claveDeSlot,
  onClickSlot, bloquearSlot,
}) {
  return (
    <section className="min-w-0 min-h-0 flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex-none flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[34px] h-[34px] rounded-[11px] bg-secondary text-primary grid place-items-center flex-shrink-0 text-base">📅</div>
          <div className="min-w-0">
            <strong className="block text-[12.5px] text-neutral-800 truncate">{tituloCalendario}</strong>
            <span className="block text-[9.5px] text-neutral-400 mt-0.5">{viewMode === "dia" ? "Vista diaria" : "Semana actual"} · hora local</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {Object.entries(ESTADO_DOT).map(([k, dot]) => (
            <span key={k} className="flex items-center gap-1 text-[9.5px] text-neutral-500">
              <span className={`w-[7px] h-[7px] rounded-full ${dot}`} />
              {ESTADO_NOMBRE[k]}
            </span>
          ))}
        </div>
      </div>
      {combinado && (
        <p className="flex-none text-[10.5px] text-neutral-400 px-3.5 pt-1.5">
          Cuando dos asesores tienen horario a la misma hora, verás varios bloques juntos en esa celda.
        </p>
      )}

      <div className="flex-1 min-h-0 overflow-auto">
        <div style={{ minWidth: displayedDays.length > 1 ? 700 : 260 }}>
          {/* Encabezado de días */}
          <div className="grid sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-neutral-100" style={{ gridTemplateColumns: `52px repeat(${displayedDays.length}, minmax(90px,1fr))` }}>
            <div className="sticky left-0 bg-white z-10" />
            {displayedDays.map((d) => {
              const key = toISODate(d);
              const isToday = key === todayKey;
              return (
                <div key={key} className={`flex flex-col items-center gap-1 py-2.5 ${isToday ? "bg-gradient-to-b from-secondary-light to-transparent" : ""}`}>
                  <span className="text-[9px] uppercase tracking-[.12em] text-neutral-400 font-extrabold">{WEEKDAY_SHORT[d.getDay()]}</span>
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-extrabold ${isToday ? "bg-primary-dark text-white shadow" : "text-neutral-700"}`}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid de horas × días */}
          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-400">Cargando…</div>
          ) : (
            <div className="relative grid" style={{ gridTemplateColumns: `52px repeat(${displayedDays.length}, minmax(90px,1fr))`, gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)` }}>
              {mostrarNowLine && (
                <div className="absolute right-0 h-px bg-[#f17860] z-[6] pointer-events-none" style={{ left: 52, top: nowLineTop }}>
                  <span className="absolute -left-[4px] -top-[3px] w-[7px] h-[7px] rounded-full bg-[#f17860]" />
                </div>
              )}
              {/* Líneas de hora + etiquetas (columna fija al hacer scroll horizontal) */}
              {Array.from({ length: ROWS }, (_, row) => (
                <div key={`label-${row}`}
                  className="sticky left-0 z-10 bg-white text-[9px] text-neutral-400 font-semibold text-right pr-2 border-t border-neutral-100 -translate-y-1/2"
                  style={{ gridColumn: 1, gridRow: row + 1 }}>
                  {row % 2 === 0 ? rowLabel(row) : ""}
                </div>
              ))}

              {/* Celdas por día */}
              {displayedDays.map((d, dayIdx) => {
                const fecha = toISODate(d);
                return Array.from({ length: ROWS }, (_, row) => {
                  const hora = rowLabel(row);
                  const key = `${fecha}|${hora}`;
                  const arr = slotMap.get(key) || [];
                  const pasado = esPasado(fecha, hora);

                  if (arr.length === 0) {
                    return (
                      <button
                        key={key}
                        disabled={pasado || busyCell === key || combinado}
                        onClick={() => crearSlotRapido(fecha, hora)}
                        title={pasado || combinado ? "" : `Crear horario ${hora}`}
                        className={`border-t border-l border-neutral-100 transition-colors ${
                          pasado || combinado ? "bg-neutral-50/60 cursor-default" : "hover:bg-secondary-light cursor-pointer"
                        } ${busyCell === key ? "bg-primary/10" : ""}`}
                        style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}
                      />
                    );
                  }

                  if (arr.length === 1) {
                    const slot = arr[0];
                    const reservaDelSlot = (slot.estado === "RESERVADO" || slot.estado === "OCUPADO")
                      ? reservaPorClave.get(claveDeSlot(slot)) : null;
                    const titulo = reservaDelSlot?.cliente?.nombre || ESTADO_NOMBRE[slot.estado];
                    const subtitulo = combinado && slot.asesor ? `${hora} · ${slot.asesor.nombre}` : hora;
                    return (
                      <div key={key} className="relative group border-t border-l border-neutral-100 p-[3px]" style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}>
                        <button
                          onClick={() => onClickSlot(slot)}
                          title={`${ESTADO_LABEL[slot.estado]}${slot.asesor ? ` — ${slot.asesor.nombre}` : ""}`}
                          className={`w-full h-full rounded-[9px] border px-1.5 flex flex-col justify-center overflow-hidden text-left shadow-sm transition-transform hover:-translate-y-px ${EVENT_TONE[slot.estado]} ${slot.estado === "LIBRE" || slot.estado === "BLOQUEADO" ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <b className="block text-[9px] font-extrabold leading-tight truncate">{titulo}</b>
                          <small className="block text-[8px] opacity-75 leading-tight truncate">{subtitulo}</small>
                        </button>
                        {slot.estado === "LIBRE" && (
                          <button
                            onClick={(e) => bloquearSlot(slot, e)}
                            title="Bloquear este horario"
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white border border-neutral-300 text-neutral-500 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-primary hover:text-primary transition-opacity"
                          >
                            🔒
                          </button>
                        )}
                      </div>
                    );
                  }

                  // Varios asesores con horario a la misma hora -> mini bloques lado a lado (cruce visible)
                  return (
                    <div key={key} className="flex gap-0.5 p-[3px] border-t border-l border-neutral-100" style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}>
                      {arr.map((slot) => (
                        <button
                          key={slot.id_slot}
                          onClick={() => onClickSlot(slot)}
                          title={`${slot.asesor?.nombre || ""} — ${ESTADO_LABEL[slot.estado]}`}
                          className={`flex-1 rounded-[7px] border text-[8px] font-extrabold flex items-center justify-center transition-colors ${EVENT_TONE[slot.estado]}`}
                        >
                          {iniciales(slot.asesor?.nombre)}
                        </button>
                      ))}
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-none px-3.5 py-2 border-t border-neutral-100 text-[9.5px] text-neutral-400">
        {combinado
          ? "Elige un asesor en el selector de arriba para crear o modificar horarios."
          : "Clic en una celda vacía para crear un horario · clic en uno libre para borrarlo (🔒 para bloquearlo) · clic en uno bloqueado para liberarlo."}
      </div>
    </section>
  );
}
