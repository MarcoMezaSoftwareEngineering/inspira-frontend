// src/config/gradoEspana.js
// Contenido y cálculo de /grado-en-espana: la guía para familias que financian
// el grado de su hijo o hija en España.
//
// DATOS (no escribas cifras de universidades a mano):
// - gradoEspana.datos.json: copia de los datos VERIFICADOS de
//   entregables/investigacion/coste-grado-2026-27.json (elaborado el
//   14/09/2026). Se regenera con el script extraer_datos.py de la sesión
//   cdfb231e (scratchpad/grado-web). Lo marcado [NO VERIFICADO] no entra como
//   cifra: sale como «consultar».
// - precios-inspira.json: fuente única de precios de Inspira (sesión, visado,
//   estancia, citas). El Paquete Grado todavía no está ahí: su precio vive
//   abajo, en PAQUETE_GRADO, con la nota de origen.
// - costeVida.js: gasto mensual de estudiante por ciudad (investigación del
//   14/09/2026); «aprox.» cuando la ciudad no está verificada.
// - visaOEstancia.js: IPREM 2026 (600 €/mes), regla de Carina del 07/09/2026.
import DATOS from "./gradoEspana.datos.json";
import PRECIOS_INSPIRA from "./precios-inspira.json";
import { IPREM_MES, IPREM_ANUAL } from "./visaOEstancia";
import { CIUDADES, FUENTE_VIDA, hayCosteVida, nombreCiudad } from "./costeVida";
import { NOMBRE_PORTAL } from "./portalMarca";
import { TITULAR } from "./legal";

export { IPREM_MES, IPREM_ANUAL, CIUDADES, FUENTE_VIDA, hayCosteVida, nombreCiudad };

export const META = DATOS.meta;
export const FUENTES = DATOS.fuentes;
export const PUBLICAS = DATOS.publicas;
export const PRIVADAS_POR_CARRERA = DATOS.privadasPorCarrera;
export const UNEDASISS = DATOS.unedasiss;

// ── Precios de Inspira ──────────────────────────────────────────────────────
export const SESION = PRECIOS_INSPIRA.sesionDiagnostico;
export const VISADOS = PRECIOS_INSPIRA.visado;
export const ESTANCIA = PRECIOS_INSPIRA.estancia;
export const CITAS = PRECIOS_INSPIRA.citasEspana;
export const CITAS_TOTAL = CITAS.reduce((s, c) => s + c.eur, 0);

/** Tasa oficial de homologación (tasa 079): Inspira la cotiza en 50 € aparte. */
export const TASA_HOMOLOGACION = 50;

export const PAQUETE_GRADO = {
  nombre: "Paquete Silver",
  titulo: "Paquete Grado 2027/2028",
  lema: "4 servicios en 1",
  // Precio del cliente 14/09/2026. No está aún en precios-inspira.json: cuando
  // se añada allí, léelo de la fuente única y borra este número.
  eur: 550,
  servicios: [
    { icono: "mapa", titulo: "Búsqueda de universidades", texto: "Públicas y privadas, según precio, nota, calidad y ciudad." },
    { icono: "documento", titulo: "Homologación del bachillerato", texto: "Sus estudios de secundaria, reconocidos como Bachillerato español." },
    { icono: "brujula", titulo: "Trámites y vía de acceso", texto: "Documentos, preinscripción y matrícula, con o sin examen." },
    { icono: "birrete", titulo: "Gestión de la admisión", texto: "Seguimos cada postulación hasta la respuesta de la universidad." },
  ],
  incluye: [
    "Envío internacional de documentos",
    "Gestión de tasas",
    // Incluidas (cliente, 14/09/2026), pero el seguimiento va casi todo automatizado
    // en el portal: se ofrecen como apoyo, sin destacarlas.
    "Reuniones 1 a 1 de seguimiento, si las necesitas",
    `Todo en el ${NOMBRE_PORTAL}, en portal y app`,
  ],
  noIncluye: [
    `Tasa oficial de homologación (${TASA_HOMOLOGACION} €)`,
    "Preparación al examen de la UNED",
    "Tasas de inscripción a las pruebas",
    "Matrícula de la universidad",
    "Visado o estancia por estudios (van aparte)",
  ],
  cuotas: "Dos cuotas: 50 % al iniciar y 50 % a los dos meses, si faltan más de dos meses para la preinscripción. Si falta menos, al contado.",
};

