// src/pages/backoffice/BackofficeApp.jsx
import { useEffect, useRef, useState } from "react";
import "../../styles/asesor.css";
import Sidebar from "./layout/Sidebar";
import MobileAppBar from "./layout/MobileAppBar";
import MobileDrawer from "./layout/MobileDrawer";
import ProtectedRoute from "./layout/ProtectedRoute";
import ModuleGate from "./layout/ModuleGate";
import TabView from "./layout/TabView";
import { AuthProvider } from "./context/AuthContext";
import BackofficeLogin from "./login/BackofficeLogin";
import Dashboard from "./dashboard/Dashboard";
import Clientes from "./clientes/Clientes";
import ChecklistServicios from "./checklist/ChecklistServicios";
import SolicitudesList from "./solicitudes/SolicitudesList";
import SolicitudDetalleBackoffice from "./solicitudes/SolicitudDetalleBackoffice";
import InstructivosServicios from "./instructivos/InstructivosServicios";
import DocumentosBackoffice from "./documentos/DocumentosBackoffice";
import LeadsCalculadora from "./calculadora/LeadsCalculadora";
import PanelAsesoras from "./panel-asesoras/PanelAsesoras";
import Agenda from "./agenda/Agenda";
import Procesos from "./procesos/Procesos";
import PresupuestosPortal from "./presupuestos/PresupuestosPortal";
import CatalogoMasters from "./catalogo/CatalogoMasters";
import TrackerUniversidades from "./tracker/TrackerUniversidades";
import HerramientasAsesor from "./herramientas/HerramientasAsesor";
import PresupuestoAsesor from "./presupuesto/PresupuestoAsesor";
import GuiasAsesor from "./guias/GuiasAsesor";
import UniversidadesLista from "./universidades/UniversidadesLista";
import SistematizadorMasteres from "./sistematizador/SistematizadorMasteres";
import BuscadorMasteres from "./catalogo-masteres/BuscadorMasteres";
import ConfiguracionPanel from "./configuracion/ConfiguracionPanel";

// Módulo unificado de Configuración: las rutas antiguas siguen funcionando y
// abren el panel en la pestaña correspondiente.
const CONFIG_TAB_BY_PATH = {
  "/backoffice/configuracion": "planes",
  "/backoffice/auditoria": "auditoria",
  "/backoffice/planes": "planes",
  "/backoffice/precios": "precios",
  "/backoffice/correos": "correos",
  "/backoffice/media": "media",
  "/backoffice/legal": "legal",
  "/backoffice/settings": "settings",
};

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

  function logout() {
    localStorage.removeItem("bo_token");
    localStorage.removeItem("bo_user");
    setUser(null);
    navigate("/backoffice/login");
  }

  const token = localStorage.getItem("bo_token");
  if (!token || path === "/backoffice/login") {
    return <BackofficeLogin onLogin={setUser} />;
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

        <MobileAppBar onMenuToggle={() => setMobileDrawerOpen(true)} user={user} />
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

          <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative pt-[60px] md:pt-0">
            {/* Overlay transparente: cierra el sidebar al hacer clic fuera cuando no está fijado */}
            {sidebarOpen && !sidebarPinned && (
              <div
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 z-10"
              />
            )}
            {/* Rutas internas. La clave por ruta hace que cada página entre
                con su pequeña transición en vez de aparecer de golpe. */}
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

            {(path === "/backoffice/checklist-servicios" || path === "/backoffice/instructivos") && (
              <TabView
                key="checklist-instructivos"
                initialTab={path === "/backoffice/instructivos" ? 1 : 0}
                tabs={[
                  { label: "Checklist Servicios", content: <ModuleGate perm="checklist.ver"><ChecklistServicios /></ModuleGate> },
                  { label: "Instructivos",         content: <ModuleGate perm="instructivos.ver"><InstructivosServicios /></ModuleGate> },
                ]}
              />
            )}

            {path === "/backoffice/documentos" && <DocumentosBackoffice />}

            {path === "/backoffice/clientes" && <Clientes />}

            {path === "/backoffice/herramientas" && <HerramientasAsesor />}

            {path === "/backoffice/presupuesto" && <PresupuestoAsesor />}

            {path === "/backoffice/guias" && <GuiasAsesor />}

            {path === "/backoffice/universidades" && <UniversidadesLista />}

            {path === "/backoffice/sistematizador" && <SistematizadorMasteres />}

            {/* El catalogo final: de aqui sale el informe de masteres. */}
            {path === "/backoffice/masteres" && <BuscadorMasteres />}

            {path === "/backoffice/presupuestos" && <PresupuestosPortal />}

            {path === "/backoffice/calculadora" && <LeadsCalculadora />}

            {path === "/backoffice/tracker-universidades" && <ModuleGate perm="tracker.ver"><TrackerUniversidades /></ModuleGate>}

            {path === "/backoffice/catalogo-masters" && <ModuleGate perm="catalogo.ver"><CatalogoMasters /></ModuleGate>}

            {path === "/backoffice/panel-asesoras" && <ModuleGate perm="panel_asesoras.ver"><PanelAsesoras /></ModuleGate>}

            {CONFIG_TAB_BY_PATH[path] && (
              <ConfiguracionPanel initialTabId={CONFIG_TAB_BY_PATH[path]} />
            )}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
    </ProtectedRoute>
  );
}

function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p className="text-neutral-700 mt-2">Módulo en construcción.</p>
    </div>
  );
}
