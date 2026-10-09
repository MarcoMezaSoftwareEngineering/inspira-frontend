// src/pages/backoffice/BackofficeApp.jsx
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import "../../styles/asesor.css";
import "../../styles/pasos.css";
import "../../styles/pasos-core.css";
import "../../styles/utilidades-core.css";
import { lazyConRecarga } from "../../lib/cargaDiferida";
import { boGET, boPrecargar, olvidarPeticiones } from "../../services/backofficeApi";
import Sidebar from "./layout/Sidebar";
import CampanaMensajes from "./layout/CampanaMensajes";
import MobileAppBar from "./layout/MobileAppBar";
import MobileDrawer from "./layout/MobileDrawer";
import BottomNav from "./layout/BottomNav";
import AvisoVersionNueva from "./layout/AvisoVersionNueva";
import ProtectedRoute from "./layout/ProtectedRoute";
import ModuleGate from "./layout/ModuleGate";
import { ProveedorCuentaTareas } from "./layout/ContadorTareas";
import { AuthProvider } from "./context/AuthContext";
import BuscadorGlobal from "./layout/BuscadorGlobal";
import BotonRapido from "./layout/BotonRapido";
import { peticionesDelInicio } from "./dashboard/precargaInicio";

// Cada sección viaja en su propio archivo (09/10/2026). Hasta entonces Core
// era un único paquete de 2,4 MB (680 KB comprimido) con las 32 secciones,
// CodeMirror y Recharts dentro, y quien abría el Inicio lo descargaba entero.
// Ahora el armazón (menú, campana, buscador) va solo y cada sección se pide la
// primera vez que se abre. `lazyConRecarga` sobrevive a un despliegue con la
// app abierta (ver lib/cargaDiferida.js).
const CARGAR = {
  login: () => import("./login/BackofficeLogin"),
  dashboard: () => import("./dashboard/Dashboard"),
  agenda: () => import("./agenda/Agenda"),
  procesos: () => import("./procesos/Procesos"),
  solicitudes: () => import("./solicitudes/SolicitudesList"),
  detalle: () => import("./solicitudes/SolicitudDetalleBackoffice"),
  clientes: () => import("./clientes/Clientes"),
  herramientas: () => import("./herramientas/HerramientasAsesor"),
  presupuesto: () => import("./presupuesto/PresupuestoAsesor"),
  guias: () => import("./guias/GuiasAsesor"),
  landings: () => import("./landings/Landings"),
  estancias: () => import("./estancias/SeguimientoEstancias"),
  universidades: () => import("./universidades/UniversidadesLista"),
  sistematizador: () => import("./sistematizador/SistematizadorMasteres"),
  masteres: () => import("./catalogo-masteres/BuscadorMasteres"),
  doctorado: () => import("./doctorado/DoctoradoCore"),
  presupuestos: () => import("./presupuestos/PresupuestosPortal"),
  calculadora: () => import("./calculadora/LeadsCalculadora"),
  leads: () => import("./leads/Leads"),
  leadsMapa: () => import("./leads/InteresMapa"),
  leadsEnlaces: () => import("./leads/EnlacesVisitas"),
  leadsEmbudo: () => import("./leads/EmbudoVentas"),
  pagos: () => import("./pagos/Pagos"),
  tareas: () => import("./tareas/Tareas"),
  flujos: () => import("./flujos/Flujos"),
  correo: () => import("./correo/Correo"),
  tracker: () => import("./tracker/TrackerUniversidades"),
  catalogo: () => import("./catalogo/CatalogoMasters"),
  panelAsesoras: () => import("./panel-asesoras/PanelAsesoras"),
  configuracion: () => import("./configuracion/ConfiguracionPanel"),
};

