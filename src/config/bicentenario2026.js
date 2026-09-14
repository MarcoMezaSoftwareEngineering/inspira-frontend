// src/config/bicentenario2026.js
//
// Beca Generación del Bicentenario — Convocatoria 2026 (PRONABEC).
//
// FUENTE ÚNICA de la página /beca-generacion-bicentenario-2026 y de su
// simulador de puntaje. Todo sale de las bases aprobadas por la
// RDE N.º 149-2026-MINEDU/VMGI-PRONABEC (14/09/2026), resumidas en
// entregables/investigacion/Bicentenario-2026-hechos-bases.md. Cada dato lleva
// su artículo en `art`; la página lo enseña en «ver detalle».
//
// Reglas:
// - Nada de garantías ni de probabilidades: el puntaje es orientativo.
// - Lo europeo (becas y ejemplos de ranking) lleva su `fuente` con URL.
// - Este archivo no importa nada: el simulador se prueba con Node sin montar
//   la aplicación (ver informe del 14/09/2026).

export const RUTA = "/beca-generacion-bicentenario-2026";

export const FUENTE = {
  norma: "RDE N.º 149-2026-MINEDU/VMGI-PRONABEC",
  fecha: "14/09/2026",
  nombre: "Bases del Concurso Beca Generación del Bicentenario – Convocatoria 2026",
  url: "https://www.gob.pe/pronabec",
};

// ── Cifras clave ────────────────────────────────────────────────────────────
export const CIFRAS = {
  total: 20,
  maestria: 17,
  doctorado: 3,
  art: "art. 5, Tabla 1",
  presupuesto: 4650946,
  artPresupuesto: "considerandos de la RDE (año fiscal 2027)",
  percapitaMax: 7910,
  artPercapita: "art. 11, Tabla 2, n.º 7",
};

// Hora de Perú (UTC-5). El cierre es a las 23:59:59 [9.3].
export const FECHAS = {
  apertura: "2026-10-30T00:00:00-05:00",
  cierre: "2026-11-13T23:59:59-05:00",
  resultados: "2026-12-15T00:00:00-05:00",
  inicioEstudiosDesde: "01/07/2026",
  inicioEstudiosHasta: "31/12/2027",
  beneficiosDesde: "01/01/2027",
  art: "art. 9.3",
};

export const CRONOGRAMA = [
  { id: "postulacion", fase: "Postulación", inicio: "2026-10-30", fin: "2026-11-13", texto: "30/10 – 13/11/2026", nota: "Cierra a las 23:59:59, hora de Perú" },
  { id: "subsanacion", fase: "Subsanación", inicio: "2026-11-03", fin: "2026-11-24", texto: "03/11 – 24/11/2026" },
  { id: "revision", fase: "Revisión", inicio: "2026-11-03", fin: "2026-12-04", texto: "03/11 – 04/12/2026" },
  { id: "puntajes", fase: "Puntajes y selección", inicio: "2026-12-07", fin: "2026-12-14", texto: "07/12 – 14/12/2026" },
  { id: "resultados", fase: "Resultados", inicio: "2026-12-15", fin: "2026-12-15", texto: "15/12/2026", destacado: true },
  { id: "aceptacion", fase: "Aceptación de la beca", inicio: "2026-12-16", fin: "2026-12-21", texto: "16/12 – 21/12/2026" },
  { id: "becarios", fase: "Relación de becarios", inicio: "2026-12-22", fin: "2026-12-22", texto: "Desde el 22/12/2026" },
];

// ── Las nuevas bases en 60 segundos ─────────────────────────────────────────
export const LO_NUEVO = [
  { icono: "usuarios", titulo: "Solo 20 becas", texto: "17 de maestría y 3 de doctorado para todo el Perú.", art: "art. 5, Tabla 1" },
  { icono: "estrella", titulo: "Universidades top 400", texto: "Entre las 400 primeras de QS, ARWU o THE al menos una vez en los últimos 5 años.", art: "art. 6.1" },
  { icono: "calendario", titulo: "Estudios del 01/07/2026 al 31/12/2027", texto: "Tu programa debe empezar en esa ventana. Si ya empezaste, debes estar matriculado.", art: "art. 7.2" },
  { icono: "euro", titulo: "Beneficios desde el 01/01/2027", texto: "No se financia el tiempo de estudios anterior a esa fecha.", art: "art. 8.5" },
  { icono: "maletin", titulo: "Prioridad a carreras de alta demanda", texto: "Primero se selecciona, por mérito, a quien viene de una carrera del Top 10 de la EDO 2026 del MTPE.", art: "art. 17.3" },
  { icono: "birrete", titulo: "Si ya cursaste una maestría, no puedes postular", texto: "Aunque no la terminaras o no tengas el grado.", art: "art. 14.1.9" },
];

