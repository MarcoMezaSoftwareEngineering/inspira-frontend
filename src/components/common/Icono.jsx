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
};

export default function Icono({ nombre, size = 24, className = "", strokeWidth = 1.7 }) {
  const d = PATHS[nombre];
  if (!d) return null;
  const relleno = nombre === "estrella" || nombre === "destello" || nombre === "avion";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
