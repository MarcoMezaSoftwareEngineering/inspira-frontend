// src/config/plataforma.js
// Contenido de /plataforma («Portal Inspira») y del sello del portal en las
// páginas de servicio.
//
// Solo se cuenta lo que el portal del asesorado hace de verdad (inventario
// verificado del 11/09/2026, lista «se puede contar»). No mencionar fuentes de
// datos, cómo se calcula nada, herramientas internas, tecnología ni
// proveedores. Tampoco: alertas automáticas de plazos, becas «por
// confirmar», botón de instalar dentro del portal ni instructivo de Android
// propio, porque no existen.

import { NOMBRE_PORTAL, NOMBRE_CORTO, LEMA, FRASE_APOYO, SUBTITULO } from "./portalMarca";

export const HERO = {
  etiqueta: SUBTITULO,
  titulo: `${NOMBRE_PORTAL}:`,
  destacado: "tu caso en un portal propio y en una app",
  descripcion:
    "Tus documentos, tus plazos y los mensajes con tu asesor, en un solo lugar y por escrito. Entras con tu correo de Google desde el teléfono o el ordenador, y lo instalas como una app.",
  cta: "Reserva tu sesión diagnóstico",
  secundario: { texto: `Ya soy cliente: entrar a mi ${NOMBRE_CORTO}`, href: "/panel" },
  lema: LEMA,
  apoyo: FRASE_APOYO.join(" "),
  nota: "Capturas reales del portal con datos de ejemplo, desenfocadas a propósito.",
};

// Los cinco beneficios de la versión extendida del PDF comercial.
export const BENEFICIOS = [
  {
    id: "lugar",
    icono: "panel",
    eyebrow: "Todo en un lugar",
    titulo: "Al entrar sabes quién te atiende y qué te toca hacer hoy",
    texto:
      "Tu Inicio te muestra el nombre de tu asesor y, en «Hoy», lo que te toca hacer por orden de urgencia, con un botón que te lleva justo donde se resuelve. Si tienes varios servicios, los ves todos en el mismo portal.",
    puntos: [
      "Quién te atiende, con un botón para escribirnos por WhatsApp",
      "Tus tareas ordenadas por urgencia",
      "Todos tus servicios, cada uno con sus avisos o «Todo al día»",
    ],
    captura: "inicio",
  },
  {
    id: "plazos",
    icono: "calendario",
    eyebrow: "Cada plazo a la vista",
    titulo: "Tus plazos y el estado de cada trámite, sin tener que preguntar",
    texto:
      "Cada postulación tiene su línea de tiempo: plazo, presentada, resultados y matrícula. Cuando llega un requerimiento, lo ves anotado con su plazo. Y lo que cierra pronto aparece en tu lista de «Hoy».",
    puntos: [
      "Línea de tiempo por portal de postulación",
      "Requerimientos y notificaciones anotados con su plazo",
      "En Andalucía entiendes que es una sola solicitud, con tus opciones en orden",
    ],
    captura: "masterPostulaciones",
  },
  {
    id: "escrito",
    icono: "chat",
    eyebrow: "Todo por escrito",
    titulo: "Mensajes con tu asesor que quedan en tu expediente",
    texto:
      "No es un chat que se pierde: cada mensaje queda con fecha y con quién lo escribió, y nada se edita ni se borra. Ves cuándo leyó tu asesor lo que le escribiste.",
    puntos: [
      "Constancia de lectura en cada mensaje",
      "Copia por correo de cada mensaje de tu asesor",
      "La conversación entera, descargable en PDF",
    ],
    captura: "mensajes",
  },
];

export const EN_TU_HORA = {
  eyebrow: "En tu teléfono, en tu hora",
  titulo: "Estés en Lima o en Madrid, tu expediente va contigo",
  hora: "18:51 Perú · 01:51 España",
  puntos: [
    { icono: "laptop", titulo: "Como una app", texto: "Lo instalas en la pantalla de inicio y subes tus documentos desde el móvil." },
    { icono: "usuario", titulo: "Con tu correo de Google", texto: "El mismo con el que te damos el acceso. Sin contraseñas nuevas." },
    { icono: "reloj", titulo: "Horas de Perú y de España", texto: "En tus mensajes y en las fechas del portal, siempre las dos." },
    { icono: "libro", titulo: "Guías incluidas", texto: "Becas para latinoamericanos, máster, apostilla y estancia, según tu servicio." },
  ],
};

export const AUTOMATIZACION = {
  eyebrow: "Automatización al servicio de tu caso",
  titulo: "El portal se encarga de lo repetitivo; las decisiones las toma tu asesor",
  puntos: [
    { icono: "chat", titulo: "Te avisamos por correo", texto: "Cuando tu asesor revisa un documento, publica tu informe, responde a tu elección o te escribe." },
    { icono: "reloj", titulo: "Tu lista de «Hoy» se ordena sola", texto: "Lo más urgente arriba, con un botón que te lleva a resolverlo." },
    { icono: "documento", titulo: "Tu formulario se guarda solo", texto: "Vas por partes y retomas donde lo dejaste, sin perder lo avanzado." },
    { icono: "euro", titulo: "Tus cálculos, hechos", texto: "En el visado, cuánto dinero acreditar; en la estancia, tus plazos con tus fechas." },
  ],
};

