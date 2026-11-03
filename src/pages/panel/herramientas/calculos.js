// Cálculos puros de las herramientas gratuitas (03/11/2026): la nota en la
// escala española y los plazos hacia atrás desde el inicio del máster.

// Escala de cada país: nota máxima y nota mínima para aprobar. La conversión
// es lineal entre el aprobado (5) y la máxima (10): orientativa. La oficial,
// con el método del Ministerio, la hace Inspira.
export const ESCALAS = [
  { id: "pe", pais: "Perú", max: 20, aprueba: 11 },
  { id: "co", pais: "Colombia", max: 5, aprueba: 3 },
  { id: "mx", pais: "México", max: 10, aprueba: 6 },
  { id: "cl", pais: "Chile", max: 7, aprueba: 4 },
  { id: "ar", pais: "Argentina", max: 10, aprueba: 4 },
  { id: "ec", pais: "Ecuador", max: 10, aprueba: 7 },
  { id: "bo", pais: "Bolivia", max: 100, aprueba: 51 },
  { id: "ve", pais: "Venezuela", max: 20, aprueba: 10 },
  { id: "do", pais: "República Dominicana", max: 100, aprueba: 70 },
  { id: "br", pais: "Brasil", max: 10, aprueba: 5 },
];

/** Nota española (5-10) con dos decimales, o null si no se puede convertir. */
export function notaEspanola(nota, { max, aprueba }) {
  const n = Number(nota), mx = Number(max), ap = Number(aprueba);
  if (!Number.isFinite(n) || !(mx > ap) || n < ap || n > mx) return null;
  return Math.round((5 + (5 * (n - ap)) / (mx - ap)) * 100) / 100;
}

/** Cómo lo ve una comisión española, en una palabra. */
export function tramoNota(es) {
  if (es >= 9) return "Sobresaliente";
  if (es >= 7) return "Notable";
  if (es >= 6) return "Bien";
  return "Aprobado";
}

// Hitos de un máster que empieza en `inicio`, contados hacia atrás.
export const HITOS = [
  { dias: 240, titulo: "Empezar a postular", texto: "Las primeras universidades abren la preinscripción." },
  { dias: 210, titulo: "Documentos apostillados", texto: "Título, notas y, si te los piden, antecedentes." },
  { dias: 150, titulo: "Admisión y reserva de plaza", texto: "Con la carta de admisión empieza la visa." },
  { dias: 100, titulo: "Pedir cita en el consulado", texto: "Las citas se agotan semanas antes." },
  { dias: 75, titulo: "Presentar la visa", texto: "El consulado tarda de 1 a 2 meses en resolver." },
  { dias: 10, titulo: "Viajar a España", texto: "Con tiempo para empadronarte antes de clases." },
];

/** Los hitos con su fecha y los días que faltan desde `hoy` (ISO). */
export function hitosDesde(inicio, hoy) {
  const dia = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 864e5);
  const fin = dia(inicio), h = dia(hoy);
  if (!Number.isFinite(fin)) return [];
  return HITOS.map((x) => {
    const n = fin - x.dias;
    return { ...x, fecha: new Date(n * 864e5).toISOString().slice(0, 10), faltan: n - h };
  });
}

/** El primer 15 de septiembre que todavía deja los 240 días para postular. */
export function inicioPorDefecto(hoy) {
  const anio = Number(hoy.slice(0, 4));
  const margen = (Date.parse(`${anio}-09-15`) - Date.parse(hoy)) / 864e5;
  return `${margen >= 240 ? anio : anio + 1}-09-15`;
}
