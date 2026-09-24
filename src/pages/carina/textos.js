// src/pages/carina/textos.js
// Textos de /carina, el destino del enlace de la bio. Corto a propósito: quien
// llega viene de un vídeo y decide en segundos si sigue o cierra.
import { TITULAR } from "../../config/legal";

const MEDIA = "https://www.inspira-legal.cloud/media";

export const CARINA = {
  seo: {
    title: "Carina Meza · Inspira Legal | Estudiar en España desde Perú",
    description:
      "Soy Carina Meza, CEO y consultora legal de Inspira. Acompaño a estudiantes peruanos hasta el aula en España: máster, visado y llegada. Mira mis vídeos y escríbeme.",
    path: "/carina",
    imagen: `${MEDIA}/foto/carina-retrato.jpg`,
  },

  schema: {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Carina Meza",
    jobTitle: "CEO y consultora legal",
    worksFor: { "@type": "Organization", name: "Inspira Legal", url: "https://www.inspira-legal.cloud/" },
    image: `${MEDIA}/foto/carina-retrato.jpg`,
    url: "https://www.inspira-legal.cloud/carina",
  },

  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  graduacion: `${MEDIA}/foto/carina-graduacion.jpg`,
  // Si TITULAR no tiene TikTok definido, el enlace no se pinta: mejor sin
  // enlace que con uno inventado.
  tiktok: TITULAR.tiktok || TITULAR.redes?.tiktok || null,

  rotulo: "Sueña · Aprende · Viaja",
  nombre: "Carina Meza",
  cargo: "CEO & Consultora Legal · Inspira Legal",
  promesa: "Te acompaño desde Lima hasta el aula en España: el máster, la visa y la llegada. Sin humo y con cifras reales.",

  cta: {
    whatsapp: "Escríbeme por WhatsApp",
    sesion: "Reservar sesión",
  },

  videos: {
    titulo: "Mírame antes de escribirme",
    lead: "Así hablo, así trabajo. Toca un vídeo para escucharlo.",
    masEn: "Ver más en TikTok →",
    // Los títulos los pone Carina: aquí solo la duración, que es verdad segura.
    lista: [
      { id: "1", src: `${MEDIA}/video/carina-1.mp4`, poster: `${MEDIA}/video/carina-1.jpg`, titulo: "TikTok · 29 s" },
      { id: "2", src: `${MEDIA}/video/carina-2.mp4`, poster: `${MEDIA}/video/carina-2.jpg`, titulo: "TikTok · 44 s" },
      { id: "3", src: `${MEDIA}/video/carina-3.mp4`, poster: `${MEDIA}/video/carina-3.jpg`, titulo: "TikTok · 59 s" },
      { id: "4", src: `${MEDIA}/video/carina-4.mp4`, poster: `${MEDIA}/video/carina-4.jpg`, titulo: "TikTok · 84 s" },
      { id: "5", src: `${MEDIA}/video/carina-5.mp4`, poster: `${MEDIA}/video/carina-5.jpg`, titulo: "TikTok · 55 s" },
      { id: "6", src: `${MEDIA}/video/carina-6.mp4`, poster: `${MEDIA}/video/carina-6.jpg`, titulo: "TikTok · 19 s" },
      { id: "7", src: `${MEDIA}/video/carina-7.mp4`, poster: `${MEDIA}/video/carina-7.jpg`, titulo: "TikTok · 29 s" },
      { id: "8", src: `${MEDIA}/video/carina-8.mp4`, poster: `${MEDIA}/video/carina-8.jpg`, titulo: "TikTok · 31 s" },
    ],
  },

  juego: {
    titulo: "¿Te alcanza para estudiar en España?",
    texto: "Seis cartas, treinta segundos, y te digo dónde sí puedes. Sin dar tu número ni tu correo.",
  },

  cierre: {
    titulo: "Yo también pasé por esto",
    texto: "Sé lo que es armar un expediente con miedo a que falte un papel. Por eso hago esto: que llegues, y que llegues bien.",
  },
};
