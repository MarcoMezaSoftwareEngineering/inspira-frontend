// src/pages/landing/master/textos.js
//
// Textos de /master, la landing que se manda a quien escribe «quiero hacer un
// máster en España». Reestructurada el 24/09/2026 a petición del cliente: la
// de antes se centraba en los paquetes y los precios; esta cuenta lo que al
// cliente le importa, en este orden: por qué España, por qué un máster
// oficial, cuánto cuesta el máster, qué hacemos por él y cómo, por qué
// nosotros. El precio del paquete no sale: se cotiza en la sesión.
//
// Nada inventado: el contenido sale de config/paqueteMaster2027.js (INCLUYE,
// BENEFICIOS, PAGINA_MASTER, MATRICULA, FAQ), config/rutas.js (RUTAS.estudios),
// config/plataforma.js (POR_SERVICIO) y CATEGORIAS_CASOS.
import { SESION_DIAGNOSTICO } from "../../../config/metodo";
import { eur } from "../../../config/paqueteMaster2027Resumen";
import { MATRICULA, TASA_PREVIA } from "../../../config/paqueteMaster2027";
import { CATEGORIAS_CASOS } from "../../../config/casos";

const apelaciones = CATEGORIAS_CASOS.find((c) => c.id === "apelaciones-ganadas") || CATEGORIAS_CASOS[3];

const MEDIA = "https://www.inspira-legal.cloud/media";
const desdeMatricula = eur(Math.min(...MATRICULA.filas.filter((f) => f.min).map((f) => f.min)));