// ── Requisitos (bases amigables) ────────────────────────────────────────────
export const REQUISITOS = [
  { id: "nacionalidad", icono: "pasaporte", corto: "Nacionalidad peruana", detalle: "Se verifica con tu DNI en línea con RENIEC.", art: "art. 11, Tabla 2, n.º 1" },
  { id: "grado", icono: "birrete", corto: "Bachiller, título profesional o título profesional técnico", detalle: "Se verifica en el Registro de Grados y Títulos de SUNEDU; si no figuras, subes copia certificada. Para doctorado se exige grado o diploma de maestría.", art: "art. 11, Tabla 2, n.º 2" },
  { id: "rendimiento", icono: "estrella", corto: "Como mínimo, tercio superior", detalle: "Constancia oficial con el promedio ponderado acumulado y el percentil al egresar. Niveles: 1.er o 2.º puesto, décimo superior, quinto superior o tercio superior (el mínimo).", art: "art. 11, Tabla 2, n.º 3" },
  { id: "carta", icono: "documento", corto: "Carta de aceptación definitiva de una universidad top 400", detalle: "Sin condiciones de pago, de visa ni de beca, y firmada por la universidad. Debe indicar inicio (entre el 01/07/2026 y el 31/12/2027) y fin, plan de estudios, modalidad presencial y costo académico total. No vale si te exige un curso previo. No se admiten títulos propios, semipresenciales ni programas virtuales.", art: "art. 11, Tabla 2, n.º 4; art. 6" },
  { id: "perfil", icono: "libro", corto: "Docencia en educación superior o un curso de 120 horas o más", detalle: "Basta una: (a) al menos un periodo académico de docencia o apoyo a la docencia en educación superior en los últimos 5 años; (b) un curso, especialización o diplomado de 120 horas o más en los últimos 3 años, posterior al bachiller y dictado por una institución licenciada. Para doctorado: artículo en revista indexada, libro con ISBN o registro en RENACYT.", art: "art. 11, Tabla 2, n.º 5" },
  { id: "experiencia", icono: "maletin", corto: "2 años de experiencia profesional", detalle: "Desde el bachiller o título hasta el inicio de la postulación. No cuentan voluntariados ni trabajos ad honorem, y los periodos en paralelo se cuentan una sola vez.", art: "art. 11, Tabla 2, n.º 6" },
  { id: "ingresos", icono: "casa", corto: "Ingreso per cápita familiar de S/ 7 910 o menos", detalle: "Ingreso bruto promedio mensual del hogar en 2025 dividido entre sus miembros (7 RMV). Solo cuentan quienes tienen tu mismo domicilio en RENIEC.", art: "art. 11, Tabla 2, n.º 7" },
  { id: "sbs", icono: "escudo", corto: "Sin calificación negativa en la SBS", detalle: "Ni deficiente, ni dudoso, ni pérdida, al último corte disponible.", art: "art. 11, Tabla 2, n.º 8" },
  { id: "salud", icono: "huella", corto: "Certificados de salud física y mental", detalle: "Salud física por médico colegiado y salud mental por psiquiatra colegiado, con 120 días de vigencia como máximo.", art: "art. 11, Tabla 2, n.º 9" },
  { id: "declaraciones", icono: "laptop", corto: "Ficha de postulación y declaraciones juradas", detalle: "Las genera el Módulo de Postulación del SIBEC, junto con la ficha socioeconómica.", art: "art. 11, Tabla 2, n.º 10" },
];

export const BENEFICIOS = {
  incluye: [
    "Matrícula y pensión de estudios",
    "Obtención del grado",
    "Trabajo de investigación (tesis)",
    "Pasaje internacional de ida y vuelta",
    "Alojamiento y alimentación",
    "Movilidad local",
    "Seguro médico (salud, vida, accidentes y repatriación)",
    "Costos administrativos",
  ],
  notaIncluye: "Alojamiento, alimentación y movilidad se pagan desde 15 días antes de clases hasta 15 días después de terminar, estando en el país de destino.",
  noIncluye: [
    "Gastos de instalación o personales",
    "Dependientes o cargas familiares",
    "Cursos de nivelación de idiomas",
    "Doble titulación",
  ],
  notaNoIncluye: "Nada se paga antes del 01/01/2027, aunque ya hayas empezado a estudiar.",
  art: "art. 8.1 a 8.5",
};

export const IMPEDIMENTOS = [
  { texto: "Ya tuviste una beca integral del Estado para el mismo nivel (maestría o doctorado).", art: "14.1.1" },
  { texto: "Renunciaste a una beca de PRONABEC o la perdiste, mientras dure el impedimento.", art: "14.1.2 y 14.1.3" },
  { texto: "Falseaste información para obtener una beca o un crédito.", art: "14.1.4" },
  { texto: "Incumpliste el Compromiso de Servicio al Perú.", art: "14.1.5" },
  { texto: "Tienes deudas exigibles con el Estado como becario o por crédito educativo.", art: "14.1.6" },
  { texto: "Trabajas o prestas servicios en PRONABEC, o lo hiciste hace menos de un año.", art: "14.1.7" },
  { texto: "Eres pariente de personal de PRONABEC (hasta 4.º grado de consanguinidad o 2.º de afinidad).", art: "14.1.8" },
  { texto: "Ya cursaste o terminaste una maestría, con o sin grado (para doctorado: un doctorado).", art: "14.1.9" },
  { texto: "Vínculo con terrorismo, o antecedentes policiales, judiciales o penales vigentes.", art: "14.1.10 y 14.1.11" },
  { texto: "Estás inscrito en el REDAM (deudores alimentarios).", art: "14.1.12" },
];

// ── Simulador: requisitos eliminatorios ─────────────────────────────────────
// efecto: "ok" cumple · "no" no cumple · "pend" por confirmar.
const SI_NO_NOSE = (siEs = "ok") => [
  { v: "si", txt: "Sí", efecto: siEs === "ok" ? "ok" : "no" },
  { v: "no", txt: "No", efecto: siEs === "ok" ? "no" : "ok" },
  { v: "nose", txt: "No estoy seguro", efecto: "pend" },
];

