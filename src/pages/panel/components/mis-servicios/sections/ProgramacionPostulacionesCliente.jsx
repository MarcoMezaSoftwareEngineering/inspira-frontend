// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useRef, useState } from "react";
import { apiGET, apiPOST, apiUpload } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";
import IconoPaso from "../../../../../components/common/IconoPaso";
import Icono from "../../../../../components/common/Icono";
import { IconoLinea } from "../utils";
import { agruparPorPortal, estadoPortal, fechasPortal, unirCampo } from "../../../../../lib/portales";
import { comprobarRespuesta } from "../../../../../services/sesion";
import { prepararArchivos } from "../../../lib/prepararArchivo";

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
    await comprobarRespuesta(res);
    if (!res.ok) throw new Error("No se pudo cargar el archivo");
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    window.open(objUrl, "_blank");
  } catch (e) {
    console.error(e);
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_LABEL = { falta: "Pendiente", pendiente: "En revisión", ok: "Subido" };
// El estado de cada documento, en el tono del panel: lo que falta es neutro,
// lo que está en revisión, info, y lo subido, ok.
const DOC_TONO  = { falta: "neutro", pendiente: "info", ok: "ok" };

// ── TabPortal (admin read-only + portales propios del cliente) ────────────────

function InfoField({ label, value, secret }) {
  const [visible, setVisible] = useState(false);
  if (!value) return null;
  return (
    <div>
      <p className="pnl-eyebrow pnl-post-campo-rotulo">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="pnl-post-campo-valor">
          {secret && !visible ? "••••••••" : value}
        </span>
        {secret && (
          <button type="button" onClick={() => setVisible((v) => !v)}
            className="pnl-btn-icono" data-talla="s" aria-label={visible ? "Ocultar" : "Mostrar"} aria-pressed={visible}>
            <IconoLinea nombre={visible ? "eyeOff" : "eye"} />
          </button>
        )}
        <button type="button" onClick={() => navigator.clipboard?.writeText(value)}
          className="pnl-btn-icono" data-talla="s" aria-label="Copiar">
          <IconoLinea nombre="copy" />
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
          <p className="pnl-eyebrow">
            Portal configurado por tu asesor
          </p>
          <div className="pnl-post-claves space-y-3">
            <InfoField label="URL del portal"  value={post.portal_url} />
            <InfoField label="Usuario"         value={post.portal_usuario} />
            <InfoField label="Contraseña"      value={post.portal_password} secret />
            <InfoField label="N.º expediente"  value={post.expediente} />
            <InfoField label="Notas de acceso" value={post.portal_notas} />
            {post.portal_estado && (
              <p className="pnl-post-meta">
                Estado: <span className="font-semibold text-tinta">{post.portal_estado}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="pnl-post-vacio">Tu asesor aún no ha configurado el portal.</p>
      )}

      {/* Portales propios del cliente */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="pnl-eyebrow">
            Mis portales adicionales
          </p>
          <button type="button" onClick={() => setAdding((v) => !v)}
            className="pnl-btn-texto" data-talla="s" aria-expanded={adding}>
            <IconoPaso nombre="plus" strokeWidth={2.2} />
            Añadir
          </button>
        </div>

        {portalesCliente.map((p, idx) => (
          <div key={idx} className="pnl-post-portal space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="pnl-post-portal-titulo">{p.label || p.url}</p>
              <button type="button" onClick={() => removePortalCliente(idx)}
                className="pnl-btn-icono" data-talla="s" aria-label="Quitar"><IconoPaso nombre="x" strokeWidth={2.2} /></button>
            </div>
            <InfoField label="URL"        value={p.url} />
            <InfoField label="Usuario"    value={p.usuario} />
            <InfoField label="Contraseña" value={p.password} secret />
            {p.notas && <p className="pnl-post-meta">{p.notas}</p>}
          </div>
        ))}

        {adding && (
          <div className="pnl-post-nuevo space-y-3">
            {PORTAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="pnl-campo">
                <label className="pnl-campo-etiqueta">
                  {label}
                </label>
                <input
                  type={key === "password" ? "password" : "text"}
                  value={nuevo[key]}
                  onChange={(e) => setNuevo((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="pnl-campo-control"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={addPortalCliente}
                className="pnl-btn-primario flex-1">
                Guardar
              </button>
              <button type="button" onClick={() => setAdding(false)}
                className="pnl-btn flex-1">
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
  // Por fila: por qué no se subió, o que ya llegó. Antes un fallo solo iba a
  // la consola y el asesorado no sabía si su archivo estaba o no.
  const [resultado, setResultado] = useState({});

  async function handleUpload(idx, file) {
    setUploading((v) => ({ ...v, [idx]: true }));
    setResultado((v) => ({ ...v, [idx]: null }));
    try {
      // Una foto se pasa a PDF y se achica; lo que el servidor iba a rechazar
      // por peso se para aquí, con la explicación. Aquí no hay avisos de
      // borrosa ni de caras: son resguardos y constancias, no documentos
      // de identidad.
      const prep = await prepararArchivos([file], { varios: false });
      if (prep.bloqueo) {
        setResultado((v) => ({ ...v, [idx]: { error: prep.bloqueo } }));
        return;
      }
      const form = new FormData();
      form.append("archivo", prep.archivos[0] || file);
      const data = await apiUpload(`/solicitudes/${idSolicitud}/upload-justificante`, form);
      if (data.ok) {
        const docs = (post.documentos || []).map((d, i) =>
          i === idx ? { ...d, estado: "pendiente", url_archivo: data.path, nombre_archivo: data.nombre } : d
        );
        onSave("documentos", docs);
        setResultado((v) => ({ ...v, [idx]: { ok: true } }));
      }
    } catch (e) {
      console.error("Error subiendo justificante:", e);
      setResultado((v) => ({ ...v, [idx]: { error: e?.message || "No se pudo subir. Inténtalo de nuevo." } }));
    } finally {
      setUploading((v) => ({ ...v, [idx]: false }));
    }
  }

  const resguardos = (post.justificantes || []).filter((j) => j.visible_para_cliente !== false);
  async function descargarResguardo(j) {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${API_URL}/portales/justificantes/${j.id_justificante}/descargar`, { headers: { Authorization: `Bearer ${token}` } });
      await comprobarRespuesta(r);
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
          <IconoLinea nombre="filetick" className="w-4 h-4" />
          <span className="nm" title={j.nombre_archivo}>{j.tipo_justificante === "COMPROBANTE_PAGO" ? "Comprobante de pago" : j.tipo_justificante === "OTRO" ? "Constancia" : "Resguardo de la solicitud"} · {j.nombre_archivo}</span>
          <small>{j.fecha_subida ? fmtFecha(j.fecha_subida) : ""}</small>
          <button type="button" onClick={() => descargarResguardo(j)}><IconoPaso nombre="download" className="w-3.5 h-3.5" /> Descargar</button>
        </div>
      ))}
      {resguardos.length === 0 && (post.documentos || []).length === 0 && (
        <p className="pnl-post-vacio text-center">Sin resguardo todavía: se guarda al presentar la solicitud.</p>
      )}
      {(post.documentos || []).map((doc, idx) => (
        <div key={idx}>
        <div className="pnl-post-doc">
          <IconoPaso nombre="fileText" className="w-4 h-4 shrink-0" />
          <span className="pnl-post-doc-nombre">{doc.nombre}</span>
          {doc.url_archivo && (
            <button type="button"
              onClick={() => verArchivo(idSolicitud, doc.url_archivo)}
              className="pnl-btn-texto" data-talla="s">
              Ver
            </button>
          )}
          <span className="pnl-chip shrink-0" data-talla="sm" data-tono={DOC_TONO[doc.estado] || "neutro"}>
            {DOC_LABEL[doc.estado] ?? doc.estado}
          </span>
          <label className="pnl-btn shrink-0 cursor-pointer" data-talla="s">
            {uploading[idx] ? <span className="pnl-spinner" data-talla="s" /> : <><IconoPaso nombre="upload" /> Subir archivo</>}
            <input type="file" className="pnl-arch-oculto"
              onChange={(e) => { if (e.target.files[0]) handleUpload(idx, e.target.files[0]); e.target.value = ""; }} />
          </label>
        </div>
        {resultado[idx]?.error && (
          <div className="pnl-arch-aviso" data-tono="error" role="alert"><p>{resultado[idx].error}</p></div>
        )}
        {resultado[idx]?.ok && (
          <div className="pnl-arch-aviso" data-tono="ok" role="status">
            <p><b>Recibido.</b> Tu asesor lo revisa y te avisaremos aquí y por correo.</p>
          </div>
        )}
        </div>
      ))}
    </div>
  );
}

// ── TabSeguimiento (solo lectura) ─────────────────────────────────────────────

function TabSeguimiento({ post }) {
  if (!post.seguimiento) {
    return <p className="pnl-post-vacio">Sin notas de seguimiento aún.</p>;
  }
  return (
    <div className="pnl-post-notas">
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
    <ol className="grid grid-cols-4 gap-2.5 px-4 pb-3 relative">
      <span className="absolute left-[calc(1rem+12.5%)] right-[calc(1rem+12.5%)] top-[9px] h-0.5 bg-linea" aria-hidden="true" />
      {pasos.map((p) => (
        <li key={p.t} className="relative text-center">
          <span className={`mx-auto mb-1.5 grid place-items-center w-5 h-5 rounded-full border-2 ${
            p.e === "ok" ? "bg-verde border-verde text-white"
            : p.e === "on" ? "bg-info-soft border-sky-dark"
            : "bg-white border-trazo"
          }`}>
            {p.e === "ok" && <IconoPaso nombre="check" className="w-2.5 h-2.5" strokeWidth={3} />}
          </span>
          <span className="block text-meta font-bold text-tinta leading-tight">{p.t}</span>
          <span className="block text-meta text-tinta-2 leading-tight">{p.d}</span>
        </li>
      ))}
    </ol>
  );
}

function Plegable({ icono, titulo, children, abierto = false }) {
  const [open, setOpen] = useState(abierto);
  return (
    <div className="border-t border-linea">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="pnl-post-plegable">
        <span className="pnl-ico" data-talla="s">
          <IconoPaso nombre={icono} className="w-3.5 h-3.5" />
        </span>
        <span className="flex-1 text-cuerpo-sm font-bold text-tinta">{titulo}</span>
        <IconoLinea nombre="chevron" className="pnl-chev" />
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
      <p className="pnl-eyebrow pnl-post-rotulo">Avisos del portal</p>
      {lista.map((a) => (
        <div key={a.id} className="ex-req" data-t={a.tipo}>
          <span className="ico"><IconoLinea nombre={AVISO_ICO[a.tipo] || "info"} /></span>
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

// [texto, tono del panel, icono]
const PILL_PORTAL = {
  admitida:   ["Admitida",              "ok",     "check"],
  resultado:  ["Con resultado",         "info",   "flag"],
  presentada: ["Postulada",             "info",   "send"],
  preparando: ["En preparación",        "info",   "edit"],
  pendiente:  ["Pendiente de postular", "neutro", "clock"],
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
    <article className="pnl-post-card" data-estado={estado}>
      <div className="pnl-post-cab flex items-start gap-3 px-4 pt-4 pb-3">
        <span className="pnl-ico" data-talla="l" data-tono={estado === "admitida" ? "ok" : undefined}>
          <IconoPaso nombre={portal.icono} className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-cuerpo font-bold text-tinta leading-snug">{portal.nombre}</p>
          <p className="text-meta text-tinta-2 leading-snug">{portal.organismo}</p>
        </div>
        <span className="pnl-chip shrink-0" data-tono={pillCls}>
          <IconoLinea nombre={pillIco} className="w-3 h-3" strokeWidth={2.4} />
          {pillTxt}
        </span>
      </div>

      <LineaTiempo post={paraLinea} />

      {(fechas.fase_nombre || fechas.fecha_resultados) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {fechas.fase_nombre ? (
            <span className="pnl-chip" data-tono="neutro">
              {fechas.fase_nombre}{fechas.fase_curso ? ` · curso ${fechas.fase_curso}` : ""}
            </span>
          ) : null}
          {fechas.fecha_resultados ? (
            <span className="pnl-chip" data-tono="aviso">
              Resultados: {fmtFecha(fechas.fecha_resultados)}
            </span>
          ) : null}
        </div>
      )}

      {/* Todos los plazos del curso al que apunta, no solo el más cercano */}
      {fechas.fases_curso.length > 1 && (
        <div className="px-4 pb-3">
          <p className="pnl-eyebrow pnl-post-rotulo">
            Plazos del curso {fechas.fase_curso}
          </p>
          <ul className="space-y-1">
            {fechas.fases_curso.map((f) => {
              const actual = f.nombre === fechas.fase_nombre;
              const pasada = Boolean(f.fin) && f.fin < new Date().toISOString().slice(0, 10);
              return (
                <li key={`${f.nombre}-${f.inicio}`}
                  className={`flex items-center justify-between gap-2 text-meta rounded-lg px-2.5 py-1.5 ${actual ? "bg-info-soft text-primary font-semibold" : pasada ? "text-muted" : "bg-fondo text-tinta"}`}>
                  <span className="min-w-0">{f.nombre}{actual ? " · la próxima" : pasada ? " · cerrada" : ""}</span>
                  <span className="shrink-0 tabular-nums">{fmtFecha(f.inicio)} – {fmtFecha(f.fin)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Las opciones del portal, en el orden que eligió el asesorado */}
      <div className="px-4 pb-3">
        <p className="pnl-eyebrow pnl-post-rotulo">
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
                <IconoLinea nombre={info.ico} /> {info.label}
              </span>
              {p.estado === "lista" && (
                <div className="sub">Si alguien renuncia, subes de puesto. Tu asesor revisa cada adjudicación y te avisa.</div>
              )}
            </div>
          );
        })}
      </div>

      {admitidas.map((p) => (
        <div key={p.id_master} className="pnl-aviso pnl-aviso-bloque mx-4 mb-3" data-tono="ok">
          <span className="pnl-aviso-icono"><Icono nombre="destello" size={16} /></span>
          <div className="pnl-aviso-texto">
          <p className="pnl-informe-nota-titulo">Te han admitido{posts.length > 1 ? ` en ${p.nombre_limpio}` : ""}</p>
          <p>
            Tu carta de admisión y, cuando la hagas, tu matrícula quedan guardadas
            en <b>Documentos del proceso</b>, más abajo en este mismo paso.
          </p>
          </div>
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
      <p className="pnl-eyebrow pnl-post-rotulo"><span className="punto" />Seguimiento por portal</p>
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
        <div className="pnl-post-vacio flex items-center gap-2 py-3">
          <span className="pnl-spinner" data-talla="s" />
          Cargando…
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="pnl-aviso pnl-aviso-bloque" data-tono="aviso">
          <span className="pnl-aviso-icono"><IconoLinea nombre="alert" /></span>
          <p className="pnl-aviso-texto">
            Esta sección se activa cuando tu asesor aprueba tu elección de másteres (paso 4).
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {saving && (
            <p className="pnl-post-meta text-right">Guardando…</p>
          )}
          <div className="pnl-aviso pnl-aviso-bloque" data-tono="info">
            <span className="pnl-aviso-icono">
              <IconoPaso nombre="search" />
            </span>
            <p className="pnl-aviso-texto">
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