export const MASTER = {
  seo: {
    title: "Máster oficial en España: por qué, cuánto cuesta y cómo te llevamos",
    description:
      "Por qué estudiar un máster oficial en España, cuánto cuesta la matrícula en cada comunidad, qué hace Inspira Legal por ti y cómo lo hace: informe de másteres, postulación, expediente digital y visado. Empieza con una sesión diagnóstico.",
    path: "/master",
    imagen: "/og/master-en-espana.jpg",
  },

  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  graduacion: `${MEDIA}/foto/carina-graduacion.jpg`,

  // La cinta que pasa bajo las cifras: ciudades y lo que más se pregunta.
  cinta: ["Madrid", "Valencia", "Sevilla", "Granada", "Salamanca", "Bilbao", "Santiago", "Málaga", "Zaragoza", "Curso 2027/2028", "Títulos oficiales", "30 h de trabajo", "Desde Lima"],

  hero: {
    rotulo: "Máster oficial en España · curso 2027/2028",
    tituloInicio: "Tu máster en",
    palabras: ["Madrid", "Valencia", "Sevilla", "Granada", "Galicia", "Bilbao", "España"],
    tituloFin: "lo hacemos contigo, de la búsqueda a la matrícula.",
    lead: "Elegimos tus másteres con datos, postulamos por ti y llevamos tu expediente por escrito hasta que tienes la carta de admisión y el visado. Tú decides; nosotros hacemos.",
    quien: "Carina Meza · CEO y consultora legal",
    whatsapp: "Quiero mi cotización",
    sesion: `Sesión diagnóstico · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionCorta: `Sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
    whatsappDetalle: "Quiero hacer un máster en España. ¿Me cotizan según mi caso?",
  },

  porqueEspana: {
    rotulo: "Por qué España",
    titulo: "La puerta de entrada a Europa que más funciona",
    lead: "Entras legalmente, trabajas desde el primer día y, cuando terminas, tienes varias vías para quedarte.",
    puntos: [
      { icono: "maletin", titulo: "Trabajas 30 horas a la semana", texto: "El permiso de estudiante habilita a trabajar hasta 30 horas semanales, compatibles con tus clases." },
      { icono: "euro", titulo: `Matrícula pública desde ${desdeMatricula} al año`, texto: "En las comunidades más económicas un máster oficial de 60 créditos cuesta menos que un semestre en una privada peruana." },
      { icono: "bandera", titulo: "Mismo idioma, títulos que valen", texto: "Estudias en español y sales con un título oficial reconocido en toda la Unión Europea." },
      { icono: "casa", titulo: "Después, te quedas", texto: "Al terminar puedes pasar de estudiante a residente: la vía natural hacia la residencia y, con los años, la nacionalidad." },
    ],
  },

  oficial: {
    rotulo: "Por qué un máster oficial",
    titulo: "¿No sabes si tu programa vale para la visa de estudios?",
    lead: "Con nosotros no hay duda: trabajamos solo con másteres universitarios oficiales, inscritos en el registro del Ministerio (RUCT), en universidades públicas con ranking.",
    sellos: [
      { icono: "check", texto: "Programas 100 % válidos para el visado" },
      { icono: "birrete", texto: "Universidades públicas" },
      { icono: "estrella", texto: "Con ranking QS" },
    ],
    puntos: [
      { icono: "escudo", titulo: "Apto para el visado", texto: "El consulado pide estar admitido en estudios oficiales. Un título propio obliga a revisar caso por caso, y muchas veces no pasa." },
      { icono: "globo", titulo: "Vale en toda Europa", texto: "Reconocido en el Espacio Europeo de Educación Superior. Es el que luego puedes hacer valer o homologar en Perú." },
      { icono: "birrete", titulo: "Sin homologar tu título", texto: "Para postular no necesitas homologar: la universidad comprueba que tu grado equivale a uno español." },
    ],
    aviso: "Que el título sea oficial no asegura la plaza: la admisión la decide cada universidad. Por eso postulamos a varias.",
  },

  cuesta: {
    rotulo: "Cuánto cuesta el máster",
    titulo: "La matrícula la fija cada comunidad, no la universidad",
    lead: "Un año de máster oficial (60 créditos) para estudiante extracomunitario, según la norma de cada comunidad. Es lo que pagas a la universidad; nuestro paquete va aparte.",
    desde: "desde",
    alAnio: "al año",
    comunidades: (n) => (n === 1 ? "1 comunidad" : `${n} comunidades`),
    cadaUni: "En Cataluña lo fija cada universidad",
    vivir: (mes) => `Para vivir, el visado te pide acreditar ${mes} al mes (IPREM).`,
    verMatricula: "Ver la matrícula por comunidad",
    ocultarMatricula: "Ocultar el mapa",
    calcular: "Calcular mi caso",
    ocultarCalculadora: "Cerrar la calculadora",
    nota: "Orientativo, curso 2026-27. Cada universidad fija su importe exacto y varias comunidades cobran además una tasa previa de estudio del título.",
  },

  errores: {
    rotulo: "Errores comunes al postular",
    titulo: "Lo que tumba una postulación, y cómo lo evitamos",
    lead: "Casi todas las postulaciones que fallan lo hacen por lo mismo. Nosotros las vemos venir: subsanamos, reclamamos y te dejamos siempre con más de una opción.",
    error: "El error",
    nosotros: "Con Inspira",
    pista: "Desliza para ver todos",
    lista: [
      {
        icono: "reloj",
        titulo: "Postular fuera de plazo",
        error: "Las fases solo para extranjeros cierran pronto: la Fase 0 valenciana y la fase de extranjeros de Andalucía van de noviembre a febrero. Quien espera a marzo llega tarde a las mejores ventanas y a las becas.",
        solucion: "Calendario de plazos por universidad en tu portal: lo que cierra en dos semanas, avisado; a tres días, en rojo.",
      },
      {
        icono: "escudo",
        titulo: "Elegir un título propio",
        error: "No es oficial: no vale para el visado ni se puede homologar después. Y en la web de la universidad no siempre se distingue.",
        solucion: "Solo másteres inscritos en el RUCT, y comprobamos que el centro es apto para el visado de estudios.",
      },
      {
        icono: "diana",
        titulo: "Postular a una sola universidad",
        error: "La admisión la decide cada universidad: con una sola opción, un «no» te deja sin curso.",
        solucion: "Finalistas y alternativas en tu informe, y postulamos a varias. Siempre tienes múltiples opciones.",
      },
      {
        icono: "euro",
        titulo: "No mirar el precio antes",
        error: "Madrid o la Comunidad Valenciana pueden costar varias veces más que Galicia o Andalucía para un extracomunitario. Se descubre tarde, con la carta en la mano.",
        solucion: "El precio de cada máster según la norma de su comunidad va en tu informe, antes de elegir.",
      },
      {
        icono: "documento",
        titulo: "Documentos que no pasan",
        error: `Sin apostilla, sin traducción jurada o sin pagar la tasa previa de estudio del título (entre ${TASA_PREVIA[0]} y ${TASA_PREVIA[1]} €) que exigen varias comunidades. Un documento mal preparado tumba la solicitud entera.`,
        solucion: "Revisión documento a documento, con modelos de cómo debe quedar cada uno y la observación de tu asesor.",
      },
      {
        icono: "campana",
        titulo: "Ignorar un requerimiento",
        error: "Las universidades piden subsanar en plazos cortos. Si no lo ves, la solicitud queda archivada.",
        solucion: "Tu asesor vigila los portales, anota cada requerimiento con su plazo y nos encargamos de la subsanación.",
      },
      {
        icono: "balanza",
        titulo: "Aceptar el resultado sin más",
        error: "Una exclusión o una lista de espera muchas veces se pueden reclamar, y casi nadie lo hace.",
        solucion: `Reclamamos y apelamos los resultados cuando hay motivo: ${apelaciones.cifra} ${apelaciones.titulo.toLowerCase()}.`,
      },
      {
        icono: "birrete",
        titulo: "Un máster habilitante sin homologar",
        error: "Abogacía, profesorado o ingenierías exigen el título homologado. Postular sin él es tiempo perdido.",
        solucion: "Lo revisamos en la sesión diagnóstico y, si hace falta, tramitamos la homologación antes de postular.",
      },
    ],
  },

  portal: {
    ejemplo: "Ejemplo con datos de muestra",
    informe: {
      cab: "Informe de másteres",
      pagina: "1 de 4",
      master: "Máster Universitario en Cooperación al Desarrollo, Gestión Pública y de las ONGDs",
      uni: "Universidad de Granada · Andalucía",
      datos: [["Matrícula", "821 €/año"], ["Plazo", "13 – 29 ene"], ["Beca", "AUIP"]],
      chip: "Finalista · elegido por ti",
    },
    postulaciones: {
      cab: "Postulaciones",
      portal: "Distrito Único Andaluz",
      hitos: [["Plazo", "13 – 29 ene", "ok"], ["Presentada", "21 ene", "ok"], ["Resultados", "19 feb", "ahora"], ["Matrícula", "", ""]],
      chip: "Requerimiento anotado · vence en 5 días",
    },
  },

  hacemos: {
    rotulo: "Qué hacemos por ti",
    titulo: "Despreocúpate por todo: nos encargamos de cada paso.",
    lead: "Tú eliges; nosotros buscamos, postulamos y seguimos. Esto es lo que incluye trabajar con Inspira, sea cual sea la comunidad a la que postules.",
    ademas: "Y además",
  },

  como: {
    rotulo: "Cómo lo hacemos",
    titulo: "Seis pasos, cada uno en tu portal",
    lead: "Así avanza tu expediente. En cada paso sabes qué te toca a ti y qué nos toca a nosotros.",
    pasos: [
      { icono: "balanza", titulo: "Sesión diagnóstico", tu: "Cuentas tu caso y tus objetivos.", nosotros: "Te decimos si es viable, qué vía te toca y salimos con un plan escrito." },
      { icono: "documento", titulo: "Documentos y formulario académico", tu: "Subes tus documentos al portal.", nosotros: "Los revisamos uno a uno, con observación en el mismo documento y modelos de cómo deben quedar." },
      { icono: "libro", titulo: "Informe de másteres", captura: "informe", tu: "Lees tus finalistas y tus alternativas.", nosotros: "Cruzamos tu perfil con más de 3.000 másteres oficiales: precio según la norma, becas posibles y plazos." },
      { icono: "diana", titulo: "Elección", tu: "Eliges y ordenas tus másteres.", nosotros: "Te respondemos máster por máster: notas de corte, requisitos y si el centro es apto para el visado." },
      { icono: "rayo", titulo: "Postulaciones", captura: "postulaciones", tu: "Sigues cada plazo en tu portal.", nosotros: "Postulamos por ti en cada universidad y vigilamos los portales: requerimientos, listas, resultados." },
      { icono: "trofeo", titulo: "Carta de admisión y visado", tu: "Celebras.", nosotros: "Te guiamos en la matrícula y la carta, y abrimos la vía migratoria: visado o estancia por estudios." },
    ],
    tuEtiqueta: "Tú",
    nosotrosEtiqueta: "Nosotros",
  },

  nosotros: {
    rotulo: "Por qué nosotros",
    titulo: "Un portal propio, un equipo que da la cara y resultados que se pueden comprobar",
  },

  videos: {
    rotulo: "Carina te lo cuenta",
    titulo: "Un minuto por vídeo, sin humo",
    lead: "Días de resultados, admisiones de verdad, una beca conseguida y qué pasa cuando una universidad dice que no.",
    lista: [
      { id: "1", src: `${MEDIA}/video/carina-1.mp4`, poster: `${MEDIA}/video/carina-1.jpg`, titulo: "¿Quieres estudiar un máster en España?" },
      { id: "17", src: `${MEDIA}/video/carina-17.mp4`, poster: `${MEDIA}/video/carina-17.jpg`, titulo: "Admitido en la Complutense: descargando la carta de admisión" },
      { id: "15", src: `${MEDIA}/video/carina-15.mp4`, poster: `${MEDIA}/video/carina-15.jpg`, titulo: "Día de resultados en la Politécnica de Valencia" },
      { id: "18", src: `${MEDIA}/video/carina-18.mp4`, poster: `${MEDIA}/video/carina-18.jpg`, titulo: "¡Admitido! Córdoba, Ceuta, Almería y Granada" },
      { id: "4", src: `${MEDIA}/video/carina-4.mp4`, poster: `${MEDIA}/video/carina-4.jpg`, titulo: "Admitida a un máster en Andalucía" },
      { id: "16", src: `${MEDIA}/video/carina-16.mp4`, poster: `${MEDIA}/video/carina-16.jpg`, titulo: "Máster en Galicia 2026: USC, Vigo y A Coruña" },
      { id: "3", src: `${MEDIA}/video/carina-3.mp4`, poster: `${MEDIA}/video/carina-3.jpg`, titulo: "Me rechazaron en la Complutense… y qué hicimos" },
      { id: "14", src: `${MEDIA}/video/carina-14.mp4`, poster: `${MEDIA}/video/carina-14.jpg`, titulo: "¿Te rechazaron? Qué evaluamos antes de volver a postular" },
      { id: "7", src: `${MEDIA}/video/carina-7.mp4`, poster: `${MEDIA}/video/carina-7.jpg`, titulo: "Beca AUIP para un máster en Valencia" },
      { id: "2", src: `${MEDIA}/video/carina-2.mp4`, poster: `${MEDIA}/video/carina-2.jpg`, titulo: "Máster + trabajo de 30 h a la semana" },
      { id: "8", src: `${MEDIA}/video/carina-8.mp4`, poster: `${MEDIA}/video/carina-8.jpg`, titulo: "Cuándo postular: las fechas que importan" },
    ],
  },

  precio: {
    rotulo: "¿Y el precio del paquete?",
    titulo: "Te lo cotizamos según tu caso",
    texto: "Depende de a cuántas comunidades postules y de si necesitas visado o estancia. No te vendemos un paquete a ciegas: primero la sesión diagnóstico, y con tu caso delante te mandamos la cotización por escrito. Se paga por etapas, nunca de golpe.",
    whatsapp: "Pedir mi cotización por WhatsApp",
    sesion: `Reservar la sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
    paquetes: "Ver los paquetes y precios",
    paquetesHref: "/servicios/master",
    sesionTexto: `${SESION_DIAGNOSTICO.duracion} por videollamada con un abogado especialista. ${SESION_DIAGNOSTICO.gancho}`,
  },

  faqIds: ["cuando-postular", "si-no-admiten", "matricula", "becas", "homologar", "trabajar", "como-pago"],
  faqTitulo: "Preguntas que nos hacen siempre",

  cierre: {
    titulo: "Tu máster en España empieza con una conversación",
    texto: "Escríbenos y te decimos por dónde empezar. O reserva la sesión y lo vemos con tu caso delante.",
  },

  descargo:
    "No garantizamos la admisión, el visado ni la beca: los deciden la universidad, el consulado y la entidad que convoca. Matrículas orientativas del curso 2026-27 según la norma de cada comunidad; cada universidad fija su importe exacto.",
};
