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

export const TONO = {
  economicas: {
    relleno: "#0A5873",
    canto: "#003648",
    chip: "bg-[#0A5873] text-white",
    muestra: "bg-[#0A5873]",
    anillo: "ring-[#0A5873]",
  },
  intermedias: {
    relleno: "#96CCFC",
    canto: "#5B9BD5",
    chip: "bg-[#96CCFC] text-[#003648]",
    muestra: "bg-[#96CCFC]",
    anillo: "ring-[#5B9BD5]",
  },
  premium: {
    relleno: "#F09C48",
    canto: "#B8661F",
    chip: "bg-[#F09C48] text-[#003648]",
    muestra: "bg-[#F09C48]",
    anillo: "ring-[#F09C48]",
  },
  fuera: {
    relleno: "#E3E9EF",
    canto: "#BFC9D2",
    chip: "bg-neutral-200 text-neutral-700",
    muestra: "bg-[#E3E9EF]",
    anillo: "ring-neutral-400",
  },
};

export const tonoDe = (listaId) => TONO[listaId] || TONO.fuera;
