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

import { readFileSync } from "node:fs";
import { NOMBRE_PORTAL } from "../src/config/portalMarca.js";

// Importes de la fuente única (copia del backend, ver sincronizar-precios.js).
const PRECIOS = JSON.parse(readFileSync(new URL("../src/config/precios-inspira.json", import.meta.url), "utf8"));
const DESDE_MASTER = Math.min(
  ...PRECIOS.master.listas.flatMap((l) => l.planes.map((p) => p.eur)),
  ...PRECIOS.master.avanzados.map((p) => p.eur)
);
const DESDE_VISADO = Math.min(...PRECIOS.visado.map((v) => v.eur));
const SESION_EUR = PRECIOS.sesionDiagnostico.eur;

export const SITIO = "https://www.inspira-legal.cloud";
export const MARCA = "Inspira Legal";

export const IMG_GENERAL = "/og/inspira-general.jpg";
export const IMG_MASTER = "/og/master-2027-2028.jpg";
export const IMG_CALCULADORA = "/og/calculadora-master.jpg";
export const IMG_PORTAL = "/og/expediente-digital.jpg";
export const IMG_GRADO = "/og/grado-en-espana.jpg";
export const IMG_BICENTENARIO = "/og/beca-generacion-bicentenario-2026.jpg";
export const IMG_MAPA = "/og/mapa-estudiar-en-espana.jpg";

const MASTER = {
  title: "Paquete Máster 2027/2028 | Inspira Legal",
  description:
    `Postula a másteres oficiales en universidades públicas de España para 2027/2028. Planes desde ${DESDE_MASTER} €, pago por etapas y sesión diagnóstico con abogado especialista.`,
  image: IMG_MASTER,
  imageAlt: `Paquete Máster 2027/2028 de Inspira Legal, desde ${DESDE_MASTER} €`,
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
      `Visado de estudios, nómada digital, visado PAC, nacionalidad, homologaciones, máster y más. Todos los servicios para migrar a España, con primera asesoría desde ${SESION_EUR} €.`,
  },
  "/servicios/estancia": {
    title: "Estancia por estudios en España | Inspira Legal",
    description:
      "Gestionamos tu estancia por estudios, su prórroga y el paso a residencia en España, con abogados especialistas en extranjería.",
  },
  "/metodo-inspira": {
    title: "Método Inspira: tu proceso por etapas | Inspira Legal",
    description:
      `Admisión, carta, visado y llegada: las cuatro etapas del Método Inspira, qué incluye cada una y cuándo se paga. Paquetes de máster desde ${DESDE_MASTER} € y asesoría de visado desde ${DESDE_VISADO} €.`,
  },
  "/visa-o-estancia": {
    title: "¿Visa o estancia por estudios? Test rápido | Inspira Legal",
    description:
      "Cinco preguntas para saber si calificas para el visado de estudios o para la estancia por estudios en España, qué paquete te conviene y cuánto dinero debes acreditar.",
  },
  "/plataforma": {
    title: `${NOMBRE_PORTAL}: tu caso en un portal y en tu app | Inspira Legal`,
    description:
      "Tu expediente en un portal propio que se instala como app: entras con tu correo de Google, ves qué te toca hoy, tus documentos, tus plazos y los mensajes con tu asesor por escrito.",
    image: IMG_PORTAL,
    imageAlt: `${NOMBRE_PORTAL}: tu caso en un portal propio y en tu app`,
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
  // Guía para familias. Textos alineados con SEO_PAGES de src/App.jsx.
  "/grado-en-espana": {
    title: "¿Cuánto cuesta estudiar un grado en España? Guía para familias | Inspira Legal",
    description:
      "Matrícula en universidades públicas y privadas, acceso, visado o estancia y becas: simula la inversión de tu hijo o hija año a año y conoce el Paquete Grado de Inspira.",
    image: IMG_GRADO,
    imageAlt: "Guía para familias: cuánto cuesta estudiar un grado en España",
  },
  // Fechas de Extranjería. El título nombra las tres ciudades que hoy
  // publican porque es lo que se busca en Google y el rastreador no ejecuta
  // JavaScript; la lista que se ve dentro de la página sí sale de la API.
  "/por-que-fecha-va-extranjeria": {
    title: "¿Por qué fecha va Extranjería? Madrid, Valencia y Mallorca | Inspira Legal",
    description:
      "Hasta qué fecha de presentación están grabando, instruyendo y resolviendo las oficinas de Extranjería que publican sus datos, trámite a trámite y también en los recursos. Con calculadora para situar tu expediente.",
    image: "/og/servicios.jpg",
    imageAlt: "Fechas orientativas de tramitación de las oficinas de Extranjería en España",
  },
  // Sus textos viven en la propia página (pages/mapa/mapaTextos.js, SEO), no en
  // SEO_PAGES de App.jsx: si cambias uno, cambia el otro.
  // Sus textos viven en la propia página (pages/bicentenario/BecaBicentenario2026.jsx, SEO).
  "/beca-generacion-bicentenario-2026": {
    title: "Beca Generación del Bicentenario 2026: nuevas bases y simulador | Inspira Legal",
    description:
      "Solo 20 becas. Las nuevas bases de PRONABEC explicadas en claro, un simulador para saber si calificas y cuánto puntaje tendrías, la comparación con 2025 y otras becas para España y la Unión Europea.",
    image: IMG_BICENTENARIO,
    imageAlt: "Beca Generación del Bicentenario 2026: solo 20 becas. ¿Calificas? Calcula tu puntaje",
  },
  // Página de enlaces de las biografías de redes (pages/enlaces/Enlaces.jsx).
  "/enlaces": {
    title: "Inspira Legal · Enlaces: becas, máster en España y asesoría",
    description:
      "Beca Generación del Bicentenario 2026, mapa de costos de máster, guía de grado en España, calculadora de máster y reserva de tu asesoría con el equipo Perú · España.",
    image: "/og/inspira-general.jpg",
    imageAlt: "Inspira Legal: asesoría en extranjería, visas y estudios en España",
  },
  "/mapa-estudiar-en-espana": {
    title: "¿Cuánto cuesta un máster en España? Mapa por comunidad y universidad | Inspira Legal",
    description:
      "Descubre en el mapa cuánto cuesta un máster oficial al año en cada comunidad, ciudad y universidad de España, con su ranking QS y cómo se postula. Los precios de Inspira son paquetes de postulación: la matrícula se paga aparte.",
    image: IMG_MAPA,
    imageAlt: "¿Cuánto cuesta un máster en España? Descúbrelo en el mapa de Inspira Legal",
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
