// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\App.jsx

import { useEffect, useState, Suspense } from "react";
import { lazyConRecarga } from "./lib/cargaDiferida";
import { dialog } from "./services/dialogService";
import { Header } from "./components/layout/Header";
import Home from "./pages/home/Home";
import Footer from "./components/layout/footer";
import CookieConsent from "./components/legal/CookieConsent";
import AsesoriaCTA from "./components/common/AsesoriaCTA";
import BarraProgreso from "./components/common/BarraProgreso";
import BarraInferior from "./components/layout/BarraInferior";
import { registrarVista } from "./lib/analytics";
import { getServicio } from "./config/servicios";
import { getRuta } from "./config/rutas";
import { useSEO } from "./hooks/useSEO";
import SEOSchema from "./components/SEOSchema";

// Solo la portada y el armazón común (cabecera, pie, CTA) viajan en el paquete
// inicial. Cada una de las demás páginas se descarga la primera vez que se
// visita: así la portada carga con menos JavaScript y publicar un cambio en una
// página no invalida la caché de las otras.
const AuthSuccess = lazyConRecarga(() => import("./pages/auth/AuthSuccess"));
const ServicioMaster2027 = lazyConRecarga(() => import("./pages/servicios/master/ServicioMaster2027"));
const EstanciaLanding = lazyConRecarga(() => import("./pages/servicios/estancia/EstanciaLanding"));
const ServiciosCatalogo = lazyConRecarga(() => import("./pages/servicios/ServiciosCatalogo"));
const ServicioDetalle = lazyConRecarga(() => import("./pages/servicios/ServicioDetalle"));
const BackofficeApp = lazyConRecarga(() => import("./pages/backoffice/BackofficeApp"));
// Solo en desarrollo: una página con las piezas de interfaz y datos de ejemplo.
const MuestraUX = import.meta.env.DEV ? lazyConRecarga(() => import("./pages/dev/MuestraUX")) : null;
const CalculadoraMaster = lazyConRecarga(() => import("./pages/calculadora/CalculadoraMaster"));
const PanelCliente = lazyConRecarga(() => import("./pages/panel/PanelCliente"));
const ReservarCita = lazyConRecarga(() => import("./pages/reservar/ReservarCita"));
const MasterAds2027 = lazyConRecarga(() => import("./pages/landing/master2027/MasterAds2027"));
const VisaOEstancia = lazyConRecarga(() => import("./pages/decidir/VisaOEstancia"));
const Eventos = lazyConRecarga(() => import("./pages/eventos/Eventos"));
const CasosExito = lazyConRecarga(() => import("./pages/casos/CasosExito"));
const Asistente = lazyConRecarga(() => import("./pages/asistente/Asistente"));
const RutaLanding = lazyConRecarga(() => import("./pages/rutas/RutaLanding"));
const Plataforma = lazyConRecarga(() => import("./pages/plataforma/Plataforma"));
const Nosotros = lazyConRecarga(() => import("./pages/nosotros/Nosotros"));
const Tienda = lazyConRecarga(() => import("./pages/tienda/Tienda"));
const BlogIndex = lazyConRecarga(() => import("./pages/blog/BlogIndex"));
const BlogPost = lazyConRecarga(() => import("./pages/blog/BlogPost"));
const NotFound = lazyConRecarga(() => import("./pages/NotFound"));
const PagoExitoso = lazyConRecarga(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoExitoso })));
const PagoFallido = lazyConRecarga(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoFallido })));
const PagoPendiente = lazyConRecarga(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoPendiente })));

// ── Legales ───────────────────────────────────────────────
const PoliticaPrivacidad = lazyConRecarga(() => import("./pages/legal/PoliticaPrivacidad"));
const PoliticaCookies = lazyConRecarga(() => import("./pages/legal/PoliticaCookies"));
const TerminosCondiciones = lazyConRecarga(() => import("./pages/legal/TerminosCondiciones"));
const DerechosArco = lazyConRecarga(() => import("./pages/legal/DerechosArco"));
const LibroReclamaciones = lazyConRecarga(() => import("./pages/legal/LibroReclamaciones"));

// Resumen ligero del Paquete Máster (el config completo solo lo carga su página).
import { PRECIOS, PRECIO_DESDE, NOMBRE_PAQUETE, eur } from "./config/paqueteMaster2027Resumen";

// Páginas a las que más se salta desde la portada: se adelantan en tiempo
// ocioso, ya pintada la pantalla, para que el primer clic no espere descarga.
const PRECARGA = [
  () => import("./pages/servicios/ServiciosCatalogo"),
  () => import("./pages/servicios/ServicioDetalle"),
  () => import("./pages/blog/BlogIndex"),
];

