// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
import { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import SeccionPanel from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import VisaDatosCliente from "./sections/VisaDatosCliente";
import VisaMediosEconomicos from "./sections/VisaMediosEconomicos";
import VisaDeclaracionCliente from "./sections/VisaDeclaracionCliente";
import { estadoVisado, TONOS } from "../../../../lib/visaFlujoInterno";
import { EsqueletoExpediente } from "../Esqueleto";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import SelectorSeccionMovil from "./SelectorSeccionMovil";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const DOT_COLORS = {
  completado: "bg-emerald-500",
  pendiente:  "bg-amber-400",
  observado:  "bg-red-400",
  cargando:   "bg-blue-400 animate-pulse",
};

// ── NavItem — botón de la barra lateral (copiado del detalle de Máster) ───────
function NavItem({ num, titulo, subtitulo, estado, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
        active ? "bg-primary shadow-sm" : "hover:bg-neutral-100"
      }`}
    >
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
        active ? "bg-white/20 text-white" : "bg-primary-light/10 text-primary-light"
      }`}>
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold leading-tight ${active ? "text-white" : "text-neutral-800"}`}>
          {titulo}
        </p>
        {subtitulo && (
          <p className={`text-[10px] mt-0.5 truncate ${active ? "text-white/60" : "text-neutral-400"}`}>
            {subtitulo}
          </p>
        )}
      </div>
      {estado && (
        <span className={`shrink-0 w-2 h-2 rounded-full ${active ? "bg-white/40" : (DOT_COLORS[estado] || "bg-neutral-300")}`} />
      )}
    </button>
  );
}

// ── Helpers de contenido ──────────────────────────────────────────────────────
function Aviso({ tono = "info", icono, children }) {
  const tonos = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    ok:   "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tonos[tono]}`}>
      <span className="shrink-0 text-base leading-none mt-0.5">{icono}</span>
      <div>{children}</div>
    </div>
  );
}

