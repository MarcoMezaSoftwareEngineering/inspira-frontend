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
};

export function Icono({ nombre, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {RUTAS[nombre]}
    </svg>
  );
}
