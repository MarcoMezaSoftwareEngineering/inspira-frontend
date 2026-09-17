// src/pages/panel/PanelCliente.jsx
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { lazyConRecarga } from "../../lib/cargaDiferida";
import "../../styles/panel.css";
// La capa de app (movimiento, pestañas, saludo). Después de panel.css: la afina.
import "../../styles/panel-app.css";
import "../../styles/pasos-core.css";
// pasos.css define las clases ex-* de las tarjetas de documentos y las
// secciones (ChecklistDocumentos, SeccionPanel), que usan también el visado y
// la estancia. Antes solo lo importaban RutaPasos y TarjetaMaster, del máster:
// quien solo tenía visado y entraba directo veía los documentos sin estilos.
import "../../styles/pasos.css";
import { apiGET, apiPOST } from "../../services/api";
import PanelSidebar from "./components/PanelSidebar";
import Avatar from "../../components/common/Avatar";
import Icono from "../../components/common/Icono";
import { datosUsuario } from "../../components/common/usuario";
import PerfilCliente from "./components/PerfilCliente";
import MisServicios from "./components/MisServicios";
import WizardPerfilCliente from "./components/WizardPerfilCliente";
import { usePerfilIncompletoBool, datosQueFaltan } from "./hooks/usePerfilIncompletoBool";
import AvisoPerfil from "./components/AvisoPerfil";
import Bienvenida from "./components/Bienvenida";
import { pendientesDe } from "./pendientes";
import Tour from "./components/Tour";
import { accesosDe, esSoloInvitado, guiasPortalDe, pestanasGuiasDe, pideAcademico, pideCompleto, CLAVES_GUIAS } from "./servicios";
import MisGuias from "./components/MisGuias";
import MiRuta from "./components/MiRuta";
import { leerRuta, rutaDe } from "./ruta";
import { navigate } from "../../services/navigate";
import AvisoVersionNueva from "../backoffice/layout/AvisoVersionNueva";
import CercoErrores from "../../components/common/CercoErrores";
import BarraPestanas from "./components/BarraPestanas";
import AvisoSesion from "./components/AvisoSesion";
import SeguridadSesion from "./components/SeguridadSesion";
import { alTerminarSesion, borrarSesionLocal, caducado, leerToken, vigilarSesion } from "../../services/sesion";
import { useTirarParaRecargar } from "./hooks/useMovimiento";

// Las guías (GuiaMaster, GuiaApostilla…) las descarga MisGuias al abrirlas.
const BecasEspana   = lazyConRecarga(() => import("./BecasEspana"));
// «Mis pagos» se descarga al abrirlo; sus estilos van en panel.css (ex-pg-*).
const MisPagos      = lazyConRecarga(() => import("./components/MisPagos"));

// Recursos que solo se abren si algún servicio suyo los incluye (servicios.js):
// Becas España y las pestañas de «Mis guías».
const TABS_RECURSO = ["becas", ...CLAVES_GUIAS];

