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
    streetAddress: "Cal. Fermín Tanguis Nro. 279, Urb. Ingeniería",
    addressLocality: "San Martín de Porres, Lima",
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
  const config = SEO_PAGES[path];
  useSEO(isPrivate ? { noIndex: true } : (config || { noIndex: true }));
  return null;
}

// ── App ─────────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/auth/success",
  "/servicios/master",
  "/servicios/estancia",
  "/calculadora-master",
  "/panel",
  "/reservar",
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
  const isNotFound = !PUBLIC_PATHS.includes(path);

  return (
    <div className="min-h-screen w-full bg-white">
      <RouteSEO path={path} />

      {/* Schema.org según ruta */}
      {path === "/" && <SEOSchema schema={SCHEMA_ORG} id="org" />}
      {path === "/servicios/master" && <SEOSchema schema={SCHEMA_MASTER} id="master" />}
      {path === "/servicios/estancia" && <SEOSchema schema={SCHEMA_ESTANCIA} id="estancia" />}

      {!isPanel && !isNotFound && <Header />}

      {path === "/" && <Home />}
      {path === "/auth/success" && <AuthSuccess />}
      {path === "/servicios/master" && <PortalServiciosMaster />}
      {path === "/servicios/estancia" && <EstanciaLanding />}
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

      {/* El footer identifica al proveedor en todas las páginas públicas */}
      {!isPanel && <Footer />}

      {/* Banner de cookies: siempre montado, decide él si se muestra */}
      <CookieConsent />
    </div>
  );
}
