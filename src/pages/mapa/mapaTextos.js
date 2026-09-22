// src/pages/mapa/mapaTextos.js
// Textos, formato y SEO del «Mapa para estudiar en España»
// (/mapa-estudiar-en-espana).
//
// Ningún importe se escribe aquí: la matrícula y los planes llegan de
// GET /api/mapa, que los saca de la tabla de matrícula ya publicada y del
// catálogo de precios del backend.
//
// Reglas de contenido:
// - Las listas 2027/2028 se presentan tal cual, sin compararlas con otros cursos.
// - No se promete admisión.
// - El asesorado no accede al catálogo de másteres: aquí solo hay recuentos.
import { eur, numero, rangoEur, SESION_PRECIOS } from "../../config/paqueteMaster2027Resumen";

export { eur, numero };

export const RUTA = "/mapa-estudiar-en-espana";

// Mismos textos que scripts/rutas-compartir.mjs (vista previa al compartir).
// La imagen la genera scripts/og-compartir.py (función «mapa»).
export const SEO = {
  title: "¿Cuánto cuesta un máster en España? Mapa por comunidad y universidad",
  description:
    "Descubre en el mapa cuánto cuesta un máster oficial al año en cada comunidad, ciudad y universidad de España, con su ranking QS y cómo se postula. Los precios de Inspira son paquetes de postulación: la matrícula se paga aparte.",
  path: RUTA,
  imagen: "/og/mapa-estudiar-en-espana.jpg",
};

