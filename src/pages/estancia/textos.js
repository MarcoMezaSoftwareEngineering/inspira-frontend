// src/pages/estancia/textos.js
//
// Textos de /estancia, la landing que se manda a quien ya está en España (o
// va a entrar como turista) y pregunta cómo quedarse a estudiar. Todo lo que
// se afirma sale de config: el paquete y su precio (metodo.js,
// ESTANCIA_ESTUDIOS), los pasos (serviciosProceso.js), las reglas y la
// comparativa (visaOEstancia.js), las cifras (CATEGORIAS_CASOS) y los modelos
// de documentos que ya usa el portal (public/modelos/estancia-*.html).
import { ESTANCIA_ESTUDIOS, SESION_DIAGNOSTICO } from "../../config/metodo";
import { eur } from "../../config/paqueteMaster2027Resumen";
import { DIAS_ANTELACION, DIAS_PROCESO_ESTANCIA, IPREM_ANUAL, IPREM_MES } from "../../config/visaOEstancia";
import { CATEGORIAS_CASOS } from "../../config/casos";

const MEDIA = "https://www.inspira-legal.cloud/media";
const extranjeria = CATEGORIAS_CASOS.find((c) => c.id === "extranjeria-aprobada");

export { ESTANCIA_ESTUDIOS, SESION_DIAGNOSTICO };

