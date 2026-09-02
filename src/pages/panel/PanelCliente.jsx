// src/pages/panel/PanelCliente.jsx
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import "../../styles/panel.css";
import { apiGET } from "../../services/api";
import PanelSidebar from "./components/PanelSidebar";
import Avatar from "../../components/common/Avatar";
import { datosUsuario } from "../../components/common/usuario";
import PerfilCliente from "./components/PerfilCliente";
import MisServicios from "./components/MisServicios";
import WizardPerfilCliente from "./components/WizardPerfilCliente";
import { usePerfilIncompletoBool } from "./hooks/usePerfilIncompletoBool";
import { accesosDe, esSoloInvitado, pideAcademico } from "./servicios";

const BecasEspana   = lazy(() => import("./BecasEspana"));
const GuiaMaster    = lazy(() => import("./GuiaMaster"));
const GuiaApostilla = lazy(() => import("./GuiaApostilla"));
const GuiaEstancia  = lazy(() => import("./GuiaEstancia"));
const GuiaModificatoria = lazy(() => import("./GuiaModificatoria"));

// Las dos primeras son de todos; el resto solo se abre si algún servicio
// suyo lo incluye (ver servicios.js).
const TABS_BASE = ["servicios", "perfil"];
const TABS_RECURSO = ["becas", "guia", "apostilla", "estancia", "modificatoria"];
const VALID_TABS = [...TABS_BASE, ...TABS_RECURSO];

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
  // La lista de servicios se pide una sola vez y se reparte: el menú decide
  // con ella qué recursos abrir y «Mis servicios» la pinta. Antes cada uno
  // hacía su propia petición al mismo sitio.
  const [servicios, setServicios] = useState(null); // null = todavía cargando
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");

  const lista = useMemo(() => servicios || [], [servicios]);
  const cargado = servicios !== null;
  const sinServicios = cargado && lista.length === 0;
  // Solo ve expedientes ajenos: viene a ayudar con el trámite de otra persona.
  const soloInvitado = esSoloInvitado(lista);
  // Qué guías y recursos abre lo que tiene contratado.
  const accesos = useMemo(() => accesosDe(lista), [lista]);

  // A quien no tiene ningún servicio se le piden los datos completos —es el
  // paso previo para que un asesor pueda darle acceso—. Al invitado, solo sus
  // datos generales: el expediente y su formulario son de otra persona.
  const conAcademico = !soloInvitado && (sinServicios || pideAcademico(lista));
  const perfilIncompleto = usePerfilIncompletoBool(user, conAcademico);
  const mostrarWizard = user !== null && cargado && perfilIncompleto;

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
    cargarServicios();
  }

  async function cargarServicios() {
    setCargandoServicios(true);
    setErrorServicios("");
    try {
      const rs = await apiGET("/solicitudes/mias");
      if (!rs.ok) throw new Error(rs.msg || rs.message || "No se pudieron cargar los servicios");
      setServicios(rs.solicitudes || []);
    } catch (e) {
      setServicios([]);
      setErrorServicios(e.message || "Error al cargar servicios");
    } finally {
      setCargandoServicios(false);
    }
  }

  // El panel recuerda la última pestaña abierta. Si era una guía que ya no le
  // corresponde —porque cerró ese servicio, o porque nunca fue suya— se vuelve
  // a sus servicios en vez de dejarle mirando algo que no ha contratado.
  useEffect(() => {
    if (!cargado) return;
    if (TABS_RECURSO.includes(tab) && !accesos.has(tab)) setTab("servicios");
  }, [cargado, accesos, tab]);

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
        accesos={accesos}
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
              <MisServicios
                servicios={lista}
                loading={cargandoServicios}
                error={errorServicios}
                onRecargar={cargarServicios}
                onIrAGuia={handleChangeTab}
              />
            </div>
          )}

          {/* Perfil: scroll externo */}
          {tab === "perfil" && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5">
              <PerfilCliente user={user} onUserUpdated={(nuevo) => setUser(nuevo)} />
            </div>
          )}

          {/* Becas España */}
          {tab === "becas" && accesos.has("becas") && (
            <Suspense fallback={<LoadingPage />}>
              <BecasEspana />
            </Suspense>
          )}

          {/* Guía Máster */}
          {tab === "guia" && accesos.has("guia") && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaMaster />
            </Suspense>
          )}

          {/* Guía Apostilla Digital */}
          {tab === "estancia" && accesos.has("estancia") && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaEstancia />
            </Suspense>
          )}

          {tab === "modificatoria" && accesos.has("modificatoria") && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaModificatoria />
            </Suspense>
          )}

          {tab === "apostilla" && accesos.has("apostilla") && (
            <Suspense fallback={<LoadingPage />}>
              <GuiaApostilla />
            </Suspense>
          )}
        </div>
      </main>

      {mostrarWizard && (
        <WizardPerfilCliente
          user={user}
          conAcademico={conAcademico}
          onComplete={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}