const visadosTexto = VISADOS.map((v) => `${v.nombre.replace("Asesoría ", "")} ${v.eur} €`).join(" · ");

export const ETAPAS_PAGO = [
  {
    cuando: "Hoy",
    titulo: "Sesión diagnóstico",
    importe: `${SESION.eur} €`,
    detalle: `${SESION.usd} US$ · S/ ${SESION.pen}. 30 minutos online. Es un pago aparte: no se descuenta del paquete.`,
    icono: "balanza",
  },
  {
    cuando: "Al empezar",
    titulo: PAQUETE_GRADO.titulo,
    importe: `${PAQUETE_GRADO.eur} €`,
    detalle: PAQUETE_GRADO.cuotas,
    icono: "birrete",
  },
  {
    cuando: "Con la carta de admisión",
    titulo: "Visado o estancia",
    importe: `desde ${Math.min(...VISADOS.map((v) => v.eur))} €`,
    detalle: `Visado: ${visadosTexto} (recomendada la Integral). Estancia por estudios: ${ESTANCIA.eur} €.`,
    icono: "pasaporte",
  },
  {
    // Empadronamiento y huellas se hacen al llegar, igual con visado que con estancia.
    cuando: "Ya en España",
    titulo: "Citas en España",
    importe: `${CITAS_TOTAL} €`,
    detalle: CITAS.map((c) => {
      const n = c.nombre.replace("Cita de ", "");
      return `${n.charAt(0).toUpperCase()}${n.slice(1)}: ${c.eur} €`;
    }).join(" · "),
    icono: "casa",
  },
];

// ── Simulador ───────────────────────────────────────────────────────────────
const deEstado = (estado) => PUBLICAS.filter((p) => p.estado === estado);
const sinRecargo = deEstado("sin");
const porId = (id) => PUBLICAS.find((p) => p.id === id);

/**
 * Tipos de universidad. Públicas: precio de no residente por 60 ECTS.
 * Privadas: escenarios de la investigación (coste_total_estimado), con el
 * ejemplo de Medicina para 6 años.
 */
export const TIPOS = [
  {
    id: "sin-recargo",
    grupo: "Pública",
    nombre: "Pública sin recargo",
    base: sinRecargo.map((p) => p.nombre).join(", ").replace(/, ([^,]*)$/, " o $1"),
    min: Math.min(...sinRecargo.map((p) => p.noResidente.min)),
    max: Math.max(...sinRecargo.map((p) => p.noResidente.max)),
  },
  {
    id: "con-recargo",
    grupo: "Pública",
    nombre: "Pública con recargo",
    base: "Ejemplo: Comunitat Valenciana, que cobra el doble a quien no es residente",
    min: porId("comunitat_valenciana").noResidente.min,
    max: porId("comunitat_valenciana").noResidente.max,
  },
  {
    id: "madrid",
    grupo: "Pública",
    nombre: "Pública en Madrid",
    base: "Madrid cobra el precio de cuarta matrícula a quien no es residente",
    min: porId("madrid").noResidente.min,
    max: porId("madrid").noResidente.max,
  },
  {
    id: "privada-economica",
    grupo: "Privada",
    nombre: "Privada económica",
    base: "Ejemplo: UCAM, Derecho, con su precio para estudiantes de fuera de la UE",
    min: 6500,
    max: 6500,
    extraPrimerAnio: 821.12,
    extraTexto: "preinscripción, apertura y seguro del primer año",
    medicina: { min: 14400, max: 14400, base: "Ejemplo: Católica de Valencia, Medicina" },
  },
  {
    id: "privada-media",
    grupo: "Privada",
    nombre: "Privada media",
    base: "Ejemplos: Deusto, ADE (Bilbao) y Francisco de Vitoria, ADE (Madrid)",
    min: 10470,
    max: 11970,
    medicina: { min: 17850, max: 17850, base: "Ejemplo: Deusto, Medicina" },
  },
  {
    id: "privada-alta",
    grupo: "Privada",
    nombre: "Privada alta",
    base: "Ejemplo: IE University, BBA; sube un 2,9 % cada año",
    min: 29000,
    max: 29000,
    subidaAnual: 0.029,
    extraPrimerAnio: 1200,
    extraTexto: "aportación a la IE Foundation",
    medicina: { min: 25080, max: 25080, extraPrimerAnio: 800, extraTexto: "apertura de expediente", base: "Ejemplo: Universidad Europea, Medicina" },
  },
];

