// src/pages/backoffice/correos/EmailTemplates.jsx
import { Suspense, useEffect, useRef, useState } from "react";
import { dialog } from "../../../services/dialogService";
import { lazyConRecarga } from "../../../lib/cargaDiferida";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";

// CodeMirror solo hace falta al editar una plantilla: la lista se abre sin
// descargarlo y el editor llega al abrir el modal (09/10/2026).
const EditorHtml = lazyConRecarga(() => import("./EditorHtml"));

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const TIPO_META = {
  bienvenida:          { label: "Bienvenida",        color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  documento:           { label: "Doc. cargado",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  documento_observado: { label: "Doc. observado",    color: "bg-orange-100 text-orange-700 border-orange-200" },
  documento_aprobado:  { label: "Doc. aprobado",     color: "bg-teal-100 text-teal-700 border-teal-200" },
  pago_confirmado:     { label: "Pago confirmado",   color: "bg-green-100 text-green-700 border-green-200" },
  postulacion:         { label: "Postulación",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  lead_calculadora:    { label: "Lead calc.",        color: "bg-pink-100 text-pink-700 border-pink-200" },
  recordatorio:        { label: "Recordatorio",      color: "bg-sky-100 text-sky-700 border-sky-200" },
  notificacion:        { label: "Notificación",      color: "bg-violet-100 text-violet-700 border-violet-200" },
  otro:                { label: "Otro",              color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

// Variables agrupadas por categoría
const VARIABLES_GRUPOS = [
  {
    id: "globales",
    label: "Globales",
    accent: "#58a6ff",
    vars: [
      { key: "nombre", label: "Nombre del cliente" },
      { key: "email",  label: "Correo del cliente" },
      { key: "fecha",  label: "Fecha actual" },
    ],
  },
  {
    id: "solicitud",
    label: "Solicitud / Documento",
    accent: "#bc8cff",
    vars: [
      { key: "solicitud", label: "N° de solicitud" },
      { key: "item",      label: "Ítem del expediente" },
      { key: "archivos",  label: "Archivo(s) subido(s)" },
      { key: "documento", label: "Nombre del documento" },
      { key: "tipo_doc",  label: "Tipo de documento" },
    ],
  },
  {
    id: "observacion",
    label: "Observación / Rechazo",
    accent: "#e3b341",
    vars: [
      { key: "observacion", label: "Motivo de observación" },
      { key: "comentario",  label: "Comentario adicional" },
    ],
  },
  {
    id: "pago",
    label: "Pago",
    accent: "#3fb950",
    vars: [
      { key: "monto",      label: "Monto pagado" },
      { key: "concepto",   label: "Concepto del pago" },
      { key: "referencia", label: "Referencia / N° transacción" },
      { key: "metodo",     label: "Método de pago" },
    ],
  },
  {
    id: "formulario",
    label: "Formulario / Informe",
    accent: "#22d3ee",
    vars: [
      { key: "solicitud",       label: "N° de solicitud" },
      { key: "carrera",         label: "Carrera del cliente" },
      { key: "promedio",        label: "Promedio académico" },
      { key: "area",            label: "Área de interés" },
      { key: "perfil_completo", label: "Perfil completo (tabla HTML)" },
      { key: "informe",         label: "Informe de másteres (HTML con scores)" },
      { key: "cantidad",        label: "N° másteres elegidos" },
      { key: "masters",         label: "Tabla de másteres elegidos (HTML)" },
    ],
  },
  {
    id: "lead",
    label: "Lead / Calculadora",
    accent: "#f78166",
    vars: [
      { key: "resultado",    label: "Resultado de la calculadora" },
      { key: "tipo_visa",    label: "Área de estudio / tipo visa" },
      { key: "puntaje",      label: "Nota en España" },
      { key: "pais",         label: "País de origen" },
      { key: "whatsapp",     label: "WhatsApp del lead" },
      { key: "universidad",  label: "Universidad" },
      { key: "ranking",      label: "Ranking universitario" },
      { key: "presupuesto",  label: "Presupuesto (€)" },
      { key: "vida",         label: "Situación de vida" },
      { key: "auip",         label: "Variable AUIP" },
      { key: "funcionario",  label: "Variable Funcionario" },
      { key: "ods",          label: "Variable ODS" },
      { key: "cyl",          label: "Variable CyL" },
      { key: "becas",        label: "Lista de becas (HTML)" },
    ],
  },
];

// Valores de muestra para la vista previa
const PREVIEW_SAMPLES = {
  nombre:      "Juan García",
  email:       "juan@ejemplo.com",
  fecha:       "27 de abril de 2026",
  solicitud:   "SOL-2026-0042",
  item:        "Pasaporte vigente",
  archivos:    "pasaporte.pdf",
  documento:   "Contrato de trabajo",
  tipo_doc:    "Identificación",
  observacion: "Falta firma en página 2",
  comentario:  "Por favor adjunta el documento actualizado",
  monto:       "$150.000",
  concepto:    "Asesoría migratoria",
  referencia:  "TXN-789456",
  metodo:      "Transferencia bancaria",
  carrera:         "Ingeniería de Sistemas",
  promedio:        "8.00",
  area:            "Ingeniería y Tecnología",
  perfil_completo: "<em style=\"color:#888\">(Perfil completo — solo visible en email real)</em>",
  informe:         "<em style=\"color:#888\">(Lista de másteres con scores — solo visible en email real)</em>",
  cantidad:        "3",
  masters:         "<em style=\"color:#888\">(Tabla de másteres — solo visible en email real)</em>",
  resultado:    "7.8",
  tipo_visa:    "Administración y Negocios",
  puntaje:      "7.8",
  pais:         "Colombia",
  whatsapp:     "+57 300 000 0000",
  universidad:  "Universidad Nacional",
  ranking:      "Top 200",
  presupuesto:  "1200",
  vida:         "Con familia",
  auip:         "Sí",
  funcionario:  "No",
  ods:          "Sí",
  cyl:          "No",
  becas:        "✓ Beca Santander — Califica<br>~ Beca AUIP — Posible",
};

function renderPreview(html, nombreOverride, emailOverride) {
  let out = html;
  const samples = {
    ...PREVIEW_SAMPLES,
    nombre: nombreOverride || PREVIEW_SAMPLES.nombre,
    email:  emailOverride  || PREVIEW_SAMPLES.email,
  };
  Object.entries(samples).forEach(([key, val]) => {
    out = out.replaceAll(`{{${key}}}`, val).replaceAll(`\${${key}}`, val);
  });
  return out;
}

// ── Chip de tipo ──────────────────────────────────────────────────────────────
function TipoBadge({ tipo }) {
  const m = TIPO_META[tipo] || TIPO_META.otro;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}

// ── Card de template ──────────────────────────────────────────────────────────
function TemplateCard({ t, onEditar, onEliminar, onActivar, onDesactivar, onClonar }) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all
      ${t.activo ? "border-emerald-300 ring-1 ring-emerald-200" : "border-neutral-200"}`}>
      <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2
        ${t.activo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-50 text-neutral-400"}`}>
        <span className={`w-2 h-2 rounded-full inline-block ${t.activo ? "bg-emerald-500" : "bg-neutral-300"}`} />
        {t.activo ? "ACTIVO — se usa al enviar correos de este tipo" : "Inactivo"}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <TipoBadge tipo={t.tipo} />
        </div>
        <p className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">{t.nombre}</p>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{t.asunto}</p>
        <p className="text-[11px] text-neutral-400 mt-2">
          {new Date(t.fecha_actualizacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <button onClick={() => onEditar(t)}
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors font-medium">
          Editar
        </button>
        {t.activo
          ? <button onClick={() => onDesactivar(t)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 text-neutral-500 hover:bg-neutral-50 transition-colors font-medium">
              Desactivar
            </button>
          : <button onClick={() => onActivar(t)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition-colors font-medium">
              Activar
            </button>
        }
        {/* Clonar */}
        <button onClick={() => onClonar(t)} title="Clonar este template"
          className="text-xs px-3 py-2 rounded-xl border border-sky-200 text-sky-500 hover:bg-sky-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        {!t.activo && (
          <button onClick={() => onEliminar(t)}
            className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4a1 1 0 011 1v3H9V4a1 1 0 011-1z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal editor ──────────────────────────────────────────────────────────────
function EditorModal({ template, tipos, assets, onGuardar, onCerrar }) {
  const cmViewRef  = useRef(null);
  const previewRef = useRef(null);
  const isNew      = !template;

  const [htmlContent, setHtml]    = useState(template?.html || "");
  const [saving, setSaving]       = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testNombre, setTestNom]  = useState("Cliente Ejemplo");
  const [testLoading, setTestL]   = useState(false);
  const [testMsg, setTestMsg]     = useState(null);
  const [form, setForm]           = useState({
    nombre: template?.nombre || "",
    tipo:   template?.tipo   || "bienvenida",
    asunto: template?.asunto || "",
  });
  const [error, setError] = useState("");

  // Estado de grupos abiertos/cerrados (solo el primero abierto por defecto)
  const [gruposOpen, setGruposOpen] = useState(
    Object.fromEntries(VARIABLES_GRUPOS.map((g, i) => [g.id, i === 0]))
  );

  // Lista completa de tipos (API + los que no estén en la API)
  const TIPOS_FALLBACK = Object.entries(TIPO_META).map(([value, m]) => ({ value, label: m.label }));
  const tiposCompletos = [
    ...tipos,
    ...TIPOS_FALLBACK.filter(t => !tipos.some(a => a.value === t.value)),
  ];

  // Vista previa en vivo — debounce 350 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const iframe = previewRef.current;
      if (!iframe) return;
      const rendered = renderPreview(htmlContent, testNombre, testEmail);
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(rendered ||
        `<div style="padding:3rem;color:#aaa;font-family:sans-serif;text-align:center;font-size:14px">
           El HTML aparecerá aquí…
         </div>`
      );
      doc.close();
    }, 350);
    return () => clearTimeout(timer);
  }, [htmlContent, testNombre, testEmail]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onCerrar]);

  function insertarVariable(v) {
    const view = cmViewRef.current;
    if (!view) { setHtml(h => h + v); return; }
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: v },
      selection: { anchor: from + v.length },
    });
    view.focus();
  }

  const guardar = () => {
    if (!form.nombre.trim() || !form.asunto.trim()) { setError("Nombre y Asunto son obligatorios"); return; }
    if (!htmlContent.trim()) { setError("El HTML no puede estar vacío"); return; }
    setError("");
    setSaving(true);
    Promise.resolve(onGuardar({ ...form, html: htmlContent, design_json: null }))
      .finally(() => setSaving(false));
  };

  const enviarPrueba = async () => {
    if (!template?.id_template || !testEmail) { setTestMsg({ tipo: "error", msg: "Ingresa un email de destino" }); return; }
    setTestL(true); setTestMsg(null);
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${template.id_template}/enviar-prueba`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: testEmail, nombre: testNombre }),
    }).then(x => x.json());
    setTestL(false);
    setTestMsg({ tipo: r.ok ? "ok" : "error", msg: r.msg });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0d1117" }}>

      {/* ── Barra superior ── */}
      <div className="flex items-center gap-3 px-4 shrink-0 border-b"
        style={{ height: 52, background: "#161b22", borderColor: "#30363d" }}>
        <p className="font-semibold text-sm truncate" style={{ color: "#e6edf3" }}>
          {isNew ? "Nuevo template de correo" : `Editando: ${template.nombre}`}
        </p>
        <div className="flex-1" />
        {template?.id_template && (
          <div className="hidden lg:flex items-center gap-2">
            <input value={testNombre} onChange={e => setTestNom(e.target.value)}
              style={{ background: "#21262d", borderColor: "#30363d", color: "#e6edf3" }}
              className="border rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:border-blue-500" />
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email"
              placeholder="correo@prueba.com"
              style={{ background: "#21262d", borderColor: "#30363d", color: "#e6edf3" }}
              className="border rounded-lg px-2 py-1 text-xs w-44 focus:outline-none focus:border-blue-500 placeholder:text-neutral-600" />
            <button onClick={enviarPrueba} disabled={testLoading || !testEmail}
              className="px-3 py-1 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 font-medium">
              {testLoading ? "Enviando…" : "📧 Prueba"}
            </button>
            {testMsg && (
              <span className={`text-xs font-medium ${testMsg.tipo === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                {testMsg.msg}
              </span>
            )}
          </div>
        )}
        <button onClick={onCerrar}
          style={{ borderColor: "#30363d", color: "#8b949e" }}
          className="px-4 py-1.5 rounded-xl border text-sm hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button onClick={guardar} disabled={saving}
          className="px-5 py-1.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
          {saving && (
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {saving ? "Guardando…" : isNew ? "Crear template" : "Guardar cambios"}
        </button>
      </div>

      {/* ── Cuerpo ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (más ancha y organizada) ── */}
        <div className="overflow-y-auto shrink-0 border-r"
          style={{ width: 280, background: "#161b22", borderColor: "#30363d" }}>
          <div className="p-3 space-y-3">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6e7681" }}>
                Nombre interno <span className="text-red-400">*</span>
              </label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                style={{ background: "#21262d", borderColor: "#30363d", color: "#e6edf3" }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="Ej: Bienvenida oficial"
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6e7681" }}>Tipo</label>
              <select
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                style={{ background: "#21262d", borderColor: "#30363d", color: "#e6edf3" }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
                {tiposCompletos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="text-[10px]" style={{ color: "#6e7681" }}>Solo 1 activo por tipo.</p>
            </div>

            {/* Asunto */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6e7681" }}>
                Asunto <span className="text-red-400">*</span>
              </label>
              <input
                value={form.asunto}
                onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                style={{ background: "#21262d", borderColor: "#30363d", color: "#e6edf3" }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="¡Bienvenido/a a Inspira! 🚀"
              />
            </div>

            <div style={{ height: 1, background: "#30363d" }} />

            {/* Variables agrupadas y colapsables */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#6e7681" }}>
                Variables dinámicas
              </p>
              <div className="space-y-1.5">
                {VARIABLES_GRUPOS.map(grupo => (
                  <div key={grupo.id} className="rounded-lg overflow-hidden border" style={{ borderColor: "#30363d" }}>
                    {/* Header del grupo */}
                    <button
                      type="button"
                      onClick={() => setGruposOpen(p => ({ ...p, [grupo.id]: !p[grupo.id] }))}
                      className="w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-white/5"
                      style={{ background: "#21262d" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: grupo.accent }} />
                        <span className="text-xs font-medium" style={{ color: "#e6edf3" }}>{grupo.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#30363d", color: "#8b949e" }}>
                          {grupo.vars.length}
                        </span>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 transition-transform"
                        style={{ color: "#6e7681", transform: gruposOpen[grupo.id] ? "rotate(180deg)" : "rotate(0deg)" }}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {/* Variables del grupo */}
                    {gruposOpen[grupo.id] && (
                      <div className="p-1.5 space-y-1" style={{ background: "#0d1117" }}>
                        {grupo.vars.map(v => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => insertarVariable(`{{${v.key}}}`)}
                            title={`Insertar {{${v.key}}} en el cursor`}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent hover:border-white/10 hover:bg-white/5 transition-colors text-left">
                            <code className="text-[11px] font-mono shrink-0 px-1 py-0.5 rounded"
                              style={{ color: grupo.accent, background: `${grupo.accent}15` }}>
                              {`{{${v.key}}}`}
                            </code>
                            <span className="text-[11px] truncate" style={{ color: "#8b949e" }}>{v.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2" style={{ color: "#484f58" }}>
                Clic en cualquier variable → inserta en el cursor
              </p>
            </div>

            <div style={{ height: 1, background: "#30363d" }} />

            {/* Imágenes disponibles */}
            {assets.length > 0 && (
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#30363d" }}>
                <p className="text-xs font-semibold px-3 py-2 border-b"
                  style={{ color: "#8b949e", background: "#21262d", borderColor: "#30363d" }}>
                  📎 Imágenes disponibles
                </p>
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {assets.map(a => (
                    <button
                      key={a.id_asset}
                      type="button"
                      onClick={() => navigator.clipboard.writeText(a.url_publica)}
                      title="Copiar URL"
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-colors">
                      <img src={a.url_publica} alt={a.nombre} className="w-9 h-7 object-cover rounded shrink-0" />
                      <span className="text-[11px] truncate text-left" style={{ color: "#8b949e" }}>{a.nombre}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] px-3 py-1.5 border-t" style={{ color: "#6e7681", borderColor: "#30363d" }}>
                  Clic → copia URL · pega en src=""
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 rounded-lg p-2 border border-red-800/50"
                style={{ background: "rgba(220,38,38,0.1)" }}>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* ── Editor de código ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 shrink-0 border-b"
            style={{ height: 32, background: "#161b22", borderColor: "#30363d" }}>
            <span className="text-xs font-mono font-semibold" style={{ color: "#58a6ff" }}>HTML</span>
            <span className="text-xs" style={{ color: "#484f58" }}>
              {htmlContent.length.toLocaleString()} chars · {htmlContent.split("\n").length} líneas
            </span>
            <div className="flex-1" />
            <span className="text-[10px]" style={{ color: "#484f58" }}>Tab = 2 esp · Ctrl+Z deshacer</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0">
              <Suspense fallback={<div className="h-full" style={{ background: "#1e1e1e" }} aria-busy="true" />}>
                <EditorHtml
                  value={htmlContent}
                  onChange={(val) => setHtml(val)}
                  onCreateEditor={(view) => { cmViewRef.current = view; }}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── Vista previa en vivo ── */}
        <div className="w-[44%] flex flex-col border-l overflow-hidden"
          style={{ borderColor: "#30363d" }}>
          <div className="flex items-center justify-between px-4 shrink-0 border-b"
            style={{ height: 32, background: "#161b22", borderColor: "#30363d" }}>
            <span className="text-xs font-medium" style={{ color: "#e6edf3" }}>Vista previa en vivo</span>
            <span className="text-[10px]" style={{ color: "#484f58" }}>todas las variables reemplazadas</span>
          </div>
          <div className="flex-1 relative overflow-hidden" style={{ background: "#e5e7eb" }}>
            <iframe
              ref={previewRef}
              title="Vista previa del correo"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [tipos, setTipos]         = useState([]);
  const [assets, setAssets]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [editando, setEditando]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/email-templates");
    if (r.ok) setTemplates(r.templates || []);
    setLoading(false);
  }

  async function cargarTipos() {
    const r = await boGET("/backoffice/email-templates/tipos");
    if (r.ok) setTipos(r.tipos || []);
  }

  async function cargarAssets() {
    const r = await boGET("/backoffice/media");
    if (r.ok) setAssets(r.assets || []);
  }

  // Después de declarar las funciones que llama (el compilador de React no
  // optimiza un componente que usa algo antes de declararlo).
  useEffect(() => { cargar(); cargarTipos(); cargarAssets(); }, []);

  async function abrirEditar(t) {
    const r = await boGET(`/backoffice/email-templates/${t.id_template}`);
    if (r.ok) setEditando(r.template);
  }

  async function guardar(payload) {
    const esNuevo = editando === false;
    const r = esNuevo
      ? await boPOST("/backoffice/email-templates", payload)
      : await boPUT(`/backoffice/email-templates/${editando.id_template}`, payload);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    setEditando(null);
    cargar();
    setToast({ tipo: "ok", msg: esNuevo ? "Template creado (inactivo)." : "Template actualizado." });
  }

  async function clonar(t) {
    const r = await boGET(`/backoffice/email-templates/${t.id_template}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    const payload = {
      nombre:      `${r.template.nombre} (copia)`,
      tipo:        r.template.tipo,
      asunto:      r.template.asunto,
      html:        r.template.html,
      design_json: null,
    };
    const crear = await boPOST("/backoffice/email-templates", payload);
    if (!crear.ok) { setToast({ tipo: "error", msg: crear.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: `Clonado como "${payload.nombre}" (inactivo).` });
  }

  async function activar(t) {
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${t.id_template}/activar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then(x => x.json());
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: `"${t.nombre}" activado. Los demás de tipo "${t.tipo}" fueron desactivados.` });
  }

  async function desactivar(t) {
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${t.id_template}/desactivar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then(x => x.json());
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: "Template desactivado." });
  }

  async function eliminar(t) {
    if (t.activo) { setToast({ tipo: "error", msg: "Desactiva el template antes de eliminarlo." }); return; }
    if (!await dialog.confirm(`¿Eliminar "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
    const r = await boDELETE(`/backoffice/email-templates/${t.id_template}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: "Template eliminado." });
  }

  const templatesVisibles = filtroTipo === "todos"
    ? templates
    : templates.filter(t => t.tipo === filtroTipo);
  const tiposConTemplates = [...new Set(templates.map(t => t.tipo))];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Templates de correo</h1>
          <p className="text-sm text-neutral-500">Editor HTML con vista previa en vivo. Solo 1 activo por tipo.</p>
        </div>
        <button onClick={() => setEditando(false)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo template
        </button>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-xs text-sky-700 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
        </svg>
        <span>
          Al <strong>activar</strong> un template, todos los demás del mismo tipo se desactivan automáticamente.
          Usa <strong>Clonar</strong> (ícono azul) para duplicar un template como punto de partida.
        </span>
      </div>

      {/* Filtros */}
      {tiposConTemplates.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors
              ${filtroTipo === "todos" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
            Todos ({templates.length})
          </button>
          {tiposConTemplates.map(tipo => {
            const m = TIPO_META[tipo] || TIPO_META.otro;
            const count = templates.filter(t => t.tipo === tipo).length;
            return (
              <button key={tipo} onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors
                  ${filtroTipo === tipo ? m.color : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
                {m.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading && <p className="text-sm text-neutral-400 text-center py-10">Cargando templates…</p>}
      {!loading && templates.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
          </svg>
          <p className="text-sm">No hay templates. Crea el primero con el botón de arriba.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesVisibles.map(t => (
          <TemplateCard key={t.id_template} t={t}
            onEditar={abrirEditar} onEliminar={eliminar}
            onActivar={activar} onDesactivar={desactivar} onClonar={clonar} />
        ))}
      </div>

      {editando !== null && (
        <EditorModal
          template={editando || null}
          tipos={tipos}
          assets={assets}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm
          ${toast.tipo === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className="flex-1 leading-snug">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 shrink-0 mt-0.5">✕</button>
        </div>
      )}
    </div>
  );
}
