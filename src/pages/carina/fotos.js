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
import tarma from "../../assets/images/carina/tarma-nina.webp";
import baileTraje from "../../assets/images/carina/baile-traje.webp";
import bailePlaya from "../../assets/images/carina/baile-playa.webp";
import delegada from "../../assets/images/carina/delegada-destacada.webp";
import tadei from "../../assets/images/carina/tadei.webp";
import nina from "../../assets/images/carina/nina-retrato.webp";
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
  tarma: { src: tarma, ancho: 720, alto: 960, alt: "Carina de niña, acariciando un conejo blanco en Tarma" },
  baileTraje: { src: baileTraje, ancho: 600, alto: 711, alt: "Carina con traje típico de danza en un patio colonial" },
  bailePlaya: { src: bailePlaya, ancho: 480, alto: 640, alt: "Carina con traje de danza en la orilla del mar" },
  delegada: { src: delegada, ancho: 480, alto: 640, alt: "Carina recibiendo el premio a Delegada Destacada" },
  tadei: { src: tadei, ancho: 600, alto: 800, alt: "Carina en un seminario del Taller de Estudios Internacionales de San Marcos" },
  nina: { src: nina, ancho: 600, alto: 736, alt: "Carina de niña, con la mano en la mejilla" },
  paris: { src: paris, ancho: 600, alto: 800, alt: "Carina frente a la Torre Eiffel, en París" },
  londres: { src: londres, ancho: 600, alto: 800, alt: "Carina en el puente de Westminster, con el Big Ben al fondo" },
};
