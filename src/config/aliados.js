// Aliados externos con enlace de referido o atención prioritaria (03/11/2026).
// Los usan /enlaces y la app gratuita. Un aliado sin `href` no se pinta: se
// añade aquí el enlace de referido y aparece solo.
import { MENSAJE_SEGURO, WHATSAPP_SEGURO } from "./contacto";

export const HOLAFLY_URL = "https://holafly.go.link/3pDol";

export const ALIADOS = [
  {
    clave: "seguro", icono: "salud", titulo: "Seguro médico para la visa",
    texto: "Adeslas sin copagos con StarSeguro, con atención prioritaria",
    chip: "Prioritario", href: WHATSAPP_SEGURO, mensaje: MENSAJE_SEGURO,
  },
  {
    clave: "esim", icono: "senal", titulo: "eSIM Holafly",
    texto: "Datos en toda Europa desde que aterrizas", chip: "10 % dto.", href: HOLAFLY_URL,
  },
  {
    clave: "global66", icono: "euro", titulo: "Global66",
    texto: "Cuenta en euros y envíos de dinero entre países", chip: "Referido", href: null,
  },
  {
    clave: "felix", icono: "whatsapp", titulo: "Félix Pago",
    texto: "Envía dinero a tu familia desde WhatsApp", chip: "Referido", href: null,
  },
];
