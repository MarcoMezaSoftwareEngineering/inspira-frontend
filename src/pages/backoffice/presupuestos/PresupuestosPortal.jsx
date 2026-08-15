import { useEffect, useState } from "react";
import { boGET, boPUT, boDELETE, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = {
  new:      "Nueva",
  progress: "En proceso",
  done:     "Convertida",
  cancel:   "Cancelada",
};
const STATUS_COLOR = {
  new:      "bg-blue-100 text-blue-700",
  progress: "bg-amber-100 text-amber-700",
  done:     "bg-emerald-100 text-emerald-700",
  cancel:   "bg-red-100 text-red-600",
};
const STATUS_DOT = {
  new:      "bg-blue-500",
  progress: "bg-amber-500",
  done:     "bg-emerald-500",
  cancel:   "bg-red-500",
};

function fmt(n) { return "€" + (n || 0).toLocaleString("es-ES"); }
function fmtFecha(iso) { return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }); }
function fmtHora(iso)  { return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }); }

function StatCard({ label, value, sub, accent }) {
  const colors = { blue: "border-t-blue-500", amber: "border-t-amber-500", green: "border-t-emerald-500", gold: "border-t-yellow-500" };
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 border-t-4 ${colors[accent]} p-4 shadow-sm`}>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-['Fraunces'] text-3xl font-bold text-[#0d3320] leading-none">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function ComTag({ label }) {
  return <span className="bg-[#e8f5ee] text-[#1a5c3a] px-1.5 py-0.5 rounded text-[11px] font-semibold">{label}</span>;
}

// ── Modal detalle ────────────────────────────────────────────────────────────
function Modal({ row, onClose, onStatusChange, onArchivar, isAdmin }) {
  const [status, setStatus] = useState(row.estado);
  const [saving, setSaving] = useState(false);

  const coms     = Array.isArray(row.comunidades) ? row.comunidades : [];
  const services = Array.isArray(row.servicios)   ? row.servicios   : [];
  const digits   = (row.contacto || "").replace(/\D/g, "");
  const emailMatch = (row.contacto || "").match(/[\w.+-]+@[\w.-]+\.\w+/);
  const email    = emailMatch ? emailMatch[0] : null;

  async function guardarEstado() {
    if (status === row.estado) return;
    setSaving(true);
    const res = await boPUT(`/backoffice/presupuestos/${row.id}/estado`, { estado: status });
    setSaving(false);
    if (res.ok) onStatusChange(row.id, status);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
      style={{ backgroundColor: "rgba(13,51,32,0.5)", backdropFilter: "blur(3px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d3320] to-[#1a5c3a] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Fraunces'] text-xl font-bold">{row.nombre}</h2>
            <p className="text-white/70 text-sm mt-0.5">{row.numero} · {STATUS_LABEL[row.estado]}</p>
          </div>
          <button onClick={onClose} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition text-white text-lg">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-2 gap-4">

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Contacto</p>
            <p className="text-sm font-medium text-neutral-800 mb-3">{row.contacto}</p>
            <div className="flex gap-2 flex-wrap">
              {digits.length >= 7 && (
                <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer"
                   className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition font-medium">
                  💬 WhatsApp
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                   className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition font-medium">
                  ✉ Email
                </a>
              )}
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Recibida</p>
            <p className="text-sm font-medium text-neutral-800">{fmtFecha(row.fecha_creacion)}</p>
            <p className="text-xs text-neutral-500">{fmtHora(row.fecha_creacion)}</p>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Comunidades de interés</p>
            <div className="flex flex-wrap gap-1.5">
              {coms.length ? coms.map(c => <ComTag key={c} label={c} />) : <span className="text-neutral-400 text-sm">—</span>}
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Universidades aprox.</p>
            <p className="text-sm font-semibold text-neutral-800">{row.cant_unis || "—"}</p>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Servicios solicitados</p>
            <div className="flex flex-wrap gap-1.5">
              {services.length
                ? services.map(s => <span key={s} className="bg-[#fdf3e3] text-[#7c4a00] px-2 py-0.5 rounded text-xs font-semibold">{s}</span>)
                : <span className="text-neutral-400 text-sm">—</span>}
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Estimación orientativa</p>
            <p className="font-['Fraunces'] text-xl font-bold text-[#0d3320]">{fmt(row.estimacion_eur)}</p>
            {row.estimacion_eur && (
              <p className="text-xs text-neutral-400 mt-0.5">
                ≈ S/ {Math.round(row.estimacion_eur * 4.10).toLocaleString("es-ES")} · ≈ ${Math.round(row.estimacion_eur * 1.09).toLocaleString("es-ES")}
              </p>
            )}
          </div>

          <div className="bg-neutral-50 rounded-xl p-4 col-span-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Situación del cliente</p>
            <p className="text-sm text-neutral-700 leading-relaxed border-l-4 border-[#1a5c3a] pl-3 bg-white rounded-r-lg py-2 pr-3">
              {row.situacion || "(Sin descripción)"}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-semibold text-neutral-500">Estado:</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              <option value="new">🆕 Nueva</option>
              <option value="progress">⏳ En proceso</option>
              <option value="done">✅ Convertida</option>
              <option value="cancel">✕ Cancelada</option>
            </select>
            <button
              onClick={guardarEstado}
              disabled={saving || status === row.estado}
              className="px-3 py-1.5 text-xs bg-[#1a5c3a] text-white rounded-lg hover:bg-[#2d7a52] disabled:opacity-40 transition font-semibold"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {isAdmin && (
              <button
                onClick={() => onArchivar(row.id)}
                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Archivar
              </button>
            )}
          </div>
          {digits.length >= 7 && (
            <a
              href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hola ${row.nombre}, te contactamos de Inspira Legal sobre tu solicitud de presupuesto ${row.numero}.`)}`}
              target="_blank" rel="noreferrer"
              className="px-4 py-2 text-xs bg-[#25d366] text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function PresupuestosPortal() {
  const { isAdmin } = useAuth();

  const [rows,      setRows]      = useState([]);
  const [archivadas, setArchivadas] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [tab,       setTab]       = useState("");   // "" | "new" | "progress" | "done" | "cancel"
  const [vista,     setVista]     = useState("activas"); // "activas" | "papelera"
  const [modal,     setModal]     = useState(null);

  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (vista === "papelera" && isAdmin) cargarArchivadas(); }, [vista]);

  async function cargar() {
    setLoading(true);
    try {
      const data = await boGET("/backoffice/presupuestos");
      if (data.ok) setRows(data.solicitudes || []);
    } finally {
      setLoading(false);
    }
  }

  async function cargarArchivadas() {
    setLoading(true);
    try {
      const data = await boGET("/backoffice/presupuestos/archivadas");
      if (data.ok) setArchivadas(data.solicitudes || []);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(id, newStatus) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, estado: newStatus } : r));
    setModal(prev => prev ? { ...prev, estado: newStatus } : prev);
  }

  async function handleArchivar(id) {
    if (!await dialog.confirm("¿Archivar esta solicitud de presupuesto?")) return;
    const r = await boDELETE(`/backoffice/presupuestos/${id}`);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo archivar", "error"); return; }
    setRows(prev => prev.filter(x => x.id !== id));
    setModal(null);
  }

  async function handleRestaurar(id) {
    if (!await dialog.confirm("¿Restaurar esta solicitud?")) return;
    const r = await boPATCH(`/backoffice/presupuestos/${id}/restaurar`, {});
    if (!r.ok) { dialog.toast(r.msg || "No se pudo restaurar", "error"); return; }
    setArchivadas(prev => prev.filter(x => x.id !== id));
  }

  async function handlePurgar(id) {
    if (!await dialog.confirm("¿Eliminar PERMANENTEMENTE? Esta acción no se puede deshacer.")) return;
    const r = await boDELETE(`/backoffice/presupuestos/${id}/purgar`);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo purgar", "error"); return; }
    setArchivadas(prev => prev.filter(x => x.id !== id));
  }

  // ── Stats (solo activas) ──
  const stats = {
    nuevas:      rows.filter(r => r.estado === "new").length,
    progreso:    rows.filter(r => r.estado === "progress").length,
    convertidas: rows.filter(r => r.estado === "done").length,
    estimado:    rows.filter(r => r.estado !== "done" && r.estado !== "cancel")
                     .reduce((s, r) => s + (r.estimacion_eur || 0), 0),
  };

  // ── Filtrado activas ──
  const filtered = rows.filter(r => {
    if (tab && r.estado !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      const coms = Array.isArray(r.comunidades) ? r.comunidades.join(" ") : "";
      if (!`${r.nombre} ${r.contacto} ${r.numero} ${coms}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const TABS = [
    { key: "",         label: "Todas" },
    { key: "new",      label: "🆕 Nuevas" },
    { key: "progress", label: "⏳ En proceso" },
    { key: "done",     label: "✅ Convertidas" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {modal && (
        <Modal
          row={modal}
          onClose={() => setModal(null)}
          onStatusChange={handleStatusChange}
          onArchivar={handleArchivar}
          isAdmin={isAdmin}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Solicitudes de Presupuesto</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Solicitudes recibidas desde el portal de servicios</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm font-medium">
              <button
                onClick={() => setVista("activas")}
                className={`px-4 py-2 transition ${vista === "activas" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Activas
              </button>
              <button
                onClick={() => setVista("papelera")}
                className={`px-4 py-2 transition border-l border-neutral-200 ${vista === "papelera" ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Papelera {archivadas.length > 0 && <span className="ml-1 text-xs">({archivadas.length})</span>}
              </button>
            </div>
          )}
          {vista === "activas" && (
            <button onClick={cargar} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">
              ↻ Actualizar
            </button>
          )}
        </div>
      </div>

      {/* ══ VISTA ACTIVAS ══ */}
      {vista === "activas" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard accent="blue"  label="Nuevas"         value={stats.nuevas}      sub={`${rows.length} total`} />
            <StatCard accent="amber" label="En proceso"     value={stats.progreso}    sub="pendientes de gestión" />
            <StatCard accent="green" label="Convertidas"    value={stats.convertidas} sub="clientes ganados" />
            <StatCard accent="gold"  label="Est. pendiente" value={fmt(Math.round(stats.estimado))} sub="en solicitudes activas" />
          </div>

          {/* Filtros */}
          <div className="bg-white border border-neutral-200 rounded-xl p-3 flex gap-3 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, contacto, comunidad o nº…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
              {TABS.map(t => {
                const count = t.key ? rows.filter(r => r.estado === t.key).length : rows.length;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                      tab === t.key ? "bg-white text-[#1a5c3a] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabla desktop */}
          <div className="hidden sm:block rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                  <th className="px-4 py-3">Nº · Cliente</th>
                  <th className="px-4 py-3">Comunidades</th>
                  <th className="px-4 py-3">Universidades</th>
                  <th className="px-4 py-3">Estimación</th>
                  <th className="px-4 py-3">Servicios</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Cargando…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">No hay solicitudes con esos filtros.</td></tr>}
                {!loading && filtered.map(r => {
                  const coms = Array.isArray(r.comunidades) ? r.comunidades : [];
                  const svcs = Array.isArray(r.servicios)   ? r.servicios   : [];
                  return (
                    <tr key={r.id} onClick={() => setModal(r)} className="hover:bg-neutral-50 cursor-pointer transition">
                      <td className="px-4 py-3">
                        <p className="font-['Fraunces'] text-[#c9922a] font-bold text-xs">{r.numero}</p>
                        <p className="font-semibold text-neutral-800 text-sm">{r.nombre}</p>
                        <p className="text-neutral-400 text-xs">{r.contacto}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {coms.slice(0, 3).map(c => <ComTag key={c} label={c} />)}
                          {coms.length > 3 && <span className="text-neutral-400 text-xs font-medium">+{coms.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-neutral-700 text-xs font-medium">{r.cant_unis || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-['Fraunces'] font-bold text-[#0d3320]">{fmt(r.estimacion_eur)}</p>
                        {r.estimacion_eur && <p className="text-neutral-400 text-xs">≈ S/ {Math.round(r.estimacion_eur * 4.10).toLocaleString("es-ES")}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-neutral-600 text-xs">{svcs.slice(0, 2).join(" · ") || "—"}</p>
                        {svcs.length > 2 && <p className="text-neutral-400 text-xs">+{svcs.length - 2} más</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-neutral-700 text-xs">{fmtFecha(r.fecha_creacion)}</p>
                        <p className="text-neutral-400 text-xs">{fmtHora(r.fecha_creacion)}</p>
                      </td>
                      <td className="px-4 py-3"><StatusPill status={r.estado} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="sm:hidden space-y-3">
            {loading && <p className="text-center text-neutral-400 py-8 text-sm">Cargando…</p>}
            {!loading && filtered.length === 0 && <p className="text-center text-neutral-400 py-8 text-sm">No hay solicitudes.</p>}
            {!loading && filtered.map(r => {
              const coms = Array.isArray(r.comunidades) ? r.comunidades : [];
              return (
                <div key={r.id} onClick={() => setModal(r)} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#1a5c3a]/40 transition space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-['Fraunces'] text-[#c9922a] font-bold text-xs">{r.numero}</p>
                      <p className="font-semibold text-neutral-800">{r.nombre}</p>
                      <p className="text-neutral-500 text-xs">{r.contacto}</p>
                    </div>
                    <StatusPill status={r.estado} />
                  </div>
                  {r.cant_unis && <p className="text-xs text-neutral-500">Universidades: <span className="font-medium text-neutral-700">{r.cant_unis}</span></p>}
                  <div className="flex flex-wrap gap-1">
                    {coms.slice(0, 4).map(c => <ComTag key={c} label={c} />)}
                    {coms.length > 4 && <span className="text-neutral-400 text-xs">+{coms.length - 4}</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{fmt(r.estimacion_eur)}</span>
                    <span>{fmtFecha(r.fecha_creacion)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══ VISTA PAPELERA ══ */}
      {vista === "papelera" && isAdmin && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex justify-between items-center bg-red-50">
            <span className="text-sm font-semibold text-red-700">Solicitudes archivadas</span>
            <span className="text-xs text-red-400">{archivadas.length} archivada{archivadas.length !== 1 ? "s" : ""}</span>
          </div>

          {loading && <div className="p-8 text-center text-neutral-400 text-sm">Cargando…</div>}
          {!loading && archivadas.length === 0 && <p className="p-6 text-sm text-neutral-400 text-center">La papelera está vacía.</p>}

          {!loading && archivadas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-red-50 text-red-700 text-left text-xs font-bold uppercase tracking-wide">
                    {["Nº · Cliente", "Comunidades", "Universidades", "Estimación", "Archivada el", "Acciones"].map(h => (
                      <th key={h} className={`px-4 py-3 ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {archivadas.map(r => {
                    const coms = Array.isArray(r.comunidades) ? r.comunidades : [];
                    return (
                      <tr key={r.id} className="hover:bg-red-50/40 transition">
                        <td className="px-4 py-3">
                          <p className="font-['Fraunces'] text-[#c9922a] font-bold text-xs">{r.numero}</p>
                          <p className="font-semibold text-neutral-700 text-sm">{r.nombre}</p>
                          <p className="text-neutral-400 text-xs">{r.contacto}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {coms.slice(0, 3).map(c => <ComTag key={c} label={c} />)}
                            {coms.length > 3 && <span className="text-neutral-400 text-xs">+{coms.length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{r.cant_unis || "—"}</td>
                        <td className="px-4 py-3">
                          <p className="font-['Fraunces'] font-bold text-[#0d3320]">{fmt(r.estimacion_eur)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {r.archivada_en ? fmtFecha(r.archivada_en) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRestaurar(r.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={() => handlePurgar(r.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                            >
                              Purgar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
