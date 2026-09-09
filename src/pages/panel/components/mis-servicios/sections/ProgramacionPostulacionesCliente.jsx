// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useRef, useState } from "react";
import { apiGET, apiPOST, apiUpload } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";
import IconoPaso from "../../../../../components/common/IconoPaso";
import { agruparPorPortal, estadoPortal, fechasPortal, unirCampo } from "../../../../../lib/portales";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFecha(str) {
  if (!str) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(str)) ? new Date(str + "T12:00:00") : new Date(str);
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

const DOC_LABEL = { falta: "Falta", pendiente: "En revisión", ok: "Subido" };
const DOC_CLS   = {
  falta:    "bg-red-50 text-red-600 border-red-200",
  pendiente:"bg-amber-50 text-amber-600 border-amber-200",
  ok:       "bg-emerald-50 text-emerald-600 border-emerald-200",
};

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

  const resguardos = (post.justificantes || []).filter((j) => j.visible_para_cliente !== false);
  async function descargarResguardo(j) {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${API_URL}/portales/justificantes/${j.id_justificante}/descargar`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = j.nombre_archivo || "resguardo.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch { /* el botón queda; se puede reintentar */ }
  }

  return (
    <div className="space-y-2">
      {resguardos.map((j) => (
        <div key={j.id_justificante} className="ex-arch">
          <IconoPaso nombre="filetick" className="w-4 h-4" />
          <span className="nm" title={j.nombre_archivo}>{j.tipo_justificante === "COMPROBANTE_PAGO" ? "Comprobante de pago" : j.tipo_justificante === "OTRO" ? "Constancia" : "Resguardo de la solicitud"} · {j.nombre_archivo}</span>
          <small>{j.fecha_subida ? fmtFecha(j.fecha_subida) : ""}</small>
          <button type="button" onClick={() => descargarResguardo(j)}><IconoPaso nombre="download" className="w-3.5 h-3.5" /> Descargar</button>
        </div>
      ))}
      {resguardos.length === 0 && (post.documentos || []).length === 0 && (
        <p className="text-xs text-neutral-400 italic text-center py-2">Sin resguardo todavía: se guarda al presentar la solicitud.</p>
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

// ── La tarjeta de cada postulación ───────────────────────────────────────────
//
// Lo que el asesorado necesita saber y nada más (Carina, 08/09/2026): en qué
// punto va, cuándo salen los resultados, sus claves y su resguardo, y —solo si
// lo admiten— la carta y la matrícula. Quien vigila el portal es su asesor, así
// que aquí no hay checklist ni tareas suyas.

const ESTADO_INFO = {
  pendiente: { label: "Pendiente de postular", cls: "bg-neutral-100 text-neutral-500", ico: "clock" },
  proceso:   { label: "En preparación",        cls: "bg-sky-50 text-sky-700",          ico: "edit" },
  postulado: { label: "Postulada",             cls: "bg-sky-50 text-sky-700",          ico: "send" },
  admitido:  { label: "Admitida",              cls: "bg-emerald-50 text-emerald-700",  ico: "check" },
  lista:     { label: "En lista de espera",    cls: "bg-amber-50 text-amber-700",      ico: "clock" },
  denegado:  { label: "No admitida",           cls: "bg-red-50 text-red-600",          ico: "x" },
};

function LineaTiempo({ post }) {
  const presentada   = ["postulado", "admitido", "lista", "denegado"].includes(post.estado);
  const conResultado = ["admitido", "lista", "denegado"].includes(post.estado);
  const admitida     = post.estado === "admitido";
  const plazo = post.fecha_apertura || post.fecha_cierre
    ? `${post.fecha_apertura ? fmtFecha(post.fecha_apertura) : "—"} → ${post.fecha_cierre ? fmtFecha(post.fecha_cierre) : "—"}`
    : "por confirmar";
  const pasos = [
    { t: "Plazo",      d: plazo,                                              e: presentada ? "ok" : "on" },
    { t: "Presentada", d: presentada ? "hecho" : "pendiente",                 e: presentada ? "ok" : "" },
    { t: "Resultados", d: post.fecha_resultados ? fmtFecha(post.fecha_resultados) : "por publicar", e: conResultado ? "ok" : presentada ? "on" : "" },
    { t: "Matrícula",  d: admitida ? "con tu asesor" : "—",                   e: admitida ? "on" : "" },
  ];
  return (
    <ol className="grid grid-cols-4 gap-1 px-4 pb-3 relative">
      <span className="absolute left-[calc(1rem+12.5%)] right-[calc(1rem+12.5%)] top-[9px] h-0.5 bg-neutral-100" aria-hidden="true" />
      {pasos.map((p) => (
        <li key={p.t} className="relative text-center">
          <span className={`mx-auto mb-1.5 grid place-items-center w-5 h-5 rounded-full border-2 ${
            p.e === "ok" ? "bg-emerald-600 border-emerald-600 text-white"
            : p.e === "on" ? "bg-sky-100 border-sky-400"
            : "bg-white border-neutral-200"
          }`}>
            {p.e === "ok" && <IconoPaso nombre="check" className="w-2.5 h-2.5" strokeWidth={3} />}
          </span>
          <span className="block text-[10px] font-bold text-neutral-700 leading-tight">{p.t}</span>
          <span className="block text-[9.5px] text-neutral-400 leading-tight">{p.d}</span>
        </li>
      ))}
    </ol>
  );
}

function Plegable({ icono, titulo, children, abierto = false }) {
  const [open, setOpen] = useState(abierto);
  return (
    <div className="border-t border-neutral-100">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="ux-tap w-full flex items-center gap-2.5 px-4 py-3 text-left">
        <span className="w-7 h-7 rounded-lg bg-neutral-100 text-primary-light grid place-items-center shrink-0">
          <IconoPaso nombre={icono} className="w-3.5 h-3.5" />
        </span>
        <span className="flex-1 text-[12.5px] font-bold text-neutral-800">{titulo}</span>
        <svg className={`w-4 h-4 text-neutral-300 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pnl-entra">{children}</div>}
    </div>
  );
}

