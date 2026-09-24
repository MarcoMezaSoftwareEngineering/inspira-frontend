// src/pages/carina/textos.js
// Textos de /carina, el destino del enlace de la bio. Corto a propósito: quien
// llega viene de un vídeo y decide en segundos si sigue o cierra.
import { TITULAR } from "../../config/legal";

const MEDIA = "https://www.inspira-legal.cloud/media";

export const CARINA = {
  seo: {
    title: "Carina Meza | Estudiar en España desde Perú",
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
    // Títulos sacados de los rótulos de cada vídeo (revisados fotograma a fotograma el 24/09/2026).
    lista: [
      { id: "1", src: `${MEDIA}/video/carina-1.mp4`, poster: `${MEDIA}/video/carina-1.jpg`, titulo: "¿Quieres estudiar un máster en España?" },
      { id: "2", src: `${MEDIA}/video/carina-2.mp4`, poster: `${MEDIA}/video/carina-2.jpg`, titulo: "Máster + trabajo de 30 h a la semana" },
      { id: "3", src: `${MEDIA}/video/carina-3.mp4`, poster: `${MEDIA}/video/carina-3.jpg`, titulo: "Me rechazaron en la Complutense… y qué hicimos" },
      { id: "4", src: `${MEDIA}/video/carina-4.mp4`, poster: `${MEDIA}/video/carina-4.jpg`, titulo: "Admitida a un máster en Andalucía" },
      { id: "5", src: `${MEDIA}/video/carina-5.mp4`, poster: `${MEDIA}/video/carina-5.jpg`, titulo: "Visa de estudios vs. estancia por estudios" },
      { id: "6", src: `${MEDIA}/video/carina-6.mp4`, poster: `${MEDIA}/video/carina-6.jpg`, titulo: "Carrera en España sin examen de admisión" },
      { id: "7", src: `${MEDIA}/video/carina-7.mp4`, poster: `${MEDIA}/video/carina-7.jpg`, titulo: "Beca AUIP para un máster en Valencia" },
      { id: "8", src: `${MEDIA}/video/carina-8.mp4`, poster: `${MEDIA}/video/carina-8.jpg`, titulo: "Cuándo postular: las fechas que importan" },
      { id: "9", src: `${MEDIA}/video/carina-9.mp4`, poster: `${MEDIA}/video/carina-9.jpg`, titulo: "Requisitos del visado: plazo, documentos vigentes y carta de aceptación" },
      { id: "10", src: `${MEDIA}/video/carina-10.mp4`, poster: `${MEDIA}/video/carina-10.jpg`, titulo: "Me denegaron el visado: qué dice la notificación y qué hacer" },
      { id: "11", src: `${MEDIA}/video/carina-11.mp4`, poster: `${MEDIA}/video/carina-11.jpg`, titulo: "La fórmula mínima: 7.200 € + el máster + el pasaje" },
      { id: "12", src: `${MEDIA}/video/carina-12.mp4`, poster: `${MEDIA}/video/carina-12.jpg`, titulo: "Medios económicos: cómo se demuestra el dinero" },
      { id: "13", src: `${MEDIA}/video/carina-13.mp4`, poster: `${MEDIA}/video/carina-13.jpg`, titulo: "Actualización visa de estudios: antelación y títulos válidos" },
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
