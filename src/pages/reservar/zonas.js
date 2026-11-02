// src/pages/reservar/zonas.js
// Las horas de la agenda son de Lima. Como en Calendly, cada persona las ve en
// su zona horaria: se detecta la del navegador y se puede cambiar.
export const ZONA_AGENDA = "America/Lima";

const ZONAS = [
  { id: "America/Lima", etiqueta: "Perú (Lima)" },
  { id: "America/Bogota", etiqueta: "Colombia (Bogotá)" },
  { id: "America/Guayaquil", etiqueta: "Ecuador (Guayaquil)" },
  { id: "America/Mexico_City", etiqueta: "México (Ciudad de México)" },
  { id: "America/Santiago", etiqueta: "Chile (Santiago)" },
  { id: "America/Argentina/Buenos_Aires", etiqueta: "Argentina (Buenos Aires)" },
  { id: "America/New_York", etiqueta: "Estados Unidos (Nueva York)" },
  { id: "Europe/Madrid", etiqueta: "España (Madrid)" },
];

export function zonaDetectada() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_AGENDA;
  } catch {
    return ZONA_AGENDA;
  }
}

// Lista para el selector; si la zona detectada no está, se añade al principio.
export function zonasDisponibles(detectada) {
  if (ZONAS.some((z) => z.id === detectada)) return ZONAS;
  const ciudad = String(detectada).split("/").pop().replace(/_/g, " ");
  return [{ id: detectada, etiqueta: `Su zona (${ciudad})` }, ...ZONAS];
}

const formato = (zona, opciones) => {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zona, hourCycle: "h23", ...opciones });
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_AGENDA, hourCycle: "h23", ...opciones });
  }
};

/** "HH:mm" de un instante UTC en la zona dada. */
export function horaEn(iso, zona) {
  const p = formato(zona, { hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso));
  const g = (t) => p.find((x) => x.type === t)?.value || "00";
  return `${g("hour")}:${g("minute")}`;
}

/** "YYYY-MM-DD" de un instante UTC en la zona dada. */
export function diaEn(iso, zona) {
  const p = formato(zona, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const g = (t) => p.find((x) => x.type === t)?.value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}

/** Días de diferencia entre el día de Lima y el de la zona (−1, 0, +1). */
export function desfaseDias(iso, zona) {
  const a = Date.parse(`${diaEn(iso, ZONA_AGENDA)}T00:00:00Z`);
  const b = Date.parse(`${diaEn(iso, zona)}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}