export function preguntasRequisitos(nivel = "maestria") {
  const doc = nivel === "doctorado";
  return [
    { id: "nacionalidad", texto: "¿Tienes nacionalidad peruana (DNI)?", opciones: SI_NO_NOSE(), art: "art. 11, Tabla 2, n.º 1",
      siNo: "La beca es solo para peruanos." },
    { id: "grado", texto: doc ? "¿Tienes grado o diploma de maestría?" : "¿Tienes bachiller, título profesional o título profesional técnico?", opciones: SI_NO_NOSE(), art: "art. 11, Tabla 2, n.º 2",
      siNo: doc ? "Para doctorado se exige el grado de maestría." : "Se exige tener el bachiller o el título antes de postular.",
      siPend: "Comprueba que tu grado figure en el registro de SUNEDU." },
    { id: "rendimiento", texto: doc ? "¿En qué percentil terminaste la maestría?" : "¿En qué percentil terminaste tu carrera?", art: "art. 11, Tabla 2, n.º 3",
      opciones: [
        { v: "puesto", txt: "1.er o 2.º puesto", efecto: "ok" },
        { v: "decimo", txt: "Décimo superior", efecto: "ok" },
        { v: "quinto", txt: "Quinto superior", efecto: "ok" },
        { v: "tercio", txt: "Tercio superior", efecto: "ok" },
        { v: "ninguno", txt: "Fuera del tercio superior", efecto: "no" },
        { v: "nose", txt: "No lo sé", efecto: "pend" },
      ],
      siNo: "El mínimo exigido es el tercio superior.",
      siPend: "Pide a tu universidad la constancia con promedio ponderado y percentil al egreso." },
    { id: "carta", texto: "¿Tienes carta de aceptación definitiva de una universidad top 400?", art: "art. 11, Tabla 2, n.º 4; art. 6",
      ayuda: "Presencial, a tiempo completo, sin condiciones de pago, visa ni beca.",
      opciones: [
        { v: "si", txt: "Sí, ya la tengo", efecto: "ok" },
        { v: "aun", txt: "Aún no la tengo", efecto: "pend" },
        { v: "no", txt: "Mi programa es título propio, semipresencial o virtual", efecto: "no" },
      ],
      siNo: "No se admiten títulos propios, semipresenciales ni programas virtuales.",
      siPend: "Sin la carta definitiva no puedes postular: debes tenerla antes del 13/11/2026." },
    { id: "inicio", texto: "¿Tu programa empieza entre el 01/07/2026 y el 31/12/2027?", opciones: SI_NO_NOSE(), art: "art. 7.2",
      siNo: "Solo se financian programas que empiezan en esa ventana.",
      siPend: "Revisa la fecha de inicio que figura en la carta de aceptación." },
    { id: "perfil", texto: doc ? "¿Tienes un artículo indexado, un libro con ISBN o registro en RENACYT?" : "¿Tienes docencia en educación superior (5 años) o un curso de 120 h o más (3 años)?", opciones: SI_NO_NOSE(), art: "art. 11, Tabla 2, n.º 5",
      ayuda: doc ? "Basta una de las tres." : "Basta una. El curso, posterior al bachiller y de institución licenciada.",
      siNo: doc ? "Se exige al menos una publicación o el registro en RENACYT." : "Se exige docencia o un curso de 120 horas o más. Un diplomado aún estás a tiempo de cursarlo para una próxima convocatoria.",
      siPend: "Revisa horas, fechas e institución en tus certificados." },
    { id: "experiencia", texto: "¿Tienes 2 años de experiencia profesional desde tu bachiller o título?", opciones: SI_NO_NOSE(), art: "art. 11, Tabla 2, n.º 6",
      ayuda: "No cuentan voluntariados ni trabajos ad honorem.",
      siNo: "Se exigen 2 años de experiencia hasta el inicio de la postulación.",
      siPend: "Suma tus certificados de trabajo; los periodos en paralelo cuentan una vez." },
    { id: "percapita", texto: `¿El ingreso per cápita de tu hogar es de S/ ${numeroPe(CIFRAS.percapitaMax)} o menos al mes?`, opciones: SI_NO_NOSE(), art: CIFRAS.artPercapita,
      ayuda: "Ingreso bruto mensual promedio de 2025 del hogar entre sus miembros.", calculadora: true,
      siNo: `El tope es S/ ${numeroPe(CIFRAS.percapitaMax)} por persona del hogar.`,
      siPend: "Usa la calculadora con los ingresos brutos de 2025 de tu hogar." },
    { id: "sbs", texto: "¿Estás libre de calificación negativa en la SBS?", opciones: SI_NO_NOSE(), art: "art. 11, Tabla 2, n.º 8",
      ayuda: "Deficiente, dudoso o pérdida.",
      siNo: "Una calificación negativa en la SBS impide postular.",
      siPend: "Consulta tu reporte de deudas en la SBS antes de postular." },
    { id: "previa", texto: doc ? "¿Ya cursaste o terminaste un doctorado, aunque no tengas el grado?" : "¿Ya cursaste o terminaste una maestría, aunque no tengas el grado?", opciones: SI_NO_NOSE("no"), art: "art. 14.1.9",
      siNo: doc ? "Quien ya cursó un doctorado no puede postular a esta beca de doctorado." : "Quien ya cursó una maestría no puede postular a esta beca de maestría." ,
      siPend: "Se verifica con SUNEDU: si empezaste una maestría, cuenta." },
    { id: "impedimentos", texto: "¿Te aplica alguno de los otros impedimentos?", opciones: SI_NO_NOSE("no"), art: "art. 14", verImpedimentos: true,
      siNo: "Con un impedimento, PRONABEC declara «No apto» al postulante.",
      siPend: "Revisa la lista de impedimentos antes de postular." },
  ];
}

