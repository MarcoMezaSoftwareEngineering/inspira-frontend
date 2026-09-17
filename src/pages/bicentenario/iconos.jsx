// src/pages/bicentenario/iconos.jsx
//
// Iconos de la página de la beca. 17/09/2026: la clienta pidió iconos propios
// en vez de emojis («con iconos, mejóralo»), y los emojis además se ven
// distintos en cada sistema (en Windows salían planos y descolocados).
//
// Primero se busca en el juego común (components/common/Icono); lo que allí no
// existe se dibuja aquí con la misma receta: rejilla de 24, trazo 1.7,
// currentColor y sin relleno, para que un icono prestado y uno propio no se
// distingan al ponerlos juntos.
import Icono from "../../components/common/Icono";

const PROPIOS = {
  // Cifras y comparación
  "tendencia-baja": (
    <>
      <path d="M3 7.5l6 6 3.5-3.5L21 17" />
      <path d="M21 11.5V17h-5.5" />
    </>
  ),
  intercambio: (
    <>
      <path d="M3.5 8.5h16l-4-4" />
      <path d="M20.5 15.5h-16l4 4" />
    </>
  ),
  tijeras: (
    <>
      <circle cx="6.5" cy="6.5" r="2.6" />
      <circle cx="6.5" cy="17.5" r="2.6" />
      <path d="M8.7 8 19 18.5" />
      <path d="M8.7 16 19 5.5" />
    </>
  ),
  igual: <path d="M5 9.5h14M5 14.5h14" />,
  calculadora: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.6" />
      <path d="M8 6.8h8" />
      <path d="M8.6 11.4h.01M12 11.4h.01M15.4 11.4h.01M8.6 14.8h.01M12 14.8h.01M15.4 14.8h.01M8.6 18.2h.01M12 18.2h3.4" />
    </>
  ),
  billete: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),

  // Documentos y trámite
  portapapeles: (
    <>
      <path d="M9.2 3.2h5.6v3.2H9.2z" />
      <path d="M14.8 4.8h2.7A1.5 1.5 0 0 1 19 6.3v13.4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.7V6.3a1.5 1.5 0 0 1 1.5-1.5h2.7" />
      <path d="m8.8 12.2 1.6 1.6 3.2-3.2" />
      <path d="M8.8 17.2h6.4" />
    </>
  ),
  sobre: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.4" />
      <path d="m3.8 7.2 7.1 5.1a2 2 0 0 0 2.2 0l7.1-5.1" />
    </>
  ),
  lapiz: (
    <>
      <path d="M4 20h4L20.1 7.9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z" />
      <path d="m14.6 6.4 3.5 3.5" />
    </>
  ),
  firma: (
    <>
      <path d="M3 17.5c2.8 0 3.4-9 6.3-9s2.2 7 4.6 7c1.4 0 2.3-2 3.6-2" />
      <path d="M4 21h16" />
    </>
  ),
  herramienta: (
    <>
      <path d="M17.6 4.2a4.6 4.6 0 0 0-5.5 6L5 17.3a2 2 0 0 0 2.8 2.8l7.1-7.1a4.6 4.6 0 0 0 6-5.5l-2.8 2.8-2.3-2.3z" />
    </>
  ),
  carpeta: (
    <>
      <path d="M3 7.6a2 2 0 0 1 2-2h3.6a2 2 0 0 1 1.6.8l.9 1.2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  periodico: (
    <>
      <rect x="2.8" y="5.5" width="14.2" height="14" rx="2" />
      <path d="M17 8.6h2.2A1.8 1.8 0 0 1 21 10.4v7.3a1.8 1.8 0 0 1-1.8 1.8" />
      <path d="M6.2 9.2h7.4M6.2 12.5h7.4M6.2 15.8h4.4" />
    </>
  ),

  // Estados y avisos
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6v.01" />
    </>
  ),
  pregunta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.6a2.5 2.5 0 0 1 4.9.6c0 1.7-2.4 2.1-2.4 3.8" />
      <path d="M12 17.4v.01" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 4.2 2.9 19.6h18.2z" />
      <path d="M12 10.2v4M12 17.2v.01" />
    </>
  ),
  prohibido: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.8 18.2 12.4-12.4" />
    </>
  ),
  puerta: (
    <>
      <path d="M5.5 21V4.2a1.2 1.2 0 0 1 1.2-1.2h10.6a1.2 1.2 0 0 1 1.2 1.2V21" />
      <path d="M3 21h18" />
      <path d="M14.5 12.2v.01" />
    </>
  ),

  // Perfil y destino
  institucion: (
    <>
      <path d="m3 9.6 9-5.6 9 5.6" />
      <path d="M5.4 10.6v8M9.8 10.6v8M14.2 10.6v8M18.6 10.6v8" />
      <path d="M2.8 21h18.4" />
    </>
  ),
  escuela: (
    <>
      <path d="M4 21V10l8-5.6 8 5.6v11" />
      <path d="M2.5 21h19" />
      <path d="M10 21v-5h4v5" />
      <path d="M12 4.4V2.2" />
    </>
  ),
  microscopio: (
    <>
      <path d="M11 3.6h3.1l1 7.2h-5.1z" />
      <path d="M8.4 10.8h8.3" />
      <path d="M5.2 21h14.4" />
      <path d="M8.6 21a5.4 5.4 0 0 0 8.4-4.5" />
      <path d="M4.6 14.8h3.2" />
    </>
  ),
  medalla: (
    <>
      <circle cx="12" cy="15.2" r="5.8" />
      <path d="M8.8 10 6.2 3.4h3.9l2.3 5" />
      <path d="m15.2 10 2.6-6.6h-3.9" />
      <path d="m12 12.6 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3z" />
    </>
  ),
  manos: (
    <>
      <path d="m3.8 11.6 3.1-3a2 2 0 0 1 2.8 0L12 10.8l2.3-2.2a2 2 0 0 1 2.8 0l3.1 3" />
      <path d="M3.8 11.6V16a5 5 0 0 0 5 5h6.4a5 5 0 0 0 5-5v-4.4" />
    </>
  ),
  bus: (
    <>
      <rect x="3" y="4" width="18" height="12.4" rx="2.4" />
      <path d="M3 10.6h18" />
      <path d="M7 20.4v-4M17 20.4v-4" />
      <path d="M7 13.6h.01M17 13.6h.01" />
    </>
  ),
  cohete: (
    <>
      <path d="M12 3c3 2.4 4.6 5.6 4.6 9.2L14.6 16H9.4l-2-3.8C7.4 8.6 9 5.4 12 3Z" />
      <circle cx="12" cy="10" r="1.7" />
      <path d="m9.4 16-2.6 2.6L8.4 21M14.6 16l2.6 2.6L15.6 21" />
    </>
  ),
  brote: (
    <>
      <path d="M12 21v-6.6" />
      <path d="M12 14.4C8.9 14.4 6 12.8 6 9.2c3.4 0 6 1.9 6 5.2Z" />
      <path d="M12 13c0-3.3 2.8-5.6 6.2-5.6 0 3.6-3.1 5.6-6.2 5.6Z" />
    </>
  ),
  fiesta: (
    <>
      <path d="M3.6 20.8 8.4 7.6l8 8z" />
      <path d="M14.4 3.4v2.2M19.2 4.6l-1.6 1.6M20.6 10.4h-2.2M18.4 8.4l1.6 1.6" />
    </>
  ),

  // Redes y enlaces
  enlace: (
    <>
      <path d="M10.4 13.6a3.7 3.7 0 0 0 5.4.3l2.6-2.6a3.7 3.7 0 0 0-5.2-5.2l-1.5 1.5" />
      <path d="M13.6 10.4a3.7 3.7 0 0 0-5.4-.3l-2.6 2.6a3.7 3.7 0 0 0 5.2 5.2l1.5-1.5" />
    </>
  ),
  tiktok: (
    <>
      <circle cx="8.6" cy="16.4" r="3.5" />
      <path d="M12.1 16.4V3.6c.8 2.9 2.7 4.4 5.4 4.6" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.9 7.1h.01" />
    </>
  ),
  facebook: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <path d="M15 8.2h-1.4c-1.1 0-1.8.7-1.8 1.8V21" />
      <path d="M9.6 12.6h4.6" />
    </>
  ),
  recargar: (
    <>
      <path d="M20.4 11.4A8.4 8.4 0 1 0 18.6 17" />
      <path d="M20.6 5.6v6h-6" />
    </>
  ),
};

/**
 * Icono de la página: primero el juego común, si no el dibujo propio.
 * `nombre` desconocido devuelve null (igual que el juego común).
 */
export default function IconoBic({ nombre, size = 20, className = "", strokeWidth = 1.7 }) {
  const propio = PROPIOS[nombre];
  if (!propio) return <Icono nombre={nombre} size={size} className={className} strokeWidth={strokeWidth} />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {propio}
    </svg>
  );
}