export const CATEGORIAS = [
  // Colores validados con el validador de dataviz (modo claro, 14/09/2026):
  // tonos de marca ajustados a la banda de luminosidad; naranja y amarillo
  // nunca contiguos en la pila. Contraste < 3:1 → siempre con leyenda y tabla.
  { id: "matricula", nombre: "Matrícula de la universidad", pagaA: "Se paga a la universidad", color: "#0079A8" },
  { id: "acceso", nombre: "Acceso: homologación y UNED", pagaA: "Tasas oficiales", color: "#D4A017" },
  { id: "vida", nombre: "Vida en España", pagaA: "Gasto de tu hijo o hija", color: "#7AB8F7" },
  { id: "inspira", nombre: "Servicios de Inspira", pagaA: "Se paga a Inspira", color: "#E36A12" },
];

export const OPCIONES_DEFECTO = {
  tipo: "sin-recargo",
  comunidadId: "",
  anios: 4,
  via: "visado",
  visadoId: VISADOS.find((v) => v.recomendado)?.id || VISADOS[0].id,
  examen: false,
  pce: 4,
  vida: hayCosteVida() ? "ciudad" : "iprem",
  ciudadId: (CIUDADES.find((c) => c.id === "salamanca") || CIUDADES[0])?.id || "",
};

const r2 = (n) => Math.round(n * 100) / 100;
const rango = (min, max = min) => ({ min: r2(min), max: r2(max) });

function matricula(o) {
  const medicina = o.anios === 6;
  if (o.comunidadId) {
    const c = porId(o.comunidadId) || PUBLICAS[0];
    const r = c.noResidente;
    // Medicina está en el tramo más caro de cada comunidad.
    const anual = medicina ? rango(r.max) : rango(r.min, r.max);
    const avisos = [];
    if (c.aviso) avisos.push(`${c.nombre}: ${c.aviso}`);
    return { anio: () => anual, extra: 0, base: `${c.nombre}: ${c.regla}`, avisos };
  }
  const t = TIPOS.find((x) => x.id === o.tipo) || TIPOS[0];
  const p = medicina && t.medicina ? { ...t, ...t.medicina, subidaAnual: 0, extraPrimerAnio: t.medicina.extraPrimerAnio || 0, extraTexto: t.medicina.extraTexto } : t;
  const subida = p.subidaAnual || 0;
  return {
    anio: (i) => {
      const f = Math.pow(1 + subida, i);
      return medicina && !t.medicina ? rango(p.max * f) : rango(p.min * f, p.max * f);
    },
    extra: p.extraPrimerAnio || 0,
    extraTexto: p.extraTexto,
    base: p.base,
    avisos: [],
  };
}

/**
 * Calcula la inversión año a año. Devuelve, por año, un rango {min, max} por
 * categoría y las líneas del desglose; y los totales.
 */
