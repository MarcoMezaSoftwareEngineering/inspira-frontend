// src/config/testimonios.js
// Opiniones REALES publicadas por clientes en Google y Facebook. Fuente única
// para la portada, /servicios/master, la landing /master-2027-2028 y
// /casos-de-exito.
//
// ⚠️ Solo añadir aquí reseñas verificables y publicadas por el propio cliente:
// publicar reseñas inventadas infringe la normativa de INDECOPI sobre
// publicidad (ver inspira-backend/docs/legal/09-claims-publicitarios.md).
//
// Transcripción literal de las fichas: no se corrigen tildes, mayúsculas ni
// puntuación ni se recorta; solo se omiten los emojis finales. Nombre de pila
// más inicial del apellido. Orden: primero las que más cuentan.
//
// Hasta el 23/09/2026 todas eran del servicio de visado y había que decirlo
// para no presentarlas como de máster. La de Elias G. es la primera que habla
// de una admisión, así que ese aviso deja de aplicar en bloque: cada ficha
// dice su servicio en `servicio` y es ahí donde hay que mirarlo.
export const TESTIMONIOS = [
  {
    nombre: "Elias G.",
    servicio: "Máster y visado",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto:
      "Excelente servicio y acompañamiento en todo el proceso, me ayudo con los tramites para ingresar a un master en Andalucia y tambien con la obtencion de la Visa",
  },
  {
    nombre: "Maria Belen A.",
    servicio: "Visado de estudios",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto:
      "Carina me asesoró para mi trámite de visa de estudios a España y me dieron el visado sin necesidad de subsanar! Fue muy personalizado, siempre me brindaba soluciones y guiaba en el proceso de recolectar los documentos necesarios para la presentación de la solicitud y asegurarnos de que cada documento esté siendo considerado de manera correcta. También nos facilitó proveedores certificados de traductores, seguro de salud, certificado médico, etc y se encargó de agendar la cita en BLS. A mi llegada a España, continuó compartiéndome información sobre los trámites que debía hacer. La recomiendo!",
  },
  {
    nombre: "Lili P.",
    servicio: "Visado",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto:
      "Carina me ayudó muchísimo en el trámite de mi visado todo salió perfecto , sin subsanacion ni nada, me ayudó hasta un día antes de mi cita en bls! Es la mejor",
  },
  {
    nombre: "María Eugenia A.",
    servicio: "Visado",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto:
      "¡Gracias Carina por toda la asesoría! Me dieron la visa a España gracias a tu buena estrategia. La recomiendo al 100% a ella y a todo su equipo, ya que conocen los procedimientos del consulado y trabaja acorde a cada caso que es diferente y personalizado. ¡Me siento muy feliz por el resultado!",
  },
  {
    nombre: "Brian S.",
    servicio: "Visado",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto: "Gran asesoría, y apoyo en el trámite, salió todo en menos de un mes.",
  },
  {
    nombre: "Rosa A.",
    servicio: "Visado",
    fuente: "Google",
    fecha: "septiembre de 2026",
    estrellas: 5,
    texto:
      "Me ayudó con todo el trámite para el proceso de visado, la recomiendo 100%, mucha paciencia y siempre respondia a mis consultas oportunamente.",
  },
  {
    nombre: "Annie M.",
    servicio: "Visado",
    fuente: "Google",
    fecha: "abril de 2026",
    estrellas: 5,
    texto:
      "Carina me ayudo con el visado de españa! Realmente una capa, conoce todos los procedimientos del consulado y la atención con ella fue 10/10! Agradecida y feliz por el resultado",
  },
  {
    nombre: "Cristina D.",
    servicio: "Visa aprobada",
    fuente: "Facebook",
    fecha: "octubre de 2024",
    estrellas: 5,
    texto:
      "Llegué con el equipo de Inspira gracias a una recomendación de Facebook. Me dieron la confianza desde el primer momento que empezamos a revisar mi caso. Gracias a ellos mi visa fue aprobada, los súper recomiendo.",
  },
];

// Ficha de Google. Sin logos de Google ni de Facebook; la de Facebook no lleva
// enlace porque no hay URL verificada.

/** Las de Google, que son las que cuenta la ficha. */
const DE_GOOGLE = TESTIMONIOS.filter((t) => t.fuente === "Google").length;

export const RESENAS_GOOGLE = {
  // La cuenta sale de la lista y no de un número escrito a mano: antes decía
  // «6 reseñas (septiembre de 2026)» y se quedaba desfasada en cuanto entraba
  // una nueva o pasaba el mes. La fecha se retira por lo mismo.
  cabecera: `5,0 de 5 en Google · ${DE_GOOGLE} ${DE_GOOGLE === 1 ? "reseña" : "reseñas"}`,
  subtitulo: "Opiniones publicadas por nuestros clientes.",
  enlace: "Ver todas las opiniones en Google",
  url: "https://maps.app.goo.gl/f3oL2qQdmheT4Dnr6",
  estrellas: 5,
  ariaCarrusel: "Opiniones de clientes",
  anterior: "Opinión anterior",
  siguiente: "Opinión siguiente",
};
