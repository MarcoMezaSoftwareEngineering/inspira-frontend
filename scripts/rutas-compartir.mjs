// scripts/rutas-compartir.mjs
// Vista previa al compartir cada página (WhatsApp, Facebook, LinkedIn, X,
// iMessage). Los rastreadores no ejecutan JavaScript: solo leen el HTML que
// devuelve el servidor. Por eso, después de `vite build`, se genera un HTML de
// entrada por ruta (dist/compartir/<ruta-con-guiones>.html) con sus etiquetas
// og/twitter, y nginx sirve cada uno en su ruta (scripts/nginx-compartir.md).
//
// Textos basados en SEO_PAGES de src/App.jsx (copiados, no importados: ese
// archivo es de la aplicación). Si cambias un título allí, cámbialo aquí.
// Reglas: sin «2026» como año de la oferta, sin «360°» ni «¡Empieza hoy!»,
// de tú y en registro profesional.
//
// Las imágenes se generan con `python scripts/og-compartir.py`.

export const SITIO = "https://www.inspira-legal.cloud";
export const MARCA = "Inspira Legal";

export const IMG_GENERAL = "/og/inspira-general.jpg";
export const IMG_MASTER = "/og/master-2027-2028.jpg";
export const IMG_CALCULADORA = "/og/calculadora-master.jpg";

const MASTER = {
  title: "Paquete Máster 2027/2028 | Inspira Legal",
  description:
    "Postula a másteres oficiales en universidades públicas de España para 2027/2028. Planes desde 219 €, pago por etapas y sesión diagnóstico con abogado especialista.",
  image: IMG_MASTER,
  imageAlt: "Paquete Máster 2027/2028 de Inspira Legal, desde 219 €",
  // "product" obligaría a declarar product:price:*; "website" es lo seguro.
  type: "website",
};