export function simular(opciones = {}) {
  const o = { ...OPCIONES_DEFECTO, ...opciones };
  const m = matricula(o);
  const visado = VISADOS.find((v) => v.id === o.visadoId) || VISADOS[0];
  const ciudad = CIUDADES.find((c) => c.id === o.ciudadId);
  const pce = Math.min(6, Math.max(1, Number(o.pce) || 4));
  const tasasUned = UNEDASISS.calificacionAcceso + UNEDASISS.aperturaExpediente + UNEDASISS.secretaria + UNEDASISS.pce[pce - 1];

  const vidaAnual =
    o.vida === "ciudad" && ciudad
      ? rango(ciudad.mensual.min * 12, ciudad.mensual.max * 12)
      : o.vida === "iprem"
        ? rango(IPREM_ANUAL)
        : rango(0);

  const anios = Array.from({ length: o.anios }, (_, i) => {
    const primero = i === 0;
    const mat = m.anio(i);
    const extra = primero ? m.extra : 0;
    const acceso = primero ? TASA_HOMOLOGACION + (o.examen ? tasasUned : 0) : 0;
    // Las citas en España (empadronamiento y huellas) van en las dos vías: se hacen al llegar.
    const viaEur = (o.via === "visado" ? visado.eur : ESTANCIA.eur) + CITAS_TOTAL;
    const inspira = primero ? SESION.eur + PAQUETE_GRADO.eur + viaEur : 0;

    const lineas = {
      matricula: [{ texto: m.base, min: mat.min, max: mat.max }],
      acceso: [],
      vida: [],
      inspira: [],
    };
    if (extra) lineas.matricula.push({ texto: `Pagos de entrada: ${m.extraTexto}`, min: extra, max: extra });
    if (primero) {
      lineas.acceso.push({ texto: "Tasa de homologación del bachillerato", min: TASA_HOMOLOGACION, max: TASA_HOMOLOGACION });
      if (o.examen) lineas.acceso.push({ texto: `Tasas de UNEDasiss con ${pce} ${pce === 1 ? "asignatura" : "asignaturas"} PCE`, min: r2(tasasUned), max: r2(tasasUned) });
      lineas.inspira.push({ texto: "Sesión diagnóstico", min: SESION.eur, max: SESION.eur });
      lineas.inspira.push({ texto: PAQUETE_GRADO.titulo, min: PAQUETE_GRADO.eur, max: PAQUETE_GRADO.eur });
      if (o.via === "visado") {
        lineas.inspira.push({ texto: `Visado: ${visado.nombre}`, min: visado.eur, max: visado.eur });
      } else {
        lineas.inspira.push({ texto: ESTANCIA.nombre, min: ESTANCIA.eur, max: ESTANCIA.eur });
      }
      lineas.inspira.push({ texto: "Citas en España (empadronamiento y huellas)", min: CITAS_TOTAL, max: CITAS_TOTAL });
    }
    if (vidaAnual.max) {
      lineas.vida.push({
        texto: o.vida === "ciudad" && ciudad ? `Vida en ${nombreCiudad(ciudad)}: gasto de estudiante, 12 meses` : `Mínimo legal: ${IPREM_MES} € al mes (IPREM 2026)`,
        min: vidaAnual.min,
        max: vidaAnual.max,
      });
    }

    return {
      n: i + 1,
      matricula: rango(mat.min + extra, mat.max + extra),
      acceso: rango(acceso),
      vida: vidaAnual,
      inspira: rango(inspira),
      lineas,
    };
  });

  const suma = (clave, lado) => r2(anios.reduce((s, a) => s + a[clave][lado], 0));
  const totales = Object.fromEntries(CATEGORIAS.map((c) => [c.id, rango(suma(c.id, "min"), suma(c.id, "max"))]));
  const total = rango(
    CATEGORIAS.reduce((s, c) => s + totales[c.id].min, 0),
    CATEGORIAS.reduce((s, c) => s + totales[c.id].max, 0)
  );

  const avisos = [...m.avisos];
  if (o.examen) avisos.push(UNEDASISS.vigencia);
  if (o.vida === "ciudad" && ciudad) {
    avisos.push(`Vida en ${ciudad.nombre}: gasto orientativo de estudiante en piso compartido, de ${ciudad.mensual.min} a ${ciudad.mensual.max} € al mes. No incluye seguro médico, fianza ni viajes.`);
    if (!ciudad.verificado && ciudad.nota) avisos.push(`${ciudad.nombre} (aprox.): ${ciudad.nota}`);
    if (ciudad.mensual.min > IPREM_MES) avisos.push(`En ${ciudad.nombre} el gasto real supera el mínimo legal de ${IPREM_MES} € al mes que se acredita en el visado o la estancia.`);
  }
  if (o.vida === "iprem") avisos.push("La vida se calcula con el mínimo que exige la ley, no con el gasto real de una ciudad concreta.");

  return { opciones: o, anios, totales, total, avisos };
}

// ── Textos de las secciones ─────────────────────────────────────────────────
export const NO_RESIDENTE =
  "Con visado de estudiante o con estancia por estudios, tu hijo o hija tiene una autorización de estancia, no de residencia. Por eso la universidad pública le cobra el precio de no residente: en unas comunidades es el mismo que el de un residente y en otras, bastante más.";

