// src/pages/reservar/iconos.jsx
// Iconos de trazo de la página de reservas (heredan el color del texto).
const RUTAS = {
  video: <path d="M15 10l4.5-3v10L15 14M5 7h8a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />,
  oficina: <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2M3 21h18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  escudo: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  campana: <path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20a2 2 0 004 0" />,
  ciclo: <path d="M4 12a8 8 0 0113.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.6L4 16M4 20v-4h4" />,
  reloj: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  whatsapp: <path d="M20 12a8 8 0 01-11.9 7L4 20l1.1-4A8 8 0 1120 12z" />,
  rayo: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  sobre: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />,
  usuario: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  gorro: <path d="M2 9l10-5 10 5-10 5-10-5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" />,
  medalla: <path d="M12 14a5 5 0 100-10 5 5 0 000 10zM8.5 13.5L7 21l5-3 5 3-1.5-7.5" />,
  pasaporte: <path d="M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM12 8a3 3 0 100 6 3 3 0 000-6zM9 17.5h6" />,
  globo: <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" />,
  balanza: <path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 006 0L5 7zM19 7l-3 7a3 3 0 006 0l-3-7z" />,
  estrella: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
  corazon: <path d="M12 20s-7-4.4-9-9.2C1.8 7.3 4 4 7.2 4c1.8 0 3.2.9 4.8 3 1.6-2.1 3-3 4.8-3C20 4 22.2 7.3 21 10.8 19 15.600 12 20 12 20z" />,
};

export function Icono({ nombre, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {RUTAS[nombre]}
    </svg>
  );
}