// Lo que el asesor anota del portal: un requerimiento (piden algo, con
// plazo), una notificación o el resultado. Quien vigila el portal es el
// asesor; aquí solo se ve qué pasó y qué hay que hacer.
const AVISO_ICO = { REQUERIMIENTO: "alert", NOTIFICACION: "bell", RESULTADO: "trophy" };
const AVISO_TIT = { REQUERIMIENTO: "Requerimiento", NOTIFICACION: "Notificación", RESULTADO: "Resultado" };
function AvisosPortal({ avisos }) {
  const lista = Array.isArray(avisos) ? [...avisos].reverse() : [];
  if (!lista.length) return null;
  return (
    <div className="px-4 pb-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light mb-2">Avisos del portal</p>
      {lista.map((a) => (
        <div key={a.id} className="ex-req" data-t={a.tipo}>
          <span className="ico"><IconoPaso nombre={AVISO_ICO[a.tipo] || "info"} /></span>
          <div>
            <b>{AVISO_TIT[a.tipo] || a.tipo}</b> · {fmtFecha(a.fecha)}<br />{a.texto}
            {a.respondido
              ? <small>Resuelto por tu asesor el {fmtFecha(a.respondido)}. No tienes que hacer nada.</small>
              : a.tipo === "REQUERIMIENTO"
                ? <small>Tu asesor lo presenta en el portal; si necesita algo tuyo, te escribe por Mensajes.</small>
                : null}
          </div>
          {a.tipo !== "RESULTADO" && (
            a.respondido
              ? <span className="ex-est" data-e="ok">Respondido</span>
              : a.plazo ? <span className="ex-est" data-e="warn">Hasta {fmtFecha(a.plazo)}</span> : <span />
          )}
        </div>
      ))}
    </div>
  );
}

const PILL_PORTAL = {
  admitida:   ["Admitida",              "bg-emerald-50 text-emerald-700", "check"],
  resultado:  ["Con resultado",         "bg-sky-50 text-sky-700",         "flag"],
  presentada: ["Postulada",             "bg-sky-50 text-sky-700",         "send"],
  preparando: ["En preparación",        "bg-sky-50 text-sky-700",         "edit"],
  pendiente:  ["Pendiente de postular", "bg-neutral-100 text-neutral-500", "clock"],
};
const TONO_OPC = { admitido: "ok", lista: "warn", denegado: "no", postulado: "on", proceso: "on", pendiente: "info" };

