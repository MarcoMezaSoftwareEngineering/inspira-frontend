import { useState, useEffect } from "react";

// ─── Checklist data ────────────────────────────────────────────────────────
const CHECKLIST_SECTIONS = [
  {
    id: "docs",
    title: "Documentación académica",
    icon: "📄",
    items: [
      { id: "docs_1", text: "Título universitario obtenido y firmado" },
      { id: "docs_2", text: "Certificado de calificaciones apostillado" },
      { id: "docs_3", text: "Equivalencia de nota media (escala MEC España)" },
      { id: "docs_4", text: "Pasaporte vigente (mín. 1 año de validez restante)" },
    ],
  },
  {
    id: "postulacion",
    title: "Postulación universitaria",
    icon: "🏫",
    items: [
      { id: "post_1", text: "Elegir al menos 3 universidades objetivo en España" },
      { id: "post_2", text: "Completar preinscripción en cada universidad" },
      { id: "post_3", text: "Pagar tasas de admisión si corresponde" },
      { id: "post_4", text: "Carta de motivación redactada y revisada" },
      { id: "post_5", text: "Carta(s) de recomendación conseguidas" },
    ],
  },
  {
    id: "beca",
    title: "Beca",
    icon: "🎓",
    items: [
      { id: "beca_1", text: "Identificar becas para las que califico" },
      { id: "beca_2", text: "Enviar solicitud de beca antes del plazo" },
      { id: "beca_3", text: "Confirmar recepción y número de expediente" },
    ],
  },
  {
    id: "visa",
    title: "Visa / Estancia",
    icon: "✈️",
    items: [
      { id: "visa_1", text: "Determinar si necesito Visa de Estudios o Autorización de Estancia" },
      { id: "visa_2", text: "Carta de admisión o matrícula de la universidad" },
      { id: "visa_3", text: "Acreditar medios económicos suficientes" },
      { id: "visa_4", text: "Seguro médico privado con cobertura en España" },
      { id: "visa_5", text: "Solicitar cita consular con al menos 3 meses de antelación" },
    ],
  },
  {
    id: "llegada",
    title: "Llegada a España",
    icon: "🏠",
    items: [
      { id: "arr_1", text: "Empadronarse en el ayuntamiento (imprescindible)" },
      { id: "arr_2", text: "Solicitar NIE / TIE en comisaría de policía" },
      { id: "arr_3", text: "Abrir cuenta bancaria española" },
      { id: "arr_4", text: "Solicitar tarjeta sanitaria en el centro de salud" },
    ],
  },
];

const LS_KEY = "inspira_checklist_v1";