/** Los pasos de la portada. El orden es el de la pantalla, de arriba abajo. */
const PASOS_INICIO = [
  {
    clave: "asesor",
    titulo: "Quién te atiende",
    texto: "Aquí ves siempre quién lleva tu expediente y cómo escribirle por WhatsApp.",
  },
  {
    clave: "hoy",
    titulo: "Lo que te toca hacer",
    texto: "Arriba, en grande, lo más urgente. Aquí, el resto por orden. Toca cualquier línea y te lleva justo a donde se resuelve.",
  },
  {
    clave: "servicios",
    titulo: "Tus servicios",
    texto: "Cada trámite contratado, con cómo va: documentos, formulario, plazos. Toca una línea para ir a esa sección, o «Abrir» para entrar al expediente.",
  },
  {
    clave: "menu",
    titulo: "El menú",
    texto: "Desde aquí vuelves a Inicio, abres tus servicios, tus pagos o tu ruta y tu perfil. En «Más» están tus guías y, si quieres ver este recorrido otra vez, «¿Cómo funciona?».",
  },
];


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
  const tab = ruta.tab || "inicio";

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // El recorrido: sale solo la primera vez que entra con servicios —se apunta
  // en su perfil, no en el teléfono— y se repite desde «¿Cómo funciona?».
  const [tour, setTour] = useState(false);
  // La lista de servicios se pide una sola vez y se reparte: el menú decide
  // con ella qué recursos abrir y «Mis servicios» la pinta. Antes cada uno
  // hacía su propia petición al mismo sitio.
  const [servicios, setServicios] = useState(null); // null = todavía cargando
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");
  // Sus planes de pago (GET /cliente/pagos). null = todavía cargando. La
  // pestaña «Mis pagos» solo existe si tiene alguno.
  const [pagos, setPagos] = useState(null);
  const planesPago = useMemo(() => pagos?.planes || [], [pagos]);
  const conPagos = planesPago.length > 0;

  const lista = useMemo(() => servicios || [], [servicios]);
  const cargado = servicios !== null;
  const sinServicios = cargado && lista.length === 0;
  // Solo ve expedientes ajenos: viene a ayudar con el trámite de otra persona.
  const soloInvitado = esSoloInvitado(lista);
  // Qué guías y recursos abre lo que tiene contratado.
  const accesos = useMemo(() => accesosDe(lista), [lista]);
  // Las guías en PDF de sus servicios: la del trámite y la del portal.
  const guiasPortal = useMemo(() => guiasPortalDe(lista), [lista]);
  // Las pestañas de «Mis guías» que le tocan (PDF, Máster, Estancia…).
  const pestanasGuia = useMemo(() => pestanasGuiasDe(accesos, guiasPortal), [accesos, guiasPortal]);

  // A quien no tiene ningún servicio se le piden los datos completos —es el
  // paso previo para que un asesor pueda darle acceso—. Al invitado, solo sus
  // datos generales: el expediente y su formulario son de otra persona.
  const conAcademico = !soloInvitado && (sinServicios || pideAcademico(lista));
  // Paquete de máster: el perfil entero es condición del servicio.
  const conCompleto = !soloInvitado && pideCompleto(lista);
  const perfilIncompleto = usePerfilIncompletoBool(user, conAcademico, conCompleto);
  // El asistente solo cierra el paso a quien todavía no tiene nada contratado:
  // completar sus datos es lo previo a que un asesor le dé acceso. A quien ya
  // tiene expediente se le avisa arriba de lo que falta, y sigue trabajando.
  const mostrarWizard = user !== null && cargado && perfilIncompleto && sinServicios;
  const avisarPerfil = user !== null && cargado && perfilIncompleto && !sinServicios && tab !== "perfil";
  const faltanDatos = avisarPerfil ? datosQueFaltan(user, conAcademico, conCompleto) : 0;
  // Lo mismo, para «¿Qué me falta?» dentro de cada expediente.
  const faltanPerfil = user !== null && cargado ? datosQueFaltan(user, conAcademico, conCompleto) : 0;
  // Cuántas cosas esperan: sale en el menú junto a «Inicio» y como punto sobre
  // el botón del menú, para saberlo sin abrir nada.
  const nPendientes = useMemo(
    () => (user && cargado ? pendientesDe(lista, user, conAcademico, conCompleto, planesPago).length : 0),
    [user, cargado, lista, conAcademico, conCompleto, planesPago],
  );

  // Sin sesión se recibe, no se expulsa: la bienvenida explica qué es esto y
  // ofrece entrar. Al pulsar, el login conserva esta misma URL, así que un
  // enlace de correo a un expediente sigue funcionando con la sesión caducada.
  // Un token caducado cuenta como sin sesión: se limpia aquí mismo en vez de
  // montar el panel y esperar a que la primera petición falle.
  const [sinSesion] = useState(() => {
    const token = leerToken();
    if (token && caducado(token)) { borrarSesionLocal({ avisarPestanas: false }); return true; }
    return !token;
  });
  // La sesión terminó con el panel abierto (caducó, se cerró en otra pestaña o
  // dispositivo, se desactivó la cuenta). Se avisa encima, sin expulsar.
  const [finSesion, setFinSesion] = useState(null);
  // /cliente/me no respondió (red, servidor). Antes se mandaba a la portada.
  const [errorMe, setErrorMe] = useState("");

  useEffect(() => {
    if (sinSesion) return undefined;
    cargarMe();
    const dejarDeVigilar = vigilarSesion(setFinSesion);
    const dejarDeEscuchar = alTerminarSesion(setFinSesion);
    return () => { dejarDeVigilar(); dejarDeEscuchar(); };
  }, [sinSesion]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cargarMe({ silencioso = false } = {}) {
    if (!silencioso) setErrorMe("");
    try {
      const r = await apiGET("/cliente/me");
      // Sin `ok` es que la sesión terminó: ya lo pinta AvisoSesion.
      if (r.ok === undefined) return;
      if (!r.ok) {
        if (!silencioso) setErrorMe(r.msg || r.message || "No hemos podido cargar tu expediente.");
        return;
      }
      setUser(r.cliente || r.user || r);
    } catch {
      if (!silencioso) setErrorMe("No hay conexión. Comprueba tu internet y vuelve a intentarlo.");
      return;
    }
    if (silencioso) return;
    cargarServicios();
    cargarPagos();
  }

  // Tirar para recargar: lo mismo que entrar, sin esqueletos ni saltos.
  const recargarTodo = useCallback(
    () => Promise.all([cargarMe({ silencioso: true }), cargarServicios({ silencioso: true }), cargarPagos()]),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function cargarServicios({ silencioso = false } = {}) {
    if (!silencioso) setCargandoServicios(true);
    setErrorServicios("");
    try {
      const rs = await apiGET("/solicitudes/mias");
      if (!rs.ok) throw new Error(rs.msg || rs.message || "No se pudieron cargar los servicios");
      setServicios(rs.solicitudes || []);
    } catch (e) {
      // Recargando en silencio no se vacía lo que ya se veía.
      if (!silencioso) setServicios([]);
      setErrorServicios(e.message || "Error al cargar servicios");
    } finally {
      setCargandoServicios(false);
    }
  }

  // Si falla, no se esconde nada que ya se viera: se guarda el error y la
  // pestaña (si se llegó por enlace) lo enseña con «Reintentar».
  async function cargarPagos() {
    try {
      const r = await apiGET("/cliente/pagos");
      if (!r?.ok) throw new Error(r?.msg || "No se pudieron cargar tus pagos");
      setPagos(r);
    } catch (e) {
      setPagos((antes) => ({ ...(antes || {}), planes: antes?.planes || [], error: e.message || "No se pudieron cargar tus pagos" }));
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

  // «Mis pagos» sin ningún plan no es una página: se vuelve a Inicio. Con
  // error de carga se queda, para poder reintentar.
  useEffect(() => {
    if (tab === "pagos" && pagos !== null && !pagos.error && !conPagos) navigate("/panel", { replace: true });
  }, [tab, pagos, conPagos]);

  function handleChangeTab(newTab) {
    navigate(rutaDe({ tab: newTab }));
    setSidebarOpen(false);
  }

  // Inicio y la lista de servicios comparten el marco: son las dos vistas
  // desde las que se abre un expediente.
  const esServicios = tab === "servicios" || tab === "inicio";
  // Solo un expediente abierto gestiona su propio scroll (sus secciones llenan
  // la altura). Inicio y la lista se desplazan dentro de <main>, con la barra
  // de arriba fija: si no, en el móvil el botón del menú se iba con el scroll.
  const esScrollInterno = esServicios && Boolean(ruta.idServicio);
  const claveVista = ruta.idServicio ? `expediente-${ruta.idServicio}` : tab;

  const tourPendiente = user !== null && cargado && lista.length > 0 && !mostrarWizard
    && tab === "inicio" && !ruta.idServicio && !user?.datos_extra?.tour_visto_at;
  useEffect(() => {
    if (!tourPendiente) return undefined;
    const t = setTimeout(() => setTour(true), 700); // que la portada termine de pintarse
    return () => clearTimeout(t);
  }, [tourPendiente]);

  async function terminarTour() {
    setTour(false);
    if (user?.datos_extra?.tour_visto_at) return;
    try {
      const r = await apiPOST("/cliente/me/tour", {});
      if (r?.ok && r.cliente) setUser(r.cliente);
      else setUser((u) => ({ ...u, datos_extra: { ...(u?.datos_extra || {}), tour_visto_at: new Date().toISOString() } }));
    } catch { /* si no se guarda, saldrá otra vez; no pasa nada */ }
  }
  function verTour() {
    setSidebarOpen(false);
    if (tab !== "inicio" || ruta.idServicio) navigate("/panel");
    setTimeout(() => setTour(true), tab === "inicio" && !ruta.idServicio ? 0 : 500);
  }

  // Tab titles
  // Todas las guías comparten título: la pestaña de dentro dice cuál es.
  const titles = {
    inicio: "Mi expediente", servicios: "Mis servicios", ruta: "Mi ruta", pagos: "Mis pagos", perfil: "Mi Perfil", becas: "Becas España",
    ...Object.fromEntries(CLAVES_GUIAS.map((clave) => [clave, "Mis guías"])),
  };

  const { nombre, iniciales, foto } = datosUsuario(user);

  // En el teléfono se navega con la barra de abajo; dentro de un expediente
  // no, que allí mandan sus secciones y sus botones de guardar.
  const conTabbar = !ruta.idServicio;
  const tituloBarra = titles[tab] || "Mi panel";
  const enPortada = tab === "inicio" && !ruta.idServicio;

  // La zona que se desplaza: para la barra de arriba (sombra al bajar, título
  // que aparece cuando el saludo se va) y para tirar y recargar. Se escribe
  // en el DOM y no en el estado: un scroll no debe repintar el panel.
  const zonaRef = useRef(null);
  const barraRef = useRef(null);
  const { recargando } = useTirarParaRecargar(zonaRef, recargarTodo, !sinSesion && !esScrollInterno && !finSesion);

  useEffect(() => {
    const zona = zonaRef.current;
    const barra = barraRef.current;
    if (!zona || !barra) return undefined;
    zona.scrollTop = 0; // cada vista empieza arriba
    const alDesplazar = () => {
      const y = zona.scrollTop;
      barra.dataset.elevada = y > 6 ? "1" : "0";
      barra.dataset.oculto = enPortada && y < 150 ? "1" : "0";
    };
    alDesplazar();
    zona.addEventListener("scroll", alDesplazar, { passive: true });
    return () => zona.removeEventListener("scroll", alDesplazar);
  }, [claveVista, enPortada, esScrollInterno]);

  if (sinSesion) return <Bienvenida />;

  // Sin perfil no hay panel que enseñar: se dice qué pasó y se ofrece
  // reintentar, en vez de mandar a la portada como antes.
  if (!user && errorMe) {
    return (
      <div className="pnl min-h-dvh flex items-center justify-center p-4">
        <div className="pnl-sesion-caja pnl-entra" style={{ borderRadius: 26, animation: "none" }}>
          <div className="pnl-sesion-icono"><Icono nombre="escudo" size={26} /></div>
          <h2>No hemos podido abrir tu expediente</h2>
          <p>{errorMe}</p>
          <div className="pnl-sesion-botones">
            <button type="button" className="pnl-btn-cta" onClick={() => cargarMe()}>Reintentar</button>
            <a href="/" className="pnl-btn">Ir a la web</a>
          </div>
        </div>
        {finSesion && <AvisoSesion motivo={finSesion} />}
      </div>
    );
  }

  // `h-dvh` y no `h-screen`: en Safari de iPhone 100vh cuenta la barra del
  // navegador y el borde de abajo quedaba tapado. El backoffice ya lo usa.
  return (
    <div className="pnl h-dvh overflow-hidden flex relative">
      {/* El velo se funde en vez de aparecer de golpe: siempre está, y se
          enciende con el menú. */}
      <div className="pnl-velo" data-abierto={sidebarOpen ? "1" : "0"} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <PanelSidebar
        user={user}
        activeTab={tab}
        onChangeTab={handleChangeTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        accesos={accesos}
        pendientes={nPendientes}
        servicios={lista}
        idServicioActivo={ruta.idServicio}
        onAbrirServicio={(id) => { navigate(rutaDe({ idServicio: id })); setSidebarOpen(false); }}
        onTour={verTour}
        guias={pestanasGuia}
        conPagos={conPagos}
      />

      {/* En el móvil manda el scroll de la página: un expediente dentro de una
          caja con scroll propio se siente atrapado y cuesta bajar. La columna
          con scroll interno se queda solo en pantalla grande, donde la barra
          de pasos tiene que permanecer a la vista. */}
      <main className={`flex-1 min-w-0 flex flex-col overflow-y-auto ${esScrollInterno ? "lg:min-h-0 lg:overflow-hidden" : ""}`}>
        {/* Barra superior */}
        <div ref={barraRef} className="pnl-top sticky top-0 z-10 shrink-0">
          {/* El ☰ solo hace falta donde no hay barra de pestañas. */}
          <button
            className={`pnl-burger${conTabbar ? " !hidden" : ""}`}
            data-tour={conTabbar ? undefined : "menu"}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            {nPendientes > 0 && <span className="pnl-burger-punto" aria-hidden="true">{nPendientes}</span>}
          </button>

          <div className="min-w-0 pnl-top-titulo">
            <p className="pnl-top-eyebrow">
              <span className="punto" />
              Expediente Digital<span className="hidden sm:inline">&nbsp;Inspira</span>
            </p>
            <h1>{tituloBarra}</h1>
          </div>

          {/* Tocar la foto abre el perfil, como en cualquier app. */}
          {user && (
            <div className="pnl-top-user ml-auto">
              <span className="pnl-top-nombre hidden sm:block" title={nombre}>{datosUsuario(user).corto}</span>
              <button type="button" className="pnl-top-avatar" onClick={() => handleChangeTab("perfil")} aria-label="Abrir mi perfil">
                <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={34} />
              </button>
            </div>
          )}
        </div>

        {/* Contenido. La clave cambia al cambiar de vista —pestaña o expediente—
            y cada una entra con su transición. No cambia al cambiar de sección
            dentro de un expediente: eso lo anima el propio expediente, sin
            remontarse ni volver a pedir nada. */}
        <div
          ref={zonaRef}
          className={`relative flex-1 min-h-0 flex flex-col ${esScrollInterno ? "" : "overflow-auto overscroll-contain"}`}
          aria-busy={recargando || undefined}
        >
        {!esScrollInterno && (
          <span className="pnl-ptr" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
            </svg>
          </span>
        )}
        <div key={claveVista} className={`pnl-entra pnl-entra-llena pnl-vista pnl-ptr-contenido${conTabbar ? " pnl-con-tabbar" : ""}`}>
          {avisarPerfil && !enPortada && (
            <div className="px-4 sm:px-6 pt-4 shrink-0">
              <AvisoPerfil faltan={faltanDatos} imprescindible={conCompleto} onIr={() => handleChangeTab("perfil")} />
            </div>
          )}

          {/* Servicios: scroll interno */}
          {esServicios && (
            <div className="flex-1 min-h-0 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 py-5">
              <MisServicios
                ruta={ruta}
                perfil={user}
                conAcademico={conAcademico}
                conCompleto={conCompleto}
                servicios={lista}
                loading={cargandoServicios}
                error={errorServicios}
                onRecargar={cargarServicios}
                onIrAGuia={handleChangeTab}
                avisoAppBloqueado={tour || tourPendiente || mostrarWizard}
                faltanPerfil={faltanPerfil}
                pagos={planesPago}
              />
            </div>
          )}

          {/* Perfil: scroll externo */}
          {tab === "perfil" && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5">
              <PerfilCliente user={user} conAcademico={conAcademico} onUserUpdated={(nuevo) => setUser(nuevo)} />
              <SeguridadSesion />
            </div>
          )}

          {/* Mi ruta: las etapas entre servicios */}
          {tab === "ruta" && <MiRuta servicios={lista} />}

          {/* Mis pagos: sus planes, cuotas y cómo pagar. */}
          {tab === "pagos" && (
            <CercoErrores donde="panel-pagos" clave="pagos" titulo="Tus pagos no se pudieron mostrar">
              <Suspense fallback={<LoadingPage />}>
                <MisPagos datos={pagos} onRecargar={cargarPagos} />
              </Suspense>
            </CercoErrores>
          )}

          {/* Mis guías: una sola entrada y una pestaña por guía. Cada pestaña
              conserva su URL (/panel/portal, /panel/guia, /panel/apostilla…). */}
          {CLAVES_GUIAS.includes(tab) && accesos.has(tab) && (tab !== "portal" || guiasPortal.length > 0) && (
            <MisGuias tab={tab} pestanas={pestanasGuia} guiasPortal={guiasPortal} onCambiar={handleChangeTab} />
          )}

          {/* Becas España */}
          {tab === "becas" && accesos.has("becas") && (
            <Suspense fallback={<LoadingPage />}>
              <BecasEspana />
            </Suspense>
          )}
        </div>
        </div>
      </main>

      {conTabbar && user && (
        <BarraPestanas
          tab={tab}
          pendientes={nPendientes}
          conPagos={conPagos}
          conRuta={lista.length > 0}
          menuAbierto={sidebarOpen}
          onIr={handleChangeTab}
          onMas={() => setSidebarOpen((v) => !v)}
        />
      )}

      {/* La app instalada se queda abierta días: si hay versión nueva, se
          recarga sola al volver o avisa si se está usando. */}
      <AvisoVersionNueva producto="Inspira" />

      {tour && <Tour pasos={PASOS_INICIO} onFin={terminarTour} />}

      {mostrarWizard && !finSesion && (
        <WizardPerfilCliente
          user={user}
          conAcademico={conAcademico}
          onComplete={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {finSesion && <AvisoSesion motivo={finSesion} />}
    </div>
  );
}
