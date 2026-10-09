// Constantes de la Agenda. Salieron de Agenda.jsx al partirlo en piezas
// (09/10/2026); los valores son los mismos.

/* ── Reuniones y disponibilidad (Calendly) ────────────────────── */

export const DAYS_OPTIONS = [
  { label: "Hoy + 7 días", value: 7 },
  { label: "14 días", value: 14 },
  { label: "30 días", value: 30 },
];

export const WDAY_ES = {
  sunday: "Domingo", monday: "Lunes", tuesday: "Martes",
  wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado",
};
export const WDAY_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

/* ── Mi calendario (sistema propio: AgendaSlot / ReservaCita) ──── */
/* Vista de calendario semanal estilo Calendly: columnas = días, filas = medias horas. */

export const HOUR_START = 7;   // 07:00
export const HOUR_END = 21;    // 21:00 (el último renglón es 20:30–21:00)
export const ROWS = (HOUR_END - HOUR_START) * 2;
export const ROW_H = 29; // px por cada media hora

export const ESTADO_DOT = { LIBRE: "bg-emerald-400", RESERVADO: "bg-amber-400", OCUPADO: "bg-primary", BLOQUEADO: "bg-neutral-300" };
export const ESTADO_LABEL = { LIBRE: "Libre — clic para borrar", RESERVADO: "Reservado (pago en curso)", OCUPADO: "Ocupado — cita confirmada", BLOQUEADO: "Bloqueado — clic para liberar" };
export const ESTADO_NOMBRE = { LIBRE: "Libre", RESERVADO: "Reservado", OCUPADO: "Ocupado", BLOQUEADO: "Bloqueado" };
// Tonos de evento inspirados en el mock: verde=libre, ámbar=reservado, verde sólido=ocupado, gris=bloqueado.
export const EVENT_TONE = {
  LIBRE:     "bg-[#dff7eb] text-[#0c6545] border-[#bce8d2]",
  RESERVADO: "bg-[#fff0e4] text-[#a75928] border-[#f7d5bd]",
  OCUPADO:   "bg-[#145f43] text-white border-[#145f43]",
  BLOQUEADO: "bg-neutral-100 text-neutral-500 border-neutral-300",
};

export const WEEKDAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// El estado de la reserva ya implica un pago_estado la mayoría de las veces
// (PENDIENTE_PAGO/EXPIRADA -> PENDIENTE, CONFIRMADA/COMPLETADA -> APROBADO).
// Repetirlo en un segundo pill no suma nada; solo vale mostrarlo cuando el
// pago cuenta algo que el estado de la reserva no dice por sí solo (p.ej.
// una cita CANCELADA cuyo pago fue REEMBOLSADO, o una EXPIRADA cuyo pago fue
// RECHAZADO en vez de simplemente nunca completado).
export const PAGO_IMPLICITO_POR_ESTADO = {
  PENDIENTE_PAGO: "PENDIENTE",
  EXPIRADA: "PENDIENTE",
  // Una cita cancelada que nunca se pagó no necesita el pill "Pago pendiente";
  // si en cambio se pagó y se devolvió, pago_estado será REEMBOLSADO y sí se
  // muestra, que es justo el caso en que aporta información.
  CANCELADA: "PENDIENTE",
  CONFIRMADA: "APROBADO",
  COMPLETADA: "APROBADO",
};