/** Resultado de los requisitos: estado global y motivos. */
export function evaluarRequisitos(nivel, resp = {}) {
  const fallos = [];
  const pendientes = [];
  let faltan = 0;
  for (const p of preguntasRequisitos(nivel)) {
    const op = p.opciones.find((o) => o.v === resp[p.id]);
    if (!op) { faltan++; continue; }
    if (op.efecto === "no") fallos.push({ id: p.id, texto: p.siNo, art: p.art });
    if (op.efecto === "pend") pendientes.push({ id: p.id, texto: p.siPend || "Por confirmar.", art: p.art });
  }
  const estado = fallos.length ? "no" : faltan || pendientes.length ? "pendiente" : "cumple";
  return { estado, fallos, pendientes, faltan };
}

// ── Simulador: tablas de puntaje ────────────────────────────────────────────
// Maestría: Tabla 5 (máx. 130). Doctorado: Tabla 6 (máx. 150). Fórmula A+B+C [16.2].
export const PUNTOS = {
  rendimiento: { puesto: 35, decimo: 20, quinto: 10, tercio: 0 },
  iesPublica: { regiones: 10, lima: 5, no: 0 },
  sectorPublico: { "5": 20, "3": 15, "2": 10, "0": 0 },
  carta: { publico: 10, privado: 5, no: 0 },
  renacyt: { distinguido: 15, I: 13, II: 11, III: 9, IV: 7, V: 6, VI: 5, VII: 4, no: 0 },
  articulos: { "3": 3, "2": 2, "0": 0 },
  libros: { libros: 2, capitulos: 1, no: 0 },
  ranking: { top25: 10, top50: 8, top75: 6, top100: 4, top200: 2, top400: 0, nose: 0 },
  latam: { si: 5, no: 0 },
  becaAcad: { "50": 20, "25": 10, menos25: 5, no: 0 },
  condicion: { ninguna: 0, discapacidad: 5, comunidad: 5, bombero: 5, voluntario: 5, acs: 5, migrante: 5 },
};

export const MAXIMOS = {
  maestria: { A: 75, B: 35, C: 20, total: 130, art: "art. 16.1, Tabla 5" },
  doctorado: { A: 95, B: 35, C: 20, total: 150, art: "art. 16.1, Tabla 6" },
};

// Ingreso individual bruto mensual (S/). Tramos distintos por nivel.
export const TRAMOS_INGRESO = {
  maestria: [
    { hasta: 2260, puntos: 15, texto: "S/ 2 260 o menos" },
    { hasta: 3390, puntos: 10, texto: "De S/ 2 261 a S/ 3 390" },
    { hasta: 4520, puntos: 5, texto: "De S/ 3 391 a S/ 4 520" },
  ],
  doctorado: [
    { hasta: 3390, puntos: 15, texto: "S/ 3 390 o menos" },
    { hasta: 4520, puntos: 10, texto: "De S/ 3 391 a S/ 4 520" },
    { hasta: 5650, puntos: 5, texto: "De S/ 4 521 a S/ 5 650" },
  ],
};

export function puntosIngreso(nivel, ingreso) {
  if (ingreso === "" || ingreso === null || ingreso === undefined) return 0;
  const n = Number(ingreso);
  if (!Number.isFinite(n) || n < 0) return 0;
  const tramo = TRAMOS_INGRESO[nivel].find((t) => n <= t.hasta);
  return tramo ? tramo.puntos : 0;
}

const pts = (tabla, v) => PUNTOS[tabla][v] ?? 0;

/** Puntaje técnico orientativo. `resp` usa las claves de PUNTOS e `ingreso`. */
export function calcularPuntaje(nivel, resp = {}) {
  const doc = nivel === "doctorado";
  const max = MAXIMOS[doc ? "doctorado" : "maestria"];
  const detalleA = [
    { id: "rendimiento", criterio: "Rendimiento académico", puntos: pts("rendimiento", resp.rendimiento), max: 35 },
    { id: "iesPublica", criterio: doc ? "Maestría en universidad pública peruana" : "Universidad pública peruana", puntos: pts("iesPublica", resp.iesPublica), max: 10 },
    { id: "sectorPublico", criterio: "Años en el sector público", puntos: pts("sectorPublico", resp.sectorPublico), max: 20 },
    ...(doc
      ? [
          { id: "renacyt", criterio: "RENACYT", puntos: pts("renacyt", resp.renacyt), max: 15 },
          { id: "articulos", criterio: "Artículos indexados", puntos: pts("articulos", resp.articulos), max: 3 },
          { id: "libros", criterio: "Libros o capítulos", puntos: pts("libros", resp.libros), max: 2 },
        ]
      : []),
    { id: "carta", criterio: "Carta de compromiso o licencia", puntos: pts("carta", resp.carta), max: 10 },
  ];
  const detalleB = [
    { id: "ranking", criterio: "Ranking de la universidad", puntos: pts("ranking", resp.ranking), max: 10 },
    { id: "latam", criterio: "Universidad latinoamericana top 400", puntos: pts("latam", resp.latam), max: 5 },
    { id: "becaAcad", criterio: "Beca académica", puntos: pts("becaAcad", resp.becaAcad), max: 20 },
  ];
  const detalleC = [
    { id: "ingreso", criterio: "Ingreso individual", puntos: puntosIngreso(doc ? "doctorado" : "maestria", resp.ingreso), max: 15 },
    { id: "condicion", criterio: "Condición priorizable", puntos: pts("condicion", resp.condicion), max: 5 },
  ];
  const suma = (l) => l.reduce((s, x) => s + x.puntos, 0);
  const A = Math.min(suma(detalleA), max.A);
  const B = Math.min(suma(detalleB), max.B);
  const C = Math.min(suma(detalleC), max.C);
  return { A, B, C, total: A + B + C, max, detalle: { A: detalleA, B: detalleB, C: detalleC } };
}

