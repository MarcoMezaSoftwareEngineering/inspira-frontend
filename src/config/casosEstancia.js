// src/config/casosEstancia.js
//
// Resoluciones de estancia por estudios conseguidas por Inspira, para la
// landing /estancia («mostrar resultados que tenemos», Marco, 25/09/2026).
//
// Solo nombre de pila (regla INDECOPI, la misma que en casos.js) y nada que
// identifique a la persona: ni NIE, ni número de expediente, ni apellidos. Lo
// que se publica es lo que consta en la resolución y no señala a nadie: la
// oficina que resolvió, el centro de estudios, el tipo de autorización y las
// fechas. Fuente: las resoluciones que Marco compartió el 25/09/2026 (cuatro
// autorizaciones iniciales y la prórroga de Jhonatan). Las de 2025 se añaden
// con `anio: 2025` cuando lleguen: la landing agrupa por año sola.
//
// `presentada` y `resuelta` solo cuando la resolución las dice: de ahí sale
// «resuelta en N días». Cuando la resolución no trae la fecha de presentación,
// `resueltaDias` es lo que Inspira sabe de su propio expediente (Marco,
// 25/09/2026: Yuri y Liseth «un mes», Denisse 26 días). `resuelta` es la
// fecha de la resolución; `vigencia` la que autoriza.
//
// `resolucion` es la foto de la resolución con los datos personales tapados
// (apellidos, NIE, nº de expediente, dirección, CSV) y lo importante subrayado.
// Viven en /var/www/inspira-media/resoluciones, fuera del repositorio.
const RESOLUCIONES = "https://www.inspira-legal.cloud/media/resoluciones";
export const CASOS_ESTANCIA = [
  {
    id: "brian-sevilla-2026",
    nombre: "Brian",
    anio: 2026,
    tipo: "inicial",
    oficina: "Sevilla",
    comunidad: "Andalucía",
    universidad: null,
    presentada: "2026-09-08",
    resuelta: "2026-09-10",
    vigencia: { desde: "2026-10-01", hasta: "2027-11-30" },
    resolucion: `${RESOLUCIONES}/brian-2026.jpg`,
  },
  {
    id: "yuri-valencia-2026",
    nombre: "Yuri",
    anio: 2026,
    tipo: "inicial",
    oficina: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Politècnica de València",
    presentada: null,
    resuelta: "2026-07-23",
    resueltaDias: 30,
    vigencia: { desde: "2026-08-01", hasta: "2028-09-15" },
    resolucion: `${RESOLUCIONES}/yuri-2026.jpg`,
  },
  {
    id: "liseth-valencia-2026",
    nombre: "Liseth",
    anio: 2026,
    tipo: "inicial",
    oficina: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Politècnica de València",
    presentada: null,
    resuelta: "2026-07-23",
    resueltaDias: 30,
    vigencia: { desde: "2026-08-01", hasta: "2028-09-15" },
    resolucion: `${RESOLUCIONES}/liseth-2026.jpg`,
  },
  {
    id: "denisse-madrid-2026",
    nombre: "Denisse",
    anio: 2026,
    tipo: "inicial",
    oficina: "Madrid",
    comunidad: "Comunidad de Madrid",
    universidad: "Universidad Rey Juan Carlos",
    presentada: "2026-06-10",
    resuelta: null,
    resueltaDias: 26,
    vigencia: { desde: "2026-06-10", hasta: "2027-09-15" },
    resolucion: `${RESOLUCIONES}/denisse-2026.jpg`,
  },
  {
    id: "jhonatan-alicante-2026",
    nombre: "Jhonatan",
    anio: 2026,
    tipo: "prorroga",
    prorroga: 1,
    oficina: "Alicante",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat d'Alacant",
    presentada: "2026-07-09",
    resuelta: "2026-09-16",
    vigencia: { desde: "2026-07-16", hasta: "2027-07-15" },
    resolucion: `${RESOLUCIONES}/jhonatan-2026.jpg`,
  },
];

export const TIPO_ESTANCIA = {
  inicial: "Autorización inicial",
  prorroga: "Prórroga",
};

const DIA = 86400000;
const fecha = (iso) => (iso ? new Date(`${iso}T00:00:00`) : null);

/**
 * Días entre la presentación y la resolución: los que dicen las dos fechas de
 * la resolución y, si falta una, los que Inspira sabe de su expediente
 * (`resueltaDias`). Sin ninguno de los dos, nada: no se inventa.
 */
export function diasResolucion(c) {
  const a = fecha(c.presentada);
  const b = fecha(c.resuelta);
  if (a && b && b >= a) return Math.round((b - a) / DIA);
  return Number.isFinite(c.resueltaDias) && c.resueltaDias > 0 ? c.resueltaDias : null;
}

/** Meses de vigencia autorizados, redondeados. */
export function mesesVigencia(c) {
  const a = fecha(c.vigencia?.desde);
  const b = fecha(c.vigencia?.hasta);
  if (!a || !b || b < a) return null;
  return Math.round((b - a) / DIA / 30.44);
}

/** Los años con resoluciones, del más reciente al más antiguo. */
export const ANIOS_ESTANCIA = [...new Set(CASOS_ESTANCIA.map((c) => c.anio))].sort((a, b) => b - a);

/** Etiqueta del tipo: «Autorización inicial» o «Prórroga n.º 1». */
export function etiquetaTipo(c) {
  if (c.tipo === "prorroga") return `${TIPO_ESTANCIA.prorroga}${c.prorroga ? ` n.º ${c.prorroga}` : ""}`;
  return TIPO_ESTANCIA[c.tipo] || c.tipo;
}
