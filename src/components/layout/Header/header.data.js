// Navegación principal. El item con `mega: true` despliega el mega-menú de
// servicios (los grupos salen de config/servicios.js); `children` se usa como
// versión compacta en el menú móvil.
export const navItems = [
  {
    label: "Servicios",
    href: "/servicios",
    mega: true,
    children: [
      { label: "Todos los servicios", href: "/servicios" },
      { label: "Extranjería", href: "/servicios#extranjeria" },
      { label: "Trámites en España", href: "/servicios#tramites-espana" },
      { label: "Asesoría educativa", href: "/servicios#educativa" },
      { label: "Máster en España (360°)", href: "/servicios/master" },
      { label: "Visa y estancia por estudios", href: "/servicios/estancia" },
    ],
  },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Calculadora Gratis", href: "/calculadora-master", badge: true },
  { label: "Reservar cita", href: "/reservar" },
];
