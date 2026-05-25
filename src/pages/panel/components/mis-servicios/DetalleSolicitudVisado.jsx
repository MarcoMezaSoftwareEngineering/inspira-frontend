// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../../../services/api";
import { formatearFecha } from "./utils";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import SeccionPanel from "./sections/SeccionPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── Campo de solo lectura ──────────────────────────────────────────────
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

// ── Bloque informativo ──────────────────────────────────────────────
function BloqueInfo({ icon, children }) {
  return (
    <div className="text-center py-6 px-2">
      <span className="block text-3xl mb-3">{icon}</span>
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

// Sesión de asesoría (cliente, solo lectura)
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

function dotColor(estado) {
  if (estado === "completado") return "bg-emerald-500";
  if (estado === "observado") return "bg-red-500";
  if (estado === "pendiente") return "bg-amber-400";
  return "bg-neutral-300";
}

export default function DetalleSolicitudVisado({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [instructivos, setInstructivos] = useState([]);
  const [visaExp, setVisaExp] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeKey, setActiveKey] = useState("docs");

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
        const lista = (rInst.instructivos || []).map((i) => {
          const rawUrl = i.url || i.archivo_url || "";
          const isAbsolute = /^https?:\/\//i.test(rawUrl);
          if (isAbsolute) return { label: i.label, url: rawUrl };
          const path = rawUrl.replace(/^\/+/, "");
          return { label: i.label, url: `${base}/${path}` };
        });
        setInstructivos(lista);
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
  const aprobados = checklist.filter((it) => ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())).length;

  const docsEstado = useMemo(() => {
    if (!checklist.length) return "pendiente";
    const hayObs = checklist.some((it) => ["observado", "rechazado"].includes((it.estado_item || "").toLowerCase()));
    if (hayObs) return "observado";
    const allDone = checklist.every((it) => ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase()));
    return allDone ? "completado" : "pendiente";
  }, [checklist]);

  const sesionPorTipo = (tipo) => sesiones.find((s) => s.tipo === tipo) || null;
  const sesionEstado = (tipo) => (sesionPorTipo(tipo)?.estado === "COMPLETADA" ? "completado" : "pendiente");

  const estadoBloque = (key) => {
    switch (key) {
      case "datos": return datosCompletos ? "completado" : "pendiente";
      case "docs": return docsEstado;
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

  const BLOQUES = [
    { key: "datos", n: "1", label: "Mis datos personales", sub: "Datos registrados de tu expediente" },
    { key: "docs", n: "2", label: "Mis documentos", sub: `${aprobados} de ${total} documentos listos` },
    { key: "solvencia", n: "3", label: "Mi tipo de solvencia", sub: "Se define en la sesión de diagnóstico" },
    { key: "diagnostico", n: "4", label: "Mi sesión de diagnóstico", sub: "Evaluación inicial de tu caso" },
    { key: "seguimiento", n: "5", label: "Mi sesión de seguimiento", sub: "Revisión del avance de tus documentos" },
    { key: "formulario", n: "6", label: "Formulario de visado", sub: "Preparado por Inspira" },
    { key: "precita", n: "7", label: "Mi sesión pre-cita", sub: "Verificación final antes de ir a BLS" },
    { key: "cita", n: "8", label: "Mi cita en BLS / Consulado", sub: "Presentación presencial del expediente" },
    { key: "cierre", n: "9", label: "Resultado y cierre", sub: "Cierre de tu expediente" },
  ];

  const bloquesDone = BLOQUES.filter((b) => estadoBloque(b.key) === "completado").length;
  const pct = Math.round((bloquesDone / BLOQUES.length) * 100);

  const SOLV_LABEL = { PROPIOS: "🙋 Medios propios", AVAL: "👨‍👩‍👧 Con aval / tercero", PENDIENTE: "Pendiente de definir" };
  const FORM_LABEL = { EN_PREPARACION: "En preparación", ENVIADO: "Enviado para tu revisión", FIRMADO: "Firmado" };

  function abrir(key) {
    setActiveKey(key);
    setTimeout(() => document.getElementById(`b-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }
  function toggle(key) {
    setActiveKey((prev) => (prev === key ? null : key));
  }

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
            <p className="text-[11px] text-neutral-400">Si necesitas corregir algún dato, contacta a tu asesor.</p>
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

  if (loading) {
    return (
      <div className="p-6">
        <button onClick={onVolver} className="text-xs text-[#1D6A4A] hover:underline mb-3">← Volver a mis servicios</button>
        <p className="text-sm text-neutral-500">Cargando…</p>
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className="p-6">
        <button onClick={onVolver} className="text-xs text-[#1D6A4A] hover:underline mb-3">← Volver a mis servicios</button>
        <p className="text-sm text-red-600">{error || "No se pudo cargar la solicitud."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 pb-16 space-y-3">
      <button onClick={onVolver} className="text-xs text-[#1D6A4A] hover:underline pt-2">
        ← Volver a mis servicios
      </button>

      {/* Welcome */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#15533a] to-[#1D6A4A] text-white">
        <p className="text-[11px] text-white/70">Bienvenido/a,</p>
        <h2 className="font-serif text-2xl leading-tight">{cli.nombre || "—"}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[11px] text-[#B7E4C7]">🇪🇸 Visa de Estudios · España</span>
          <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded-full">Solicitud #{detalle.id_solicitud}</span>
        </div>
      </div>

      {/* Progreso */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Tu progreso</p>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#40916C] transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[12px] font-bold text-[#1D6A4A]">{pct}%</span>
          <span className="text-[10px] text-neutral-400">{bloquesDone} de {BLOQUES.length} bloques completados</span>
        </div>
      </div>

      {/* Sidebar + contenido */}
      <div className="flex gap-4 items-start">
        {/* Barra lateral de bloques */}
        <aside className="hidden md:block w-56 shrink-0 sticky top-4 self-start">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-2">
            <p className="text-[9px] font-bold uppercase tracking-[.15em] text-neutral-400 px-2 pt-1 pb-2">Bloques del expediente</p>
            {BLOQUES.map((b) => {
              const est = estadoBloque(b.key);
              const on = activeKey === b.key;
              return (
                <button key={b.key} type="button" onClick={() => abrir(b.key)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-[9px] mb-0.5 text-left transition-all ${on ? "bg-[#E8F5EE]" : "hover:bg-neutral-50"}`}>
                  <span className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[11px] font-bold shrink-0 ${on ? "bg-[#1D6A4A] text-white" : "bg-neutral-100 text-neutral-500"}`}>
                    {b.n}
                  </span>
                  <span className={`text-[12px] flex-1 leading-tight ${on ? "font-bold text-[#1D6A4A]" : "font-medium text-neutral-600"}`}>{b.label}</span>
                  <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${dotColor(est)}`} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Contenido — acordeón de apertura única */}
        <div className="flex-1 min-w-0 space-y-3">
          {BLOQUES.map((b) => (
            <div key={b.key} id={`b-${b.key}`} className="scroll-mt-4">
              {b.key === "docs" ? (
                <ChecklistDocumentos
                  checklist={checklist}
                  cargarTodo={cargarTodo}
                  idSolicitud={idSolicitud}
                  numero="2"
                  titulo="Mis documentos"
                  sectionId="2"
                  open={activeKey === "docs"}
                  onToggle={() => toggle("docs")}
                />
              ) : (
                <SeccionPanel
                  numero={b.n}
                  titulo={b.label}
                  subtitulo={b.sub}
                  estado={estadoBloque(b.key)}
                  open={activeKey === b.key}
                  onToggle={() => toggle(b.key)}
                >
                  {renderBody(b.key)}
                </SeccionPanel>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