// Un bloque por servicio: lo que ve ese cliente en su portal.
export const POR_SERVICIO = [
  {
    id: "master",
    icono: "birrete",
    etiqueta: "Máster en España",
    titulo: "Tu máster, en seis pasos claros",
    intro: "Documentos, formulario académico, informe, elección, postulaciones y cierre, con tu avance en porcentaje y lo que te toca en cada momento.",
    puntos: [
      "Checklist numerado: el estado de cada documento y la observación de tu asesor en el mismo documento",
      "Modelos reales de cómo debe verse cada documento, con los datos tapados, y guía de apostilla",
      "Informe personalizado de másteres revisado por tu asesor: precio, duración, trámite previo, plazo, becas que lo ofertan y su nota",
      "Tú eliges y ordenas tus másteres; tu asesor te responde máster por máster",
      "Tu asesor vigila los portales por ti; tus claves, resguardos, carta de admisión y matrícula, guardados",
    ],
    capturas: ["masterExpediente", "masterInforme"],
    enlace: { texto: "Ver el Paquete Máster", href: "/servicios/master" },
  },
  {
    id: "visado",
    icono: "pasaporte",
    etiqueta: "Visado de estudios",
    titulo: "Tu visado, con tu solvencia calculada",
    intro: "Sabes cuánto dinero acreditar y qué documentos te pedirá el consulado según tu caso, antes de ir a tu cita.",
    puntos: [
      "Calculadora de la cantidad que debes acreditar",
      "Lista de documentos de solvencia según cómo te financias",
      "Tus documentos revisados por tu asesor, con sus observaciones",
      "Tu cita y el estado de tu visa: requerimientos con su plazo y resultado",
      "Mensajes con tu asesor, con constancia de lectura",
    ],
    capturas: ["visadoCalculadora", "visadoEstado"],
    enlace: { texto: "Ver la visa de estudios", href: "/servicios/visa-estudios" },
  },
  {
    id: "estancia",
    icono: "bandera",
    etiqueta: "Estancia por estudios",
    titulo: "Tu estancia, con tus plazos calculados",
    intro: "Ya en España, ves en qué va tu expediente y cuándo tienes que presentar, calculado con tus fechas.",
    puntos: [
      "Tus plazos: «presentar antes de» y «tope desde tu llegada»",
      "Tus documentos con ejemplo, observación de tu asesor y los que preparamos nosotros",
      "Ficha de cada acompañante, con sus datos y sus documentos",
      "Las comunicaciones de Extranjería en tu expediente, con su plazo y su documento",
      "Mensajes con tu asesor, con constancia de lectura",
    ],
    capturas: ["estanciaPlazos", "estanciaExtranjeria"],
    enlace: { texto: "Ver la estancia por estudios", href: "/servicios/estancia-estudios" },
  },
];

// Primera fila: el portal frente a WhatsApp y los correos perdidos.
export const COMPARATIVA = [
  {
    tema: "Dónde vive tu caso",
    otros: "En un chat de WhatsApp y en correos que se pierden entre cientos de mensajes.",
    inspira: `En tu ${NOMBRE_PORTAL}, que también llevas como app en tu teléfono.`,
  },
  {
    tema: "Tus documentos",
    otros: "Fotos y PDF reenviados por chat, sin saber cuál es la última versión.",
    inspira: "Un checklist con el estado de cada uno y la observación de tu asesor en el propio documento.",
  },
  {
    tema: "Saber en qué punto vas",
    otros: "Escribir para preguntar y esperar respuesta.",
    inspira: "Entrar y ver qué te toca hoy y tu avance, a cualquier hora.",
  },
  {
    tema: "Tus plazos",
    otros: "Apuntados en ninguna parte.",
    inspira: "A la vista, con la línea de tiempo de cada trámite.",
  },
  {
    tema: "Lo que se habló",
    otros: "No queda por escrito cuando hace falta.",
    inspira: "Mensajes con fecha, constancia de lectura y descarga en PDF.",
  },
];

