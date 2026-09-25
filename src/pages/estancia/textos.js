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
  cinta: ["100 % telemática", "Sin citas ni colas", "Firma digital del abogado", "30 h de trabajo", `${eur(IPREM_ANUAL)} en cuenta española`, "Dentro de tus 90 días", "MERCURIO", `${extranjeria.cifra} ${extranjeria.titulo.toLowerCase()}`],

  hero: {
    rotulo: "Estancia por estudios · ya en España",
    tituloInicio: "¿Ya estás en",
    palabras: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "España"],
    tituloFin: "Tu vía es la estancia por estudios.",
    lead: "Entraste como turista y quieres quedarte a estudiar: se presenta desde aquí, ante Extranjería, sin citas ni consulado, con firma digital del abogado. Y con permiso de trabajo de 30 horas.",
    quien: "Carina Meza · CEO y consultora legal",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Sesión diagnóstico · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionCorta: `Sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
    whatsappDetalle: "Ya estoy en España (o entro pronto como turista) y quiero tramitar la estancia por estudios. ¿Cómo empezamos?",
  },

  plazos: {
    rotulo: "Tus plazos",
    titulo: "¿Hasta cuándo puedes presentar?",
    lead: "La estancia se presenta estando en España, dentro de tus días como turista, y Extranjería la quiere dos meses antes del inicio de clases. Pon tus dos fechas y te lo digo.",
    entrada: "¿Cuándo entraste (o entras) a España?",
    entradaAyuda: "La fecha del sello de entrada, o la del vuelo si aún no has viajado.",
    clases: "¿Cuándo empiezan tus clases?",
    clasesAyuda: "La que dice tu carta de admisión.",
    tope: "Último día para presentar",
    recomendada: "Fecha recomendada",
    resolucion: "Resolución estimada",
    diasTurista: 90,
    topeNota: (n) => `Tus ${n} días de estancia como turista`,
    recomendadaNota: (n) => `${n} días antes de clases`,
    resolucionNota: "Unos tres meses desde tu entrada",
    verde: (rec, tope) => `Presenta entre hoy y el ${rec}, y nunca después del ${tope}. Con ese margen entras en los plazos que pide Extranjería.`,
    ambar: (dias, tope) => `Quedan ${dias} días para clases: se presenta igual, adjuntando un escrito de excepcionalidad que explique por qué se hace con menos antelación. Pero antes del ${tope}, sin falta.`,
    rojo: "Tus días como turista ya pasaron. No es un no: hay que mirar tu situación en la sesión antes de presentar nada.",
    pasadas: "Tus clases ya empezaron: hay que replantear el calendario académico. Lo vemos en la sesión.",
    descargo: "Cálculo orientativo con las reglas generales. La fecha exacta se confirma en la sesión, con tu pasaporte y tu carta delante.",
  },

  documentos: {
    rotulo: "Tu expediente",
    titulo: "Lo que lleva una estancia que se aprueba",
    lead: "Marca lo que ya tienes. Con eso te digo por dónde empezamos.",
    de: (n, total) => `${n} de ${total}`,
    faltan: (n) => (n === 1 ? "Te falta 1 documento." : `Te faltan ${n} documentos.`),
    completo: "Lo tienes todo: toca revisarlo y presentarlo.",
    whatsapp: "Escríbeme con esta lista",
    whatsappDetalle: (tengo, faltan) =>
      faltan.length
        ? `Estoy en España y quiero la estancia por estudios. Tengo ${tengo} documentos y me faltan: ${faltan.join(", ")}. ¿Cómo empezamos?`
        : "Estoy en España, tengo todos los documentos de la estancia por estudios y quiero que revisen mi expediente.",
    lista: [
      { id: "admision", icono: "birrete", nombre: "Carta de admisión oficial y reciente", corto: "Admisión" },
      { id: "pasaporte", icono: "pasaporte", nombre: "Pasaporte completo, con el sello de entrada", corto: "Pasaporte" },
      { id: "banco", icono: "euro", nombre: `Extracto sellado de cuenta española con ${eur(IPREM_ANUAL)}`, corto: "Extracto" },
      { id: "medico", icono: "salud", nombre: "Certificado médico en impreso oficial, con la frase", corto: "Médico" },
      { id: "seguro", icono: "escudo", nombre: "Seguro médico sin copagos ni carencias", corto: "Seguro" },
      { id: "penales", icono: "balanza", nombre: "Antecedentes penales apostillados", corto: "Penales" },
      { id: "formulario", icono: "documento", nombre: "Formulario oficial y tasa de Extranjería", corto: "Formulario" },
    ],
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
  },

  compara: {
    rotulo: "Visado o estancia",
    titulo: "En qué se diferencia de pedir el visado en Lima",
    lead: "Mismo permiso, dos caminos. Toca cada criterio.",
    visa: "Visado (desde tu país)",
    estancia: "Estancia (desde España)",
    test: "Hacer el test de 5 preguntas",
  },

  paquete: {
    rotulo: "El paquete",
    titulo: "Lo que hacemos por ti, y lo que no",
    lead: "Un solo paquete, todo incluido hasta la resolución. Antes, la sesión diagnóstico: te decimos si tu caso es viable y con qué fechas.",
    incluye: "Incluye",
    noIncluye: "No incluye",
    para: "Para ti si…",
    elegir: "Quiero este paquete",
    permisoCorto: "Con permiso de trabajo · 30 h",
    sesionTitulo: `Primero, la sesión diagnóstico · ${SESION_DIAGNOSTICO.duracion} · ${eur(SESION_DIAGNOSTICO.precio)}`,
    sesionTexto: "Por videollamada, con tu pasaporte y tu carta delante. Sales con tus fechas y la lista exacta de documentos. Si tu caso no es viable hoy, te lo decimos ahí.",
  },

  como: {
    rotulo: "Cómo lo hacemos",
    titulo: "Seis pasos, sin pisar una oficina",
    lead: "Del diagnóstico a la TIE. Cada paso queda en tu portal, por escrito.",
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
      { q: "¿Cuánto tarda?", a: `Unos ${Math.round(DIAS_PROCESO_ESTANCIA / 30)} meses desde que entras como turista hasta la resolución, entre abrir la cuenta, empadronarte, presentar y que Extranjería resuelva.` },
      { q: "¿Y si me lo deniegan?", a: "La resolución final depende de Extranjería. El paquete no incluye el recurso de reposición ni el contencioso; si hiciera falta, lo cotizamos aparte. Lo que sí garantizamos es un expediente completo, bien fundamentado y presentado en plazo, y solo asumimos casos viables." },
      { q: "¿Y después de la resolución?", a: "Te guiamos con la TIE, el empadronamiento y el seguro médico. Y cuando termines, con el paso de estudiante a residente." },
    ],
  },

  cierre: {
    titulo: "Ya estás aquí. Que quedarte no sea una apuesta.",
    texto: "Escríbeme con tus dos fechas y te digo si llegas. O reserva la sesión y lo vemos con tu pasaporte delante.",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: `Reservar sesión · ${eur(SESION_DIAGNOSTICO.precio)}`,
  },

  descargo:
    `Orientación general: los plazos y la vía se confirman en la sesión diagnóstico con tus documentos delante. No garantizamos la concesión de la estancia, que resuelve Extranjería. La tasa de Extranjería se paga aparte. Reglas usadas: presentación con ${DIAS_ANTELACION} días de antelación al inicio de clases y dentro de la estancia como turista.`,
};
