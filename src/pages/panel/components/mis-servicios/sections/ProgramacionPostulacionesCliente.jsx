// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useRef, useState } from "react";
import { apiGET, apiPOST, apiUpload } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";

// ── Helpers ───────────────────────────────────────────────────────────────────

function diasHasta(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function fmtFecha(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (!isNaN(d.getTime()) && /\d{4}-\d{2}/.test(str))
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return str;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function verArchivo(idSolicitud, storagePath) {
  try {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/solicitudes/${idSolicitud}/justificante-stream?path=${encodeURIComponent(storagePath)}`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error("No se pudo cargar el archivo");
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    window.open(objUrl, "_blank");
  } catch (e) {
    console.error(e);
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const P_COLORS = ["#013446", "#1D6A4A", "#f59e0b", "#9ca3af", "#d1d5db"];

const ESTADOS_OPT = [
  { val: "pendiente", label: "⏳ Pendiente" },
  { val: "proceso",   label: "⚡ En proceso" },
  { val: "postulado", label: "📤 Postulado" },
  { val: "admitido",  label: "✅ Admitido" },
  { val: "denegado",  label: "❌ Denegado" },
  { val: "lista",     label: "⏳ Lista espera" },
];

const TABS = [
  { id: "fec", label: "📅 Fechas" },
  { id: "por", label: "🔗 Portal y claves" },
  { id: "doc", label: "📁 Justificantes" },
  { id: "seg", label: "📝 Seguimiento" },
];

const DOC_LABEL = { falta: "Falta", pendiente: "En revisión", ok: "Subido" };
const DOC_CLS   = {
  falta:    "bg-red-50 text-red-600 border-red-200",
  pendiente:"bg-amber-50 text-amber-600 border-amber-200",
  ok:       "bg-emerald-50 text-emerald-600 border-emerald-200",
};

// ── KanbanMini ────────────────────────────────────────────────────────────────

function KanbanMini({ posts }) {
  const n = (e) => posts.filter((p) => p.estado === e).length;
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { key: "pendiente", label: "Pendiente", cls: "text-neutral-400",  bg: "bg-neutral-50 border-neutral-100" },
        { key: "proceso",   label: "En proceso", cls: "text-primary",   bg: "bg-primary/5 border-primary/15" },
        { key: "postulado", label: "Postulado",  cls: "text-amber-500",   bg: "bg-amber-50 border-amber-100" },
        { key: "admitido",  label: "Admitido",   cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
      ].map(({ key, label, cls, bg }) => (
        <div key={key} className={`rounded-xl border text-center py-2.5 ${bg}`}>
          <p className={`text-[9px] font-bold uppercase tracking-widest font-mono ${cls}`}>{label}</p>
          <p className={`font-serif text-xl font-black mt-0.5 ${cls}`}>{n(key)}</p>
        </div>
      ))}
    </div>
  );
}

// ── AlertaBanner ──────────────────────────────────────────────────────────────

function AlertaBanner({ posts }) {
  const urgentes = posts
    .map((p) => ({ ...p, dias: diasHasta(p.fecha_cierre) }))
    .filter((p) => p.dias !== null && p.dias > 0 && p.dias <= 20)
    .sort((a, b) => a.dias - b.dias);
  if (!urgentes.length) return null;
  const u = urgentes[0];
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
      <span className="shrink-0 mt-0.5">🚨</span>
      <span>
        <strong>Cierre urgente:</strong> {u.nombre_limpio} cierra el{" "}
        <strong>{fmtFecha(u.fecha_cierre)} — en {u.dias} día{u.dias !== 1 ? "s" : ""}</strong>.
        Verificar documentos y portal.
      </span>
    </div>
  );
}

// ── TabFechas (read-only + toggles alertas) ───────────────────────────────────

function FechaBox({ label, valor, field }) {
  const dias = field === "fecha_cierre" ? diasHasta(valor) : null;
  const urgente = dias !== null && dias > 0 && dias <= 7;
  const pronto  = dias !== null && dias > 7  && dias <= 30;
  return (
    <div className={`rounded-xl border p-3 text-center ${
      urgente ? "border-red-200 bg-red-50"
      : pronto  ? "border-amber-200 bg-amber-50"
      : valor   ? "border-emerald-200 bg-emerald-50"
      : "border-neutral-200 bg-white"
    }`}>
      {urgente && <div className="w-2 h-2 rounded-full bg-red-500 mx-auto mb-1 animate-pulse" />}
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-neutral-700">{fmtFecha(valor)}</p>
      {dias !== null && dias > 0 && (
        <p className={`text-[10px] mt-1 font-mono font-bold ${urgente ? "text-red-600" : pronto ? "text-amber-600" : "text-neutral-400"}`}>
          {urgente ? `⚠ ${dias} días` : `~${dias} días`}
        </p>
      )}
      {valor && dias !== null && dias <= 0 && (
        <p className="text-[10px] mt-1 text-emerald-600 font-semibold">✓ Pasada</p>
      )}
    </div>
  );
}

function TabFechas({ post, onSave }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <FechaBox label="Apertura"   valor={post.fecha_apertura}   field="fecha_apertura" />
        <FechaBox label="Cierre"     valor={post.fecha_cierre}     field="fecha_cierre" />
        <FechaBox label="Resultados" valor={post.fecha_resultados} field="fecha_resultados" />
      </div>
      {post.fase_nombre && (
        <p className="text-[10.5px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5">
          Convocatoria mas cercana: <strong className="text-primary">{post.fase_nombre}</strong>
          {post.fase_curso ? <> — para empezar el curso <strong className="text-primary">{post.fase_curso}</strong></> : null}.
          Si el plan es entrar un curso mas tarde, el plazo que le toca es otro.
          Las fechas las publica la universidad y pueden cambiar.
        </p>
      )}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Alertas automáticas programadas
        </p>
        <div className="space-y-1.5">
          {(post.alertas || []).map((al, idx) => (
            <div key={al.tipo} className="flex items-center gap-3 bg-neutral-50 rounded-lg px-3 py-2">
              <span className="text-sm">{idx === 0 ? "🚨" : idx === 1 ? "⚠️" : "🔴"}</span>
              <p className="flex-1 min-w-0 text-xs font-medium text-neutral-700">{al.label}</p>
              <button
                type="button"
                onClick={() => {
                  const next = post.alertas.map((a, i) => i === idx ? { ...a, activo: !a.activo } : a);
                  onSave("alertas", next);
                }}
                className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${al.activo ? "bg-primary" : "bg-neutral-200"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${al.activo ? "left-[calc(100%-18px)]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TabPortal (admin read-only + portales propios del cliente) ────────────────

function InfoField({ label, value, secret }) {
  const [visible, setVisible] = useState(false);
  if (!value) return null;
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="flex-1 text-xs text-neutral-700 font-mono break-all">
          {secret && !visible ? "••••••••" : value}
        </span>
        {secret && (
          <button type="button" onClick={() => setVisible((v) => !v)}
            className="shrink-0 text-[11px] border border-neutral-200 rounded px-1.5 py-1 hover:bg-neutral-50">
            {visible ? "🙈" : "👁"}
          </button>
        )}
        <button type="button" onClick={() => navigator.clipboard?.writeText(value)}
          className="shrink-0 text-[11px] border border-neutral-200 rounded px-1.5 py-1 hover:bg-neutral-50">
          📋
        </button>
      </div>
    </div>
  );
}

const PORTAL_FIELDS = [
  { key: "label",    label: "Nombre / descripción", placeholder: "Ej: Mi acceso propio" },
  { key: "url",      label: "URL",                  placeholder: "https://..." },
  { key: "usuario",  label: "Usuario",              placeholder: "" },
  { key: "password", label: "Contraseña",           placeholder: "" },
  { key: "notas",    label: "Notas",                placeholder: "" },
];

const PORTAL_VACIO = { label: "", url: "", usuario: "", password: "", notas: "" };

function TabPortal({ post, onSave }) {
  const [nuevo, setNuevo] = useState(PORTAL_VACIO);
  const [adding, setAdding] = useState(false);

  const tieneAdmin = post.portal_url || post.portal_usuario || post.portal_password;
  const portalesCliente = Array.isArray(post.portales_cliente) ? post.portales_cliente : [];

  function addPortalCliente() {
    if (!nuevo.url && !nuevo.label) return;
    onSave("portales_cliente", [...portalesCliente, { ...nuevo }]);
    setNuevo(PORTAL_VACIO);
    setAdding(false);
  }

  function removePortalCliente(idx) {
    onSave("portales_cliente", portalesCliente.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {/* Portal del asesor — solo lectura */}
      {tieneAdmin ? (
        <div className="space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
            Portal configurado por tu asesor
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 space-y-2">
            <InfoField label="URL del portal"  value={post.portal_url} />
            <InfoField label="Usuario"         value={post.portal_usuario} />
            <InfoField label="Contraseña"      value={post.portal_password} secret />
            <InfoField label="N.º expediente"  value={post.expediente} />
            <InfoField label="Notas de acceso" value={post.portal_notas} />
            {post.portal_estado && (
              <p className="text-[10px] text-neutral-400">
                Estado: <span className="font-semibold text-neutral-600">{post.portal_estado}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">Tu asesor aún no ha configurado el portal.</p>
      )}

      {/* Portales propios del cliente */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
            Mis portales adicionales
          </p>
          <button type="button" onClick={() => setAdding((v) => !v)}
            className="text-[11px] font-semibold text-primary hover:underline">
            + Añadir
          </button>
        </div>

        {portalesCliente.map((p, idx) => (
          <div key={idx} className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-700">{p.label || p.url}</p>
              <button type="button" onClick={() => removePortalCliente(idx)}
                className="text-neutral-300 hover:text-red-400 text-xs">✕</button>
            </div>
            <InfoField label="URL"        value={p.url} />
            <InfoField label="Usuario"    value={p.usuario} />
            <InfoField label="Contraseña" value={p.password} secret />
            {p.notas && <p className="text-[10px] text-neutral-500">{p.notas}</p>}
          </div>
        ))}

        {adding && (
          <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-xl px-3 py-3 space-y-2">
            {PORTAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">
                  {label}
                </label>
                <input
                  type={key === "password" ? "password" : "text"}
                  value={nuevo[key]}
                  onChange={(e) => setNuevo((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={addPortalCliente}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-primary text-white">
                Guardar
              </button>
              <button type="button" onClick={() => setAdding(false)}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-neutral-200 text-neutral-500">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TabDocs (upload por ítem, sin borrar) ─────────────────────────────────────

function TabDocs({ post, idSolicitud, onSave }) {
  const [uploading, setUploading] = useState({});

  async function handleUpload(idx, file) {
    setUploading((v) => ({ ...v, [idx]: true }));
    try {
      const form = new FormData();
      form.append("archivo", file);
      const data = await apiUpload(`/solicitudes/${idSolicitud}/upload-justificante`, form);
      if (data.ok) {
        const docs = (post.documentos || []).map((d, i) =>
          i === idx ? { ...d, estado: "pendiente", url_archivo: data.path, nombre_archivo: data.nombre } : d
        );
        onSave("documentos", docs);
      }
    } catch (e) {
      console.error("Error subiendo justificante:", e);
    } finally {
      setUploading((v) => ({ ...v, [idx]: false }));
    }
  }

  return (
    <div className="space-y-2">
      {(post.documentos || []).length === 0 && (
        <p className="text-xs text-neutral-400 italic text-center py-2">Sin documentos aún.</p>
      )}
      {(post.documentos || []).map((doc, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
          <span className="text-sm shrink-0">📄</span>
          <span className="flex-1 min-w-0 text-xs text-neutral-700 truncate">{doc.nombre}</span>
          {doc.url_archivo && (
            <button type="button"
              onClick={() => verArchivo(idSolicitud, doc.url_archivo)}
              className="shrink-0 text-[10px] text-primary underline">
              Ver
            </button>
          )}
          <span className={`shrink-0 text-[10px] font-bold border rounded-full px-2 py-0.5 ${DOC_CLS[doc.estado] ?? ""}`}>
            {DOC_LABEL[doc.estado] ?? doc.estado}
          </span>
          <label className="shrink-0 cursor-pointer text-[10px] border border-neutral-200 rounded-lg px-2 py-0.5 hover:bg-neutral-100 text-neutral-500">
            {uploading[idx] ? "⏳" : "↑ Subir"}
            <input type="file" className="hidden"
              onChange={(e) => e.target.files[0] && handleUpload(idx, e.target.files[0])} />
          </label>
        </div>
      ))}
    </div>
  );
}

// ── TabSeguimiento (solo lectura) ─────────────────────────────────────────────

function TabSeguimiento({ post }) {
  if (!post.seguimiento) {
    return <p className="text-xs text-neutral-400 italic py-2">Sin notas de seguimiento aún.</p>;
  }
  return (
    <div className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-100">
      {post.seguimiento}
    </div>
  );
}

// ── MasterPostCard ────────────────────────────────────────────────────────────

function MasterPostCard({ post, idSolicitud, onUpdate, onSave }) {
  const [tab, setTab] = useState("fec");

  const idx     = Math.max(0, (post.prioridad || 1) - 1);
  const color   = P_COLORS[idx] ?? "#9ca3af";
  const dias    = diasHasta(post.fecha_cierre);
  const urgente = dias !== null && dias > 0 && dias <= 20;

  const subtitle = [
    post.ciudad,
    post.precio ? `${Math.round(post.precio).toLocaleString("es-ES")} €/año` : null,
    post.fecha_cierre ? `Cierre: ${fmtFecha(post.fecha_cierre)}${urgente ? " 🔴" : ""}` : null,
  ].filter(Boolean).join(" · ");

  const onSaveF = (field, value) => onSave(post.id_master, field, value);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border-b border-neutral-100">
        <div
          style={{ background: color }}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white font-mono"
        >
          P{post.prioridad || idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900 leading-tight truncate">
            {post.nombre_limpio || "(Sin nombre)"}
          </p>
          {subtitle && <p className="text-[11px] text-neutral-500 truncate mt-0.5">{subtitle}</p>}
        </div>
        <select
          value={post.estado}
          onChange={(e) => onSaveF("estado", e.target.value)}
          className="shrink-0 text-[11px] font-semibold border border-neutral-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-primary cursor-pointer"
        >
          {ESTADOS_OPT.map((o) => (
            <option key={o.val} value={o.val}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`shrink-0 px-3.5 py-2 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="px-4 py-3">
        {tab === "fec" && <TabFechas      post={post} onSave={onSaveF} />}
        {tab === "por" && <TabPortal      post={post} onSave={onSaveF} />}
        {tab === "doc" && <TabDocs        post={post} idSolicitud={idSolicitud} onSave={onSaveF} />}
        {tab === "seg" && <TabSeguimiento post={post} />}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProgramacionPostulacionesCliente({ idSolicitud, resetKey, reloadKey }) {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const isMount = useRef(true);

  useEffect(() => {
    setLoading(true);
    apiGET(`/solicitudes/${idSolicitud}/postulaciones`)
      .then((r) => { if (r.ok) setPosts(r.postulaciones || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [idSolicitud]);

  useEffect(() => {
    if (!reloadKey) return;
    setLoading(true);
    apiGET(`/solicitudes/${idSolicitud}/postulaciones`)
      .then((r) => { if (r.ok) setPosts(r.postulaciones || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reloadKey]); // eslint-disable-line

  useEffect(() => {
    if (isMount.current) { isMount.current = false; return; }
    setPosts([]);
  }, [resetKey]); // eslint-disable-line

  async function guardar(nextPosts) {
    setSaving(true);
    try {
      await apiPOST(`/solicitudes/${idSolicitud}/postulaciones`, { postulaciones: nextPosts });
    } catch { /* silencioso */ }
    finally { setSaving(false); }
  }

  function handleUpdate(id_master, field, value) {
    setPosts((prev) => prev.map((p) => p.id_master === id_master ? { ...p, [field]: value } : p));
  }

  function handleSave(id_master, field, value) {
    let next;
    setPosts((prev) => {
      next = prev.map((p) => p.id_master === id_master ? { ...p, [field]: value } : p);
      return next;
    });
    if (next) guardar(next);
  }

  const nActivos = posts.filter((p) => ["proceso", "postulado"].includes(p.estado)).length;
  const estado   = posts.some((p) => p.estado === "admitido")                        ? "completado"
                 : posts.some((p) => ["proceso", "postulado"].includes(p.estado))    ? "progreso"
                 : "pendiente";
  const subtitulo = loading
    ? "Cargando…"
    : posts.length > 0
      ? `${posts.length} máster${posts.length !== 1 ? "es" : ""} · ${nActivos} activo${nActivos !== 1 ? "s" : ""}`
      : "Completa tu elección de másteres para activar esta sección.";

  return (
    <SeccionPanel
      numero="6"
      titulo="Postulaciones · Portales · Seguimiento"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="6"
    >
      {loading && (
        <div className="flex items-center gap-2 py-3 text-neutral-400 text-sm">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Cargando…
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-lg shrink-0">⚠️</span>
          <p className="text-sm text-amber-800">
            Esta sección se activa automáticamente cuando seleccionas tus másteres en el paso 5.
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {saving && (
            <p className="text-[10px] text-neutral-400 font-mono text-right">Guardando…</p>
          )}
          <KanbanMini posts={posts} />
          <AlertaBanner posts={posts} />
          {posts.map((post) => (
            <MasterPostCard
              key={post.id_master}
              post={post}
              idSolicitud={idSolicitud}
              onUpdate={handleUpdate}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </SeccionPanel>
  );
}
