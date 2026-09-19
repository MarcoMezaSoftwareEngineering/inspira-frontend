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
import DocumentosProceso from "../../../../components/common/DocumentosProceso";
import CierreServicioMasterCliente from "./sections/CierreServicioMasterCliente";
import { EsqueletoExpediente } from "../Esqueleto";
import CercoErrores from "../../../../components/common/CercoErrores";
import MensajesFlotante from "./MensajesFlotante";
import { RutaPasos, TituloPaso, LeToca, ExpedienteCabecera, tonoDeEstado } from "../../../../components/common/RutaPasos";
import QueMeFalta from "../QueMeFalta";
import { queMeFaltaMaster } from "../../queMeFalta";
import { navigate } from "../../../../services/navigate";
import { rutaDe } from "../../ruta";
import { usePublicarCabecera } from "../../cabeceraExpediente";
import NovedadesExpediente from "../NovedadesExpediente";

// Nombre corto de cada paso para la fila de iconos del móvil.
const CORTO = { docs: "Documentos", form: "Formulario", informe: "Informe", eleccion: "Elección", post: "Postular", cierre: "Cierre" };

// «Inicio previsto» del perfil («Septiembre 2027») en el formato del
// formulario académico (`sep_2027`). Es el espejo de perfilAFormulario en el
// backend (perfil.campos.js). Los meses sin opción en el formulario devuelven
// "" y el formulario se queda con lo suyo.
function inicioParaFormulario(valor) {
  const s = String(valor || "").trim();
  if (!s) return "";
  if (/^(sep|ene)_\d{4}$|^flexible$/.test(s)) return s;
  const [mes, anio] = s.split(/\s+/);
  if (!/^\d{4}$/.test(anio || "")) return "";
  if (mes === "Septiembre") return `sep_${anio}`;
  if (mes === "Enero") return `ene_${anio}`;
  return "";
}

function inicialesDe(nombre) {
  return String(nombre || "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "•";
}

// Lo primero que le toca hacer al asesorado, dicho una vez y arriba: un
// documento observado o pedido, el formulario, lo que falta por subir, o
// marcar el informe. Si nada, se le dice que está al día y quién vigila.
function calcularLeToca({ checklist, formGuardado, compat, elecciones }) {
  const items = checklist || [];
  const estadoDe = (it) => (it.estado_item || "pendiente").toLowerCase();
  const obs = items.find((it) => ["observado", "rechazado"].includes(estadoDe(it)));
  if (obs) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `corregir «${obs.item?.nombre_item}»`, seccion: "docs" };
  const pedido = items.find((it) => estadoDe(it) === "solicitado" && !(it.documentos || []).length);
  if (pedido) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `subir «${pedido.item?.nombre_item}», que te pidió tu asesor`, seccion: "docs" };
  if (!formGuardado) return { tono: "on", icono: "fileText", etiqueta: "Te toca:", texto: "completar el formulario académico para preparar tu informe", seccion: "form" };
  const falta = items.find((it) => it.item?.obligatorio !== false && estadoDe(it) === "pendiente" && !(it.documentos || []).length);
  if (falta) return { tono: "on", icono: "upload", etiqueta: "Te toca:", texto: `subir «${falta.item?.nombre_item}»`, seccion: "docs" };
  const elegidos = (elecciones || []).filter((e) => e.id_master).length;
  if (compat?.total && !elegidos) return { tono: "on", icono: "checkCircle", etiqueta: "Te toca:", texto: "marcar en el informe los másteres que te interesan", seccion: "informe" };
  return { tono: "ok", icono: "check", etiqueta: "Todo al día.", texto: "Tu asesor vigila los portales y te avisará por mensaje.", seccion: null };
}

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

// ── Mensajes, siempre a mano ─────────────────────────────────────────────────
// El botón flotante y la hoja con el hilo viven en MensajesFlotante.jsx
// (18/09/2026): el doctorado los usa también.

// ── Componente principal ──────────────────────────────────────────────────────

