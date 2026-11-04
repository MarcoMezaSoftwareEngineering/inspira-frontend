// src/pages/panel/PanelCliente.jsx
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { lazyConRecarga } from "../../lib/cargaDiferida";
import "../../styles/panel.css";
// La capa de app (movimiento, pestañas, saludo). Después de panel.css: la afina.
import "../../styles/panel-app.css";
// Hojas de las piezas nuevas del 17/09 (avisos, novedades y plazos, documentos,
// perfil y pagos). Se importan aquí y no en cada componente: varios van en
// trozos perezosos y una hoja importada desde ahí puede llegar tarde.
import "../../styles/panel-avisos.css";
import "../../styles/panel-novedades.css";
import "../../styles/panel-documentos.css";
import "../../styles/panel-perfil-pagos.css";
import "../../styles/pasos-core.css";
// pasos.css define las clases ex-* de las tarjetas de documentos y las
// secciones (ChecklistDocumentos, SeccionPanel), que usan también el visado y
// la estancia. Antes solo lo importaban RutaPasos y TarjetaMaster, del máster:
// quien solo tenía visado y entraba directo veía los documentos sin estilos.
import "../../styles/pasos.css";
// Centro de avisos, línea de tiempo, instalar la app, doctorado y encuesta
// de cierre (18/09/2026).
import "../../styles/panel-centro.css";
import "../../styles/utilidades-panel.css";
// Hojas por bloque (25/10/2026): pisan a las de arriba con .pnl delante; cada
// bloque solo escribe en la suya.
import "../../styles/panel/base.css";
import "../../styles/panel/cascara.css";
import "../../styles/panel/inicio.css";
import "../../styles/panel/expediente.css";
import "../../styles/panel/tramites.css";
import "../../styles/panel/cuenta.css";
// Las cinco mejoras aprobadas por Carina el 02/11/2026 (B5): va la última.
import "../../styles/panel/mejoras.css";
// Lo que comparte con Inspira Core: traduce sus clases a los tokens del panel.
import "../../styles/panel/compartidos.css";
import { apiGET, apiPOST } from "../../services/api";
import PanelSidebar from "./components/PanelSidebar";
import Avatar from "../../components/common/Avatar";
import Icono from "../../components/common/Icono";
import { datosUsuario } from "../../components/common/usuario";
import MisServicios from "./components/MisServicios";
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
import AvisosMovil from "./components/AvisosMovil";
import { desactivarAvisos } from "../../services/push";
import { alTerminarSesion, borrarSesionLocal, caducado, leerToken, vigilarSesion } from "../../services/sesion";
import { useTirarParaRecargar } from "./hooks/useMovimiento";
import { CabeceraExpedienteCtx } from "./cabeceraExpediente";
import { recorta } from "./pendientes";
import CentroAvisos from "./components/CentroAvisos";
import InstalarAppModal from "./components/InstalarAppModal";
import { ServiciosPanelCtx } from "./serviciosCtx";
import { olvidarNovedades } from "./novedades";
import { registrarOrigen, registrarReferido } from "./herramientas/referido";

