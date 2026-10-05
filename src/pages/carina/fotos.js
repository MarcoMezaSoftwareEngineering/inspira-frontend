// src/pages/carina/fotos.js
// Fotos de Carina para la historia y la ruta. Recortadas y pasadas a WebP
// desde los originales que envió ella (05/10/2026).
import retrato from "../../assets/images/carina/retrato-espana.webp";
import colombia from "../../assets/images/carina/beca-colombia.webp";
import alemania from "../../assets/images/carina/beca-alemania.webp";
import burdeos from "../../assets/images/carina/burdeos.webp";
import mirador from "../../assets/images/carina/mirador-francia.webp";
import graduada from "../../assets/images/carina/graduacion-sanmarcos.webp";
import graduadaAncha from "../../assets/images/carina/graduacion-ancha.webp";
import paris from "../../assets/images/carina/paris.webp";
import londres from "../../assets/images/carina/londres.webp";

export const FOTOS = {
  retrato: { src: retrato, ancho: 720, alto: 1241, alt: "Carina Meza sonriendo, con una ciudad española al fondo" },
  colombia: { src: colombia, ancho: 960, alto: 938, alt: "Carina con el grupo de becarios frente a la Piedra del Peñol, en Colombia" },
  alemania: { src: alemania, ancho: 960, alto: 712, alt: "Carina con otras tres becarias en un campus nevado de Alemania" },
  burdeos: { src: burdeos, ancho: 720, alto: 960, alt: "Carina frente a la Porte Cailhau, en Burdeos" },
  mirador: { src: mirador, ancho: 720, alto: 1231, alt: "Carina en un mirador sobre una ciudad francesa" },
  graduada: { src: graduada, ancho: 720, alto: 1280, alt: "Carina con toga y birrete el día de su graduación en San Marcos" },
  graduadaAncha: { src: graduadaAncha, ancho: 840, alto: 608, alt: "Carina con toga y birrete el día de su graduación en San Marcos" },
  paris: { src: paris, ancho: 600, alto: 800, alt: "Carina frente a la Torre Eiffel, en París" },
  londres: { src: londres, ancho: 600, alto: 800, alt: "Carina en el puente de Westminster, con el Big Ben al fondo" },
};