export const ESTANCIA = {
  seo: {
    title: "Estancia por estudios en España: ya estás aquí, quédate a estudiar",
    description:
      "Si entraste como turista, la estancia por estudios se presenta desde España, 100 % telemática y con permiso de trabajo de 30 horas. Calcula tus plazos, revisa los documentos y los motivos de denegación más comunes.",
    path: "/estancia",
    imagen: "/og/estancia-estudios.jpg",
  },

  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  graduacion: `${MEDIA}/foto/carina-graduacion.jpg`,
  cinta: ["Firma digital del abogado", "Vía MERCURIO", "Sin citas ni colas", "Casilla electrónica", "Notificaciones en tu app", "30 h de trabajo", `${extranjeria.cifra} ${extranjeria.titulo.toLowerCase()}`, "Tú, a tus clases"],

  hero: {
    rotulo: "Estancia por estudios · ya en España",
    tituloInicio: "¿Ya estás en",
    palabras: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "España"],
    tituloFin: "Tu vía es la estancia por estudios.",
    lead: "Se presenta desde España, con la firma digital de nuestro abogado, vía MERCURIO. Nosotros nos encargamos de todo el expediente; tú, de tus clases y de tus primeros días en España. Y con permiso de trabajo de 30 horas.",
    quien: "Carina Meza · CEO y consultora legal",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Sesión diagnóstico · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionCorta: `Sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
    whatsappDetalle: "Ya estoy en España (o entro pronto como turista) y quiero tramitar la estancia por estudios. ¿Cómo empezamos?",
  },

  plazo: {
    rotulo: "Tu plazo",
    titulo: "¿Hasta cuándo puedes presentar?",
    lead: "Desde que llegas tienes 90 días como turista, y Extranjería pide presentar con dos meses de antelación. Pon tu fecha de entrada y te doy tu último día.",
    entrada: "¿Cuándo entraste (o entras) a España?",
    entradaAyuda: "La fecha del sello de entrada, o la del vuelo si aún no has viajado.",
    tope: "Tu último día para presentar",
    formula: "Tu llegada + 90 días − 2 meses",
    diasTurista: 90,
    verde: (n, fecha) => `Tienes hasta el ${fecha}: ${n === 1 ? "queda 1 día" : `quedan ${n} días`}. Escríbenos hoy y llegamos con margen.`,
    futuro: (fecha) => `Aún no has entrado. Desde tu llegada, tu último día para presentar será el ${fecha}: conviene traer el expediente casi listo.`,
    rojo: "Ese día ya pasó. No es un no: hay que mirar tu situación en la sesión antes de presentar nada.",
    descargo: "Cálculo orientativo con la regla general. La fecha exacta se confirma en la sesión, con tu pasaporte delante.",
  },

  todo: {
    rotulo: "Nos encargamos de todo",
    titulo: "Tú te ocupas de tus clases y de tus primeros días en España. Nosotros, del expediente.",
    lead: "Un abogado colegiado prepara, firma y presenta tu estancia por vía telemática. No pides cita, no haces cola, no vas a ninguna oficina.",
    firmaTitulo: "Presentación con firma digital del abogado, vía MERCURIO",
    firmaTexto: "MERCURIO es la plataforma telemática de Extranjería. Tu expediente entra firmado digitalmente por nuestro abogado, con registro de fecha y hora, sin depender de una cita.",
    lista: [
      "Diagnóstico jurídico personalizado de tu caso.",
      "Revisión integral de tu documentación.",
      "Preparación y organización completa del expediente.",
      "Presentación telemática mediante MERCURIO con firma digital de abogado.",
      "Requerimientos y subsanaciones durante todo el procedimiento.",
      "Seguimiento constante de tu expediente.",
      "Acompañamiento hasta la resolución final.",
      "Modelos oficiales y guía para abrir cuenta bancaria, empadronarte y contratar el seguro médico válido.",
    ],
  },

  documentos: {
    rotulo: "Los documentos",
    titulo: "Lo que lleva una estancia por estudios",
    lead: "Todos con modelo de cómo deben quedar y revisados por tu asesor antes de presentar.",
    lista: [
      { icono: "birrete", nombre: "Carta de admisión oficial y reciente", nota: "De un centro apto para la estancia." },
      { icono: "pasaporte", nombre: "Pasaporte completo", nota: "Con el sello de entrada a España." },
      { icono: "euro", nombre: `Extracto sellado de cuenta española`, nota: `Con ${eur(IPREM_ANUAL)}: el 100 % del IPREM por mes.` },
      { icono: "salud", nombre: "Certificado médico en impreso oficial", nota: "Con la frase del Reglamento Sanitario Internacional." },
      { icono: "escudo", nombre: "Seguro médico", nota: "Sin copagos ni carencias, por toda la estancia." },
      { icono: "balanza", nombre: "Antecedentes penales apostillados", nota: "De los países donde viviste los últimos cinco años." },
      { icono: "documento", nombre: "Formulario oficial y tasa de Extranjería", nota: "Los preparamos nosotros; la tasa se paga aparte." },
    ],
  },

  app: {
    rotulo: "Tu expediente en la app de Inspira",
    titulo: "Casilla electrónica, notificaciones y cada plazo a la vista",
    lead: "Las notificaciones de Extranjería llegan a la casilla electrónica del abogado: las recibimos, las anotamos en tu expediente con su plazo y las contestamos. Tú lo ves todo en tu app, por escrito.",
    puntos: [
      { icono: "campana", titulo: "Notificaciones de Extranjería", texto: "Cada comunicación queda en tu expediente con su plazo y su documento. Ninguna se pierde en un correo." },
      { icono: "calendario", titulo: "Tus plazos calculados", texto: "«Presentar antes de» y «tope desde tu llegada», con tus fechas." },
      { icono: "documento", titulo: "Documentos con ejemplo", texto: "Cada uno con su modelo, la observación de tu asesor y los que preparamos nosotros." },
      { icono: "chat", titulo: "Mensajes con constancia de lectura", texto: "Lo que hablas con tu asesor queda por escrito, con fecha y lectura." },
      { icono: "usuarios", titulo: "Tus acompañantes", texto: "Ficha de cada uno, con sus datos y sus documentos." },
      { icono: "laptop", titulo: "En tu teléfono", texto: "Entras con tu correo de Google y lo instalas como app." },
    ],
    enlace: "Ver el portal por dentro",
    href: "/plataforma",
    mock: {
      ejemplo: "Ejemplo con datos de muestra",
      cab: "Extranjería",
      sub: "2 comunicaciones en tu expediente",
      n: "2",
      filas: [
        { icono: "campana", titulo: "Requerimiento de subsanación", detalle: "Aportar extracto bancario actualizado · PDF adjunto", plazo: "vence en 8 días", urgente: true },
        { icono: "check", titulo: "Acuse de presentación · MERCURIO", detalle: "Firmado digitalmente por tu abogado", plazo: "13 oct · 10:32" },
      ],
      plazos: [["Presentar antes de", "13 de octubre"], ["Tope desde tu llegada", "13 de octubre"]],
    },
  },

  denegaciones: {
    rotulo: "Por qué deniegan",
    titulo: "Los motivos de denegación más comunes",
    lead: "Extranjería no pide el historial del consulado, pero es igual de estricta con la forma. Estos ocho tumban la mayoría de las estancias.",
    motivo: "El motivo",
    evitamos: "Cómo lo evitamos",
    lista: [
      { icono: "euro", titulo: "El extracto no vale", motivo: `Una captura de la app, un PDF sin sello, una cuenta que no es española o a nombre de otra persona, o un saldo por debajo de ${eur(IPREM_ANUAL)}.`, evitamos: "Guía para abrir la cuenta, extracto sellado en oficina y saldo con margen, tal como lo quiere Extranjería." },
      { icono: "documento", titulo: "Certificado médico en papel de la clínica", motivo: "Sin el impreso oficial del Colegio de Médicos, sin sello o sin la frase del Reglamento Sanitario Internacional de 2005.", evitamos: "Modelo exacto para tu médico y revisión antes de subirlo." },
      { icono: "reloj", titulo: "Presentar fuera de tus 90 días", motivo: "Si se presenta cuando ya no estás en situación regular como turista, el expediente nace mal.", evitamos: "Calendario desde el sello de entrada: fecha tope y fecha recomendada, con margen." },
      { icono: "calendario", titulo: "Menos de dos meses sin explicarlo", motivo: "Con menos antelación al inicio de clases y sin escrito de excepcionalidad, Extranjería lo devuelve.", evitamos: "Si vamos justos, el escrito de excepcionalidad va en el expediente desde el primer día." },
      { icono: "birrete", titulo: "Carta de admisión que no sirve", motivo: "Condicional, antigua, de un título propio o de un centro no apto para la estancia.", evitamos: "Comprobamos el centro y la carta antes de abrir el expediente." },
      { icono: "salud", titulo: "Seguro con copagos", motivo: "Un seguro de viaje o con copagos y carencias no cumple: hace falta asistencia sanitaria completa durante toda la estancia.", evitamos: "Te decimos qué póliza contratar y revisamos el certificado." },
      { icono: "campana", titulo: "Requerimiento sin contestar", motivo: "Extranjería pide subsanar en un plazo corto; si no se responde, el expediente se archiva.", evitamos: "Cada requerimiento queda anotado en tu portal con su plazo, y la subsanación la hacemos nosotros." },
      { icono: "balanza", titulo: "Antecedentes caducados o sin apostilla", motivo: "Sin apostilla de La Haya o con más de tres meses de antigüedad no valen.", evitamos: "Los pedimos pensando en la fecha de presentación, no antes." },
    ],
  },

  resultados: {
    rotulo: "Resultados",
    titulo: "Lo que ya hemos conseguido",
    lead: "Cifras de nuestros expedientes, las únicas que podemos sustanciar. Y las opiniones, en Google.",
    clave: "extranjeria-aprobada",
    casos: "Ver los casos de éxito →",
    resolucionesRotulo: (anio) => `Resoluciones de ${anio}`,
    resolucionesTitulo: "Estancias concedidas, con nombre y oficina",
    resolucionesLead: "Autorizaciones iniciales y prórrogas resueltas por Extranjería a asesorados de Inspira. Solo el nombre de pila: el resto es suyo.",
    concedida: "Concedida",
    oficina: (o) => `Extranjería de ${o}`,
    vigencia: (hasta) => `Válida hasta el ${hasta}`,
    meses: (n) => `${n} meses de autorización`,
    dias: (n) => (n === 0 ? "Resuelta el mismo día" : n === 1 ? "Resuelta en 1 día" : n >= 28 && n <= 31 ? "Resuelta en un mes" : `Resuelta en ${n} días`),
    verResolucion: "Ver la resolución",
    resolucionDe: (nombre) => `Resolución de ${nombre}`,
    tapado: "Datos personales tapados. En amarillo, lo que importa: la concesión, la validez y el permiso de trabajo.",
    cerrar: "Cerrar",
    presentada: (f) => `Presentada el ${f}`,
    trabajo: "Con permiso de trabajo",
    nota: "Fechas tal como constan en cada resolución. Los plazos de Extranjería varían por oficina y época: no son una promesa.",
  },

  paquete: {
    rotulo: "Seguridad",
    titulo: (precio) => `Lo que vale ${precio}: un abogado detrás de tu expediente hasta la resolución`,
    lead: "No es un trámite que haces solo con un PDF de internet. Un abogado colegiado firma y presenta, contesta cada requerimiento en plazo y deja todo por escrito en tu app. Antes, la sesión diagnóstico: te decimos si tu caso es viable y con qué fechas.",
    garantias: [
      { icono: "escudo", titulo: "Firmado y presentado por un abogado", texto: "Con su firma digital, vía MERCURIO, y registro de fecha y hora." },
      { icono: "campana", titulo: "Ni una notificación perdida", texto: "Casilla electrónica del abogado: recibimos, anotamos y contestamos cada comunicación de Extranjería." },
      { icono: "rayo", titulo: "Requerimientos y subsanaciones incluidos", texto: "Si Extranjería pide algo más, lo resolvemos nosotros dentro del plazo." },
      { icono: "check", titulo: "Solo casos viables", texto: "Si tu caso no es viable hoy, te lo decimos en la sesión, antes de cobrarte el paquete." },
    ],
    incluye: "Incluye",
    noIncluye: "No incluye",
    para: "Para ti si…",
    elegir: "Quiero este paquete",
    permisoCorto: "Con permiso de trabajo · 30 h",
    garantiaTexto: "No garantizamos la resolución, que depende de Extranjería. Sí garantizamos un expediente completo, bien fundamentado y presentado en plazo.",
    sesionTitulo: `Primero, la sesión diagnóstico · ${SESION_DIAGNOSTICO.duracion} · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionTexto: "Por videollamada, con tu pasaporte y tu carta delante. Sales con tus fechas y la lista exacta de documentos. Si tu caso no es viable hoy, te lo decimos ahí.",
  },

  como: {
    rotulo: "Cómo lo hacemos",
    titulo: "Seis pasos, sin pisar una oficina",
    lead: "Del diagnóstico a la TIE. Cada paso queda en tu app, por escrito, mientras tú empiezas tus clases.",
  },

  videos: {
    titulo: "Te lo explico en un minuto",
    lead: "Visado o estancia, cómo se demuestra el dinero y lo que cambió este año.",
    lista: [
      { id: "5", src: `${MEDIA}/video/carina-5.mp4`, poster: `${MEDIA}/video/carina-5.jpg`, titulo: "Visa de estudios vs. estancia por estudios" },
      { id: "12", src: `${MEDIA}/video/carina-12.mp4`, poster: `${MEDIA}/video/carina-12.jpg`, titulo: "Medios económicos: cómo se demuestra el dinero" },
      { id: "13", src: `${MEDIA}/video/carina-13.mp4`, poster: `${MEDIA}/video/carina-13.jpg`, titulo: "Actualización: antelación y títulos válidos" },
      { id: "10", src: `${MEDIA}/video/carina-10.mp4`, poster: `${MEDIA}/video/carina-10.jpg`, titulo: "Me denegaron el visado: qué dice la notificación" },
    ],
  },

  faq: {
    titulo: "Preguntas que nos hacen siempre",
    lista: [
      { q: "¿Necesito estar en España para tramitarla?", a: "Sí. Se solicita estando en España en situación regular, dentro de tus días como turista. En la sesión planificamos las fechas exactas de tu viaje y de la presentación." },
      { q: "¿De verdad es todo en línea?", a: "Sí. Presentamos el expediente por vía telemática ante Extranjería con la firma digital del abogado, a través de MERCURIO. No pides cita ni vas a ninguna oficina para presentar." },
      { q: "¿Cuánto dinero tengo que tener?", a: `El 100 % del IPREM por mes de estancia: ${eur(IPREM_MES)} al mes, ${eur(IPREM_ANUAL)} para un curso completo, en una cuenta española a tu nombre. Extranjería no pide los seis meses de extractos ni el origen del dinero que exige el consulado.` },
      { q: "¿Puedo trabajar?", a: "Sí. La estancia por estudios incluye permiso para trabajar hasta 30 horas a la semana." },
      { q: "¿Cuánto tarda?", a: `Unos ${Math.round(DIAS_PROCESO_ESTANCIA / 30)} meses desde que entras como turista hasta la resolución, entre abrir la cuenta, empadronarte, presentar y que Extranjería resuelva. Mientras, tú ya estás en clase.` },
    { q: "¿Cómo me entero de lo que dice Extranjería?", a: "Las notificaciones llegan a la casilla electrónica del abogado. Las recibimos nosotros, las anotamos en tu expediente con su plazo y su documento, y las contestamos. Tú lo ves en tu app, sin perseguir a nadie." },
      { q: "¿Y si me lo deniegan?", a: "La resolución final depende de Extranjería. El paquete no incluye el recurso de reposición ni el contencioso; si hiciera falta, lo cotizamos aparte. Lo que sí garantizamos es un expediente completo, bien fundamentado y presentado en plazo, y solo asumimos casos viables." },
      { q: "¿Y después de la resolución?", a: "Te guiamos con la TIE, el empadronamiento y el seguro médico. Y cuando termines, con el paso de estudiante a residente." },
    ],
  },

  cierre: {
    titulo: "Ya estás aquí. Que quedarte no sea una apuesta.",
    texto: "Escríbeme con tu fecha de entrada y te digo si llegas. O reserva la sesión y lo vemos con tu pasaporte delante.",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Reservar sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
  },

  descargo:
    `Orientación general: el plazo y la vía se confirman en la sesión diagnóstico con tus documentos delante. No garantizamos la concesión de la estancia, que resuelve Extranjería. La tasa de Extranjería se paga aparte. Regla usada: presentar dentro de los 90 días de estancia como turista con ${DIAS_ANTELACION} días de antelación.`,
};