export const HERO = {
  etiqueta: "El primer mapa gratuito de másteres en España",
  icono: "mapa",
  titulo: "Descubre cuánto cuesta estudiar un máster",
  destacado: "en cada ciudad de España",
  descripcion:
    "Toca una comunidad, una ciudad o una universidad y verás la matrícula aproximada de un máster al año, su ranking QS y cómo se postula. Los precios de Inspira son paquetes de postulación: la matrícula de la universidad se paga aparte.",
  accesos: [
    { icono: "euro", label: "Calculadora de costos", href: "/calculadora-master" },
    { icono: "birrete", label: "Paquete Máster 2027/2028", href: "/servicios/master" },
    { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
  ],
};

// Bloque de confianza. La clienta lo pidió así: «no te dejes engañar por
// programas sin validez académica», pero en registro formal. Se afirma lo que
// se puede sostener —que aquí solo hay títulos del registro del Ministerio— y
// se advierte sin señalar a nadie ni prometer admisiones.
export const CONFIANZA = {
  rotulo: "Aquí partimos contigo",
  titulo: "Solo másteres con validez académica en España",
  texto:
    "En este mapa no hay otra cosa: todos los programas constan en el Registro de Universidades, Centros y Títulos del Ministerio. Antes de pagar por cualquier programa, comprueba que está inscrito ahí. Ningún paquete, por integral que se anuncie, sustituye esa condición ni puede garantizar por sí solo una admisión.",
  puntos: [
    { icono: "escudo", titulo: "Títulos oficiales", texto: "Inscritos en el registro del Ministerio de Universidades (RUCT)." },
    { icono: "documento", titulo: "Precios con su norma", texto: "La matrícula sale de la norma de precios públicos de cada comunidad." },
    { icono: "balanza", titulo: "Lo que no prometemos", texto: "Nadie puede garantizar una admisión: la decide la universidad." },
  ],
};

export const SESION = `Reservar sesión diagnóstico · ${eur(SESION_PRECIOS.eur)}`;

export const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`;
export const mayus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Los tramos de matrícula, dichos como los entiende quien llega de fuera.
// Antes se publicaban como «Lista 3 · Premium», que es la jerga con la que
// Inspira tarifica sus paquetes: el cliente leía «Premium» como «mejor
// universidad» y acababa sin saber si el tramo hablaba de la universidad o de
// nosotros (decisión del 22/09/2026). El número de lista sigue existiendo en
// el brochure y en los paquetes; aquí se describe lo que mide.
export const NOMBRE_TRAMO = {
  economicas: "Matrícula económica",
  intermedias: "Matrícula media",
  premium: "Matrícula alta",
};

export const etiquetaLista = (lista) => (lista ? NOMBRE_TRAMO[lista.id] || lista.nombre : "Fuera de las listas");

/** «desde 739 €/año» con la matrícula más baja del tramo, si la hay. */
export const rangoLista = (lista) => (Number.isFinite(lista?.desdeMatricula) ? `desde ${eur(lista.desdeMatricula)}/año` : null);

/** «Matrícula económica · desde 739 €/año», donde haya sitio para todo. */
export const etiquetaListaLarga = (lista) => [etiquetaLista(lista), rangoLista(lista)].filter(Boolean).join(" · ");

/** «821 €», «591–836 €*», «desde 2.227 €*» o «lo fija cada universidad». */
export function importeMatricula(m) {
  if (!m) return "sin dato";
  if (m.cadaUniversidad) return "lo fija cada universidad";
  const base = m.max ? rangoEur(m.min, m.max) : eur(m.min);
  return `${m.desde ? "desde " : ""}${base}${m.puedeVariar ? "*" : ""}`;
}

export function notasMatricula(m) {
  if (!m) return [];
  const notas = [];
  if (m.segunRama) notas.push("Varía según la rama del máster.");
  if (m.puedeVariar) notas.push("* La universidad puede fijar otro precio para no residentes extracomunitarios.");
  if (m.cadaUniversidad) {
    notas.push("La norma autonómica fija el precio del residente; el del estudiante extracomunitario lo fija cada universidad.");
  }
  notas.push(m.norma ? `Norma: ${m.norma}.` : "Norma en verificación.");
  return notas;
}

/**
 * Siempre «QS World University Rankings 2027 · puesto X», sin enlace
 * (cliente, 14/09/2026). Un ranking sin su fuente no se publica; si la
 * universidad no aparece en él, no se pinta nada. Posiciones como las publica
 * QS: «=165» (empate) → «puesto 165»; «851-900» (banda) → «puesto 851–900».
 */
export function textoRanking(r) {
  if (!r || !r.fuente) return null;
  const nombre = [r.fuente, r.edicion].filter(Boolean).join(" ");
  const pos = r.posicion == null ? "" : String(r.posicion).trim().replace(/^=/, "").replace(/\s*-\s*/g, "–");
  if (pos) return `${nombre} · puesto ${pos}`;
  return r.texto ? `${nombre} · ${r.texto}` : null;
}

// Filtro «Ranking QS» (topes en indice.js, RANKING_TOPES) y orden de las universidades.
export const RANKING = {
  etiqueta: "Ranking QS",
  todas: "Ranking QS: todas",
  opciones: [
    { id: "top200", nombre: "QS Top 200" },
    { id: "top500", nombre: "QS Top 500" },
    { id: "top1000", nombre: "QS Top 1000" },
    { id: "con", nombre: "Con ranking QS" },
  ],
  resumen: { top200: "en el QS Top 200", top500: "en el QS Top 500", top1000: "en el QS Top 1000", con: "con ranking QS" },
  anillo: "Anillo naranja: ciudad con universidad en el ranking elegido",
};

export const ORDEN = {
  etiqueta: "Ordenar universidades",
  masteres: "Más másteres primero",
  ranking: "Mejor ranking primero",
};

// Todo precio de Inspira es un paquete de postulación (cliente, 14/09/2026):
// nunca se confunde con la matrícula ni con el precio del máster.
export const PAQUETE = {
  rotulo: "Paquete de postulación de Inspira",
  desde: (n) => `Paquete de postulación desde ${eur(n)}`,
  desdeCorto: (n) => `paquete de postulación desde ${eur(n)}`,
  leyenda: "Precio de Inspira por la postulación; la matrícula de la universidad se paga aparte.",
  fila: "Paquete de postulación de Inspira",
};

// Panel de inicio y estados vacíos: la página sirve para descubrir cuánto cuesta un máster.
export const INICIO = {
  rotulo: "Empieza aquí",
  titulo: "¿Cuánto cuesta un máster en España?",
  texto:
    "Toca una comunidad o una ciudad del mapa y descubre cuánto cuesta un máster al año en sus universidades, con ejemplos, su ranking QS y cómo se postula. Cada burbuja es una ciudad: cuanto más grande, más másteres oficiales.",
  precios: "Matrícula de la universidad, comunidad a comunidad",
  preciosNota:
    "Es lo que cobra la universidad por el máster en un año (lo habitual), no lo que cobra Inspira: nuestro paquete de postulación se paga aparte. Toca una para ver ejemplos.",
};

export const VACIO = {
  filtros: "Ninguna universidad cumple estos filtros. Prueba a quitar alguno: toca después una comunidad en el mapa para descubrir cuánto cuesta un máster allí.",
};

// «Vivir aquí»: coste de vida por comunidad (`comunidad.vida` en la API). Siempre aproximado.
export const VIDA = {
  titulo: "Vivir aquí",
  habitacion: "Habitación compartida",
  estudio: "Estudio",
  gasto: "Gasto mensual de un estudiante",
  gastoNota: "Orientativo, de bajo a medio",
  transporte: "Transporte",
  clima: "Clima",
  idioma: "Idioma cooficial",
  iprem: "Extranjería exige acreditar al menos 600 €/mes (IPREM 2026).",
  aproximado: "Aproximado",
  sinVerificar: "estimación pendiente de verificar",
  elegirCiudad: "Ciudad",
  fila: "Gasto mensual de un estudiante",
};

// Plazos de postulación (`universidad.plazos`): siempre como fechas estimadas.
export const PLAZOS = {
  proximo: "Próximo plazo de postulación",
  temprano: "Plazo de postulación más temprano",
  fases: "Fases del curso",
  estimadas: (curso) => `Fechas estimadas ${curso}`,
  sinProximo: "Sin plazo por delante en el calendario estimado.",
  filtro: "Plazo de postulación",
  todas: "Plazos: todos",
  opciones: [
    { id: "feb", nombre: "Abre antes de febrero" },
    { id: "abr", nombre: "Abre antes de abril" },
  ],
  resumen: { feb: "que abren plazo antes de febrero", abr: "que abren plazo antes de abril" },
};

// Becas vinculadas a sus másteres (`universidad.becas`, solo emparejamientos fiables).
export const BECAS = {
  titulo: "Becas con convocatoria para sus másteres",
  filtro: "Con becas",
  resumen: "con becas",
  etiqueta: "Con becas",
  aclaracion: "La beca la decide cada entidad; lo revisamos contigo.",
};

// Presupuesto total al año (matrícula + vida), cuando la API trae `comunidad.vida`.
export const PRESUPUESTO = {
  etiqueta: "Tengo hasta",
  sufijo: "al año",
  sinLimite: "Sin tope",
  explicacion: "Suma matrícula típica + gasto de vida medio × 12 en cada comunidad.",
  iprem: "Extranjería exige al menos 7.200 € al año (IPREM 2026: 600 €/mes).",
  ficha: "Presupuesto anual orientativo",
  desglose: (p) => `Matrícula ≈ ${eur(p.matricula)} + vida ≈ ${eur(p.vida)} (gasto medio × 12 en ${p.ciudad})`,
  sinDato: (nombres) => `${nombres}: sin coste de vida o matrícula con los que sumar, queda fuera mientras uses el presupuesto.`,
};

// «Lo que cuesta tu primer año»: la cifra que viene a buscar la gente. El
// paquete de Inspira se nombra aparte a propósito; ver PrimerAnio.jsx.
export const PRIMER_ANIO = {
  rotulo: "Lo que cuesta tu primer año",
  subtitulo: (donde) => `Matrícula del máster y vida en ${donde}, para un año.`,
  matricula: "Matrícula del máster",
  matriculaNota: "Se la pagas a la universidad, no a nosotros.",
  vida: (ciudad) => `Vivir un año en ${ciudad}`,
  vidaNota: "No se pagan a nadie: hay que demostrar que los tienes para la visa.",
  inspira: "Paquete de Inspira",
  inspiraNota: "Aparte del total. Es lo único que nos pagas a nosotros.",
  boton: (donde) => `Quiero postular en ${donde}`,
  whatsapp: (donde) => `Hola, vi en el mapa lo que cuesta un máster en ${donde} y quiero postular. ¿Me orientan?`,
  nota: "Cifras aproximadas: matrícula típica de un máster de la comunidad y el gasto de vida más bajo con dato. Extranjería exige demostrar al menos 7.200 € al año (IPREM 2026: 600 €/mes).",
};

// Llamada del final de la lista: llevarse los costos sin tener que apuntarlos.
export const LLEVATELO = {
  rotulo: "Llévatelo",
  titulo: "¿Te mando lo que cuesta cada comunidad?",
  texto:
    "Te enviamos las tres comunidades más económicas con su matrícula, lo que hace falta para vivir un año y lo que cobramos nosotros. En un mensaje, para pensarlo con calma.",
  boton: "Sí, envíamelo",
};

export const RECOMENDAR = {
  boton: "Recomiéndame",
  rotulo: "Recomiéndame",
  titulo: "3 preguntas y te marcamos 3 comunidades",
  subtitulo: "Las resaltamos en el mapa con el motivo de cada una.",
  p1: "¿Cuánto puedes pagar de matrícula al año, como máximo?",
  topes: [
    { valor: 1000, nombre: `Hasta ${eur(1000)}` },
    { valor: 2000, nombre: `Hasta ${eur(2000)}` },
    { valor: 3500, nombre: `Hasta ${eur(3500)}` },
    { valor: null, nombre: "Sin tope" },
  ],
  p2: "¿Qué área te interesa?",
  p3: "¿Ciudad grande o tranquila?",
  grande: "Grande",
  tranquila: "Tranquila",
  igual: "Me da igual",
  ver: "Ver mis 3 comunidades",
  recalcular: "Volver a recomendar",
  resultado: "Las que mejor encajan",
  vacio: "Ninguna comunidad encaja con las tres respuestas. Prueba a subir el tope de matrícula o a elegir «Me da igual».",
  verMapa: "Ver en el mapa",
  sesion: "Reserva tu sesión",
  guardar: "Guardar mi comparativa",
  comparar: "Compararlas",
  cerrar: "Cerrar el recomendador",
  transparencia: (n) =>
    `Según matrícula orientativa y oferta de másteres oficiales (ciudad grande: ${n} o más másteres). Es una orientación: la admisión la decide cada universidad.`,
};

export const GUARDAR = {
  boton: "Te lo mando por WhatsApp",
  rotulo: "Tu comparativa",
  titulo: "¿Te mando los costos por WhatsApp?",
  texto:
    "Te enviamos lo que cuesta cada sitio que has marcado —matrícula, vida y nuestro paquete— por WhatsApp, y también por correo si lo dejas.",
  seleccion: "Tu selección",
  nombre: "Nombre",
  whatsapp: "WhatsApp",
  prefijo: "Prefijo del país",
  email: "Correo (opcional)",
  politica: ["He leído y acepto la ", "política de privacidad", " (obligatorio)."],
  marketing: "Quiero recibir novedades sobre plazos, convocatorias y becas (opcional).",
  enviar: "Guardar y enviármela",
  enviando: "Enviando…",
  okTitulo: "Listo: tu comparativa está guardada",
  okTexto: "Te la enviaremos por WhatsApp. Si quieres adelantar, escríbenos ahora:",
  okWhatsapp: "Seguir por WhatsApp",
  error: "No pudimos guardarla ahora mismo. Escríbenos por WhatsApp y te la preparamos igual.",
  limite: "Hemos recibido varias solicitudes seguidas desde tu conexión. Espera unos minutos o escríbenos por WhatsApp y te la preparamos igual.",
  reintentar: "Volver al formulario",
  cerrar: "Cerrar",
  mensajeWhatsapp: "Guardé mi comparativa del mapa y quiero orientación para postular.",
  errores: {
    nombre: "Escribe tu nombre.",
    whatsapp: "Escribe tu número de WhatsApp, solo cifras.",
    email: "Revisa el correo.",
    politica: "Para guardarla, acepta la política de privacidad.",
  },
};

// Precio aproximado de un máster por año (lo calcula la API por universidad y
// por comunidad). Siempre con su etiqueta: es una referencia, no un precio.
// Es la matrícula de la universidad, no el paquete de postulación de Inspira.
export const PRECIO = {
  titulo: "¿Cuánto cuesta un máster aquí?",
  etiqueta: "Matrícula aproximada de la universidad por año · puede variar por máster",
  habitual: "lo habitual",
  confianzaBaja: "Pocos másteres con precio publicado: tómalo solo como referencia.",
  ejemplos: "Ejemplos",
  deLaComunidad: (nombre) => `Referencia de ${nombre}: esta universidad aún no tiene precio propio cargado.`,
  // Comunidades en `precios.sinPublicar` de la API (Cataluña).
  sinPublicar: "La matrícula la fija cada universidad",
  sinPublicarDetalle: "Aquí no damos precios de ejemplo: cada universidad fija el importe del estudiante extracomunitario. Te lo concretamos para tu máster.",
};

// Filtro por titularidad («Pública» / «Privada», dato del RUCT que da la API).
export const TITULARIDAD = {
  etiqueta: "Titularidad",
  todas: "Públicas y privadas",
  opciones: [
    { id: "publica", nombre: "Solo públicas" },
    { id: "privada", nombre: "Solo privadas" },
  ],
};

export const T = {
  cargando: "Cargando el mapa…",
  errorTitulo: "No pudimos cargar el mapa",
  errorTexto: "Puede ser un corte de conexión o que el servidor esté ocupado. Vuelve a intentarlo en un momento.",
  reintentar: "Reintentar",
  errorWhatsapp: "El mapa no me cargó y quiero orientación para elegir dónde estudiar.",

  ariaMapa:
    "Mapa de España por comunidades autónomas, coloreadas por lista: toca una para descubrir cuánto cuesta un máster allí. Las burbujas son ciudades con universidades; las estrellas, casos de éxito.",
  todaEspana: "Ver toda España",
  canarias: "Canarias",
  fuera: "Fuera de las listas",
  noCumple: "No cumple los filtros",

  buscar: "Busca una universidad o una ciudad",
  buscarVacio: "Sin resultados. Prueba con la sigla (UGR) o con la ciudad.",
  tipoBusqueda: { universidad: "Universidad", ciudad: "Ciudad", comunidad: "Comunidad" },
  filtroListas: "Filtrar por lista",
  filtroRama: "Rama de conocimiento",
  todasRamas: "Todas las ramas",
  filtroMatricula: "Matrícula máxima",
  sinLimite: "Sin límite",
  limpiar: "Quitar filtros",
  capaCiudades: "Ciudades",
  capaCasos: "Casos de éxito",
  verComparador: "Ver comparador",

  leyendaBurbuja: "Ciudad: el tamaño es su número de másteres oficiales",
  leyendaCampus: "Campus (los másteres se cuentan en la sede principal)",
  leyendaCaso: "Caso de éxito real",

  comparar: "Comparar",
  quitarComparar: "Quitar",
  comparadorLleno: "Ya hay 3",
  calculadora: "Calcular costos",
  webOficial: "Web oficial de sus másteres",
  verPlanes: "Ver qué incluye cada paquete",
  descargo: "Datos orientativos. La admisión la decide cada universidad.",
  planCubre:
    "Precio de Inspira por la postulación; la matrícula de la universidad se paga aparte. Cubre la asesoría y la gestión de Inspira; las tasas se pagan a cada organismo.",

  comparadorAhoraComunidades: "El comparador ahora compara comunidades: no se mezclan con universidades.",
  comparadorAhoraUniversidades: "El comparador ahora compara universidades: no se mezclan con comunidades.",
};

export const PIE = {
  matricula: "Matrícula orientativa según la norma de cada comunidad para extracomunitarios; la fija cada universidad.",
  geografia: "Geografía: Natural Earth (dominio público).",
  admision: "La admisión la decide cada universidad: Inspira no garantiza la admisión, el visado ni la beca.",
};

export const CTA = {
  titulo: "¿Ya tienes en mente dónde estudiar?",
  texto:
    "En la sesión diagnóstico revisamos tu perfil con un abogado especialista y te decimos en qué comunidades y universidades tiene sentido postular. Sales con un plan escrito.",
  whatsapp: "Escríbenos por WhatsApp",
  whatsappDetalle: "Estuve viendo el mapa y quiero orientación para elegir dónde postular.",
};
