import { useEffect, useState } from "react";
import { boGET, boPATCH, boDELETE } from "../../../services/backofficeApi";
import { useAuth } from "../context/AuthContext";
import {
  Search, MapPin, Layers, CheckCircle2, MoreVertical, Copy, StickyNote,
  Pencil, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";

const VIDA_LABEL = { economico: "Económico", equilibrado: "Equilibrado", ambicioso: "Ambicioso" };
const PAGE_SIZE  = 50;

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
function fmtFechaHora(iso) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(nombre) {
  return (nombre || "")
    .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

function scoreClass(v) {
  const n = Number(v);
  if (n >= 8) return "text-emerald-600";
  if (n < 6.5) return "text-amber-600";
  return "text-neutral-700";
}

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

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-0.5 opacity-30 text-[11px]">↕</span>;
  return <span className="ml-0.5 text-[11px]">{dir === "asc" ? "↑" : "↓"}</span>;
}

function ThSort({ label, campo, center, sortKey, sortDir, onSort }) {
  return (
    <th
      onClick={() => onSort(campo)}
      title={label}
      className={`px-3 py-3 font-bold text-xs uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:bg-[#d0ecdf] transition overflow-hidden ${center ? "text-center" : ""}`}
    >
      {label}<SortIcon active={sortKey === campo} dir={sortDir} />
    </th>
  );
}

const NOTA_ICON = { link: "🔗", nota: "📝" };

function BecasPills({ becas }) {
  const [expanded, setExpanded] = useState(false);
  if (!becas || becas.length === 0) return <span className="text-neutral-300">—</span>;
  const califica = becas.filter(b => b.estado === "si");
  const posible  = becas.filter(b => b.estado === "posible");
  const all      = [...califica, ...posible];
  const visible  = expanded ? all : all.slice(0, 2);
  const ocultos  = all.length - 2;
  return (
    <div className="flex flex-wrap gap-1 items-start">
      {visible.map((b, i) => {
        const ok = b.estado === "si";
        return (
          <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${ok ? "bg-green-100 text-green-700 font-medium" : "bg-yellow-100 text-yellow-700"}`}>
            {ok ? "✓" : "~"} {b.nombre.split("—")[0].trim()}
          </span>
        );
      })}
      {!expanded && ocultos > 0 && (
        <button onClick={() => setExpanded(true)} className="text-[11px] text-neutral-400 hover:text-primary border border-neutral-200 hover:border-primary/40 rounded-full px-2 py-0.5 transition whitespace-nowrap">
          +{ocultos} más
        </button>
      )}
      {expanded && all.length > 2 && (
        <button onClick={() => setExpanded(false)} className="text-[11px] text-neutral-400 hover:text-primary border border-neutral-200 rounded-full px-2 py-0.5 transition whitespace-nowrap">
          Ver menos
        </button>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LeadsCalculadora() {
  const { isAdmin } = useAuth();

  const [leads,   setLeads]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroPais,   setFiltroPais]   = useState("");
  const [filtroArea,   setFiltroArea]   = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [filtroAuip,   setFiltroAuip]   = useState("");

  // Modal: editar datos básicos
  const [modalEdit, setModalEdit] = useState(null);
  const [saving,    setSaving]    = useState(false);

  // Modal: notas
  const [modalNotas,      setModalNotas]      = useState(null);
  const [newNota,         setNewNota]         = useState({ tipo: "link", label: "", valor: "" });
  const [savingNotas,     setSavingNotas]     = useState(false);
  const [editingNotaIdx,  setEditingNotaIdx]  = useState(null);
  const [editingNotaData, setEditingNotaData] = useState({ tipo: "link", label: "", valor: "" });

  // Modal: eliminar
  const [confirmDel, setConfirmDel] = useState(null);

  // Menú contextual "···" (fila desktop / card móvil)
  const [menuFor, setMenuFor] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Toast de feedback
  const [toast, setToast] = useState("");

  // Ordenamiento client-side
  const [sortKey, setSortKey] = useState("fecha_creacion");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => { cargar(); }, [page, filtroNombre, filtroPais, filtroArea, filtroPerfil, filtroAuip]); // eslint-disable-line

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

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

  async function cargar() {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (filtroNombre) p.set("nombre", filtroNombre);
      if (filtroPais)   p.set("pais",   filtroPais);
      if (filtroArea)   p.set("area",   filtroArea);
      if (filtroPerfil) p.set("vida",   filtroPerfil);
      if (filtroAuip)   p.set("auip",   filtroAuip);
      const data = await boGET(`/backoffice/calculadora/leads?${p}`);
      if (data.ok) { setLeads(data.leads); setTotal(data.pagination.total); }
    } finally { setLoading(false); }
  }

  function resetPage() { setPage(1); }
  function showToast(msg) { setToast(msg); }

  // ── Editar datos básicos ──
  function openEdit(l) {
    setModalEdit({ id: l.id_lead, nombre: l.nombre, email: l.email || "", whatsapp: l.whatsapp || "" });
  }
  function closeEdit() { setModalEdit(null); }
  async function saveModal() {
    if (!modalEdit) return;
    setSaving(true);
    try {
      const { id, nombre, email, whatsapp } = modalEdit;
      const res = await boPATCH(`/backoffice/calculadora/leads/${id}`, { nombre, email, whatsapp });
      if (res.ok) { closeEdit(); cargar(); showToast("Lead actualizado"); }
    } finally { setSaving(false); }
  }

  // ── Notas ──
  function openNotas(l) {
    const notas = Array.isArray(l.notas) ? [...l.notas] : [];
    setModalNotas({ id: l.id_lead, nombre: l.nombre, notas });
    setNewNota({ tipo: "link", label: "", valor: "" });
    setEditingNotaIdx(null);
  }
  function closeNotas() {
    setEditingNotaIdx(null);
    setModalNotas(null);
  }

  function addNota() {
    if (!newNota.valor.trim()) return;
    setModalNotas(m => ({ ...m, notas: [...m.notas, { tipo: newNota.tipo, label: newNota.label.trim(), valor: newNota.valor.trim() }] }));
    setNewNota(n => ({ ...n, label: "", valor: "" }));
  }

  function removeNota(i) {
    if (editingNotaIdx === i) setEditingNotaIdx(null);
    setModalNotas(m => ({ ...m, notas: m.notas.filter((_, idx) => idx !== i) }));
  }

  function startEditNota(i) {
    const n = modalNotas.notas[i];
    setEditingNotaIdx(i);
    setEditingNotaData({ tipo: n.tipo, label: n.label || "", valor: n.valor });
  }
  function cancelEditNota() { setEditingNotaIdx(null); }
  function saveEditNota() {
    if (!editingNotaData.valor.trim()) return;
    setModalNotas(m => ({
      ...m,
      notas: m.notas.map((n, idx) =>
        idx === editingNotaIdx
          ? { tipo: editingNotaData.tipo, label: editingNotaData.label.trim(), valor: editingNotaData.valor.trim() }
          : n
      ),
    }));
    setEditingNotaIdx(null);
  }

  async function saveNotas() {
    if (!modalNotas) return;
    setSavingNotas(true);
    try {
      const res = await boPATCH(`/backoffice/calculadora/leads/${modalNotas.id}`, { notas: modalNotas.notas });
      if (res.ok) { closeNotas(); cargar(); showToast("Notas guardadas"); }
    } finally { setSavingNotas(false); }
  }

  // ── Eliminar ──
  function pedirEliminar(l) { setConfirmDel({ id: l.id_lead, nombre: l.nombre }); }
  async function confirmarEliminar() {
    if (!confirmDel) return;
    await boDELETE(`/backoffice/calculadora/leads/${confirmDel.id}`);
    setConfirmDel(null);
    cargar();
    showToast("Lead eliminado");
  }

  function limpiarFiltros() {
    setFiltroNombre(""); setFiltroPais(""); setFiltroArea("");
    setFiltroPerfil(""); setFiltroAuip(""); resetPage();
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  // ── Menú contextual "···" ──
  function openRowMenu(e, l) {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const menuW = 200, menuH = 200, gap = 6;
    let left = r.right - menuW;
    let top = r.bottom + gap;
    if (left < 8) left = 8;
    if (top + menuH > window.innerHeight - 8) top = r.top - menuH - gap;
    setMenuPos({ top, left });
    setMenuFor(l.id_lead);
  }

  async function copiarContacto(l) {
    const partes = [l.nombre, l.email, l.whatsapp].filter(Boolean).join(" — ");
    try {
      await navigator.clipboard.writeText(partes);
      showToast("Contacto copiado");
    } catch {
      showToast("No se pudo copiar");
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (sortKey === "fecha_creacion") return sortDir === "asc" ? new Date(va) - new Date(vb) : new Date(vb) - new Date(va);
    if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va;
    va = String(va ?? "").toLowerCase();
    vb = String(vb ?? "").toLowerCase();
    return sortDir === "asc" ? va.localeCompare(vb, "es") : vb.localeCompare(va, "es");
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hayFiltros = filtroNombre || filtroPais || filtroArea || filtroPerfil || filtroAuip;
  const sp = { sortKey, sortDir, onSort: toggleSort };
  const menuLead = menuFor ? sortedLeads.find(x => x.id_lead === menuFor) : null;

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* ── Modal: Editar lead ── */}
      {modalEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-neutral-800 text-base">Editar lead</h2>
              <button onClick={closeEdit} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none w-11 h-11 flex items-center justify-center -mr-2">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Nombre</label>
                <input autoFocus className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={modalEdit.nombre} onChange={e => setModalEdit(m => ({ ...m, nombre: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                <input type="email" className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={modalEdit.email} onChange={e => setModalEdit(m => ({ ...m, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">WhatsApp</label>
                <input type="tel" className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={modalEdit.whatsapp} onChange={e => setModalEdit(m => ({ ...m, whatsapp: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={closeEdit} className="flex-1 h-11 text-[13px] border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">Cancelar</button>
              <button onClick={saveModal} disabled={saving} className="flex-1 h-11 text-[13px] bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50">{saving ? "Guardando…" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Notas ── */}
      {modalNotas && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-neutral-800 text-base">Notas</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{modalNotas.nombre}</p>
              </div>
              <button onClick={closeNotas} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none shrink-0 w-11 h-11 flex items-center justify-center -mr-2 -mt-1">×</button>
            </div>

            {/* Lista de notas */}
            {modalNotas.notas.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4 bg-neutral-50 rounded-xl">Sin notas todavía. Agrega un link o comentario.</p>
            )}
            <div className="space-y-2">
              {modalNotas.notas.map((n, i) =>
                editingNotaIdx === i ? (
                  /* ── Fila en modo edición ── */
                  <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex gap-2">
                      <select
                        className="h-10 border border-neutral-200 rounded-lg px-2 text-base sm:text-sm bg-white shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={editingNotaData.tipo}
                        onChange={e => setEditingNotaData(d => ({ ...d, tipo: e.target.value }))}
                      >
                        <option value="link">🔗 Link</option>
                        <option value="nota">📝 Nota</option>
                      </select>
                      <input
                        className="flex-1 h-10 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Etiqueta (ej: LinkedIn…)"
                        value={editingNotaData.label}
                        onChange={e => setEditingNotaData(d => ({ ...d, label: e.target.value }))}
                      />
                    </div>
                    {editingNotaData.tipo === "nota"
                      ? <textarea
                          rows={2}
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          value={editingNotaData.valor}
                          onChange={e => setEditingNotaData(d => ({ ...d, valor: e.target.value }))}
                        />
                      : <input
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="https://..."
                          value={editingNotaData.valor}
                          onChange={e => setEditingNotaData(d => ({ ...d, valor: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && saveEditNota()}
                        />
                    }
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEditNota} className="px-3 h-9 text-[13px] border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">Cancelar</button>
                      <button onClick={saveEditNota} disabled={!editingNotaData.valor.trim()} className="px-3 h-9 text-[13px] bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition">Guardar</button>
                    </div>
                  </div>
                ) : (
                  /* ── Fila normal ── */
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100 group">
                    <span className="text-base shrink-0 mt-0.5">{NOTA_ICON[n.tipo] ?? "📝"}</span>
                    <div className="flex-1 min-w-0">
                      {n.label && <p className="text-xs font-semibold text-neutral-600 mb-0.5">{n.label}</p>}
                      {n.tipo === "link"
                        ? <a href={n.valor} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{n.valor}</a>
                        : <p className="text-sm text-neutral-700 break-words whitespace-pre-wrap">{n.valor}</p>
                      }
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => startEditNota(i)}
                        title="Editar"
                        className="text-neutral-400 hover:text-primary transition text-sm w-9 h-9 flex items-center justify-center"
                      >✏️</button>
                      <button
                        onClick={() => removeNota(i)}
                        title="Eliminar"
                        className="text-neutral-300 hover:text-red-400 transition text-lg leading-none w-9 h-9 flex items-center justify-center"
                      >×</button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Agregar nueva nota */}
            <div className="border-t border-neutral-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Nueva nota</p>
              <div className="flex gap-2">
                <select
                  className="h-11 border border-neutral-200 rounded-lg px-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white shrink-0"
                  value={newNota.tipo}
                  onChange={e => setNewNota(n => ({ ...n, tipo: e.target.value }))}
                >
                  <option value="link">🔗 Link</option>
                  <option value="nota">📝 Nota</option>
                </select>
                <input
                  className="flex-1 h-11 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Etiqueta (ej: LinkedIn, Instagram…)"
                  value={newNota.label}
                  onChange={e => setNewNota(n => ({ ...n, label: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                {newNota.tipo === "nota"
                  ? <textarea
                      rows={2}
                      className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Escribe el comentario…"
                      value={newNota.valor}
                      onChange={e => setNewNota(n => ({ ...n, valor: e.target.value }))}
                    />
                  : <input
                      className="flex-1 h-11 border border-neutral-200 rounded-lg px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="https://linkedin.com/in/..."
                      value={newNota.valor}
                      onChange={e => setNewNota(n => ({ ...n, valor: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addNota()}
                    />
                }
                <button
                  onClick={addNota}
                  disabled={!newNota.valor.trim()}
                  className="px-3 h-11 text-[13px] bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-30 transition whitespace-nowrap shrink-0"
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2 border-t border-neutral-100">
              <button onClick={closeNotas} className="flex-1 h-11 text-[13px] border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">Cancelar</button>
              <button onClick={saveNotas} disabled={savingNotas} className="flex-1 h-11 text-[13px] bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50">
                {savingNotas ? "Guardando…" : "Guardar notas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar eliminar ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl sm:max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">🗑️</div>
              <div>
                <h2 className="font-bold text-neutral-800 text-base">Eliminar lead</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Vas a eliminar permanentemente el lead de <span className="font-semibold text-neutral-700">{confirmDel.nombre}</span>.</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              Esta acción <strong>no se puede deshacer</strong>. Los datos se eliminarán de forma permanente y no podrán recuperarse.
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmDel(null)} className="flex-1 h-11 text-[13px] border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">Cancelar</button>
              <button onClick={confirmarEliminar} className="flex-1 h-11 text-[13px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Menú contextual "···" ── */}
      {menuLead && (
        <div
          className="fixed z-[70] bg-white border border-neutral-200 rounded-xl shadow-2xl p-1.5 min-w-[190px]"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { openEdit(menuLead); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Pencil className="w-4 h-4 text-neutral-400" /> Editar lead
          </button>
          <button onClick={() => { copiarContacto(menuLead); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <Copy className="w-4 h-4 text-neutral-400" /> Copiar contacto
          </button>
          <button onClick={() => { openNotas(menuLead); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
            <StickyNote className="w-4 h-4 text-neutral-400" />
            {Array.isArray(menuLead.notas) && menuLead.notas.length > 0 ? `Notas (${menuLead.notas.length})` : "Añadir nota"}
          </button>
          {isAdmin && (
            <>
              <div className="h-px bg-neutral-100 my-1" />
              <button onClick={() => { pedirEliminar(menuLead); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-red-500 hover:bg-red-50 text-left">
                <Trash2 className="w-4 h-4" /> Eliminar lead
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Toast ── */}
      <div className={`fixed left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 bottom-6 z-[80] bg-neutral-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-2xl transition-all duration-200 ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
        {toast}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.11em] text-primary mb-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-emerald-400" style={{ boxShadow: "0 0 0 4px rgba(70,183,127,0.15)" }} />
          Pipeline de captación
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-bold text-primary leading-tight">Calculadora — Leads</h1>
        <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">{total} registros totales</p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 flex flex-col sm:flex-row gap-2 flex-wrap items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input className="w-full h-11 border border-neutral-200 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar nombre, email o universidad…" value={filtroNombre} onChange={e => { setFiltroNombre(e.target.value); resetPage(); }} />
        </div>
        <div className="relative w-full sm:w-32">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input className="w-full h-11 border border-neutral-200 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="País" value={filtroPais} onChange={e => { setFiltroPais(e.target.value); resetPage(); }} />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input className="w-full h-11 border border-neutral-200 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Área de estudio" value={filtroArea} onChange={e => { setFiltroArea(e.target.value); resetPage(); }} />
        </div>
        <select className="h-11 border border-neutral-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={filtroPerfil} onChange={e => { setFiltroPerfil(e.target.value); resetPage(); }}>
          <option value="">Todos los perfiles</option>
          <option value="economico">Económico</option>
          <option value="equilibrado">Equilibrado</option>
          <option value="ambicioso">Ambicioso</option>
        </select>
        <button onClick={() => { setFiltroAuip(filtroAuip === "si" ? "" : "si"); resetPage(); }} className={`h-11 px-3.5 text-[13px] font-semibold rounded-lg border transition whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${filtroAuip === "si" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}>
          <CheckCircle2 className="w-4 h-4" /> AUIP
        </button>
        {hayFiltros && <button onClick={limpiarFiltros} className="h-11 px-3 text-[13px] text-neutral-500 hover:text-primary whitespace-nowrap">✕ Limpiar</button>}
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden sm:block bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-bold text-neutral-700">Base de leads</span>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{sortedLeads.length} visibles</span>
          </div>
          <span className="text-[11px] text-neutral-400 hidden md:block">Click en una columna para ordenar</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "100px" }} /> {/* Fecha/Hora */}
              <col style={{ width: "110px" }} /> {/* Nombre */}
              <col style={{ width: "58px"  }} /> {/* País */}
              <col style={{ width: "68px"  }} /> {/* Nota ES */}
              <col style={{ width: "130px" }} /> {/* Área / Universidad */}
              <col style={{ width: "72px"  }} /> {/* Presup. */}
              <col style={{ width: "56px"  }} /> {/* AUIP */}
              <col style={{ width: "100px" }} /> {/* CyL */}
              <col style={{ width: "112px" }} /> {/* Email */}
              <col style={{ width: "76px"  }} /> {/* WhatsApp */}
              <col style={{ width: "110px" }} /> {/* Becas */}
              <col style={{ width: "182px" }} /> {/* Notas */}
              <col style={{ width: "56px"  }} /> {/* Acc. */}
            </colgroup>
            <thead>
              <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left">
                <ThSort label="Fecha / Hora" campo="fecha_creacion" {...sp} />
                <ThSort label="Nombre"       campo="nombre"          {...sp} />
                <ThSort label="País"         campo="pais"            {...sp} />
                <ThSort label="Nota ES"      campo="nota_espana"     center {...sp} />
                <ThSort label="Área / Universidad" campo="area"       {...sp} />
                <ThSort label="Presup."      campo="presupuesto"     {...sp} />
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-center whitespace-nowrap">AUIP</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide whitespace-nowrap">CyL</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide whitespace-nowrap">Email</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide whitespace-nowrap">WhatsApp</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Becas</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Notas</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-center whitespace-nowrap">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={13} className="px-4 py-8 text-center text-neutral-400">Cargando...</td></tr>}
              {!loading && sortedLeads.length === 0 && <tr><td colSpan={13} className="px-4 py-8 text-center text-neutral-400">Sin leads todavía.</td></tr>}
              {!loading && sortedLeads.map((l) => {
                const notas = Array.isArray(l.notas) ? l.notas : [];
                return (
                  <tr key={l.id_lead} className="border-t border-neutral-100 hover:bg-neutral-50 transition">

                    <td className="px-3 py-3">
                      <span className="block text-neutral-700 text-xs whitespace-nowrap">{fmtFecha(l.fecha_creacion)}</span>
                      <span className="block text-neutral-400 text-[11px] whitespace-nowrap">{fmtHora(l.fecha_creacion)}</span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                          {initials(l.nombre)}
                        </div>
                        <span className="text-[13px] font-bold text-neutral-800 truncate" style={{ overflowWrap: "break-word" }}>{l.nombre}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-xs whitespace-nowrap">{l.pais}</td>

                    <td className={`px-3 py-3 font-extrabold text-center text-sm ${scoreClass(l.nota_espana)}`}>{Number(l.nota_espana).toFixed(2)}</td>

                    <td className="px-3 py-3 text-xs">
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.area}</span>
                      {l.universidad && (
                        <span className="block text-neutral-400 mt-0.5" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }} title={l.universidad}>{l.universidad}</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs whitespace-nowrap">{l.presupuesto.toLocaleString("es-ES")} €</td>

                    <td className="px-3 py-3 text-center">
                      {l.auip === "si"
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-1"><CheckCircle2 className="w-3 h-3" />Sí</span>
                        : <span className="text-neutral-300 text-xs">—</span>}
                    </td>

                    <td className="px-3 py-3 text-xs" title={l.cyl || ""}>
                      {l.cyl
                        ? <span style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.cyl}</span>
                        : <span className="text-neutral-300">—</span>}
                    </td>

                    <td className="px-3 py-3">
                      {l.email ? <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs" style={{ overflowWrap: "break-word", wordBreak: "break-all" }}>{l.email}</a> : <span className="text-neutral-300">—</span>}
                    </td>

                    <td className="px-3 py-3">
                      {l.whatsapp ? <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs whitespace-nowrap">{l.whatsapp}</a> : <span className="text-neutral-300">—</span>}
                    </td>

                    <td className="px-3 py-3"><BecasPills becas={l.becas_califica} /></td>

                    {/* ── Notas: muestra contenido inline ── */}
                    <td className="px-3 py-3 cursor-pointer" onClick={() => openNotas(l)}>
                      {notas.length === 0 ? (
                        <span className="text-[11px] text-neutral-300 hover:text-primary/60 transition border border-dashed border-neutral-200 hover:border-primary/30 rounded-full px-2 py-0.5">
                          + nota
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {notas.slice(0, 3).map((n, ni) => (
                            <div key={ni} className="flex items-center gap-1 min-w-0">
                              <span className="shrink-0 text-[11px]">{NOTA_ICON[n.tipo] ?? "📝"}</span>
                              {n.tipo === "link" ? (
                                <a
                                  href={n.valor}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-blue-600 hover:underline truncate min-w-0"
                                  title={n.label ? `${n.label}: ${n.valor}` : n.valor}
                                  onClick={e => e.stopPropagation()}
                                >
                                  {n.label || n.valor}
                                </a>
                              ) : (
                                <span className="text-[11px] text-neutral-600 truncate min-w-0" title={n.valor}>
                                  {n.label || n.valor}
                                </span>
                              )}
                            </div>
                          ))}
                          {notas.length > 3 && (
                            <span className="text-[11px] text-neutral-400">+{notas.length - 3} más</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <button onClick={(e) => openRowMenu(e, l)} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition" aria-label={`Acciones de ${l.nombre}`}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Móvil: cards ── */}
      <div className="sm:hidden space-y-3">
        {loading && <p className="text-center text-neutral-400 py-8 text-sm">Cargando…</p>}
        {!loading && sortedLeads.length === 0 && <p className="text-center text-neutral-400 py-8 text-sm">Sin leads todavía.</p>}
        {!loading && sortedLeads.map((l) => {
          const notas = Array.isArray(l.notas) ? l.notas : [];
          return (
            <div key={l.id_lead} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {initials(l.nombre)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-800 text-sm truncate">{l.nombre}</p>
                    <p className="text-xs text-neutral-400 truncate">{l.pais} · {fmtFechaHora(l.fecha_creacion)}</p>
                  </div>
                </div>
                <button onClick={(e) => openRowMenu(e, l)} className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50" aria-label={`Acciones de ${l.nombre}`}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {l.area && <p className="text-xs text-neutral-600">{l.area}</p>}
              {l.universidad && <p className="text-xs text-neutral-500">🎓 {l.universidad}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="text-neutral-500">Nota ES: <b className={scoreClass(l.nota_espana)}>{Number(l.nota_espana).toFixed(2)}</b></span>
                <span className="text-neutral-500">Presupuesto: <b>{l.presupuesto.toLocaleString("es-ES")} €</b></span>
                {l.auip === "si" && <span className="text-emerald-600 font-medium inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />AUIP</span>}
                {l.cyl && <span className="text-neutral-500">CyL: <b>{l.cyl}</b></span>}
              </div>
              <div className="flex flex-col gap-1 text-xs">
                {l.email && <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline break-all">{l.email}</a>}
                {l.whatsapp && <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">📱 {l.whatsapp}</a>}
              </div>
              {l.becas_califica && l.becas_califica.length > 0 && <div className="pt-1"><BecasPills becas={l.becas_califica} /></div>}
              {notas.length > 0 && (
                <div className="pt-1 space-y-1">
                  {notas.slice(0, 2).map((n, ni) => (
                    <div key={ni} className="flex items-center gap-1 text-xs min-w-0">
                      <span className="shrink-0">{NOTA_ICON[n.tipo] ?? "📝"}</span>
                      {n.tipo === "link"
                        ? <a href={n.valor} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{n.label || n.valor}</a>
                        : <span className="text-neutral-600 truncate">{n.label || n.valor}</span>
                      }
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-neutral-100 flex gap-2">
                <button onClick={() => openEdit(l)} className="flex-1 h-11 text-[13px] text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 inline-flex items-center justify-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => openNotas(l)} className={`flex-1 h-11 text-[13px] rounded-lg border inline-flex items-center justify-center gap-1.5 transition ${notas.length > 0 ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"}`}>
                  <StickyNote className="w-3.5 h-3.5" /> {notas.length > 0 ? `Notas (${notas.length})` : "Notas"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white border border-neutral-200 rounded-2xl shadow-sm px-4 py-3">
          <span className="text-[12px] text-neutral-500">Mostrando <b className="text-neutral-700">{sortedLeads.length}</b> de <b className="text-neutral-700">{total}</b> registros</span>
          <div className="flex items-center gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 transition inline-flex items-center justify-center" aria-label="Página anterior">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageList(page, totalPages).map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} className="w-9 h-9 inline-flex items-center justify-center text-neutral-300 text-xs">…</span>
                : (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg border text-[12px] font-bold transition ${p === page ? "bg-primary border-primary text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}>
                    {p}
                  </button>
                )
            )}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 transition inline-flex items-center justify-center" aria-label="Página siguiente">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
