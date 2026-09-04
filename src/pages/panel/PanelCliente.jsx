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
import { usePerfilIncompletoBool, datosQueFaltan } from "./hooks/usePerfilIncompletoBool";
import AvisoPerfil from "./components/AvisoPerfil";
import { accesosDe, esSoloInvitado, pideAcademico } from "./servicios";
import { leerRuta, rutaDe } from "./ruta";
import { navigate } from "../../services/navigate";
import { loginGoogle } from "../../components/layout/Header/LoginButton";

const BecasEspana   = lazy(() => import("./BecasEspana"));
const GuiaMaster    = lazy(() => import("./GuiaMaster"));
const GuiaApostilla = lazy(() => import("./GuiaApostilla"));
const GuiaEstancia  = lazy(() => import("./GuiaEstancia"));
const GuiaModificatoria = lazy(() => import("./GuiaModificatoria"));

// Las dos primeras son de todos; el resto solo se abre si algún servicio
// suyo lo incluye (ver servicios.js).
const TABS_RECURSO = ["becas", "guia", "apostilla", "estancia", "modificatoria"];

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

export default function PanelCliente({ path }) {
  // La pestaña sale de la URL, no de localStorage: así «atrás» vuelve a la
  // anterior y un enlace puede abrir el panel por donde haga falta.
  const ruta = useMemo(() => leerRuta(path), [path]);
  const tab = ruta.tab || "servicios";

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
  // El asistente solo cierra el paso a quien todavía no tiene nada contratado:
  // completar sus datos es lo previo a que un asesor le dé acceso. A quien ya
  // tiene expediente se le avisa arriba de lo que falta, y sigue trabajando.
  const mostrarWizard = user !== null && cargado && perfilIncompleto && sinServicios;
  const avisarPerfil = user !== null && cargado && perfilIncompleto && !sinServicios && tab !== "perfil";
  const faltanDatos = avisarPerfil ? datosQueFaltan(user, conAcademico) : 0;

  // Sin sesión no se manda a la portada a buscar el botón: se va a Google y se
  // vuelve a esta misma URL. Es lo que hace que un enlace de correo a un
  // expediente funcione aunque la sesión haya caducado.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { loginGoogle(); return; }
    cargarMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (ruta.tab === null) { navigate("/panel", { replace: true }); return; }
    if (!cargado) return;
    if (TABS_RECURSO.includes(tab) && !accesos.has(tab)) navigate("/panel", { replace: true });
  }, [cargado, accesos, tab, ruta.tab]);

  function handleChangeTab(newTab) {
    navigate(rutaDe({ tab: newTab }));
    setSidebarOpen(false);
  }

  const esServicios = tab === "servicios";
  const esScrollInterno = esServicios;
  const claveVista = ruta.idServicio ? `expediente-${ruta.idServicio}` : tab;

  // Tab titles
  const titles = {
    servicios: "Inicio", perfil: "Mi Perfil", becas: "Becas España",
    guia: "Guía Máster", apostilla: "Guía Apostilla Digital",
    estancia: "Guía Estancia por Estudios",
    modificatoria: "Guía Residencia y Trabajo",
  };

  const { nombre, corto, iniciales, foto } = datosUsuario(user);

  // `h-dvh` y no `h-screen`: en Safari de iPhone 100vh cuenta la barra del
  // navegador y el borde de abajo quedaba tapado. El backoffice ya lo usa.
  return (
    <div className="pnl h-dvh overflow-hidden flex relative">
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

        {/* Contenido. La clave cambia al cambiar de vista —pestaña o expediente—
            y cada una entra con su transición. No cambia al cambiar de sección
            dentro de un expediente: eso lo anima el propio expediente, sin
            remontarse ni volver a pedir nada. */}
        <div className={`flex-1 min-h-0 flex flex-col ${esScrollInterno ? "" : "overflow-auto"}`}>
        <div key={claveVista} className="pnl-entra pnl-entra-llena">
          {avisarPerfil && (
            <div className="px-4 sm:px-6 pt-4 shrink-0">
              <AvisoPerfil faltan={faltanDatos} onIr={() => handleChangeTab("perfil")} />
            </div>
          )}

          {/* Servicios: scroll interno */}
          {esServicios && (
            <div className="flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 py-5">
              <MisServicios
                ruta={ruta}
                perfil={user}
                conAcademico={conAcademico}
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
