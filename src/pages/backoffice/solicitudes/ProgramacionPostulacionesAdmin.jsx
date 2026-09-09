// src/pages/backoffice/solicitudes/ProgramacionPostulacionesAdmin.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPATCH, boPOST, boDELETE, boFetch } from "../../../services/backofficeApi";
import IconoPaso from "../../../components/common/IconoPaso";
import { agruparPorPortal, estadoPortal, fechasPortal, unirCampo } from "../../../lib/portales";

// ── Helpers ───────────────────────────────────────────────────────────────────

function diasHasta(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function fmtFecha(str) {
  if (!str) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(str)) ? new Date(str + "T12:00:00") : new Date(str);
  if (!isNaN(d.getTime()) && /\d{4}-\d{2}/.test(str))
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return str;
}

// ── Constants ─────────────────────────────────────────────────────────────────


const ESTADOS_OPT = [
  { val: "pendiente", label: "⏳ Pendiente" },
  { val: "proceso",   label: "⚡ En proceso" },
  { val: "postulado", label: "📤 Postulado" },
  { val: "admitido",  label: "✅ Admitido" },
  { val: "denegado",  label: "❌ Denegado" },
  { val: "lista",     label: "⏳ Lista espera" },
];

const PORTAL_ESTADOS = ["abierto", "cerrado", "mantenimiento"];


const DOC_LABEL     = { falta: "Falta", pendiente: "En revisión", ok: "Subido" };
const DOC_CLS       = {
  falta:    "bg-red-50 text-red-600 border-red-200",
  pendiente:"bg-amber-50 text-amber-600 border-amber-200",
  ok:       "bg-emerald-50 text-emerald-600 border-emerald-200",
};

// ── TabFechas ─────────────────────────────────────────────────────────────────

function FechaBox({ label, valor, field, onChange, onSave }) {
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
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(field, e.target.value)}
        onBlur={(e) => onSave(field, e.target.value)}
        placeholder="AAAA-MM-DD"
        className="w-full text-center text-xs font-semibold bg-transparent outline-none placeholder:text-neutral-300 text-neutral-700"
      />
      {dias !== null && dias > 0 && (
        <p className={`text-[10px] mt-1 font-mono font-bold ${urgente ? "text-red-600" : pronto ? "text-amber-600" : "text-neutral-400"}`}>
          {urgente ? `⚠ ${dias} días` : `~${dias} días`}
        </p>
      )}
    </div>
  );
}

