// src/pages/reservar/fechas.js
// Fechas "YYYY-MM-DD" de Lima en texto: calendario aritmético puro, sin pasar
// nunca por la zona horaria del navegador.
export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function nombreDia(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return NOMBRES_DIA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function fechaCorta(fechaISO) {
  const [, m, d] = fechaISO.split("-").map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

export function fechaCompleta(fechaISO) {
  const [, m, d] = fechaISO.split("-").map(Number);
  return `${nombreDia(fechaISO)} ${d} de ${MESES[m - 1]}`;
}