/** Qué puede subir el puntaje, con lo que el postulante aún puede cambiar. */
export function mejoras(nivel, resp = {}) {
  const lista = [];
  const beca = pts("becaAcad", resp.becaAcad);
  if (beca < 20) {
    lista.push({ suma: 20 - beca, titulo: "Una beca académica de la universidad", texto: `Si cubre el 50 % o más de los costos académicos suma 20 puntos (hoy sumas ${beca}). PRONABEC descuenta su monto del costo que financia.`, art: "art. 12, Tabla 3, n.º 2" });
  }
  const carta = pts("carta", resp.carta);
  if (carta < 10) {
    lista.push({ suma: 10 - carta, titulo: carta ? "Carta o licencia del sector público" : "Carta de compromiso o licencia por estudios", texto: carta ? "Del sector público suma 10 en lugar de 5." : "Del empleador, para contratarte al volver o darte licencia: suma 10 (sector público) o 5 (privado). Además es el primer criterio de desempate.", art: "art. 12, Tabla 3, n.º 1; art. 17.2" });
  }
  const rk = pts("ranking", resp.ranking);
  if (rk < 10) {
    lista.push({ suma: 10 - rk, titulo: "Una universidad mejor rankeada", texto: `Top 200 suma 2; Top 100, 4; Top 25, 10 (hoy sumas ${rk}). En la Unión Europea hay universidades mejor situadas que las españolas.`, art: "art. 16.1" });
  }
  if (nivel === "doctorado" && pts("renacyt", resp.renacyt) === 0) {
    lista.push({ suma: 15, titulo: "Registro en RENACYT", texto: "Estar calificado en RENACYT suma de 4 a 15 puntos según el nivel.", art: "art. 16.1, Tabla 6" });
  }
  return lista.sort((a, b) => b.suma - a.suma);
}

/** Lectura honesta del puntaje. No es una probabilidad. */
export function lectura(total, max) {
  const pct = max ? total / max : 0;
  if (pct >= 0.6) return { nivel: "alto", titulo: "Puntaje alto en la tabla", texto: "Estás en la parte alta de la tabla de puntaje. Aun así, con tan pocas becas cada punto cuenta." };
  if (pct >= 0.35) return { nivel: "medio", titulo: "Puntaje intermedio", texto: "Tienes una base, pero con tan pocas becas conviene sumar donde todavía puedes." };
  return { nivel: "bajo", titulo: "Puntaje bajo en la tabla", texto: "Con este puntaje es difícil entrar entre las 20 becas. Mira qué puedes mejorar y ten un plan B." };
}

// ── Opciones de los pasos de puntaje ────────────────────────────────────────
export const OPCIONES = {
  iesPublica: [
    { v: "regiones", txt: "Pública, en regiones (fuera de Lima y Callao)" },
    { v: "lima", txt: "Pública, en Lima Metropolitana o Callao" },
    { v: "no", txt: "Privada o extranjera" },
  ],
  sectorPublico: [
    { v: "5", txt: "5 años o más" },
    { v: "3", txt: "De 3 a 4 años y 11 meses" },
    { v: "2", txt: "De 2 a 2 años y 11 meses" },
    { v: "0", txt: "Menos de 2 años o ninguno" },
  ],
  carta: [
    { v: "publico", txt: "Sí, de una entidad pública" },
    { v: "privado", txt: "Sí, de una empresa privada" },
    { v: "no", txt: "No la tengo" },
  ],
  renacyt: [
    { v: "distinguido", txt: "Investigador distinguido" },
    { v: "I", txt: "Nivel I" }, { v: "II", txt: "Nivel II" }, { v: "III", txt: "Nivel III" },
    { v: "IV", txt: "Nivel IV" }, { v: "V", txt: "Nivel V" }, { v: "VI", txt: "Nivel VI" }, { v: "VII", txt: "Nivel VII" },
    { v: "no", txt: "No estoy en RENACYT" },
  ],
  articulos: [
    { v: "3", txt: "3 o más (últimos 5 años)" },
    { v: "2", txt: "2 (últimos 5 años)" },
    { v: "0", txt: "1 o ninguno" },
  ],
  libros: [
    { v: "libros", txt: "2 libros o más (últimos 5 años)" },
    { v: "capitulos", txt: "2 capítulos de libro o más" },
    { v: "no", txt: "Ninguno de los dos" },
  ],
  ranking: [
    { v: "top25", txt: "Top 25" },
    { v: "top50", txt: "Puestos 26 a 50" },
    { v: "top75", txt: "Puestos 51 a 75" },
    { v: "top100", txt: "Puestos 76 a 100" },
    { v: "top200", txt: "Puestos 101 a 200" },
    { v: "top400", txt: "Puestos 201 a 400" },
    { v: "nose", txt: "Aún no lo sé" },
  ],
  latam: [
    { v: "no", txt: "No (España, Unión Europea u otro lugar)" },
    { v: "si", txt: "Sí, está en Latinoamérica" },
  ],
  becaAcad: [
    { v: "50", txt: "Cubre el 50 % o más" },
    { v: "25", txt: "Cubre del 25 % al 49 %" },
    { v: "menos25", txt: "Cubre menos del 25 %" },
    { v: "no", txt: "No tengo beca académica" },
  ],
  condicion: [
    { v: "ninguna", txt: "Ninguna" },
    { v: "discapacidad", txt: "Discapacidad (CONADIS)" },
    { v: "comunidad", txt: "Comunidad nativa amazónica, campesina o pueblo afroperuano" },
    { v: "bombero", txt: "Bombero activo o hijo de bombero" },
    { v: "voluntario", txt: "Voluntario (registro del MIMP)" },
    { v: "acs", txt: "Agente comunitario de salud" },
    { v: "migrante", txt: "Migrante retornado" },
  ],
};