export default function DetalleSolicitud({ solicitudBase, onIrAGuia, seccion, onSeccion, perfil, faltanPerfil = 0, onPerfilCambiado }) {
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
      // El perfil es la fuente única de lo que comparten (backend:
      // perfil.campos.js): se lee de allí primero y, al guardar, lo que cambie
      // aquí sube al perfil (perfilSync.js, el último dato guardado gana).
      // Antes mandaba el formulario, y quien corregía su carrera en «Mi
      // perfil» seguía viéndola vieja aquí.
      const delPerfil = (clave) => {
        const v = datosPerfil[clave];
        return v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "";
      };
      const merged = {
        ...datosForm,
        carrera_titulo:     delPerfil("carrera_titulo")     || datosForm.carrera_titulo     || "",
        area_carrera:       delPerfil("area_carrera")       || datosForm.area_carrera       || "",
        universidad_origen: delPerfil("universidad_origen") || datosForm.universidad_origen || "",
        presupuesto_hasta:  delPerfil("presupuesto_hasta")  || datosForm.presupuesto_hasta  || "",
        // El perfil guarda «Septiembre 2027» y el formulario «sep_2027».
        inicio_previsto:    inicioParaFormulario(datosPerfil.inicio_previsto) || datosForm.inicio_previsto || "",
      };
      for (const k of ["presupuesto_hasta", "inicio_previsto"]) if (!merged[k]) delete merged[k];
      setFormData(merged);

      if (formCompleto(merged)) setFormGuardado(true);
      // El informe se pide siempre: si el asesor lo publicó con un formulario
      // a medias (o lo rellenó él desde Core), el asesorado tiene que verlo.
      const tipoN = String(rDetalle.ok ? rDetalle.solicitud?.tipo?.nombre || "" : "").toLowerCase().trim();
      if (tipoN !== "visado") cargarCompatibilidad();

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
      // Lo que cambió aquí ya está en su perfil (perfilSync): el panel lo
      // vuelve a leer para que «Mi perfil» y el próximo formulario lo vean.
      onPerfilCambiado?.();
    } catch {
      dialog.toast("Error al guardar.", "error");
    } finally {
      setSavingForm(false);
    }
  }

  async function guardarFormularioSilencioso() {
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/formulario`, formData);
      if (r?.ok) onPerfilCambiado?.();
    } catch { /* silencioso */ }
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

  // La fila de pasos, el título del activo y lo que toca hacer.
  const pasosRuta = navSections.map((s) => ({
    id: s.id, num: s.num, icono: s.icono, titulo: s.titulo, corto: CORTO[s.id] || s.titulo,
    subtitulo: s.subtitulo, estado: tonoDeEstado(s.estado), badge: s.badge || 0,
  }));
  const indicePaso = Math.max(0, navSections.findIndex((s) => s.id === activeSection));
  const pasoActivo = pasosRuta[indicePaso];
  const pctPasos = navSections.length
    ? Math.round((navSections.filter((s) => s.estado === "completado").length / navSections.length) * 100)
    : 0;

  // La barra de arriba del panel dice qué expediente es y cuánto lleva.
  usePublicarCabecera({
    // El curso va en la barra: en el teléfono la tarjeta que lo decía no sale.
    eyebrow: detalle
      ? `Solicitud #${detalle.id_solicitud}${detalle.datos_panel?.curso_objetivo ? ` · Curso ${detalle.datos_panel.curso_objetivo}` : ""}`
      : null,
    titulo: detalle?.tipo?.nombre || solicitudBase?.titulo || null,
    pct: detalle ? pctPasos : null,
  });
  const lineaExp = detalle?.datos_panel?.curso_objetivo
    ? `Curso ${detalle.datos_panel.curso_objetivo} · tu expediente, paso a paso`
    : "Tu expediente, paso a paso";
  const leToca = calcularLeToca({ checklist, formGuardado, compat, elecciones });
  const falta = queMeFaltaMaster({
    checklist, formGuardado, compat, elecciones, resumen: solicitudBase?.resumen, faltanPerfil,
    ir: { seccion: (s) => setActiveSection(s), perfil: () => navigate(rutaDe({ tab: "perfil" })) },
  });

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">

      {/* Fila superior: volver y, si lo hay, el error. */}
      {/* Volver vive en la barra de arriba del panel. */}
      <div className="shrink-0 flex items-center gap-3 mb-3 empty:hidden">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Móvil y tablet: la cabecera del expediente y la fila de pasos, arriba.
          En pantalla grande van en la columna de la izquierda. */}
      {!loading && !error && detalle && (
        <div className="lg:hidden shrink-0 mb-3 space-y-3">
          <div className="pnl-solo-grande">
            <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${detalle.id_solicitud}`} titulo={detalle.tipo?.nombre || "—"} linea={lineaExp} pct={pctPasos} />
          </div>
          <RutaPasos pasos={pasosRuta} activo={activeSection} onIr={setActiveSection} />
        </div>
      )}

      {loading && <EsqueletoExpediente />}

      {/* Panel principal */}
      {!loading && !error && detalle && (
        <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">

          {/* ── Pantalla grande: columna con la cabecera y los pasos ── */}
          <div className="hidden lg:flex w-[290px] shrink-0 flex-col gap-3 overflow-y-auto pr-0.5">
            <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${detalle.id_solicitud}`} titulo={detalle.tipo?.nombre || "—"} linea={lineaExp} pct={pctPasos} />
            <RutaPasos pasos={pasosRuta} activo={activeSection} onIr={setActiveSection} vertical />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-3 lg:min-h-0">
          {/* El paso en el que está y lo primero que le toca hacer. */}
          <div key={`${activeSection}-titulo`} className="shrink-0 space-y-3 rp-entra">
            <TituloPaso paso={pasoActivo} total={navSections.length} indice={indicePaso + 1} />
            <LeToca
              tono={leToca.tono}
              icono={leToca.icono}
              etiqueta={leToca.etiqueta}
              texto={leToca.texto}
              onIr={leToca.seccion && leToca.seccion !== activeSection ? () => setActiveSection(leToca.seccion) : null}
            />
            <QueMeFalta resumen={falta.resumen} filas={falta.filas} />
            {/* Qué ha cambiado desde su última visita. */}
            <NovedadesExpediente idSolicitud={idSolicitud} />
          </div>

          {/* ── Contenido de la sección activa. La clave por sección hace que
              cada una entre con su transición; el expediente no se remonta. ── */}
          <div key={activeSection} className="pnl-entra flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            <CercoErrores clave={activeSection} donde={`panel/${activeSection}`} onVolver={() => setActiveSection("docs")}>
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
                    <DocumentosProceso idSolicitud={idSolicitud} modo="cliente" />
                  </div>
                </SeccionPanel>
              )}

              {activeSection === "cierre" && !esVisado && (
                <CierreServicioMasterCliente idSolicitud={idSolicitud} />
              )}

            </SeccionSiempreAbiertoCtx.Provider>
            </CercoErrores>
          </div>
          </div>

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
