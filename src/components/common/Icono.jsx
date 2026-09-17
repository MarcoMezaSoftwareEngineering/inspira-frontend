// src/components/common/Icono.jsx
// Set de iconos SVG propios (trazo, 24x24). Se dibujan con `currentColor`
// para heredar el color del contenedor. Sin dependencias externas.

const PATHS = {
  birrete: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 10v6" />
    </>
  ),
  pasaporte: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2.5" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M9 17h6" />
    </>
  ),
  bandera: (
    <>
      <path d="M4 22V4" />
      <path d="M4 5h13l-2 3.5L17 12H4" />
    </>
  ),
  avion: (
    <>
      <path d="M10.2 13.8 3 12V9.5l2 .6 1.5 1.2 3-.6L6 4.5l2.5.5 4 5 4.6-1c1.3-.3 2.4.3 2.6 1.2.2.9-.5 1.8-1.8 2.2l-4.6 1.3-2 6.3-2.4.5 1.3-6.7Z" />
    </>
  ),
  balanza: (
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M5 7h14" />
      <path d="m5 7-3 6a3 3 0 0 0 6 0L5 7Z" />
      <path d="m19 7-3 6a3 3 0 0 0 6 0l-3-6Z" />
    </>
  ),
  documento: (
    <>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  maletin: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M2 13h20" />
    </>
  ),
  laptop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.2-4A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7M8.5 14.5h4" />
    </>
  ),
  robot: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4M9 4h6" />
      <circle cx="9" cy="14" r="1.2" />
      <circle cx="15" cy="14" r="1.2" />
      <path d="M2 13v3M22 13v3" />
    </>
  ),
  brujula: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  estrella: (
    <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3Z" />
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.4A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  casa: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  euro: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M16 8.5A4.5 4.5 0 0 0 8.6 12a4.5 4.5 0 0 0 7.4 3.5" />
      <path d="M6.5 11h5M6.5 13.5h5" />
    </>
  ),
  libro: (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5V4.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 20.5Z" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="5" width="14" height="14" rx="2.5" />
      <path d="m16 10 6-3v10l-6-3v-4Z" />
    </>
  ),
  huella: (
    <>
      <path d="M12 3a7 7 0 0 1 7 7v2" />
      <path d="M5 12v-2a7 7 0 0 1 3-5.7" />
      <path d="M8.5 12a3.5 3.5 0 0 1 7 0v3" />
      <path d="M12 12v6M15.5 17v2M8.5 13v5" />
    </>
  ),
  mapa: (
    <>
      <path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6l5-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  destello: (
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
  ),
  panel: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
    </>
  ),
  salir: (
    <>
      <path d="M15 3h3.5A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5H15" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),

  // 17/09/2026 · Segunda tanda: los emojis de /enlaces, del mapa y de la beca
  // pasan a ser iconos de trazo. Un emoji lo dibuja cada sistema a su manera
  // (y en Android se ven de otra familia), así que la página cambiaba de
  // aspecto según el móvil. Estos son nuestros y siempre se ven igual.
  salud: (
    <>
      <path d="M12 21s7.5-4 7.5-9.5V5.2L12 2.5 4.5 5.2v6.3C4.5 17 12 21 12 21Z" />
      <path d="M12 8v6M9 11h6" />
    </>
  ),
  senal: (
    <>
      <path d="M4.5 9.5a10.5 10.5 0 0 1 15 0" />
      <path d="M7.7 12.8a6 6 0 0 1 8.6 0" />
      <path d="M10.7 16.1a2 2 0 0 1 2.6 0" />
      <circle cx="12" cy="19.2" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  regalo: (
    <>
      <rect x="3" y="8.5" width="18" height="12.5" rx="2" />
      <path d="M3 13h18M12 8.5V21" />
      <path d="M12 8.5S10.8 3 8 3a2.5 2.5 0 0 0 0 5.5h4Zm0 0S13.2 3 16 3a2.5 2.5 0 0 1 0 5.5h-4Z" />
    </>
  ),
  trofeo: (
    <>
      <path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" />
      <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" />
      <path d="M12 13v4M8.5 21h7M10 21c0-2 .8-4 2-4s2 2 2 4" />
    </>
  ),
  microfono: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3.5M9 21.5h6" />
    </>
  ),
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
      <path d="M12 3c2.5 2.5 3.7 5.5 3.7 9s-1.2 6.5-3.7 9c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z" />
    </>
  ),
  movil: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10.5 5.5h3" />
      <path d="M10 18.5h4" />
    </>
  ),
  maleta: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M9.5 11v5M14.5 11v5" />
      <path d="M7 20v1.5M17 20v1.5" />
    </>
  ),
  campana: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  diana: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  telefono: (
    <path d="M6.2 3h3l1.5 4-2 1.4a12 12 0 0 0 5.9 5.9l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.2 5.2 2 2 0 0 1 6.2 3Z" />
  ),
  "usuario-mas": (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M2.5 21c0-4 3.4-6.5 7.5-6.5 1 0 2 .15 2.9.45" />
      <path d="M17.5 14.5v6M14.5 17.5h6" />
    </>
  ),
  copiar: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </>
  ),
  rayo: (
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
  ),
  paquete: (
    <>
      <path d="m12 2.5 8.5 4.3v9.9L12 21.5l-8.5-4.8V6.8L12 2.5Z" />
      <path d="M3.5 6.8 12 11.4l8.5-4.6M12 11.4v10.1" />
    </>
  ),
  llama: (
    <path d="M12 2s.8 3.2-1.6 5.4C8 9.6 6 11.4 6 14.3A6 6 0 0 0 18 14.3c0-2.6-1.4-4.2-2.6-6-.6 1.2-1.5 1.8-2.3 1.8 1-2.6.6-5.6-1.1-8.1Z" />
  ),
  whatsapp: (
    <path d="M16.04 3C8.86 3 3.04 8.8 3.04 15.96c0 2.29.6 4.52 1.74 6.49L3 29l6.72-1.76a13 13 0 0 0 6.32 1.61h.01c7.17 0 13-5.8 13-12.96C29.05 8.8 23.22 3 16.04 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-3.99 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.65-5.73c0-5.95 4.85-10.79 10.83-10.79 5.97 0 10.82 4.84 10.82 10.79 0 5.95-4.85 10.7-10.91 10.7Zm5.94-8.05c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.28-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.86-1.63-1.93-1.82-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.27-.63-.54-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.14 1.33 3.36.16.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38Z" />
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.3 4.3" />
    </>
  ),
  grafico: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12.5 16V8M17 16v-6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.6 2.6 5-5.2" />
    </>
  ),
  candado: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10.2" r="2.7" />
    </>
  ),
  toque: (
    <>
      <path d="M9 11V5.5a2 2 0 0 1 4 0V12" />
      <path d="M13 9.5a1.8 1.8 0 0 1 3.6 0v1.2" />
      <path d="M16.6 10.8a1.8 1.8 0 0 1 3.4.8v3.1c0 3.3-2.6 6.3-6 6.3-2.6 0-4.3-1.2-5.6-3.3L5 12.8a1.8 1.8 0 0 1 3-2l1 1.4" />
    </>
  ),
  descarga: (
    <>
      <path d="M12 3v11" />
      <path d="m7.5 10 4.5 4.5L16.5 10" />
      <path d="M4 17.5v1A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-1" />
    </>
  ),
  flecha: (
    <path d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
  ),
};

// Los que se dibujan macizos: una silueta llena pesa más que su contorno y esos
// iconos son el acento, no el texto.
const RELLENOS = new Set(["estrella", "destello", "avion", "rayo", "llama", "whatsapp", "telefono"]);

export default function Icono({ nombre, size = 24, className = "", strokeWidth = 1.7 }) {
  const d = PATHS[nombre];
  if (!d) return null;
  const relleno = RELLENOS.has(nombre);
  // El de WhatsApp viene de la marca y se dibujó en una rejilla de 32.
  const caja = nombre === "whatsapp" ? "0 0 32 32" : "0 0 24 24";

  return (
    <svg
      width={size}
      height={size}
      viewBox={caja}
      fill={relleno ? "currentColor" : "none"}
      stroke={relleno ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {d}
    </svg>
  );
}