// ── Ayuda del ranking: ejemplos verificados en QS 2027 ──────────────────────
// Solo QS World University Rankings 2027 (publicado el 17/06/2026). Cuenta el
// mejor puesto de QS, ARWU o THE en los últimos 5 años [6.1]: una universidad
// puede sumar más con otro ranking u otro año. Tramo sin ejemplo verificado =
// lista vacía (no se inventa).
export const FUENTES_RANKING = [
  { nombre: "QS World University Rankings 2027, nota de prensa (17/06/2026), puestos de las universidades españolas", url: "https://www.prnewswire.com/news-releases/qs-world-university-rankings-2027-302803707.html" },
  { nombre: "TUM: «TUM ranks 25th worldwide in the QS World University Rankings 2027» (18/06/2026)", url: "https://www.mgt.tum.de/our-stories-with-impact/detail/top-global-university-tum-ranks-25th-worldwide-in-the-qs-world-university-rankings-2027" },
  { nombre: "Ministerio Federal de Asuntos Exteriores de Alemania: «QS World University Rankings 2027: Strong Performance for Germany and Canada»", url: "https://canada.diplo.de/ca-en/about-us/vancouver/2776466-2776466" },
];

export const RANKING_EJEMPLOS = {
  top25: [{ nombre: "Universidad Técnica de Múnich (TUM)", pais: "Alemania", puesto: "25" }],
  top50: [],
  top75: [{ nombre: "LMU Múnich", pais: "Alemania", puesto: "61" }],
  top100: [
    { nombre: "Universidad de Heidelberg", pais: "Alemania", puesto: "86" },
    { nombre: "Universidad Libre de Berlín", pais: "Alemania", puesto: "98" },
  ],
  top200: [
    { nombre: "RWTH Aquisgrán", pais: "Alemania", puesto: "104" },
    { nombre: "KIT Karlsruhe", pais: "Alemania", puesto: "110" },
    { nombre: "Universitat de Barcelona", pais: "España", puesto: "165" },
    { nombre: "Universidad Complutense de Madrid", pais: "España", puesto: "199" },
  ],
  top400: [
    { nombre: "Universitat Autònoma de Barcelona", pais: "España", puesto: "211" },
    { nombre: "Universidad Autónoma de Madrid", pais: "España", puesto: "226" },
    { nombre: "Universitat Pompeu Fabra", pais: "España", puesto: "263" },
    { nombre: "Universidad de Navarra", pais: "España", puesto: "279" },
    { nombre: "Universidad Carlos III de Madrid", pais: "España", puesto: "314" },
    { nombre: "Universidad Politécnica de Madrid", pais: "España", puesto: "364" },
  ],
};

// ── Comparación con la Convocatoria 2025 ────────────────────────────────────
// SOLO la convocatoria inmediatamente anterior (decisión del cliente,
// 14/09/2026). Se rellena con datos VERIFICADOS de
// entregables/investigacion/Bicentenario-convocatorias-anteriores.json
// (entrada 2025). Mientras `disponible` sea false o falten las cifras de
// becas, la página oculta la sección. No inventes nada aquí.
// Datos verificados en bases y resoluciones oficiales (consulta 14/09/2026,
// Bicentenario-convocatorias-anteriores.md). NO usar lo marcado «no
// verificado» allí (becarios finales, «+300 admitidos»).
// tipo: "mas" (más exigente) · "nuevo" · "menos" (se quita o se recorta) · "igual".
export const COMPARACION_2025 = {
  disponible: true,
  anterior: {
    anio: 2025,
    norma: "RDE N.º 022-2025-MINEDU/VMGI-PRONABEC (05/03/2025)",
    becasTotal: 150,
    maestria: 135,
    doctorado: 15,
    presupuesto: 13492494.16,
    ranking: "Top 400 de QS, ARWU o THE, al menos una vez en los últimos 5 años",
    postulacion: "14/04/2025 – 10/06/2025",
    semanas: 8,
    postulantes: 743, // registro completo, RJ N.º 1685-2025 (07/07/2025)
    aptos: 393,
    seleccionados: 150,
    fuente: "https://cdn.www.gob.pe/uploads/document/file/7736603/6542522-rde-n-022-2025-minedu-vmgi-pronabec.pdf",
    fuenteAmigable: "https://cdn.www.gob.pe/uploads/document/file/7919958/6666086-bgb-bases-version-amigable.pdf",
    fuenteResultados: "https://cdn.www.gob.pe/uploads/document/file/8326310/6936181-rj-n-1685-2025-minedu-vmgi-pronabec-dibec.pdf",
  },
  cambiosRequisitos: [
    { tema: "Experiencia profesional mínima", antes: "1 año", ahora: "2 años (sin voluntariados ni ad honorem)", tipo: "mas", art: "art. 11, Tabla 2, n.º 6" },
    { tema: "Central de riesgos (SBS)", antes: "No se exigía", ahora: "Sin calificación negativa", tipo: "nuevo", art: "art. 11, Tabla 2, n.º 8" },
    { tema: "Perfil profesional", antes: "5 vías: docencia, curso de 120 h, artículo, libro o RENACYT", ahora: "2 vías: docencia o curso de 120 h", tipo: "mas", art: "art. 11, Tabla 2, n.º 5" },
    { tema: "Ingreso per cápita familiar máximo", antes: "S/ 7 910", ahora: "S/ 7 910", tipo: "igual", art: "art. 11, Tabla 2, n.º 7" },
    { tema: "Ranking de la universidad", antes: "Top 400 (QS, ARWU o THE)", ahora: "Top 400 (QS, ARWU o THE)", tipo: "igual", art: "art. 6.1" },
    { tema: "Beneficios", antes: "Incluían transporte interprovincial, útiles, materiales y uniforme", ahora: "Ya no los incluyen; se pagan desde el 01/01/2027", tipo: "menos", art: "art. 8" },
  ],
  cambiosPuntaje: [
    { tema: "Puntaje máximo de maestría", antes: "100", ahora: "130", tipo: "mas", art: "art. 16.1, Tabla 5" },
    { tema: "Rendimiento académico", antes: "20", ahora: "35", tipo: "mas", art: "Tabla 5" },
    { tema: "Docencia, cursos, RENACYT, artículos y libro", antes: "30", ahora: "Ya no puntúan en maestría", tipo: "menos", art: "Tabla 5" },
    { tema: "Áreas priorizadas", antes: "10", ahora: "Se quitan: ahora hay prioridad por carreras del Top 10 de demanda (EDO 2026)", tipo: "menos", art: "art. 17.3" },
    { tema: "Años en el sector público", antes: "10", ahora: "20", tipo: "mas", art: "Tabla 5" },
    { tema: "Beca académica", antes: "10", ahora: "20", tipo: "mas", art: "Tabla 5" },
    { tema: "Ingreso individual", antes: "5 (hasta S/ 5 932)", ahora: "15 (hasta S/ 4 520)", tipo: "mas", art: "Tabla 5" },
    { tema: "Universidad pública peruana", antes: "—", ahora: "10 en regiones · 5 en Lima o Callao", tipo: "nuevo", art: "Tabla 5" },
    { tema: "Carta de contratación o licencia", antes: "—", ahora: "10 sector público · 5 privado", tipo: "nuevo", art: "Tabla 5" },
    { tema: "Universidad latinoamericana top 400", antes: "—", ahora: "5", tipo: "nuevo", art: "Tabla 5" },
  ],
  contexto: "En abril de 2026 PRONABEC anunció que no habría convocatoria por falta de presupuesto; el 14/09/2026 la reabrió con cargo al año fiscal 2027.",
  fuenteContexto: "https://elperuano.pe/noticia/294519-pronabec-descarta-cierre-de-beca-generacion-del-bicentenario",
};

