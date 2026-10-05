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
    imagen: "/og/carina.jpg",
  },

  schema: {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Carina Meza",
    jobTitle: "CEO y consultora legal",
    worksFor: { "@type": "Organization", name: "Inspira Legal", url: "https://www.inspira-legal.cloud/" },
    image: `${MEDIA}/foto/carina-retrato.jpg`,
    url: "https://www.inspira-legal.cloud/carina",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Université de Bordeaux – IAE Bordeaux School of Management" },
      { "@type": "CollegeOrUniversity", name: "Universidad Nacional Mayor de San Marcos" },
    ],
    knowsAbout: ["Derecho de extranjería", "Visado de estudios en España", "Másteres en España", "Becas internacionales"],
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

  // Sacado del CV de Carina (05/10/2026). Solo lo que acompaña al asesorado:
  // su puesto público y los cursos de aduanas se quedan fuera a propósito.
  // Tono: cercano, de tú, como habla en sus vídeos. Nada de lenguaje de CV.
  trayectoria: {
    titulo: "De dónde vengo",
    lead: "Soy tarmeña, sanmarquina y bien terca cuando me propongo algo. No te hablo de oídas. Lo que te cuento en los vídeos lo estudié, lo trabajé y lo viví yo misma.",
    experiencia: {
      titulo: "En qué trabajo",
      lista: [
        {
          periodo: "Desde 2023",
          puesto: "Fundé Inspira",
          lugar: "Fundadora y CEO · Lima",
          texto: "Aquí ayudo a gente como tú a irse a estudiar y a vivir fuera: visas, permisos de estudio, arraigos y nacionalidad, en Europa y en Estados Unidos. Si te niegan una visa, yo misma preparo el recurso. Y no te suelto en el aeropuerto: te acompaño desde que eliges el máster hasta que ya estás instalado. También llevo Inspira Educa, para que más jóvenes lleguen a la universidad y a oportunidades fuera del país.",
        },
        {
          periodo: "2020 – 2023",
          puesto: "Tres años en extranjería",
          lugar: "Consultoría Legal ADBA · Sevilla (en remoto)",
          texto: "Trabajé para una consultora de Sevilla, al frente del equipo legal. Ahí aprendí el oficio de verdad: residencias, visas y todo el papeleo de extranjería, caso por caso.",
        },
      ],
    },
    ruta: {
      titulo: "Mi ruta",
      ayuda: "Toca cada parada",
      paradas: [
        {
          id: "tarma", lugar: "Tarma", pais: "Perú", periodo: "Mi tierra", foto: "tarma",
          titulo: "Tarmeña",
          texto: "Soy de Tarma, en Junín: la Perla de los Andes. Ahí empezó todo, mucho antes de pensar en becas o en Europa.",
          sirve: "Si yo pude salir desde Tarma, tú también puedes desde donde estés.",
        },
        {
          id: "lima", lugar: "Lima", pais: "Perú", periodo: "2015 – 2025", foto: "graduadaAncha",
          titulo: "Sanmarquina",
          texto: "Me vine a Lima a estudiar Derecho en San Marcos. Ahí descubrí el debate y la oratoria, que me encantan, y después hice ahí mismo una maestría en Negocios Internacionales, en doble grado con la Université de Bordeaux.",
          sirve: "Vengo de la universidad pública, como muchos de los que me escriben.",
        },
        {
          id: "giessen", lugar: "Giessen", pais: "Alemania", periodo: "2020", foto: null,
          titulo: "Mi intercambio",
          texto: "En plena carrera hice un semestre de intercambio con la Justus Liebig University Giessen.",
          sirve: "Fue la primera vez que vi por dentro cómo funciona una universidad europea.",
        },
        {
          id: "medellin", lugar: "Medellín", pais: "Colombia", periodo: "2020", foto: "colombia",
          titulo: "Mi primera beca",
          texto: "Me fui a Medellín con una beca del Instituto CAPAZ y el DAAD. Pasaje y estadía pagados, y yo representando al Perú.",
          sirve: "Sé lo que se siente postular a una beca y esperar la respuesta. A mí me dijeron que sí.",
        },
        {
          id: "stuttgart", lugar: "Stuttgart", pais: "Alemania", periodo: "2022", foto: "alemania",
          titulo: "La segunda beca",
          texto: "Dos años después volví a postular, esta vez al DAAD de Alemania. Otra beca completa, y otra vez representando al Perú.",
          sirve: "Dos postulaciones, dos becas. Eso mismo es lo que te enseño a armar.",
        },
        {
          id: "burdeos", lugar: "Burdeos", pais: "Francia", periodo: "2025 – 2026", foto: "burdeos",
          titulo: "Mi máster en Francia",
          texto: "Hice un MBA en la Université de Bordeaux. Es un título oficial francés, de un año, y lo cursé en inglés.",
          sirve: "La admisión, la matrícula, los papeles… todo lo que vas a pasar tú, ya lo pasé yo.",
        },
      ],
    },
  },

  // La historia en formato «stories»: se ve como un vídeo, pero es la página.
  // Cada lámina dura lo que marca --car-his-dur en carina.css.
  historia: {
    rotulo: "Mi historia en un minuto",
    titulo: "Yo también hice este camino",
    ayuda: "Toca para avanzar · mantén para pausar",
    repetir: "Ver de nuevo",
    cta: "Quiero que me acompañes",
    laminas: [
      { id: "hola", foto: "retrato", modo: "llena", etiqueta: "¡Hola!", titulo: "Soy Carina", texto: "Soy de Tarma, en Junín, y un día me propuse salir a estudiar fuera. Te cuento cómo me fue." },
      { id: "tarma", foto: "nina", foto2: "tarma", modo: "duo", etiqueta: "Tarma · Junín", titulo: "Yo de niña ✨", texto: "Esta soy yo, de chiquita, en mi Tarma. De la sierra del Perú al mundo." },
      { id: "sanmarcos", foto: "graduada", modo: "llena", etiqueta: "Lima · San Marcos", titulo: "Sanmarquina", texto: "Me vine a Lima a estudiar Derecho en San Marcos. De ahí salieron las ganas de ver mundo." },
      { id: "debate", foto: "delegada", foto2: "tadei", modo: "duo", etiqueta: "Lo que amo", titulo: "Debatir y hablar", texto: "Amo el debate y la oratoria. En 2017 fui Delegada Destacada en un Modelo de Naciones Unidas." },
      { id: "baile", foto: "baileTraje", foto2: "bailePlaya", modo: "duo", etiqueta: "Y también", titulo: "Amo bailar", texto: "Las danzas de mi tierra van conmigo a donde vaya. Bailando soy feliz." },
      { id: "colombia", foto: "colombia", modo: "marco", etiqueta: "2020 · Colombia", titulo: "Mi primera beca", texto: "Me fui a Medellín con todo pagado, representando al Perú. Ahí supe que sí se podía." },
      { id: "alemania", foto: "alemania", modo: "marco", etiqueta: "2022 · Alemania", titulo: "Y luego, otra", texto: "Volví a postular y me la dieron: beca del DAAD en Stuttgart. Eso sí, ¡qué frío!" },
      { id: "burdeos", foto: "burdeos", modo: "llena", etiqueta: "2025 · Francia", titulo: "Mi máster en Francia", texto: "Un MBA en Burdeos, en inglés. Los trámites que te tocan a ti, yo ya los hice." },
      { id: "viaja", foto: "paris", foto2: "londres", modo: "duo", etiqueta: "Y de paso…", titulo: "También se viaja", texto: "París, Londres… Cuando estudias en Europa, todo te queda cerquita." },
      { id: "hoy", foto: "mirador", modo: "llena", etiqueta: "Hoy · Inspira", titulo: "Ahora te toca a ti", texto: "Yo te acompaño con el máster, la visa y la llegada. Paso a paso y sin enredos.", final: true },
    ],
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