function Tarjeta({ titulo, children, borde }) {
  return (
    <div className={`bg-white border rounded-2xl shadow-sm p-4 ${borde || "border-neutral-200"}`}>
      {titulo && (
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2.5">{titulo}</p>
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
    <div className={`rounded-2xl border p-4 ${
      completada ? "border-emerald-200 bg-emerald-50/50"
      : agendada ? "border-sky-200 bg-sky-50/50"
      : "border-dashed border-neutral-300 bg-neutral-50"
    }`}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{etiqueta}</p>
      <p className={`font-bold mt-1 ${agendada ? "text-[20px] text-primary" : "text-[17px] text-neutral-400"}`}>
        {agendada && sesion.fecha ? sesion.fecha : "Por agendar"}
        {agendada && sesion.hora ? ` · ${sesion.hora}` : ""}
      </p>
      <p className="text-[12px] text-neutral-500 mt-1">
        {agendada ? (sesion.plataforma || "Te confirmamos los detalles aquí") : vacio}
      </p>
      {pie && <p className="text-[12px] text-neutral-500 mt-1.5">{pie}</p>}
      {sesion?.notas && <p className="text-[12px] text-neutral-600 mt-2">{sesion.notas}</p>}
      {sesion?.enlace_meet && (
        <a href={sesion.enlace_meet} target="_blank" rel="noreferrer"
          className="inline-block mt-3 text-[13px] font-semibold px-4 py-2 rounded-xl bg-[#2471A3] text-white hover:opacity-90 transition-all">
          🔗 Unirme a la sesión
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

  const esPdf = (doc.mime || "").includes("pdf");

  return (
    <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
      <span className="shrink-0 text-xl">{esPdf ? "📕" : "📄"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-neutral-800 truncate">{doc.etiqueta || doc.nombre}</p>
        {doc.etiqueta && doc.nombre && (
          <p className="text-[11px] text-neutral-400 truncate">{doc.nombre}</p>
        )}
        {error && <p className="text-[11px] text-red-600 mt-0.5">{error}</p>}
      </div>
      <button
        type="button"
        onClick={descargar}
        disabled={bajando}
        className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg border-2 border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#1D6A4A] hover:text-white transition-all disabled:opacity-50"
      >
        {bajando ? "…" : "Descargar"}
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DetalleSolicitudVisado({ solicitudBase, onVolver, seccion, onSeccion }) {
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

  // Auto-refresco: re-consulta cada ~25s y al volver a esta pestaña (silencioso, sin flicker).
  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === "visible") cargarTodo({ silent: true });
    };
    const intervalo = setInterval(refrescar, 25000);
    window.addEventListener("focus", refrescar);
    document.addEventListener("visibilitychange", refrescar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", refrescar);
      document.removeEventListener("visibilitychange", refrescar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

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
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);
      if (rExp.ok) setVisaExp(rExp.expediente || null);
      if (rSes.ok) setSesiones(rSes.sesiones || []);
      if (rDocs.ok) setVisaDocs(rDocs.documentos || {});
    } catch (e) {
      console.error(e);
      if (!silent) setError("Error al cargar información.");
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
    { id: "mensajes",    num: 7, titulo: "Mensajes",                subtitulo: sinLeer > 0 ? `${sinLeer} sin leer` : "Con tu asesor, por escrito" },
  ].map((x) => ({ ...x, estado: x.id === "mensajes" ? (sinLeer > 0 ? "pendiente" : "completado") : estadoBloque(x.id) }));

  // Una sección que no existe para este expediente —un enlace viejo, un
  // tipo de servicio distinto— cae en la primera en vez de en una pantalla vacía.
  const activeSection = navSections.some((x) => x.id === seccion) ? seccion : navSections[0]?.id;

  const bloquesDone = navSections.filter((s) => s.estado === "completado").length;
  const pct = Math.round((bloquesDone / navSections.length) * 100);

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
            <Aviso tono="ok" icono="⭐">
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
                  <li key={t} className="flex gap-2 text-[13px] text-neutral-700 leading-relaxed">
                    <span className="shrink-0 text-[#1D6A4A] font-bold">✓</span>
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
            <Aviso tono="info" icono="📝">
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
              <Aviso tono="warn" icono="✍️">
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
            <div className={`rounded-2xl border px-4 py-3 ${TONOS[ev.tono]}`}>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Estado de tu visado</p>
              <p className="text-[17px] font-bold mt-0.5">{ev.icono} {ev.texto}</p>
            </div>

            {/* Un requerimiento exige que actúe él, y con plazo: va antes que nada. */}
            {req === "SOLICITADO" && (
              <Tarjeta titulo="Te han pedido subsanar algo" borde="border-red-300">
                <p className="text-[13px] text-neutral-700 leading-relaxed">
                  El consulado solicitó documentación o aclaraciones adicionales.
                </p>
                {visaExp?.requerimiento_detalle && (
                  <p className="text-[13px] text-neutral-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                    <b>Qué piden:</b> {visaExp.requerimiento_detalle}
                  </p>
                )}
                {visaExp?.requerimiento_plazo && (
                  <p className="text-[13px] font-bold text-red-700 mt-2">
                    ⏰ Plazo para responder: {visaExp.requerimiento_plazo}
                  </p>
                )}
                <p className="text-[12px] text-neutral-500 mt-2">
                  Súbelo cuanto antes en <b>Mis documentos</b>. Tu asesor te acompaña en esto.
                </p>
              </Tarjeta>
            )}

            {req === "SUBSANADO" && (
              <Aviso tono="ok" icono="✅">
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
              pie="📍 BLS International · llega 15 min antes"
            />

            {visaExp?.cita_estado === "REAGENDAR" && (
              <Aviso tono="warn" icono="🔁">
                Hay que <b>reagendar</b> tu cita. Tu asesor te contactará con las
                nuevas fechas disponibles.
              </Aviso>
            )}

            {visaExp?.visado_resultado === "FAVORABLE" && (
              <Tarjeta titulo="Resolución" borde="border-emerald-200">
                <p className="text-[15px] font-bold text-[#1D6A4A]">🎉 ¡Visa concedida!</p>
                {visaExp.visado_resultado_fecha && (
                  <p className="text-[12.5px] text-neutral-500 mt-1">Resuelta el {visaExp.visado_resultado_fecha}</p>
                )}
                <p className="text-[13px] text-neutral-600 mt-2 leading-relaxed">
                  Tu asesor te indicará cómo recoger el pasaporte y te orientará sobre tu
                  llegada a España (NIE, TIE y empadronamiento).
                </p>
              </Tarjeta>
            )}

            {visaExp?.visado_resultado === "DENEGADO" && (
              <Tarjeta titulo="Resolución" borde="border-red-300">
                <p className="text-[15px] font-bold text-red-700">Resolución desfavorable</p>
                {visaExp.visado_resultado_fecha && (
                  <p className="text-[12.5px] text-neutral-500 mt-1">Notificada el {visaExp.visado_resultado_fecha}</p>
                )}
                {visaExp.via_posterior === "APELACION" && (
                  <p className="text-[13px] text-neutral-700 mt-2 leading-relaxed">
                    ⚖️ Estamos <b>presentando una apelación</b>. Tu asesor te contará los plazos.
                  </p>
                )}
                {visaExp.via_posterior === "ESTANCIA_ESTUDIOS" && (
                  <p className="text-[13px] text-neutral-700 mt-2 leading-relaxed">
                    ↪️ Estamos reconduciendo tu caso por la vía de <b>estancia por estudios</b>.
                  </p>
                )}
                {!visaExp.via_posterior && (
                  <p className="text-[13px] text-neutral-700 mt-2 leading-relaxed">
                    Tu asesor está estudiando las opciones y te contactará.
                  </p>
                )}
              </Tarjeta>
            )}

            {!visaExp?.visado_resultado && (
              <>
                <Aviso tono="ok" icono="🎒">
                  Lleva: expediente original + copia, pasaporte, foto y{" "}
                  <b>efectivo para la tasa consular</b>.
                </Aviso>
                <Aviso tono="warn" icono="✈️">
                  <b>No compres tu vuelo</b> todavía: sólo reserva con tarifa flexible.
                </Aviso>
              </>
            )}

            {visaExp?.cierre_estado === "CERRADO" && (
              <Aviso tono="ok" icono="🏁">
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

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Fila superior: botón volver + encabezado compacto */}
      <div className="shrink-0 flex items-center gap-3 mb-3">
        <button
          onClick={onVolver}
          aria-label="Volver a mis servicios"
          className="shrink-0 inline-flex items-center gap-2 min-h-[40px] min-w-[44px] justify-center px-3 sm:px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light active:scale-95 transition-all shadow-sm group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {/* En teléfono basta la flecha: el rótulo se come 90 px de ancho. */}
          <span className="hidden sm:inline">Mis servicios</span>
        </button>


        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && detalle && (
          <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest leading-none">
                Solicitud #{detalle.id_solicitud}
              </p>
              <p className="text-[13px] sm:text-sm font-bold text-neutral-900 leading-snug truncate mt-0.5">
                🇪🇸 {detalle.tipo?.nombre || "Visa de Estudios"} · {cli.nombre || ""}
              </p>
            </div>
            {/* En móvil no cabe la barra: se resume en el porcentaje. */}
            <span className="sm:hidden shrink-0 text-[11px] font-bold text-[#1D6A4A] bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
              {pct}%
            </span>
            <div className="shrink-0 hidden sm:block w-32">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-neutral-500 font-medium">Progreso</span>
                <span className="font-bold text-neutral-800">{pct}%</span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 bg-[#1D6A4A]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <EsqueletoExpediente />}

      {/* Panel principal */}
      {!loading && !error && detalle && (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">

          {/* Desktop: sidebar vertical */}
          <div className="hidden md:flex w-64 shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm p-2 flex-col gap-0.5 overflow-y-auto">
            {navSections.map((s) => (
              <NavItem
                key={s.id}
                num={s.num}
                titulo={s.titulo}
                subtitulo={s.subtitulo}
                estado={s.estado}
                active={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
              />
            ))}
          </div>

          {/* Contenido de la sección activa (llena el área). La clave por
              sección hace que cada una entre con su transición. */}
          <div key={activeSection} className="pnl-entra flex-1 min-h-0 overflow-hidden flex flex-col">
            <SeccionSiempreAbiertoCtx.Provider value={true}>
              {/* Medios y datos economicos van juntos: lo que se marca aqui es
                  lo que decide que documentos se piden en el bloque siguiente. */}
              {activeSection === "economicos" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} subtitulo={sec.subtitulo} estado={sec.estado}>
                  <div className="space-y-4">
                    <VisaMediosEconomicos
                      idSolicitud={idSolicitud}
                      expediente={visaExp}
                      onGuardado={() => cargarTodo({ silent: true })}
                    />
                    <div className="border-t border-neutral-200 pt-4">
                      <VisaDeclaracionCliente
                        idSolicitud={idSolicitud}
                        expediente={visaExp}
                        onGuardado={() => cargarTodo({ silent: true })}
                      />
                    </div>
                  </div>
                </SeccionPanel>
              ) : activeSection === "datos" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} subtitulo={sec.subtitulo} estado={sec.estado}>
                  <VisaDatosCliente
                    idSolicitud={idSolicitud}
                    expediente={visaExp}
                    cliente={cli}
                    extra={extra}
                    onGuardado={() => cargarTodo({ silent: true })}
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
                <SeccionPanel numero={sec.num} titulo={sec.titulo} subtitulo={sec.subtitulo} estado={sec.estado}>
                  {renderBody(sec.id)}
                </SeccionPanel>
              )}
            </SeccionSiempreAbiertoCtx.Provider>
          </div>

          {/* Móvil: el selector de sección, abajo. */}
          <SelectorSeccionMovil secciones={navSections} activa={activeSection} onCambiar={setActiveSection} />
        </div>
      )}
    </div>
  );
}