export const COMPARACION_ACTUAL = {
  anio: 2026,
  becasTotal: CIFRAS.total,
  maestria: CIFRAS.maestria,
  doctorado: CIFRAS.doctorado,
  presupuesto: CIFRAS.presupuesto,
  ranking: "Top 400 de QS, ARWU o THE, al menos una vez en los últimos 5 años",
  postulacion: "30/10/2026 – 13/11/2026",
  semanas: 2,
};

export function comparacionLista(c = COMPARACION_2025) {
  const a = c?.anterior || {};
  return Boolean(c?.disponible && a.becasTotal != null && a.maestria != null && a.doctorado != null && a.fuente);
}

// ── Otras becas ─────────────────────────────────────────────────────────────
// España: se pintan desde BECAS de config/paqueteMaster2027.js (fuente única).
export const IDS_BECAS_ESPANA = ["carolina", "auip-lorca", "jaen", "talentunileon"];

// Unión Europea: verificadas en la web oficial de cada programa el 14/09/2026.
export const BECAS_UE = [
  {
    id: "erasmus-mundus",
    nombre: "Erasmus Mundus Joint Masters",
    pais: "Unión Europea",
    cubre: "Másteres conjuntos en varias universidades europeas; la beca incluye viaje, visado y ayuda de manutención.",
    ventana: "Orientativa: de octubre a enero, para empezar el curso siguiente. Se postula a cada máster.",
    fuente: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters-scholarships",
  },
  {
    id: "daad",
    nombre: "DAAD · Study Scholarships – Master Studies",
    pais: "Alemania",
    cubre: "992 € al mes, seguro de salud, accidentes y responsabilidad civil, ayuda de viaje y 460 € al año para estudios.",
    ventana: "Orientativa: desde el 1 de junio hasta el plazo que fija el DAAD cada año.",
    fuente: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50026200",
  },
  {
    id: "eiffel",
    nombre: "France Excellence Eiffel",
    pais: "Francia",
    cubre: "1.200 € al mes, pasajes, seguro y ayuda con el alojamiento. No cubre la matrícula y la solicitud la presenta la universidad francesa.",
    ventana: "Orientativa: de octubre a enero (la convocatoria 2026 cerró el 8 de enero de 2026).",
    fuente: "https://www.campusfrance.org/en/the-france-excellence-eiffel-scholarship-program",
  },
  {
    id: "iyt",
    nombre: "Invest Your Talent in Italy",
    pais: "Italia",
    cubre: "9.000 € por nueve meses, para másteres de Ingeniería y Tecnologías Avanzadas, Arquitectura y Diseño, y Economía y Gestión.",
    ventana: "Orientativa: primavera (la convocatoria 2026-27 cerró el 11 de mayo de 2026).",
    fuente: "https://www.esteri.it/en/servizi-opportunita/opportunita/borse-di-studio/per-cittadini-stranieri/progetti-speciali/invest-your-talent-in-italy/",
  },
  {
    id: "nl-scholarship",
    nombre: "NL Scholarship",
    pais: "Países Bajos",
    cubre: "5.000 € en el primer año, para estudiantes de fuera del Espacio Económico Europeo. Se solicita en la universidad participante.",
    ventana: "Orientativa: abre en noviembre (la de 2026-27, el 1 de noviembre de 2025); el plazo lo fija cada universidad.",
    fuente: "https://www.studyinnl.org/finances/nl-scholarship",
  },
];

export const AVISO_BECAS_UE = "Las convocatorias y los requisitos cambian cada año; lo revisamos contigo. La beca la decide cada entidad.";