export const VIAS_ACCESO = [
  {
    id: "sin-examen",
    recomendada: true,
    titulo: "Sin examen de admisión",
    lema: "Postula con su bachillerato homologado",
    puntos: [
      "Sin examen ni tasas de la UNED",
      "Muchas privadas y algunas públicas admiten así, a veces con una prueba propia",
      "Su nota de acceso es la del bachillerato: hasta 10",
    ],
  },
  {
    id: "con-examen",
    recomendada: false,
    titulo: "Con examen (PCE de UNEDasiss)",
    lema: "Inspira gestiona todo lo de la UNED",
    puntos: [
      "Suma hasta 4 puntos: nota máxima de 14",
      "Útil en públicas con nota de corte alta o que lo piden",
      "La preparación del examen no está incluida",
    ],
  },
];

export const REQUISITOS = [
  { icono: "birrete", titulo: "Secundaria terminada", texto: "Con sus certificados de estudios oficiales y legalizados." },
  { icono: "documento", titulo: "Homologación al Bachillerato español", texto: `Tasa oficial de unos ${TASA_HOMOLOGACION} €. Mientras se resuelve, un volante le permite inscribirse de forma condicional.` },
  { icono: "brujula", titulo: "Una vía de acceso", texto: "Sin examen, con su bachillerato homologado, o con las pruebas PCE de la UNED." },
  { icono: "pasaporte", titulo: "Pasaporte vigente", texto: "Para el visado de estudiante o la estancia por estudios." },
];

export const NOTA_REQUISITOS =
  "Si estudió Bachillerato Internacional (IB), Bachillerato Europeo o en un país de la Unión Europea, no necesita homologar (RD 534/2024).";

export const VISA_ESTANCIA = {
  comun: [
    { icono: "euro", texto: `Las dos piden acreditar al menos ${IPREM_MES} € al mes (IPREM 2026): unos ${IPREM_ANUAL.toLocaleString("es-ES")} € por año.` },
    { icono: "balanza", texto: "Con las dos paga matrícula como no residente y no puede pedir la beca general del Ministerio." },
    { icono: "maletin", texto: "Con las dos puede trabajar hasta 30 horas a la semana." },
  ],
  vias: [
    {
      id: "visado",
      titulo: "Visado de estudiante",
      donde: "Desde Perú, en el consulado de España",
      dinero: [
        "Extractos bancarios de los 6 últimos meses",
        "Origen lícito del dinero: declaración de impuestos, rentas o justificantes",
        "Admite aval de la familia, con carta notarial legalizada y apostillada y los documentos económicos del avalista",
      ],
      plazo: "Se presenta al menos 2 meses antes del inicio de clases.",
      mejorPara: "Familias que pueden documentar ahorros de hace más de seis meses.",
      precios: VISADOS.map((v) => ({ nombre: v.nombre.replace("Asesoría ", ""), eur: v.eur, recomendado: !!v.recomendado })),
      extra: `Ya en España, citas de empadronamiento y huellas: ${CITAS_TOTAL} € (igual con estancia)`,
    },
    {
      id: "estancia",
      titulo: "Estancia por estudios",
      donde: "Ya en España, ante Extranjería",
      dinero: [
        "El monto en una cuenta abierta en España",
        "Con fondos propios: no se pide el historial de seis meses ni justificar el origen",
        "Admite aval, pero es mejor con fondos propios",
      ],
      plazo: "Tarda unos 3 meses desde que entra como turista.",
      mejorPara: "Cuando el dinero entró hace poco o cuesta documentar de dónde viene.",
      precios: [{ nombre: "Estancia por estudios", eur: ESTANCIA.eur, recomendado: false }],
      extra: null,
    },
  ],
};

