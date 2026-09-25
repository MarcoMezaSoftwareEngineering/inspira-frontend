// src/pages/visado/textos.js
//
// Textos de /visado, la landing que se manda por WhatsApp a quien escribe
// «hola, ya tengo carta de admisión». Ese mensaje llega cuando la persona ya
// decidió irse: lo que le falta es saber qué vía le toca, qué le van a pedir
// y por qué conviene empezar por una sesión y no por un paquete a ciegas.
//
// Precios: ninguno escrito aquí. Salen de config/metodo.js, que a su vez lee
// precios-inspira.json (fuente única). Reglas de visado y estancia:
// config/visaOEstancia.js. Cifras institucionales: CATEGORIAS_CASOS.
import { PLANES_VISADO, ESTANCIA_ESTUDIOS, SESION_DIAGNOSTICO } from "../../config/metodo";
import { eur } from "../../config/paqueteMaster2027Resumen";
import { IPREM_ANIO } from "../expediente/textos";

const MEDIA = "https://www.inspira-legal.cloud/media";

export { PLANES_VISADO, ESTANCIA_ESTUDIOS, SESION_DIAGNOSTICO };

export const VISADO = {
  seo: {
    title: "Visado de estudios para España: ya tienes la carta de admisión",
    description:
      "Tienes la carta de admisión y ahora toca el visado de estudios. En dos minutos sabes si te conviene visado o estancia, qué incluye cada paquete de Inspira Legal y por qué empezamos con una sesión diagnóstico.",
    path: "/visado",
    imagen: "/og/visado-estudios.jpg",
  },

  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  graduacion: `${MEDIA}/foto/carina-graduacion.jpg`,

  // La cinta que pasa bajo las cifras: lo que va en un expediente que se aprueba.
  cinta: ["Visado tipo D", "90 días para entrar", "30 h de trabajo", `${IPREM_ANIO} en cuenta`, "Seguro sin copagos", "Certificado médico", "Antecedentes apostillados", "Cita consular", "Recurso incluido", "Consulado de Lima"],

  hero: {
    rotulo: "Visado de estudios · desde tu país",
    tituloInicio: "¿Ya tienes la carta de admisión para",
    palabras: ["Madrid", "Valencia", "Sevilla", "Granada", "Salamanca", "tu universidad"],
    tituloFin: "Lo que falta es el visado.",
    lead:
      "Y es justo donde más se deniega: el dinero, el seguro, una frase en el certificado. Aquí ves en dos minutos qué vía te toca, qué incluye cada paquete y cómo empezamos.",
    quien: "Carina Meza · CEO y consultora legal",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Sesión diagnóstico · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionCorta: `Sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
  },

  test: {
    rotulo: "Dos minutos",
    titulo: "¿Visado o estancia por estudios?",
    lead: "Las dos te dejan estudiar y trabajar 30 horas. Se diferencian en dónde se presentan y en cómo te piden el dinero. Tres preguntas y te lo digo.",
    donde: "¿Dónde estás ahora mismo?",
    dinero: "¿Cómo vas a acreditar el dinero?",
    clases: "¿Cuándo empiezan tus clases?",
    clasesAyuda: "Opcional. Con la fecha calculo si llegas a tiempo.",
    ver: "Ver mi resultado",
    otraVez: "Cambiar respuestas",
    completo: "Hacer el test completo (5 preguntas)",
    paquete: "El paquete que te encaja",
    porque: "Por qué",
    resolver: "Lo que hay que resolver antes",
  },

  videos: {
    titulo: "Te lo explico en un minuto",
    lead: "Visado o estancia, la fórmula del dinero, qué pasa cuando deniegan y lo que cambió este año.",
    lista: [
      { id: "5", src: `${MEDIA}/video/carina-5.mp4`, poster: `${MEDIA}/video/carina-5.jpg`, titulo: "Visa de estudios vs. estancia por estudios" },
      { id: "11", src: `${MEDIA}/video/carina-11.mp4`, poster: `${MEDIA}/video/carina-11.jpg`, titulo: "La fórmula mínima: 7.200 € + el máster + el pasaje" },
      { id: "12", src: `${MEDIA}/video/carina-12.mp4`, poster: `${MEDIA}/video/carina-12.jpg`, titulo: "Medios económicos: cómo se demuestra el dinero" },
      { id: "9", src: `${MEDIA}/video/carina-9.mp4`, poster: `${MEDIA}/video/carina-9.jpg`, titulo: "Requisitos del visado: plazo, documentos vigentes y carta de aceptación" },
      { id: "10", src: `${MEDIA}/video/carina-10.mp4`, poster: `${MEDIA}/video/carina-10.jpg`, titulo: "Me denegaron el visado: qué dice la notificación y qué hacer" },
      { id: "13", src: `${MEDIA}/video/carina-13.mp4`, poster: `${MEDIA}/video/carina-13.jpg`, titulo: "Actualización visa de estudios: antelación y títulos válidos" },
    ],
  },

  denegaciones: {
    rotulo: "Por qué deniegan",
    titulo: "Los motivos de denegación más comunes",
    lead: "Casi todas las denegaciones del visado de estudios caen en estos ocho. Los conocemos porque los recurrimos.",
    motivo: "El motivo",
    evitamos: "Cómo lo evitamos",
    lista: [
      { icono: "euro", titulo: "Dinero sin origen acreditado", motivo: "Un saldo que apareció de golpe, sin seis meses de extractos ni forma de justificar de dónde salió. Es la causa número uno.", evitamos: "Estrategia económica antes de la cita: extractos, origen del dinero y declaración jurada de solvencia." },
      { icono: "usuarios", titulo: "El aval de un familiar, incompleto", motivo: "Carta aval sin notario ni apostilla, o sin toda la documentación económica del avalista: extractos, impuestos, origen de sus ingresos.", evitamos: "Preparamos la carta aval y la carpeta completa del avalista, tal como la pide el consulado." },
      { icono: "salud", titulo: "Un seguro que no vale", motivo: "Un seguro de viaje o con copagos. El consulado exige asistencia sanitaria sin copagos, sin carencias, con repatriación y por toda la estancia.", evitamos: "Te decimos qué póliza contratar y revisamos el certificado antes de presentarlo." },
      { icono: "documento", titulo: "Certificado médico sin la frase", motivo: "«Apto» o «goza de buena salud» no sirve: tiene que aparecer la fórmula del Reglamento Sanitario Internacional de 2005, palabra por palabra.", evitamos: "Modelo exacto para tu médico y revisión antes de visar y apostillar." },
      { icono: "birrete", titulo: "Admisión condicional o centro no apto", motivo: "Una carta de preinscripción, un máster en línea o un título propio: el consulado quiere estudios oficiales, presenciales y con fechas cerradas.", evitamos: "Comprobamos el centro y la carta antes de abrir el expediente." },
      { icono: "balanza", titulo: "Antecedentes caducados o sin apostilla", motivo: "Tienen tres meses de vigencia, contados hasta el día de la cita, y sin apostilla de La Haya no valen.", evitamos: "Los pedimos pensando en la fecha de la cita, no antes." },
      { icono: "reloj", titulo: "Presentar tarde", motivo: "Con menos de dos meses para el inicio de clases el consulado no llega a resolver: se pide cita urgente y muchas veces no la hay.", evitamos: "Calendario desde la carta de admisión: cita, resolución y viaje con margen." },
      { icono: "pasaporte", titulo: "Formulario y pasaporte con errores", motivo: "Nombres distintos a los del pasaporte, fechas que no cuadran con la carta o un pasaporte con menos de un año de vigencia.", evitamos: "Rellenamos el formulario y revisamos cada campo contra tu pasaporte." },
    ],
    denegadoTitulo: "¿Ya te lo denegaron?",
    denegadoTexto: "Hay un mes desde la notificación para el recurso de reposición. La Asesoría Integral lo incluye; si el recurso no es la mejor vía, te reconducimos a la estancia por estudios.",
    denegadoEnlace: "Qué hacer si te denegaron el visado",
    denegadoHref: "/ruta/denegado",
  },

  paquetes: {
    rotulo: "Tres formas de acompañarte",
    titulo: "Elige cuánto quieres que hagamos nosotros",
    lead: "Del punto que más se deniega hasta el expediente entero con cita y recurso. Todos con tu expediente en nuestro portal, por escrito.",
    recomendado: "El que recomendamos",
    para: "Para ti si…",
    elegir: "Empezar con este",
    estanciaTitulo: "¿Ya estás en España o vas a entrar como turista?",
    estanciaTexto: "Entonces tu vía no es el consulado: es la estancia por estudios, 100 % telemática ante Extranjería.",
    estanciaEnlace: "Ver la estancia por estudios",
  },

  incluye: {
    titulo: "Lo que incluimos y lo que no",
    si: "Incluido en la Asesoría Integral",
    no: "No incluido en ningún paquete",
    noLista: [
      "Las tasas del consulado y de las apostillas: se pagan a quien las cobra.",
      "La póliza del seguro médico: la eliges con nosotros y la pagas a la aseguradora.",
      "Certificados, traducciones y pasajes.",
      "La decisión del consulado: preparamos el expediente para que sea sólido, pero no la firmamos nosotros.",
    ],
  },

  como: {
    rotulo: "Cómo empezamos",
    titulo: "Primero la sesión, después el paquete",
    lead: "No vendemos un paquete a ciegas. Antes de cobrarte nada, un abogado mira tu caso y te dice si es viable y por dónde.",
    pasos: [
      {
        titulo: `Sesión diagnóstico · ${SESION_DIAGNOSTICO.duracion} · ${eur(SESION_DIAGNOSTICO.precio)}`,
        texto: "Por videollamada, con tu carta de admisión y tus números delante. Sales con la vía definida y un plan escrito. Si tu caso no es viable hoy, te lo decimos ahí.",
        icono: "balanza",
      },
      {
        titulo: "Eliges el paquete y pagas",
        texto: "Al contado, o en dos cuotas: la mitad al iniciar y la otra mitad al mes. El paquete queda pagado antes de la cita consular.",
        icono: "euro",
      },
      {
        titulo: "Tu expediente en el portal",
        texto: "Cada documento con su ejemplo y la observación de tu asesor, tu solvencia calculada y los mensajes por escrito, con constancia de lectura.",
        icono: "panel",
      },
      {
        titulo: "Cita, resolución y llegada",
        texto: "Agendamos la cita, te decimos qué llevar y seguimos contigo hasta la resolución. Con el visado en el pasaporte, te guiamos con la TIE y el empadronamiento.",
        icono: "avion",
      },
    ],
  },

  acompanamiento: {
    titulo: "Tipos de acompañamiento",
    lead: "Lo mismo que hacemos con un cliente de Lima lo hacemos con uno de Arequipa o de Bogotá: todo es en línea, con equipo en Perú y en España.",
    puntos: [
      { icono: "chat", titulo: "Por escrito y con constancia", texto: "Los mensajes con tu asesor quedan en tu expediente, con fecha y lectura. Nada se pierde en un chat." },
      { icono: "documento", titulo: "Documento a documento", texto: "Ves cómo tiene que quedar cada papel, subes el tuyo y tu asesor lo revisa con observaciones." },
      { icono: "reloj", titulo: "En tu hora y en la de España", texto: "Equipo en Lima y en España: te atendemos en horario de los dos lados del Atlántico." },
      { icono: "escudo", titulo: "Hasta la resolución", texto: "Si el consulado pide algo más, lo resolvemos dentro del plazo. Con la Integral, también el recurso." },
    ],
  },

  checklist: {
    rotulo: "Tu expediente",
    titulo: "¿Qué tienes ya en la mano?",
    lead: "Marca lo que tienes. Con eso te digo por dónde empezamos.",
    de: (n, total) => `${n} de ${total}`,
    faltan: (n) => (n === 1 ? "Te falta 1 documento." : `Te faltan ${n} documentos.`),
    completo: "Lo tienes todo: ahora toca revisarlo antes de la cita.",
    ver: "Ver cómo tiene que quedar cada documento →",
    whatsapp: "Escríbeme con esta lista",
    whatsappDetalle: (tengo, faltan) =>
      faltan.length
        ? `Ya tengo carta de admisión. Tengo ${tengo} documentos y me faltan: ${faltan.join(", ")}. ¿Cómo empezamos?`
        : "Ya tengo carta de admisión y todos los documentos. Quiero que revisen mi expediente.",
  },

  faq: {
    titulo: "Preguntas que nos hacen siempre",
    lista: [
      {
        q: "¿Se paga todo por adelantado?",
        a: "El paquete se paga antes de la cita consular, porque el trabajo se hace antes. Puedes pagarlo al contado o en dos cuotas: la mitad al iniciar y la otra mitad al mes.",
      },
      {
        q: "¿Están en Perú o en España?",
        a: "En los dos. La empresa está en Lima y parte del equipo trabaja desde España, así que el expediente lo ven personas que conocen el consulado de origen y la Extranjería de destino.",
      },
      {
        q: "¿Qué incluye el paquete y qué no?",
        a: "Incluye la asesoría, las declaraciones juradas, la revisión de todos tus documentos, los formularios y, en la Integral, la cita y el recurso. No incluye tasas, seguro, apostillas ni pasajes: eso se paga a quien lo cobra.",
      },
      {
        q: "¿Puedo trabajar con el visado de estudios?",
        a: "Sí. El permiso de estudiante habilita a trabajar hasta 30 horas a la semana, compatibles con tus clases.",
      },
      {
        q: "¿Cuánto tarda el consulado?",
        a: "Normalmente entre uno y dos meses desde la cita, según el consulado y la época. Por eso conviene empezar con antelación: en la sesión miramos tu calendario y decidimos cuándo presentar.",
      },
      {
        q: "¿Y si me lo deniegan?",
        a: "Analizamos la resolución. Con la Asesoría Integral, el recurso de reposición está incluido. Si el recurso no es la mejor vía, te reconducimos a la estancia por estudios.",
      },
      {
        q: "¿Por qué la sesión cuesta y no es gratis?",
        a: "Porque es trabajo de un abogado con tu caso delante, no una charla comercial. Sales con la vía definida y un plan escrito, y con eso decides si contratas un paquete o lo haces tú.",
      },
    ],
  },

  cierre: {
    titulo: "Tienes la carta. Ahora que el visado no sea una apuesta.",
    texto: "Escríbeme y te digo por dónde empezamos. O reserva la sesión y lo vemos con tus documentos delante.",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Reservar sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
    whatsappDetalle: "Ya tengo carta de admisión y quiero tramitar el visado. ¿Cómo empezamos?",
  },

  descargo:
    "Orientación general: la vía y el paquete se confirman en la sesión diagnóstico con tus documentos delante. No garantizamos la concesión del visado, que resuelve el consulado.",
};
