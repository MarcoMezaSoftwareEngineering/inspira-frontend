// src/pages/mapa/IconosMapa.jsx
// Los cuatro iconos que esta página necesita y que no están en el juego común
// (components/common/Icono.jsx, que no se toca desde aquí). Mismo dibujo:
// rejilla de 24, trazo 1.7 y `currentColor`, para que no se note el salto de
// un icono a otro dentro de la misma pantalla.
//
// Nacieron el 17/09/2026 al quitar de la página los caracteres sueltos que
// hacían de icono («×», «←», «✓»): cada sistema los dibuja a su manera y en
// móvil se veían de tamaños distintos según la fuente.

const TRAZOS = {
  // Cerrar: la aspa de las hojas, el recomendador y el formulario.
  cerrar: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  // Volver: «Ver toda España» y cualquier vuelta atrás.
  izquierda: (
    <>
      <path d="M10.5 5 3.5 12l7 7" />
      <path d="M3.5 12H20.5" />
    </>
  ),
  // Ajustes: el rótulo de la barra de filtros (deslizadores).
  ajustes: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2.3" />
      <circle cx="10" cy="17" r="2.3" />
    </>
  ),
  // Capas: los interruptores de ciudades y casos sobre el mapa.
  capas: (
    <>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m4.5 12 7.5 4 7.5-4" />
      <path d="m4.5 16.5 7.5 4 7.5-4" />
    </>
  ),
};

export default function IconoMapa({ nombre, size = 20, className = "", strokeWidth = 1.7 }) {
  const d = TRAZOS[nombre];
  if (!d) return null;
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
      {d}
    </svg>
  );
}