// Pasos del instructivo real de iPhone (correo «Servicio confirmado»), sin emojis.
export const INSTALAR = {
  eyebrow: "Instala la app",
  titulo: "Lleva tu portal en la pantalla de inicio",
  intro: "No hace falta ninguna tienda de aplicaciones: el portal se instala desde el navegador.",
  iphone: [
    { titulo: "Abre Safari", texto: "Entra a www.inspira-legal.cloud desde Safari. Es importante hacerlo desde Safari: otros navegadores no permiten instalarla de esta forma." },
    { titulo: "Pulsa «Compartir»", texto: "Toca el botón de Compartir (el cuadrado con la flecha hacia arriba) de la parte inferior." },
    { titulo: "Selecciona «Añadir a pantalla de inicio»", texto: "Desliza hacia abajo en las opciones y elígela." },
    { titulo: "Pulsa «Añadir»", texto: "El icono de Inspira aparecerá en la pantalla de inicio de tu iPhone." },
  ],
  android: "Desde Chrome: menú → «Instalar aplicación» o «Añadir a pantalla de inicio».",
  nota: "Luego abres la app y pulsas «Entrar con tu correo de Google», con el correo con el que te dimos el acceso.",
};

export const FAQ = [
  {
    q: `¿Cómo entro a mi ${NOMBRE_CORTO}?`,
    a: "Con tu correo de Google, el mismo con el que te damos el acceso. Pulsas «Entrar con tu correo de Google» y listo: no hay usuario ni contraseña nuevos que recordar. El acceso se activa cuando contratas un servicio.",
  },
  {
    q: "¿Es seguro?",
    a: "Solo entra quien tiene el correo de Google al que Inspira dio acceso. Lo que se escribe en los mensajes queda con fecha y con quién lo escribió, y no se edita ni se borra: tienes constancia de todo.",
  },
  {
    q: `¿Qué veo en mi ${NOMBRE_CORTO} según mi servicio?`,
    a: "Siempre ves quién te atiende, lo que te toca hacer hoy, tus documentos y los mensajes con tu asesor. En el máster, además, los seis pasos: tu informe de másteres, tu elección y cada postulación con su línea de tiempo. En el visado, la calculadora de medios, tu lista de solvencia y el estado de tu visa. En la estancia por estudios, tus plazos calculados, tus acompañantes y las comunicaciones de Extranjería.",
  },
  {
    q: "¿Cómo instalo la app?",
    a: "En iPhone, desde Safari: Compartir → «Añadir a pantalla de inicio» → «Añadir». En Android, desde Chrome: menú → «Instalar aplicación» o «Añadir a pantalla de inicio». Al contratar te enviamos también el instructivo por correo.",
  },
  {
    q: "¿Y si no me llega un aviso por correo?",
    a: "Todo lo que te avisamos está también en tu portal: en «Hoy» ves lo pendiente y en Mensajes, lo que te escribió tu asesor. Revisa la carpeta de spam y que usas el mismo correo de Google; si aun así no te llega, escríbenos por WhatsApp al +51 992 009 397.",
  },
];

export const CTA_FINAL = {
  titulo: `Tu ${NOMBRE_PORTAL} se abre al contratar`,
  texto: "Empieza por la sesión diagnóstico de 30 minutos con un abogado especialista: si tu caso es viable y decides avanzar, abrimos tu expediente en el portal.",
};

// ── Sello del portal en las páginas de servicio ─────────────────────────────
// Qué ve cada tipo de servicio, solo con lo verificado. Lo que no está claro
// cae en el texto genérico.
const SELLOS = {
  master: {
    titulo: "Tu informe y tus postulaciones, a la vista",
    texto: `Con este servicio tienes tu ${NOMBRE_PORTAL}: tu informe de másteres, cada postulación con su línea de tiempo y los mensajes con tu asesor, también como app en tu teléfono.`,
    captura: "masterPostulaciones",
  },
  visado: {
    titulo: "Tus documentos, tu solvencia y el estado de tu visa",
    texto: `Con este servicio tienes tu ${NOMBRE_PORTAL}: tus documentos revisados por tu asesor, cuánto dinero acreditar y en qué punto está tu visa, también como app en tu teléfono.`,
    captura: "visadoEstado",
  },
  estancia: {
    titulo: "Tus plazos y tu trámite ante Extranjería",
    texto: `Con este servicio tienes tu ${NOMBRE_PORTAL}: tus plazos calculados con tus fechas, tus documentos y las comunicaciones de Extranjería, también como app en tu teléfono.`,
    captura: "estanciaPlazos",
  },
  generico: {
    titulo: `Tu expediente en tu ${NOMBRE_PORTAL}`,
    texto: "Tu expediente, tus documentos y los mensajes con tu asesor en un solo lugar, también como app en tu teléfono.",
    captura: "inicio",
  },
};

// Solo el máster en España tiene verificados informe y postulaciones en el
// portal; grado, FP y los másteres de otros países llevan el texto genérico.
const TIPO_POR_SERVICIO = {
  "master-espana": "master",
  "visa-estudios": "visado",
  "estancia-estudios": "estancia",
};

export const selloDe = (servicioId) =>
  SELLOS[TIPO_POR_SERVICIO[servicioId] || "generico"];

export const SELLO_ESTANCIA = SELLOS.estancia;
