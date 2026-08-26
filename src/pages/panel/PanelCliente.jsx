// src/pages/panel/PanelCliente.jsx
import { useEffect, useState, lazy, Suspense } from "react";
import { apiGET } from "../../services/api";
import PanelSidebar from "./components/PanelSidebar";
import PerfilCliente from "./components/PerfilCliente";
import MisServicios from "./components/MisServicios";
import WizardPerfilCliente from "./components/WizardPerfilCliente";
import { usePerfilIncompletoBool } from "./hooks/usePerfilIncompletoBool";

const BecasEspana   = lazy(() => import("./BecasEspana"));
const GuiaMaster    = lazy(() => import("./GuiaMaster"));
const GuiaApostilla = lazy(() => import("./GuiaApostilla"));

const VALID_TABS = ["servicios", "perfil", "becas", "guia", "apostilla"];

function LoadingPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-neutral-400">
        <div className="w-5 h-5 border-2 border-[#1D6A4A] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Cargando…</span>
      </div>
    </div>
  );
}

export default function PanelCliente() {
  const [tab, setTab] = useState(() => {
    if (typeof window === "undefined") return "servicios";
    const saved = window.localStorage.getItem("panel_tab");
    return VALID_TABS.includes(saved) ? saved : "servicios";
  });

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tieneSolicitudes, setTieneSolicitudes] = useState(null);

  const perfilIncompleto = usePerfilIncompletoBool(user);
  const mostrarWizard = user !== null && tieneSolicitudes !== null && tieneSolicitudes && perfilIncompleto;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem("panel_tab", tab); } catch { /* noop */ }
  }, [tab]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/"; return; }
    cargarMe();
  }, []);

  async function cargarMe() {
    try {
      const r = await apiGET("/cliente/me");
      if (!r.ok) { window.location.href = "/"; return; }
      setUser(r.cliente || r.user || r);
    } catch { window.location.href = "/"; }
    try {
      const rs = await apiGET("/solicitudes/mias");
      const lista = rs.ok ? (rs.solicitudes || []) : [];
      const tieneNoVisado = lista.some((s) => {
        const cod = String(
          s?.tipo_solicitud || s?.tipo || s?.categoria ||
          s?.servicio?.codigo || s?.codigo_servicio || s?.nombre_servicio || ""
        ).toUpperCase();
        return !cod.includes("VISADO") && String(s?.codigo_servicio || s?.servicio?.codigo || "") !== "017";
      });
      setTieneSolicitudes(tieneNoVisado);
    } catch { setTieneSolicitudes(false); }
  }

  function handleChangeTab(newTab) {
    setTab(newTab);
    setSidebarOpen(false);
  }

  const esServicios = tab === "servicios";
  const esScrollInterno = esServicios;

  // Tab titles
  const titles = { servicios: "Mis Servicios", perfil: "Mi Perfil", becas: "Becas España", guia: "Guía Máster", apostilla: "Guía Apostilla Digital" };

  return (
    <div className="h-screen overflow-hidden flex bg-[#F4F6F9] relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <PanelSidebar
        user={user}
        activeTab={tab}
        onChangeTab={handleChangeTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tieneSolicitudes={tieneSolicitudes}
      />

      <main className={`flex-1 min-w-0 flex flex-col ${esScrollInterno ? "min-h-0" : "overflow-y-auto"}`}>
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] px-5 sm:px-7 py-3 flex items-center gap-4 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-sm shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#1D6A4A] uppercase tracking-widest leading-none mb-0.5 font-mono">
              Panel de cliente
            </p>
            <h1 className="text-[17px] font-serif font-bold text-[#1A3557] leading-tight truncate">
              {titles[tab] || "Mi panel"}
            </h1>
          </div>
          {/* min-w-0 en vez de shrink-0: con shrink-0 el bloque del nombre no
              cedia nunca, y un nombre largo -los hay de 38 caracteres- aplastaba
              contra el el titulo de la pagina. Ahora el que se recorta es el
              nombre, que ademas se lee entero al pasar el raton. */}
          {user?.nombre && (
            <div className="ml-auto flex items-center gap-2 min-w-0">
              <span
                className="hidden sm:block text-[12px] text-neutral-500 truncate max-w-[150px] lg:max-w-[220px]"
                title={user.nombre}
              >
                {user.nombre}
              </span>
              <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold text-[#1A3557] font-serif"
                style={{ background: "linear-gradient(135deg, #E8F5EE, #EEF2F8)" }}>
                {user.nombre?.[0]?.toUpperCase() || "?"}
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className={`flex-1 min-h-0 flex flex-col ${esScrollInterno ? "" : "overflow-auto"}`}>

          {/* Servicios: scroll interno */}
          {esServicios && (
            <div className="flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 py-5">
              <MisServicios />
            </div>
          )}

          {/* Perfil: scroll externo */}
          {tab === "perfil" && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5">
              <PerfilCliente user={user} onUserUpdated={(nuevo) => setUser(nuevo)} />
            </div>
          )}

          {/* Becas España */}
          {tab === "becas" && (
            <Suspense fallback={<LoadingPage />}>
              <BecasEspana />
            </Suspense>
          )}

          {/* Guía Máster */}
          {tab === "guia" && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaMaster />
            </Suspense>
          )}

          {/* Guía Apostilla Digital */}
          {tab === "apostilla" && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaApostilla />
            </Suspense>
          )}
        </div>
      </main>

      {mostrarWizard && (
        <WizardPerfilCliente
          user={user}
          onComplete={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}
