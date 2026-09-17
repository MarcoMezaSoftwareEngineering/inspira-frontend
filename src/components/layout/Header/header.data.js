// Navegación de la web pública (reducción aprobada por el cliente, 14/09/2026).
//
// Cabecera: cinco entradas. `mega: true` despliega el catálogo completo, que
// lleva además el grupo «Herramientas gratis» (asistente y calculadora; antes
// eran dos píldoras sueltas en la barra). `externo` abre en pestaña nueva y
// `cta` lo pinta como botón.
//
// Reservar la sesión diagnóstico tiene un solo destino en toda la web:
// CALENDLY_URL (ver config/contacto.js).
import { CALENDLY_URL } from "../../../config/contacto";
import { MENU_ETIQUETA } from "../../../config/portalMarca";

export const RESERVAR_ETIQUETA = "Reserva tu sesión";

export const navItems = [
  { label: "Servicios", href: "/servicios", mega: true },
  { label: "Paquete Máster 2027", href: "/servicios/master" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: MENU_ETIQUETA, href: "/plataforma" },
  { label: RESERVAR_ETIQUETA, href: CALENDLY_URL, externo: true, cta: true },
];

// Barra fina de arriba. «Nosotros» vive solo en el pie.
export const navSecundarios = [
  { label: "Eventos", href: "/eventos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Blog", href: "/blog" },
];

// Las herramientas gratuitas: en el mega-menú (escritorio) y en «Explora»
// (menú móvil). Ya no van en la cabecera.
export const HERRAMIENTAS_GRATIS = [
  {
    label: "Asistente",
    titulo: "¿No sabes cuál es tu trámite?",
    texto: "Responde 3 preguntas y te lo decimos",
    href: "/asistente",
    icono: "robot",
  },
  {
    label: "Calculadora de máster",
    titulo: "Calculadora de máster",
    texto: "El costo real de estudiar un máster en España",
    href: "/calculadora-master",
    icono: "euro",
  },
  // La pregunta que más llega por WhatsApp (17/09/2026): por qué fecha va
  // cada oficina de Extranjería. Entra aquí, con las otras dos herramientas
  // gratuitas, y sale a la vez en el mega-menú y en «Explora» del móvil.
  {
    label: "¿Por qué fecha va Extranjería?",
    titulo: "¿Por qué fecha va Extranjería?",
    texto: "Hasta qué fecha están resolviendo las oficinas",
    href: "/por-que-fecha-va-extranjeria",
    icono: "reloj",
  },
];

// «Explora» del menú móvil. No repite lo que ya está en la barra inferior
// (Inicio, Servicios, Máster, Mi portal y Reservar). El catálogo de servicios
// lo pinta MobileMenuNavLinks a partir de config/servicios.js; `herramientas`
// marca dónde va el grupo de HERRAMIENTAS_GRATIS.
export const navItemsMovil = [
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Herramientas gratis", herramientas: true },
  { label: "Eventos", href: "/eventos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/nosotros" },
];
