// inspira-frontend/src/pages/panel/components/mis-servicios/DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
import { dialog } from "../../../../services/dialogService";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import SeccionPanel, { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import FormularioDatosAcademicos from "./sections/FormularioDatosAcademicos";
import IconoPaso from "../../../../components/common/IconoPaso";
import InformeBusqueda from "./sections/InformeBusqueda";
import EleccionMastersCliente from "./sections/EleccionMastersCliente";
import ProgramacionPostulacionesCliente from "./sections/ProgramacionPostulacionesCliente";
import PortalesYJustificantesCliente from "./sections/PortalesYJustificantesCliente";
import DocumentosProceso from "../../../../components/common/DocumentosProceso";
import CierreServicioMasterCliente from "./sections/CierreServicioMasterCliente";
import { EsqueletoExpediente } from "../Esqueleto";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import SelectorSeccionMovil from "./SelectorSeccionMovil";

// ── Constantes ────────────────────────────────────────────────────────────────

const CAMPOS_REQUERIDOS_FORMULARIO = [
  "promedio_peru", "ubicacion_grupo", "otra_maestria_tiene",
  "experiencia_anios", "ingles_situacion",
  "beca_desea", "duracion_preferida", "practicas_preferencia",
];

function formCompleto(datos) {
  const base = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) => datos?.[campo] != null && datos?.[campo] !== ""
  );
  if (!base) return false;
  if (datos.experiencia_anios && datos.experiencia_anios !== "sin") {
    if (!datos.experiencia_vinculada) return false;
  }
  return true;
}

const DOT_COLORS = {
  completado: "bg-emerald-500",
  pendiente:  "bg-amber-400",
  cargando:   "bg-blue-400 animate-pulse",
  observado:  "bg-red-400",
};

// ── NavItem — botón de la barra lateral ──────────────────────────────────────

function NavItem({ num, icono, titulo, subtitulo, estado, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
        active
          ? "bg-primary shadow-sm"
          : "hover:bg-neutral-100"
      }`}
    >
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
        active
          ? "bg-white/20 text-white"
          : "bg-primary-light/10 text-primary-light"
      }`}>
        {icono ? <IconoPaso nombre={icono} className="w-4 h-4" /> : num}
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
        <span className={`shrink-0 w-2 h-2 rounded-full ${
          active ? "bg-white/40" : (DOT_COLORS[estado] || "bg-neutral-300")
        }`} />
      )}
    </button>
  );
}

// ── Mensajes, siempre a mano ─────────────────────────────────────────────────
//
// Un botón flotante con los mensajes sin leer y, al abrirlo, el hilo con el
// asesor en una hoja: en el móvil sube desde abajo; en pantalla grande es una
// ventana a la derecha. El hilo es el mismo de siempre, con hora de Perú y
// de España en cada mensaje.