function loadChecked() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── Icon helpers ──────────────────────────────────────────────────────────
function ExternalIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="inline-block ml-1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function CheckCircle({ done }) {
  return done ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="text-[#1D6A4A] shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-[#E2E8F0] shrink-0">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function GuiaMaster() {
  const [tabActiva, setTabActiva] = useState("inicio");
  const [checked, setChecked] = useState(loadChecked);

  // Persist checklist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(checked));
    } catch {
      // storage unavailable
    }
  }, [checked]);

  function toggleCheck(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Compute overall checklist progress
  const allItems = CHECKLIST_SECTIONS.flatMap((s) => s.items);
  const doneCount = allItems.filter((it) => checked[it.id]).length;
  const totalCount = allItems.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  const TABS = [
    { id: "inicio", label: "🏠 Inicio" },
    { id: "proceso", label: "📋 Proceso" },
    { id: "docs", label: "📄 Docs" },
    { id: "apostilla", label: "🔏 Apostilla" },
    { id: "visa", label: "✈️ Visa" },
    { id: "checklist", label: "✅ Checklist" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-primary to-[#1D6A4A] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 mb-4">
            <span className="text-white text-xs font-semibold">⚖️ Inspira Legal · Asesoría Especializada</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Guía Máster España 2026–2027
          </h1>
          <p className="text-white/80 font-sans text-base mb-6 max-w-2xl leading-relaxed">
            Todo lo que necesitas saber para postular a un máster oficial en España: proceso, documentos, apostilla, visa y checklist interactivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              📋 Guía completa 2026
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#F5C842]/20 text-[#F5C842] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#F5C842]/30">
              ✅ {doneCount}/{totalCount} completado
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex gap-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTabActiva(t.id)}
              className={`px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors font-sans ${
                tabActiva === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-primary hover:border-primary/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ═══════════════ INICIO ═══════════════ */}
        {tabActiva === "inicio" && (
          <div>
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-primary to-[#1D6A4A] rounded-2xl p-7 mb-6 text-white">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Bienvenido/a</p>
              <h2 className="font-serif text-2xl font-bold mb-3">Tu camino al máster en España</h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
                Esta guía te acompañará en cada etapa del proceso: desde elegir tu máster hasta llegar a España.
                Usa el checklist para no perderte ningún paso.
              </p>
            </div>

            {/* What is a máster oficial? */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">
                  🎓
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2">¿Qué es un Máster Oficial?</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    Un máster oficial en España (también llamado máster universitario) es un título de posgrado regulado por el
                    Espacio Europeo de Educación Superior (EEES). Tiene entre <strong>60 y 120 ECTS</strong> (European Credits)
                    y una duración de 1 a 2 años. Es el único tipo de máster que da acceso a programas de doctorado y que es
                    reconocido en toda la Unión Europea.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: "📅", label: "Duración", val: "1–2 años" },
                      { icon: "📐", label: "Créditos", val: "60–120 ECTS" },
                      { icon: "🌍", label: "Reconocimiento", val: "Toda la UE" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-xl mb-1">{item.icon}</p>
                        <p className="text-xs text-slate-400 font-sans">{item.label}</p>
                        <p className="text-sm font-semibold text-primary">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Por qué Inspira */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] border border-[#1D6A4A]/20 flex items-center justify-center text-2xl shrink-0">
                  ⚖️
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2">¿Por qué Inspira Legal?</h3>
                  <ul className="space-y-2">
                    {[
                      "Asesoría jurídica especializada en visas de estudios y autorizaciones de estancia",
                      "Acompañamiento completo en apostilla digital y legalización de documentos",
                      "Guía paso a paso para el proceso de admisión y solicitud de becas",
                      "Soporte post-llegada: NIE, TIE, empadronamiento y cuenta bancaria",
                      "Equipo hispanohablante con experiencia en trámites consulares latinoamericanos",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-sans">
                        <span className="text-[#F5C842] font-bold shrink-0 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Info alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm mb-1">Importante antes de comenzar</p>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    Los plazos de admisión en universidades españolas suelen abrir entre <strong>enero y marzo</strong> para el
                    curso siguiente. Las becas tienen plazos propios, muchas veces más cortos. Te recomendamos iniciar el proceso
                    con al menos <strong>8 meses de anticipación</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTabActiva("proceso")}
                className="bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Ver el proceso completo →
              </button>
              <button
                onClick={() => setTabActiva("checklist")}
                className="bg-white border border-[#E2E8F0] text-primary font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#F4F6F9] transition-colors"
              >
                Ir al checklist
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ PROCESO ═══════════════ */}
        {tabActiva === "proceso" && (
          <div>
            {/* Phase cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { num: "01", title: "Investigación", color: "bg-blue-50 border-blue-200", numColor: "text-blue-700", desc: "Elige tu área de estudio, investiga universidades y másteres. Define si necesitas beca y cuáles aplican para ti." },
                { num: "02", title: "Documentación", color: "bg-[#E8F5EE] border-[#1D6A4A]/25", numColor: "text-[#1D6A4A]", desc: "Obtén apostilla de título y calificaciones, equivalencia MEC, carta de motivación y cartas de recomendación." },
                { num: "03", title: "Postulación", color: "bg-amber-50 border-amber-200", numColor: "text-amber-700", desc: "Completa preinscripción universitaria, solicita la beca en los plazos establecidos y espera la resolución." },
                { num: "04", title: "Visa y llegada", color: "bg-rose-50 border-rose-200", numColor: "text-rose-700", desc: "Tramita visa de estudios o autorización de estancia, llega a España, empadrónate y obtén tu TIE." },
              ].map((phase) => (
                <div key={phase.num} className={`border rounded-2xl p-5 ${phase.color}`}>
                  <span className={`font-serif text-3xl font-bold ${phase.numColor} leading-none`}>{phase.num}</span>
                  <h3 className={`font-serif font-bold text-primary text-lg mt-1 mb-2`}>{phase.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>

            {/* Calendar timeline */}
            <Card>
              <h3 className="font-serif text-lg font-bold text-primary mb-4">Calendario recomendado</h3>
              <div className="space-y-3">
                {[
                  { mes: "Ene–Feb", icon: "🔍", accion: "Investigar másteres y universidades objetivo. Consultar con Inspira Legal." },
                  { mes: "Feb–Mar", icon: "📄", accion: "Iniciar apostilla digital de título y calificaciones. Calcular equivalencia MEC." },
                  { mes: "Mar–Abr", icon: "🏫", accion: "Abrir preinscripciones universitarias. Solicitar AUIP/TalentUnileon/USAL (plazos cortos)." },
                  { mes: "Abr–May", icon: "🎓", accion: "Solicitar AUIP (UPV, UC3M, URJC cierre 30 abr). Solicitar Erasmus Mundus." },
                  { mes: "Jun–Jul", icon: "📬", accion: "Recibir cartas de admisión. Solicitar becas UCM y UAH Cervantes (julio). Tramitar visa." },
                  { mes: "Sep", icon: "✈️", accion: "Viaje a España. Empadronamiento, NIE, TIE, apertura cuenta bancaria, tarjeta sanitaria." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-20 shrink-0 text-right">
                      <span className="text-xs font-bold text-primary font-sans">{item.mes}</span>
                    </div>
                    <div className="w-8 flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#F4F6F9] border-2 border-[#E2E8F0] flex items-center justify-center text-base">
                        {item.icon}
                      </div>
                      {i < 5 && <div className="w-0.5 h-6 bg-[#E2E8F0] mt-1" />}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pt-1">{item.accion}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Steps 1–10 */}
            <Card>
              <h3 className="font-serif text-lg font-bold text-primary mb-5">Los 10 pasos del proceso</h3>
              <div className="space-y-4">
                {[
                  { n: 1, icon: "🔎", t: "Elige tu área y máster", d: "Define el área de estudio, las universidades españolas que te interesan y el tipo de máster (presencial, semipresencial, doble titulación)." },
                  { n: 2, icon: "🎓", t: "Verifica requisitos académicos", d: "Comprueba la nota media mínima requerida, los idiomas y si tu grado es compatible con el máster elegido." },
                  { n: 3, icon: "📋", t: "Evalúa becas disponibles", d: "Revisa qué becas aplican para ti (AUIP, TalentUnileon, Luis Vives, USAL, F. Carolina, Erasmus) y sus plazos exactos." },
                  { n: 4, icon: "📄", t: "Consigue la apostilla", d: "Apostilla tu título universitario y certificado de calificaciones en el país de origen (ver sección Apostilla)." },
                  { n: 5, icon: "🔢", t: "Calcula equivalencia MEC", d: "Convierte tu nota media a la escala española (0–10) usando la fórmula MEC. Muchas becas lo exigen como documento." },
                  { n: 6, icon: "✍️", t: "Redacta tu carta de motivación", d: "Adapta tu carta a cada universidad. Incluye por qué ese máster, tu proyecto profesional y tu conexión con España o Europa." },
                  { n: 7, icon: "🏫", t: "Realiza la preinscripción", d: "Completa la preinscripción universitaria dentro del plazo. Guarda el comprobante: algunas becas lo exigen antes de solicitar." },
                  { n: 8, icon: "📮", t: "Solicita la beca", d: "Envía la solicitud de beca con todos los documentos requeridos. Verifica doble que la lista esté completa." },
                  { n: 9, icon: "🛂", t: "Tramita la visa o estancia", d: "Con la carta de admisión, solicita la Visa de Estudios (>90 días) o Autorización de Estancia (<90 días) en el consulado." },
                  { n: 10, icon: "🏠", t: "Llega y regularízate", d: "Al llegar: empadrónate, solicita el NIE/TIE, abre cuenta bancaria y pide la tarjeta sanitaria gratuita." },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {step.n}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-primary text-sm mb-0.5">
                        {step.icon} {step.t}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════ DOCUMENTOS ═══════════════ */}
        {tabActiva === "docs" && (
          <div>
            {/* Green banner */}
            <div className="bg-[#E8F5EE] border border-[#1D6A4A]/25 rounded-2xl p-5 mb-4 flex items-start gap-3">
              <span className="text-2xl shrink-0">✅</span>
              <div>
                <p className="font-semibold text-[#1D6A4A] font-sans mb-1">Preferimos Apostilla Digital</p>
                <p className="text-sm text-[#1D6A4A]/80 leading-relaxed">
                  En la mayoría de los casos la <strong>apostilla digital con QR verificable</strong> es aceptada por universidades
                  y consulados españoles. Es más rápida, económica y segura que la física.
                  Inspira Legal te guía en obtenerla desde tu país.
                </p>
              </div>
            </div>

            {/* Navy banner */}
            <div className="bg-primary text-white rounded-2xl p-5 mb-4 flex items-start gap-3">
              <span className="text-2xl shrink-0">📋</span>
              <div>
                <p className="font-semibold mb-1">Cumple TODAS las etapas del proceso</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  No envíes documentos incompletos. Una solicitud rechazada por documentación incompleta puede costarte
                  el cupo o la beca. Usa el checklist de esta guía para verificar cada punto antes de enviar.
                </p>
              </div>
            </div>

            {/* Amber card: Diploma + Apostilla = 1 PDF */}
            <div className="bg-[#F5C842]/10 border border-[#F5C842]/40 rounded-2xl p-5 mb-6 flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <p className="font-semibold text-primary mb-1">Diploma + Apostilla = UN ÚNICO PDF</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Cuando envíes documentos digitalmente, el diploma y su apostilla deben ir <strong>combinados en un solo archivo PDF</strong>.
                  Sube primero el diploma y luego la apostilla en el mismo documento.
                  No los envíes por separado: algunas plataformas solo admiten un archivo por campo.
                </p>
              </div>
            </div>

            {/* Doc list */}
            <h3 className="font-serif text-lg font-bold text-primary mb-4">Documentos habituales requeridos</h3>
            <div className="space-y-3">
              {[
                {
                  cat: "Identidad",
                  icon: "🪪",
                  docs: [
                    { n: "Pasaporte vigente", d: "Con mínimo 12 meses de validez restante. Copia de las páginas con datos y fotos." },
                    { n: "DNI o documento de identidad nacional", d: "Puede ser requerido adicionalmente por algunas universidades." },
                  ],
                },
                {
                  cat: "Académicos",
                  icon: "🎓",
                  docs: [
                    { n: "Título universitario apostillado", d: "Original + apostilla. En PDF: diploma + apostilla en un solo archivo." },
                    { n: "Certificado oficial de calificaciones apostillado", d: "Con nota media calculada. Apostillado igual que el título." },
                    { n: "Equivalencia nota media MEC", d: "Cálculo de tu nota en escala 0–10 española. Obligatorio para la mayoría de becas." },
                    { n: "Certificado de idioma (si aplica)", d: "B2 o superior en español, inglés o el idioma del programa. DELE, IELTS, TOEFL, etc." },
                  ],
                },
                {
                  cat: "Motivación y referencias",
                  icon: "✍️",
                  docs: [
                    { n: "Carta de motivación", d: "Documento personalizado por universidad/beca. Máx. 1–2 páginas o 2.000 caracteres según la entidad." },
                    { n: "Cartas de recomendación", d: "1–2 cartas de profesores o directores académicos. Algunas becas exigen carta del rector/vicerrector." },
                    { n: "Currículum Vitae", d: "Formato europeo (Europass) o modelo AUIP según la beca. En español o inglés." },
                  ],
                },
                {
                  cat: "Postulación y beca",
                  icon: "📮",
                  docs: [
                    { n: "Comprobante de preinscripción universitaria", d: "Resguardo o confirmación de la universidad. Obligatorio para AUIP antes de solicitar beca." },
                    { n: "Formulario de solicitud de beca", d: "Específico de cada convocatoria. Algunos exigen formulario en PDF, otros en plataforma online." },
                    { n: "Declaración jurada de no residencia en España", d: "Documento firmado donde declaras no haber residido en España más de 12 meses. Algunas becas lo exigen." },
                  ],
                },
                {
                  cat: "Económicos y seguros",
                  icon: "💰",
                  docs: [
                    { n: "Seguro médico privado con cobertura en España", d: "Obligatorio para visa de estudios. Debe cubrir al menos repatriación y asistencia sanitaria." },
                    { n: "Acreditación de medios económicos", d: "Extracto bancario, carta de sponsor o declaración de beca. Mínimo aprox. €600/mes durante la estancia." },
                  ],
                },
              ].map((cat) => (
                <Card key={cat.cat}>
                  <h4 className="font-serif font-bold text-primary mb-3 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.cat}
                  </h4>
                  <div className="space-y-3">
                    {cat.docs.map((doc, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 rounded-full bg-[#1D6A4A] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{doc.n}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{doc.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════ APOSTILLA ═══════════════ */}
        {tabActiva === "apostilla" && (
          <div>
            {/* What is apostille */}
            <Card>
              <h3 className="font-serif text-lg font-bold text-primary mb-3">¿Qué es la Apostilla de La Haya?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                La Apostilla es una certificación internacional que valida la autenticidad de un documento público
                emitido en un país firmante del Convenio de La Haya (1961). En el contexto del máster en España,
                se requiere que tu <strong>título universitario</strong> y tu <strong>certificado de calificaciones</strong> estén
                apostillados para que sean aceptados como documentos oficiales.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: "🌍", t: "Internacional", d: "Reconocida en +120 países firmantes del Convenio." },
                  { icon: "✅", t: "Obligatoria", d: "Sin apostilla, el documento no tiene validez oficial en España." },
                  { icon: "⚡", t: "Digital preferida", d: "La apostilla digital con QR es aceptada y más rápida." },
                ].map((item) => (
                  <div key={item.t} className="bg-[#F4F6F9] rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="text-xs font-bold text-primary mb-1">{item.t}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Digital vs Physical */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#E8F5EE] border border-[#1D6A4A]/25 rounded-2xl p-5">
                <p className="text-lg mb-2">✅</p>
                <h4 className="font-serif font-bold text-[#1D6A4A] mb-2">Apostilla Digital (preferida)</h4>
                <ul className="space-y-1.5">
                  {[
                    "Tiene QR de verificación en línea",
                    "Se obtiene en días (no semanas)",
                    "Aceptada por universidades y consulados",
                    "No requiere envío físico",
                    "Más económica y segura",
                  ].map((it, i) => (
                    <li key={i} className="text-sm text-[#1D6A4A]/80 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">•</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <p className="text-lg mb-2">📄</p>
                <h4 className="font-serif font-bold text-primary mb-2">Apostilla Física</h4>
                <ul className="space-y-1.5">
                  {[
                    "Sello/sticker sobre el documento original",
                    "Puede tardar semanas o meses",
                    "Requiere envío por mensajería internacional",
                    "Costo más elevado (envíos + tasas)",
                    "Usar cuando la digital no está disponible",
                  ].map((it, i) => (
                    <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">•</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Diploma + Apostilla = 1 PDF */}
            <div className="bg-[#F5C842]/10 border border-[#F5C842]/40 rounded-2xl p-5 mb-6 flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <p className="font-semibold text-primary mb-1">Diploma + Apostilla = UN ÚNICO PDF</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Al enviar tus documentos digitalmente, combina el diploma y su apostilla en <strong>un solo archivo PDF</strong>.
                  Ordena: página 1 = diploma, página 2 en adelante = apostilla. No los envíes como archivos separados.
                </p>
              </div>
            </div>

            {/* By country */}
            <h3 className="font-serif text-lg font-bold text-primary mb-4">Proceso por país</h3>
            <div className="space-y-3">
              {[
                {
                  pais: "🇨🇴 Colombia",
                  entidad: "Cancillería de Colombia (Ministerio de Relaciones Exteriores)",
                  digital: true,
                  desc: "Colombia emite apostilla digital con código de verificación. Se solicita en línea en el portal de la Cancillería. Plazo habitual: 1–5 días hábiles.",
                  portal: "https://www.cancilleria.gov.co",
                },
                {
                  pais: "🇵🇪 Perú",
                  entidad: "Ministerio de Relaciones Exteriores (MRE) del Perú",
                  digital: true,
                  desc: "Perú ofrece apostilla electrónica vía el portal del MRE. Se puede solicitar desde el extranjero con poder notarial.",
                  portal: "https://www.gob.pe/mre",
                },
                {
                  pais: "🇲🇽 México",
                  entidad: "Secretaría de Gobernación (SEGOB) / SRE según el documento",
                  digital: false,
                  desc: "La apostilla en México la emite la Secretaría de Gobernación (documentos notariales) o la SRE (documentos académicos). El proceso puede variar por estado. Consultar plataforma RENAPO.",
                  portal: "https://www.gob.mx/apostilla",
                },
                {
                  pais: "🇦🇷 Argentina",
                  entidad: "Ministerio de Relaciones Exteriores de Argentina (MRECyC)",
                  digital: true,
                  desc: "Argentina tiene apostilla electrónica tramitable en línea. Los documentos académicos universitarios deben estar certificados previamente por el Ministerio de Educación.",
                  portal: "https://apostilla.mrecic.gov.ar",
                },
                {
                  pais: "🇪🇨 Ecuador",
                  entidad: "Ministerio de Relaciones Exteriores y Movilidad Humana",
                  digital: false,
                  desc: "El proceso en Ecuador requiere gestión presencial o a través de gestores. Los documentos académicos deben estar certificados por SENESCYT antes de la apostilla.",
                  portal: "https://www.cancilleria.gob.ec",
                },
                {
                  pais: "🇨🇱 Chile",
                  entidad: "Ministerio de Relaciones Exteriores de Chile",
                  digital: true,
                  desc: "Chile ofrece apostilla electrónica con código QR. Se tramita en línea a través del portal del Ministerio de Relaciones Exteriores.",
                  portal: "https://apostilla.minrel.gov.cl",
                },
              ].map((item) => (
                <Card key={item.pais}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-serif font-bold text-primary text-base">{item.pais}</h4>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${item.digital ? "bg-[#E8F5EE] text-[#1D6A4A]" : "bg-amber-50 text-amber-700"}`}>
                      {item.digital ? "Digital disponible" : "Proceso mixto"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 font-sans">
                    <strong>Entidad: </strong>{item.entidad}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.desc}</p>
                  <a
                    href={item.portal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1D6A4A] font-semibold hover:underline"
                  >
                    Portal oficial
                    <ExternalIcon />
                  </a>
                </Card>
              ))}
            </div>

            {/* Inspira CTA */}
            <div className="mt-6 bg-primary text-white rounded-2xl p-6 text-center">
              <p className="font-serif text-lg font-bold mb-2">¿Tienes dudas con tu apostilla?</p>
              <p className="text-white/80 text-sm mb-4">Inspira Legal te orienta en cada paso del proceso de legalización documental.</p>
              <a
                href="mailto:administracion@inspira-legal.cloud"
                className="inline-block bg-[#F5C842] text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#F5C842]/90 transition-colors"
              >
                Consultar con Inspira Legal
              </a>
            </div>
          </div>
        )}

        {/* ═══════════════ VISA ═══════════════ */}
        {tabActiva === "visa" && (
          <div>
            {/* Visa hero */}
            <div className="bg-gradient-to-r from-primary to-[#1D6A4A] rounded-2xl p-7 mb-6 text-white">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Trámite migratorio</p>
              <h2 className="font-serif text-2xl font-bold mb-3">Visa y autorización de estancia</h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-xl">
                Para estudiar en España necesitarás uno de estos dos documentos según la duración de tu programa.
                Inspira Legal te acompaña en ambos procesos.
              </p>
            </div>

            {/* Visa cards */}
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {/* Visa estudios */}
              <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                  ✈️
                </div>
                <h3 className="font-serif font-bold text-primary text-lg mb-1">Visa de Estudios</h3>
                <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 inline-block mb-3">
                  Duración del máster &gt;90 días
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Autoriza a residir en España por el período de estudios (hasta 1 o 2 años, renovable).
                  Se solicita en el consulado español del país de origen.
                </p>
                <div className="space-y-1.5">
                  {[
                    "Carta de admisión de la universidad",
                    "Seguro médico privado vigente",
                    "Acreditación de medios económicos",
                    "Certificado de antecedentes penales",
                    "Fotografías recientes tipo pasaporte",
                    "Pago de tasa consular",
                  ].map((req, i) => (
                    <p key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-[#1D6A4A] mt-0.5 shrink-0">✓</span>
                      {req}
                    </p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-600">Plazo de tramitación:</strong> 2–8 semanas según consulado
                  </p>
                </div>
              </div>

              {/* Autorización de estancia */}
              <div className="bg-white border-2 border-[#1D6A4A]/20 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] border border-[#1D6A4A]/20 flex items-center justify-center text-2xl mb-4">
                  📋
                </div>
                <h3 className="font-serif font-bold text-primary text-lg mb-1">Autorización de Estancia</h3>
                <p className="text-xs text-[#1D6A4A] font-semibold bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-full px-2.5 py-1 inline-block mb-3">
                  Estancias ≤90 días
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Permite entrar a España para programas cortos o presencialidad parcial. Proceso más sencillo.
                  Algunos másteres semipresenciales con módulos intensivos pueden entrar aquí.
                </p>
                <div className="space-y-1.5">
                  {[
                    "Pasaporte vigente (Schengen)",
                    "Carta de admisión o matrícula del programa",
                    "Seguro de viaje con cobertura médica",
                    "Medios económicos suficientes",
                    "Reserva de alojamiento",
                  ].map((req, i) => (
                    <p key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-[#1D6A4A] mt-0.5 shrink-0">✓</span>
                      {req}
                    </p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-600">Nota:</strong> Si el programa supera 90 días, necesitas visa de estudios
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <Card>
              <h3 className="font-serif font-bold text-primary mb-4">Consejos clave para el proceso</h3>
              <div className="space-y-3">
                {[
                  { icon: "🗓️", tip: "Solicita cita consular con al menos 3 meses de anticipación. La demanda en temporada alta puede ser muy alta." },
                  { icon: "📋", tip: "Ten todos los documentos listos ANTES de solicitar la cita. En muchos consulados no hay segunda oportunidad en la misma cita." },
                  { icon: "💰", tip: "Acredita medios económicos suficientes (aprox. €600/mes). Puede ser beca concedida, extracto bancario o carta de sponsor." },
                  { icon: "🏥", tip: "El seguro médico debe estar en español y cubrir todo el período de estancia, incluyendo repatriación." },
                  { icon: "🏠", tip: "Una dirección de alojamiento confirmada en España facilita el trámite, aunque no siempre es obligatoria en la visa." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inspira CTA */}
            <div className="bg-gradient-to-r from-primary to-[#1D6A4A] text-white rounded-2xl p-7 text-center mt-2">
              <p className="font-serif text-xl font-bold mb-2">Inspira Legal te acompaña en ambos procesos</p>
              <p className="text-white/80 text-sm mb-5 max-w-md mx-auto leading-relaxed">
                Desde determinar qué tipo de autorización necesitas hasta preparar el expediente completo para el consulado.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="mailto:administracion@inspira-legal.cloud"
                  className="inline-block bg-[#F5C842] text-primary font-bold text-sm px-7 py-3 rounded-xl hover:bg-[#F5C842]/90 transition-colors"
                >
                  Consultar ahora
                </a>
                <a
                  href="https://wa.me/message/inspira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white/15 border border-white/30 text-white font-semibold text-sm px-7 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CHECKLIST ═══════════════ */}
        {tabActiva === "checklist" && (
          <div>
            {/* Progress */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-primary text-lg">Tu progreso</h3>
                <span className="text-sm font-semibold text-[#1D6A4A]">{doneCount}/{totalCount} completados</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-[#1D6A4A] to-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                {pct === 100
                  ? "¡Felicidades! Has completado todos los pasos."
                  : pct >= 50
                  ? "Vas muy bien, sigue adelante."
                  : "Estás comenzando. Cada paso cuenta."}
              </p>
            </Card>

            {/* Sections */}
            <div className="space-y-5">
              {CHECKLIST_SECTIONS.map((section) => {
                const secDone = section.items.filter((it) => checked[it.id]).length;
                const secTotal = section.items.length;
                return (
                  <div key={section.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-primary flex items-center gap-2">
                        <span>{section.icon}</span>
                        {section.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-sans">
                        {secDone}/{secTotal}
                      </span>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F4F6F9]">
                      {section.items.map((item) => {
                        const done = !!checked[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            className={`w-full text-left flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#F4F6F9] ${done ? "bg-[#F4F6F9]" : "bg-white"}`}
                          >
                            <CheckCircle done={done} />
                            <span className={`text-sm font-sans transition-colors ${done ? "line-through text-slate-400" : "text-slate-700"}`}>
                              {item.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reset + note */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0]">
              <p className="text-xs text-slate-400 font-sans">
                Tu progreso se guarda automáticamente en este dispositivo.
              </p>
              <button
                onClick={() => setChecked({})}
                className="text-xs text-red-500 hover:text-red-700 font-semibold font-sans"
              >
                Reiniciar checklist
              </button>
            </div>

            {/* CTA */}
            {pct === 100 && (
              <div className="mt-6 bg-gradient-to-r from-[#1D6A4A] to-primary text-white rounded-2xl p-7 text-center">
                <p className="text-3xl mb-3">🎉</p>
                <p className="font-serif text-xl font-bold mb-2">¡Lo lograste!</p>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                  Has completado todos los pasos del proceso. Inspira Legal está aquí si necesitas asesoría final.
                </p>
                <a
                  href="mailto:administracion@inspira-legal.cloud"
                  className="inline-block bg-[#F5C842] text-primary font-bold text-sm px-7 py-3 rounded-xl hover:bg-[#F5C842]/90 transition-colors"
                >
                  Contactar a Inspira Legal
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