function TabFechas({ post, onChange, onSave }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <FechaBox label="Apertura"   valor={post.fecha_apertura}   field="fecha_apertura"   onChange={onChange} onSave={onSave} />
        <FechaBox label="Cierre"     valor={post.fecha_cierre}     field="fecha_cierre"     onChange={onChange} onSave={onSave} />
        <FechaBox label="Resultados" valor={post.fecha_resultados} field="fecha_resultados" onChange={onChange} onSave={onSave} />
      </div>
      {post.fase_nombre && (
        <p className="text-[10.5px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5">
          Convocatoria mas cercana: <strong className="text-[#1A3557]">{post.fase_nombre}</strong>
          {post.fase_curso ? <> — para empezar el curso <strong className="text-[#1A3557]">{post.fase_curso}</strong></> : null}.
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
                className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${al.activo ? "bg-[#1D6A4A]" : "bg-neutral-200"}`}
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

// ── TabPortal ─────────────────────────────────────────────────────────────────

function TabPortal({ post, onChange, onSave, showPw, togglePw }) {
  const portalesCliente = Array.isArray(post.portales_cliente) ? post.portales_cliente : [];

  return (
    <div className="space-y-4">
      {/* Portal del asesor — campos que el cliente ve como solo lectura */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Portal del asesor <span className="text-neutral-300 font-normal normal-case tracking-normal">(visible para el cliente)</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2.5">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">URL del portal</label>
              <div className="flex gap-1.5">
                <input type="url" value={post.portal_url}
                  onChange={(e) => onChange("portal_url", e.target.value)}
                  onBlur={(e) => onSave("portal_url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 min-w-0 text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1A3557]"
                />
                {post.portal_url && (
                  <button type="button" onClick={() => navigator.clipboard?.writeText(post.portal_url)}
                    className="shrink-0 text-[11px] border border-neutral-200 rounded-lg px-2 py-1.5 hover:bg-neutral-50">📋</button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">Estado del portal</label>
              <div className="flex gap-1.5">
                {PORTAL_ESTADOS.map((e) => (
                  <button key={e} type="button" onClick={() => onSave("portal_estado", e)}
                    className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition ${
                      post.portal_estado === e ? "bg-[#1A3557] border-[#1A3557] text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                    }`}>
                    {e === "abierto" ? "✓ Abierto" : e === "cerrado" ? "Cerrado" : "Mant."}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">N.º expediente</label>
              <input type="text" value={post.expediente}
                onChange={(e) => onChange("expediente", e.target.value)}
                onBlur={(e) => onSave("expediente", e.target.value)}
                placeholder="Ej: UA-2026-89432"
                className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1A3557]"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">Usuario</label>
              <input type="text" value={post.portal_usuario}
                onChange={(e) => onChange("portal_usuario", e.target.value)}
                onBlur={(e) => onSave("portal_usuario", e.target.value)}
                placeholder="email@ejemplo.com"
                className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1A3557]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">Contraseña</label>
              <CampoContrasena valor={post.portal_password} showPw={showPw} togglePw={togglePw}
                onChange={(v) => onChange("portal_password", v)}
                onSave={(v) => onSave("portal_password", v)} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">Notas de acceso</label>
              <input type="text" value={post.portal_notas}
                onChange={(e) => onChange("portal_notas", e.target.value)}
                onBlur={(e) => onSave("portal_notas", e.target.value)}
                placeholder="Ej: verificar email con código SMS"
                className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1A3557]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Portales del cliente — solo lectura */}
      {portalesCliente.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
            Portales añadidos por el cliente
          </p>
          <div className="space-y-2">
            {portalesCliente.map((p, idx) => (
              <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 space-y-1">
                <p className="text-xs font-semibold text-neutral-700">{p.label || p.url || `Portal ${idx + 1}`}</p>
                {p.url && <p className="text-[10px] text-neutral-500 font-mono break-all">{p.url}</p>}
                {p.usuario && <p className="text-[10px] text-neutral-500">Usuario: <span className="font-mono">{p.usuario}</span></p>}
                {p.notas && <p className="text-[10px] text-neutral-400 italic">{p.notas}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* La contraseña con su botón de guardar. Se guardaba al salir del campo, sin
   decir nada, y la duda de siempre —«¿se guardó?»— acababa en volver a
   escribirla. El botón guarda y lo confirma; el guardado al salir sigue. */
function CampoContrasena({ valor, showPw, togglePw, onChange, onSave }) {
  const [estado, setEstado] = useState("quieto"); // quieto | guardando | ok | error
  useEffect(() => {
    if (estado !== "ok") return undefined;
    const t = setTimeout(() => setEstado("quieto"), 2000);
    return () => clearTimeout(t);
  }, [estado]);

  async function guardar() {
    setEstado("guardando");
    const ok = await onSave(valor || "");
    setEstado(ok === false ? "error" : "ok");
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1.5">
        <input type={showPw ? "text" : "password"} value={valor || ""}
          onChange={(e) => { onChange(e.target.value); if (estado !== "quieto") setEstado("quieto"); }}
          onBlur={(e) => onSave(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); guardar(); } }}
          placeholder="Contraseña del portal"
          autoComplete="off"
          className={`flex-1 min-w-0 text-xs border rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1A3557] ${
            estado === "error" ? "border-red-300 bg-red-50" : "border-neutral-200"}`}
        />
        <button type="button" onClick={togglePw} title={showPw ? "Ocultar" : "Ver"}
          className="shrink-0 text-[11px] border border-neutral-200 rounded-lg px-2 py-1.5 hover:bg-neutral-50">
          {showPw ? "🙈" : "👁"}
        </button>
        {valor && (
          <button type="button" onClick={() => navigator.clipboard?.writeText(valor)} title="Copiar"
            className="shrink-0 text-[11px] border border-neutral-200 rounded-lg px-2 py-1.5 hover:bg-neutral-50">📋</button>
        )}
        <button type="button" onClick={guardar} disabled={estado === "guardando"}
          className={`shrink-0 text-[11px] font-bold rounded-lg px-3 py-1.5 transition-colors ${
            estado === "ok" ? "bg-[#1D6A4A] text-white"
            : estado === "error" ? "bg-red-600 text-white"
            : "bg-[#1A3557] text-white hover:bg-[#0f2440] disabled:opacity-50"}`}>
          {estado === "guardando" ? "…" : estado === "ok" ? "✓ Guardada" : estado === "error" ? "Reintentar" : "Guardar"}
        </button>
      </div>
      {estado === "error" && <p className="text-[10.5px] text-red-600">No se pudo guardar la contraseña.</p>}
    </div>
  );
}

// ── TabDocs ───────────────────────────────────────────────────────────────────

/* Justificantes de la postulación: el resguardo o la constancia de que se
   presentó, y poco más. Aquí vivía un checklist de seis documentos (título
   apostillado, notas, carta…) que Carina quitó el 08/09/2026: esa
   documentación se lleva en el bloque 2, y mezclada aquí no se sabía qué
   había que subir. Los archivos cuelgan del acceso al portal del máster
   (`justificantes_portales`), el mismo sitio que usa el bloque 7. */
const TIPOS_RESGUARDO = [
  { valor: "RESGUARDO_POSTULACION", etiqueta: "Resguardo de postulación" },
  { valor: "COMPROBANTE_PAGO",      etiqueta: "Comprobante de pago de tasas" },
  { valor: "OTRO",                  etiqueta: "Otra constancia" },
];
const ETIQUETA_TIPO = Object.fromEntries(TIPOS_RESGUARDO.map((t) => [t.valor, t.etiqueta]));

function tamano(bytes) {
  if (!bytes) return "";
  return bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function TabDocs({ post, onRecargar }) {
  const [tipo, setTipo] = useState("RESGUARDO_POSTULACION");
  const [visible, setVisible] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [porQuitar, setPorQuitar] = useState(null);
  const lista = post.justificantes || [];
  // Lo que el asesorado subió desde su panel al checklist antiguo, si lo hay.
  const delCliente = (post.documentos || []).filter((d) => d.url_archivo);

  useEffect(() => {
    if (porQuitar === null) return undefined;
    const t = setTimeout(() => setPorQuitar(null), 4000);
    return () => clearTimeout(t);
  }, [porQuitar]);

  async function subir(file) {
    if (!file) return;
    if (!post.id_acceso) {
      setError("Esta postulación aún no tiene portal creado. Cierra y vuelve a abrir el bloque para que se cree.");
      return;
    }
    setSubiendo(true); setError("");
    const fd = new FormData();
    fd.append("archivo", file);
    fd.append("tipo_justificante", tipo);
    fd.append("visible_para_cliente", visible ? "true" : "false");
    const r = await boPOST(`/api/portales/admin/accesos/${post.id_acceso}/justificantes`, fd);
    setSubiendo(false);
    if (!r?.ok) { setError(r?.msg || "No se pudo subir el archivo"); return; }
    onRecargar?.();
  }

  async function abrir(j) {
    try {
      const r = await boFetch(`/api/portales/justificantes/${j.id_justificante}/descargar`);
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch { setError("No se pudo abrir el archivo"); }
  }

  async function quitar(j) {
    const r = await boDELETE(`/api/portales/admin/documentos-proceso/${j.id_justificante}`);
    if (!r?.ok) { setError(r?.msg || "No se pudo quitar"); return; }
    setPorQuitar(null);
    onRecargar?.();
  }

  return (
    <div className="space-y-3">
      {lista.length === 0 ? (
        <p className="text-xs text-neutral-400 italic text-center py-2">
          Todavía no hay resguardo de esta postulación.
        </p>
      ) : (
        <div className="space-y-1.5">
          {lista.map((j) => (
            <div key={j.id_justificante} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
              <span className="text-sm shrink-0">🧾</span>
              <button type="button" onClick={() => abrir(j)} title="Abrir"
                className="flex-1 min-w-0 text-left">
                <span className="block text-xs font-semibold text-[#1A3557] truncate hover:underline">{j.nombre_archivo}</span>
                <span className="block text-[10px] text-neutral-400 truncate">
                  {ETIQUETA_TIPO[j.tipo_justificante] || j.tipo_justificante}
                  {j.fecha_subida && ` · ${new Date(j.fecha_subida).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`}
                  {j.tamano_bytes ? ` · ${tamano(j.tamano_bytes)}` : ""}
                  {j.visible_para_cliente === false && " · solo interno"}
                </span>
              </button>
              <button type="button" onClick={() => (porQuitar === j.id_justificante ? quitar(j) : setPorQuitar(j.id_justificante))}
                className={`shrink-0 text-[10px] font-bold rounded-md px-2 py-1 transition-colors ${
                  porQuitar === j.id_justificante ? "bg-red-600 text-white" : "text-neutral-300 hover:text-red-500 hover:bg-red-50"}`}>
                {porQuitar === j.id_justificante ? "¿Seguro?" : "Quitar"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo de justificante"
            className="text-[11px] font-semibold border border-neutral-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-[#1A3557]">
            {TIPOS_RESGUARDO.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-[11px] text-neutral-600">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Lo ve el asesorado
          </label>
          <label className={`ml-auto shrink-0 text-[11px] font-bold rounded-lg px-3 py-1.5 cursor-pointer transition ${
            subiendo ? "bg-neutral-200 text-neutral-500" : "bg-[#1A3557] text-white hover:bg-[#0f2440]"}`}>
            {subiendo ? "Subiendo…" : "📎 Subir resguardo"}
            <input type="file" className="hidden" accept="application/pdf,image/*" disabled={subiendo}
              onChange={(e) => { subir(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        {error && <p className="text-[10.5px] text-red-600">{error}</p>}
      </div>

      {delCliente.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">
            Subido por el asesorado
          </p>
          <div className="space-y-1">
            {delCliente.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-neutral-600 px-1">
                <span>📄</span>
                <span className="flex-1 min-w-0 truncate">{d.nombre}{d.nombre_archivo ? ` — ${d.nombre_archivo}` : ""}</span>
                <span className={`shrink-0 text-[9.5px] font-bold border rounded-full px-2 py-0.5 ${DOC_CLS[d.estado] ?? ""}`}>
                  {DOC_LABEL[d.estado] ?? d.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TabSeguimiento ────────────────────────────────────────────────────────────

function TabSeguimiento({ post, onChange, onSave }) {
  return (
    <textarea
      rows={4}
      value={post.seguimiento}
      onChange={(e) => onChange("seguimiento", e.target.value)}
      onBlur={(e) => onSave("seguimiento", e.target.value)}
      placeholder="Notas internas: llamadas, estado real, compromisos del cliente…"
      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#1A3557] resize-none leading-relaxed placeholder:text-neutral-300"
    />
  );
}

// ── La línea de tiempo del portal ─────────────────────────────────────────────

// La línea de tiempo de una postulación: dónde va y qué falta, de un vistazo.
// La misma que ve el asesorado en su panel, para hablar de lo mismo.
function LineaTiempoAdmin({ post }) {
  const presentada   = ["postulado", "admitido", "lista", "denegado"].includes(post.estado);
  const conResultado = ["admitido", "lista", "denegado"].includes(post.estado);
  const admitida     = post.estado === "admitido";
  const plazo = post.fecha_apertura || post.fecha_cierre
    ? `${post.fecha_apertura ? fmtFecha(post.fecha_apertura) : "\u2014"} \u2192 ${post.fecha_cierre ? fmtFecha(post.fecha_cierre) : "\u2014"}`
    : "por confirmar";
  const pasos = [
    { t: "Plazo",      d: plazo,                                                            e: presentada ? "ok" : "on" },
    { t: "Presentada", d: presentada ? "hecho" : "pendiente",                               e: presentada ? "ok" : "" },
    { t: "Resultados", d: post.fecha_resultados ? fmtFecha(post.fecha_resultados) : "por publicar", e: conResultado ? "ok" : presentada ? "on" : "" },
    { t: "Matrícula",  d: admitida ? "con el asesorado" : "\u2014",                          e: admitida ? "on" : "" },
  ];
  return (
    <ol className="grid grid-cols-4 gap-1 px-4 pb-3 pt-1 relative">
      <span className="absolute left-[calc(1rem+12.5%)] right-[calc(1rem+12.5%)] top-[13px] h-0.5 bg-neutral-100" aria-hidden="true" />
      {pasos.map((x) => (
        <li key={x.t} className="relative text-center">
          <span className={`mx-auto mb-1.5 grid place-items-center w-5 h-5 rounded-full border-2 ${
            x.e === "ok" ? "bg-emerald-600 border-emerald-600 text-white"
            : x.e === "on" ? "bg-sky-100 border-sky-400"
            : "bg-white border-neutral-200"
          }`}>
            {x.e === "ok" && <IconoPaso nombre="check" className="w-2.5 h-2.5" strokeWidth={3} />}
          </span>
          <span className="block text-[10px] font-bold text-neutral-700 leading-tight">{x.t}</span>
          <span className="block text-[9.5px] text-neutral-400 leading-tight">{x.d}</span>
        </li>
      ))}
    </ol>
  );
}

function hoyISO() { return new Date().toISOString().slice(0, 10); }

// ── Vigilancia del portal ─────────────────────────────────────────────────────
// Quien mira el portal es el asesor. Aquí queda cuándo lo miró por última vez
// y cuándo toca volver; el asesorado no tiene que entrar a comprobarlo.
function Vigilancia({ post, onSave }) {
  const dias = diasHasta(post.fecha_cierre);
  const abierta = !["admitido", "denegado"].includes(post.estado);
  const proxima = post.fecha_resultados
    ? `${fmtFecha(post.fecha_resultados)} · publican resultados`
    : post.fecha_cierre
      ? `${fmtFecha(post.fecha_cierre)} · cierra el plazo`
      : "cuando la universidad publique el plazo";
  const urge = abierta && dias !== null && dias >= 0 && dias <= 7;
  return (
    <div className="ex-pst-b">
      <h4>
        <span className="ico"><IconoPaso nombre="search" /></span>Vigilancia del portal
        <span className="ex-est" data-e={urge ? "warn" : "ok"}>
          <IconoPaso nombre={urge ? "clock" : "check"} /> {urge ? `Cierra en ${dias} día${dias === 1 ? "" : "s"}` : "Al día"}
        </span>
      </h4>
      <div className="ex-vigila">
        <div>
          Última revisión: <b>{post.ultima_revision ? fmtFecha(post.ultima_revision) : "ninguna"}</b>
          <small>Próxima: <b>{proxima}</b></small>
        </div>
        <button type="button" className="ex-btn sec" onClick={() => onSave("ultima_revision", hoyISO())}>
          <IconoPaso nombre="check" /> Revisado hoy
        </button>
      </div>
    </div>
  );
}

// ── Requerimientos y notificaciones ──────────────────────────────────────────
// Lo que dice el portal: un requerimiento (piden algo, con plazo), una
// notificación o el resultado. Se guarda en la postulación y el asesorado lo
// ve en su tarjeta.
const TIPOS_AVISO = [
  ["REQUERIMIENTO", "Requerimiento (piden algo, con plazo)"],
  ["NOTIFICACION", "Notificación"],
  ["RESULTADO", "Resultado"],
];
const ICO_AVISO = { REQUERIMIENTO: "alert", NOTIFICACION: "bell", RESULTADO: "trophy" };
const TIT_AVISO = { REQUERIMIENTO: "Requerimiento", NOTIFICACION: "Notificación", RESULTADO: "Resultado" };

function Avisos({ post, onSave, nombreCorto }) {
  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState({ tipo: "REQUERIMIENTO", texto: "", plazo: "" });
  const avisos = Array.isArray(post.avisos) ? post.avisos : [];

  function registrar() {
    if (!nuevo.texto.trim()) return;
    const siguienteId = avisos.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
    const a = { id: siguienteId, tipo: nuevo.tipo, texto: nuevo.texto.trim(), plazo: nuevo.plazo || null, fecha: hoyISO(), respondido: null };
    onSave("avisos", [...avisos, a]);
    setNuevo({ tipo: "REQUERIMIENTO", texto: "", plazo: "" });
    setAbierto(false);
  }
  const responder = (id) => onSave("avisos", avisos.map((a) => (a.id === id ? { ...a, respondido: hoyISO() } : a)));
  const quitar = (id) => onSave("avisos", avisos.filter((a) => a.id !== id));

  return (
    <div className="ex-pst-b">
      <h4>
        <span className="ico"><IconoPaso nombre="bell" /></span>Requerimientos y notificaciones
        <button type="button" className="ex-btn sec" onClick={() => setAbierto((v) => !v)}>
          <IconoPaso nombre={abierto ? "x" : "plus"} /> {abierto ? "Cerrar" : "Registrar"}
        </button>
      </h4>
      {abierto && (
        <div className="ex-grid2" style={{ marginBottom: 10 }}>
          <div>
            <label className="ex-lab">Tipo</label>
            <select className="ex-select" style={{ maxWidth: "100%", width: "100%" }} value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
              {TIPOS_AVISO.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="ex-lab">Plazo (si lo hay)</label>
            <input type="date" className="ex-campo" value={nuevo.plazo} onChange={(e) => setNuevo({ ...nuevo, plazo: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="ex-lab">Qué dice el portal</label>
            <textarea rows={2} className="ex-campo" value={nuevo.texto} onChange={(e) => setNuevo({ ...nuevo, texto: e.target.value })}
              placeholder="Ej.: piden el certificado de notas apostillado antes del 20 de febrero" />
          </div>
          <div className="ex-fila" style={{ gridColumn: "1 / -1" }}>
            <button type="button" className="ex-btn" onClick={registrar} disabled={!nuevo.texto.trim()}>
              <IconoPaso nombre="send" /> Registrar
            </button>
            <span className="ex-sub2">{nombreCorto} lo ve en su tarjeta de Postulaciones, con el plazo.</span>
          </div>
        </div>
      )}
      {avisos.length === 0 ? (
        <p className="ex-sub2">Nada registrado. Al registrar uno, {nombreCorto} lo ve en su tarjeta de Postulaciones con el plazo.</p>
      ) : [...avisos].reverse().map((a) => (
        <div key={a.id} className="ex-req" data-t={a.tipo}>
          <span className="ico"><IconoPaso nombre={ICO_AVISO[a.tipo] || "info"} /></span>
          <div>
            <b>{TIT_AVISO[a.tipo] || a.tipo}</b> · {fmtFecha(a.fecha)}<br />{a.texto}
            {a.respondido ? <small>Respondido el {fmtFecha(a.respondido)}</small> : null}
          </div>
          {a.tipo !== "RESULTADO" && (
            a.respondido
              ? <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Respondido</span>
              : a.plazo
                ? <span className="ex-est" data-e="warn"><IconoPaso nombre="clock" /> Hasta {fmtFecha(a.plazo)}</span>
                : <span />
          )}
          <div className="ex-req-acc">
            {a.tipo !== "RESULTADO" && !a.respondido && (
              <button type="button" className="ex-btn" onClick={() => responder(a.id)}><IconoPaso nombre="check" /> Marcar respondido</button>
            )}
            <button type="button" className="ex-btn plano" onClick={() => quitar(a.id)}><IconoPaso nombre="trash" /> Quitar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── La tarjeta por portal ─────────────────────────────────────────────────────
// En Andalucía se postula una sola vez por el Distrito Único con los másteres
// en orden; en el resto, cada universidad tiene su portal. El portal es la
// unidad: plazos, claves, vigilancia, avisos y resguardo son suyos; el estado
// es de cada opción. Lo del portal se guarda en todas sus opciones a la vez;
// lo que solo existe una vez (avisos, resguardos, notas) vive en la titular.
const PILL_PORTAL = {
  admitida:   ["Admitida", "ok", "trophy"],
  resultado:  ["Con resultado", "on", "flag"],
  presentada: ["Presentada", "on", "send"],
  preparando: ["En preparación", "on", "edit"],
  pendiente:  ["Pendiente", "info", "clock"],
};
const LINEA_POR_ESTADO = { admitida: "admitido", resultado: "lista", presentada: "postulado", preparando: "proceso", pendiente: "pendiente" };

function PortalCard({ grupo, onUpdate, onSave, onSaveMap, onRecargar, nombreCorto }) {
  const { portal, posts, titular, ids } = grupo;
  const [showPw, setShowPw] = useState(false);
  const estado = estadoPortal(posts);
  const fechas = fechasPortal(posts);
  const admitidas = posts.filter((p) => p.estado === "admitido");
  const avisos = unirCampo(posts, "avisos");
  const dias = diasHasta(fechas.fecha_cierre);
  const alerta = avisos.some((a) => a.tipo !== "RESULTADO" && !a.respondido && a.plazo)
    || (dias !== null && dias >= 0 && dias <= 7 && !["admitida", "resultado"].includes(estado));
  const [pillTxt, pillTono, pillIco] = PILL_PORTAL[estado] || PILL_PORTAL.pendiente;

  const enGrupo = (p) => ids.includes(p.id_master);
  // Lo del portal, a todas sus opciones.
  const onChangePortal = (field, value) => ids.forEach((id) => onUpdate(id, field, value));
  const onSavePortal = (field, value) => onSaveMap((p) => (enGrupo(p) ? { ...p, [field]: value } : p));
  // Lo que vive en la titular.
  const onSaveTitular = (field, value) => onSave(titular.id_master, field, value);
  const onSaveAvisos = (_field, lista) => onSaveMap((p) => (enGrupo(p) ? { ...p, avisos: p.id_master === titular.id_master ? lista : [] } : p));

  const paraLinea = { ...titular, ...fechas, estado: LINEA_POR_ESTADO[estado] || "pendiente" };
  const paraPortal = { ...titular, ...fechas, portales_cliente: unirCampo(posts, "portales_cliente") };
  const paraDocs = { ...titular, justificantes: unirCampo(posts, "justificantes"), documentos: unirCampo(posts, "documentos") };

  return (
    <article className="ex-pst" data-alerta={alerta ? 1 : 0} data-adm={estado === "admitida" ? 1 : 0}>
      <div className="ex-pst-top">
        <span className="ico"><IconoPaso nombre={portal.icono} /></span>
        <div>
          <h3>{portal.nombre}</h3>
          <div className="u">{portal.organismo}</div>
        </div>
        <span className="ex-est" data-e={pillTono}><IconoPaso nombre={pillIco} /> {pillTxt}</span>
      </div>

      <LineaTiempoAdmin post={paraLinea} />

      <div className="ex-pst-b">
        <h4><span className="ico"><IconoPaso nombre="list" /></span>{posts.length > 1 ? "Opciones, en orden de prioridad" : "Máster"}</h4>
        {posts.map((p, i) => (
          <div key={p.id_master} className="ex-opc">
            <i>{i + 1}.º</i>
            <div className="min-w-0">
              <div className="n">{p.nombre_limpio || "(Sin nombre)"}</div>
              <div className="u">
                {[p.universidad, p.ciudad, p.precio ? `${Math.round(p.precio).toLocaleString("es-ES")} €` : null, p.score ? `${p.score} % de ajuste` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
            <select className="ex-select" value={p.estado} onChange={(e) => onSave(p.id_master, "estado", e.target.value)} aria-label={`Estado de ${p.nombre_limpio}`}>
              {ESTADOS_OPT.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            {p.estado === "lista" && <div className="sub">Se revisa en cada adjudicación; si sube de puesto, se cambia el estado y {nombreCorto} lo ve.</div>}
          </div>
        ))}
      </div>

      {admitidas.map((p) => (
        <div key={p.id_master} className="ex-admitida">
          <h4>🎉 Admitida{posts.length > 1 ? ` · ${p.nombre_limpio}` : ""}</h4>
          <p>
            La carta de admisión y, cuando la haga, la matrícula se suben en <b>Documentos del proceso</b>,
            más abajo en este mismo paso. {nombreCorto} las ve en su panel.
          </p>
        </div>
      ))}

      <Vigilancia post={{ ...titular, ...fechas }} onSave={onSaveTitular} />

      <div className="ex-pst-b">
        <h4><span className="ico"><IconoPaso nombre="calendar" /></span>Plazos y alertas</h4>
        <TabFechas post={{ ...titular, ...fechas }} onChange={onChangePortal} onSave={onSavePortal} />
      </div>

      <Avisos post={{ ...titular, avisos }} onSave={onSaveAvisos} nombreCorto={nombreCorto} />

      <div className="ex-pst-b">
        <h4><span className="ico"><IconoPaso nombre="lock" /></span>Portal y claves</h4>
        <TabPortal post={paraPortal} onChange={onChangePortal} onSave={onSavePortal} showPw={showPw} togglePw={() => setShowPw((v) => !v)} />
      </div>

      <div className="ex-pst-b">
        <h4><span className="ico"><IconoPaso nombre="fileText" /></span>Resguardo y pago</h4>
        <TabDocs post={paraDocs} onRecargar={onRecargar} />
      </div>

      <div className="ex-pst-b">
        <h4><span className="ico"><IconoPaso nombre="message" /></span>Seguimiento interno</h4>
        <TabSeguimiento post={titular} onChange={(f, v) => onUpdate(titular.id_master, f, v)} onSave={onSaveTitular} />
      </div>
    </article>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProgramacionPostulacionesAdmin({ idSolicitud, refreshKey, nombreCliente = null }) {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const nombreCorto = (nombreCliente || "el asesorado").split(" ")[0];

  useEffect(() => {
    setLoading(true);
    setError("");
    boGET(`/backoffice/solicitudes/${idSolicitud}/postulaciones`)
      .then((r) => { if (r.ok) setPosts(r.postulaciones || []); else setError("No se pudo cargar."); })
      .catch(() => setError("Error de conexión."))
      .finally(() => setLoading(false));
  }, [idSolicitud, refreshKey]);

  // Lo último pintado, para calcular el siguiente estado sin depender de
  // que el actualizador de setPosts corra en el momento de la llamada.
  const postsRef = useRef(posts);
  postsRef.current = posts;

  // Devuelve si fue bien: el botón de guardar contraseña lo enseña.
  async function guardar(nextPosts) {
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/postulaciones`, { postulaciones: nextPosts });
      return Boolean(r?.ok);
    } catch { return false; }
    finally { setSaving(false); }
  }

  // Vuelve a leer sin el spinner: tras subir o quitar un resguardo, la lista
  // viene del servidor y no hay que desmontar las tarjetas para verla.
  async function recargar() {
    const r = await boGET(`/backoffice/solicitudes/${idSolicitud}/postulaciones`);
    if (r.ok) setPosts(r.postulaciones || []);
  }

  function handleUpdate(id_master, field, value) {
    setPosts((prev) => prev.map((p) => p.id_master === id_master ? { ...p, [field]: value } : p));
  }

  function handleSave(id_master, field, value) {
    const next = postsRef.current.map((p) => p.id_master === id_master ? { ...p, [field]: value } : p);
    setPosts(next);
    return guardar(next);
  }

  // Lo del portal se guarda en todas sus opciones a la vez.
  function handleSaveMap(fn) {
    const next = postsRef.current.map(fn);
    setPosts(next);
    return guardar(next);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-neutral-400 text-sm">
        <div className="w-4 h-4 border-2 border-[#1A3557]/30 border-t-[#1A3557] rounded-full animate-spin" />
        Cargando postulaciones…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="ex-vacio">
        <span className="ico"><IconoPaso nombre="cap" /></span>
        Sin postulaciones: no hay ningún Sí en la elección (paso 4). En cuanto apruebes un máster, aparece aquí su tarjeta.
      </div>
    );
  }

  const urgentes = posts
    .map((p) => ({ ...p, dias: diasHasta(p.fecha_cierre) }))
    .filter((p) => p.dias !== null && p.dias >= 0 && p.dias <= 20 && !["admitido", "denegado"].includes(p.estado))
    .sort((a, b) => a.dias - b.dias);

  return (
    <div className="space-y-3">
      {urgentes.length > 0 ? (
        <div className="ex-tranquila" data-k="warn">
          <span className="ico"><IconoPaso nombre="clock" /></span>
          <div>
            <b>Cierre cercano:</b> {urgentes[0].nombre_limpio} cierra el {fmtFecha(urgentes[0].fecha_cierre)}
            {urgentes[0].dias === 0 ? " (hoy)" : ` (en ${urgentes[0].dias} día${urgentes[0].dias === 1 ? "" : "s"})`}.
          </div>
        </div>
      ) : (
        <div className="ex-tranquila">
          <span className="ico"><IconoPaso nombre="info" /></span>
          <div>Una tarjeta por portal (en Andalucía, el Distrito Único con los másteres en orden): <b>vigilancia</b>, estado de cada opción, plazos, requerimientos, claves, resguardo y notas. Lo que cambie lo ve {nombreCorto} en su panel.</div>
        </div>
      )}
      {saving && <p className="text-[10px] text-neutral-400 font-mono text-right">Guardando…</p>}
      <div className="ex-pst-grid">
        {agruparPorPortal(posts).map((grupo) => (
          <PortalCard
            key={grupo.portal.id}
            grupo={grupo}
            onUpdate={handleUpdate}
            onSave={handleSave}
            onSaveMap={handleSaveMap}
            onRecargar={recargar}
            nombreCorto={nombreCorto}
          />
        ))}
      </div>
      <p className="ex-pie">Estas filas son las mismas del tracker de Procesos. Las alertas de 7, 3 y 1 días antes de cada plazo salen de aquí.</p>
    </div>
  );
}
