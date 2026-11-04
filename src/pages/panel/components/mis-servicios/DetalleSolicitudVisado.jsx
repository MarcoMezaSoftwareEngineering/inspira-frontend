// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
import { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import SeccionPanel from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import VisaDatosCliente from "./sections/VisaDatosCliente";
import VisaMediosEconomicos from "./sections/VisaMediosEconomicos";
import VisaDeclaracionCliente from "./sections/VisaDeclaracionCliente";
import { estadoVisado } from "../../../../lib/visaFlujoInterno";
import { EsqueletoExpediente } from "../Esqueleto";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import SelectorSeccionMovil from "./SelectorSeccionMovil";
import QueMeFalta from "../QueMeFalta";
import { queMeFaltaVisado } from "../../queMeFalta";
import { navigate } from "../../../../services/navigate";
import { rutaDe } from "../../ruta";
import { comprobarRespuesta } from "../../../../services/sesion";
import { usePublicarCabecera } from "../../cabeceraExpediente";
import NovedadesExpediente from "../NovedadesExpediente";
import ErrorCarga from "./ErrorCarga";
import { useSondeo } from "../../../../hooks/useSondeo";
import { TituloPaso, ExpedienteCabecera, tonoDeEstado } from "../../../../components/common/RutaPasos";
import IconoPaso from "../../../../components/common/IconoPaso";
import Icono from "../../../../components/common/Icono";
import { inicialesDe, IconoLinea } from "./utils";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

// El estado de cada sección, en el tono del panel (el mismo mapa que el
// selector del teléfono).
const TONO_PUNTO = {
  completado: "ok",
  pendiente:  "aviso",
  observado:  "alto",
  cargando:   "info",
};

// El icono de cada sección (nombres de IconoPaso), como los pasos del máster.
const ICONO_SECCION = {
  datos: "user", sesion: "calendar", economicos: "coins", docs: "folder",
  entregables: "fileText", estado: "flag", mensajes: "message",
};

// ── NavItem — botón de la columna de secciones (pantalla grande) ─────────────
function NavItem({ num, icono, titulo, subtitulo, estado, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="pnl-nav-item"
    >
      <span className="pnl-nav-item-ico">
        {icono ? <IconoPaso nombre={icono} /> : num}
      </span>
      <span className="pnl-nav-item-txt">
        <b>{titulo}</b>
        {subtitulo && <small>{subtitulo}</small>}
      </span>
      {estado && (
        <span className="pnl-punto" data-tono={TONO_PUNTO[estado] || "neutro"} aria-hidden="true" />
      )}
    </button>
  );
}

// ── Helpers de contenido ──────────────────────────────────────────────────────
// Los tonos de siempre (info, ok, warn, stop) en el diccionario del panel. El
// icono: el que se le pase (Icono o IconoPaso) o, si no, el del tono.
const AVISO_TONO = { info: "info", ok: "ok", warn: "aviso", stop: "alto" };
const AVISO_ICONO = { info: "info", ok: "checkCircle", aviso: "alert", alto: "alert" };
function Aviso({ tono = "info", icono, children }) {
  const t = AVISO_TONO[tono] || "info";
  return (
    <div className="pnl-aviso pnl-aviso-bloque" data-tono={t}>
      <span className="pnl-aviso-icono">{icono || <IconoLinea nombre={AVISO_ICONO[t]} />}</span>
      <div className="pnl-aviso-texto">{children}</div>
    </div>
  );
}

function Tarjeta({ titulo, children, tono }) {
  return (
    <div className="pnl-tarjeta pnl-tarjeta-visado" data-anidada="1" data-tono={tono}>
      {titulo && (
        <p className="pnl-eyebrow"><span className="punto" />{titulo}</p>
      )}
      {children}
    </div>
  );
}

/* Tarjeta de cita o sesión. Sin fecha muestra el hueco, no un vacío mudo. */
function SesionView({ sesion, etiqueta, vacio, pie }) {
  const agendada = sesion && sesion.estado !== "PENDIENTE";
  const completada = sesion?.estado === "COMPLETADA" || sesion?.estado === "REALIZADA";
  return (
    <div
      className={`pnl-cita${agendada || completada ? "" : " pnl-vacio-suave"}`}
      data-estado={completada ? "completada" : agendada ? "agendada" : "vacia"}
    >
      <p className="pnl-cita-etiqueta">{etiqueta}</p>
      <p className="pnl-cita-fecha">
        {agendada && sesion.fecha ? sesion.fecha : "Por agendar"}
        {agendada && sesion.hora ? ` · ${sesion.hora}` : ""}
      </p>
      <p className="pnl-cita-texto">
        {agendada ? (sesion.plataforma || "Te confirmamos los detalles aquí") : vacio}
      </p>
      {pie && <p className="pnl-cita-texto">{pie}</p>}
      {sesion?.notas && <p className="pnl-cita-texto">{sesion.notas}</p>}
      {sesion?.enlace_meet && (
        <a href={sesion.enlace_meet} target="_blank" rel="noreferrer" className="pnl-btn-primario pnl-cita-boton">
          <Icono nombre="video" size={16} />
          Unirme a la sesión
        </a>
      )}
    </div>
  );
}

/* Documento que Inspira ya dejó listo. La descarga va con el token del panel,
   así que no basta un <a href>: se pide, se convierte en blob y se guarda. */
function DescargaDoc({ slot, doc, idSolicitud }) {
  const [bajando, setBajando] = useState(false);
  const [error, setError] = useState("");

  async function descargar() {
    setBajando(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${API_URL}/solicitudes/${idSolicitud}/visa-documentos/${slot}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await comprobarRespuesta(r);
      if (!r.ok) throw new Error("No se pudo descargar");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nombre || "documento";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message || "Error al descargar");
    } finally {
      setBajando(false);
    }
  }

  return (
    <div className="pnl-descarga">
      <span className="pnl-ico" data-talla="l"><IconoPaso nombre="fileText" /></span>
      <div className="min-w-0 flex-1">
        <p className="pnl-descarga-nombre">{doc.etiqueta || doc.nombre}</p>
        {doc.etiqueta && doc.nombre && (
          <p className="pnl-descarga-archivo">{doc.nombre}</p>
        )}
        {error && <p className="pnl-campo-ayuda">{error}</p>}
      </div>
      <button
        type="button"
        onClick={descargar}
        disabled={bajando}
        className="pnl-btn"
        data-talla="s"
      >
        {bajando ? "…" : "Descargar"}
      </button>
    </div>
  );
}

