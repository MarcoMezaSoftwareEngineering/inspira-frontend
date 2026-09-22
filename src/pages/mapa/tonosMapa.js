// src/pages/mapa/tonosMapa.js
// Colores del mapa con la paleta del kit de marca Inspira: Noche #003648,
// Cielo #96CCFC y Sol #F09C48 (la web general aún usa #013446/#88C4FC/#FA943A).
// Misma asignación que la landing del máster: Lista 1 en petróleo, Lista 2 en
// cielo, Lista 3 en sol; fuera de las listas, gris.
//
// `relleno` y `canto` son hex para el SVG (el canto es la cara lateral del
// relieve); `chip`, `muestra`, `anillo` y `barra`, clases de Tailwind con el
// mismo color. Texto Noche sobre Cielo y Sol: el blanco no llega al contraste.
export const NOCHE = "#003648";
export const CIELO = "#96CCFC";
export const SOL = "#F09C48";

// Rampa de precio, no tres colores sueltos (22/09/2026). Antes cada tramo
// tenía un color distinto —petróleo, cielo y naranja— y el mapa se leía como
// tres categorías sin orden; encima el naranja del tramo caro competía con el
// naranja de los botones y de lo elegido. Ahora es una sola escala: cuanto
// más oscura la comunidad, más cara la matrícula. Se entiende sin leyenda, y
// el Sol queda libre para una sola cosa: lo que está elegido.
export const TONO = {
  economicas: {
    relleno: "#CFE6FD",
    canto: "#9EC7EC",
    chip: "bg-[#CFE6FD] text-[#003648]",
    muestra: "bg-[#CFE6FD]",
    anillo: "ring-[#9EC7EC]",
  },
  intermedias: {
    relleno: "#5B9BD5",
    canto: "#3C7AB0",
    chip: "bg-[#5B9BD5] text-white",
    muestra: "bg-[#5B9BD5]",
    anillo: "ring-[#3C7AB0]",
  },
  premium: {
    relleno: "#0A5873",
    canto: "#003648",
    chip: "bg-[#0A5873] text-white",
    muestra: "bg-[#0A5873]",
    anillo: "ring-[#0A5873]",
  },
  fuera: {
    relleno: "#E7ECF1",
    canto: "#C7D0D9",
    chip: "bg-neutral-200 text-neutral-700",
    muestra: "bg-[#E7ECF1]",
    anillo: "ring-neutral-400",
  },
};

export const tonoDe = (listaId) => TONO[listaId] || TONO.fuera;