// Una tarjeta por portal (09/09/2026): en Andalucía se postula una sola vez
// por el Distrito Único con los másteres en orden, así que el portal es la
// unidad y los másteres son sus opciones. Las claves, el resguardo y los
// avisos son del portal, no de cada máster.
function PortalCard({ grupo, idSolicitud, onSave }) {
  const { portal, posts, titular } = grupo;
  const estado = estadoPortal(posts);
  const fechas = fechasPortal(posts);
  const admitidas = posts.filter((p) => p.estado === "admitido");
  const avisos = unirCampo(posts, "avisos").sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));
  const [pillTxt, pillCls, pillIco] = PILL_PORTAL[estado] || PILL_PORTAL.pendiente;
  // La línea de tiempo habla del portal: si alguna opción se presentó, el
  // portal está presentado; si alguna tiene resultado, hay resultado.
  const estadoLinea = estado === "admitida" ? "admitido" : estado === "resultado" ? "lista" : estado === "presentada" ? "postulado" : estado === "preparando" ? "proceso" : "pendiente";
  const paraLinea = { ...titular, ...fechas, estado: estadoLinea };
  const paraDocs = {
    ...titular,
    justificantes: unirCampo(posts, "justificantes"),
    documentos: unirCampo(posts, "documentos"),
    portales_cliente: unirCampo(posts, "portales_cliente"),
  };
  const onSaveF = (field, value) => onSave(titular.id_master, field, value);

  return (
    <article className={`border rounded-2xl overflow-hidden bg-white ${estado === "admitida" ? "border-emerald-300" : "border-neutral-200"}`}>
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span className={`shrink-0 w-10 h-10 rounded-xl grid place-items-center ${estado === "admitida" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-primary-light"}`}>
          <IconoPaso nombre={portal.icono} className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-neutral-900 leading-snug">{portal.nombre}</p>
          <p className="text-[11.5px] text-neutral-500 leading-snug">{portal.organismo}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${pillCls}`}>
          <IconoPaso nombre={pillIco} className="w-3 h-3" strokeWidth={2.4} />
          {pillTxt}
        </span>
      </div>

      <LineaTiempo post={paraLinea} />

      {(fechas.fase_nombre || fechas.fecha_resultados) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {fechas.fase_nombre ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700">
              {fechas.fase_nombre}{fechas.fase_curso ? ` · curso ${fechas.fase_curso}` : ""}
            </span>
          ) : null}
          {fechas.fecha_resultados ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
              Resultados: {fmtFecha(fechas.fecha_resultados)}
            </span>
          ) : null}
        </div>
      )}

      {/* Las opciones del portal, en el orden que eligió el asesorado */}
      <div className="px-4 pb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light mb-1">
          {posts.length > 1 ? "Tus opciones, en el orden que elegiste" : "Máster"}
        </p>
        {posts.map((p, i) => {
          const info = ESTADO_INFO[p.estado] || ESTADO_INFO.pendiente;
          return (
            <div key={p.id_master} className="ex-opc">
              <i>{i + 1}.º</i>
              <div className="min-w-0">
                <div className="n">{p.nombre_limpio}</div>
                <div className="u">{[p.universidad, p.ciudad, p.precio ? `${Math.round(p.precio).toLocaleString("es-ES")} € el curso` : null].filter(Boolean).join(" · ")}</div>
              </div>
              <span className="ex-est" data-e={TONO_OPC[p.estado] || "info"}>
                <IconoPaso nombre={info.ico} /> {info.label}
              </span>
              {p.estado === "lista" && (
                <div className="sub">Si alguien renuncia, subes de puesto. Tu asesor revisa cada adjudicación y te avisa.</div>
              )}
            </div>
          );
        })}
      </div>

      {admitidas.map((p) => (
        <div key={p.id_master} className="mx-4 mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
          <p className="text-[12.5px] font-bold text-emerald-800">🎉 Te han admitido{posts.length > 1 ? ` en ${p.nombre_limpio}` : ""}</p>
          <p className="text-[11.5px] text-emerald-900/80 leading-relaxed mt-0.5">
            Tu carta de admisión y, cuando la hagas, tu matrícula quedan guardadas
            en <b>Documentos del proceso</b>, más abajo en este mismo paso.
          </p>
        </div>
      ))}

      <AvisosPortal avisos={avisos} />

      <Plegable icono="lock" titulo="Acceso al portal y claves">
        <TabPortal post={paraDocs} onSave={onSaveF} />
      </Plegable>

      <Plegable icono="fileText" titulo="Resguardo y justificantes" abierto={estado === "presentada"}>
        <TabDocs post={paraDocs} idSolicitud={idSolicitud} onSave={onSaveF} />
      </Plegable>

      {titular.seguimiento ? (
        <Plegable icono="message" titulo="Notas de tu asesor">
          <TabSeguimiento post={titular} />
        </Plegable>
      ) : null}
    </article>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Dentro de Postulaciones va sin su propia tarjeta: el paso ya la pone.
function SinMarco({ children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light mb-2">Seguimiento por portal</p>
      {children}
    </div>
  );
}

export default function ProgramacionPostulacionesCliente({ idSolicitud, resetKey, reloadKey, sinMarco = false }) {
  const Marco = sinMarco ? SinMarco : SeccionPanel;
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
    <Marco
      numero="5"
      titulo="Postulaciones · Portales · Seguimiento"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="5"
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
            Esta sección se activa cuando tu asesor aprueba tu elección de másteres (paso 4).
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {saving && (
            <p className="text-[10px] text-neutral-400 font-mono text-right">Guardando…</p>
          )}
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-2.5">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-white/80 text-primary-light grid place-items-center">
              <IconoPaso nombre="search" className="w-3.5 h-3.5" />
            </span>
            <p className="text-[12px] text-sky-900 leading-relaxed">
              <b>Tu asesor vigila los portales</b> y te avisa de cada requerimiento,
              notificación y resultado. No tienes que entrar a comprobarlo.
            </p>
          </div>
          {agruparPorPortal(posts).map((grupo) => (
            <PortalCard
              key={grupo.portal.id}
              grupo={grupo}
              idSolicitud={idSolicitud}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </Marco>
  );
}
