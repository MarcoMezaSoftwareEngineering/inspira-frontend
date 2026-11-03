// Aliados externos con enlace de referido o atención prioritaria (03/11/2026).
// Los usan /enlaces y la app gratuita. Un aliado sin `href` no se pinta. El
// seguro lo atiende Félix, de StarSeguro.
import { MENSAJE_SEGURO, WHATSAPP_SEGURO } from "./contacto";

export const HOLAFLY_URL = "https://holafly.go.link/3pDol";

export const ALIADOS = [
  {
    clave: "seguro", icono: "salud", titulo: "Seguro de viaje",
    texto: "Los mejores, también para tu visa. Te atiende Félix, de StarSeguro",
    chip: "Prioritario", href: WHATSAPP_SEGURO, mensaje: MENSAJE_SEGURO,
  },
  {
    clave: "esim", icono: "senal", titulo: "Adquiere tu eSIM",
    texto: "Datos para tus primeros días de viaje, con Holafly", chip: "10 % dto.", href: HOLAFLY_URL,
  },
  {
    clave: "global66", icono: "euro", titulo: "Global66",
    texto: "Tu primera transacción gratis. Envía y recibe dinero entre países", chip: "Gratis",
    href: "https://share.global66.com/CARMEZ1467",
  },
];