function MensajesFlotante({ abierto, onAbrir, onCerrar, sinLeer, idSolicitud }) {
  useEffect(() => {
    if (!abierto) return undefined;
    function onKey(e) { if (e.key === "Escape") onCerrar(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  return (
    <>
      <button
        type="button"
        onClick={onAbrir}
        aria-label="Mensajes con tu asesor"
        className="ux-tap fixed z-40 right-4 bottom-[calc(76px+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-primary text-white text-[13px] font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
      >
        <IconoPaso nombre="message" className="w-4 h-4" />
        Mensajes
        {sinLeer > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-black grid place-items-center">
            {sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-black/45" onClick={onCerrar}>
          <div
            className="pnl-entra w-full md:w-[520px] md:mr-6 max-h-[88vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mensajes con tu asesor"
          >
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-neutral-100 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary-light/10 text-primary-light grid place-items-center">
                <IconoPaso nombre="message" className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-primary leading-tight">Mensajes con tu asesor</p>
                <p className="text-[11.5px] text-neutral-500">Queda en tu expediente, con hora y constancia de lectura.</p>
              </div>
              <button type="button" onClick={onCerrar} aria-label="Cerrar"
                className="w-9 h-9 rounded-full grid place-items-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <IconoPaso nombre="x" className="w-4 h-4" strokeWidth={2.4} />
              </button>
            </div>
            <div className="px-4 pb-4 pt-2 flex-1 min-h-0 flex flex-col">
              <HiloMensajes
                lado="cliente"
                idSolicitud={idSolicitud}
                aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor. Para lo que importa, mejor aquí que por WhatsApp."
                cargar={() => apiGET(`/solicitudes/${idSolicitud}/mensajes`)}
                enviar={(texto) => apiPOST(`/solicitudes/${idSolicitud}/mensajes`, { texto })}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DetalleSolicitud({ solicitudBase, onVolver, onIrAGuia, seccion, onSeccion, perfil }) {
  const [detalle,           setDetalle]           = useState(null);
  const [checklist,         setChecklist]         = useState([]);
  const [formData,          setFormData]          = useState({});
  const [instructivos,      setInstructivos]      = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [savingForm,        setSavingForm]        = useState(false);
  const [error,             setError]             = useState("");
  const [elecciones,        setElecciones]        = useState([]);
  const [savingElecciones,  setSavingElecciones]  = useState(false);

  const [compat,            setCompat]            = useState(null);
  const [loadingCompat,     setLoadingCompat]     = useState(false);
  const [formGuardado,      setFormGuardado]      = useState(false);
  const [seleccionKey,      setSeleccionKey]      = useState(0);
  const [postulacionesKey,  setPostulacionesKey]  = useState(0);
  const [mensajesAbierto,   setMensajesAbierto]   = useState(false);

  // La sección viene en la URL y se cambia navegando: así «atrás» vuelve a
  // la anterior y recargar conserva el sitio. El nombre `setActiveSection` se
  // conserva para no tocar cada botón que lo llama.
  const setActiveSection = onSeccion;

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => { cargarTodo(); }, [idSolicitud]); // eslint-disable-line

  async function cargarCompatibilidad() {
    setLoadingCompat(true);
    setCompat(null);
    try {
      const r = await apiGET(`/solicitudes/${idSolicitud}/compatibilidad`);
      if (r.ok) setCompat(r);
    } catch { /* silencioso */ }
    finally { setLoadingCompat(false); }
  }

  async function cargarTodo() {
    setLoading(true);
    setError("");
    setCompat(null);
    setFormGuardado(false);
    try {
      // Todo a la vez. Iban una detrás de otra —siete viajes al servidor con
      // la pantalla en «Cargando…» hasta el último— y ninguna dependía de la
      // anterior. El perfil viene del panel, que ya lo tenía; solo se pide si
      // alguien monta esto suelto.
      const [rDetalle, rChecklist, rForm, rPerfil, rInst, rElec] = await Promise.all([
        apiGET(`/solicitudes/${idSolicitud}`),
        apiGET(`/checklist/${idSolicitud}`),
        apiGET(`/solicitudes/${idSolicitud}/formulario`),
        perfil ? Promise.resolve({ ok: true, cliente: perfil }) : apiGET("/cliente/me"),
        apiGET(`/solicitudes/${idSolicitud}/instructivos`),
        apiGET(`/solicitudes/${idSolicitud}/eleccion-masters`),
      ]);

      if (rDetalle.ok) setDetalle(rDetalle.solicitud);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const datosPerfil = rPerfil.ok ? (rPerfil.cliente?.datos_extra || {}) : {};
      const datosForm   = (rForm.ok && rForm.datos) ? rForm.datos : {};
      const merged = {
        carrera_titulo:     datosForm.carrera_titulo     || datosPerfil.carrera_titulo     || "",
        area_carrera:       datosForm.area_carrera       || datosPerfil.area_carrera       || "",
        universidad_origen: datosForm.universidad_origen || datosPerfil.universidad_origen || "",
        ...datosForm,
      };
      setFormData(merged);

      if (formCompleto(merged)) {
        setFormGuardado(true);
        cargarCompatibilidad();
      }

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

      const base5 = Array.from({ length: 5 }, (_, idx) => ({ prioridad: idx + 1, programa: "", comentario: "" }));
      if (rElec.ok && Array.isArray(rElec.elecciones)) {
        setElecciones(rElec.elecciones.length > 0 ? rElec.elecciones : base5);
      } else {
        setElecciones(base5);
      }
    } catch {
      setError("Error al cargar información.");
    } finally {
      setLoading(false);
    }
  }

  const progresoChecklist = useMemo(() => {
    if (!checklist.length) return 0;
    const done = checklist.filter((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    ).length;
    return Math.round((done * 100) / checklist.length);
  }, [checklist]);

  async function handleSubmitFormulario(e) {
    e.preventDefault();
    setSavingForm(true);
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/formulario`, formData);
      if (!r.ok) { dialog.toast("No se pudo guardar.", "error"); return; }
      dialog.toast("Datos guardados.", "success");
      // Guardar el formulario ya no borra la elección ni las postulaciones:
      // el informe se recalcula y el asesor decide qué cambia.
      setFormGuardado(true);
      setSeleccionKey((k) => k + 1);
      cargarCompatibilidad();
    } catch {
      dialog.toast("Error al guardar.", "error");
    } finally {
      setSavingForm(false);
    }
  }

  async function guardarFormularioSilencioso() {
    try { await apiPOST(`/solicitudes/${idSolicitud}/formulario`, formData); }
    catch { /* silencioso */ }
  }

  async function handleGuardarElecciones(data) {
    setSavingElecciones(true);
    try {
      const payload = data ?? elecciones;
      const r = await apiPOST(`/solicitudes/${idSolicitud}/eleccion-masters`, { elecciones: payload });
      if (!r.ok) { dialog.toast("No se pudo guardar la elección de másteres.", "error"); return; }
      dialog.toast("Elección de másteres guardada.", "success");
      setElecciones(payload);
      setPostulacionesKey((k) => k + 1);
    } catch {
      dialog.toast("Error al guardar elección de másteres.", "error");
    } finally {
      setSavingElecciones(false);
    }
  }

  const tipoNombre = (detalle?.tipo?.nombre || "").toLowerCase().trim();
  const esVisado = tipoNombre === "visado";

  const planCCAAs = useMemo(() => {
    if (!detalle) return null;
    const ccaas = Array.isArray(detalle.tipo?.ccaas) ? detalle.tipo.ccaas : [];
    if (ccaas.length === 0) return null;
    return {
      bloqueado: detalle.tipo?.ccaa_bloqueado ?? false,
      opciones:  ccaas.map((c) => c.comunidad.nombre),
    };
  }, [detalle]);

  // ── Datos para la barra lateral ──────────────────────────────────────────────

  const docsListas = checklist.filter((it) =>
    ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
  ).length;

  const eleccionesGuardadas = elecciones.filter((e) => e.id_master).length;
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;

  // Los seis pasos del servicio, los mismos que ve el asesor en Inspira Core
  // (08/09/2026). Los instructivos van dentro de Documentos; los portales y
  // los documentos del proceso, dentro de Postulaciones; los mensajes son un
  // botón siempre a mano, no un paso.
  const navSections = [
    {
      id:       "docs",
      num:      1,
      icono:    "folder",
      titulo:   "Documentos",
      subtitulo: checklist.length ? `${docsListas} de ${checklist.length} listos` : null,
      estado:   checklist.length ? (docsListas === checklist.length ? "completado" : "pendiente") : null,
      show:     true,
    },
    {
      id:       "form",
      num:      2,
      icono:    "fileText",
      titulo:   "Formulario académico",
      subtitulo: formGuardado ? "Datos guardados" : "Pendiente",
      estado:   formGuardado ? "completado" : "pendiente",
      show:     true,
    },
    {
      id:       "informe",
      num:      3,
      icono:    "chart",
      titulo:   "Informe de másteres",
      subtitulo: compat?.estado === "en_creacion" ? "En preparación"
               : compat?.total != null ? `${compat.total} programas`
               : detalle?.informe_fecha_subida ? "PDF disponible"
               : loadingCompat ? "Calculando…" : "Pendiente",
      estado:   detalle?.informe_fecha_subida ? "completado"
              : compat?.estado === "en_creacion" ? "pendiente"
              : compat?.total != null ? "completado"
              : loadingCompat ? "cargando"
              : formGuardado ? "pendiente" : null,
      show:     !esVisado,
    },
    {
      id:       "eleccion",
      num:      4,
      icono:    "checkCircle",
      titulo:   "Elección de másteres",
      subtitulo: eleccionesGuardadas > 0 ? `${eleccionesGuardadas} seleccionados${elecciones.some((e) => e.plan_incluido != null) ? " · revisados por tu asesor" : ""}` : "Pendiente",
      estado:   eleccionesGuardadas > 0 ? "completado" : formGuardado ? "pendiente" : null,
      show:     !esVisado,
    },
    {
      id:       "post",
      num:      5,
      icono:    "cap",
      titulo:   "Postulaciones",
      subtitulo: "Seguimiento, accesos y documentos",
      estado:   null,
      show:     !esVisado,
    },
    {
      id:       "cierre",
      num:      6,
      icono:    "flag",
      titulo:   "Cierre y visado",
      subtitulo: null,
      estado:   null,
      show:     !esVisado,
    },
  ].filter((s) => s.show);

  // Una sección que no existe para este expediente —un enlace viejo, un
  // tipo de servicio distinto— cae en la primera en vez de en una pantalla vacía.
  const activeSection = navSections.some((x) => x.id === seccion) ? seccion : navSections[0]?.id;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Fila superior: botón volver + encabezado compacto */}
      <div className="shrink-0 flex items-center gap-3 mb-3">
        <button
          onClick={onVolver}
          className="shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light active:scale-95 transition-all shadow-sm group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Mis servicios
        </button>


        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && detalle && (
          <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-4 py-2.5 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest leading-none">
                Solicitud #{detalle.id_solicitud}
              </p>
              <p className="text-sm font-bold text-neutral-900 leading-snug truncate mt-0.5">
                {detalle.tipo?.nombre || "—"}
              </p>
            </div>
            <div className="shrink-0 hidden sm:block w-32">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-neutral-500 font-medium">Progreso</span>
                <span className="font-bold text-neutral-800">{progresoChecklist}%</span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-accent"
                  style={{ width: `${progresoChecklist}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <EsqueletoExpediente />}

      {/* Panel principal */}
      {!loading && !error && detalle && (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">

          {/* ── Desktop: sidebar vertical ── */}
          <div className="hidden md:flex w-52 shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm p-2 flex-col gap-0.5 overflow-y-auto">
            {navSections.map((s) => (
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

          {/* ── Contenido de la sección activa. La clave por sección hace que
              cada una entre con su transición; el expediente no se remonta. ── */}
          <div key={activeSection} className="pnl-entra flex-1 min-h-0 overflow-hidden flex flex-col">
            <SeccionSiempreAbiertoCtx.Provider value={true}>

              {activeSection === "docs" && (
                <ChecklistDocumentos
                  checklist={checklist}
                  cargarTodo={cargarTodo}
                  idSolicitud={idSolicitud}
                  revisionSolicitadaAt={detalle?.datos_panel?.revision_solicitada_at || null}
                  guiaMaster={!esVisado}
                  instructivos={instructivos}
                  onIrAGuia={onIrAGuia}
                />
              )}

              {activeSection === "form" && (
                <FormularioDatosAcademicos
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmitFormulario={handleSubmitFormulario}
                  onGuardarProgreso={guardarFormularioSilencioso}
                  savingForm={savingForm}
                  hasData={formGuardado}
                  planCCAAs={planCCAAs}
                />
              )}

              {activeSection === "informe" && !esVisado && (
                <InformeBusqueda
                  idSolicitud={idSolicitud}
                  informe={{
                    informe_nombre_original: detalle.informe_nombre_original,
                    informe_fecha_subida:    detalle.informe_fecha_subida,
                  }}
                  hasFormData={formGuardado}
                  compat={compat}
                  loadingCompat={loadingCompat}
                />
              )}

              {activeSection === "eleccion" && !esVisado && (
                <EleccionMastersCliente
                  elecciones={elecciones}
                  onGuardar={handleGuardarElecciones}
                  saving={savingElecciones}
                  idSolicitud={idSolicitud}
                  hasFormData={formGuardado}
                  compat={compat}
                  loadingCompat={loadingCompat}
                  resetKey={seleccionKey}
                />
              )}

              {/* Postulaciones: todo el trámite en un solo sitio. El seguimiento
                  de cada máster, los accesos a los portales y los documentos
                  que Inspira va consiguiendo (carta de admisión, matrícula). */}
              {activeSection === "post" && !esVisado && (
                <SeccionPanel
                  numero="5"
                  titulo="Postulaciones"
                  subtitulo="Seguimiento de cada máster, accesos a los portales y documentos del proceso"
                  sectionId="5"
                >
                  <div className="space-y-7">
                    <ProgramacionPostulacionesCliente
                      idSolicitud={idSolicitud}
                      resetKey={seleccionKey}
                      reloadKey={postulacionesKey}
                      sinMarco
                    />
                    <PortalesYJustificantesCliente idSolicitud={idSolicitud} sinMarco />
                    <DocumentosProceso idSolicitud={idSolicitud} modo="cliente" />
                  </div>
                </SeccionPanel>
              )}

              {activeSection === "cierre" && !esVisado && (
                <CierreServicioMasterCliente idSolicitud={idSolicitud} />
              )}

            </SeccionSiempreAbiertoCtx.Provider>
          </div>

          {/* Móvil: el selector de sección, abajo. */}
          <SelectorSeccionMovil secciones={navSections} activa={activeSection} onCambiar={setActiveSection} />

          {/* Los mensajes ya no son un paso: están siempre a mano, en
              cualquier sección, con lo que queda por leer encima. */}
          <MensajesFlotante
            abierto={mensajesAbierto}
            onAbrir={() => setMensajesAbierto(true)}
            onCerrar={() => setMensajesAbierto(false)}
            sinLeer={sinLeer}
            idSolicitud={idSolicitud}
          />
        </div>
      )}
    </div>
  );
}