// Las guías (GuiaMaster, GuiaApostilla…) las descarga MisGuias al abrirlas.
const BecasEspana   = lazyConRecarga(() => import("./BecasEspana"));
// El perfil y el asistente de perfil (37 KB) solo se pintan al abrir «Mi
// perfil» o cuando faltan datos: ya no viajan con la portada del panel
// (09/10/2026).
const PerfilCliente = lazyConRecarga(() => import("./components/PerfilCliente"));
// La app gratuita: herramientas que guardan en su cuenta (03/11/2026).
const AppGratis     = lazyConRecarga(() => import("./herramientas/AppGratis"));
// «Mis pagos» se descarga al abrirlo; sus estilos van en panel.css (ex-pg-*).
const MisPagos      = lazyConRecarga(() => import("./components/MisPagos"));
const MisAsesorias  = lazyConRecarga(() => import("./components/MisAsesorias"));

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
    texto: "Desde aquí vuelves a Inicio y abres tus servicios, tus pagos o tu ruta, tu perfil y tus guías. Si quieres ver este recorrido otra vez, está en «¿Cómo funciona?» (en el teléfono, dentro de «Más»).",
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
  // «Instalar la app», desde el menú: los pasos del sistema que toque.
  const [instalarAbierto, setInstalarAbierto] = useState(false);
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
  // Su historial de asesorías (GET /cliente/asesorias). La pestaña solo existe si tiene alguna.
  const [asesorias, setAsesorias] = useState(null);
  const conAsesorias = (asesorias?.asesorias || []).length > 0;

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
  // Al entrar no se pide ningún formulario: ni asistente ni aviso general. Cada
  // servicio pide sus propios datos dentro de su expediente (MisServicios
  // calcula lo que falta para ese servicio) y la portada lo lista en «Hoy».
  const inicioGratis = sinServicios && tab === "inicio" && !ruta.idServicio;

  // Cuántas cosas esperan: sale en el menú junto a «Inicio» y como punto sobre
  // el botón del menú, para saberlo sin abrir nada.
  const listaPendientes = useMemo(
    () => (user && cargado ? pendientesDe(lista, user, planesPago) : []),
    [user, cargado, lista, planesPago],
  );
  const nPendientes = listaPendientes.length;
  const primerPendiente = listaPendientes[0]?.clave || null;

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
  // Nombre y avance que publica el expediente abierto para la barra de arriba.
  const [cabExp, setCabExp] = useState(null);
  // Si la sesión termina con el panel abierto, este dispositivo deja de
  // recibir avisos: puede ser un equipo compartido.
  useEffect(() => {
    if (finSesion && finSesion !== "otra-cuenta") desactivarAvisos().catch(() => {});
  }, [finSesion]);
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
    // Los servicios y los pagos no dependen de lo que conteste /cliente/me
    // (cada petición lleva su token): se piden a la vez y no en cascada
    // detrás de él (09/10/2026). Si la sesión terminó, el primer 401 pinta
    // AvisoSesion y lo demás queda debajo.
    if (!silencioso) {
      cargarServicios();
      cargarPagos();
      cargarAsesorias();
    }
    try {
      const r = await apiGET("/cliente/me");
      // Sin `ok` es que la sesión terminó: ya lo pinta AvisoSesion.
      if (r.ok === undefined) return;
      if (!r.ok) {
        if (!silencioso) setErrorMe(r.msg || r.message || "No hemos podido cargar tu expediente.");
        return;
      }
      setUser(r.cliente || r.user || r);
      if (!silencioso) { registrarOrigen(); registrarReferido(); }
    } catch {
      if (!silencioso) setErrorMe("No hay conexión. Comprueba tu internet y vuelve a intentarlo.");
    }
  }

  // Tirar para recargar: lo mismo que entrar, sin esqueletos ni saltos.
  const recargarTodo = useCallback(
    () => {
      olvidarNovedades(); // que la campana y las novedades pidan lo último
      return Promise.all([cargarMe({ silencioso: true }), cargarServicios({ silencioso: true }), cargarPagos(), cargarAsesorias()]);
    },
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

  async function cargarAsesorias() {
    try {
      const r = await apiGET("/cliente/asesorias");
      setAsesorias(r?.ok ? r : { asesorias: [] });
    } catch {
      setAsesorias((antes) => antes || { asesorias: [] });
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

  // «Mis asesorías» sin ninguna tampoco es una página.
  useEffect(() => {
    if (tab === "asesorias" && asesorias !== null && !conAsesorias) navigate("/panel", { replace: true });
  }, [tab, asesorias, conAsesorias]);

  function handleChangeTab(newTab) {
    navigate(rutaDe({ tab: newTab }));
    setSidebarOpen(false);
  }

  // Inicio y la lista de servicios comparten el marco: son las dos vistas
  // desde las que se abre un expediente.
  // Sin nada contratado, su Inicio es la app gratuita.
  const esServicios = (tab === "servicios" || tab === "inicio") && !inicioGratis;
  // Solo un expediente abierto gestiona su propio scroll (sus secciones llenan
  // la altura). Inicio y la lista se desplazan dentro de <main>, con la barra
  // de arriba fija: si no, en el móvil el botón del menú se iba con el scroll.
  const esScrollInterno = esServicios && Boolean(ruta.idServicio);
  const claveVista = ruta.idServicio ? `expediente-${ruta.idServicio}` : tab;

  const tourPendiente = user !== null && cargado && lista.length > 0
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
    inicio: inicioGratis ? "App Inspira" : "Mi expediente", herramientas: "Herramientas gratis", servicios: "Mis servicios", ruta: "Mi ruta", pagos: "Mis pagos", asesorias: "Mis asesorías", perfil: "Mi perfil", becas: "Becas España",
    ...Object.fromEntries(CLAVES_GUIAS.map((clave) => [clave, "Mis guías"])),
  };

  const { nombre, iniciales, foto } = datosUsuario(user);

  // En el teléfono se navega con la barra de abajo; dentro de un expediente
  // no, que allí mandan sus secciones y sus botones de guardar.
  const conTabbar = !ruta.idServicio;
  // Dentro de un expediente la barra dice cuál es, con su avance y la flecha
  // de volver (ver cabeceraExpediente.js).
  const servicioAbierto = ruta.idServicio ? lista.find((s) => Number(s.id_solicitud) === ruta.idServicio) : null;
  const tituloBarra = ruta.idServicio
    ? recorta(cabExp?.titulo || servicioAbierto?.titulo || "Tu expediente", 44)
    : titles[tab] || "Mi panel";
  const eyebrowBarra = ruta.idServicio ? (cabExp?.eyebrow || "Tu expediente") : null;
  const enPortada = tab === "inicio" && !ruta.idServicio;
  // La campana de avisos, en cuanto tiene algún servicio.
  const conCampana = Boolean(user) && lista.length > 0;

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
        conAsesorias={conAsesorias}
        onInstalarApp={() => { setSidebarOpen(false); setInstalarAbierto(true); }}
      />

      {/* En el móvil manda el scroll de la página: un expediente dentro de una
          caja con scroll propio se siente atrapado y cuesta bajar. La columna
          con scroll interno se queda solo en pantalla grande, donde la barra
          de pasos tiene que permanecer a la vista. */}
      <ServiciosPanelCtx.Provider value={lista}>
      <main className={`flex-1 min-w-0 flex flex-col overflow-y-auto ${esScrollInterno ? "lg:min-h-0 lg:overflow-hidden" : ""}`}>
        {/* Barra superior */}
        <div ref={barraRef} className="pnl-top sticky top-0 z-10 shrink-0" data-exp={ruta.idServicio ? "1" : undefined}>
          {/* Dentro de un expediente, la flecha de volver. Fuera no hace falta
              botón: en el teléfono navega la barra de pestañas y en pantalla
              grande está el menú lateral. */}
          {ruta.idServicio && (
            <button className="pnl-atras pnl-btn-icono" onClick={() => navigate("/panel")} aria-label="Volver a Inicio">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <div className="min-w-0 pnl-top-titulo">
            <p className="pnl-top-eyebrow">
              <span className="punto" />
              {eyebrowBarra || (sinServicios ? "App Inspira · gratis" : <>Expediente Digital<span className="hidden sm:inline">&nbsp;Inspira</span></>)}
            </p>
            <h1 title={ruta.idServicio ? (cabExp?.titulo || servicioAbierto?.titulo || "") : undefined}>{tituloBarra}</h1>
          </div>

          {/* Lo de la derecha va junto, empujado por un solo margen
              (cascara.css): ya no depende de ml-auto condicionales. */}
          <div className="pnl-top-derecha">
          {ruta.idServicio && cabExp?.pct != null && (
            <span className="pnl-top-pct" aria-label={`Avance del expediente: ${cabExp.pct} %`}>{cabExp.pct}%</span>
          )}

          {/* El menú, también dentro de un expediente (en el teléfono no hay
              barra de pestañas ahí), con lo pendiente encima. Se oculta desde
              768 px en cascara.css: md:hidden perdía contra su display. */}
          {ruta.idServicio && (
            <button className="pnl-top-menu pnl-btn-icono" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              {nPendientes > 0 && <span className="pnl-burger-punto" aria-hidden="true">{nPendientes}</span>}
            </button>
          )}

          {/* La campana: lo nuevo en sus expedientes, plazos y cuotas desde la
              última visita. */}
          {conCampana && (
            <div>
              <CentroAvisos servicios={lista} pagos={planesPago} />
            </div>
          )}

          {/* Tocar la foto abre el perfil, como en cualquier app. */}
          {user && (
            <div className={`pnl-top-user${ruta.idServicio ? " max-md:!hidden" : ""}`}>
              <span className="pnl-top-nombre hidden sm:block" title={nombre}>{datosUsuario(user).corto}</span>
              <button type="button" className="pnl-top-avatar" onClick={() => handleChangeTab("perfil")} aria-label="Abrir mi perfil">
                <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={36} />
              </button>
            </div>
          )}
          </div>

          {/* Avance del expediente abierto: una línea bajo la barra. */}
          {ruta.idServicio && cabExp?.pct != null && (
            <span className="pnl-top-progreso" aria-hidden="true" style={{ "--p": cabExp.pct }} />
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

          {/* Servicios: scroll interno */}
          {esServicios && (
            <div className="flex-1 min-h-0 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 py-5">
              <CabeceraExpedienteCtx.Provider value={setCabExp}>
              <MisServicios
                ruta={ruta}
                perfil={user}
                onPerfilCambiado={() => cargarMe({ silencioso: true })}
                conAcademico={conAcademico}
                conCompleto={conCompleto}
                servicios={lista}
                loading={cargandoServicios}
                error={errorServicios}
                onRecargar={cargarServicios}
                onIrAGuia={handleChangeTab}
                avisoAppBloqueado={tour || tourPendiente}
                pagos={planesPago}
              />
              </CabeceraExpedienteCtx.Provider>
            </div>
          )}

          {/* App gratuita: su Inicio si no tiene nada contratado, y
              «Herramientas» para todos. */}
          {(inicioGratis || tab === "herramientas") && (
            <CercoErrores donde="panel-herramientas" clave="herramientas" titulo="Tus herramientas no se pudieron mostrar">
              <Suspense fallback={<LoadingPage />}>
                <AppGratis
                  herramienta={tab === "herramientas" ? ruta.herramienta : null}
                  nombre={datosUsuario(user).corto}
                  esCliente={!sinServicios}
                />
              </Suspense>
            </CercoErrores>
          )}

          {/* Perfil: scroll externo */}
          {tab === "perfil" && (
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5">
              <Suspense fallback={<LoadingPage />}>
                <PerfilCliente user={user} conAcademico={conAcademico} onUserUpdated={(nuevo) => setUser(nuevo)} />
              </Suspense>
              <AvisosMovil variante="perfil" />
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

          {/* Mis asesorías: el historial de sus citas, formulario previo e informes. */}
          {tab === "asesorias" && (
            <CercoErrores donde="panel-asesorias" clave="asesorias" titulo="Tus asesorías no se pudieron mostrar">
              <Suspense fallback={<LoadingPage />}>
                <MisAsesorias datos={asesorias} />
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
      </ServiciosPanelCtx.Provider>

      {conTabbar && user && (
        <BarraPestanas
          tab={ruta.herramienta ? `herramientas/${ruta.herramienta}` : tab}
          gratis={sinServicios}
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

      {instalarAbierto && <InstalarAppModal onCerrar={() => setInstalarAbierto(false)} />}

      {finSesion && <AvisoSesion motivo={finSesion} />}
    </div>
  );
}