const BackofficeLogin = lazyConRecarga(CARGAR.login);
const Dashboard = lazyConRecarga(CARGAR.dashboard);
const Agenda = lazyConRecarga(CARGAR.agenda);
const Procesos = lazyConRecarga(CARGAR.procesos);
const SolicitudesList = lazyConRecarga(CARGAR.solicitudes);
const SolicitudDetalleBackoffice = lazyConRecarga(CARGAR.detalle);
const Clientes = lazyConRecarga(CARGAR.clientes);
const HerramientasAsesor = lazyConRecarga(CARGAR.herramientas);
const PresupuestoAsesor = lazyConRecarga(CARGAR.presupuesto);
const GuiasAsesor = lazyConRecarga(CARGAR.guias);
// Landings arrastraba paqueteMaster2027, costeVida y casos (80 KB) por unas
// constantes: ahora llegan con su sección y no con el armazón.
const Landings = lazyConRecarga(CARGAR.landings);
const SeguimientoEstancias = lazyConRecarga(CARGAR.estancias);
const UniversidadesLista = lazyConRecarga(CARGAR.universidades);
const SistematizadorMasteres = lazyConRecarga(CARGAR.sistematizador);
const BuscadorMasteres = lazyConRecarga(CARGAR.masteres);
const DoctoradoCore = lazyConRecarga(CARGAR.doctorado);
const PresupuestosPortal = lazyConRecarga(CARGAR.presupuestos);
const LeadsCalculadora = lazyConRecarga(CARGAR.calculadora);
const Leads = lazyConRecarga(CARGAR.leads);
const InteresMapa = lazyConRecarga(CARGAR.leadsMapa);
const EnlacesVisitas = lazyConRecarga(CARGAR.leadsEnlaces);
const EmbudoVentas = lazyConRecarga(CARGAR.leadsEmbudo);
const Pagos = lazyConRecarga(CARGAR.pagos);
const Tareas = lazyConRecarga(CARGAR.tareas);
const Flujos = lazyConRecarga(CARGAR.flujos);
const Correo = lazyConRecarga(CARGAR.correo);
const TrackerUniversidades = lazyConRecarga(CARGAR.tracker);
const CatalogoMasters = lazyConRecarga(CARGAR.catalogo);
const PanelAsesoras = lazyConRecarga(CARGAR.panelAsesoras);
const ConfiguracionPanel = lazyConRecarga(CARGAR.configuracion);

// Módulo unificado de Configuración: cada ruta abre el panel en su pestaña y
// cada pestaña enlaza a su ruta. Documentos, Checklist e Instructivos cuelgan
// de aquí desde el 14/09/2026 (antes solo se llegaba escribiendo la URL).
const CONFIG_TAB_BY_PATH = {
  "/backoffice/configuracion": "planes",
  "/backoffice/auditoria": "auditoria",
  "/backoffice/errores": "errores",
  "/backoffice/planes": "planes",
  "/backoffice/precios": "precios",
  "/backoffice/documentos": "documentos",
  "/backoffice/checklist-servicios": "checklist",
  "/backoffice/instructivos": "instructivos",
  "/backoffice/correos": "correos",
  "/backoffice/media": "media",
  "/backoffice/legal": "legal",
  "/backoffice/settings": "settings",
};

// Qué sección abre cada ruta, para adelantar su descarga al arrancar.
const SECCION_DE_RUTA = {
  "/backoffice": "dashboard",
  "/backoffice/dashboard": "dashboard",
  "/backoffice/agenda": "agenda",
  "/backoffice/procesos": "procesos",
  "/backoffice/solicitudes": "solicitudes",
  "/backoffice/clientes": "clientes",
  "/backoffice/herramientas": "herramientas",
  "/backoffice/presupuesto": "presupuesto",
  "/backoffice/guias": "guias",
  "/backoffice/landings": "landings",
  "/backoffice/estancias": "estancias",
  "/backoffice/universidades": "universidades",
  "/backoffice/sistematizador": "sistematizador",
  "/backoffice/masteres": "masteres",
  "/backoffice/doctorado": "doctorado",
  "/backoffice/presupuestos": "presupuestos",
  "/backoffice/calculadora": "calculadora",
  "/backoffice/leads": "leads",
  "/backoffice/leads/mapa": "leadsMapa",
  "/backoffice/leads/enlaces": "leadsEnlaces",
  "/backoffice/leads/embudo": "leadsEmbudo",
  "/backoffice/pagos": "pagos",
  "/backoffice/tareas": "tareas",
  "/backoffice/flujos": "flujos",
  "/backoffice/correo": "correo",
  "/backoffice/tracker-universidades": "tracker",
  "/backoffice/catalogo-masters": "catalogo",
  "/backoffice/panel-asesoras": "panelAsesoras",
};

function seccionDe(path) {
  if (SECCION_DE_RUTA[path]) return SECCION_DE_RUTA[path];
  if (path.startsWith("/backoffice/solicitudes/")) return "detalle";
  if (CONFIG_TAB_BY_PATH[path]) return "configuracion";
  return null;
}

