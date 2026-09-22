// src/config/centrosConvenio.js
//
// Centros españoles con los que Inspira tiene convenio, y sus programas.
// Es la fuente única de la página /centros-con-convenio.
//
// ⚠️ REGLA QUE NO SE SALTA: en `CENTROS` solo entra un centro con el
// **convenio firmado**. Mientras se está negociando, se queda fuera. Publicar
// como «centro con convenio» a uno que aún está en reuniones es publicidad
// engañosa, y además tira por tierra lo único que sostiene esta página:
// que cuando decimos que tenemos convenio, lo tenemos.
//
// Por qué esta página va aparte del mapa de másteres oficiales
// (/mapa-estudiar-en-espana):
//  1. En el mapa no ganamos nada recomendando una comunidad u otra, y eso es
//     lo que lo hace creíble. Aquí sí hay convenio, o sea interés nuestro.
//     Mezclarlos deja al visitante sin saber a cuenta de quién hablamos.
//  2. Con convenio hay que declararlo: se declara una vez, aquí, y con todas
//     las letras.
//  3. Es otro cliente: el que no entró en la pública o no quiere jugarse la
//     plaza. Otro embudo, otra página.
//
// TÍTULO OFICIAL vs TÍTULO PROPIO: cada programa lo dice. Un título propio es
// legal y a veces la mejor opción, pero no sirve para homologar ni para todos
// los trámites. Lo decimos nosotros antes de que lo pregunten.

/** Qué clase de centro es: cambia lo que se puede prometer de su título. */
export const TIPOS_CENTRO = {
  fp: { id: "fp", nombre: "Formación Profesional", icono: "maletin" },
  escuela: { id: "escuela", nombre: "Escuela o centro de posgrado", icono: "birrete" },
  universidad: { id: "universidad", nombre: "Universidad privada", icono: "casa" },
  idiomas: { id: "idiomas", nombre: "Centro de idiomas", icono: "globo" },
  acceso: { id: "acceso", nombre: "Preparación de acceso (PCE, MIR)", icono: "documento" },
};

/** El título que entrega el programa. Se publica siempre, sin excepción. */
export const TITULOS = {
  oficial: {
    id: "oficial",
    etiqueta: "Título oficial",
    detalle: "Inscrito en el registro del Ministerio. Sirve para homologar, seguir estudiando y para los trámites de extranjería.",
    tono: "verde",
  },
  propio: {
    id: "propio",
    etiqueta: "Título propio del centro",
    detalle: "Lo expide el centro, no el Ministerio. Es legal y puede ser muy bueno, pero no sirve para homologar ni equivale a un título oficial.",
    tono: "ambar",
  },
};

/**
 * Cómo se paga. El cliente tiene que saber, de una sola mirada, cuánto es en
 * total y en cuántas veces lo paga; ver `etapasDe()`.
 *
 * `parte` es la fracción del total de cada etapa. Suman 1.
 */
export const ETAPAS_PAGO = [
  { id: "reserva", nombre: "Al reservar la plaza", parte: 0.3, detalle: "Se bloquea tu plaza en el centro y empezamos el expediente." },
  { id: "admision", nombre: "Cuando tienes la carta de admisión", parte: 0.4, detalle: "Con la plaza confirmada por escrito." },
  { id: "visado", nombre: "Al presentar el visado", parte: 0.3, detalle: "Con el expediente completo, listo para el consulado." },
];

/**
 * Centros con convenio firmado. Vacío a propósito: a 22/09/2026 los
 * convenios están en reuniones (ver la campaña de septiembre: 17 propuestas
 * enviadas, censo de 248 centros). En cuanto se firme el primero, se añade
 * aquí con esta forma y la página se publica sola.
 *
 * {
 *   id: "campus-fp",                       // slug, parte de la URL
 *   nombre: "Campus FP",
 *   tipo: "fp",                            // clave de TIPOS_CENTRO
 *   ciudad: "Madrid",
 *   comunidad: "Comunidad de Madrid",
 *   lat: 40.4168, lon: -3.7038,            // para el mapa de esta página
 *   convenioDesde: "2026-10",              // mes de la firma
 *   plazasCurso: "2027/2028",
 *   web: null,                             // no se enlaza sin permiso escrito
 *   programas: [
 *     {
 *       id: "dam",
 *       nombre: "Técnico Superior en Desarrollo de Aplicaciones Multiplataforma",
 *       titulo: "oficial",                 // clave de TITULOS
 *       duracion: "2 cursos",
 *       modalidad: "presencial",
 *       idioma: "castellano",
 *       // Lo que cobra el centro por el programa, al año y en euros.
 *       precioPrograma: 5400,
 *       // Lo que cobra Inspira por gestionarlo todo (plaza, expediente,
 *       // visado y seguimiento). Es nuestra parte, y se dice.
 *       precioAsesoria: 900,
 *       incluye: ["Plaza reservada por convenio", "Matrícula gestionada", "Expediente de visado completo"],
 *       requisitos: ["Bachillerato o equivalente", "Pasaporte vigente"],
 *     },
 *   ],
 * }
 */
export const CENTROS = [];

/** ¿Hay algo publicable? La página se comporta distinto si aún no lo hay. */
export const hayCentros = () => CENTROS.length > 0;

/** Todos los programas, con su centro al lado. */
export function todosLosProgramas(centros = CENTROS) {
  return centros.flatMap((c) => (c.programas || []).map((p) => ({ ...p, centro: c })));
}

/**
 * El precio redondo: lo que paga el cliente por todo, junto y desglosado.
 * Se redondea al alza a la decena, que es como se habla de dinero: «6.300 €»
 * y no «6.297 €». Nunca a la baja: nadie se lleva una sorpresa hacia arriba.
 */
export function precioTotal(programa) {
  const centro = Number(programa?.precioPrograma);
  const asesoria = Number(programa?.precioAsesoria);
  if (!Number.isFinite(centro) || !Number.isFinite(asesoria)) return null;
  const suma = centro + asesoria;
  return { centro, asesoria, exacto: suma, total: Math.ceil(suma / 10) * 10 };
}

/** Las etapas de pago de un programa, en euros ya repartidos. */
export function etapasDe(programa) {
  const p = precioTotal(programa);
  if (!p) return [];
  const partes = ETAPAS_PAGO.map((e) => ({ ...e, importe: Math.round((p.total * e.parte) / 10) * 10 }));
  // El redondeo de cada etapa no puede hacer que la suma se aleje del total:
  // la diferencia se ajusta en la última.
  const suma = partes.reduce((s, e) => s + e.importe, 0);
  if (suma !== p.total) partes[partes.length - 1].importe += p.total - suma;
  return partes;
}

/** Las ciudades con centro, para el mapa de esta página. */
export function ciudadesConCentro(centros = CENTROS) {
  const m = new Map();
  for (const c of centros) {
    if (!Number.isFinite(c.lat) || !Number.isFinite(c.lon)) continue;
    const previo = m.get(c.ciudad) || { ciudad: c.ciudad, comunidad: c.comunidad, lat: c.lat, lon: c.lon, centros: [] };
    previo.centros.push(c);
    m.set(c.ciudad, previo);
  }
  return [...m.values()].sort((a, b) => b.centros.length - a.centros.length);
}
