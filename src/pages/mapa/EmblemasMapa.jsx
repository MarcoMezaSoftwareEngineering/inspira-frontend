// src/pages/mapa/EmblemasMapa.jsx
//
// Emblemas de sección: el icono de cada bloque, pero dibujado en dos tonos y
// con su propia forma de fondo, en vez del icono de línea de 14 px que se
// perdía al lado de un titular. Es lo que hace que un índice de secciones se
// recorra con la vista.
//
// Tres capas fijas, siempre las mismas, para que los seis se lean como una
// familia: fondo en Cielo claro, dibujo en Petróleo y un solo acento en Sol.
// Nada de PNG: a este tamaño un mapa de bits se ve sucio en cualquier móvil
// moderno, y un SVG pesa diez veces menos.
const FONDO = "#E6F2FE";
const TRAZO = "#0A5873";
const ACENTO = "#F09C48";

const DIBUJOS = {
  // Explorar el mapa: hoja plegada y una chincheta.
  mapa: (
    <>
      <path d="M11 13.5 17 11l6 2.5 6-2.5v15l-6 2.5-6-2.5-6 2.5v-15z" />
      <path d="M17 11v15M23 13.5v15" />
    </>
  ),
  // Buscar y filtrar: embudo con su mando.
  filtros: (
    <>
      <path d="M11 12h18l-7 8v8l-4 2v-10z" />
      <path d="M13 26h5" />
    </>
  ),
  // Cómo leer el mapa: brújula.
  leyenda: (
    <>
      <circle cx="20" cy="20" r="9" />
      <path d="m24 16-2.4 5.6L16 24l2.4-5.6z" />
    </>
  ),
  // Dónde se estudia: perfil de ciudad.
  ciudades: (
    <>
      <path d="M10 29h20" />
      <path d="M13 29V19h6v10M22 29V15h6v14" />
      <path d="M15 22h2M15 25h2M24 19h2M24 23h2" />
    </>
  ),
  // Comparar: dos columnas de distinta altura.
  comparar: (
    <>
      <path d="M11 29h18" />
      <path d="M15 29V16h4v13M23 29v-8h4v8" />
    </>
  ),
  // En texto: documento con sus líneas.
  listas: (
    <>
      <path d="M13 10h10l5 5v15H13z" />
      <path d="M23 10v5h5" />
      <path d="M16 21h8M16 25h6" />
    </>
  ),
  // De dónde salen las cifras: libro abierto.
  fuentes: (
    <>
      <path d="M10 13c4-1.5 7-1.5 10 1 3-2.5 6-2.5 10-1v14c-4-1.5-7-1.5-10 1-3-2.5-6-2.5-10-1z" />
      <path d="M20 14v15" />
    </>
  ),
  // Confianza: escudo con el visto.
  sello: (
    <>
      <path d="M20 10.5 29 14v6c0 5-4 8.5-9 10-5-1.5-9-5-9-10v-6z" />
      <path d="m16.5 20 2.6 2.6 5-5.2" />
    </>
  ),
};

/** El acento en Sol de cada emblema: uno por dibujo, nunca dos. */
const ACENTOS = {
  mapa: <circle cx="23" cy="18" r="2.6" />,
  filtros: <circle cx="21" cy="26" r="2.6" />,
  leyenda: <circle cx="20" cy="20" r="2" />,
  ciudades: <circle cx="28.5" cy="12" r="2.6" />,
  comparar: <rect x="15" y="12" width="4" height="3" rx="1.2" />,
  listas: <circle cx="27" cy="27" r="2.6" />,
  fuentes: <circle cx="20" cy="11.5" r="2.4" />,
  sello: <circle cx="28.5" cy="12.5" r="2.4" />,
};

export default function EmblemaSeccion({ nombre, size = 40, className = "" }) {
  const d = DIBUJOS[nombre];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`mapa-emblema ${className}`}
    >
      <rect width="40" height="40" rx="13" fill={FONDO} />
      <g stroke={TRAZO} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {d}
      </g>
      <g fill={ACENTO}>{ACENTOS[nombre]}</g>
    </svg>
  );
}
