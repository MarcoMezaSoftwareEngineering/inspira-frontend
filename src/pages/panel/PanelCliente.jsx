// src/pages/panel/PanelCliente.jsx
import { useEffect, useState, lazy, Suspense } from "react";
import { apiGET } from "../../services/api";
import PanelSidebar from "./components/PanelSidebar";
import Avatar from "../../components/common/Avatar";
import { datosUsuario } from "../../components/common/usuario";
import PerfilCliente from "./components/PerfilCliente";
import MisServicios from "./components/MisServicios";
import WizardPerfilCliente from "./components/WizardPerfilCliente";
import { usePerfilIncompletoBool } from "./hooks/usePerfilIncompletoBool";

const BecasEspana   = lazy(() => import("./BecasEspana"));
const GuiaMaster    = lazy(() => import("./GuiaMaster"));
const GuiaApostilla = lazy(() => import("./GuiaApostilla"));
const GuiaEstancia  = lazy(() => import("./GuiaEstancia"));
const GuiaModificatoria = lazy(() => import("./GuiaModificatoria"));

const VALID_TABS = ["servicios", "perfil", "becas", "guia", "apostilla", "estancia", "modificatoria"];

function LoadingPage() {
  return (
    <div className="pnl flex-1 flex items-center justify-center py-16">
      <div className="text-center">
        <div className="pnl-spinner" />
        <span className="pnl-nota">Cargando…</span>
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
  // La guía de estancia sólo se le enseña a quien tiene ese servicio: al
  // resto no le dice nada y le ensucia el menú.
  const [tieneEstancia, setTieneEstancia] = useState(false);
  const [tieneModificatoria, setTieneModificatoria] = useState(false);
  // Quien entra solo porque le invitaron a un expediente ajeno no tiene
  // servicios propios: las becas, las guías y el resto del portal no son suyos.
  const [soloInvitado, setSoloInvitado] = useState(false);

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

      // Todo lo que ve es de otra persona: no tiene nada suyo.
      setSoloInvitado(lista.length > 0 && lista.every((s) => s?.invitado));

      // Cada guia se le enseña solo a quien tiene ese servicio: al resto no le
      // dice nada y le ensucia el menu.
      const textoDe = (s) => String(
        s?.tipo?.nombre || s?.tipo_solicitud || s?.tipo || s?.titulo || s?.nombre_servicio || ""
      ).toLowerCase();

      setTieneModificatoria(lista.some((s) => (
        Number(s?.id_tipo_solicitud) === 20 || /modificatoria|modificaci/.test(textoDe(s))
      )));

      setTieneEstancia(lista.some((s) => {
        if (Number(s?.id_tipo_solicitud) === 20) return false; // esa es la otra
        if (Number(s?.id_tipo_solicitud) === 18) return true;
        const txt = textoDe(s);
        return txt.includes("estancia") && !/modificatoria|modificaci/.test(txt);
      }));
    } catch { setTieneSolicitudes(false); }
  }

  function handleChangeTab(newTab) {
    setTab(newTab);
    setSidebarOpen(false);
  }

  const esServicios = tab === "servicios";
  const esScrollInterno = esServicios;

  // Tab titles
  const titles = {
    servicios: "Mis Servicios", perfil: "Mi Perfil", becas: "Becas España",
    guia: "Guía Máster", apostilla: "Guía Apostilla Digital",
    estancia: "Guía Estancia por Estudios",
    modificatoria: "Guía Residencia y Trabajo",
  };

  const { nombre, corto, iniciales, foto } = datosUsuario(user);

  return (
    <div className="pnl h-screen overflow-hidden flex relative">
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
        tieneEstancia={tieneEstancia}
        tieneModificatoria={tieneModificatoria}
        soloInvitado={soloInvitado}
      />

      <main className={`flex-1 min-w-0 flex flex-col ${esScrollInterno ? "min-h-0" : "overflow-y-auto"}`}>
        {/* Barra superior */}
        <div className="pnl-top sticky top-0 z-10 shrink-0">
          <button
            className="pnl-burger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="pnl-top-eyebrow">
              <span className="punto" />
              Panel de cliente
            </p>
            <h1>{titles[tab] || "Mi panel"}</h1>
          </div>

          {/* Solo el primer nombre. Aqui se volcaba el nombre legal completo
              -los hay de 38 caracteres- y aplastaba contra el titulo de la
              pagina; el entero se lee al pasar el raton. */}
          {user && (
            <div className="pnl-top-user ml-auto">
              <span className="pnl-top-nombre hidden sm:block" title={nombre}>{corto}</span>
              <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={34} />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className={`flex-1 min-h-0 flex flex-col ${esScrollInterno ? "" : "overflow-auto"}`}>

          {/* Servicios: scroll interno */}
          {esServicios && (
            <div className="flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 py-5">
              <MisServicios onIrAGuia={handleChangeTab} />
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
          {tab === "estancia" && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaEstancia />
            </Suspense>
          )}

          {tab === "modificatoria" && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaModificatoria />
            </Suspense>
          )}

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