// Las más abiertas después del Inicio: se adelantan en tiempo ocioso, ya
// pintada la pantalla, para que el primer clic no espere la descarga.
const PRECARGA_OCIOSA = ["detalle", "clientes", "tareas"];

function leerJSON(clave) {
  try { return JSON.parse(localStorage.getItem(clave) || "null"); } catch { return null; }
}

/**
 * El arranque, en paralelo (09/10/2026). Antes iba en cascada: primero la
 * sesión (/backoffice/me), luego los permisos, luego descargar el código de
 * la sección y solo entonces sus datos. Ahora todo eso sale a la vez nada más
 * cargar este archivo. No se pinta nada protegido antes de tiempo: lo que
 * llega espera en la memoria de backofficeApi a que ProtectedRoute confirme
 * la sesión y cada pieza lo pida.
 */
function adelantarArranque() {
  const path = window.location.pathname;
  if (!path.startsWith("/backoffice") || path === "/backoffice/login") return;
  if (!localStorage.getItem("bo_token")) return;
  const user = leerJSON("bo_user");

  // La sesión y los permisos comparten promesa con ProtectedRoute y AuthContext.
  boGET("/backoffice/me").catch(() => {});
  if (user) boGET("/backoffice/permisos/mine").catch(() => {});

  // El código de la sección que se va a abrir.
  const seccion = seccionDe(path);
  if (seccion) CARGAR[seccion]().catch(() => { /* lazyConRecarga lo reintenta al pintar */ });

  // Lo que el armazón pide siempre (contador de tareas y campana) y, en el
  // Inicio, sus datos si el usuario puede verlo.
  const rutas = ["/backoffice/tareas/cuenta", "/backoffice/solicitudes/mensajes/pendientes"];
  const permisos = leerJSON("bo_perms") || {};
  if (seccion === "dashboard" && (user?.rol === "admin" || permisos["dashboard.ver"])) {
    rutas.push(...peticionesDelInicio());
  }
  boPrecargar(rutas);
}

adelantarArranque();

/** Mientras llega el código de una sección: el hueco, y un aviso solo si tarda. */
function CargandoSeccion() {
  return (
    <div className="flex-1 grid place-items-center py-16" aria-busy="true">
      {/* Aparece a los 400 ms: en una carga rápida no hay parpadeo. */}
      <div style={{ animation: "inspira-fade-in .2s ease-out .4s both" }}>
        <div className="w-7 h-7 rounded-full border-[3px] border-neutral-200 border-t-primary animate-spin" />
        <span className="sr-only">Cargando…</span>
      </div>
    </div>
  );
}

