// src/config/paqueteMaster2027Resumen.js
// Lo mínimo del Paquete Máster 2027/2028 que necesita el resto del sitio
// (portada, menú, pie): precios, formato y la franja destacada. Vive aparte
// de config/paqueteMaster2027.js para no meter todo el contenido de la
// landing en el paquete inicial de la portada. paqueteMaster2027.js lo
// reexporta: sigue habiendo una sola fuente de precios.

// Espacio duro antes de «€» para que el símbolo no salte solo de línea, y
// punto de miles también en cuatro cifras («1.100 €»), que toLocaleString
// ("es-ES") no pone.
export const NBSP = "\u00A0";
const miles = (entero) => String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function numero(n) {
  const v = Number(n);
  if (Number.isInteger(v)) return miles(v);
  const [entero, decimales] = v.toFixed(2).split(".");
  return `${miles(entero)},${decimales}`;
}

export const eur = (n) => `${numero(n)}${NBSP}€`;
export const rangoEur = (a, b) => `${numero(a)}–${numero(b)}${NBSP}€`;

// ── Precios del Paquete Máster 2027/2028 (cliente, 10 y 11/09/2026) ────────
export const PRECIOS = {
  "l1-a": 219,
  "l1-basico": 249,
  "l1-comfort": 279,
  "l1-full": 359,
  "l2-a": 219,
  "l2-basico-full": 249,
  "l2-full": 349,
  "l3-a": 219,
  "l3-comfort": 350,
  "l3-full": 450,
  "l3-total": 600,
  // Paquete estándar publicado por el cliente el 11/09/2026.
  "econ-intermedias-650": 650,
  "premium-700": 700,
  "infinity-1100": 1100,
};

export const PRECIO_DESDE = Math.min(...Object.values(PRECIOS));

export const NOMBRE_PAQUETE = "Paquete Máster 2027/2028";
export const HREF_PAQUETE = "/servicios/master";

// Franja y tarjeta del máster en la portada: destacan el servicio estrella sin
// quitarle a la portada su mensaje multiservicio. Fecha siempre estimada.
export const MASTER_EN_PORTADA = {
  franja: {
    etiqueta: "Máster en España 2027/2028",
    texto: "La primera ventana para postular abre en noviembre (fecha estimada)",
    precio: `Planes desde ${eur(PRECIO_DESDE)}`,
    enlace: "Ver el paquete",
  },
  tarjeta: {
    titulo: `${NOMBRE_PAQUETE} · desde ${eur(PRECIO_DESDE)}`,
    texto:
      "Seleccionamos tus opciones entre más de 3.000 másteres oficiales, preparamos tu candidatura y postulamos por ti. Pago por etapas y tu expediente en nuestro portal propio.",
    boton: "Ver el paquete",
  },
  menu: `Ver el ${NOMBRE_PAQUETE}`,
};
