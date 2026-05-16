// SeccionMasters.jsx — CRUD Másteres
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET, boPOST, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import {
  RAMAS, MODALIDADES,
  formatPrecio, duracionLabel, activoBadge,
  MODAL_OVERLAY, MODAL_PANEL,
} from "./catalogoConstants";
import ModalMaster from "./ModalMaster";

const RAMA_COLOR = {
  CIENCIAS:                    "bg-cyan-50 text-cyan-700 border-cyan-200",
  CIENCIAS_SALUD:              "bg-rose-50 text-rose-700 border-rose-200",
  CIENCIAS_SOCIALES_JURIDICAS: "bg-blue-50 text-blue-700 border-blue-200",
  INGENIERIA_ARQUITECTURA:     "bg-orange-50 text-orange-700 border-orange-200",
  ARTES_HUMANIDADES:           "bg-violet-50 text-violet-700 border-violet-200",
};

function ramaLabel(val) {
  return RAMAS.find((r) => r.value === val)?.label || val;
}
function modLabel(val) {
  return MODALIDADES.find((m) => m.value === val)?.label || val;
}
function nivelLabel(nivel) {
  const map = { B1:"B1", B2:"B2", C1:"C1", C2:"C2", NATIVO:"Nativo", NO_ESPECIFICADO:"Sin especificar" };
  return map[nivel] || nivel || "—";
}
function categoriaLabel(cat) {
  return CATEGORIAS_CRITERIO.find((c) => c.value === cat)?.label || (cat || "—");
}
function categoriaCls(cat) {
  return CATEGORIAS_CRITERIO.find((c) => c.value === cat)?.color || "bg-neutral-100 text-neutral-600 border-neutral-200";
}

