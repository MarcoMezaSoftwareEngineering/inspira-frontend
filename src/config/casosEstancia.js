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
// «resuelta en N días», y un número inventado aquí sería una mentira en la
// web. `resuelta` es la fecha de la resolución; `vigencia` la que autoriza.
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
    vigencia: { desde: "2026-08-01", hasta: "2028-09-15" },
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
    vigencia: { desde: "2026-08-01", hasta: "2028-09-15" },
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
    vigencia: { desde: "2026-06-10", hasta: "2027-09-15" },
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
  },
];

export const TIPO_ESTANCIA = {
  inicial: "Autorización inicial",
  prorroga: "Prórroga",
};

const DIA = 86400000;
const fecha = (iso) => (iso ? new Date(`${iso}T00:00:00`) : null);

/** Días entre la presentación y la resolución, si la resolución dice las dos. */
export function diasResolucion(c) {
  const a = fecha(c.presentada);
  const b = fecha(c.resuelta);
  if (!a || !b || b < a) return null;
  return Math.round((b - a) / DIA);
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
