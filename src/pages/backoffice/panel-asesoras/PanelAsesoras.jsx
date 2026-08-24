// src/pages/backoffice/panel-asesoras/PanelAsesoras.jsx
import { useState, useEffect, useCallback } from "react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { DriveIcon, DriveToast, useDriveToast, openDriveFolder } from "../driveToast";
import { Search, Copy, MoreVertical, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const SVC_KEYS = ["master", "visa", "ee", "fp", "legal"];
const SVC_LABELS = { master: "Máster", visa: "Visa estudios", ee: "Estancia est.", fp: "FP / Grado", legal: "Legal / RR" };
const TABS = [{ id: "all", label: "Todos" }, ...SVC_KEYS.map(s => ({ id: s, label: SVC_LABELS[s] }))];
const FASES_VE = ["Estrategia realizada", "Preparación documentaria", "Cita programada", "Documentos listos"];
const UNI_EST = ["ADMITIDO","LISTA DE ESPERA ALTA","LISTA DE ESPERA MEDIA","LISTA DE ESPERA BAJA","POSTULADO","POSTULAR","NO POSTULAR AUN","PROCESO PREVIO","PENDIENTE","EXCLUIDO","FINALIZADO"];
const ESTADOS = ["ACTIVO","NO_ACTIVO","ACTIVAR"];
const PAGE_SIZE = 15;

// El backoffice enruta por pathname + popstate (ver BackofficeApp.navigate).
function irAExpediente(idSolicitud) {
  window.history.pushState({}, "", `/backoffice/solicitudes/${idSolicitud}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function estadoLabel(e) { return e === "NO_ACTIVO" ? "NO ACTIVO" : e; }
function ini(name) { return (name || "?").split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function miss(v) { return !v || !String(v).trim(); }
function fv(v) { return miss(v) ? "—" : v; }
function mkFases() { return FASES_VE.map(l => ({ label: l, done: false, pendiente: "" })); }
function mkPagos() { return { tipo: "", total: "", pagadas: "", pendiente: "", cuotas: "" }; }

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

async function copyValue(value, label) {
  if (miss(value)) return;
  try {
    await navigator.clipboard.writeText(String(value));
    dialog.toast(`${label} copiado`, "success");
  } catch {
    dialog.toast("No se pudo copiar", "error");
  }
}

function CopyBtn({ value, label, className = "" }) {
  if (miss(value)) return null;
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); copyValue(value, label); }}
      title={`Copiar ${label.toLowerCase()}`}
      aria-label={`Copiar ${label.toLowerCase()}`}
      className={`shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md text-neutral-300 hover:text-primary hover:bg-neutral-100 transition ${className}`}
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

const SVC_COLORS = {
  master: { bg: "#EEEDFE", text: "#3C3489" },
  visa:   { bg: "#E6F1FB", text: "#0C447C" },
  ee:     { bg: "#E1F5EE", text: "#085041" },
  fp:     { bg: "#FAEEDA", text: "#633806" },
  legal:  { bg: "#FBEAF0", text: "#72243E" },
};

function estadoBadgeCls(e) {
  if (e === "ACTIVO")   return "bg-green-100 text-green-800";
  if (e === "ACTIVAR")  return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-600";
}

function uniEstCls(e) {
  if (e === "ADMITIDO") return "text-emerald-700 font-semibold";
  if (e?.includes("ESPERA")) return "text-amber-700";
  if (e === "POSTULADO" || e === "POSTULAR") return "text-blue-700";
  if (e === "EXCLUIDO") return "text-red-700";
  if (e === "NO POSTULAR AUN" || e === "NO_POSTULAR_AUN") return "text-neutral-400";
  return "text-neutral-500";
}

function exportJSON(data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = `inspira_panel_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
export default function PanelAsesoras() {
  const [data, setData]               = useState({ master:[], visa:[], ee:[], fp:[], legal:[] });
  const [loading, setLoading]         = useState(true);
  const [curTab, setCurTab]           = useState("all");
  const [expandedKey, setExpandedKey] = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [addMode, setAddMode]         = useState(false);
  const [addSvc, setAddSvc]           = useState("master");
  const [search, setSearch]           = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [saving, setSaving]           = useState(false);
  const [delTarget, setDelTarget]     = useState(null);
  const [panelPage, setPanelPage]     = useState(1);
  const [menuFor, setMenuFor]         = useState(null);
  const [menuPos, setMenuPos]         = useState({ top: 0, left: 0 });
  const driveToastState = useDriveToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await boGET("/backoffice/panel-asesoras");
      if (r.ok) setData(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!menuFor) return;
    function onDismiss() { setMenuFor(null); }
    document.addEventListener("click", onDismiss);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("scroll", onDismiss, true);
    return () => {
      document.removeEventListener("click", onDismiss);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("scroll", onDismiss, true);
    };
  }, [menuFor]);

  /* ── Lista visible ── */
  const allItems = curTab === "all"
    ? SVC_KEYS.flatMap(s => (data[s] || []).map(c => ({ ...c, _svc: s })))
    : (data[curTab] || []).map(c => ({ ...c, _svc: curTab }));

  const visible = allItems
    .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !filterEstado || c.estado === filterEstado);

  const totalPages  = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage    = Math.min(panelPage, totalPages);
  const pageVisible = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset página cuando cambia la búsqueda o filtro
  useEffect(() => { setPanelPage(1); }, [search, filterEstado, curTab]);

  /* ── Contadores ── */
  const total     = SVC_KEYS.reduce((a,s) => a + (data[s]?.length || 0), 0);
  const tabCounts = { all: total, ...Object.fromEntries(SVC_KEYS.map(s => [s, data[s]?.length || 0])) };
  const act       = visible.filter(c => c.estado === "ACTIVO").length;
  const noact     = visible.filter(c => c.estado === "NO_ACTIVO").length;
  const activar   = visible.filter(c => c.estado === "ACTIVAR").length;
  const pend      = visible.filter(c => c.pending?.length > 0).length;
  const hayFiltros = search || filterEstado;

  /* ── Acciones ── */
  async function handleDelete() {
    if (!delTarget) return;
    setSaving(true);
    try {
      await boDELETE(`/backoffice/panel-asesoras/${delTarget.id}`);
      setDelTarget(null);
      setExpandedKey(null);
      await load();
    } finally { setSaving(false); }
  }

  async function handleSaveEdit(body) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/panel-asesoras/${editTarget.item._id}`, body);
      if (r.ok) { setEditTarget(null); await load(); }
      else dialog.toast(r.msg || "Error al guardar", "error");
    } finally { setSaving(false); }
  }

  async function handleSaveNew(body) {
    setSaving(true);
    try {
      const r = await boPOST("/backoffice/panel-asesoras", { ...body, panel_servicio: addSvc });
      if (r.ok) { setAddMode(false); setCurTab(addSvc); await load(); }
      else dialog.toast(r.msg || "Error al crear", "error");
    } finally { setSaving(false); }
  }

  const keyFor = c => `${c._id}_${c._svc}`;

  function openRowMenu(e, c) {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const menuW = 200, menuH = 190, gap = 6;
    let left = r.right - menuW;
    let top = r.bottom + gap;
    if (left < 8) left = 8;
    if (top + menuH > window.innerHeight - 8) top = r.top - menuH - gap;
    setMenuPos({ top, left });
    setMenuFor(keyFor(c));
  }

  const menuClient = menuFor ? visible.find(c => keyFor(c) === menuFor) : null;

  /* ─── Render ─── */
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <DriveToast state={driveToastState} />

      {/* ── Menú contextual "···" ── */}
      {menuClient && (
        <div
          className="fixed z-[70] bg-white border border-neutral-200 rounded-xl shadow-2xl p-1.5 min-w-[190px]"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { setEditTarget({ item: menuClient, svc: menuClient._svc }); setAddMode(false); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Pencil className="w-4 h-4 text-neutral-400" /> Editar datos del panel
          </button>
          <button onClick={() => { irAExpediente(menuClient._id); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Eye className="w-4 h-4 text-neutral-400" /> Abrir expediente #{menuClient._id}
          </button>
          <button onClick={() => { setExpandedKey(keyFor(menuClient)); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Eye className="w-4 h-4 text-neutral-400" /> Ver detalle
          </button>
          <button onClick={() => { copyValue(menuClient.name, "Nombre"); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Copy className="w-4 h-4 text-neutral-400" /> Copiar nombre
          </button>
          <div className="h-px bg-neutral-100 my-1" />
          <button onClick={() => { setDelTarget({ id: menuClient._id, svc: menuClient._svc, name: menuClient.name }); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-red-500 hover:bg-red-50 text-left">
            <Trash2 className="w-4 h-4" /> Eliminar cliente
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-primary mb-1.5">Operación de clientes</div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-primary leading-tight">Panel asesoras</h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">Información completa, compacta y sin perder datos operativos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportJSON(data)}
            className="h-10 px-3.5 text-[13px] rounded-lg border border-neutral-200 bg-white text-neutral-600 font-semibold hover:bg-neutral-50 transition">
            Exportar JSON
          </button>
          <button onClick={() => { setAddMode(true); setEditTarget(null); }}
            className="h-10 px-3.5 text-[13px] rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition">
            + Agregar cliente
          </button>
        </div>
      </div>

      {/* Tabs de servicio */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setCurTab(t.id); setExpandedKey(null); }}
            className={`px-3 h-8 rounded-full text-[12px] border transition-colors ${
              curTab === t.id
                ? "bg-primary/10 border-primary/30 text-primary font-bold"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
            }`}>
            {t.label} <span className="opacity-60">{tabCounts[t.id]}</span>
          </button>
        ))}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          ["Total", visible.length, "text-neutral-800"],
          ["Activos", act, "text-emerald-600"],
          ["No activos", noact, "text-neutral-800"],
          ["Por activar", activar, "text-amber-600"],
          ["Con pendientes", pend, "text-red-600"],
        ].map(([label, n, cls]) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-neutral-400 font-bold">{label}</div>
            <div className={`text-xl font-extrabold mt-1 ${cls}`}>{n}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text" placeholder="Buscar cliente..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 border border-neutral-200 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="h-10 w-full sm:w-48 border border-neutral-200 rounded-lg px-3 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
        </select>
        {hayFiltros && (
          <button onClick={() => { setSearch(""); setFilterEstado(""); }} className="h-10 px-3 text-[13px] text-neutral-500 hover:text-primary whitespace-nowrap">
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Modal agregar */}
      {addMode && (
        <ModalWrapper title="Nuevo cliente"
          onCancel={() => setAddMode(false)}
          header={
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SVC_KEYS.map(s => (
                <button key={s} onClick={() => setAddSvc(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    addSvc === s ? "border-green-400 bg-green-50 text-green-800 font-semibold" : "border-neutral-200 text-neutral-600"
                  }`}>
                  {SVC_LABELS[s]}
                </button>
              ))}
            </div>
          }>
          <ClienteForm
            key={addSvc}
            item={null}
            svc={addSvc}
            saving={saving}
            onSubmit={handleSaveNew}
            onCancel={() => setAddMode(false)}
          />
        </ModalWrapper>
      )}

      {/* Modal editar */}
      {editTarget && (
        <ModalWrapper title={`Editar: ${editTarget.item.name}`}
          onCancel={() => setEditTarget(null)}>
          <ClienteForm
            item={editTarget.item}
            svc={editTarget.svc}
            saving={saving}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditTarget(null)}
          />
        </ModalWrapper>
      )}

      {/* Confirmación eliminar */}
      {delTarget && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-3 flex-wrap">
          <span className="flex-1 text-sm text-red-800">
            ¿Quitar a <b>{delTarget.name}</b> del panel? (la solicitud no se elimina)
          </span>
          <button onClick={() => setDelTarget(null)} className="h-9 px-3 text-[13px] border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50">Cancelar</button>
          <button onClick={handleDelete} disabled={saving}
            className="h-9 px-3 text-[13px] rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50 hover:bg-red-700">
            {saving ? "…" : "Sí, quitar"}
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-bold text-neutral-700">Clientes</span>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{pageVisible.length} visibles</span>
          </div>
          <span className="text-[11px] text-neutral-400">Pág. {safePage}/{totalPages} · {visible.length} clientes</span>
        </div>

        {loading ? (
          <div className="text-center text-sm text-neutral-400 py-10">Cargando…</div>
        ) : visible.length === 0 ? (
          <div className="text-center text-sm text-neutral-400 py-10">Sin resultados</div>
        ) : (
          <div>
            {pageVisible.map(c => {
              const key = keyFor(c);
              return (
                <ClienteCard
                  key={key}
                  c={c}
                  isExp={expandedKey === key}
                  onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
                  onMenu={e => openRowMenu(e, c)}
                />
              );
            })}
          </div>
        )}

        {!loading && visible.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50/70">
            <span className="text-[12px] text-neutral-500">Mostrando <b className="text-neutral-700">{pageVisible.length}</b> de <b className="text-neutral-700">{visible.length}</b> clientes</span>
            <div className="flex items-center gap-1.5">
              <button disabled={safePage === 1} onClick={() => setPanelPage(p => p - 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-white transition inline-flex items-center justify-center" aria-label="Página anterior">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageList(safePage, totalPages).map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} className="w-9 h-9 inline-flex items-center justify-center text-neutral-300 text-xs">…</span>
                  : (
                    <button key={p} onClick={() => setPanelPage(p)} className={`w-9 h-9 rounded-lg border text-[12px] font-bold transition ${p === safePage ? "bg-primary border-primary text-white" : "border-neutral-200 text-neutral-500 hover:bg-white"}`}>
                      {p}
                    </button>
                  )
              )}
              <button disabled={safePage === totalPages} onClick={() => setPanelPage(p => p + 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-white transition inline-flex items-center justify-center" aria-label="Página siguiente">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
function ModalWrapper({ title, onCancel, header, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-neutral-800 text-base">{title}</h3>
            {header}
          </div>
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none w-11 h-11 flex items-center justify-center -mr-2 -mt-1 shrink-0">×</button>
        </div>
        <div className="border-t border-neutral-100 pt-3">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE CARD
═══════════════════════════════════════════════════════════════════════════ */
function ClienteCard({ c, isExp, onToggle, onMenu }) {
  const svc = c._svc;
  const colors = SVC_COLORS[svc] || SVC_COLORS.master;
  const hasBeca = c.beca?.aprobable;
  const hasPend = c.pending?.length > 0;

  let subtitle = `${SVC_LABELS[svc]} · ${c.paquete || "Sin paquete"}`;
  if ((svc === "visa" || svc === "ee") && c.fases) {
    const lastDone = [...(c.fases)].reverse().find(f => f.done);
    subtitle += lastDone ? ` · ${lastDone.label}` : " · Sin iniciar";
  }
  if (c.promedio) subtitle += ` · Prom: ${c.promedio}`;
  if (c.progreso) subtitle += ` · ${c.progreso.pct}% ${c.progreso.etiqueta}`;

  return (
    <div className={`border-t border-neutral-100 first:border-t-0 ${c.portalLinked ? "border-l-[3px] border-l-violet-500" : ""}`}>
      {/* Fila cabecera */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-neutral-50 select-none" onClick={onToggle}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: colors.bg, color: colors.text }}>
          {ini(c.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[13px] font-bold text-neutral-800 truncate max-w-[220px]" title={c.name}>{c.name}</span>
            <CopyBtn value={c.name} label="Nombre" />
            {c.portalLinked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200 shrink-0">portal</span>}
            {hasBeca && <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 shrink-0">🎓 beca</span>}
          </div>
          <div className="text-[11px] text-neutral-400 truncate mt-0.5">{subtitle}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${estadoBadgeCls(c.estado)}`}>
            {estadoLabel(c.estado)}
          </span>
          {hasPend && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {c.pending.length}
            </span>
          )}
          <button onClick={onMenu} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition" aria-label={`Acciones de ${c.name}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
          <button onClick={onToggle} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition" aria-label={isExp ? "Contraer" : "Expandir"}>
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isExp ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {isExp && <ClienteDetail c={c} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE DETAIL (vista expandida, con pestañas)
═══════════════════════════════════════════════════════════════════════════ */
function ClienteDetail({ c }) {
  const svc = c._svc;
  const hasUnis = svc === "master";
  const tabs = [
    { id: "res", label: "Resumen" },
    ...(hasUnis ? [{ id: "uni", label: `Universidades (${(c.unis || []).length})` }] : []),
    { id: "pay", label: "Pagos" },
    { id: "pen", label: `Pendientes${c.pending?.length ? ` (${c.pending.length})` : ""}` },
  ];
  const [tab, setTab] = useState("res");

  return (
    <div className="px-4 pb-4">
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        <div className="flex gap-1 p-1.5 border-b border-neutral-100 bg-neutral-50/70 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 h-8 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                tab === t.id ? "bg-primary/10 text-primary" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-3">
          {tab === "res" && (
            <>
              {svc === "master"           && <MasterResumen c={c} />}
              {(svc === "visa" || svc === "ee") && <VisaEeResumen c={c} />}
              {svc === "fp"               && <FpResumen c={c} />}
              {svc === "legal"            && <LegalResumen c={c} />}
            </>
          )}
          {tab === "uni" && hasUnis && <UnisTab c={c} />}
          {tab === "pay" && <PagosSection pagos={c.pagos} />}
          {tab === "pen" && <PendientesTab pending={c.pending} />}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, right, children }) {
  return (
    <section className="border border-neutral-200 bg-neutral-50/60 rounded-xl p-3 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{title}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

function ProgresoBar({ progreso }) {
  const pct = progreso?.pct ?? 0;
  return (
    <div className="flex items-center gap-2 w-[130px] shrink-0" title={`Expediente ${progreso?.etiqueta || ""}`}>
      <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-neutral-600 tabular-nums">{pct}%</span>
    </div>
  );
}

function ExpedienteLink({ c }) {
  return (
    <button
      title="Abrir el expediente completo"
      onClick={() => irAExpediente(c._id)}
      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm active:scale-95 transition-all duration-150 shrink-0 text-[11px]"
    >
      <span className="text-neutral-500 group-hover:text-primary transition-colors font-semibold">
        Expediente #{c._id} ↗
      </span>
    </button>
  );
}

function FieldGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
      {fields.map(([label, value, isMiss, copyable, manual]) => (
        <div key={label} className="min-w-0">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wide font-bold">
            {label}
            {manual && <span className="ml-1 text-amber-500" title="Valor forzado a mano">✎</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className={`text-xs truncate ${isMiss ? "text-red-500 italic" : "text-neutral-700 font-semibold"}`} title={String(fv(value))}>{fv(value)}</span>
            {copyable && !isMiss && <CopyBtn value={value} label={label} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function CarpetaLinks({ c }) {
  return (
    <button
      title="Abrir carpeta en Drive"
      onClick={() => openDriveFolder(() => boGET(`/backoffice/panel-asesoras/${c._id}/drive-folder-url`))}
      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 shrink-0 text-[11px]"
    >
      <DriveIcon size={13} />
      <span className="text-neutral-500 group-hover:text-neutral-800 transition-colors font-semibold">Abrir Drive ↗</span>
    </button>
  );
}

function MasterResumen({ c }) {
  const p  = c.pasos  || {};
  const og = c.origen || {};
  // Todo esto se deriva del expediente; ✎ marca lo que la asesora forzó a mano.
  const steps = [
    ["Fichero", p.fichero, og.fichero],
    ["Nota media", c.notaMedia, og.notaMedia],
    ["CV Europass", c.cvEuropass, og.cvEuropass],
    ["Informe búsqueda", p.informe, og.informe],
    ["Escogió máster", p.escogio, og.escogio],
    ["Docs completos", c.docCompletos, og.docCompletos],
    ["Postulación completa", p.postulacion, og.postulacion],
  ];
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <InfoCard title="Identidad" right={<ProgresoBar progreso={c.progreso} />}>
          <FieldGrid fields={[
            ["Nombre completo", c.name, false, true],
            ["Paquete", c.paquete, false, true],
            ["Carpeta", c.carpeta, false, true],
          ]} />
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <CarpetaLinks c={c} />
            <ExpedienteLink c={c} />
          </div>
        </InfoCard>
        <InfoCard title="Perfil académico">
          <FieldGrid fields={[
            ["Uni origen", c.uni_origen, miss(c.uni_origen), true, og.uni_origen === "manual"],
            ["Área de interés", c.interes, miss(c.interes), true, og.interes === "manual"],
            ["Promedio", c.promedio, miss(c.promedio), true, og.promedio === "manual"],
            ["Máster elegido", c.masterElegido, miss(c.masterElegido), true, og.masterElegido === "manual"],
          ]} />
        </InfoCard>
        <InfoCard title="Beca">
          {c.beca ? (
            <div className={`rounded-lg p-2.5 -m-0.5 ${c.beca.aprobable ? "bg-fuchsia-50 border border-fuchsia-200" : "bg-white border border-neutral-200"}`}>
              <div className={`text-xs font-bold ${c.beca.aprobable ? "text-fuchsia-700" : "text-neutral-400"}`}>
                {c.beca.aprobable ? "🎓 Beca aprobable" : "Sin análisis aprobable"}
              </div>
              {c.beca.detalle && <div className="text-xs text-neutral-600 mt-1">{c.beca.detalle}</div>}
            </div>
          ) : <div className="text-xs text-neutral-400">Sin registro</div>}
        </InfoCard>
      </div>

      <InfoCard title={`Proceso · ${steps.filter(([, ok]) => ok).length}/${steps.length} completados`}>
        <div className="flex flex-wrap gap-1.5">
          {steps.map(([l, ok, origen]) => (
            <span
              key={l}
              title={origen === "manual" ? "Forzado a mano" : "Derivado del expediente"}
              className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${
                ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
              } ${origen === "manual" ? "ring-1 ring-amber-300" : ""}`}
            >
              {ok ? "✓" : "×"} {l}
              {origen === "manual" && <span className="ml-1 text-amber-600">✎</span>}
            </span>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

function UnisTab({ c }) {
  if (!c.unis?.length) return <div className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-4 text-center">Aún no hay universidades asociadas.</div>;
  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-lg">
      <table className="w-full text-[11px] border-collapse min-w-[640px]">
        <thead className="bg-neutral-50">
          <tr className="text-neutral-500 uppercase tracking-wide">
            <th className="text-left px-2.5 py-2 font-bold">Universidad</th>
            <th className="text-left px-2.5 py-2 font-bold">Máster</th>
            <th className="text-left px-2.5 py-2 font-bold">F. postulación</th>
            <th className="text-left px-2.5 py-2 font-bold">F. resultados</th>
            <th className="text-left px-2.5 py-2 font-bold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {c.unis.map((u, i) => (
            <tr key={u._idAcceso || i} className="border-t border-neutral-100">
              <td className="px-2.5 py-2 font-semibold text-neutral-700"><div className="flex items-center gap-1 min-w-0"><span className="truncate max-w-[160px]">{u.u}</span><CopyBtn value={u.u} label="Universidad" /></div></td>
              <td className="px-2.5 py-2 text-neutral-500"><div className="flex items-center gap-1 min-w-0"><span className="truncate max-w-[160px]">{fv(u.master)}</span>{u.master && <CopyBtn value={u.master} label="Máster" />}</div></td>
              <td className="px-2.5 py-2 text-neutral-500 whitespace-nowrap">{fv(u.fPost)}</td>
              <td className="px-2.5 py-2 text-neutral-500 whitespace-nowrap">{fv(u.fResult)}</td>
              <td className={`px-2.5 py-2 font-semibold ${uniEstCls(u.est)}`}>{u.est}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FasesSection({ fases }) {
  const nextUndone = fases.findIndex(f => !f.done);
  return (
    <div className="space-y-1.5">
      {fases.map((f, i) => {
        const isCurrent = i === nextUndone;
        return (
          <div key={i} className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border ${
            f.done ? "bg-green-50 border-green-200" : isCurrent ? "bg-amber-50 border-amber-200" : "bg-white border-neutral-200"
          }`}>
            <span className="text-sm mt-0.5 flex-shrink-0">{f.done ? "✅" : isCurrent ? "🔶" : "⬜"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-neutral-700">{f.label}</div>
              {f.pendiente ? <div className="text-[11px] text-red-600 italic mt-0.5">⚠ {f.pendiente}</div>
                : f.done ? <div className="text-[11px] text-green-600 mt-0.5">Completada</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisaEeResumen({ c }) {
  const svc = c._svc;
  const isVisa = svc === "visa";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
      <InfoCard title="Fases del proceso">
        <FasesSection fases={c.fases || mkFases()} />
      </InfoCard>
      <InfoCard title={`Datos de ${isVisa ? "visa" : "estancia"}`}>
        {isVisa ? (
          <FieldGrid fields={[
            ["Fecha cita consulado", c.fechaCita, miss(c.fechaCita)],
            ["Carpeta", c.carpeta, false, true],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte), true],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie), true],
            ["Nº expediente", c.expediente, miss(c.expediente), true],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
          ]} />
        ) : (
          <FieldGrid fields={[
            ["Detalle", c.detalle, miss(c.detalle), true],
            ["Carpeta", c.carpeta, false, true],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte), true],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie), true],
            ["Nº expediente", c.expediente, miss(c.expediente), true],
            ["F. presentación", c.fPresentacion, miss(c.fPresentacion)],
          ]} />
        )}
        <CarpetaLinks c={c} />
      </InfoCard>
    </div>
  );
}

function FpResumen({ c }) {
  return (
    <InfoCard title="FP / Grado">
      <FieldGrid fields={[
        ["Paquete", c.paquete, false, true], ["Carpeta", c.carpeta, false, true],
        ["Centro", c.centro, miss(c.centro), true],  ["Estado admisión", c.estadoAdm, miss(c.estadoAdm)],
        ["NIE", c.nie, miss(c.nie), true], ["Nº expediente", c.expediente, miss(c.expediente), true],
      ]} />
      <CarpetaLinks c={c} />
    </InfoCard>
  );
}

function LegalResumen({ c }) {
  return (
    <InfoCard title="Legal / Extranjería">
      <FieldGrid fields={[
        ["Tipo", c.tipo, miss(c.tipo)], ["Resultado", c.resultado, miss(c.resultado)],
        ["Asesor", c.asesor, miss(c.asesor)], ["Carpeta", c.carpeta, false, true],
        ["NIE", c.nie, miss(c.nie), true], ["Nº expediente", c.expediente, miss(c.expediente), true],
        ["Fecha resolución", c.resolucion, miss(c.resolucion)], ["Paquete", c.paquete, false, true],
      ]} />
      <CarpetaLinks c={c} />
    </InfoCard>
  );
}

function PendientesTab({ pending }) {
  if (!pending?.length) return <div className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-4 text-center">Sin pendientes registrados.</div>;
  return (
    <ul className="space-y-1.5">
      {pending.map((p, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-neutral-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {p}
        </li>
      ))}
    </ul>
  );
}

function PagosSection({ pagos }) {
  const p = pagos || mkPagos();
  const pct = p.total ? Math.min(100, Math.round((parseFloat(p.pagadas)||0) / parseFloat(p.total) * 100)) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[["Tipo", p.tipo], ["Total (€)", p.total], ["Cuotas", p.cuotas], ["Pagado (€)", p.pagadas]].map(([l,v]) => (
          <div key={l} className="border border-neutral-200 bg-neutral-50/60 rounded-lg p-2.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wide font-bold">{l}</div>
            <div className="text-xs font-bold text-neutral-700 mt-0.5">{fv(v)}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-neutral-400 min-w-[68px]">Progreso</span>
        <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[11px] font-bold min-w-[100px] text-right ${miss(p.pendiente) ? "text-red-500" : "text-green-700"}`}>
          Pendiente: {fv(p.pendiente)}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE FORM (compartido para crear y editar)
═══════════════════════════════════════════════════════════════════════════ */
// Los campos que el expediente puede deducir tienen tres estados en el modal:
// "auto" (derivado), "si" y "no" (override manual de la asesora).
function triInicial(item, campo, valor) {
  return item?.origen?.[campo] === "manual" ? (valor ? "si" : "no") : "auto";
}
// Los campos de texto quedan vacios cuando estan en automatico.
function textoInicial(item, campo, valor) {
  return item?.origen?.[campo] === "manual" ? (valor || "") : "";
}

function buildInitialForm(item) {
  return {
    name:         item?.name         || "",
    email:        "",
    estado:       item?.estado       || "ACTIVO",
    paquete:      item?.paquete      || "",
    carpeta:      item?.carpeta      || "",
    driveUrl:     item?.driveUrl     || "",
    portalUrl:    item?.portalUrl    || "",
    promedio:     textoInicial(item, "promedio", item?.promedio),
    interes:      textoInicial(item, "interes", item?.interes),
    uni_origen:   textoInicial(item, "uni_origen", item?.uni_origen),
    masterElegido:textoInicial(item, "masterElegido", item?.masterElegido),
    portalLinked: item?.portalLinked || false,
    beca_aprobable: item?.beca?.aprobable || false,
    beca_detalle:   item?.beca?.detalle   || "",
    notaMedia:    triInicial(item, "notaMedia", item?.notaMedia),
    cvEuropass:   triInicial(item, "cvEuropass", item?.cvEuropass),
    docCompletos: triInicial(item, "docCompletos", item?.docCompletos),
    fichero:      triInicial(item, "fichero", item?.pasos?.fichero),
    informe:      triInicial(item, "informe", item?.pasos?.informe),
    escogio:      triInicial(item, "escogio", item?.pasos?.escogio),
    postulacion:  triInicial(item, "postulacion", item?.pasos?.postulacion),
    fechaCita:  item?.fechaCita  || "",
    pasaporte:  item?.pasaporte  || "",
    fNac:       item?.fNac       || "",
    nie:        item?.nie        || "",
    expediente: item?.expediente || "",
    llegada:    item?.llegada    || "",
    plazoMax:   item?.plazoMax   || "",
    plazoIdeal: item?.plazoIdeal || "",
    detalle:    item?.detalle    || "",
    fPresentacion: item?.fPresentacion || "",
    centro:     item?.centro     || "",
    estadoAdm:  item?.estadoAdm  || "",
    resultado:  item?.resultado  || "",
    tipo:       item?.tipo       || "",
    asesor:     item?.asesor     || "",
    resolucion: item?.resolucion || "",
  };
}

function ClienteForm({ item, svc, saving, onSubmit, onCancel }) {
  const isEdit = !!item;
  const [form, setForm]         = useState(() => buildInitialForm(item));
  const [unis, setUnis]         = useState(() => item?.unis ? JSON.parse(JSON.stringify(item.unis)) : []);
  const [fases, setFases]       = useState(() => item?.fases ? JSON.parse(JSON.stringify(item.fases)) : mkFases());
  const [pendingStr, setPendingStr] = useState(() => (item?.pending || []).join("\n"));
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setFase(i, field, val) { setFases(f => f.map((x, idx) => idx === i ? { ...x, [field]: val } : x)); }
  function setUniField(i, k, v)  { setUnis(u => u.map((x, idx) => idx === i ? { ...x, [k]: v } : x)); }
  function remUni(i) { setUnis(u => u.filter((_, idx) => idx !== i)); }

  // "auto" -> null (el backend lo deriva del expediente)
  const tri = (v) => (v === "auto" ? null : v === "si");

  async function handleSubmit() {
    if (!form.name?.trim()) { dialog.toast("El nombre es obligatorio", "error"); return; }

    // Para maestrías en modo edición, primero guardamos unis modificadas
    if (isEdit && svc === "master") {
      const promises = unis
        .filter(u => u._idAcceso)
        .map(u => boPATCH(`/backoffice/panel-asesoras/portales/${u._idAcceso}`, {
          u: u.u, master: u.master, fPost: u.fPost, fResult: u.fResult, est: u.est,
        }));
      await Promise.all(promises);
    }

    const body = {
      name: form.name.trim(),
      ...(!isEdit && { email: form.email || undefined }),
      estado: form.estado, paquete: form.paquete,
      pending: pendingStr.split("\n").map(s => s.trim()).filter(Boolean),
      promedio: form.promedio, interes: form.interes,
      uni_origen: form.uni_origen, masterElegido: form.masterElegido,
      portalLinked: form.portalLinked,
      notaMedia: tri(form.notaMedia), cvEuropass: tri(form.cvEuropass), docCompletos: tri(form.docCompletos),
      pasos: {
        fichero: tri(form.fichero), informe: tri(form.informe),
        escogio: tri(form.escogio), postulacion: tri(form.postulacion),
      },
      beca: { aprobable: form.beca_aprobable, detalle: form.beca_detalle },
      fases,
      fechaCita: form.fechaCita, pasaporte: form.pasaporte, fNac: form.fNac,
      nie: form.nie, expediente: form.expediente, llegada: form.llegada,
      plazoMax: form.plazoMax, plazoIdeal: form.plazoIdeal,
      detalle: form.detalle, fPresentacion: form.fPresentacion,
      carpeta: form.carpeta, centro: form.centro, estadoAdm: form.estadoAdm,
      resultado: form.resultado, tipo: form.tipo, asesor: form.asesor, resolucion: form.resolucion,
    };

    await onSubmit(body);
  }

  const inp = "w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";
  const lab = "block text-[10px] text-neutral-400 uppercase tracking-wide mb-0.5";
  // Dejar el campo vacio lo devuelve a automatico; el placeholder enseña que valor daria.
  const autoPh = (v) => (v ? `Auto: ${v}` : "Automático");

  return (
    <div className="space-y-4 text-xs">

      {/* Campos básicos */}
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 sm:col-span-1">
          <span className={lab}>Nombre completo *</span>
          <input className={inp} value={form.name} onChange={e => set("name", e.target.value)} />
        </label>
        {!isEdit && (
          <label>
            <span className={lab}>Email (opcional)</span>
            <input className={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </label>
        )}
        <label>
          <span className={lab}>Estado</span>
          <select className={inp} value={form.estado} onChange={e => set("estado", e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
          </select>
        </label>
        <label className={!isEdit ? "col-span-2 sm:col-span-1" : ""}>
          <span className={lab}>Paquete contratado</span>
          <input className={inp} value={form.paquete} onChange={e => set("paquete", e.target.value)} />
        </label>
      </div>

      {/* Carpeta + Drive */}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={lab}>Código carpeta</span>
          <input className={inp} value={form.carpeta} onChange={e => set("carpeta", e.target.value)} />
        </label>
        <div>
          <span className={lab}>Carpeta Drive</span>
          {isEdit ? (
            <button
              type="button"
              onClick={() => openDriveFolder(() => boGET(`/backoffice/panel-asesoras/${item._id}/drive-folder-url`))}
              className="group inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 text-[11px] font-medium text-neutral-600"
            >
              <DriveIcon size={13} />
              <span>Abrir en Drive ↗</span>
            </button>
          ) : (
            <span className="block mt-1 text-xs text-neutral-400 italic">Guardar primero</span>
          )}
        </div>
      </div>

      {/* ── MÁSTER ── */}
      {svc === "master" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <label>
              <span className={lab}>Área de interés</span>
              <input className={inp} value={form.interes} onChange={e => set("interes", e.target.value)}
                placeholder={autoPh(item?.auto?.interes)} />
            </label>
            <label>
              <span className={lab}>Uni de origen</span>
              <input className={inp} value={form.uni_origen} onChange={e => set("uni_origen", e.target.value)}
                placeholder={autoPh(item?.auto?.uni_origen)} />
            </label>
            <label>
              <span className={lab}>Promedio ponderado</span>
              <input className={inp} value={form.promedio} onChange={e => set("promedio", e.target.value)}
                placeholder={autoPh(item?.auto?.promedio)} />
            </label>
          </div>
          <label>
            <span className={lab}>Máster elegido</span>
            <input className={inp} value={form.masterElegido} onChange={e => set("masterElegido", e.target.value)}
              placeholder={autoPh(item?.auto?.masterElegido)} />
          </label>
          <p className="text-[10px] text-neutral-400 -mt-2">
            Estos cuatro campos salen del expediente. Escribe algo solo para forzarlo; déjalo vacío para volver a automático.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={lab}>¿Beca aprobable?</span>
              <select className={inp} value={form.beca_aprobable ? "1" : "0"} onChange={e => set("beca_aprobable", e.target.value === "1")}>
                <option value="0">No / Sin análisis</option>
                <option value="1">Sí — perfil aprobable</option>
              </select>
            </label>
            <label>
              <span className={lab}>Detalle análisis beca</span>
              <input className={inp} value={form.beca_detalle} onChange={e => set("beca_detalle", e.target.value)} />
            </label>
          </div>
          <div>
            <div className={lab}>Proceso</div>
            <p className="text-[10px] text-neutral-400 mb-1.5">
              En automático cada paso se deduce del expediente. Usa Sí/No solo cuando necesites forzarlo.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ["fichero","Fichero"], ["notaMedia","Nota media"], ["cvEuropass","CV Europass"],
                ["informe","Informe búsqueda"], ["escogio","Escogió máster"],
                ["docCompletos","Docs completos"], ["postulacion","Postulación completa"],
              ].map(([k,l]) => (
                <label key={k} className="min-w-0">
                  <span className={lab}>
                    {l}
                    {form[k] === "auto" && item && (
                      <span className="ml-1 normal-case tracking-normal text-neutral-400">
                        ({item?.auto?.[k] ? "sí" : "no"})
                      </span>
                    )}
                  </span>
                  <select className={inp} value={form[k]} onChange={e => set(k, e.target.value)}>
                    <option value="auto">Automático</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ))}
            </div>
          </div>
          {isEdit && (
            <UnisEditor
              unis={unis}
              solicitudId={item._id}
              onAddLocal={u => setUnis(prev => [...prev, u])}
              onRem={remUni}
              onSet={setUniField}
            />
          )}
        </>
      )}

      {/* ── VISA / ESTANCIA ── */}
      {(svc === "visa" || svc === "ee") && (
        <>
          <div>
            <div className={lab}>Fases del proceso</div>
            <div className="mt-1.5 border border-neutral-100 rounded-lg overflow-hidden divide-y divide-neutral-100">
              {fases.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 px-2.5 py-2">
                  <input type="checkbox" checked={f.done} onChange={e => setFase(i, "done", e.target.checked)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="min-w-[160px] font-medium pt-0.5 flex-shrink-0">{f.label}</span>
                  <input className={`${inp} flex-1`} value={f.pendiente} onChange={e => setFase(i, "pendiente", e.target.value)} placeholder="pendiente específico…" />
                </div>
              ))}
            </div>
          </div>
          {svc === "visa" ? (
            <div className="grid grid-cols-2 gap-3">
              {[["fechaCita","Fecha cita consulado"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className={lab}>Detalle del caso</span><input className={inp} value={form.detalle} onChange={e => set("detalle", e.target.value)} /></label>
              {[["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["fPresentacion","Fecha presentación"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FP ── */}
      {svc === "fp" && (
        <div className="grid grid-cols-2 gap-3">
          {[["centro","Centro"],["estadoAdm","Estado admisión"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* ── LEGAL ── */}
      {svc === "legal" && (
        <div className="grid grid-cols-2 gap-3">
          {[["tipo","Tipo procedimiento"],["resultado","Resultado"],["asesor","Asesor"],["resolucion","Fecha resolución"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* Pendientes */}
      <label>
        <span className={lab}>Pendientes generales (uno por línea)</span>
        <textarea className={`${inp} min-h-[56px] resize-y`} value={pendingStr} onChange={e => setPendingStr(e.target.value)} />
      </label>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <button onClick={onCancel} type="button"
          className="h-10 px-4 text-[13px] border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving} type="button"
          className="h-10 px-4 text-[13px] rounded-lg bg-primary text-white font-semibold disabled:opacity-50 hover:opacity-90">
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNIS EDITOR — edición en tiempo real de postulaciones de máster
═══════════════════════════════════════════════════════════════════════════ */
function UnisEditor({ unis, solicitudId, onAddLocal, onRem, onSet }) {
  const [busy, setBusy] = useState(false);

  async function addUni() {
    setBusy(true);
    try {
      const r = await boPOST(`/backoffice/panel-asesoras/${solicitudId}/portales`, { u: "Nueva universidad", est: "PENDIENTE" });
      if (r.ok) {
        onAddLocal({ _idAcceso: r._idAcceso, u: "Nueva universidad", master: "", fPost: "", fResult: "", est: "PENDIENTE" });
      }
    } finally { setBusy(false); }
  }

  async function deleteUni(uni, i) {
    if (uni._idAcceso) {
      setBusy(true);
      try {
        await boDELETE(`/backoffice/panel-asesoras/portales/${uni._idAcceso}`);
        onRem(i);
      } finally { setBusy(false); }
    } else {
      onRem(i);
    }
  }

  const inp = "w-full border border-neutral-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";

  return (
    <div>
      <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1.5">
        Universidades <span className="font-normal normal-case text-neutral-300">(agregar/eliminar se aplica al instante)</span>
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-neutral-50">
            <tr className="text-[10px] text-neutral-400">
              {["Universidad","Máster específico","F. postulación","F. resultados","Estado",""].map(h => (
                <th key={h} className="text-left px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unis.map((u, i) => (
              <tr key={u._idAcceso || i} className="border-t border-neutral-100">
                <td className="px-2 py-1"><input className={inp} value={u.u} onChange={e => onSet(i,"u",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.master} onChange={e => onSet(i,"master",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fPost} onChange={e => onSet(i,"fPost",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fResult} onChange={e => onSet(i,"fResult",e.target.value)} /></td>
                <td className="px-2 py-1">
                  <select className={inp} value={u.est} onChange={e => onSet(i,"est",e.target.value)}>
                    {UNI_EST.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <button onClick={() => deleteUni(u, i)} disabled={busy}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-2 py-1.5 border-t border-neutral-100">
          <button onClick={addUni} disabled={busy}
            className="text-[11px] text-neutral-500 hover:text-neutral-700 disabled:opacity-40">
            {busy ? "…" : "+ agregar universidad"}
          </button>
        </div>
      </div>
    </div>
  );
}
