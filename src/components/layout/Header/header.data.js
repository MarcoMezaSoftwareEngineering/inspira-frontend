// Navegación principal.
// `mega: true` despliega el mega-menú completo de servicios.
// `ia` / `badge` se pintan como píldoras destacadas (Asistente IA y
// Calculadora gratis son los dos ganchos gratuitos: deben verse siempre).
// `externo` abre en pestaña nueva.
import { CALENDLY_URL } from "../../../config/contacto";

export const navItems = [
  { label: "Migra a España", href: "/servicios", mega: true },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Nuestro sistema", href: "/plataforma" },
  { label: "Asistente IA", href: "/asistente", ia: true },
  { label: "Calculadora gratis", href: "/calculadora-master", badge: true },
  { label: "Agenda tu asesoría", href: CALENDLY_URL, externo: true, cta: true },
];

// Enlaces secundarios: viven en la barra superior fina, no en la principal.
export const navSecundarios = [
  { label: "Eventos", href: "/eventos" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
];

// El menú móvil lista todo en plano (el catálogo de servicios lo pinta
// MobileMenuNavLinks a partir de config/servicios.js).
export const navItemsMovil = [
  { label: "Asistente IA", href: "/asistente", ia: true },
  { label: "Calculadora gratis", href: "/calculadora-master" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Nuestro sistema", href: "/plataforma" },
  { label: "Eventos", href: "/eventos" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Agenda tu asesoría", href: CALENDLY_URL, externo: true, cta: true },
];