export const CALENDARIO = [
  { fecha: "Nov 2026 – feb 2027", titulo: "Homologación", texto: "Es lo que más tarda: se empieza cuanto antes.", icono: "documento" },
  { fecha: "Feb – may 2027", titulo: "Inscripción a las PCE", texto: "En UNEDasiss.", icono: "calendario", soloExamen: true },
  { fecha: "Jun 2027", titulo: "Pruebas PCE", texto: "El examen de la UNED.", icono: "libro", soloExamen: true },
  { fecha: "Jul 2027", titulo: "Preinscripción", texto: "En las universidades elegidas.", icono: "birrete" },
  { fecha: "2 meses antes de clases", titulo: "Visado o estancia", texto: "Con la carta de admisión.", icono: "pasaporte" },
  { fecha: "Sep – oct 2027", titulo: "Inicio de clases", texto: "Primer curso en España.", icono: "estrella" },
];

export const BECAS = [
  {
    titulo: "Beca general del Ministerio",
    estado: "No accesible",
    tono: "no",
    texto: "Exige residencia. Con visado de estudiante o estancia por estudios no se es residente, así que no se puede pedir.",
  },
  {
    titulo: "Gratuidades de las comunidades",
    estado: "No el primer año",
    tono: "no",
    texto: "Piden empadronamiento o haber estado matriculado el curso anterior. No son un ahorro para quien acaba de llegar.",
  },
  {
    titulo: "Becas propias de las privadas",
    estado: "Depende de cada una",
    tono: "revisar",
    texto: "Existen, por ejemplo en Comillas o en el CEU, con condiciones propias. Las revisamos en la búsqueda de universidades.",
  },
];

export const FAQ = [
  {
    id: "trabajar",
    q: "¿Puede trabajar mientras estudia?",
    a: "Sí. Con su autorización de estudiante puede trabajar hasta 30 horas a la semana, compatibles con sus clases.",
  },
  {
    id: "dinero",
    q: "¿Cuánto dinero hay que demostrar?",
    a: `Al menos ${IPREM_MES} € por cada mes (IPREM 2026), unos ${IPREM_ANUAL.toLocaleString("es-ES")} € por año. Con visado, en extractos de los últimos seis meses y con origen lícito; con estancia, en una cuenta abierta en España con fondos propios. En la sesión calculamos el monto exacto de su caso.`,
  },
  {
    id: "no-admision",
    q: "¿Qué pasa si no lo admiten?",
    a: "La admisión la decide cada universidad. Por eso buscamos varias opciones, públicas y privadas, y elegimos la vía de acceso con más posibilidades para su perfil. Si una universidad dice que no, seguimos con las demás de su plan.",
  },
  {
    id: "quien-paga",
    q: "¿Quién paga qué?",
    a: `A Inspira, solo sus servicios: la sesión, el paquete, el visado o la estancia y las citas. A la universidad, la matrícula. Al Ministerio, la tasa de homologación (unos ${TASA_HOMOLOGACION} €). A la UNED, sus tasas si va con examen. Las tasas oficiales del visado o de la estancia, si corresponden, se pagan a cada organismo.`,
  },
  {
    id: "no-residente",
    q: "¿Por qué pagaría más que un estudiante español?",
    a: NO_RESIDENTE,
  },
  {
    id: "seguro",
    q: "¿Es seguro contratar con Inspira?",
    a: `${TITULAR.nombreComercial} es un despacho con abogados especialistas en extranjería, registrado en Perú (${TITULAR.razonSocial}, RUC ${TITULAR.ruc}). Todo queda por escrito en el ${NOMBRE_PORTAL}: documentos, plazos y mensajes con su asesor. Los pagos van a la cuenta empresarial.`,
  },
  {
    id: "pagar",
    q: "¿Cómo pago desde Perú?",
    a: "Por transferencia a la cuenta empresarial de Inspira, por Plin o con Mercado Pago. Desde otro país, por PayPal o con un link de pago que te enviamos.",
  },
  {
    id: "garantia",
    q: "¿Garantizan la admisión?",
    a: "No. La admisión la decide cada universidad y nadie puede garantizarla. Lo que sí hacemos es preparar bien su candidatura, elegir opciones realistas y acompañarlos en cada paso.",
  },
];

export const DESCARGO =
  "Cifras orientativas. Matrícula: precios del curso 2026-27 por 60 créditos en primera matrícula, sujetos a actualización anual; no incluyen las tasas fijas de secretaría. Los precios de Inspira son los de sus servicios: la matrícula se paga directamente a la universidad.";
