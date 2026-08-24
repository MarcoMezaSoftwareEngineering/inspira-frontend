// Navegación principal.
// `mega: true` despliega el mega-menú completo de servicios.
// `submenu` despliega un desplegable simple (Recursos).
// `children` es la versión que usa el menú móvil.
// `externo` abre en pestaña nueva.
import { CALENDLY_URL } from "../../../config/contacto";

export const navItems = [
  {
    label: "Migra a España",
    href: "/servicios",
    mega: true,
  },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Eventos", href: "/eventos" },
  {
    label: "Recursos",
    href: "/asistente",
    submenu: [
      { label: "Asistente IA", href: "/asistente", icono: "robot" },
      { label: "Calculadora gratis", href: "/calculadora-master", icono: "euro" },
      { label: "Tiendita", href: "/tienda", icono: "libro" },
      { label: "Blog", href: "/blog", icono: "documento" },
    ],
  },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Agenda tu asesoría", href: CALENDLY_URL, externo: true, cta: true },
];

// El menú móvil lista todo en plano (el catálogo de servicios lo pinta
// MobileMenuNavLinks a partir de config/servicios.js).
export const navItemsMovil = [
  { label: "Asistente IA", href: "/asistente", ia: true },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Eventos", href: "/eventos" },
  { label: "Calculadora gratis", href: "/calculadora-master" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Agenda tu asesoría", href: CALENDLY_URL, externo: true, cta: true },
];
