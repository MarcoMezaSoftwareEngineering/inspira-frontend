// src/pages/backoffice/solicitudes/components/InformeAdmin.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPATCH, boPOST, boUpload } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { API_URL, formatearFecha } from "../utils";
import ModalMaster from "../../catalogo/ModalMaster";
import BaremoMaster from "../../../../components/BaremoMaster";

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s == null) return "text-neutral-400";
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-amber-600";
  return "text-red-500";
}

function scoreStroke(s) {
  if (s == null) return "#e5e7eb";
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#f59e0b";
  return "#ef4444";
}

function scoreChip(s) {
  if (s == null) return "bg-neutral-100 text-neutral-500 border-neutral-200";
  if (s >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-600 border-red-200";
}

function durLabel(anios) {
  if (anios === 1) return "1 año";
  if (anios === 1.5) return "18 meses";
  if (anios) return `${anios} años`;
  return null;
}

// ── Score ring SVG ─────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 16;
  const circ = 2 * Math.PI * r; // ≈ 100.53
  const pct = score != null ? score : 0;
  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke={scoreStroke(score)}
          strokeWidth="3.5"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-[10px] font-black leading-none ${scoreColor(score)}`}>
          {score != null ? score : "—"}
        </span>
      </div>
    </div>
  );
}

// ── Master row ─────────────────────────────────────────────────────────────────

export function MasterRowAdmin({ posicion, resultado, editMode, onArriba, onAbajo, onEliminar, onScoreChange, esFirst, esLast }) {
  const { master, score } = resultado;
  const dur = durLabel(master.duracion_anios);
  const precioFinal = master.precio_final != null
    ? { texto: `€${Math.round(master.precio_final).toLocaleString("es-ES")}`, esRef: false }
    : master.precio_total_estimado != null
    ? { texto: `€${Math.round(master.precio_total_estimado).toLocaleString("es-ES")}`, esRef: true }
    : null;

  const numBg =
    posicion === 1 ? "bg-[#1A3557] text-white"
    : posicion === 2 ? "bg-[#1D6A4A] text-white"
    : posicion === 3 ? "bg-amber-400 text-white"
    : "bg-neutral-100 text-neutral-500";

  return (
    // `min-w-0` en la propia fila: como hija de una rejilla o de un flex, sin
    // esto su mínimo es el ancho natural del contenido y se sale del móvil
    // por la derecha en vez de encoger.
    <div className={`group relative flex items-start gap-3 min-w-0 w-full p-3 sm:p-3.5 rounded-2xl transition-all duration-200 ${
      editMode
        ? "ux-tarjeta"
        : "border border-transparent hover:bg-neutral-50/80 md:rounded-xl"
    }`}>

      {/* Reorder arrows */}
      {editMode && (
        <div className="flex flex-col gap-0.5 shrink-0 transition-opacity opacity-40 group-hover:opacity-100">
          <button onClick={onArriba} disabled={esFirst}
            className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-150">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={onAbajo} disabled={esLast}
            className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-150">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Número posición */}
      <div className={`shrink-0 w-6 h-6 mt-0.5 rounded-full text-[11px] font-bold flex items-center justify-center ${numBg}`}>
        {posicion}
      </div>

      {/* Datos máster */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] sm:text-[13px] font-semibold text-[#1A3557] leading-snug">{master.nombre_limpio}</p>
        <p className="text-[11.5px] text-neutral-500 leading-snug mt-1 truncate">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
          {master.universidad.comunidad ? ` · ${master.universidad.comunidad?.nombre ?? master.universidad.comunidad}` : ""}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {precioFinal && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              precioFinal.esRef
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-neutral-100 text-neutral-500"
            }`}>
              {precioFinal.texto}{precioFinal.esRef ? " (ref.)" : ""}
            </span>
          )}
          {dur && (
            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md">{dur}</span>
          )}
          {master.afinidad_deseada === "fuerte" && (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md">
              lo pidió por su nombre
            </span>
          )}
          {master.es_titulo_oficial === false && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
              título propio
            </span>
          )}
          {!editMode && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(score)}`}>
              {score != null ? `${score}% match` : "Sin score"}
            </span>
          )}
        </div>

        {/* El asesor tiene que poder abrir la ficha desde aquí: es lo que va a
            mirar antes de decidir si el máster entra en el informe, y es el
            mismo enlace que le llegará al asesorado. */}
        {(master.url_ficha || master.universidad?.url) && (
          <a href={master.url_ficha || master.universidad.url}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ux-tap inline-flex items-center gap-1 mt-2 py-1.5 pr-2 text-[11.5px] font-semibold text-[#1D6A4A] hover:underline">
            {master.url_ficha ? "Ver la ficha del máster" : "Ver la web de la universidad"}
            <span aria-hidden="true">↗</span>
          </a>
        )}

        {/* La baremación. En modo edición estorba —ahí se ordena y se puntúa—,
            así que solo se enseña al revisar. */}
        {!editMode && master.baremo?.length > 0 && (
          <BaremoMaster baremo={master.baremo} maxVisible={3} compacto />
        )}
      </div>

      {/* Score: ring en vista, input editable en edición */}
      {editMode ? (
        <div className="shrink-0 flex flex-col items-center gap-0.5 w-14">
          <input
            type="number"
            min="0"
            max="100"
            value={score ?? ""}
            placeholder="—"
            onChange={(e) => {
              const v = e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value)));
              onScoreChange?.(v);
            }}
            className="w-full text-center text-[12px] font-bold border border-neutral-200 rounded-lg px-1 py-1 outline-none focus:border-[#1D6A4A] focus:ring-1 focus:ring-[#1D6A4A]/20 bg-white transition-all"
          />
          <span className="text-[9px] text-neutral-400">match %</span>
        </div>
      ) : (
        <ScoreRing score={score} />
      )}

      {/* Eliminar */}
      {editMode && (
        <button onClick={onEliminar}
          className="shrink-0 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ml-0.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function InformeAdmin({ detalle, recargar, onRegenerado }) {
  const [subiendoInforme, setSubiendoInforme] = useState(false);
  const [compat, setCompat]         = useState(null);
  const [loadingCompat, setLoading] = useState(true);
  const [editMode, setEditMode]     = useState(false);
  const [listaEdit, setListaEdit]   = useState([]);
  const [searchQ, setSearchQ]       = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [showParams, setShowParams] = useState(false);

  // Búsqueda libre contra el catálogo completo
  const [searchResults, setSearchResults]     = useState([]);
  const [searchingMasters, setSearchingMasters] = useState(false);

  // Modal de crear nuevo máster
  const [modalCrear,    setModalCrear]    = useState(false);
  const [catalogData,   setCatalogData]   = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { cargarCompatibilidad(); }, [detalle.id_solicitud]); // eslint-disable-line

  // Búsqueda con debounce contra /backoffice/catalogo/masters
  useEffect(() => {
    if (!editMode) return;
    clearTimeout(debounceRef.current);

    if (searchQ.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingMasters(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await boGET(
          `/backoffice/catalogo/masters?search=${encodeURIComponent(searchQ)}&limit=10&activo=true`
        );
        if (r.ok) {
          const todosCompat = compat?.resultados ?? [];
          const resultados = (r.masters || [])
            .filter((m) => !listaEdit.some((e) => e.master.id_master === m.id_master))
            .map((m) => {
              const compat = todosCompat.find((c) => c.master.id_master === m.id_master);
              return { master: m, score: compat?.score ?? null };
            });
          setSearchResults(resultados);
        }
      } catch { /* silencioso */ }
      finally { setSearchingMasters(false); }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQ, editMode]); // eslint-disable-line

  async function cargarCompatibilidad() {
    setLoading(true);
    try {
      const r = await boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/compatibilidad`);
      if (r.ok) setCompat(r);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }

  async function regenerar() {
    setCompat(null);
    setEditMode(false);
    setListaEdit([]);
    await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: null });
    await cargarCompatibilidad();
    await recargar();
    onRegenerado?.();
  }

  function entrarEdicion() {
    const base = detalle.informe_compat_curado ?? compat?.resultados?.slice(0, 20) ?? [];
    setListaEdit(base.map((r) => ({ ...r })));
    setEditMode(true);
    setSearchQ("");
    setSearchResults([]);
  }

  function moverArriba(idx) {
    if (idx === 0) return;
    const l = [...listaEdit];
    [l[idx - 1], l[idx]] = [l[idx], l[idx - 1]];
    setListaEdit(l);
  }

  function moverAbajo(idx) {
    if (idx === listaEdit.length - 1) return;
    const l = [...listaEdit];
    [l[idx], l[idx + 1]] = [l[idx + 1], l[idx]];
    setListaEdit(l);
  }

  function eliminarItem(idx) {
    setListaEdit((prev) => prev.filter((_, i) => i !== idx));
  }

  function añadirItem(r) {
    if (listaEdit.some((e) => e.master.id_master === r.master.id_master)) return;
    setListaEdit((prev) => [...prev, r]);
    setSearchQ("");
    setSearchResults([]);
    searchRef.current?.focus();
  }

  function cambiarScore(idx, valor) {
    setListaEdit((prev) => prev.map((item, i) => i === idx ? { ...item, score: valor } : item));
  }

  async function abrirModalCrear() {
    if (catalogData) { setModalCrear(true); return; }
    setLoadingCatalog(true);
    try {
      const [rRamas, rCom, rUni] = await Promise.all([
        boGET("/backoffice/catalogo/ramas"),
        boGET("/backoffice/catalogo/comunidades"),
        boGET("/backoffice/catalogo/universidades"),
      ]);
      setCatalogData({
        ramas:         rRamas.ok  ? rRamas.ramas         : [],
        comunidades:   rCom.ok    ? rCom.comunidades      : [],
        universidades: rUni.ok    ? rUni.universidades    : [],
      });
      setModalCrear(true);
    } catch { dialog.toast("Error cargando catálogo", "error"); }
    finally { setLoadingCatalog(false); }
  }

  async function onMasterCreado(masterRaw) {
    setModalCrear(false);
    if (!masterRaw?.id_master) return;
    try {
      const r = await boGET(`/backoffice/catalogo/masters/${masterRaw.id_master}`);
      if (r.ok && r.master) {
        añadirItem({ master: r.master, score: null });
      }
    } catch { /* si falla solo no lo agrega */ }
  }


  const [revisando, setRevisando] = useState(false);
  const revision = detalle.informe_revision_estado || "BORRADOR";

  /** Se lo manda a quien tiene que darle el visto bueno. */
  async function mandarARevision() {
    setRevisando(true);
    const r = await boPOST(
      `/backoffice/solicitudes/${detalle.id_solicitud}/informe/revision`,
      { filtros: filtros || null },
    );
    setRevisando(false);
    if (r?.ok) { dialog.toast(`Avisado a ${r.avisado_a}`, "success"); recargar?.(); }
    else dialog.toast(r?.msg || "No se pudo mandar a revisión", "error");
  }

  /** Aprobar, o devolverlo diciendo qué corregir. */
  async function resolverRevision(estado) {
    let nota = null;
    if (estado === "DEVUELTO") {
      nota = window.prompt("¿Qué hay que corregir?");
      if (!nota?.trim()) return;
    }
    setRevisando(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${detalle.id_solicitud}/informe/revision`,
      { estado, nota },
    );
    setRevisando(false);
    if (r?.ok) {
      dialog.toast(estado === "APROBADO" ? "Informe aprobado" : "Devuelto con observaciones", "success");
      recargar?.();
    } else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }
  async function publicarInforme() {
    setPublicando(true);
    try {
      const listaParaPublicar = listaEdit.length
        ? listaEdit
        : (detalle.informe_compat_curado ?? compat?.resultados?.slice(0, 20) ?? []);
      if (listaParaPublicar.length) {
        await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: listaParaPublicar });
      }
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/publicar-informe`, {});
      if (!r.ok) throw new Error(r.msg || "Error al publicar");
      await recargar();
      dialog.toast("Informe publicado · Cliente notificado por email", "success");
    } catch (e) { dialog.toast(e.message || "Error al publicar", "error"); }
    finally { setPublicando(false); }
  }

  async function guardarCurado() {
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, {
        lista: listaEdit,
      });
      if (!r.ok) throw new Error(r.msg || "Error al guardar");
      await recargar();
      setEditMode(false);
    } catch (e) { dialog.toast(e.message || "Error al guardar", "error"); }
    finally { setGuardando(false); }
  }

  async function restaurarAuto() {
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: null });
      if (!r.ok) throw new Error(r.msg || "Error al restaurar");
      await recargar();
    } catch (e) { dialog.toast(e.message || "Error al restaurar", "error"); }
    finally { setGuardando(false); }
  }

  async function handleUploadInforme(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoInforme(true);
    try {
      const r = await boUpload(`/api/admin/solicitudes/${detalle.id_solicitud}/informe`, file);
      if (!r.ok) { dialog.toast(r.msg || "No se pudo subir el informe", "error"); return; }
      await recargar();
    } finally { setSubiendoInforme(false); }
  }

  async function manejarInformeAdmin(modo) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) { dialog.toast("No existe sesión de backoffice", "error"); return; }
      const resp = await fetch(
        `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) { dialog.toast("No se pudo obtener el informe", "error"); return; }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = detalle.informe_nombre_original || "informe";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      dialog.toast("Error al abrir/descargar el informe", "error");
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const datos     = detalle?.datos_formulario || {};
  const planLabel = detalle?.titulo || "Plan contratado";
  const filtros   = [
    datos.comunidades_preferidas
      ? (Array.isArray(datos.comunidades_preferidas)
          ? datos.comunidades_preferidas.join(", ")
          : datos.comunidades_preferidas)
      : null,
    datos.presupuesto_hasta
      ? `Máx. ${Number(datos.presupuesto_hasta).toLocaleString("es-ES")} €`
      : null,
  ].filter(Boolean).join(" · ");

  const listaVista  = detalle.informe_compat_curado ?? compat?.resultados?.slice(0, 20) ?? [];
  const isCurado    = !!detalle.informe_compat_curado;

  // Lo que el asesorado escribió a mano va primero: es lo que de verdad busca.
  const lista = (v) => (Array.isArray(v) && v.filter(Boolean).length ? v.filter(Boolean).join(" · ") : null);
  const paramRows = [
    ["Máster que busca",   lista(datos.masteres_deseados)],
    ["Especialización",    lista(datos.especializaciones)],
    ["Rama del máster",    compat?.perfil?.rama_label    || datos.area_interes_master],
    ["Sub-área",           compat?.perfil?.sub_area_label || null],
    ["Área de carrera",    datos.area_carrera],
    ["Promedio",           datos.promedio_peru ? `${datos.promedio_peru} / ${datos.promedio_escala || 10}` : null],
    ["Posición académica", datos.ubicacion_grupo],
    ["Experiencia",        datos.experiencia_anios],
    ["Vinculada al área",  datos.experiencia_vinculada],
    ["Inglés",             datos.ingles_situacion],
    ["Objetivo",           datos.objetivo_master],
    ["Investigación",      datos.investigacion_experiencia],
    ["Modalidad",          datos.modalidad_preferida],
    ["Duración",           datos.duracion_preferida],
    ["Prácticas",          datos.practicas_preferencia],
    ["Presupuesto",        datos.presupuesto_hasta ? `€${Number(datos.presupuesto_hasta).toLocaleString("es-ES")}` : null],
    ["CCAA preferidas",    compat?.perfil?.ccaa?.join(", ")],
  ];

  const showDropdown = searchQ.length >= 2;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0 -mx-5 -mt-4 overflow-hidden">

      {/* ── Banner IA ────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-5" style={{ background: "linear-gradient(135deg, #1D6A4A 0%, #1A3557 100%)" }}>
        <div className="flex items-start gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-lg shrink-0">
            ✦
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-white mb-0.5">Generador de Informe con IA</p>
            <p className="text-xs text-white/60">{filtros ? `Filtros: ${filtros}` : planLabel}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {planLabel && (
              <span className="bg-[#F5C842] text-[#1A3557] text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                📦 {planLabel}
              </span>
            )}
            <button onClick={regenerar} disabled={loadingCompat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/12 text-white/80 border border-white/20 hover:bg-white/22 transition-all duration-200 disabled:opacity-50 shrink-0">
              <svg className={`w-3 h-3 ${loadingCompat ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerar
            </button>
          </div>
        </div>

        {/* Stats rápidas */}
        {!loadingCompat && compat && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5">
              <span className="text-white/50 text-[10px]">Programas totales</span>
              <span className="text-white font-bold text-[11px]">{compat.total}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5">
              <span className="text-white/50 text-[10px]">En informe</span>
              <span className="text-white font-bold text-[11px]">{listaVista.length}</span>
            </div>
            {listaVista.length > 0 && !detalle.informe_publicado && (
              <div className="flex items-center gap-1.5 bg-[#F5C842]/20 border border-[#F5C842]/30 rounded-lg px-2.5 py-1.5">
                <span className="text-[#F5C842] text-[10px] font-semibold">✏️ Lista curada · Sin publicar</span>
              </div>
            )}

            {!detalle.informe_publicado && revision === "EN_REVISION" && (
              <span className="text-[#1A3557] bg-[#EEF2F8] border border-[#1A3557]/25
                px-1.5 py-0.5 rounded text-[10px] font-semibold">
                ⏳ En revisión
              </span>
            )}
            {!detalle.informe_publicado && revision === "APROBADO" && (
              <span className="text-[#14532d] bg-[#E8F5EE] border border-[#1D6A4A]/35
                px-1.5 py-0.5 rounded text-[10px] font-semibold">
                ✓ Aprobado · listo para publicar
              </span>
            )}
            {!detalle.informe_publicado && revision === "DEVUELTO" && (
              <span className="text-amber-800 bg-amber-50 border border-amber-300
                px-1.5 py-0.5 rounded text-[10px] font-semibold"
                title={detalle.informe_revision_nota || ""}>
                ↩ Devuelto · hay que corregirlo
              </span>
            )}
            {detalle.informe_publicado && (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-2.5 py-1.5">
                <span className="text-emerald-300 text-[10px] font-semibold">✓ Publicado al cliente</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PDF manual ────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-4 border-b border-neutral-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {detalle.informe_fecha_subida ? (
            <p className="text-xs text-neutral-500">
              PDF subido el <span className="font-medium text-neutral-700">{formatearFecha(detalle.informe_fecha_subida)}</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-400 italic">Aún no se ha subido un PDF de informe.</p>
          )}
          <label className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer font-medium transition-all duration-200">
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {subiendoInforme ? "Subiendo…" : "Subir / reemplazar PDF"}
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
              onChange={handleUploadInforme} />
          </label>
        </div>

        {detalle.informe_fecha_subida && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 border border-neutral-100 rounded-xl bg-neutral-50/70 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">
                  {detalle.informe_nombre_original || "Informe de búsqueda"}
                </p>
                <p className="text-xs text-neutral-500">{formatearFecha(detalle.informe_fecha_subida)}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => manejarInformeAdmin("ver")}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-white transition-all duration-200">
                Ver
              </button>
              <button type="button" onClick={() => manejarInformeAdmin("descargar")}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition-all duration-200">
                Descargar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal crear máster ────────────────────────────────────── */}
      {modalCrear && catalogData && (
        <ModalMaster
          item={null}
          universidades={catalogData.universidades}
          comunidades={catalogData.comunidades}
          ramas={catalogData.ramas}
          onClose={() => setModalCrear(false)}
          onSaved={onMasterCreado}
        />
      )}

      {/* ── Compatibilidad automática ─────────────────────────────── */}
      <div className="px-5 pt-4 pb-5">

        {/* Header controles */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            Compatibilidad automática
          </p>
          <div className="flex gap-1.5 shrink-0">
            {!editMode ? (
              <>
                {!loadingCompat && (
                  <>
                    <button onClick={abrirModalCrear} disabled={loadingCatalog}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#E8F5EE] transition-all duration-200 font-semibold disabled:opacity-50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {loadingCatalog ? "Cargando…" : "Nuevo máster"}
                    </button>
                    <button onClick={entrarEdicion}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-[#1A3557] text-white hover:bg-[#22456e] transition-all duration-200 font-semibold">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modificar lista
                    </button>
                  </>
                )}
                {listaVista.length > 0 && !detalle.informe_publicado
                  && ["BORRADOR", "DEVUELTO"].includes(revision) && (
                  <button onClick={mandarARevision} disabled={revisando}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg
                      bg-[#1A3557] text-white hover:opacity-90 disabled:opacity-50 font-semibold">
                    {revisando ? "Avisando…" : "Mandar a revisión"}
                  </button>
                )}

                {listaVista.length > 0 && revision === "EN_REVISION" && (
                  <>
                    <button onClick={() => resolverRevision("APROBADO")} disabled={revisando}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg
                        bg-[#1D6A4A] text-white hover:opacity-90 disabled:opacity-50 font-semibold">
                      Aprobar
                    </button>
                    <button onClick={() => resolverRevision("DEVUELTO")} disabled={revisando}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg
                        border border-amber-300 text-amber-800 hover:bg-amber-50
                        disabled:opacity-50 font-semibold">
                      Devolver
                    </button>
                  </>
                )}

                {listaVista.length > 0 && (
                  <button onClick={publicarInforme} disabled={publicando}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 font-semibold">
                    {publicando ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    {detalle.informe_publicado ? "Volver a publicar" : "Publicar al cliente"}
                  </button>
                )}
                {listaVista.length > 0 && !detalle.informe_publicado && revision !== "APROBADO" && (
                  <span className="text-[10.5px] text-amber-700 leading-tight max-w-[220px]">
                    Se puede publicar sin aprobación, pero queda anotado que salió sin revisar.
                  </span>
                )}
              </>
            ) : (
              <>
                <button onClick={() => { setEditMode(false); setSearchQ(""); setSearchResults([]); }}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200">
                  Cancelar
                </button>
                <button onClick={guardarCurado} disabled={guardando}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#175a3d] transition-all duration-200 disabled:opacity-50 font-semibold">
                  {guardando ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Guardando…
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar curaduría
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Banner modo edición */}
        {editMode && (
          <div className="mb-4 flex items-center gap-2.5 bg-[#1A3557]/5 border border-[#1A3557]/15 rounded-xl px-3.5 py-2.5">
            <div className="w-2 h-2 rounded-full bg-[#1D6A4A] animate-pulse shrink-0" />
            <p className="text-[11px] text-[#1A3557] font-medium">
              Modo edición activo · {listaEdit.length} programa{listaEdit.length !== 1 ? "s" : ""} en la lista
            </p>
          </div>
        )}

        {/* Parámetros colapsables */}
        {datos && !editMode && (
          <div className="mb-4">
            <button onClick={() => setShowParams((p) => !p)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 transition-colors duration-150">
              <svg className={`w-3 h-3 transition-transform duration-200 ${showParams ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Parámetros usados en el cálculo
            </button>
            {showParams && (
              <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-[11px]">
                {paramRows.map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2 border-b border-neutral-100 pb-1 last:border-0">
                    <span className="text-neutral-400 shrink-0">{label}</span>
                    <span className="font-medium text-neutral-700 text-right truncate">{val || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cargando */}
        {loadingCompat && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-8 h-8 border-2 border-[#1D6A4A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400">Calculando compatibilidad…</p>
          </div>
        )}

        {/* Sin datos de formulario */}
        {!loadingCompat && !compat && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">🔍</div>
            <p className="text-xs text-neutral-500 max-w-[220px]">
              No se pudo calcular. El cliente quizás no ha completado el formulario.
            </p>
          </div>
        )}

        {/* Sin compatibles */}
        {!loadingCompat && compat && compat.total === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">📭</div>
            <p className="text-xs text-neutral-500">Sin programas compatibles. El cliente no ha indicado área de interés.</p>
          </div>
        )}

        {/* Vista normal */}
        {!loadingCompat && !editMode && listaVista.length > 0 && (
          <div className="space-y-0.5">
            {listaVista.map((r, i) => (
              <MasterRowAdmin key={r.master.id_master} posicion={i + 1} resultado={r}
                editMode={false} />
            ))}
          </div>
        )}

        {/* Modo edición */}
        {!loadingCompat && editMode && (
          <div className="space-y-3">

            {/* Buscador libre */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {searchingMasters ? (
                  <svg className="w-3.5 h-3.5 text-[#1D6A4A] animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Buscar cualquier máster del catálogo…"
                className="w-full text-xs pl-8 pr-8 py-2.5 border border-neutral-200 rounded-xl outline-none focus:border-[#1D6A4A] focus:ring-2 focus:ring-[#1D6A4A]/10 bg-white transition-all duration-200"
              />
              {searchQ && (
                <button onClick={() => { setSearchQ(""); setSearchResults([]); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors duration-150">
                  <svg className="w-2.5 h-2.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Dropdown resultados */}
              {showDropdown && !searchingMasters && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                      {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] text-neutral-400">Catálogo completo</p>
                  </div>
                  {searchResults.map((r) => (
                    <button key={r.master.id_master} type="button" onClick={() => añadirItem(r)}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#E8F5EE] transition-colors duration-150 border-b border-neutral-50 last:border-0 group">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-800 group-hover:text-[#1D6A4A] transition-colors leading-tight">
                            {r.master.nombre_limpio}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                            {r.master.universidad.nombre_completo}
                            {r.master.universidad.ciudad ? ` · ${r.master.universidad.ciudad}` : ""}
                            {r.master.universidad.comunidad ? ` · ${r.master.universidad.comunidad?.nombre ?? r.master.universidad.comunidad}` : ""}
                          </p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(r.score)}`}>
                          {r.score != null ? `${r.score}%` : "—"}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-[#1D6A4A] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {showDropdown && !searchingMasters && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 px-4 py-4 text-center">
                  <p className="text-xs text-neutral-400 mb-2">
                    Sin resultados para <span className="font-semibold text-neutral-600">"{searchQ}"</span>
                  </p>
                  <button type="button" onClick={abrirModalCrear} disabled={loadingCatalog}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white text-xs font-semibold hover:bg-[#175a3d] transition disabled:opacity-50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {loadingCatalog ? "Cargando…" : "Crear nuevo máster"}
                  </button>
                </div>
              )}
            </div>

            {/* Crear nuevo máster si no está en el catálogo */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-neutral-400">¿No está en el catálogo?</p>
              <button type="button" onClick={abrirModalCrear} disabled={loadingCatalog}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D6A4A] hover:underline disabled:opacity-50 transition">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {loadingCatalog ? "Cargando…" : "Crear nuevo máster"}
              </button>
            </div>

            {/* Lista editable */}
            <div>
              {listaEdit.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <span className="text-3xl">📋</span>
                  <p className="text-xs text-neutral-400">Lista vacía. Busca y añade programas arriba.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {listaEdit.map((r, i) => (
                    <MasterRowAdmin
                      key={r.master.id_master}
                      posicion={i + 1}
                      resultado={r}
                      editMode={true}
                      esFirst={i === 0}
                      esLast={i === listaEdit.length - 1}
                      onArriba={() => moverArriba(i)}
                      onAbajo={() => moverAbajo(i)}
                      onEliminar={() => eliminarItem(i)}
                      onScoreChange={(v) => cambiarScore(i, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