// ── Configuración SEO por ruta ─────────────────────────────────────────────
// useSEO añade « | Inspira Legal» al título. Textos alineados con
// scripts/rutas-compartir.mjs (vista previa al compartir).
const SEO_PAGES = {
  "/": {
    title: "Visas, máster, residencia y nacionalidad en España",
    description:
      "Despacho de abogados especialistas en extranjería española: visado y estancia por estudios, máster en universidades públicas, residencias y nacionalidad, con asesoría a distancia.",
    path: "/",
  },
  "/servicios/master": {
    title: NOMBRE_PAQUETE,
    description: `Postula a másteres oficiales en universidades públicas de España para 2027/2028. Planes desde ${eur(PRECIO_DESDE)}, pago por etapas y sesión diagnóstico con abogado especialista.`,
    path: "/servicios/master",
  },
  // Landing de Ads: noindex; solo se usa el título.
  "/master-2027-2028": {
    title: NOMBRE_PAQUETE,
    path: "/master-2027-2028",
  },
  "/servicios/estancia": {
    title: "Estancia por estudios en España",
    description:
      "Gestionamos tu estancia por estudios, su prórroga y el paso a residencia en España, con abogados especialistas en extranjería.",
    path: "/servicios/estancia",
  },
  "/servicios": {
    title: "Servicios de Extranjería y Estudios en España – Inspira Legal",
    description:
      "Visa de estudios, nómada digital, visado PAC, nacionalidad, homologaciones, máster y más. Todos nuestros servicios para migrar a España, con primera asesoría desde 25 €.",
    path: "/servicios",
  },
  "/nosotros": {
    title: "Nosotros – El equipo de Inspira Legal",
    description:
      "Conoce a los abogados asociados de Inspira Legal: especialistas en extranjería española y asesoría educativa para latinoamericanos.",
    path: "/nosotros",
  },
  "/tienda": {
    title: "Tiendita – Recursos digitales de Inspira Legal",
    description:
      "Ebooks, videos y herramientas para estudiar y migrar a España por tu cuenta: becas actualizadas, guía de máster, formación profesional y más.",
    path: "/tienda",
  },
  "/blog": {
    title: "Blog – Guías para migrar y estudiar en España",
    description:
      "Guías claras de extranjería, visados, nacionalidad y vida académica en España, escritas por el equipo legal de Inspira.",
    path: "/blog",
  },
  "/visa-o-estancia": {
    title: "¿Visa o estancia por estudios? Test rápido",
    description:
      "Cinco preguntas para saber si calificas para el visado de estudios o para la estancia por estudios en España, con el paquete que te conviene y cuánto dinero tienes que acreditar.",
    path: "/visa-o-estancia",
  },
  "/eventos": {
    title: "Eventos gratuitos – Estudia en España en 5 pasos",
    description:
      "El primer evento gratuito de Inspira para que estudies en España Rumbo al 2027: los 5 pasos, los plazos reales y descuento en paquetes para asistentes.",
    path: "/eventos",
  },
  "/casos-de-exito": {
    title: "Casos de éxito – Visas, admisiones y apelaciones ganadas",
    description:
      "Admisiones a máster, visas aprobadas, apelaciones ganadas y estancias por estudios concedidas. Expedientes reales gestionados por Inspira Legal.",
    path: "/casos-de-exito",
  },
  "/ruta/estudios": {
    title: "Migrar a España por estudios – La vía más efectiva",
    description:
      "Máster, grado o FP: entra legalmente, trabaja 30 h semanales y construye tu residencia. Matrículas desde 700 € en universidades públicas españolas.",
    path: "/ruta/estudios",
  },
  "/ruta/rapidas": {
    title: "Vías rápidas para vivir en España – Nómada digital, PAC y no lucrativa",
    description:
      "Si trabajas en remoto, tienes una oferta cualificada o medios propios, puedes vivir legalmente en España sin estudiar. Plazos de resolución cortos y cómputo para la nacionalidad.",
    path: "/ruta/rapidas",
  },
  "/ruta/en-espana": {
    title: "Trámites en España – Renovaciones, arraigos, nacionalidad y gestiones",
    description:
      "Ya estás en España: modificaciones, prórrogas, arraigos, nacionalidad en 2 años, TIE, empadronamiento, seguridad social y certificado digital.",
    path: "/ruta/en-espana",
  },
  "/ruta/denegado": {
    title: "Me denegaron el visado – Recurso de reposición y plan alternativo",
    description:
      "Analizamos tu resolución de denegación, evaluamos la viabilidad del recurso de reposición y, si no procede, reconducimos tu caso hacia la estancia por estudios.",
    path: "/ruta/denegado",
  },
  "/ruta/tramites": {
    title: "Adelanta tus trámites – Homologación y preparación universitaria",
    description:
      "Aún no migras pero quieres avanzar: homologa tu bachillerato o tu título universitario y prepárate para postular a la universidad española a tiempo.",
    path: "/ruta/tramites",
  },
  "/plataforma": {
    title: "Nuestro sistema – Panel privado y expediente digital | Inspira Legal",
    description:
      "Somos una firma con plataforma propia: accedes con credenciales a un panel donde vive tu expediente, subes documentos, tu asesor los valida y el sistema te avisa en cada hito.",
    path: "/plataforma",
  },
  "/asistente": {
    title: "Asistente Inspira – ¿Qué trámite me corresponde para España?",
    description:
      "Responde tres preguntas y descubre gratis qué vía migratoria te corresponde para vivir en España: visa de estudios, estancia, nómada digital, arraigo o nacionalidad.",
    path: "/asistente",
  },
  "/calculadora-master": {
    title: "¿Cuánto cuesta estudiar un máster en España? Calculadora gratis",
    description:
      "Calcula el costo real de estudiar un máster en España desde Latinoamérica: matrícula, visado, apostillas, alojamiento y gastos de vida. Gratis y al instante.",
    path: "/calculadora-master",
  },
  "/reservar": {
    title: "Reserva tu cita de asesoría – Inspira Legal",
    description:
      "Agenda una cita de asesoría con el equipo de Inspira Legal. Elige día y hora y confirma tu reserva con pago seguro por Mercado Pago.",
    path: "/reservar",
  },
  "/legal/privacidad": {
    title: "Aviso y Política de Privacidad – Inspira Legal",
    description:
      "Qué datos personales tratamos, con qué finalidad, con quién los compartimos, cuánto los conservamos y cómo ejercer tus derechos.",
    path: "/legal/privacidad",
  },
  "/legal/cookies": {
    title: "Política de Cookies – Inspira Legal",
    description:
      "Inventario detallado de las cookies y del almacenamiento local que utiliza inspira-legal.cloud y cómo gestionar tu consentimiento.",
    path: "/legal/cookies",
  },
  "/legal/terminos": {
    title: "Términos y Condiciones de Contratación – Inspira Legal",
    description:
      "Condiciones de contratación de los servicios de Inspira Legal: proceso de contratación, precios, devoluciones y atención de reclamos.",
    path: "/legal/terminos",
  },
  "/legal/derechos": {
    title: "Ejerce tus derechos sobre tus datos – Inspira Legal",
    description:
      "Canal oficial y gratuito para ejercer los derechos de acceso, rectificación, cancelación y oposición sobre tus datos personales.",
    path: "/legal/derechos",
  },
  "/libro-de-reclamaciones": {
    title: "Libro de Reclamaciones – Inspira Legal",
    description:
      "Libro de Reclamaciones virtual de PROYECTA PRODUCCIONES GROUP S.A.C. Registra tu reclamo o queja y recibe respuesta en el plazo legal.",
    path: "/libro-de-reclamaciones",
  },
};

