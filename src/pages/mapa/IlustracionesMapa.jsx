// src/pages/mapa/IlustracionesMapa.jsx
// Ilustraciones propias de las ciudades españolas donde se estudia, en el
// lenguaje del kit de marca: silueta plana en Noche sobre el cielo de la
// marca, sol y luces en Sol, lejanía en Cielo.
//
// Por qué dibujadas y no fotos: la web no tiene fotos con licencia de ninguna
// ciudad española, y una foto de banco de imágenes rompería la identidad de
// las demás piezas (el mapa, la beca, /enlaces son todas de trazo plano).
// Estas siluetas se sirven con la página, pesan unos cientos de bytes y se
// adaptan a cualquier tamaño sin pedir nada más al servidor.
//
// Cada ilustración tiene tres capas, y en escritorio cada una se mueve a
// distinta velocidad al pasar el puntero (parallax): lejanía, silueta y
// primer plano. Con prefers-reduced-motion se quedan quietas.
//
// Las claves son el id público de la ciudad (slug del nombre, el mismo que
// usa GET /api/mapa). Una ciudad sin dibujo propio cae en CAMPUS, que es un
// edificio universitario genérico: nunca se queda un hueco.
import { useId } from "react";

const NOCHE = "#003648";
const PETROLEO = "#0A5873";
const CIELO = "#96CCFC";
const SOL = "#F09C48";

/* Sierra de fondo, compartida por casi todas: da profundidad sin competir. */
const SIERRA = "M0 92 L26 70 L44 80 L70 58 L96 78 L120 64 L148 82 L172 68 L200 88 V112 H0 Z";
const COSTA = "M0 92 Q40 84 78 90 T148 88 T200 92 V112 H0 Z";
const LOMA = "M0 92 L34 76 L62 86 L100 72 L134 84 L168 74 L200 86 V112 H0 Z";

/**
 * Una ciudad = lejanía (opcional), silueta y detalles en color de acento.
 * Todo se dibuja sobre un suelo en y = 92, en un lienzo de 200 × 112.
 */