// ── Plan B: máster en España sin beca ───────────────────────────────────────
// Matrícula orientativa de máster oficial (norma 2026-27, 60 ECTS):
// Castilla-La Mancha desde 728 € y Galicia desde 739 €.
export const PLAN_B = {
  matriculaDesde: 730,
  nota: "Matrícula orientativa de un máster oficial de 60 ECTS según la norma de precios 2026-27 (Castilla-La Mancha desde 728 € y Galicia desde 739 €). La matrícula se paga a la universidad, aparte del paquete de postulación.",
  hrefMapa: "/mapa-estudiar-en-espana",
  hrefPaquete: "/servicios/master",
};

export const BECAS_LOGRADAS = ["Generación Bicentenario", "Universidad de Jaén", "Fundación Carolina", "AUIP"];

// ── Preguntas frecuentes ────────────────────────────────────────────────────
export const FAQ = [
  { q: "¿Puedo postular si aún no tengo la carta de aceptación?", a: "No. La carta de aceptación definitiva es un requisito obligatorio al postular, del 30/10 al 13/11/2026. Por eso conviene postular a la universidad cuanto antes.", art: "art. 11, Tabla 2, n.º 4" },
  { q: "¿Sirve para un máster en España o en otro país de la Unión Europea?", a: "Sí, si la universidad está entre las 400 primeras de QS, ARWU o THE al menos una vez en los últimos 5 años, el programa es presencial y a tiempo completo, y no es título propio. La lista oficial de universidades la aprueba PRONABEC hasta un día antes de la postulación.", art: "art. 6.1 a 6.6" },
  { q: "Mi máster empieza en septiembre de 2027, ¿vale?", a: "Sí: el inicio debe estar entre el 01/07/2026 y el 31/12/2027. Los beneficios se pagan desde el 01/01/2027.", art: "art. 7.2 y 8.5" },
  { q: "Ya empecé una maestría y la dejé. ¿Puedo postular?", a: "No a la beca de maestría: haber cursado una maestría, aunque no la terminaras, es impedimento.", art: "art. 14.1.9" },
  { q: "¿Mi puntaje del simulador es el oficial?", a: "No. Es orientativo y sale de lo que indicas. PRONABEC asigna el puntaje con tus documentos, aplica la prioridad por carreras de alta demanda y selecciona por orden de mérito.", art: "art. 16 y 17" },
  { q: "¿El simulador guarda mis datos?", a: "No. El cálculo se hace en tu navegador y no se envía ni se guarda nada. Solo si pulsas «Recibir mi resultado por WhatsApp» se abre un mensaje con tu resumen, que tú decides enviar." },
  { q: "¿Inspira otorga la beca?", a: "No. La beca la otorga PRONABEC. Inspira te asesora para preparar tu postulación a la universidad y a la beca, pero no garantiza la admisión ni la beca." },
];

export const PIE_LEGAL = `Información resumida de la ${FUENTE.norma}. Inspira no forma parte de PRONABEC; la beca la otorga PRONABEC. Consulta siempre las bases oficiales en gob.pe/pronabec.`;

// ── Emojis de la página (solo presentación: los datos de arriba no cambian) ─
// Van por id o en el mismo orden que su lista.
export const EMOJI_CLAVES = ["🎯", "🌍", "📅", "💶", "💼", "🚫"]; // orden de LO_NUEVO
export const EMOJIS = {
  nacionalidad: "🪪", grado: "🎓", rendimiento: "🏅", carta: "📨", inicio: "📅", perfil: "📚",
  experiencia: "💼", ingresos: "🏠", percapita: "🏠", sbs: "🏦", salud: "🩺", declaraciones: "📝",
  previa: "🚫", impedimentos: "⛔",
};
export const EMOJI_INCLUYE = ["🎓", "📜", "🔬", "✈️", "🏠", "🚌", "🩺", "🗂️"]; // orden de BENEFICIOS.incluye
export const EMOJI_NO_INCLUYE = ["🛋️", "👪", "🗣️", "📑"]; // orden de BENEFICIOS.noIncluye
export const EMOJI_FASE = { postulacion: "📝", subsanacion: "🛠️", revision: "🔍", puntajes: "🧮", resultados: "🏆", aceptacion: "✍️", becarios: "🎉" };
export const EMOJI_FAQ = ["📨", "🌍", "📅", "🚫", "🧮", "🔒", "🤝"]; // orden de FAQ
export const BANDERA_UE = { "erasmus-mundus": "ue", daad: "de", eiffel: "fr", iyt: "it", "nl-scholarship": "nl" };

// Doctorado: lo que cambia en la lista de requisitos [art. 11, Tabla 2, n.º 2 b) y n.º 5].
export const REQUISITOS_DOCTORADO = {
  grado: { corto: "Grado o diploma de maestría" },
  perfil: { corto: "Artículo indexado, libro con ISBN o registro en RENACYT" },
};

// ── Utilidades ──────────────────────────────────────────────────────────────
/** 7910 → «7 910» (espacio duro, como en las bases). */
export function numeroPe(n) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Estado de la postulación en `ahora` (ms). */
export function estadoPostulacion(ahora = Date.now()) {
  const abre = new Date(FECHAS.apertura).getTime();
  const cierra = new Date(FECHAS.cierre).getTime();
  if (ahora < abre) return { fase: "antes", objetivo: abre, rotulo: "Abre la postulación en" };
  if (ahora <= cierra) return { fase: "abierta", objetivo: cierra, rotulo: "Cierra la postulación en" };
  return { fase: "cerrada", objetivo: null, rotulo: "Postulación cerrada · resultados el 15/12/2026" };
}