// ── Schemas JSON-LD ─────────────────────────────────────────────────────────
const SCHEMA_ORG = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Inspira Legal",
  legalName: "PROYECTA PRODUCCIONES GROUP S.A.C.",
  taxID: "20610501941",
  telephone: "+51992009397",
  email: "administracion@inspira-legal.cloud",
  url: "https://www.inspira-legal.cloud",
  description:
    "Consultoría especializada en másteres y postgrados en España, visas de estudiante y trámites de extranjería para latinoamericanos.",
  areaServed: ["PE", "CO", "MX", "AR", "CL", "EC", "BO", "VE", "ES"],
  serviceType: ["Asesoría académica", "Gestión de visas", "Trámites de extranjería"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Dos de Mayo N.° 1545, Oficina 204",
    addressLocality: "San Isidro, Lima",
    addressCountry: "PE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

const SCHEMA_MASTER = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${NOMBRE_PAQUETE} en España`,
  provider: { "@type": "Organization", name: "Inspira Legal" },
  serviceType: "Asesoría académica para másteres en España",
  areaServed: ["PE", "CO", "MX", "AR", "CL", "EC", "BO", "VE"],
  description:
    "Selección de másteres oficiales, preparación de la candidatura y postulación en universidades españolas, con pago por etapas y seguimiento en un portal propio.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: String(PRECIO_DESDE),
    highPrice: String(Math.max(...Object.values(PRECIOS))),
  },
};

const SCHEMA_ESTANCIA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Gestión de Visa de Estancia en España",
  provider: { "@type": "Organization", name: "Inspira Legal" },
  serviceType: "Gestión de visas y extranjería",
  areaServed: "PE",
  description:
    "Gestión de visa de estancia y permisos de residencia en España para peruanos.",
};

// ── Componente de SEO por ruta ──────────────────────────────────────────────
const PRIVATE_PATHS = ["/panel", "/auth/success"];

// Landings standalone para campañas de ads: sin Header/Footer del sitio, y
// sin indexar (tráfico pagado, no orgánico).
const LANDING_ADS_PATHS = ["/master-2027-2028"];

// Rutas retiradas: se sustituyen en el historial (replace) antes de pintar
// nada, conservando los utm_* de la URL. La página vieja no se monta nunca.
const REDIRECCIONES = {
  "/metodo-inspira": "/servicios/master#pago-por-etapas",
  "/master-espana": "/master-2027-2028",
};

function rutaActual() {
  const { pathname, search } = window.location;
  const destino = REDIRECCIONES[pathname.replace(/\/+$/, "") || "/"];
  if (!destino) return pathname;
  const [ruta, hash] = destino.split("#");
  window.history.replaceState(window.history.state, "", `${ruta}${search}${hash ? `#${hash}` : ""}`);
  return ruta;
}

function RouteSEO({ path }) {
  const isPrivate =
    PRIVATE_PATHS.includes(path) || path.startsWith("/panel")
    || path.startsWith("/backoffice") || LANDING_ADS_PATHS.includes(path);
  let config = SEO_PAGES[path];
  // Páginas de servicio: SEO dinámico a partir del catálogo
  if (!config && path.startsWith("/servicios/")) {
    const s = getServicio(path.slice("/servicios/".length));
    if (s?.detalle) {
      config = {
        title: s.detalle.titulo,
        description: `${s.detalle.gancho} ${s.resumen}`.slice(0, 300),
        path,
      };
    }
  }
  // Las entradas del blog declaran su propio SEO: el título, la fecha y la
  // firma salen del artículo, que solo se descarga al abrirlo.
  const esEntradaBlog = path.startsWith("/blog/") && path.length > "/blog/".length;

  useSEO(
    esEntradaBlog
      ? { omitir: true }
      : isPrivate
        ? { noIndex: true, title: config?.title }
        : config || { noIndex: true }
  );
  return null;
}

// ── App ─────────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/auth/success",
  "/servicios",
  "/servicios/master",
  "/servicios/estancia",
  "/nosotros",
  "/tienda",
  "/blog",
  "/eventos",
  "/casos-de-exito",
  "/asistente",
  "/plataforma",
  "/ruta/estudios",
  "/ruta/rapidas",
  "/ruta/en-espana",
  "/ruta/denegado",
  "/ruta/tramites",
  "/calculadora-master",
  "/master-2027-2028",
  "/visa-o-estancia",
  "/panel",
  "/pago-exitoso",
  "/pago-fallido",
  "/pago-pendiente",
  "/legal/privacidad",
  "/legal/cookies",
  "/legal/terminos",
  "/legal/derechos",
  "/libro-de-reclamaciones",
];

export default function App() {
  const [path, setPath] = useState(rutaActual);

  useEffect(() => {
    const onPop = () => setPath(rutaActual());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Vista de página en navegación SPA (solo si hay consentimiento analítico).
  useEffect(() => {
    registrarVista(path);
  }, [path]);

  // Si se llegó aquí porque la sesión caducó a mitad de faena, se explica.
  // El sitio exacto donde estaba ya quedó guardado: al volver a entrar
  // aterriza allí.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("inspira:sesion-caducada")) {
        sessionStorage.removeItem("inspira:sesion-caducada");
        dialog.toast("Tu sesión caducó. Vuelve a entrar y seguirás donde estabas.", "info");
      }
    } catch { /* noop */ }
  }, []);

  // Precarga de las páginas más visitadas. No en los portales privados (no las
  // necesitan) ni cuando el visitante pidió al navegador ahorrar datos.
  useEffect(() => {
    if (/^\/(backoffice|panel)/.test(window.location.pathname)) return;
    if (navigator.connection?.saveData) return;
    const precargar = () => PRECARGA.forEach((cargar) => cargar().catch(() => {}));
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(precargar, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(precargar, 2500);
    return () => clearTimeout(t);
  }, []);

  if (import.meta.env.DEV && MuestraUX && path === "/dev/muestra") {
    return <Suspense fallback={null}><MuestraUX /></Suspense>;
  }

  if (path.startsWith("/backoffice")) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <BackofficeApp />
        <CookieConsent />
      </Suspense>
    );
  }

  const isPanel = path.startsWith("/panel");
  const isLandingAds = LANDING_ADS_PATHS.includes(path);
  // Optimista: cualquier /blog/<algo> monta la entrada, y es ella quien decide
  // si existe. Comprobarlo aquí obligaba a meter el blog entero en el paquete
  // inicial de la web pública.
  const isBlogPost = path.startsWith("/blog/") && path.length > "/blog/".length;
  const servicioId = path.startsWith("/servicios/")
    ? path.slice("/servicios/".length)
    : null;
  const isServicioDetalle = !!getServicio(servicioId)?.detalle;
  const rutaId = path.startsWith("/ruta/") ? path.slice("/ruta/".length) : null;
  const isRuta = !!getRuta(rutaId);
  const isNotFound =
    !PUBLIC_PATHS.includes(path) && !isBlogPost && !isServicioDetalle && !isPanel;

  return (
    <div className="min-h-screen w-full bg-white">
      <RouteSEO path={path} />
      {!isPanel && !isLandingAds && <BarraProgreso />}

      {/* Schema.org según ruta */}
      {path === "/" && <SEOSchema schema={SCHEMA_ORG} id="org" />}
      {path === "/servicios/master" && <SEOSchema schema={SCHEMA_MASTER} id="master" />}
      {path === "/servicios/estancia" && <SEOSchema schema={SCHEMA_ESTANCIA} id="estancia" />}

      {!isPanel && !isLandingAds && !isNotFound && <Header />}

      {/* `key` fuerza el remontaje al navegar: cada página entra con animación.
          El panel NO: sus rutas internas cambian a cada clic y remontarlo
          volvería a pedir el perfil y los servicios en cada sección. Se monta
          una vez y anima por dentro lo que cambia. */}
      <div key={isPanel ? "panel" : path} className={isPanel ? undefined : "v4-page-enter"}>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
      {path === "/" && <Home />}
      {path === "/auth/success" && <AuthSuccess />}
      {path === "/servicios" && <ServiciosCatalogo />}
      {path === "/servicios/master" && <ServicioMaster2027 />}
      {path === "/servicios/estancia" && <EstanciaLanding />}
      {isServicioDetalle && <ServicioDetalle id={servicioId} />}
      {isRuta && <RutaLanding id={rutaId} />}
      {path === "/nosotros" && <Nosotros />}
      {path === "/tienda" && <Tienda />}
      {path === "/eventos" && <Eventos />}
      {path === "/casos-de-exito" && <CasosExito />}
      {path === "/asistente" && <Asistente />}
      {path === "/plataforma" && <Plataforma />}
      {path === "/blog" && <BlogIndex />}
      {isBlogPost && <BlogPost slug={path.slice("/blog/".length)} />}
      {path === "/calculadora-master" && <CalculadoraMaster />}
      {isPanel && <PanelCliente path={path} />}
      {path === "/reservar" && <ReservarCita />}
      {path === "/master-2027-2028" && <MasterAds2027 />}
      {path === "/visa-o-estancia" && <VisaOEstancia />}
      {path === "/pago-exitoso" && <PagoExitoso />}
      {path === "/pago-fallido" && <PagoFallido />}
      {path === "/pago-pendiente" && <PagoPendiente />}

      {/* Documentos legales y canales obligatorios */}
      {path === "/legal/privacidad" && <PoliticaPrivacidad />}
      {path === "/legal/cookies" && <PoliticaCookies />}
      {path === "/legal/terminos" && <TerminosCondiciones />}
      {path === "/legal/derechos" && <DerechosArco />}
      {path === "/libro-de-reclamaciones" && <LibroReclamaciones />}

      {/* 404 */}
      {isNotFound && (
        <>
          <Header />
          <NotFound />
        </>
      )}
      </Suspense>
      </div>

      {/* El footer identifica al proveedor en todas las páginas públicas */}
      {!isPanel && !isLandingAds && <Footer />}

      {/* Invitación permanente a la primera asesoría (no en el panel privado) */}
      {!isPanel && !isLandingAds && <AsesoriaCTA />}

      {/* Navegación inferior tipo app (móvil y tablet) */}
      {!isPanel && !isLandingAds && (
        <BarraInferior
          onReservar={() =>
            window.dispatchEvent(new CustomEvent("inspira:abrir-asesoria"))
          }
        />
      )}

      {/* Banner de cookies: siempre montado, decide él si se muestra */}
      <CookieConsent />
    </div>
  );
}