// El estado del visado (lib/visaFlujoInterno, que no se toca) en el tono del
// panel: sin morado.
const TONO_VISADO = { sky: "info", emerald: "ok", red: "alto", amber: "aviso", violet: "info", neutral: "neutro" };
const ICONO_TONO = { info: "info", ok: "checkCircle", alto: "alert", aviso: "alert", neutro: "info" };

// ── Componente principal ──────────────────────────────────────────────────────
export default function DetalleSolicitudVisado({ solicitudBase, onVolver, seccion, onSeccion, faltanPerfil = 0, camposFaltan = [], onPerfilCambiado }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [visaExp, setVisaExp] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [visaDocs, setVisaDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // La sección viene en la URL y se cambia navegando: así «atrás» vuelve a
  // la anterior y recargar conserva el sitio. El nombre `setActiveSection` se
  // conserva para no tocar cada botón que lo llama.
  const setActiveSection = onSeccion;

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  // Auto-refresco silencioso (sin parpadeo), con useSondeo (09/10/2026).
  // Antes: las cinco peticiones cada 25 s, también con la pestaña oculta, y
  // dos veces al volver (foco + visibilidad). Ahora cada 60 s a la vista,
  // nada oculta y una sola vez al volver. 25 s era el único sondeo del panel
  // —máster y estancia no tienen ninguno— y lo que se refresca aquí lo cambia
  // una persona del equipo a mano: un minuto basta, y al volver a la pestaña
  // se ve al momento. La primera carga la hace el efecto de arriba.
  // Si la vuelta falla, el sondeo espacia las siguientes (cargarTodo devuelve false).
  useSondeo(async () => {
    if ((await cargarTodo({ silent: true })) === false) throw new Error("Sin respuesta del expediente");
  }, 60000, { clave: idSolicitud, primera: null });

  async function cargarTodo({ silent = false } = {}) {
    if (!silent) { setLoading(true); setError(""); }
    try {
      // Las cinco a la vez: iban en fila india y ninguna dependía de la
      // anterior. `visa-documentos` es lo que Inspira ya le dejó listo —acta
      // de la sesión, declaración jurada y formulario—; el cliente no ve los
      // generadores, sólo esto.
      const [rDetalle, rChecklist, rExp, rSes, rDocs] = await Promise.all([
        apiGET(`/solicitudes/${idSolicitud}`),
        apiGET(`/checklist/${idSolicitud}`),
        apiGET(`/solicitudes/${idSolicitud}/visa-expediente`),
        apiGET(`/solicitudes/${idSolicitud}/sesiones`),
        apiGET(`/solicitudes/${idSolicitud}/visa-documentos`),
      ]);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);
      // Sin la solicitud no hay expediente que pintar: se dice, con
      // «Reintentar» (antes quedaba en blanco). El sondeo silencioso no avisa.
      else if (!silent) setError("Error al cargar información.");
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);
      if (rExp.ok) setVisaExp(rExp.expediente || null);
      if (rSes.ok) setSesiones(rSes.sesiones || []);
      if (rDocs.ok) setVisaDocs(rDocs.documentos || {});
      return Boolean(rDetalle.ok);
    } catch (e) {
      console.error(e);
      if (!silent) setError("Error al cargar información.");
      return false;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const cli = detalle?.cliente || {};
  const extra = cli.datos_extra || {};

  // El Bloque 1 lo completa el cliente sobre el expediente. Se considera listo
  // cuando estan los datos que el consulado exige si o si en el impreso.
  const datosCompletos = !!(
    visaExp?.num_pasaporte &&
    visaExp?.venc_pasaporte &&
    visaExp?.fecha_nacimiento &&
    visaExp?.domicilio &&
    visaExp?.centro_direccion
  );

  const total = checklist.length;
  const docsListas = checklist.filter((it) => ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())).length;

  const docsEstado = useMemo(() => {
    if (!checklist.length) return "pendiente";
    const hayObs = checklist.some((it) => ["observado", "rechazado"].includes((it.estado_item || "").toLowerCase()));
    if (hayObs) return "observado";
    return docsListas === checklist.length ? "completado" : "pendiente";
  }, [checklist, docsListas]);

  // Los documentos NO se bloquean nunca. Quien decide su via de medios
  // economicos es el propio cliente, y no tiene sentido que deba esperar a que
  // un asesor confirme nada para empezar a subir lo que ya tiene a mano.
  // La lista de solvencia se afina sola cuando elige, pero el resto del
  // checklist esta disponible desde el primer dia.
  const docsBloqueados = false;

  const estadoBloque = (key) => {
    switch (key) {
      case "datos": return datosCompletos ? "completado" : "pendiente";
      case "sesion": return sesionDiag?.estado === "COMPLETADA" ? "completado" : "pendiente";
      case "economicos": return viaElegida && djCompleta ? "completado" : "pendiente";
      case "docs": return checklist.length ? docsEstado : "pendiente";
      case "entregables": return (visaDocs?.dj || visaDocs?.formulario) ? "completado" : "pendiente";
      case "estado": return visaExp?.visado_resultado === "FAVORABLE" ? "completado" : "pendiente";
      default: return "pendiente";
    }
  };

  // La DJ se da por aportada cuando el declarante tiene su situacion laboral
  // descrita: es el minimo que el asesor necesita para redactar el documento.
  const djCompleta = (() => {
    const perfiles = visaExp?.dj_datos?.perfiles;
    if (!Array.isArray(perfiles) || !perfiles.length) return false;
    return perfiles.every((p) => (p.trabajaActual ? p.empresa || p.cargo : p.ultEmpEmpresa));
  })();

  const sesionDiag = sesiones.find((x) => x.tipo === "DIAGNOSTICO") || null;
  const viaElegida = visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE";
  const SOLV_SUB = { PROPIOS: "Medios propios", AVAL: "Con avalista", MIXTO: "Mixto" };
  const FORM_SUB = {
    EN_PREPARACION: "En preparación", ENVIADO: "Listo para tu revisión", FIRMADO: "Firmado",
  };

  // Los 6 bloques del expediente, en el orden que pidio el usuario.
  //
  // La cita de BLS va segunda a proposito: su fecha marca el calendario de
  // todo lo demas. Y medios y datos economicos van ANTES de documentos porque
  // lo que se marca ahi es justo lo que decide QUE documentos se piden.
  // Los 6 bloques del cliente. Se corresponden uno a uno con los del panel del
  // asesor, salvo lo que es puramente interno: el checklist de gestión, el
  // estado del proceso y las notas no se le muestran. Y de la declaración
  // jurada y el formulario ve el documento terminado, nunca el generador.
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  const navSections = [
    { id: "datos",       num: 1, titulo: "Mis datos",              subtitulo: datosCompletos ? "Datos completos" : "Completa tus datos" },
    { id: "sesion",      num: 2, titulo: "Mi sesión de diagnóstico", subtitulo: sesionDiag?.fecha || "Por agendar" },
    { id: "economicos",  num: 3, titulo: "Mis medios económicos",   subtitulo: SOLV_SUB[visaExp?.tipo_solvencia] || "Elige tu vía y calcula" },
    { id: "docs",        num: 4, titulo: "Mis documentos",          subtitulo: total ? `${docsListas} de ${total} listos` : "Sube tus documentos" },
    { id: "entregables", num: 5, titulo: "Preparado por Inspira",   subtitulo: (visaDocs?.dj || visaDocs?.formulario) ? "Ya tienes documentos" : "Lo preparamos nosotros" },
    { id: "estado",      num: 6, titulo: "Estado de mi visa",       subtitulo: estadoVisado(visaExp || {}).texto },
    { id: "mensajes",    num: 7, titulo: "Mensajes con tu asesor",  subtitulo: sinLeer > 0 ? `${sinLeer} sin leer` : "Con tu asesor, por escrito" },
  ].map((x) => ({ ...x, estado: x.id === "mensajes" ? (sinLeer > 0 ? "pendiente" : "completado") : estadoBloque(x.id) }));

  // Una sección que no existe para este expediente —un enlace viejo, un
  // tipo de servicio distinto— cae en la primera en vez de en una pantalla vacía.
  const activeSection = navSections.some((x) => x.id === seccion) ? seccion : navSections[0]?.id;

  const falta = queMeFaltaVisado({
    checklist, datosCompletos, viaElegida, djCompleta, resumen: solicitudBase?.resumen, faltanPerfil, camposFaltan,
    ir: { seccion: (s) => setActiveSection(s), perfil: () => navigate(rutaDe({ tab: "perfil" })) },
  });

  const bloquesDone = navSections.filter((s) => s.estado === "completado").length;
  const pct = Math.round((bloquesDone / navSections.length) * 100);

  // La barra de arriba del panel dice qué expediente es y cuánto lleva.
  usePublicarCabecera({
    eyebrow: detalle ? `Solicitud #${detalle.id_solicitud}` : null,
    // Con el nombre del titular, como decía la tarjeta que en el teléfono ya
    // no sale: quien entra invitado tiene que saber de quién es.
    titulo: solicitudBase?.invitado && cli.nombre
      ? `De ${cli.nombre}`
      : `${detalle?.tipo?.nombre || "Visado de estudios"}${cli.nombre ? ` · ${cli.nombre}` : ""}`,
    pct: detalle ? pct : null,
  });

  const FORM_LABEL = { EN_PREPARACION: "En preparación", ENVIADO: "Enviado para tu revisión", FIRMADO: "Firmado" };

  function renderBody(key) {
    switch (key) {
      case "mensajes":
        return (
          <HiloMensajes
            lado="cliente"
            idSolicitud={idSolicitud}
            aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor. Para lo que importa, mejor aquí que por WhatsApp."
            cargar={() => apiGET(`/solicitudes/${idSolicitud}/mensajes`)}
            enviar={(texto) => apiPOST(`/solicitudes/${idSolicitud}/mensajes`, { texto })}
          />
        );
      case "sesion":
        return (
          <div className="space-y-3">
            <Aviso tono="ok" icono={<Icono nombre="estrella" size={16} />}>
              Esta es la <b>única sesión obligatoria</b>. Aquí definimos tu ruta y,
              sobre todo, tu estrategia de medios económicos.
            </Aviso>

            <SesionView
              sesion={sesionDiag}
              etiqueta="Tu sesión de diagnóstico"
              vacio="Te confirmamos por WhatsApp · 30 min"
            />

            <Tarjeta titulo="Qué veremos juntos">
              <ul className="space-y-2">
                {[
                  "Definimos tu <b>ruta</b> y tu <b>estrategia de medios económicos</b>",
                  "Revisamos tu caso: ingresos propios, aval, ventas o donaciones",
                  "Aclaramos qué documentos aplican a tu situación",
                  "Resolvemos todas tus dudas del proceso",
                ].map((t) => (
                  <li key={t} className="pnl-lista-check">
                    <IconoPaso nombre="check" />
                    <span dangerouslySetInnerHTML={{ __html: t }} />
                  </li>
                ))}
              </ul>
            </Tarjeta>

          </div>
        );

      case "entregables": {
        const dj = visaDocs?.dj;
        const form = visaDocs?.formulario;
        return (
          <div className="space-y-3">
            <Aviso tono="info" icono={<IconoPaso nombre="fileText" />}>
              Tu <b>declaración jurada</b> y tu <b>formulario oficial</b> los redacta
              Inspira con los datos que cargaste. Cuando estén revisados aparecerán aquí
              para que los descargues, los imprimas y los firmes.
            </Aviso>

            {!dj && !form ? (
              <SesionView sesion={null} etiqueta="Tus documentos"
                vacio="Todavía no hay nada listo. Te avisaremos en cuanto lo esté." />
            ) : (
              <Tarjeta titulo="Listos para descargar">
                <div className="space-y-2">
                  {dj && <DescargaDoc slot="dj" doc={dj} idSolicitud={idSolicitud} />}
                  {form && <DescargaDoc slot="formulario" doc={form} idSolicitud={idSolicitud} />}
                </div>
              </Tarjeta>
            )}

            {form && (
              <Aviso tono="warn" icono={<IconoPaso nombre="fileText" />}>
                El formulario se firma <b>a mano</b>, en bolígrafo azul o negro, el día de
                tu cita. No lo firmes antes de revisarlo con tu asesor.
              </Aviso>
            )}
          </div>
        );
      }

      case "estado": {
        const ev = estadoVisado(visaExp || {});
        const req = visaExp?.requerimiento_estado;
        return (
          <div className="space-y-3">
            <div className="pnl-aviso pnl-estado-visado" data-tono={TONO_VISADO[ev.tono] || "neutro"}>
              <span className="pnl-aviso-icono"><IconoLinea nombre={ICONO_TONO[TONO_VISADO[ev.tono] || "neutro"]} /></span>
              <div className="min-w-0">
                <p className="pnl-estado-visado-rotulo">Estado de tu visado</p>
                <p className="pnl-estado-visado-texto">{ev.texto}</p>
              </div>
            </div>

            {/* Un requerimiento exige que actúe él, y con plazo: va antes que nada. */}
            {req === "SOLICITADO" && (
              <Tarjeta titulo="Te han pedido subsanar algo" tono="alto">
                <p className="pnl-visado-texto">
                  El consulado solicitó documentación o aclaraciones adicionales.
                </p>
                {visaExp?.requerimiento_detalle && (
                  <p className="pnl-visado-pide">
                    <b>Qué piden:</b> {visaExp.requerimiento_detalle}
                  </p>
                )}
                {visaExp?.requerimiento_plazo && (
                  <p className="pnl-visado-plazo">
                    <IconoLinea nombre="alert" />
                    <span>Plazo para responder: {visaExp.requerimiento_plazo}</span>
                  </p>
                )}
                <p className="pnl-visado-meta">
                  Súbelo cuanto antes en <b>Mis documentos</b>. Tu asesor te acompaña en esto.
                </p>
              </Tarjeta>
            )}

            {req === "SUBSANADO" && (
              <Aviso tono="ok">
                Ya presentamos lo que pedían. Ahora toca esperar la resolución.
              </Aviso>
            )}

            <SesionView
              sesion={visaExp?.cita_estado && visaExp.cita_estado !== "PENDIENTE" ? {
                estado: visaExp.cita_estado,
                fecha: visaExp.cita_fecha,
                hora: visaExp.cita_hora,
                plataforma: visaExp.cita_ref_bls ? `Referencia BLS: ${visaExp.cita_ref_bls}` : null,
              } : null}
              etiqueta="Cita BLS · Consulado"
              vacio="La agendamos contigo y te confirmamos aquí"
              pie="BLS International · llega 15 min antes"
            />

            {visaExp?.cita_estado === "REAGENDAR" && (
              <Aviso tono="warn" icono={<IconoLinea nombre="refresh" />}>
                Hay que <b>reagendar</b> tu cita. Tu asesor te contactará con las
                nuevas fechas disponibles.
              </Aviso>
            )}

            {visaExp?.visado_resultado === "FAVORABLE" && (
              <Tarjeta titulo="Resolución" tono="ok">
                <p className="pnl-visado-resolucion" data-tono="ok"><Icono nombre="destello" size={16} />¡Visa concedida!</p>
                {visaExp.visado_resultado_fecha && (
                  <p className="pnl-visado-meta">Resuelta el {visaExp.visado_resultado_fecha}</p>
                )}
                <p className="pnl-visado-texto">
                  Tu asesor te indicará cómo recoger el pasaporte y te orientará sobre tu
                  llegada a España (NIE, TIE y empadronamiento).
                </p>
              </Tarjeta>
            )}

            {visaExp?.visado_resultado === "DENEGADO" && (
              <Tarjeta titulo="Resolución" tono="alto">
                <p className="pnl-visado-resolucion" data-tono="alto">Resolución desfavorable</p>
                {visaExp.visado_resultado_fecha && (
                  <p className="pnl-visado-meta">Notificada el {visaExp.visado_resultado_fecha}</p>
                )}
                {visaExp.via_posterior === "APELACION" && (
                  <p className="pnl-visado-texto pnl-visado-con-icono">
                    <Icono nombre="balanza" size={16} />
                    <span>Estamos <b>presentando una apelación</b>. Tu asesor te contará los plazos.</span>
                  </p>
                )}
                {visaExp.via_posterior === "ESTANCIA_ESTUDIOS" && (
                  <p className="pnl-visado-texto">
                    Estamos reconduciendo tu caso por la vía de <b>estancia por estudios</b>.
                  </p>
                )}
                {!visaExp.via_posterior && (
                  <p className="pnl-visado-texto">
                    Tu asesor está estudiando las opciones y te contactará.
                  </p>
                )}
              </Tarjeta>
            )}

            {!visaExp?.visado_resultado && (
              <>
                <Aviso tono="ok" icono={<Icono nombre="maleta" size={16} />}>
                  Lleva: expediente original + copia, pasaporte, foto y{" "}
                  <b>efectivo para la tasa consular</b>.
                </Aviso>
                <Aviso tono="warn" icono={<Icono nombre="avion" size={16} />}>
                  <b>No compres tu vuelo</b> todavía: sólo reserva con tarifa flexible.
                </Aviso>
              </>
            )}

            {visaExp?.cierre_estado === "CERRADO" && (
              <Aviso tono="ok" icono={<Icono nombre="bandera" size={16} />}>
                Tu expediente está <b>cerrado</b>. ¡Gracias por confiar en Inspira!
              </Aviso>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  }

  const sec = navSections.find((s) => s.id === activeSection) || navSections[0];
  // Las secciones con su icono: para la columna, el selector y el título.
  const secciones = navSections.map((s) => ({ ...s, icono: ICONO_SECCION[s.id] }));
  // La cabecera del expediente, la misma del máster: iniciales, número y anillo.
  const cabecera = detalle ? (
    <ExpedienteCabecera
      iniciales={inicialesDe(cli.nombre)}
      eyebrow={`Solicitud #${detalle.id_solicitud}`}
      titulo={detalle.tipo?.nombre || "Visa de Estudios"}
      linea={cli.nombre}
      pct={pct}
    />
  ) : null;

  return (
    <div className="pnl-con-selector flex flex-col lg:h-full lg:min-h-0">

      {/* Fila superior: botón volver + encabezado compacto */}
      <div className="shrink-0 flex items-center gap-3 mb-3 max-md:mb-0 lg:mb-0">
        <button
          onClick={onVolver}
          aria-label="Volver a mis servicios"
          className="pnl-sin-volver shrink-0 inline-flex items-center gap-2 min-h-[40px] min-w-[44px] justify-center px-3 sm:px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light active:scale-95 transition-all shadow-sm group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {/* En teléfono basta la flecha: el rótulo se come 90 px de ancho. */}
          <span className="hidden sm:inline">Mis servicios</span>
        </button>


        {error && (
          <ErrorCarga className="flex-1 min-w-0" mensaje={error} onReintentar={() => cargarTodo()} />
        )}

        {/* Tableta: la cabecera arriba. En pantalla grande va en la columna. */}
        {!loading && !error && detalle && (
          <div className="pnl-solo-grande flex-1 min-w-0 lg:hidden">{cabecera}</div>
        )}
      </div>

      {loading && <EsqueletoExpediente />}

      {!loading && !error && detalle && (
        <QueMeFalta className="shrink-0 mb-3" resumen={falta.resumen} filas={falta.filas} />
      )}

      {/* Qué ha cambiado desde su última visita. */}
      {!loading && !error && detalle && (
        <div className="shrink-0 mb-3"><NovedadesExpediente idSolicitud={idSolicitud} plegable /></div>
      )}

      {/* Panel principal. En el teléfono y la tableta crece con su contenido y
          se desplaza la página; la columna con scroll propio, desde 1024. */}
      {!loading && !error && detalle && (
        <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">

          {/* Pantalla grande: la cabecera y las secciones, en su columna. */}
          <div className="pnl-nav-visado">
            {cabecera}
            <div className="pnl-nav-visado-lista">
              {secciones.map((s) => (
                <NavItem
                  key={s.id}
                  num={s.num}
                  icono={s.icono}
                  titulo={s.titulo}
                  subtitulo={s.subtitulo}
                  estado={s.estado}
                  active={activeSection === s.id}
                  onClick={() => setActiveSection(s.id)}
                />
              ))}
            </div>
          </div>

          {/* Contenido de la sección activa (llena el área). La clave por
              sección hace que cada una entre con su transición. */}
          <div key={activeSection} className="pnl-entra flex flex-col gap-3 min-w-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            {/* El paso en el que está, como en el máster. El subtítulo va en
                el chip del título, no repetido en la tarjeta. */}
            <TituloPaso
              paso={{ ...sec, icono: ICONO_SECCION[sec.id], estado: tonoDeEstado(sec.estado) }}
              total={navSections.length}
              indice={navSections.indexOf(sec) + 1}
            />
            <SeccionSiempreAbiertoCtx.Provider value={true}>
              {/* Medios y datos economicos van juntos: lo que se marca aqui es
                  lo que decide que documentos se piden en el bloque siguiente. */}
              {activeSection === "economicos" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} estado={sec.estado}>
                  <div className="space-y-4">
                    <VisaMediosEconomicos
                      idSolicitud={idSolicitud}
                      expediente={visaExp}
                      onGuardado={() => cargarTodo({ silent: true })}
                    />
                    <div className="pnl-visado-separa">
                      <VisaDeclaracionCliente
                        idSolicitud={idSolicitud}
                        expediente={visaExp}
                        onGuardado={() => cargarTodo({ silent: true })}
                      />
                    </div>
                  </div>
                </SeccionPanel>
              ) : activeSection === "datos" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} estado={sec.estado}>
                  <VisaDatosCliente
                    idSolicitud={idSolicitud}
                    expediente={visaExp}
                    cliente={cli}
                    extra={extra}
                    // Lo que cambió aquí sube a su perfil (perfilSync): el
                    // panel lo vuelve a leer para «Mi perfil».
                    onGuardado={() => { cargarTodo({ silent: true }); onPerfilCambiado?.(); }}
                  />
                </SeccionPanel>
              ) : activeSection === "docs" ? (
                <ChecklistDocumentos
                  checklist={checklist}
                  cargarTodo={cargarTodo}
                  idSolicitud={idSolicitud}
                  numero={sec.num}
                  titulo={sec.titulo}
                  sectionId={String(sec.num)}
                  bloqueado={docsBloqueados}
                  mensajeBloqueo="Primero elige tu vía en «Mis medios económicos» y marca tu perfil de ingresos. Con eso sabemos exactamente qué documentos pedirte, y esta lista se activa."
                  expediente={visaExp}
                />
              ) : (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} estado={sec.estado}>
                  {renderBody(sec.id)}
                </SeccionPanel>
              )}
            </SeccionSiempreAbiertoCtx.Provider>
          </div>

          {/* Móvil: el selector de sección, abajo. */}
          <SelectorSeccionMovil secciones={secciones} activa={activeSection} onCambiar={setActiveSection} />
        </div>
      )}
    </div>
  );
}
