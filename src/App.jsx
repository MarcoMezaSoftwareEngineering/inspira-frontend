// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\App.jsx

import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import Home from "./pages/home/Home";
import AuthSuccess from "./pages/auth/AuthSuccess";
import MasterLanding from "./pages/servicios/master/MasterLanding";
import PortalServiciosMaster from "./pages/servicios/master/PortalServiciosMaster";
import EstanciaLanding from "./pages/servicios/estancia/EstanciaLanding";
import BackofficeApp from "./pages/backoffice/BackofficeApp";
import CalculadoraMaster from "./pages/calculadora/CalculadoraMaster";
import PanelCliente from "./pages/panel/PanelCliente";
import ReservarCita from "./pages/reservar/ReservarCita";
import ServiciosCatalogo from "./pages/servicios/ServiciosCatalogo";
import ServicioDetalle from "./pages/servicios/ServicioDetalle";
import { getServicio } from "./config/servicios";
import AsesoriaCTA from "./components/common/AsesoriaCTA";
import BarraProgreso from "./components/common/BarraProgreso";
import BarraInferior from "./components/layout/BarraInferior";
import Eventos from "./pages/eventos/Eventos";
import CasosExito from "./pages/casos/CasosExito";
import Asistente from "./pages/asistente/Asistente";
import RutaLanding from "./pages/rutas/RutaLanding";
import Plataforma from "./pages/plataforma/Plataforma";
import { getRuta } from "./config/rutas";
import Nosotros from "./pages/nosotros/Nosotros";
import Tienda from "./pages/tienda/Tienda";
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";
import { getPost } from "./pages/blog/blog.data";
import { PagoExitoso, PagoFallido, PagoPendiente } from "./pages/pago/PagoResultado";
import NotFound from "./pages/NotFound";

// ── Legales ────────────────────────────────────────────────────────────────
import Footer from "./components/layout/footer";
import CookieConsent from "./components/legal/CookieConsent";
import PoliticaPrivacidad from "./pages/legal/PoliticaPrivacidad";
import PoliticaCookies from "./pages/legal/PoliticaCookies";
import TerminosCondiciones from "./pages/legal/TerminosCondiciones";
import DerechosArco from "./pages/legal/DerechosArco";
import LibroReclamaciones from "./pages/legal/LibroReclamaciones";

import { useSEO } from "./hooks/useSEO";
import SEOSchema from "./components/SEOSchema";

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
  telephone: "+51908945354",
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

function RouteSEO({ path }) {
  const isPrivate =
    PRIVATE_PATHS.includes(path) || path.startsWith("/backoffice");
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
  // Entradas del blog: SEO dinámico a partir del post
  if (!config && path.startsWith("/blog/")) {
    const post = getPost(path.slice("/blog/".length));
    if (post) {
      config = {
        title: `${post.titulo} – Inspira Legal`,
        description: post.extracto,
        path,
      };
    }
  }
  useSEO(isPrivate ? { noIndex: true } : (config || { noIndex: true }));
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

  if (path.startsWith("/backoffice")) {
    return (
      <>
        <BackofficeApp />
        <CookieConsent />
      </>
    );
  }

  const isPanel = path.startsWith("/panel");
  const isBlogPost = path.startsWith("/blog/") && !!getPost(path.slice("/blog/".length));
  const servicioId = path.startsWith("/servicios/")
    ? path.slice("/servicios/".length)
    : null;
  const isServicioDetalle = !!getServicio(servicioId)?.detalle;
  const rutaId = path.startsWith("/ruta/") ? path.slice("/ruta/".length) : null;
  const isRuta = !!getRuta(rutaId);
  const isNotFound =
    !PUBLIC_PATHS.includes(path) && !isBlogPost && !isServicioDetalle;

  return (
    <div className="min-h-screen w-full bg-white">
      <RouteSEO path={path} />
      {!isPanel && <BarraProgreso />}

      {/* Schema.org según ruta */}
      {path === "/" && <SEOSchema schema={SCHEMA_ORG} id="org" />}
      {path === "/servicios/master" && <SEOSchema schema={SCHEMA_MASTER} id="master" />}
      {path === "/servicios/estancia" && <SEOSchema schema={SCHEMA_ESTANCIA} id="estancia" />}

      {!isPanel && !isNotFound && <Header />}

      {/* `key` fuerza el remontaje al navegar: cada página entra con animación */}
      <div key={path} className={isPanel ? undefined : "v4-page-enter"}>
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
      {path === "/panel" && <PanelCliente />}
      {path === "/reservar" && <ReservarCita />}
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
      </div>

      {/* El footer identifica al proveedor en todas las páginas públicas */}
      {!isPanel && <Footer />}

      {/* Invitación permanente a la primera asesoría (no en el panel privado) */}
      {!isPanel && <AsesoriaCTA />}

      {/* Navegación inferior tipo app (móvil y tablet) */}
      {!isPanel && (
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
