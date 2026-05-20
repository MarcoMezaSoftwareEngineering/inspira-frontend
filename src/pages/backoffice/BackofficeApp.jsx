// src/pages/backoffice/BackofficeApp.jsx
import { useEffect, useRef, useState } from "react";
import Sidebar from "./layout/Sidebar";
import ProtectedRoute from "./layout/ProtectedRoute";
import BackofficeLogin from "./login/BackofficeLogin";
import Dashboard from "./dashboard/Dashboard";
import PreciosServicios from "./precios/PreciosServicios";
import UsuariosSettings from "./settings/UsuariosSettings";
import Clientes from "./clientes/Clientes";
import ChecklistServicios from "./checklist/ChecklistServicios";
import SolicitudesList from "./solicitudes/SolicitudesList";
import SolicitudDetalleBackoffice from "./solicitudes/SolicitudDetalleBackoffice";
import InstructivosServicios from "./instructivos/InstructivosServicios";
import DocumentosBackoffice from "./documentos/DocumentosBackoffice";
import LeadsCalculadora from "./calculadora/LeadsCalculadora";
import PanelAsesoras from "./panel-asesoras/PanelAsesoras";
import Agenda from "./agenda/Agenda";
import EmailTemplates from "./correos/EmailTemplates";
import MediaPanel from "./media/MediaPanel";
import PresupuestosPortal from "./presupuestos/PresupuestosPortal";
import CatalogoMasters from "./catalogo/CatalogoMasters";
import PlanesAdmin from "./planes/PlanesAdmin";
import TrackerUniversidades from "./tracker/TrackerUniversidades";

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
  sidebarPinnedRef.current = sidebarPinned;

  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("bo_user");
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      // Solo cierra el sidebar al navegar si NO está fijado
      if (!sidebarPinnedRef.current) setSidebarOpen(false);
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

        {/* Panel derecho */}
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {/* Botón de abrir sidebar — visible solo cuando está cerrado */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <main className="flex-1 flex flex-col overflow-y-auto relative">
            {/* Overlay transparente: cierra el sidebar al hacer clic fuera cuando no está fijado */}
            {sidebarOpen && !sidebarPinned && (
              <div
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 z-10"
              />
            )}
            {/* Rutas internas */}
            {path === "/backoffice" && <Dashboard />}
            {path === "/backoffice/dashboard" && <Dashboard />}

            {path === "/backoffice/agenda" && <Agenda />}

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
                onVolver={() => navigate("/backoffice/solicitudes")}
              />
            )}

            {(path === "/backoffice/checklist-servicios" || path === "/backoffice/instructivos") && (
              <TabView
                key="checklist-instructivos"
                initialTab={path === "/backoffice/instructivos" ? 1 : 0}
                tabs={[
                  { label: "Checklist Servicios", content: <ChecklistServicios /> },
                  { label: "Instructivos",         content: <InstructivosServicios /> },
                ]}
              />
            )}

            {path === "/backoffice/documentos" && <DocumentosBackoffice />}

            {path === "/backoffice/clientes" && <Clientes user={user} />}
            {path === "/backoffice/precios" && <PreciosServicios />}

            {path === "/backoffice/presupuestos" && <PresupuestosPortal />}

            {path === "/backoffice/calculadora" && <LeadsCalculadora user={user} />}

            {path === "/backoffice/tracker-universidades" && <TrackerUniversidades />}

            {path === "/backoffice/catalogo-masters" && <CatalogoMasters />}
            {path === "/backoffice/planes" && <PlanesAdmin />}

            {path === "/backoffice/panel-asesoras" && <PanelAsesoras />}

            {(path === "/backoffice/correos" || path === "/backoffice/media") && (
              <TabView
                key="correos-media"
                initialTab={path === "/backoffice/media" ? 1 : 0}
                tabs={[
                  { label: "Correos", content: <EmailTemplates /> },
                  { label: "Media",   content: <MediaPanel /> },
                ]}
              />
            )}

            {path === "/backoffice/settings" && (
              <UsuariosSettings user={user} />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function TabView({ tabs, initialTab = 0 }) {
  const [active, setActive] = useState(initialTab);
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-neutral-200 px-6 pt-4 gap-1 shrink-0">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              active === i
                ? "bg-primary text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tabs[active].content}
      </div>
    </div>
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
