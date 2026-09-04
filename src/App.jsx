// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\App.jsx

import { useEffect, useState, lazy, Suspense } from "react";
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
const AuthSuccess = lazy(() => import("./pages/auth/AuthSuccess"));
const PortalServiciosMaster = lazy(() => import("./pages/servicios/master/PortalServiciosMaster"));
const EstanciaLanding = lazy(() => import("./pages/servicios/estancia/EstanciaLanding"));
const ServiciosCatalogo = lazy(() => import("./pages/servicios/ServiciosCatalogo"));
const ServicioDetalle = lazy(() => import("./pages/servicios/ServicioDetalle"));
const BackofficeApp = lazy(() => import("./pages/backoffice/BackofficeApp"));
// Solo en desarrollo: una página con las piezas de interfaz y datos de ejemplo.
const MuestraUX = import.meta.env.DEV ? lazy(() => import("./pages/dev/MuestraUX")) : null;
const CalculadoraMaster = lazy(() => import("./pages/calculadora/CalculadoraMaster"));
const PanelCliente = lazy(() => import("./pages/panel/PanelCliente"));
const ReservarCita = lazy(() => import("./pages/reservar/ReservarCita"));
const MasterAdsLanding = lazy(() => import("./pages/landing/MasterAdsLanding"));
const Eventos = lazy(() => import("./pages/eventos/Eventos"));
const CasosExito = lazy(() => import("./pages/casos/CasosExito"));
const Asistente = lazy(() => import("./pages/asistente/Asistente"));
const RutaLanding = lazy(() => import("./pages/rutas/RutaLanding"));
const Plataforma = lazy(() => import("./pages/plataforma/Plataforma"));
const Nosotros = lazy(() => import("./pages/nosotros/Nosotros"));
const Tienda = lazy(() => import("./pages/tienda/Tienda"));
const BlogIndex = lazy(() => import("./pages/blog/BlogIndex"));
const BlogPost = lazy(() => import("./pages/blog/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PagoExitoso = lazy(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoExitoso })));
const PagoFallido = lazy(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoFallido })));
const PagoPendiente = lazy(() => import("./pages/pago/PagoResultado").then((m) => ({ default: m.PagoPendiente })));

// ── Legales ───────────────────────────────────────────────
const PoliticaPrivacidad = lazy(() => import("./pages/legal/PoliticaPrivacidad"));
const PoliticaCookies = lazy(() => import("./pages/legal/PoliticaCookies"));
const TerminosCondiciones = lazy(() => import("./pages/legal/TerminosCondiciones"));
const DerechosArco = lazy(() => import("./pages/legal/DerechosArco"));
const LibroReclamaciones = lazy(() => import("./pages/legal/LibroReclamaciones"));

// Páginas a las que más se salta desde la portada: se adelantan en tiempo
// ocioso, ya pintada la pantalla, para que el primer clic no espere descarga.
const PRECARGA = [
  () => import("./pages/servicios/ServiciosCatalogo"),
  () => import("./pages/servicios/ServicioDetalle"),
  () => import("./pages/blog/BlogIndex"),
];

// ── Configuración SEO por ruta ─────────────────────────────────────────────
const SEO_PAGES = {
  "/": {
    title: "Visa Estudiante y Máster en España para Latinoamericanos 2026",
    description:
      "Tramita tu visa de estudiante y encuentra el mejor máster en España. Apostilla, extranjería y acompañamiento 360° para latinoamericanos. ¡Empieza hoy!",
    path: "/",
  },
  "/servicios/master": {
    title: "Estudia un Máster en España – Programa 360° para Latinoamericanos",
    description:
      "Elegimos el máster ideal para ti y gestionamos todo: visa de estudiante, apostilla y matrícula en universidades españolas. Acompañamiento completo 2026/2027.",
    path: "/servicios/master",
  },
  "/servicios/estancia": {
    title: "Visa de Estancia en España para Latinoamericanos 2026",
    description:
      "Gestiona tu visa de estancia, renovación o permiso de residencia en España. Expertos en extranjería para latinoamericanos. Sin sorpresas.",
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
    title: "¿Cuánto cuesta un Máster en España? Calculadora Gratis",
    description:
      "Calcula el costo real de estudiar un máster en España desde Latinoamérica: matrícula, visa, apostilla, alojamiento y gastos de vida. Gratis e instantáneo.",
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
  url: "https://inspira-legal.cloud",
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
  name: "Programa Máster 360° en España",
  provider: { "@type": "Organization", name: "Inspira Legal" },
  serviceType: "Asesoría académica para másteres en España",
  areaServed: "PE",
  description:
    "Acompañamiento integral para estudiar un máster en España: selección de universidad, visado de estudiante, trámites de extranjería y más.",
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
const LANDING_ADS_PATHS = ["/master-espana"];

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
        title: `${s.detalle.titulo} – Inspira Legal`,
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
        ? { noIndex: true }
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
  "/master-espana",
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
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
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
      {path === "/servicios/master" && <PortalServiciosMaster />}
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
      {path === "/master-espana" && <MasterAdsLanding />}
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