const CIUDADES = {
  // Puerta de Alcalá, Cibeles y las torres del norte.
  madrid: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M150 92V44h9v48zM163 92V52h8v40zM176 92V38h7v54zM190 92V56h8v36z" />
        <path d="M18 92V64h34v28zM30 92V48h10v44z" />
        <path d="M35 48l-5-9-5 9z" />
        <path d="M62 92V58h76v34zM58 58h84v-5H58zM88 53V44h24v9z" />
      </>
    ),
    detalles: (
      <>
        <path d="M87 92V73a13 13 0 0126 0v19h-6V74a7 7 0 00-14 0v18z" opacity=".55" />
        <path d="M69 92V79a6 6 0 0112 0v13h-4V80a2 2 0 00-4 0v12zM119 92V79a6 6 0 0112 0v13h-4V80a2 2 0 00-4 0v12z" opacity=".55" />
      </>
    ),
    luces: [
      [152, 52],
      [156, 62],
      [165, 60],
      [178, 48],
      [181, 62],
      [192, 64],
      [22, 72],
      [44, 72],
    ],
  },

  // Sagrada Familia y la torre Agbar junto al mar.
  barcelona: {
    lejos: COSTA,
    silueta: (
      <>
        <path d="M71 92V54l8-20 8 20v38zM89 92V46l9-22 9 22v46zM109 92V50l8-18 8 18v42zM125 92V58l6-14 6 14v34z" />
        <path d="M66 92V64h74v28z" />
        <path d="M156 92V52c0-7 4-12 8-12s8 5 8 12v40z" />
        <path d="M22 92V72h26v20zM52 92V78h10v14z" />
      </>
    ),
    detalles: (
      <>
        <path d="M94 92V72a3 3 0 016 0v20z" opacity=".5" />
        <path d="M158 56h12v3h-12zM158 64h12v3h-12zM158 72h12v3h-12z" opacity=".5" />
      </>
    ),
    luces: [
      [79, 40],
      [97, 28],
      [116, 34],
      [130, 46],
      [164, 46],
    ],
  },

  // Ciudad de las Artes: las cáscaras junto al agua y el Micalet.
  valencia: {
    lejos: COSTA,
    silueta: (
      <>
        <path d="M36 92V46h16v46zM34 46h20l-10-10z" />
        <path d="M70 92c0-16 13-28 30-28s30 12 30 28z" />
        <path d="M140 92c0-11 9-20 21-20s21 9 21 20z" />
        <path d="M60 92h128v4H60z" />
      </>
    ),
    detalles: (
      <>
        <path d="M78 92c0-11 10-19 22-19s22 8 22 19h-5c0-8-8-14-17-14s-17 6-17 14z" opacity=".45" />
        <path d="M100 66v26M88 70v22M112 70v22" stroke="currentColor" strokeWidth="2.4" fill="none" opacity=".4" />
        <path d="M40 54h8v8h-8z" opacity=".5" />
      </>
    ),
    luces: [
      [88, 74],
      [110, 74],
      [158, 80],
    ],
  },

  // La Giralda y las cúpulas de la Plaza de España.
  sevilla: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M86 92V34h22v58zM88 34V24h18v10zM88 24l9-10 9 10z" />
        <path d="M120 92V62h46v30zM136 62V50h14v12zM143 44l-9 6h18z" />
        <path d="M28 92V70h40v22zM44 70V60h10v10z" />
      </>
    ),
    detalles: (
      <>
        <path d="M90 44h6v14h-6zM98 44h6v14h-6z" opacity=".5" />
        <path d="M126 74h8v18h-8zM152 74h8v18h-8z" opacity=".45" />
        <circle cx="49" cy="56" r="4" opacity=".5" />
      </>
    ),
    luces: [
      [97, 30],
      [143, 56],
      [49, 66],
    ],
  },

  // La Alhambra con Sierra Nevada detrás.
  granada: {
    lejos: "M0 92 L30 56 L52 72 L84 40 L118 70 L146 52 L176 74 L200 62 V112 H0 Z",
    silueta: (
      <>
        <path d="M40 92V66h120v26z" />
        <path d="M44 66V52h20v14zM92 66V46h22v20zM136 66V56h18v10z" />
        <path d="M44 52h4v-6h4v6h4v-6h4v6h4M92 46h5v-6h5v6h5v-6h5v6h2" fill="none" stroke="currentColor" strokeWidth="3" />
      </>
    ),
    detalles: (
      <>
        <path d="M98 92V76a5 5 0 0110 0v16z" opacity=".5" />
        <path d="M60 78h8v14h-8zM124 78h8v14h-8z" opacity=".4" />
      </>
    ),
    luces: [
      [103, 52],
      [52, 58],
      [144, 60],
    ],
  },

  // Guggenheim, el puente y la ría.
  bilbao: {
    lejos: SIERRA,
    silueta: (
      <>
        <path d="M44 92V72l16-6v26zM62 92V60l14-10v42zM78 92V48l16 10v34zM96 92V58l14 8v26zM112 92V70l14-4v26z" />
        <path d="M78 48l16 10-16 6z" />
        <path d="M140 92V58h8v34zM168 92V58h8v34z" />
        <path d="M136 58h44v5h-44z" />
        <path d="M144 58c8-10 24-10 32 0" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20 92V74h18v18z" />
      </>
    ),
    detalles: (
      <>
        <path d="M66 76h6v16h-6zM82 64h7v28h-7zM100 74h6v18h-6z" opacity=".45" />
        <path d="M0 96h200v4H0z" opacity=".25" />
      </>
    ),
    luces: [
      [86, 60],
      [144, 66],
      [172, 66],
    ],
  },

  // Las torres de la catedral y la Casa de las Conchas.
  salamanca: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M62 92V40h20v52zM64 40V30h16v10zM72 30l-8-7h16z" />
        <path d="M86 92V56h44v36z" />
        <path d="M108 56c0-12-8-18-8-18s-8 6-8 18z" />
        <path d="M108 38a8 8 0 00-16 0z" />
        <path d="M134 92V48h16v44zM136 48V40h12v8z" />
        <path d="M24 92V72h30v20z" />
      </>
    ),
    detalles: (
      <>
        <path d="M100 92V74a5 5 0 0110 0v18z" opacity=".5" />
        <path d="M66 48h5v12h-5zM73 48h5v12h-5zM138 56h8v14h-8z" opacity=".45" />
      </>
    ),
    luces: [
      [72, 36],
      [100, 46],
      [142, 44],
    ],
  },

  // El Obradoiro: dos torres gemelas y la escalinata.
  "santiago-de-compostela": {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M60 92V44h20v48zM120 92V44h20v48z" />
        <path d="M62 44V32h16v12zM122 44V32h16v12zM62 32l8-10 8 10zM122 32l8-10 8 10z" />
        <path d="M84 92V58h32v34zM82 58l18-14 18 14z" />
        <path d="M78 96h44v4H78zM70 102h60v4H70z" />
      </>
    ),
    detalles: (
      <>
        <path d="M94 92V72a6 6 0 0112 0v20z" opacity=".5" />
        <path d="M64 52h5v14h-5zM71 52h5v14h-5zM124 52h5v14h-5zM131 52h5v14h-5z" opacity=".45" />
      </>
    ),
    luces: [
      [70, 38],
      [130, 38],
      [100, 50],
    ],
  },

  // La basílica del Pilar sobre el Ebro.
  zaragoza: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M48 92V52h104v40z" />
        <path d="M50 92V38h12v54zM138 92V38h12v54zM78 92V44h10v48zM112 92V44h10v48z" />
        <path d="M56 38l-6-8h12zM144 38l-6-8h12zM83 44l-5-7h10zM117 44l-5-7h10z" />
        <path d="M100 52c-9 0-15 8-15 16h30c0-8-6-16-15-16z" />
        <path d="M100 30l-6 8h12z" />
      </>
    ),
    detalles: (
      <>
        <path d="M95 92V76a5 5 0 0110 0v16z" opacity=".5" />
        <path d="M0 98h200v6H0z" opacity=".22" />
      </>
    ),
    luces: [
      [56, 44],
      [144, 44],
      [100, 40],
    ],
  },

  // Catedral, faro y palmeras del puerto.
  malaga: {
    lejos: COSTA,
    silueta: (
      <>
        <path d="M70 92V52h44v40zM74 92V34h14v58z" />
        <path d="M81 34l-7-8h14z" />
        <path d="M92 52c0-10-6-14-6-14s-6 4-6 14z" />
        <path d="M156 92V56h8v36zM154 56h12v4h-12z" />
        <path d="M30 92V78h4v14z" />
        <path d="M32 78c-7-5-12-3-13 2 4-3 8-3 13 1zM32 78c7-5 12-3 13 2-4-3-8-3-13 1z" />
      </>
    ),
    detalles: (
      <>
        <path d="M95 92V74a5 5 0 0110 0v18z" opacity=".5" />
        <path d="M76 44h5v12h-5z" opacity=".45" />
        <circle cx="160" cy="50" r="4" opacity=".6" />
      </>
    ),
    luces: [
      [81, 40],
      [160, 50],
    ],
  },

  // El castillo de Santa Bárbara sobre el Benacantil.
  alicante: {
    lejos: COSTA,
    silueta: (
      <>
        <path d="M58 92l14-40 12-18 14 18 12 40z" />
        <path d="M80 40V26h20v14z" />
        <path d="M80 26h4v-5h4v5h4v-5h4v5h4" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M130 92V70h40v22zM24 92V76h24v16z" />
        <path d="M118 92V80h4v12z" />
        <path d="M120 80c-7-5-12-3-13 2 4-3 8-3 13 1zM120 80c7-5 12-3 13 2-4-3-8-3-13 1z" />
      </>
    ),
    detalles: (
      <>
        <path d="M86 40h8v10h-8z" opacity=".5" />
        <path d="M138 78h8v14h-8zM154 78h8v14h-8z" opacity=".4" />
        <path d="M0 100h200v4H0z" opacity=".22" />
      </>
    ),
    luces: [
      [90, 32],
      [142, 74],
    ],
  },

  // La Mezquita: arcos y el campanario.
  cordoba: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M44 92V60h112v32z" />
        <path d="M96 92V36h20v56zM99 36V28h14v8zM106 28l-7-7h14z" />
        <path d="M40 60h120v5H40z" />
        <path d="M24 92V74h16v18z" />
      </>
    ),
    detalles: (
      <>
        <path d="M52 92V76a8 8 0 0116 0v16h-5V77a3 3 0 00-6 0v15zM72 92V76a8 8 0 0116 0v16h-5V77a3 3 0 00-6 0v15zM124 92V76a8 8 0 0116 0v16h-5V77a3 3 0 00-6 0v15z" opacity=".5" />
        <path d="M102 46h8v12h-8z" opacity=".45" />
      </>
    ),
    luces: [
      [106, 34],
      [60, 68],
      [132, 68],
    ],
  },

  // Edificio universitario clásico: el que se usa cuando no hay dibujo propio.
  CAMPUS: {
    lejos: LOMA,
    silueta: (
      <>
        <path d="M46 92V56h108v36z" />
        <path d="M40 56 100 28l60 28z" />
        <path d="M96 28V16h8v12z" />
        <path d="M100 8l-8 8h16z" />
        <path d="M30 92V72h14v20zM156 92V72h14v20z" />
      </>
    ),
    detalles: (
      <>
        <path d="M60 92V64h8v28zM80 92V64h8v28zM112 92V64h8v28zM132 92V64h8v28z" opacity=".45" />
        <path d="M94 92V72a6 6 0 0112 0v20z" opacity=".55" />
      </>
    ),
    luces: [
      [100, 20],
      [36, 78],
      [163, 78],
    ],
  },
};

