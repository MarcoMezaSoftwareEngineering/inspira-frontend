// Navegación principal. El item con `mega: true` despliega el mega-menú de
// servicios (los grupos salen de config/servicios.js); `children` se usa como
// versión compacta en el menú móvil. `externo` abre en pestaña nueva.
import { CALENDLY_URL } from "../../../config/contacto";

export const navItems = [
  {
    label: "Migra a España",
    href: "/servicios",
    mega: true,
    children: [
      { label: "Todos los servicios", href: "/servicios" },
      { label: "Visa de Estudios", href: "/servicios/visa-estudios" },
      { label: "Estancia por Estudios", href: "/servicios/estancia-estudios" },
      { label: "Máster en España (360°)", href: "/servicios/master" },
      { label: "Formación Profesional", href: "/servicios/formacion-profesional" },
      { label: "Nómada Digital · Visado PAC", href: "/servicios#rapidos" },
      { label: "Nacionalidad y arraigos", href: "/servicios#otros-extranjeria" },
      { label: "Trámites en España", href: "/servicios#tramites-espana" },
    ],
  },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Eventos", href: "/eventos" },
  { label: "Tiendita", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Calculadora Gratis", href: "/calculadora-master", badge: true },
  { label: "Agenda tu asesoría", href: CALENDLY_URL, externo: true, cta: true },
];