export default function BackofficeApp() {
  const [path, setPath] = useState(window.location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("bo_sidebar_pinned_v2");
    return saved === "true";
  });
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem("bo_sidebar_pinned_v2");
    return saved === "true";
  });
  // Ref siempre actualizado para leerlo dentro del listener sin stale closure
  const sidebarPinnedRef = useRef(false);
  useEffect(() => { sidebarPinnedRef.current = sidebarPinned; }, [sidebarPinned]);

  // Drawer móvil: independiente del sidebar de escritorio (sin concepto de "pin")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("bo_user");
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      // Solo cierra el sidebar al navegar si NO está fijado
      if (!sidebarPinnedRef.current) setSidebarOpen(false);
      setMobileDrawerOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // El backoffice es su propia app instalable: «Inspira Core», con icono
  // propio y que abre en /backoffice. El manifiesto de la página es el del
  // asesorado; aquí se cambia por el del backoffice mientras esta parte esté
  // montada —el navegador lee el manifiesto al instalar— y se restaura al salir.
  useEffect(() => {
    const cambios = [
      ["link[rel='manifest']", "href", "/manifest-backoffice.webmanifest"],
      ["link[rel='apple-touch-icon']", "href", "/icons/core-apple-touch-icon.png"],
      ["meta[name='apple-mobile-web-app-title']", "content", "Inspira Core"],
    ];
    const previos = cambios.map(([sel, attr, valor]) => {
      const el = document.querySelector(sel);
      const antes = el?.getAttribute(attr);
      el?.setAttribute(attr, valor);
      return [el, attr, antes];
    });
    return () => previos.forEach(([el, attr, antes]) => { if (el && antes != null) el.setAttribute(attr, antes); });
  }, []);

  function navigate(to) {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function toggleSidebarPin() {
    setSidebarPinned((prev) => {
      const next = !prev;
      localStorage.setItem("bo_sidebar_pinned_v2", String(next));
      if (!next) setSidebarOpen(false);
      return next;
    });
  }

  // Estable entre renders: AuthProvider la reparte en su contexto memoizado.
  const logout = useCallback(() => {
    // Lo recordado era de esta sesión: la siguiente cuenta empieza de cero.
    olvidarPeticiones();
    localStorage.removeItem("bo_token");
    localStorage.removeItem("bo_user");
    setUser(null);
    window.history.pushState({}, "", "/backoffice/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const token = localStorage.getItem("bo_token");
  const enLogin = !token || path === "/backoffice/login";

  // Ya pintada la pantalla y sin prisa, el código de las secciones que más se
  // abren. No en el login ni si el navegador pidió ahorrar datos. Los 3 s de
  // espera son para no competir con lo primero: mientras se espera a la red el
  // navegador está «ocioso» y requestIdleCallback saltaba antes de que llegara
  // la sesión (visto en la prueba del 09/10/2026).
  useEffect(() => {
    if (enLogin || navigator.connection?.saveData) return undefined;
    const precargar = () => PRECARGA_OCIOSA.forEach((s) => CARGAR[s]().catch(() => {}));
    let ocioso = null;
    const t = setTimeout(() => {
      if ("requestIdleCallback" in window) ocioso = window.requestIdleCallback(precargar, { timeout: 5000 });
      else precargar();
    }, 3000);
    return () => {
      clearTimeout(t);
      if (ocioso != null) window.cancelIdleCallback(ocioso);
    };
  }, [enLogin]);

  if (enLogin) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <BackofficeLogin onLogin={setUser} />
      </Suspense>
    );
  }

  // ¿Estamos en /backoffice/solicitudes/:id ?
  const isDetalleSolicitud = path.startsWith("/backoffice/solicitudes/");
  let idSolicitudDetalle = null;
  if (isDetalleSolicitud) {
    const parts = path.split("/");
    idSolicitudDetalle = parseInt(parts[parts.length - 1], 10);
  }

  return (
    <ProtectedRoute onLogout={logout}>
    <AuthProvider user={user} onLogout={logout}>
    <ProveedorCuentaTareas>
      {/* Layout de altura fija, con sidebar izquierdo + panel derecho con scroll */}
      <div className="flex w-full h-dvh overflow-hidden">
        <Sidebar
          path={path}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pinned={sidebarPinned}
          onTogglePin={toggleSidebarPin}
          user={user}
          onLogout={logout}
        />

        {/* En móvil, los cuatro destinos de uso diario al alcance del pulgar.
            El cajón tiene los ocho: esto es el atajo, no el menú. */}
        <BottomNav
          path={path}
          drawerAbierto={mobileDrawerOpen}
          onMas={() => setMobileDrawerOpen((v) => !v)}
        />

        <MobileAppBar onMenuToggle={() => setMobileDrawerOpen(true)} user={user} />
        {/* Lo que los asesorados han escrito y nadie ha leído, de todos los expedientes. */}
        <CampanaMensajes navigate={navigate} />
        <BuscadorGlobal />
        <BotonRapido />
        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          path={path}
          user={user}
          onLogout={logout}
        />

        {/* Panel derecho */}
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {/* Botón de abrir sidebar — solo desktop; en móvil la app bar cubre este rol */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="hidden md:flex fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-primary text-white items-center justify-center shadow-md hover:bg-primary/90 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <AvisoVersionNueva />
          <main className="ux-con-barra-abajo flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative pt-[60px] md:pt-0">
            {/* Overlay transparente: cierra el sidebar al hacer clic fuera cuando no está fijado */}
            {sidebarOpen && !sidebarPinned && (
              <div
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 z-10"
              />
            )}
            {/* Rutas internas. La clave por ruta hace que cada página entre
                con su pequeña transición en vez de aparecer de golpe, y que
                cada pantalla empiece limpia: varias leen ?alta=1, ?tarea= o
                ?lead= solo al montarse y BotonRapido cuenta con ello. Por eso
                se queda; lo que se volvía a pedir al remontar ya lo sirve la
                memoria de backofficeApi.
                Suspense fuera de la clave: mientras llega el código de una
                sección se ve el hueco, y la página entra con su transición
                cuando ya está. */}
            <Suspense fallback={<CargandoSeccion />}>
            <div key={path} className="bo-entra">
            {path === "/backoffice" && <ModuleGate perm="dashboard.ver"><Dashboard /></ModuleGate>}
            {path === "/backoffice/dashboard" && <ModuleGate perm="dashboard.ver"><Dashboard /></ModuleGate>}

            {path === "/backoffice/agenda" && <Agenda />}

            {/* PROCESOS — vista central, sustituye a Solicitudes y Panel Asesoras */}
            {path === "/backoffice/procesos" && (
              <Procesos
                onAbrirProceso={(id) => navigate(`/backoffice/solicitudes/${id}`)}
              />
            )}

            {/* LISTA DE SOLICITUDES */}
            {path === "/backoffice/solicitudes" && (
              <SolicitudesList
                onVerSolicitud={(id) =>
                  navigate(`/backoffice/solicitudes/${id}`)
                }
              />
            )}

            {/* DETALLE DE SOLICITUD */}
            {isDetalleSolicitud && idSolicitudDetalle && (
              <SolicitudDetalleBackoffice
                idSolicitud={idSolicitudDetalle}
                onVolver={() => navigate("/backoffice/procesos")}
              />
            )}

            {/* Documentos, Checklist e Instructivos: pestañas de Configuración (abajo). */}

            {path === "/backoffice/clientes" && <Clientes />}

            {path === "/backoffice/herramientas" && <HerramientasAsesor />}

            {path === "/backoffice/presupuesto" && <PresupuestoAsesor />}

            {path === "/backoffice/guias" && <GuiasAsesor />}
            {path === "/backoffice/landings" && <Landings />}
            {path === "/backoffice/estancias" && <ModuleGate perm="solicitudes.editar"><SeguimientoEstancias /></ModuleGate>}

            {path === "/backoffice/universidades" && <UniversidadesLista />}

            {path === "/backoffice/sistematizador" && <SistematizadorMasteres />}

            {/* El catalogo final: de aqui sale el informe de masteres. */}
            {path === "/backoffice/masteres" && <BuscadorMasteres />}
            {/* Doctorado: guía del servicio y catálogo interno (18/09/2026). */}
            {path === "/backoffice/doctorado" && <DoctoradoCore />}

            {path === "/backoffice/presupuestos" && <PresupuestosPortal />}

            {path === "/backoffice/calculadora" && <LeadsCalculadora />}

            {/* LEADS — bandeja única y embudo. ?lead=ID abre la ficha. */}
            {path === "/backoffice/leads" && <ModuleGate perm="leads.ver"><Leads /></ModuleGate>}
            {path === "/backoffice/leads/mapa" && <ModuleGate perm="leads.ver"><InteresMapa /></ModuleGate>}
            {path === "/backoffice/leads/enlaces" && <ModuleGate perm="leads.ver"><EnlacesVisitas /></ModuleGate>}
            {path === "/backoffice/leads/embudo" && <ModuleGate perm="leads.ver"><EmbudoVentas /></ModuleGate>}

            {/* PAGOS — caja del mes, comprobantes y planes. ?cliente=, ?pago= y ?plan= abren lo suyo. */}
            {path === "/backoffice/pagos" && <ModuleGate perm="pagos.ver"><Pagos /></ModuleGate>}

            {/* TAREAS — lo pendiente del equipo por área. ?tarea=ID abre la ficha (enlace de los correos). */}
            {path === "/backoffice/tareas" && <Tareas />}
            {path === "/backoffice/flujos" && <Flujos />}
            {path === "/backoffice/correo" && <Correo />}

            {path === "/backoffice/tracker-universidades" && <ModuleGate perm="tracker.ver"><TrackerUniversidades /></ModuleGate>}

            {path === "/backoffice/catalogo-masters" && <ModuleGate perm="catalogo.ver"><CatalogoMasters /></ModuleGate>}

            {path === "/backoffice/panel-asesoras" && <ModuleGate perm="panel_asesoras.ver"><PanelAsesoras /></ModuleGate>}

            {CONFIG_TAB_BY_PATH[path] && (
              <ConfiguracionPanel tabId={CONFIG_TAB_BY_PATH[path]} />
            )}
            </div>
            </Suspense>
          </main>
        </div>
      </div>
    </ProveedorCuentaTareas>
    </AuthProvider>
    </ProtectedRoute>
  );
}
