// src/pages/reservar/calendario.js
// «Agregar al calendario»: enlace de Google Calendar y archivo .ics (Apple,
// Outlook y cualquier otro). Las fechas van en UTC.
const f = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const detalles = (r) =>
  [r.meet_url ? `Enlace de la reunión: ${r.meet_url}` : null, "Reserva N.° " + r.id_reserva].filter(Boolean).join("\n");

export function googleCalendarUrl(r) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${r.titulo} · Inspira Legal`,
    dates: `${f(r.inicio_utc)}/${f(r.fin_utc)}`,
    details: detalles(r),
  });
  if (r.modalidad === "presencial" && r.lugar) p.set("location", r.lugar);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

const esc = (t) => String(t).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function descargarIcs(r) {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Inspira Legal//Reservas//ES",
    "BEGIN:VEVENT",
    `UID:reserva-${r.id_reserva}@inspira-legal.cloud`,
    `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(r.inicio_utc)}`,
    `DTEND:${f(r.fin_utc)}`,
    `SUMMARY:${esc(`${r.titulo} · Inspira Legal`)}`,
    `DESCRIPTION:${esc(detalles(r))}`,
    r.modalidad === "presencial" && r.lugar ? `LOCATION:${esc(r.lugar)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lineas.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cita-inspira-${r.id_reserva}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