/** Ruta → datos de compartir. `image` es relativa a SITIO. */
export const RUTAS_COMPARTIR = {
  "/": {
    title: "Visas, máster, residencia y nacionalidad en España | Inspira Legal",
    description:
      "Despacho de abogados especialistas en extranjería española: visado y estancia por estudios, máster en universidades públicas, residencias y nacionalidad, con asesoría a distancia.",
    image: IMG_GENERAL,
    type: "website",
  },
  "/master-2027-2028": MASTER,
  "/servicios/master": MASTER,
  "/calculadora-master": {
    title: "¿Cuánto cuesta estudiar un máster en España? Calculadora gratis | Inspira Legal",
    description:
      "Calcula el costo real de estudiar un máster en España desde Latinoamérica: matrícula, visado, apostillas, alojamiento y gastos de vida. Gratis y al instante.",
    image: IMG_CALCULADORA,
    imageAlt: "Calculadora gratis del costo de un máster en España",
  },
  "/servicios": {
    title: "Servicios de extranjería y estudios en España | Inspira Legal",
    description:
      "Visado de estudios, nómada digital, visado PAC, nacionalidad, homologaciones, máster y más. Todos los servicios para migrar a España, con primera asesoría desde 25 €.",
  },
  "/servicios/estancia": {
    title: "Estancia por estudios en España | Inspira Legal",
    description:
      "Gestionamos tu estancia por estudios, su prórroga y el paso a residencia en España, con abogados especialistas en extranjería.",
  },
  "/metodo-inspira": {
    title: "Método Inspira: tu proceso por etapas | Inspira Legal",
    description:
      "Admisión, carta, visado y llegada: las cuatro etapas del Método Inspira, qué incluye cada una y cuándo se paga. Paquetes de máster desde 219 € y asesoría de visado desde 109 €.",
  },
  "/visa-o-estancia": {
    title: "¿Visa o estancia por estudios? Test rápido | Inspira Legal",
    description:
      "Cinco preguntas para saber si calificas para el visado de estudios o para la estancia por estudios en España, qué paquete te conviene y cuánto dinero debes acreditar.",
  },
  "/plataforma": {
    title: "Nuestra plataforma: panel privado y expediente digital | Inspira Legal",
    description:
      "Accedes con tus credenciales a un panel donde vive tu expediente: subes documentos, tu asesor los valida y el sistema te avisa en cada hito.",
  },
  "/casos-de-exito": {
    title: "Casos de éxito: visas, admisiones y recursos ganados | Inspira Legal",
    description:
      "Admisiones a máster, visados aprobados, recursos ganados y estancias por estudios concedidas. Expedientes reales gestionados por Inspira Legal.",
  },
  "/nosotros": {
    title: "Nosotros: el equipo de Inspira Legal",
    description:
      "Conoce a los abogados asociados de Inspira Legal, especialistas en extranjería española y asesoría educativa para latinoamericanos.",
  },
  "/asistente": {
    title: "Asistente Inspira: ¿qué trámite te corresponde para España?",
    description:
      "Responde tres preguntas y descubre gratis qué vía te corresponde para vivir en España: visado de estudios, estancia, nómada digital, arraigo o nacionalidad.",
  },
  "/blog": {
    title: "Blog: guías para migrar y estudiar en España | Inspira Legal",
    description:
      "Guías claras sobre extranjería, visados, nacionalidad y vida académica en España, escritas por el equipo legal de Inspira.",
  },
  "/eventos": {
    title: "Eventos gratuitos: estudia en España en 5 pasos | Inspira Legal",
    description:
      "Evento gratuito de Inspira para estudiar en España rumbo a 2027: los 5 pasos, los plazos reales y descuento en paquetes para asistentes.",
  },
  "/tienda": {
    title: "Tiendita: recursos digitales de Inspira Legal",
    description:
      "Ebooks, videos y herramientas para estudiar y migrar a España por tu cuenta: becas, guía de máster, formación profesional y más.",
  },
  "/ruta/estudios": {
    title: "Migrar a España por estudios | Inspira Legal",
    description:
      "Máster, grado o FP: entras legalmente, puedes trabajar 30 horas semanales y construyes tu residencia. Matrículas desde 700 € en universidades públicas españolas.",
  },
  "/ruta/rapidas": {
    title: "Vías rápidas para vivir en España: nómada digital, PAC y no lucrativa | Inspira Legal",
    description:
      "Si trabajas en remoto, tienes una oferta cualificada o medios propios, puedes vivir legalmente en España sin estudiar, con plazos de resolución cortos.",
  },
  "/ruta/en-espana": {
    title: "Trámites en España: renovaciones, arraigos y nacionalidad | Inspira Legal",
    description:
      "Si ya estás en España: modificaciones, prórrogas, arraigos, nacionalidad en 2 años, TIE, empadronamiento, seguridad social y certificado digital.",
  },
  "/ruta/denegado": {
    title: "Me denegaron el visado: recurso de reposición y plan alternativo | Inspira Legal",
    description:
      "Analizamos tu resolución de denegación, evaluamos la viabilidad del recurso de reposición y, si no procede, reconducimos tu caso hacia la estancia por estudios.",
  },
  "/ruta/tramites": {
    title: "Adelanta tus trámites: homologación y preparación universitaria | Inspira Legal",
    description:
      "Si aún no migras pero quieres avanzar: homologa tu bachillerato o tu título universitario y prepárate para postular a tiempo a la universidad española.",
  },
};

/** "/servicios/master" → "servicios-master"; "/" → "index". */
export const nombreArchivo = (ruta) => (ruta === "/" ? "index" : ruta.slice(1).replace(/\//g, "-"));

/** Datos completos (con valores por defecto y URLs absolutas) de una ruta. */
export function datosRuta(ruta) {
  const r = RUTAS_COMPARTIR[ruta];
  const image = SITIO + (r.image || IMG_GENERAL);
  return {
    title: r.title,
    description: r.description,
    type: r.type || "website",
    url: SITIO + ruta,
    image,
    imageAlt: r.imageAlt || "Inspira Legal: asesoría a distancia para vivir en España",
  };
}