// ── Th sorteable ──────────────────────────────────────────────────────────────
function Th({ col, label, sortCol, sortDir, onSort, right, center }) {
  const active = sortCol === col;
  const align  = right ? "text-right" : center ? "text-center" : "text-left";
  return (
    <th onClick={() => onSort(col)}
      className={`px-3 py-2.5 cursor-pointer select-none whitespace-nowrap hover:bg-neutral-100 transition ${align}`}>
      <span className={`inline-flex items-center gap-1 ${right?"justify-end":center?"justify-center":""}`}>
        {label}
        <span className="text-[9px] text-neutral-300">{active?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>
      </span>
    </th>
  );
}

// ── Badge chip pequeño ─────────────────────────────────────────────────────────
function Chip({ label, color = "neutral" }) {
  const cls = {
    neutral: "bg-neutral-100 text-neutral-600",
    green:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue:    "bg-blue-50 text-blue-700 border border-blue-200",
    red:     "bg-red-50 text-red-600 border border-red-200",
    amber:   "bg-amber-50 text-amber-700 border border-amber-200",
  }[color] || "bg-neutral-100 text-neutral-600";
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${cls}`}>{label}</span>;
}

// ── Modal VER (solo lectura) ──────────────────────────────────────────────────
function ModalVerMaster({ item, onClose, onEditar }) {
  const [detalle,  setDetalle]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    boGET(`/backoffice/catalogo/masters/${item.id_master}`)
      .then((d) => { if (d.ok) setDetalle(d.master); })
      .finally(() => setLoading(false));
  }, [item.id_master]);

  const m          = detalle || item;
  const criterios  = detalle?.criterios || [];
  const idiomas    = detalle?.idiomas   || [];
  const ramaCls    = RAMA_COLOR[m.rama] || "bg-neutral-100 text-neutral-600 border-neutral-200";
  const badge      = activoBadge(m.activo);

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL_PANEL}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Detalle del máster</p>
            <h2 className="text-base font-bold text-neutral-900 leading-snug">{m.nombre_limpio}</h2>
            {m.nombre_original && m.nombre_original !== m.nombre_limpio && (
              <p className="text-xs text-neutral-400 mt-0.5 italic truncate">{m.nombre_original}</p>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition text-sm">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Cargando criterios e idiomas…
            </div>
          )}

          {/* Universidad + CCAA */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold bg-neutral-800 text-white px-2 py-1 rounded-md">{m.universidad?.sigla}</span>
            <span className="text-sm font-semibold text-neutral-700">{m.universidad?.nombre_completo}</span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500">{m.universidad?.comunidad?.nombre}</span>
            <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "ECTS",     value: m.ects },
              { label: "Precio",   value: formatPrecio(m.precio_total_estimado) },
              { label: "Duración", value: duracionLabel(m.duracion_anios) },
              { label: "Modalidad",value: modLabel(m.modalidad) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-neutral-800 tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* Rama + sub-área + tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${ramaCls}`}>
              {ramaLabel(m.rama)}
            </span>
            {m.sub_area?.etiqueta && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-neutral-50 text-neutral-600 border-neutral-300">
                {m.sub_area.etiqueta}
              </span>
            )}
            {m.es_habilitante      && <Chip label="Habilitante"      color="amber" />}
            {m.es_interuniversitario && <Chip label="Interuniversitario" color="blue" />}
            {m.es_dual             && <Chip label="Dual (empresa)"   color="blue" />}
            {m.tiene_practicas === true  && <Chip label="Con prácticas"  color="green" />}
            {m.tiene_practicas === false && <Chip label="Sin prácticas"  color="neutral" />}
          </div>

          {/* Título de acceso */}
          {m.titulo_acceso && (
            <div className="bg-neutral-50 rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Título de acceso</p>
              <p className="text-sm text-neutral-700">{m.titulo_acceso}</p>
            </div>
          )}

          {/* Notas */}
          {m.notas && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-1">Notas internas</p>
              <p className="text-sm text-amber-800">{m.notas}</p>
            </div>
          )}

          {/* Criterios de admisión */}
          {!loading && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Criterios de admisión</p>
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-semibold">{criterios.length}</span>
              </div>
              {criterios.length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                  {criterios.map((c, i) => (
                    <div key={c.id_criterio || i} className="flex items-start gap-3 px-4 py-2.5 text-xs bg-white hover:bg-neutral-50 transition">
                      <span className="shrink-0 text-neutral-300 tabular-nums w-4 text-right">{c.orden ?? i+1}</span>
                      <span className={`shrink-0 border px-1.5 py-0.5 rounded font-semibold text-[10px] whitespace-nowrap ${categoriaCls(c.categoria)}`}>
                        {categoriaLabel(c.categoria)}
                      </span>
                      <span className="flex-1 text-neutral-700 leading-relaxed">{c.descripcion || "—"}</span>
                      {c.peso_porcentaje != null && (
                        <span className="shrink-0 font-bold text-neutral-500 tabular-nums">{c.peso_porcentaje}%</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">Sin criterios registrados.</p>
              )}
            </div>
          )}

          {/* Idiomas */}
          {!loading && idiomas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Idiomas requeridos</p>
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-semibold">{idiomas.length}</span>
              </div>
              <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                {idiomas.map((id, i) => (
                  <div key={id.id_idioma_req || i} className="flex items-center gap-2 px-4 py-2.5 text-xs bg-white flex-wrap">
                    <span className="font-bold text-neutral-800">{id.idioma}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      {nivelLabel(id.nivel_minimo)}
                    </span>
                    {id.es_obligatorio && (
                      <span className="bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">Obligatorio</span>
                    )}
                    {id.peso_porcentaje != null && (
                      <span className="text-neutral-500 tabular-nums">{id.peso_porcentaje}%</span>
                    )}
                    {id.detalle && <span className="text-neutral-400 italic">{id.detalle}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition text-neutral-700">
            Cerrar
          </button>
          <button type="button" onClick={onEditar}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
            Editar máster
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tabla principal ───────────────────────────────────────────────────────────
export default function SeccionMasters({ universidades, comunidades, ramas }) {
  const [masters,    setMasters]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null); // { item } → editar/crear
  const [modalVer,   setModalVer]   = useState(null); // { item } → solo lectura
  const [toggling,   setToggling]   = useState(null);
  const [purging,    setPurging]    = useState(null);
  const [subTab,     setSubTab]     = useState("activos"); // "activos" | "inactivos"

  const [search,       setSearch]       = useState("");
  const [filtroCC,     setFiltroCC]     = useState("");
  const [filtroUniv,   setFiltroUniv]   = useState("");
  const [filtroRama,   setFiltroRama]   = useState("");
  const [filtroMod,    setFiltroMod]    = useState("");
  const [filtroActivo, setFiltroActivo] = useState("true");
  const [sortCol, setSortCol] = useState("nombre_limpio");
  const [sortDir, setSortDir] = useState("asc");

  const searchRef = useRef("");
  const LIMIT = 25;

  const universidadesFiltradas = filtroCC
    ? universidades.filter((u) => String(u.id_comunidad) === String(filtroCC))
    : universidades;

  const fetchMasters = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:           String(overrides.page       ?? page),
        limit:          String(LIMIT),
        search:         overrides.search            !== undefined ? overrides.search      : searchRef.current,
        id_comunidad:   overrides.filtroCC          !== undefined ? overrides.filtroCC    : filtroCC,
        id_universidad: overrides.filtroUniv        !== undefined ? overrides.filtroUniv  : filtroUniv,
        rama:           overrides.filtroRama        !== undefined ? overrides.filtroRama  : filtroRama,
        modalidad:      overrides.filtroMod         !== undefined ? overrides.filtroMod   : filtroMod,
        activo:         overrides.filtroActivo      !== undefined ? overrides.filtroActivo: filtroActivo,
        sortBy:         overrides.sortCol           !== undefined ? overrides.sortCol     : sortCol,
        sortDir:        overrides.sortDir           !== undefined ? overrides.sortDir     : sortDir,
      });
      ["search","id_comunidad","id_universidad","rama","modalidad","activo"].forEach((k) => {
        if (!q.get(k)) q.delete(k);
      });
      const data = await boGET(`/backoffice/catalogo/masters?${q}`);
      if (data.ok) { setMasters(data.masters); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, filtroCC, filtroUniv, filtroRama, filtroMod, filtroActivo, sortCol, sortDir]);

  useEffect(() => { fetchMasters(); }, [fetchMasters]);

  function applySearch() { searchRef.current = search; setPage(1); fetchMasters({ page:1, search }); }
  function resetSearch()  { setSearch(""); searchRef.current = ""; setPage(1); fetchMasters({ page:1, search:"" }); }
  function handleFilter(key, val, setter) { setter(val); setPage(1); fetchMasters({ page:1, [key]: val }); }
  function handleFiltroCC(val) {
    setFiltroCC(val); setFiltroUniv(""); setPage(1);
    fetchMasters({ page:1, filtroCC: val, filtroUniv: "" });
  }
  function handleSort(col) {
    const newDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    setSortCol(col); setSortDir(newDir); setPage(1);
    fetchMasters({ page:1, sortCol: col, sortDir: newDir });
  }
  async function toggleEstado(e, m) {
    e.stopPropagation();
    setToggling(m.id_master);
    try { await boPOST(`/backoffice/catalogo/masters/${m.id_master}/estado`, { activo: !m.activo }); fetchMasters(); }
    finally { setToggling(null); }
  }

  function cambiarSubTab(tab) {
    const activo = tab === "activos" ? "true" : "false";
    setSubTab(tab);
    setFiltroActivo(activo);
    setPage(1);
    fetchMasters({ page: 1, filtroActivo: activo });
  }

  async function purgarMaster(e, m) {
    e.stopPropagation();
    if (!await dialog.confirm(`¿Eliminar permanentemente "${m.nombre_limpio}"? Esta acción no se puede deshacer.`)) return;
    setPurging(m.id_master);
    try {
      const data = await boDELETE(`/backoffice/catalogo/masters/${m.id_master}`);
      if (!data.ok) { dialog.toast(data.msg || "Error al eliminar", "error"); return; }
      fetchMasters();
    } finally { setPurging(null); }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const thProps    = { sortCol, sortDir, onSort: handleSort };

  // Abrir editar desde el modal de vista
  function abrirEditar(item) {
    setModalVer(null);
    setModal({ item });
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Másteres</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            precio = ECTS × €/crédito CCAA
            {total > 0 && <span className="ml-2 font-medium text-neutral-400">— {total} registros</span>}
          </p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-95 transition shadow-sm">
          <span className="text-base leading-none">+</span> Nuevo máster
        </button>
      </div>

      {/* Sub-tabs Activos / Inactivos */}
      <div className="flex gap-1 mb-3">
        {[["activos", "Activos"], ["inactivos", "Inactivos ·  papelera"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => cambiarSubTab(key)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              subTab === key
                ? key === "inactivos" ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-1">
          <input
            className="flex-1 border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            placeholder="Buscar por nombre…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()} />
          <button onClick={applySearch}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium">
            Buscar
          </button>
          {search && (
            <button onClick={resetSearch}
              className="px-2.5 py-1.5 text-sm text-neutral-400 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition">✕</button>
          )}
        </div>
        {[
          { value: filtroCC,     onChange: handleFiltroCC,                                       placeholder: "Todas las CCAA",          opts: comunidades.map((c) => ({ value: c.id_comunidad, label: c.nombre })) },
          { value: filtroUniv,   onChange: (v) => handleFilter("filtroUniv", v, setFiltroUniv),  placeholder: "Todas las universidades",  opts: universidadesFiltradas.map((u) => ({ value: u.id_universidad, label: `${u.sigla} — ${u.nombre_completo}` })) },
          { value: filtroRama,   onChange: (v) => handleFilter("filtroRama", v, setFiltroRama),  placeholder: "Todas las ramas",          opts: RAMAS.map((r) => ({ value: r.value, label: r.label })) },
          { value: filtroMod,    onChange: (v) => handleFilter("filtroMod",  v, setFiltroMod),   placeholder: "Todas las modalidades",    opts: MODALIDADES.map((m) => ({ value: m.value, label: m.label })) },
        ].map(({ value, onChange, placeholder, opts }) => (
          <select key={placeholder}
            className="border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-neutral-700"
            value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-[11px] text-neutral-400 uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2.5">Universidad</th>
              <Th col="nombre_limpio"         label="Máster"      {...thProps} />
              <Th col="rama"                  label="Sub-área / Rama" {...thProps} />
              <Th col="modalidad"             label="Mod."        {...thProps} center />
              <Th col="ects"                  label="ECTS"        {...thProps} center />
              <Th col="precio_total_estimado" label="Precio est." {...thProps} right />
              <th className="text-center px-3 py-2.5">Estado</th>
              <th className="px-3 py-2.5 w-[130px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr><td colSpan={8} className="text-center py-12 text-neutral-400">
                <div className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando…
                </div>
              </td></tr>
            )}
            {!loading && masters.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-neutral-400 text-sm">Sin másteres para los filtros seleccionados.</td></tr>
            )}
            {!loading && masters.map((m) => {
              const badge   = activoBadge(m.activo);
              const ramaCls = RAMA_COLOR[m.rama] || "bg-neutral-100 text-neutral-600 border-neutral-200";
              return (
                <tr key={m.id_master}
                  onClick={() => setModalVer({ item: m })}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer group">
                  {/* Universidad */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-md">{m.universidad?.sigla}</span>
                    <span className="ml-1.5 text-[11px] text-neutral-400">{m.universidad?.comunidad?.nombre}</span>
                  </td>
                  {/* Nombre */}
                  <td className="px-3 py-2.5 max-w-[200px]">
                    <p className="truncate font-medium text-neutral-800 text-sm group-hover:text-primary transition-colors" title={m.nombre_limpio}>
                      {m.nombre_limpio}
                    </p>
                    {m.titulo_acceso && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{m.titulo_acceso}</p>
                    )}
                  </td>
                  {/* Sub-área + Rama */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      {m.sub_area?.etiqueta && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-neutral-50 text-neutral-600 border-neutral-300 w-fit">
                          {m.sub_area.etiqueta}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border w-fit ${ramaCls}`}>
                        {ramaLabel(m.rama)}
                      </span>
                    </div>
                  </td>
                  {/* Modalidad */}
                  <td className="px-3 py-2.5 text-center text-[11px] text-neutral-600 whitespace-nowrap">{modLabel(m.modalidad)}</td>
                  {/* ECTS */}
                  <td className="px-3 py-2.5 text-center tabular-nums text-neutral-700 font-medium">{m.ects}</td>
                  {/* Precio */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-neutral-700 font-medium">{formatPrecio(m.precio_total_estimado)}</td>
                  {/* Estado */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  {/* Acciones */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalVer({ item: m }); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition"
                        title="Ver detalle">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.583-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setModal({ item: m }); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition"
                        title="Editar">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        disabled={toggling === m.id_master}
                        onClick={(e) => toggleEstado(e, m)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition disabled:opacity-40 ${
                          m.activo
                            ? "bg-red-50 hover:bg-red-100 text-red-600"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                        title={m.activo ? "Desactivar" : "Activar"}>
                        {toggling === m.id_master ? "…" : m.activo ? "Desactivar" : "Activar"}
                      </button>
                      {subTab === "inactivos" && (
                        <button
                          disabled={purging === m.id_master}
                          onClick={(e) => purgarMaster(e, m)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                          title="Purgar (eliminar permanentemente)">
                          {purging === m.id_master ? "…" : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-neutral-500">Página {page} de {totalPages} · {total} másteres</span>
          <div className="flex gap-2">
            <button disabled={page <= 1}
              onClick={() => { const p = page-1; setPage(p); fetchMasters({ page:p }); }}
              className="px-3 py-1.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition text-sm">
              ← Anterior
            </button>
            <button disabled={page >= totalPages}
              onClick={() => { const p = page+1; setPage(p); fetchMasters({ page:p }); }}
              className="px-3 py-1.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition text-sm">
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal ver */}
      {modalVer && (
        <ModalVerMaster
          item={modalVer.item}
          onClose={() => setModalVer(null)}
          onEditar={() => abrirEditar(modalVer.item)}
        />
      )}

      {/* Modal editar / crear */}
      {modal && (
        <ModalMaster
          item={modal.item}
          universidades={universidades}
          comunidades={comunidades}
          ramas={ramas}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchMasters(); }}
        />
      )}
    </div>
  );
}
