// src/pages/landing/master2027/tonos.js
// Colores de cada lista con las clases de marca (tailwind.config.js), para el
// mapa, los chips y los bloques de planes. Texto petróleo sobre naranja y
// celeste: el blanco sobre #FA943A no llega al contraste mínimo en texto
// pequeño.
export const TONO = {
  economicas: {
    relleno: "fill-primary-light",
    chip: "bg-primary-light text-white",
    muestra: "bg-primary-light",
    anillo: "ring-primary-light",
  },
  intermedias: {
    relleno: "fill-sky",
    chip: "bg-sky text-primary",
    muestra: "bg-sky",
    anillo: "ring-sky-dark",
  },
  premium: {
    relleno: "fill-accent",
    chip: "bg-accent text-primary",
    muestra: "bg-accent",
    anillo: "ring-accent",
  },
  fuera: {
    relleno: "fill-neutral-200",
    chip: "bg-neutral-200 text-neutral-700",
    muestra: "bg-neutral-200",
    anillo: "ring-neutral-400",
  },
};

export const tonoDe = (listaId) => TONO[listaId] || TONO.fuera;
