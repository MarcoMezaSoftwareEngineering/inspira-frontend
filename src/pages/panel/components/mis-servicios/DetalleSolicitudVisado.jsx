// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../../../services/api";
import { formatearFecha } from "./utils";
import { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import SeccionPanel from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";

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
        <p className={`text-xs font-semibold leading-tight truncate ${active ? "text-white" : "text-neutral-800"}`}>
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
function CampoLectura({ label, value }) {
  const vacio = value === null || value === undefined || value === "";
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className={`text-[12px] font-semibold ${vacio ? "text-neutral-300 italic" : "text-neutral-800"}`}>
        {vacio ? "N/D" : value}
      </p>
    </div>
  );
}

function BloqueInfo({ icon, children }) {
  return (
    <div className="text-center py-8 px-2">
      <span className="block text-4xl mb-3">{icon}</span>
      <div className="text-[13px] text-neutral-500 leading-relaxed max-w-md mx-auto">{children}</div>
    </div>
  );
}

function Linea({ label, value }) {
  if (!value) return null;
  return (
    <p className="text-[13px] text-neutral-600 leading-relaxed">
      <span className="font-semibold text-neutral-800">{label}:</span> {value}
    </p>
  );
}

function SesionView({ sesion, icon, vacio }) {
  if (!sesion || sesion.estado === "PENDIENTE") {
    return <BloqueInfo icon={icon}>{vacio}</BloqueInfo>;
  }
  const programada = sesion.estado === "PROGRAMADA";
  return (
    <div className={`rounded-xl border p-4 ${programada ? "border-sky-200 bg-sky-50/40" : "border-emerald-200 bg-emerald-50/40"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-neutral-200">
          {programada ? "Programada" : "Completada"}
        </span>
      </div>
      <Linea label="Fecha" value={sesion.fecha} />
      <Linea label="Hora" value={sesion.hora} />
      <Linea label="Plataforma" value={sesion.plataforma} />
      {sesion.notas && <Linea label="Notas" value={sesion.notas} />}
      {sesion.enlace_meet && (
        <a href={sesion.enlace_meet} target="_blank" rel="noreferrer"
          className="inline-block mt-3 text-[13px] font-semibold px-4 py-2 rounded-lg bg-[#2471A3] text-white hover:opacity-90 transition-all">
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
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("docs");

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);

      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const rExp = await apiGET(`/solicitudes/${idSolicitud}/visa-expediente`);
      if (rExp.ok) setVisaExp(rExp.expediente || null);

      const rSes = await apiGET(`/solicitudes/${idSolicitud}/sesiones`);
      if (rSes.ok) setSesiones(rSes.sesiones || []);

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
      setError("Error al cargar información.");
    } finally {
      setLoading(false);
    }
  }

  const cli = detalle?.cliente || {};
  const extra = cli.datos_extra || {};
  const datos = detalle?.datos_formulario || {};

  const datosCompletos = !!(cli.nombre && cli.pasaporte && (extra.fecha_nacimiento || extra.pasaporte_vencimiento));

  const total = checklist.length;
  const docsListas = checklist.filter((it) => ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())).length;

  const docsEstado = useMemo(() => {
    if (!checklist.length) return "pendiente";
    const hayObs = checklist.some((it) => ["observado", "rechazado"].includes((it.estado_item || "").toLowerCase()));
    if (hayObs) return "observado";
    return docsListas === checklist.length ? "completado" : "pendiente";
  }, [checklist, docsListas]);

  const sesionPorTipo = (tipo) => sesiones.find((s) => s.tipo === tipo) || null;
  const sesionEstado = (tipo) => (sesionPorTipo(tipo)?.estado === "COMPLETADA" ? "completado" : "pendiente");

  const estadoBloque = (key) => {
    switch (key) {
      case "datos": return datosCompletos ? "completado" : "pendiente";
      case "docs": return checklist.length ? docsEstado : "pendiente";
      case "solvencia": return visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE" ? "completado" : "pendiente";
      case "diagnostico": return sesionEstado("DIAGNOSTICO");
      case "seguimiento": return sesionEstado("SEGUIMIENTO");
      case "formulario": return visaExp?.formulario_estado === "FIRMADO" ? "completado" : "pendiente";
      case "precita": return sesionEstado("PRECITA");
      case "cita": return visaExp?.cita_estado === "REALIZADA" ? "completado" : "pendiente";
      case "cierre": return visaExp?.cierre_estado === "CERRADO" ? "completado" : "pendiente";
      default: return "pendiente";
    }
  };

  const navSections = [
    { id: "datos", num: 1, titulo: "Mis datos personales", subtitulo: "Datos de tu expediente" },
    { id: "docs", num: 2, titulo: "Mis documentos", subtitulo: total ? `${docsListas} de ${total} listos` : "Sube tus documentos" },
    { id: "solvencia", num: 3, titulo: "Mi tipo de solvencia", subtitulo: "Medios propios o aval" },
    { id: "diagnostico", num: 4, titulo: "Sesión de diagnóstico", subtitulo: "Evaluación inicial" },
    { id: "seguimiento", num: 5, titulo: "Sesión de seguimiento", subtitulo: "Avance de documentos" },
    { id: "formulario", num: 6, titulo: "Formulario de visado", subtitulo: "Preparado por Inspira" },
    { id: "precita", num: 7, titulo: "Sesión pre-cita", subtitulo: "Verificación final" },
    { id: "cita", num: 8, titulo: "Cita BLS / Consulado", subtitulo: "Presentación presencial" },
    { id: "cierre", num: 9, titulo: "Resultado y cierre", subtitulo: "Cierre del expediente" },
  ].map((s) => ({ ...s, estado: estadoBloque(s.id) }));

  const bloquesDone = navSections.filter((s) => s.estado === "completado").length;
  const pct = Math.round((bloquesDone / navSections.length) * 100);

  const SOLV_LABEL = { PROPIOS: "🙋 Medios propios", AVAL: "👨‍👩‍👧 Con aval / tercero", PENDIENTE: "Pendiente de definir" };
  const FORM_LABEL = { EN_PREPARACION: "En preparación", ENVIADO: "Enviado para tu revisión", FIRMADO: "Firmado" };

  function renderBody(key) {
    switch (key) {
      case "datos":
        return (
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A]">Datos personales</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <CampoLectura label="Nombre" value={cli.nombre} />
              <CampoLectura label="Fecha nacimiento" value={extra.fecha_nacimiento ? formatearFecha(extra.fecha_nacimiento) : null} />
              <CampoLectura label="Nacionalidad" value={extra.nacionalidad || datos.nacionalidad} />
              <CampoLectura label="País de origen" value={cli.pais_origen} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] pt-1">Documento de viaje</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <CampoLectura label="N° pasaporte" value={cli.pasaporte} />
              <CampoLectura label="Emisión" value={extra.pasaporte_emision ? formatearFecha(extra.pasaporte_emision) : null} />
              <CampoLectura label="Válido hasta" value={extra.pasaporte_vencimiento ? formatearFecha(extra.pasaporte_vencimiento) : null} />
              <CampoLectura label="DNI" value={cli.dni} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] pt-1">Contacto</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <CampoLectura label="Teléfono / WhatsApp" value={cli.telefono} />
              <CampoLectura label="Correo" value={cli.email_contacto} />
            </div>
            {(visaExp?.centro_nombre || visaExp?.centro_direccion) && (
              <>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] pt-1">Centro de estudios</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <CampoLectura label="Centro" value={visaExp.centro_nombre} />
                  <CampoLectura label="Dirección" value={visaExp.centro_direccion} />
                  <CampoLectura label="Inicio" value={visaExp.centro_inicio} />
                  <CampoLectura label="Fin" value={visaExp.centro_fin} />
                </div>
              </>
            )}
            <p className="text-[11px] text-neutral-400 pt-1">Si necesitas corregir algún dato, contacta a tu asesor.</p>
          </div>
        );

      case "solvencia":
        return visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-[14px] font-bold text-[#1D6A4A] mb-2">{SOLV_LABEL[visaExp.tipo_solvencia]}</p>
            {visaExp.tipo_solvencia === "AVAL" && (
              <>
                <Linea label="Aval" value={visaExp.aval_nombre} />
                <Linea label="Vínculo" value={visaExp.aval_vinculo} />
                <Linea label="País" value={visaExp.aval_pais} />
                <Linea label="Monto acreditado" value={visaExp.aval_monto} />
                <Linea label="Banco" value={visaExp.aval_banco} />
              </>
            )}
            <p className="text-[12px] text-neutral-500 mt-2">En el Bloque 2 verás los documentos que corresponden a esta variante.</p>
          </div>
        ) : (
          <BloqueInfo icon="💰">
            Tu asesor definirá contigo si acreditarás tu solvencia con <strong>medios propios</strong> (tu propia cuenta bancaria)
            o <strong>con aval / tercero</strong> (un familiar que acredita los fondos). Una vez definido, verás en el Bloque 2
            exactamente qué documentos necesitas.
          </BloqueInfo>
        );

      case "diagnostico":
        return <SesionView sesion={sesionPorTipo("DIAGNOSTICO")} icon="🔍"
          vacio="En esta sesión evaluamos tu caso, definimos el tipo de solvencia y te explicamos todos los documentos que necesitas y sus plazos. Tu asesor te compartirá aquí la fecha y el enlace de la reunión." />;

      case "seguimiento":
        return <SesionView sesion={sesionPorTipo("SEGUIMIENTO")} icon="📊"
          vacio="Mientras reúnes tus documentos, tu asesor se reunirá contigo para revisar el avance, resolver dudas y ajustar lo que sea necesario." />;

      case "formulario":
        return (
          <>
            {visaExp?.formulario_estado && visaExp.formulario_estado !== "EN_PREPARACION" ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 mb-3">
                <p className="text-[13px] text-neutral-700"><span className="font-semibold">Estado:</span> {FORM_LABEL[visaExp.formulario_estado]}</p>
                {visaExp.formulario_estado === "ENVIADO" && (
                  <p className="text-[12px] text-neutral-500 mt-1">Revisa que tus datos sean correctos y confírmalo con tu asesor.</p>
                )}
              </div>
            ) : (
              <BloqueInfo icon="📋">
                Inspira prepara el formulario oficial de solicitud de visado con tus datos. Cuando esté listo lo recibirás
                aquí para revisarlo, confirmar los datos del centro de estudios y firmarlo.
              </BloqueInfo>
            )}
            {instructivos.length > 0 && (
              <div className="mt-2 border-t border-neutral-100 pt-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Instructivos y plantillas</p>
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
              </div>
            )}
          </>
        );

      case "precita":
        return <SesionView sesion={sesionPorTipo("PRECITA")} icon="✅"
          vacio="Justo antes de tu cita en BLS revisamos juntos que todo esté en orden: documentos, expediente impreso, efectivo para la tasa y la logística del día." />;

      case "cita":
        return visaExp?.cita_estado && visaExp.cita_estado !== "PENDIENTE" ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏛️</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-neutral-200">{visaExp.cita_estado}</span>
            </div>
            <Linea label="Fecha" value={visaExp.cita_fecha} />
            <Linea label="Hora" value={visaExp.cita_hora} />
            <Linea label="N° referencia BLS" value={visaExp.cita_ref_bls} />
            <Linea label="Tasa consular" value={visaExp.cita_tasa} />
            <Linea label="Resultado" value={visaExp.cita_resultado} />
          </div>
        ) : (
          <BloqueInfo icon="🏛️">
            Tu asesor coordinará y te comunicará aquí todos los detalles de la cita (fecha, hora y referencia) cuando el
            expediente esté listo y aprobado.
          </BloqueInfo>
        );

      case "cierre":
        return visaExp?.cierre_estado === "CERRADO" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-[14px] font-bold text-[#1D6A4A] mb-2">🎓 Expediente cerrado</p>
            <Linea label="Resultado de la visa" value={visaExp.cita_resultado} />
            <p className="text-[12px] text-neutral-500 mt-1">¡Felicidades! Si tienes dudas sobre tu llegada a España (NIE, TIE, empadronamiento), tu asesor te orientará.</p>
          </div>
        ) : (
          <BloqueInfo icon="🎓">
            Al finalizar el proceso encontrarás aquí el resultado de tu visa, las instrucciones para recogerla y la guía
            de llegada a España (NIE, TIE y empadronamiento).
          </BloqueInfo>
        );

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
          className="shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#023A4B] text-white text-xs font-semibold hover:bg-[#035670] active:scale-95 transition-all shadow-sm group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Mis servicios
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
          <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-4 py-2.5 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#046C8C] uppercase tracking-widest leading-none">
                Solicitud #{detalle.id_solicitud}
              </p>
              <p className="text-sm font-bold text-neutral-900 leading-snug truncate mt-0.5">
                🇪🇸 {detalle.tipo?.nombre || "Visa de Estudios"} · {cli.nombre || ""}
              </p>
            </div>
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

          {/* Móvil: tab bar horizontal */}
          <div className="md:hidden shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-2 py-1.5 flex gap-1 overflow-x-auto">
            {navSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                  activeSection === s.id ? "bg-[#023A4B] text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                  activeSection === s.id ? "bg-white/20 text-white" : "bg-[#046C8C]/10 text-[#046C8C]"
                }`}>{s.num}</span>
                {s.titulo}
                {s.estado && (
                  <span className={`w-1.5 h-1.5 rounded-full ${activeSection === s.id ? "bg-white/40" : (DOT_COLORS[s.estado] || "bg-neutral-300")}`} />
                )}
              </button>
            ))}
          </div>

          {/* Desktop: sidebar vertical */}
          <div className="hidden md:flex w-52 shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm p-2 flex-col gap-0.5 overflow-y-auto">
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
              {activeSection === "docs" ? (
                <ChecklistDocumentos
                  checklist={checklist}
                  cargarTodo={cargarTodo}
                  idSolicitud={idSolicitud}
                  numero="2"
                  titulo="Mis documentos"
                  sectionId="2"
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
