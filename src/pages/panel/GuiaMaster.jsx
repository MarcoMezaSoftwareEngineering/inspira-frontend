import { useState, useEffect } from "react";
import { whatsappDesde } from "../../config/contacto";
import Icono from "../../components/common/Icono";
import IconoPaso from "../../components/common/IconoPaso";

// ─── Checklist data ────────────────────────────────────────────────────────
const CHECKLIST_SECTIONS = [
  {
    id: "docs",
    title: "Documentación académica",
    icon: "documento",
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
    icon: "libro",
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
    icon: "birrete",
    items: [
      { id: "beca_1", text: "Identificar becas para las que califico" },
      { id: "beca_2", text: "Enviar solicitud de beca antes del plazo" },
      { id: "beca_3", text: "Confirmar recepción y número de expediente" },
    ],
  },
  {
    id: "visa",
    title: "Visa / Estancia",
    icon: "avion",
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
    icon: "casa",
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="text-verde shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-trazo shrink-0">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-linea rounded-[20px] p-4 sm:p-5 mb-4 shadow-sm ${className}`}>
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
    { id: "inicio", label: "Inicio", icono: "casa" },
    { id: "proceso", label: "Proceso", icono: "brujula" },
    { id: "docs", label: "Docs", icono: "documento" },
    { id: "apostilla", label: "Apostilla", icono: "candado" },
    { id: "visa", label: "Visa", icono: "avion" },
    { id: "checklist", label: "Checklist", icono: "check" },
  ];

  return (
    <div className="bg-fondo font-sans">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-noche via-primary to-primary-light px-5 py-8 sm:px-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 mb-4">
            <span className="inline-flex items-center gap-1.5 text-white text-meta font-semibold"><Icono nombre="balanza" size={14} />Inspira Legal · Asesoría Especializada</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Guía Máster España 2026–2027
          </h1>
          <p className="text-white/90 font-sans text-base mb-6 max-w-[68ch] leading-relaxed">
            Todo lo que necesitas saber para postular a un máster oficial en España: proceso, documentos, apostilla, visa y checklist interactivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-meta font-semibold px-3 py-1.5 rounded-full">
              <Icono nombre="documento" size={14} />Guía completa 2026
            </span>
            <span className="inline-flex items-center gap-1.5 bg-accent/20 text-white text-meta font-semibold px-3 py-1.5 rounded-full border border-accent/30 tabular-nums">
              <Icono nombre="check" size={14} />{doneCount}/{totalCount} completado
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-fondo border-b border-linea sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-2.5 overflow-x-auto [scrollbar-width:none]">
          <div className="inline-flex gap-1 p-1 rounded-full bg-neutro-soft">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTabActiva(t.id)}
              className={`inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full text-cuerpo font-semibold whitespace-nowrap transition-colors font-sans ${
                tabActiva === t.id
                  ? "bg-primary text-white"
                  : "text-tinta-2 hover:bg-white hover:text-primary"
              }`}
            >
              <Icono nombre={t.icono} size={16} />
              {t.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">

        {/* ═══════════════ INICIO ═══════════════ */}
        {tabActiva === "inicio" && (
          <div>
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-noche via-primary to-primary-light rounded-3xl p-6 sm:p-7 mb-6 text-white">
              <p className="text-eyebrow font-bold uppercase text-white/85 mb-2">Bienvenido/a</p>
              <h2 className="font-serif text-2xl font-bold mb-3">Tu camino al máster en España</h2>
              <p className="text-white/90 text-lectura leading-relaxed max-w-[68ch]">
                Esta guía te acompañará en cada etapa del proceso: desde elegir tu máster hasta llegar a España.
                Usa el checklist para no perderte ningún paso.
              </p>
            </div>

            {/* What is a máster oficial? */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-info-soft text-primary-light flex items-center justify-center shrink-0">
                  <Icono nombre="birrete" size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-display-2 font-bold text-primary mb-2">¿Qué es un Máster Oficial?</h3>
                  <p className="text-lectura text-tinta-2 leading-relaxed mb-3 max-w-[68ch]">
                    Un máster oficial en España (también llamado máster universitario) es un título de posgrado regulado por el
                    Espacio Europeo de Educación Superior (EEES). Tiene entre <strong>60 y 120 ECTS</strong> (European Credits)
                    y una duración de 1 a 2 años. Es el único tipo de máster que da acceso a programas de doctorado y que es
                    reconocido en toda la Unión Europea.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: "calendario", label: "Duración", val: "1–2 años" },
                      { icon: "libro", label: "Créditos", val: "60–120 ECTS" },
                      { icon: "globo", label: "Reconocimiento", val: "Toda la UE" },
                    ].map((item) => (
                      <div key={item.label} className="bg-fondo rounded-xl p-3 text-center">
                        <Icono nombre={item.icon} size={20} className="mx-auto mb-1 text-primary-light" />
                        <p className="text-meta text-tinta-2 font-sans">{item.label}</p>
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
                <div className="w-12 h-12 rounded-xl bg-verde-soft text-verde flex items-center justify-center shrink-0">
                  <Icono nombre="balanza" size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-display-2 font-bold text-primary mb-2">¿Por qué Inspira Legal?</h3>
                  <ul className="space-y-2">
                    {[
                      "Asesoría jurídica especializada en visas de estudios y autorizaciones de estancia",
                      "Acompañamiento completo en apostilla digital y legalización de documentos",
                      "Guía paso a paso para el proceso de admisión y solicitud de becas",
                      "Soporte post-llegada: NIE, TIE, empadronamiento y cuenta bancaria",
                      "Equipo hispanohablante con experiencia en trámites consulares latinoamericanos",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-lectura text-tinta font-sans leading-relaxed">
                        <IconoPaso nombre="check" className="w-4 h-4 mt-1 shrink-0 text-verde" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Info alert */}
            <div className="bg-aviso-soft border border-accent/30 rounded-2xl p-4 sm:p-5 mb-4">
              <div className="flex items-start gap-3">
                <IconoPaso nombre="info" className="w-5 h-5 shrink-0 mt-0.5 text-aviso-ink" />
                <div>
                  <p className="font-bold text-aviso-ink text-cuerpo mb-1">Importante antes de comenzar</p>
                  <p className="text-aviso-ink text-cuerpo leading-relaxed max-w-[68ch]">
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
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-cuerpo px-5 min-h-11 rounded-full hover:bg-primary-light transition-colors"
              >
                Ver el proceso completo
                <IconoPaso nombre="arrowRight" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTabActiva("checklist")}
                className="inline-flex items-center bg-white border border-linea text-primary font-semibold text-cuerpo px-5 min-h-11 rounded-full hover:bg-info-soft hover:border-sky-dark transition-colors"
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
                { num: "01", title: "Investigación", color: "bg-info-soft border-info-ink/20", numColor: "text-info-ink", desc: "Elige tu área de estudio, investiga universidades y másteres. Define si necesitas beca y cuáles aplican para ti." },
                { num: "02", title: "Documentación", color: "bg-verde-soft border-verde/25", numColor: "text-verde-ink", desc: "Obtén apostilla de título y calificaciones, equivalencia MEC, carta de motivación y cartas de recomendación." },
                { num: "03", title: "Postulación", color: "bg-aviso-soft border-accent/30", numColor: "text-aviso-ink", desc: "Completa preinscripción universitaria, solicita la beca en los plazos establecidos y espera la resolución." },
                { num: "04", title: "Visa y llegada", color: "bg-neutro-soft border-trazo/30", numColor: "text-neutro-ink", desc: "Tramita visa de estudios o autorización de estancia, llega a España, empadrónate y obtén tu TIE." },
              ].map((phase) => (
                <div key={phase.num} className={`border rounded-2xl p-5 ${phase.color}`}>
                  <span className={`font-serif text-3xl font-bold ${phase.numColor} leading-none`}>{phase.num}</span>
                  <h3 className={`font-serif font-bold text-primary text-display-2 mt-1 mb-2`}>{phase.title}</h3>
                  <p className="text-cuerpo text-tinta-2 leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>

            {/* Calendar timeline */}
            <Card>
              <h3 className="font-serif text-display-2 font-bold text-primary mb-4">Calendario recomendado</h3>
              <div className="space-y-3">
                {[
                  { mes: "Ene–Feb", icon: <Icono nombre="lupa" size={16} />, accion: "Investigar másteres y universidades objetivo. Consultar con Inspira Legal." },
                  { mes: "Feb–Mar", icon: <Icono nombre="documento" size={16} />, accion: "Iniciar apostilla digital de título y calificaciones. Calcular equivalencia MEC." },
                  { mes: "Mar–Abr", icon: <Icono nombre="libro" size={16} />, accion: "Abrir preinscripciones universitarias. Solicitar AUIP/TalentUnileon/USAL (plazos cortos)." },
                  { mes: "Abr–May", icon: <Icono nombre="birrete" size={16} />, accion: "Solicitar AUIP (UPV, UC3M, URJC cierre 30 abr). Solicitar Erasmus Mundus." },
                  { mes: "Jun–Jul", icon: <IconoPaso nombre="mail" className="w-4 h-4" />, accion: "Recibir cartas de admisión. Solicitar becas UCM y UAH Cervantes (julio). Tramitar visa." },
                  { mes: "Sep", icon: <Icono nombre="avion" size={16} />, accion: "Viaje a España. Empadronamiento, NIE, TIE, apertura cuenta bancaria, tarjeta sanitaria." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-20 shrink-0 text-right">
                      <span className="text-meta font-bold text-primary font-sans">{item.mes}</span>
                    </div>
                    <div className="w-8 flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-fondo border-2 border-linea flex items-center justify-center text-primary-light">
                        {item.icon}
                      </div>
                      {i < 5 && <div className="w-0.5 h-6 bg-linea mt-1" />}
                    </div>
                    <p className="text-cuerpo text-tinta-2 leading-relaxed pt-1">{item.accion}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Steps 1–10 */}
            <Card>
              <h3 className="font-serif text-display-2 font-bold text-primary mb-5">Los 10 pasos del proceso</h3>
              <div className="space-y-4">
                {[
                  { n: 1, icon: "lupa", t: "Elige tu área y máster", d: "Define el área de estudio, las universidades españolas que te interesan y el tipo de máster (presencial, semipresencial, doble titulación)." },
                  { n: 2, icon: "birrete", t: "Verifica requisitos académicos", d: "Comprueba la nota media mínima requerida, los idiomas y si tu grado es compatible con el máster elegido." },
                  { n: 3, icon: "estrella", t: "Evalúa becas disponibles", d: "Revisa qué becas aplican para ti (AUIP, TalentUnileon, Luis Vives, USAL, F. Carolina, Erasmus) y sus plazos exactos." },
                  { n: 4, icon: "documento", t: "Consigue la apostilla", d: "Apostilla tu título universitario y certificado de calificaciones en el país de origen (ver sección Apostilla)." },
                  { n: 5, icon: "grafico", t: "Calcula equivalencia MEC", d: "Convierte tu nota media a la escala española (0–10) usando la fórmula MEC. Muchas becas lo exigen como documento." },
                  { n: 6, icon: "chat", t: "Redacta tu carta de motivación", d: "Adapta tu carta a cada universidad. Incluye por qué ese máster, tu proyecto profesional y tu conexión con España o Europa." },
                  { n: 7, icon: "libro", t: "Realiza la preinscripción", d: "Completa la preinscripción universitaria dentro del plazo. Guarda el comprobante: algunas becas lo exigen antes de solicitar." },
                  { n: 8, icon: "paquete", t: "Solicita la beca", d: "Envía la solicitud de beca con todos los documentos requeridos. Verifica doble que la lista esté completa." },
                  { n: 9, icon: "pasaporte", t: "Tramita la visa o estancia", d: "Con la carta de admisión, solicita la Visa de Estudios (>90 días) o Autorización de Estancia (<90 días) en el consulado." },
                  { n: 10, icon: "casa", t: "Llega y regularízate", d: "Al llegar: empadrónate, solicita el NIE/TIE, abre cuenta bancaria y pide la tarjeta sanitaria gratuita." },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-cuerpo shrink-0 tabular-nums">
                      {step.n}
                    </div>
                    <div className="flex-1 pt-0.5 min-w-0">
                      <p className="flex items-center gap-2 font-bold text-primary text-lectura mb-0.5">
                        <Icono nombre={step.icon} size={16} className="shrink-0 text-primary-light" />{step.t}
                      </p>
                      <p className="text-cuerpo text-tinta-2 leading-relaxed max-w-[68ch]">{step.d}</p>
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
            <div className="bg-verde-soft border border-verde/25 rounded-2xl p-4 sm:p-5 mb-4 flex items-start gap-3">
              <IconoPaso nombre="checkCircle" className="w-6 h-6 shrink-0 text-verde" />
              <div>
                <p className="font-bold text-verde-ink font-sans mb-1">Preferimos Apostilla Digital</p>
                <p className="text-cuerpo text-verde-ink leading-relaxed max-w-[68ch]">
                  En la mayoría de los casos la <strong>apostilla digital con QR verificable</strong> es aceptada por universidades
                  y consulados españoles. Es más rápida, económica y segura que la física.
                  Inspira Legal te guía en obtenerla desde tu país.
                </p>
              </div>
            </div>

            {/* Navy banner */}
            <div className="bg-primary text-white rounded-2xl p-4 sm:p-5 mb-4 flex items-start gap-3">
              <Icono nombre="documento" size={24} className="shrink-0 text-sky" />
              <div>
                <p className="font-bold mb-1">Cumple TODAS las etapas del proceso</p>
                <p className="text-cuerpo text-white/90 leading-relaxed max-w-[68ch]">
                  No envíes documentos incompletos. Una solicitud rechazada por documentación incompleta puede costarte
                  el cupo o la beca. Usa el checklist de esta guía para verificar cada punto antes de enviar.
                </p>
              </div>
            </div>

            {/* Amber card: Diploma + Apostilla = 1 PDF */}
            <div className="bg-sun/10 border border-sun/50 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3">
              <IconoPaso nombre="sparkles" className="w-6 h-6 shrink-0 text-aviso-ink" />
              <div>
                <p className="font-bold text-primary mb-1">Diploma + Apostilla = UN ÚNICO PDF</p>
                <p className="text-cuerpo text-tinta leading-relaxed max-w-[68ch]">
                  Cuando envíes documentos digitalmente, el diploma y su apostilla deben ir <strong>combinados en un solo archivo PDF</strong>.
                  Sube primero el diploma y luego la apostilla en el mismo documento.
                  No los envíes por separado: algunas plataformas solo admiten un archivo por campo.
                </p>
              </div>
            </div>

            {/* Doc list */}
            <h3 className="font-serif text-display-2 font-bold text-primary mb-4">Documentos habituales requeridos</h3>
            <div className="space-y-3">
              {[
                {
                  cat: "Identidad",
                  icon: "pasaporte",
                  docs: [
                    { n: "Pasaporte vigente", d: "Con mínimo 12 meses de validez restante. Copia de las páginas con datos y fotos." },
                    { n: "DNI o documento de identidad nacional", d: "Puede ser requerido adicionalmente por algunas universidades." },
                  ],
                },
                {
                  cat: "Académicos",
                  icon: "birrete",
                  docs: [
                    { n: "Título universitario apostillado", d: "Original + apostilla. En PDF: diploma + apostilla en un solo archivo." },
                    { n: "Certificado oficial de calificaciones apostillado", d: "Con nota media calculada. Apostillado igual que el título." },
                    { n: "Equivalencia nota media MEC", d: "Cálculo de tu nota en escala 0–10 española. Obligatorio para la mayoría de becas." },
                    { n: "Certificado de idioma (si aplica)", d: "B2 o superior en español, inglés o el idioma del programa. DELE, IELTS, TOEFL, etc." },
                  ],
                },
                {
                  cat: "Motivación y referencias",
                  icon: "chat",
                  docs: [
                    { n: "Carta de motivación", d: "Documento personalizado por universidad/beca. Máx. 1–2 páginas o 2.000 caracteres según la entidad." },
                    { n: "Cartas de recomendación", d: "1–2 cartas de profesores o directores académicos. Algunas becas exigen carta del rector/vicerrector." },
                    { n: "Currículum Vitae", d: "Formato europeo (Europass) o modelo AUIP según la beca. En español o inglés." },
                  ],
                },
                {
                  cat: "Postulación y beca",
                  icon: "paquete",
                  docs: [
                    { n: "Comprobante de preinscripción universitaria", d: "Resguardo o confirmación de la universidad. Obligatorio para AUIP antes de solicitar beca." },
                    { n: "Formulario de solicitud de beca", d: "Específico de cada convocatoria. Algunos exigen formulario en PDF, otros en plataforma online." },
                    { n: "Declaración jurada de no residencia en España", d: "Documento firmado donde declaras no haber residido en España más de 12 meses. Algunas becas lo exigen." },
                  ],
                },
                {
                  cat: "Económicos y seguros",
                  icon: "euro",
                  docs: [
                    { n: "Seguro médico privado con cobertura en España", d: "Obligatorio para visa de estudios. Debe cubrir al menos repatriación y asistencia sanitaria." },
                    { n: "Acreditación de medios económicos", d: "Extracto bancario, carta de sponsor o declaración de beca. Mínimo aprox. €600/mes durante la estancia." },
                  ],
                },
              ].map((cat) => (
                <Card key={cat.cat}>
                  <h4 className="text-lectura font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-info-soft text-primary-light grid place-items-center shrink-0"><Icono nombre={cat.icon} size={16} /></span>
                    {cat.cat}
                  </h4>
                  <div className="space-y-3">
                    {cat.docs.map((doc, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-2 h-2 rounded-full bg-verde shrink-0" />
                        <div>
                          <p className="text-cuerpo font-semibold text-tinta">{doc.n}</p>
                          <p className="text-cuerpo-sm text-tinta-2 leading-relaxed mt-0.5">{doc.d}</p>
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
              <h3 className="font-serif text-display-2 font-bold text-primary mb-3">¿Qué es la Apostilla de La Haya?</h3>
              <p className="text-lectura text-tinta-2 leading-relaxed mb-4 max-w-[68ch]">
                La Apostilla es una certificación internacional que valida la autenticidad de un documento público
                emitido en un país firmante del Convenio de La Haya (1961). En el contexto del máster en España,
                se requiere que tu <strong>título universitario</strong> y tu <strong>certificado de calificaciones</strong> estén
                apostillados para que sean aceptados como documentos oficiales.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: "globo", t: "Internacional", d: "Reconocida en +120 países firmantes del Convenio." },
                  { icon: "check", t: "Obligatoria", d: "Sin apostilla, el documento no tiene validez oficial en España." },
                  { icon: "rayo", t: "Digital preferida", d: "La apostilla digital con QR es aceptada y más rápida." },
                ].map((item) => (
                  <div key={item.t} className="bg-fondo rounded-xl p-4 text-center">
                    <Icono nombre={item.icon} size={24} className="mx-auto mb-2 text-primary-light" />
                    <p className="text-cuerpo-sm font-bold text-primary mb-1">{item.t}</p>
                    <p className="text-cuerpo-sm text-tinta-2 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Digital vs Physical */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-verde-soft border border-verde/25 rounded-2xl p-5">
                <IconoPaso nombre="checkCircle" className="w-6 h-6 mb-2 text-verde" />
                <h4 className="text-lectura font-bold text-verde-ink mb-2">Apostilla Digital (preferida)</h4>
                <ul className="space-y-1.5">
                  {[
                    "Tiene QR de verificación en línea",
                    "Se obtiene en días (no semanas)",
                    "Aceptada por universidades y consulados",
                    "No requiere envío físico",
                    "Más económica y segura",
                  ].map((it, i) => (
                    <li key={i} className="text-cuerpo text-verde-ink flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">•</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-linea rounded-2xl p-5">
                <Icono nombre="documento" size={24} className="mb-2 text-primary-light" />
                <h4 className="text-lectura font-bold text-primary mb-2">Apostilla Física</h4>
                <ul className="space-y-1.5">
                  {[
                    "Sello/sticker sobre el documento original",
                    "Puede tardar semanas o meses",
                    "Requiere envío por mensajería internacional",
                    "Costo más elevado (envíos + tasas)",
                    "Usar cuando la digital no está disponible",
                  ].map((it, i) => (
                    <li key={i} className="text-cuerpo text-tinta-2 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">•</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Diploma + Apostilla = 1 PDF */}
            <div className="bg-sun/10 border border-sun/50 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3">
              <IconoPaso nombre="sparkles" className="w-6 h-6 shrink-0 text-aviso-ink" />
              <div>
                <p className="font-bold text-primary mb-1">Diploma + Apostilla = UN ÚNICO PDF</p>
                <p className="text-cuerpo text-tinta leading-relaxed max-w-[68ch]">
                  Al enviar tus documentos digitalmente, combina el diploma y su apostilla en <strong>un solo archivo PDF</strong>.
                  Ordena: página 1 = diploma, página 2 en adelante = apostilla. No los envíes como archivos separados.
                </p>
              </div>
            </div>

            {/* By country */}
            <h3 className="font-serif text-display-2 font-bold text-primary mb-4">Proceso por país</h3>
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
                    <h4 className="text-lectura font-bold text-primary">{item.pais}</h4>
                    <span className={`text-meta font-semibold px-2.5 py-1 rounded-full shrink-0 ${item.digital ? "bg-verde-soft text-verde-ink" : "bg-aviso-soft text-aviso-ink"}`}>
                      {item.digital ? "Digital disponible" : "Proceso mixto"}
                    </span>
                  </div>
                  <p className="text-cuerpo-sm text-tinta-2 mb-2 font-sans">
                    <strong>Entidad: </strong>{item.entidad}
                  </p>
                  <p className="text-cuerpo text-tinta-2 leading-relaxed mb-1 max-w-[68ch]">{item.desc}</p>
                  <a
                    href={item.portal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-11 text-cuerpo-sm text-primary-light font-semibold hover:underline"
                  >
                    Portal oficial
                    <ExternalIcon />
                  </a>
                </Card>
              ))}
            </div>

            {/* Inspira CTA */}
            <div className="mt-6 bg-primary text-white rounded-2xl p-6 text-center">
              <p className="font-serif text-display-2 font-bold mb-2">¿Tienes dudas con tu apostilla?</p>
              <p className="text-white/90 text-cuerpo mb-4">Inspira Legal te orienta en cada paso del proceso de legalización documental.</p>
              <a
                href="mailto:administracion@inspira-legal.cloud"
                className="inline-flex items-center min-h-11 bg-accent text-primary-dark font-bold text-cuerpo px-6 rounded-full hover:bg-accent-dark transition-colors"
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
            <div className="bg-gradient-to-br from-noche via-primary to-primary-light rounded-3xl p-6 sm:p-7 mb-6 text-white">
              <p className="text-eyebrow font-bold uppercase text-white/85 mb-2">Trámite migratorio</p>
              <h2 className="font-serif text-2xl font-bold mb-3">Visa y autorización de estancia</h2>
              <p className="text-white/90 text-lectura leading-relaxed max-w-[68ch]">
                Para estudiar en España necesitarás uno de estos dos documentos según la duración de tu programa.
                Inspira Legal te acompaña en ambos procesos.
              </p>
            </div>

            {/* Visa cards */}
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {/* Visa estudios */}
              <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-info-soft text-primary-light flex items-center justify-center mb-4">
                  <Icono nombre="avion" size={24} />
                </div>
                <h3 className="font-serif font-bold text-primary text-display-2 mb-1">Visa de Estudios</h3>
                <p className="text-meta text-aviso-ink font-semibold bg-aviso-soft border border-accent/30 rounded-full px-2.5 py-1 inline-block mb-3">
                  Duración del máster &gt;90 días
                </p>
                <p className="text-cuerpo text-tinta-2 leading-relaxed mb-4">
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
                    <p key={i} className="text-cuerpo-sm text-tinta-2 flex items-start gap-2">
                      <IconoPaso nombre="check" className="w-4 h-4 mt-0.5 shrink-0 text-verde" />
                      {req}
                    </p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-linea">
                  <p className="text-cuerpo-sm text-tinta-2">
                    <strong className="text-tinta">Plazo de tramitación:</strong> 2–8 semanas según consulado
                  </p>
                </div>
              </div>

              {/* Autorización de estancia */}
              <div className="bg-white border-2 border-verde/20 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-verde-soft text-verde flex items-center justify-center mb-4">
                  <Icono nombre="documento" size={24} />
                </div>
                <h3 className="font-serif font-bold text-primary text-display-2 mb-1">Autorización de Estancia</h3>
                <p className="text-meta text-verde-ink font-semibold bg-verde-soft border border-verde/20 rounded-full px-2.5 py-1 inline-block mb-3">
                  Estancias ≤90 días
                </p>
                <p className="text-cuerpo text-tinta-2 leading-relaxed mb-4">
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
                    <p key={i} className="text-cuerpo-sm text-tinta-2 flex items-start gap-2">
                      <IconoPaso nombre="check" className="w-4 h-4 mt-0.5 shrink-0 text-verde" />
                      {req}
                    </p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-linea">
                  <p className="text-cuerpo-sm text-tinta-2">
                    <strong className="text-tinta">Nota:</strong> Si el programa supera 90 días, necesitas visa de estudios
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <Card>
              <h3 className="font-serif font-bold text-primary text-display-2 mb-4">Consejos clave para el proceso</h3>
              <div className="space-y-3">
                {[
                  { icon: "calendario", tip: "Solicita cita consular con al menos 3 meses de anticipación. La demanda en temporada alta puede ser muy alta." },
                  { icon: "documento", tip: "Ten todos los documentos listos ANTES de solicitar la cita. En muchos consulados no hay segunda oportunidad en la misma cita." },
                  { icon: "euro", tip: "Acredita medios económicos suficientes (aprox. €600/mes). Puede ser beca concedida, extracto bancario o carta de sponsor." },
                  { icon: "salud", tip: "El seguro médico debe estar en español y cubrir todo el período de estancia, incluyendo repatriación." },
                  { icon: "casa", tip: "Una dirección de alojamiento confirmada en España facilita el trámite, aunque no siempre es obligatoria en la visa." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-info-soft text-primary-light grid place-items-center shrink-0"><Icono nombre={item.icon} size={18} /></span>
                    <p className="text-cuerpo text-tinta-2 leading-relaxed pt-1.5 max-w-[68ch]">{item.tip}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inspira CTA */}
            <div className="bg-gradient-to-br from-noche via-primary to-primary-light text-white rounded-3xl p-6 sm:p-7 text-center mt-2">
              <p className="font-serif text-display-2 font-bold mb-2">Inspira Legal te acompaña en ambos procesos</p>
              <p className="text-white/90 text-cuerpo mb-5 max-w-md mx-auto leading-relaxed">
                Desde determinar qué tipo de autorización necesitas hasta preparar el expediente completo para el consulado.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="mailto:administracion@inspira-legal.cloud"
                  className="inline-flex items-center min-h-11 bg-accent text-primary-dark font-bold text-cuerpo px-6 rounded-full hover:bg-accent-dark transition-colors"
                >
                  Consultar ahora
                </a>
                <a
                  href={whatsappDesde("panel-guia-master", "Tengo una consulta sobre mi máster.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-11 bg-white/10 border border-white/25 text-white font-semibold text-cuerpo px-6 rounded-full hover:bg-white/20 transition-colors"
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
                <h3 className="font-serif font-bold text-primary text-display-2">Tu progreso</h3>
                <span className="text-cuerpo font-semibold text-primary-light tabular-nums">{doneCount}/{totalCount} completados</span>
              </div>
              <div className="w-full bg-linea rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="w-full bg-gradient-to-r from-primary-light to-accent h-full rounded-full origin-left transition-transform duration-500 motion-reduce:transition-none"
                  style={{ transform: `scaleX(${pct / 100})` }}
                />
              </div>
              <p className="text-cuerpo-sm text-tinta-2">
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
                      <h3 className="text-lectura font-bold text-primary flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-info-soft text-primary-light grid place-items-center shrink-0"><Icono nombre={section.icon} size={16} /></span>
                        {section.title}
                      </h3>
                      <span className="text-meta text-tinta-2 font-sans tabular-nums">
                        {secDone}/{secTotal}
                      </span>
                    </div>
                    <div className="bg-white border border-linea rounded-2xl overflow-hidden shadow-sm divide-y divide-linea">
                      {section.items.map((item) => {
                        const done = !!checked[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            aria-pressed={done}
                            className={`w-full text-left flex items-center gap-4 px-5 py-4 min-h-[56px] transition-colors hover:bg-fondo ${done ? "bg-fondo" : "bg-white"}`}
                          >
                            <CheckCircle done={done} />
                            <span className={`text-cuerpo font-sans transition-colors ${done ? "line-through text-tinta-2" : "text-tinta"}`}>
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
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-linea">
              <p className="text-cuerpo-sm text-tinta-2 font-sans">
                Tu progreso se guarda automáticamente en este dispositivo.
              </p>
              <button
                onClick={() => setChecked({})}
                className="inline-flex items-center min-h-11 text-cuerpo-sm text-alto-ink hover:underline font-semibold font-sans"
              >
                Reiniciar checklist
              </button>
            </div>

            {/* CTA */}
            {pct === 100 && (
              <div className="mt-6 bg-gradient-to-br from-noche via-primary to-primary-light text-white rounded-3xl p-6 sm:p-7 text-center">
                <Icono nombre="trofeo" size={32} className="mx-auto mb-3 text-accent" />
                <p className="font-serif text-display-2 font-bold mb-2">¡Lo lograste!</p>
                <p className="text-white/90 text-cuerpo mb-5 leading-relaxed">
                  Has completado todos los pasos del proceso. Inspira Legal está aquí si necesitas asesoría final.
                </p>
                <a
                  href="mailto:administracion@inspira-legal.cloud"
                  className="inline-flex items-center min-h-11 bg-accent text-primary-dark font-bold text-cuerpo px-6 rounded-full hover:bg-accent-dark transition-colors"
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