export const hayIlustracion = (id) => Object.hasOwn(CIUDADES, id);

/**
 * Ilustración de una ciudad en el lienzo de 200 × 112.
 *
 * - `ciudad`: id público de la ciudad; sin dibujo propio se usa el campus.
 * - `className`: se aplica al <svg> (alto y bordes los pone quien la usa).
 * - `quieta`: sin el flotar del sol ni el titileo de las luces.
 */
export default function IlustracionCiudad({ ciudad, className = "", quieta = false }) {
  const uid = useId().replace(/:/g, "");
  const d = CIUDADES[ciudad] || CIUDADES.CAMPUS;
  const cielo = `cielo-${uid}`;
  const suelo = `suelo-${uid}`;

  return (
    <svg
      viewBox="0 0 200 112"
      preserveAspectRatio="xMidYMax slice"
      className={`mapa-ilustracion ${quieta ? "" : "mapa-ilustracion-viva"} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={cielo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6FBFF" />
          <stop offset="55%" stopColor="#DCEDFE" />
          <stop offset="100%" stopColor="#C2E0FC" />
        </linearGradient>
        <linearGradient id={suelo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NOCHE} />
          <stop offset="100%" stopColor={PETROLEO} />
        </linearGradient>
      </defs>

      <rect width="200" height="112" fill={`url(#${cielo})`} />

      {/* Sol de la marca, que sube y baja despacio */}
      <g className="mapa-ilus-sol">
        <circle cx="168" cy="26" r="13" fill={SOL} opacity=".28" />
        <circle cx="168" cy="26" r="8" fill={SOL} />
      </g>

      {/* Nubes: la capa que más se mueve con el puntero */}
      <g className="mapa-ilus-nubes" fill="#FFFFFF" opacity=".75">
        <path d="M22 26a7 7 0 0114 0 6 6 0 011 12H24a6 6 0 01-2-12z" />
        <path d="M96 16a5 5 0 0110 0 4 4 0 011 9H98a4 4 0 01-2-9z" />
      </g>

      {/* Lejanía */}
      {d.lejos && <path className="mapa-ilus-lejos" d={d.lejos} fill={CIELO} opacity=".5" />}

      {/* Silueta y detalles */}
      <g className="mapa-ilus-silueta">
        <g fill={`url(#${suelo})`}>{d.silueta}</g>
        <g fill={CIELO} color={CIELO} stroke="none">
          {d.detalles}
        </g>
        <g className="mapa-ilus-luces" fill={SOL}>
          {(d.luces || []).map(([x, y], i) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" style={{ animationDelay: `${i * 420}ms` }} />
          ))}
        </g>
      </g>

      <rect y="92" width="200" height="20" fill={NOCHE} />
    </svg>
  );
}
