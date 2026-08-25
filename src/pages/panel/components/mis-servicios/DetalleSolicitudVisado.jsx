// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../../../services/api";
import { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import SeccionPanel from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import VisaDatosCliente from "./sections/VisaDatosCliente";
import VisaMediosEconomicos from "./sections/VisaMediosEconomicos";
import VisaDeclaracionCliente from "./sections/VisaDeclaracionCliente";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
        active ? "bg-[#023A4B] shadow-sm" : "hover:bg-neutral-100"
      }`}
    >
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
        active ? "bg-white/20 text-white" : "bg-[#046C8C]/10 text-[#046C8C]"
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
      <p className={`font-bold mt-1 ${agendada ? "text-[20px] text-[#023A4B]" : "text-[17px] text-neutral-400"}`}>
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

// ── Componente principal ──────────────────────────────────────────────────────
export default function DetalleSolicitudVisado({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [instructivos, setInstructivos] = useState([]);
  const [visaExp, setVisaExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("docs");
  const [menuAbierto, setMenuAbierto] = useState(false);

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
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);

      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const rExp = await apiGET(`/solicitudes/${idSolicitud}/visa-expediente`);
      if (rExp.ok) setVisaExp(rExp.expediente || null);

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        const base = (API_URL || "").replace(/\/+$/, "");
        setInstructivos((rInst.instructivos || []).map((i) => {
          const rawUrl = i.url || i.archivo_url || "";
          const isAbsolute = /^https?:\/\//i.test(rawUrl);
          return { label: i.label, url: isAbsolute ? rawUrl : `${base}/${rawUrl.replace(/^\/+/, "")}` };
        }));
      } else {
        setInstructivos([]);
      }
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

  const docsBloqueados = (visaExp?.tipo_solvencia || "PENDIENTE") === "PENDIENTE";

  const estadoBloque = (key) => {
    switch (key) {
      case "datos": return datosCompletos ? "completado" : "pendiente";
      case "docs": return checklist.length ? docsEstado : "pendiente";
      case "solvencia": return visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE" ? "completado" : "pendiente";
      case "economicos": return djCompleta ? "completado" : "pendiente";
      case "cita": return ["AGENDADA", "CONFIRMADA", "REALIZADA"].includes(visaExp?.cita_estado) ? "completado" : "pendiente";
      case "formulario": return visaExp?.formulario_estado === "FIRMADO" ? "completado" : "pendiente";
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

  const SOLV_SUB = { PROPIOS: "Medios propios", AVAL: "Con avalista", MIXTO: "Mixto" };
  const CITA_SUB = {
    AGENDADA: "Agendada", CONFIRMADA: "Confirmada",
    REALIZADA: "Ya presentada", REAGENDAR: "Hay que reagendar",
  };
  const FORM_SUB = {
    EN_PREPARACION: "En preparación", ENVIADO: "Listo para tu revisión", FIRMADO: "Firmado",
  };

  // Los 6 bloques del expediente, en el orden que pidio el usuario.
  //
  // La cita de BLS va segunda a proposito: su fecha marca el calendario de
  // todo lo demas. Y medios y datos economicos van ANTES de documentos porque
  // lo que se marca ahi es justo lo que decide QUE documentos se piden.
  const navSections = [
    { id: "datos",      num: 1, titulo: "Tus datos",                subtitulo: datosCompletos ? "Datos completos" : "Completa tus datos" },
    { id: "cita",       num: 2, titulo: "Cita BLS",                 subtitulo: CITA_SUB[visaExp?.cita_estado] || "Sin fecha aún" },
    { id: "solvencia",  num: 3, titulo: "Mis medios económicos",    subtitulo: SOLV_SUB[visaExp?.tipo_solvencia] || "Elige tu vía y calcula" },
    { id: "economicos", num: 4, titulo: "Datos económicos",         subtitulo: "Situación laboral e ingresos" },
    { id: "docs",       num: 5, titulo: "Documentos",               subtitulo: docsBloqueados ? "Se activa al elegir tus medios" : total ? `${docsListas} de ${total} listos` : "Sube tus documentos" },
    { id: "formulario", num: 6, titulo: "Formulario hecho por Inspira", subtitulo: FORM_SUB[visaExp?.formulario_estado] || "Lo preparamos nosotros" },
  ].map((x) => ({ ...x, estado: estadoBloque(x.id) }));

  const bloquesDone = navSections.filter((s) => s.estado === "completado").length;
  const pct = Math.round((bloquesDone / navSections.length) * 100);

  const FORM_LABEL = { EN_PREPARACION: "En preparación", ENVIADO: "Enviado para tu revisión", FIRMADO: "Firmado" };

  function renderBody(key) {
    switch (key) {
      case "cita":
        return (
          <div className="space-y-3">
            <p className="text-[13.5px] text-neutral-500 leading-relaxed">
              Tu visa se tramita en el Consulado de España a través de BLS International.
              La fecha de esta cita marca el calendario de todo lo demás.
            </p>
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
            {visaExp?.cita_resultado && (
              <Tarjeta titulo="Resultado">
                <p className="text-[13px] text-neutral-700">{visaExp.cita_resultado}</p>
              </Tarjeta>
            )}
            <Aviso tono="ok" icono="🎒">
              Lleva: expediente original + copia, pasaporte, foto y{" "}
              <b>efectivo para la tasa consular</b>.
            </Aviso>
            <Aviso tono="warn" icono="✈️">
              <b>No compres tu vuelo</b> todavía: sólo reserva con tarifa flexible.
              Se compra cuando la visa esté aprobada.
            </Aviso>
          </div>
        );

      case "formulario":
        return (
          <div className="space-y-3">
            <Aviso tono="info" icono="📝">
              El <b>impreso oficial de solicitud</b> lo prepara Inspira con los datos
              que cargaste en el bloque 1. Tú no tienes que rellenar nada: sólo
              revisarlo y firmarlo a mano el día de tu cita.
            </Aviso>

            <SesionView
              sesion={visaExp?.formulario_estado && visaExp.formulario_estado !== "EN_PREPARACION"
                ? { estado: visaExp.formulario_estado === "FIRMADO" ? "COMPLETADA" : "PROGRAMADA",
                    fecha: FORM_LABEL[visaExp.formulario_estado] }
                : null}
              etiqueta="Estado de tu formulario"
              vacio="Lo estamos preparando con tus datos"
            />

            {visaExp?.formulario_estado === "ENVIADO" && (
              <Aviso tono="warn" icono="👀">
                Ya está listo. <b>Revisa que todos tus datos sean correctos</b> y
                confírmalo con tu asesor antes de firmarlo.
              </Aviso>
            )}

            {instructivos.length > 0 && (
              <Tarjeta titulo="Instructivos y plantillas">
                <ul className="space-y-2">
                  {instructivos.map((doc) => (
                    <li key={doc.url} className="flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
                      <span className="text-[13px] font-medium text-neutral-700 truncate">📄 {doc.label}</span>
                      <a href={doc.url} target="_blank" rel="noreferrer" download
                        className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg border-2 border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#1D6A4A] hover:text-white transition-all">
                        Descargar
                      </a>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  const sec = navSections.find((s) => s.id === activeSection) || navSections[0];
  const indiceActivo = Math.max(0, navSections.findIndex((s) => s.id === sec.id));

  function irBloque(paso) {
    const destino = navSections[indiceActivo + paso];
    if (destino) { setActiveSection(destino.id); setMenuAbierto(false); }
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Fila superior: botón volver + encabezado compacto */}
      <div className="shrink-0 flex items-center gap-3 mb-3">
        <button
          onClick={onVolver}
          aria-label="Volver a mis servicios"
          className="shrink-0 inline-flex items-center gap-2 min-h-[40px] min-w-[44px] justify-center px-3 sm:px-3.5 py-2 rounded-xl bg-[#023A4B] text-white text-xs font-semibold hover:bg-[#035670] active:scale-95 transition-all shadow-sm group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {/* En teléfono basta la flecha: el rótulo se come 90 px de ancho. */}
          <span className="hidden sm:inline">Mis servicios</span>
        </button>

        {loading && (
          <div className="flex items-center gap-2 text-neutral-400">
            <div className="w-4 h-4 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Cargando…</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && detalle && (
          <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#046C8C] uppercase tracking-widest leading-none">
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

      {/* Panel principal */}
      {!loading && !error && detalle && (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">

          {/* Móvil: selector de bloque. Con 10 bloques una tira deslizable
              obliga a buscar a ciegas; un desplegable los muestra todos de
              una vez, con su estado, y deja avanzar paso a paso. */}
          <div className="md:hidden shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => irBloque(-1)}
                disabled={indiceActivo <= 0}
                className="shrink-0 w-11 h-11 rounded-xl border border-neutral-200 bg-white grid place-items-center text-neutral-500 disabled:opacity-30 active:scale-95 transition-all"
                aria-label="Bloque anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setMenuAbierto((v) => !v)}
                className="flex-1 min-w-0 flex items-center gap-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm px-3 py-2.5 text-left"
                aria-expanded={menuAbierto}
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-[#046C8C]/10 text-[#046C8C] grid place-items-center text-[11px] font-black">
                  {sec.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-neutral-900 truncate">{sec.titulo}</span>
                  <span className="block text-[10.5px] text-neutral-400 truncate">
                    Bloque {indiceActivo + 1} de {navSections.length}
                  </span>
                </span>
                {sec.estado && (
                  <span className={`shrink-0 w-2 h-2 rounded-full ${DOT_COLORS[sec.estado] || "bg-neutral-300"}`} />
                )}
                <svg className={`shrink-0 w-4 h-4 text-neutral-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => irBloque(1)}
                disabled={indiceActivo >= navSections.length - 1}
                className="shrink-0 w-11 h-11 rounded-xl border border-neutral-200 bg-white grid place-items-center text-neutral-500 disabled:opacity-30 active:scale-95 transition-all"
                aria-label="Bloque siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {menuAbierto && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-lg p-1.5 max-h-[60vh] overflow-y-auto">
                {navSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setActiveSection(s.id); setMenuAbierto(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-colors ${
                      activeSection === s.id ? "bg-[#023A4B]" : "active:bg-neutral-100"
                    }`}
                  >
                    <span className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[11px] font-black ${
                      activeSection === s.id ? "bg-white/20 text-white" : "bg-[#046C8C]/10 text-[#046C8C]"
                    }`}>{s.num}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] font-semibold truncate ${activeSection === s.id ? "text-white" : "text-neutral-800"}`}>
                        {s.titulo}
                      </span>
                      <span className={`block text-[10.5px] truncate ${activeSection === s.id ? "text-white/60" : "text-neutral-400"}`}>
                        {s.subtitulo}
                      </span>
                    </span>
                    {s.estado && (
                      <span className={`shrink-0 w-2 h-2 rounded-full ${
                        activeSection === s.id ? "bg-white/40" : (DOT_COLORS[s.estado] || "bg-neutral-300")
                      }`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          {/* Contenido de la sección activa (llena el área) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <SeccionSiempreAbiertoCtx.Provider value={true}>
              {activeSection === "economicos" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} subtitulo={sec.subtitulo} estado={sec.estado}>
                  <VisaDeclaracionCliente
                    idSolicitud={idSolicitud}
                    expediente={visaExp}
                    onGuardado={() => cargarTodo({ silent: true })}
                  />
                </SeccionPanel>
              ) : activeSection === "solvencia" ? (
                <SeccionPanel numero={sec.num} titulo={sec.titulo} subtitulo={sec.subtitulo} estado={sec.estado}>
                  <VisaMediosEconomicos
                    idSolicitud={idSolicitud}
                    expediente={visaExp}
                    onGuardado={() => cargarTodo({ silent: true })}
                  />
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
        </div>
      )}
    </div>
  );
}
