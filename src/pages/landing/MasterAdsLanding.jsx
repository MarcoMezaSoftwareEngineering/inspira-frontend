// src/pages/landing/MasterAdsLanding.jsx
//
// Landing standalone para campañas de ads (Meta/IG). Sin Header ni Footer
// del sitio: una sola página, un solo objetivo — agendar la asesoría
// personalizada de 30 minutos. Contenido, precios e iconos salen de lo que
// ya existe en /servicios/master, /nosotros y config/testimonios.js; nada
// inventado (testimonios reales, sin claims nuevos).
import { useEffect, useState } from "react";
import { CALENDLY_URL } from "../../config/contacto";
import { ASESORIA_PRINCIPAL } from "../../config/asesorias";
import { TESTIMONIOS } from "../../config/testimonios";
import { CAPACIDADES, COMPARATIVA } from "../../config/plataforma";
import Icono from "../../components/common/Icono";
import logo from "../../assets/images/logo.png";
import fotoCarina from "../../assets/images/landing/carina-meza.jpg";
import fotoSebastian from "../../assets/images/landing/sebastian-alpiste.jpg";

const EQUIPO_FOTOS = [
  { foto: fotoCarina, alt: "Carina Meza, CEO y Consultora Legal de Inspira Legal — Perú" },
  { foto: fotoSebastian, alt: "Sebastián Alpiste, equipo de Inspira Legal — Madrid" },
];

const HERRAMIENTAS = [
  {
    icono: "laptop",
    tono: "primary",
    titulo: "Tu portal privado",
    texto: CAPACIDADES.find((c) => c.id === "panel")?.texto,
    cta: "Conocer el portal",
    href: "/plataforma",
  },
  {
    icono: "calendario",
    tono: "accent",
    titulo: "Calendario de citas en vivo",
    texto:
      "Eliges tú el día y la hora de tu asesoría, en tiempo real, sin ir y venir por WhatsApp para cuadrar un horario.",
    cta: "Ver horarios disponibles",
    href: CALENDLY_URL,
    externo: true,
  },
  {
    icono: "euro",
    tono: "sun",
    titulo: "Calculadora gratuita",
    texto: "Calcula el costo real de tu máster en España: matrícula, visa, apostilla y gastos de vida. Al instante.",
    cta: "Probar la calculadora",
    href: "/calculadora-master.html",
  },
];

const ETAPAS = [
  {
    n: "01",
    icono: "brujula",
    title: "Búsqueda y viabilidad",
    bullets: [
      "Entrevista inicial y análisis de perfil",
      "Informe de viabilidad académica",
      "Lista de centros oficiales para visado",
    ],
  },
  {
    n: "02",
    icono: "libro",
    title: "Guía y asesoría educativa",
    bullets: [
      "CV europeo optimizado para universidades",
      "Carta de motivación por universidad",
      "Equivalencia de notas y ranking",
      "Cartas de recomendación y kit de bienvenida",
    ],
  },
  {
    n: "03",
    icono: "documento",
    title: "Postulación a másteres",
    bullets: [
      "Postulación oficial por universidad y comunidad",
      "Revisión final de documentos",
      "Seguimiento y subsanación de observaciones",
      "Entrega de credenciales de acceso",
    ],
  },
  {
    n: "04",
    icono: "birrete",
    title: "Matrícula y admisión final",
    bullets: [
      "Revisión de carta de admisión oficial",
      "Gestión documentaria final",
      "Asesoría en pagos de matrícula y plazos",
    ],
  },
];

const LOGROS = [
  { icono: "usuarios", texto: "Acompañamiento por especialistas en extranjería y educación española en cada paso." },
  { icono: "chat", texto: "Reuniones 1 a 1 para avances, dudas y subsanaciones en tiempo real." },
  { icono: "escudo", texto: "Trámites que cumplen la normativa española vigente, sin riesgos." },
  { icono: "maletin", texto: "Gestión integral: de documentos y CV a admisión, postulación y matrícula final." },
  { icono: "estrella", texto: "Acceso a becas como Generación Bicentenario y Fundación Carolina." },
  { icono: "mapa", texto: "Búsqueda personalizada entre +80 universidades públicas españolas." },
];

const COMO_TRABAJAMOS = [
  {
    icono: "balanza",
    titulo: "Diagnóstico honesto",
    texto:
      "En la primera asesoría te decimos qué vía te conviene de verdad — incluso si eso significa esperar o elegir un proceso distinto al que tenías en mente.",
  },
  {
    icono: "maletin",
    titulo: "Paquete a tu medida",
    texto:
      "No vendemos paquetes genéricos: después de conocer tu caso armamos exactamente los servicios que necesitas, ni uno más.",
  },
  {
    icono: "laptop",
    titulo: "Seguimiento medible",
    texto:
      "Cada expediente vive en nuestro panel digital: sabes en qué paso está tu trámite, qué falta y qué sigue, sin perseguir a nadie.",
  },
];

// Comunidades reales donde operan los planes (masterPlans.data.js), para la
// franja de cobertura. Ordenadas como aparecen en el catálogo real.
const COMUNIDADES = [
  "Andalucía", "Cantabria", "Asturias", "Castilla-La Mancha", "Galicia",
  "Castilla y León", "La Rioja", "País Vasco", "Murcia", "Extremadura",
  "Aragón", "Comunidad Valenciana", "Cataluña", "Madrid",
];

const QUIZ_PRIORIDADES = ["Costo más bajo", "Más universidades", "Mejor ranking o becas"];
const QUIZ_TRAMITE = ["Sí, ya lo tengo resuelto", "No, todavía no", "No estoy seguro"];

// Ventanas emergentes: cada una con su propio disparador y ángulo. Nunca dos
// a la vez — se controla con un solo estado `modal`.
const MODALES = {
  recordatorio: {
    icono: "birrete",
    tono: "accent",
    titulo: "¿Todavía tienes dudas sobre tu máster?",
    texto:
      "Resuélvelas en una asesoría personalizada de 30 minutos con un especialista. Sales con un plan de acción concreto para tu caso.",
    cta: `Reservar mi asesoría — ${ASESORIA_PRINCIPAL.precio}`,
  },
  precio: {
    icono: "euro",
    tono: "sun",
    titulo: "Hay opciones para cada presupuesto",
    texto:
      "Desde programas económicos por 730 €/año hasta MBA de mejor ranking. En tu asesoría te mostramos exactamente qué opciones encajan con tu presupuesto.",
    cta: "Quiero ver mis opciones",
  },
  salida: {
    icono: "reloj",
    tono: "primary",
    titulo: "Antes de irte…",
    texto: `Tu asesoría personalizada de 30 minutos sigue disponible por ${ASESORIA_PRINCIPAL.precio}. Agenda ahora y sal con un plan de acción concreto para tu máster.`,
    cta: "Sí, quiero mi asesoría",
  },
};

const FAQS = [
  {
    q: "¿Qué incluye la asesoría de 30 minutos?",
    a: `${ASESORIA_PRINCIPAL.descripcion} Incluye: ${ASESORIA_PRINCIPAL.incluye.join("; ")}.`,
  },
  {
    q: "¿Es totalmente online?",
    a: "Sí. La reunión es online, desde cualquier parte del mundo, a la hora que agendes en el calendario.",
  },
  {
    q: "¿Cuánto cuesta el Método 360° completo?",
    a: "Depende de tu perfil y del alcance que necesites (universidades y comunidades). En la asesoría revisamos tu caso y te damos el costo exacto para tu situación, sin compromiso.",
  },
  {
    q: "¿Qué pasa después de la asesoría?",
    a: "Si decides avanzar, entras al Método 360°: 4 etapas guiadas, desde la búsqueda y viabilidad hasta tu matrícula final, con seguimiento en nuestro panel digital.",
  },
];

function CTAButton({ children, className = "", pulse = false, fullWidth = false }) {
  return (
    <span className={`relative inline-flex ${fullWidth ? "w-full" : ""}`}>
      {pulse && (
        <span className="absolute inset-0 rounded-xl bg-accent animate-ping opacity-40 pointer-events-none" />
      )}
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener"
        className={`relative inline-flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95 bg-accent hover:bg-accent-dark text-white ${fullWidth ? "w-full" : ""} ${className}`}
      >
        {children}
      </a>
    </span>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <span className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-sky" : "text-accent"}`}>
      {children}
    </span>
  );
}

function IconBadge({ nombre, size = "md", tone = "primary" }) {
  const dims = size === "lg" ? "w-14 h-14" : "w-11 h-11";
  const tones = {
    primary: "bg-primary text-white",
    accent: "bg-accent text-white",
    sky: "bg-sky text-primary",
    sun: "bg-sun text-primary",
  };
  return (
    <div className={`shrink-0 rounded-xl flex items-center justify-center ${dims} ${tones[tone]}`}>
      <Icono nombre={nombre} size={size === "lg" ? 26 : 22} />
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-primary">{item.q}</span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full bg-secondary-light flex items-center justify-center text-primary transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed">{item.a}</div>
      )}
    </div>
  );
}

// Entrada en CSS puro, solo con transform (nunca opacity): no depende de
// IntersectionObserver (el sitio ya tuvo un sistema de revelado por scroll
// con ese mecanismo y no fue confiable — ver memoria del proyecto) y, al no
// tocar la opacidad, el contenido NUNCA queda invisible pase lo que pase con
// la animación — en el peor caso simplemente no se desliza.
function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`animate-[revealSlideUp_0.6s_ease-out_both] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1200 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{prefix}{n}{suffix}</>;
}

function PlanQuiz() {
  const [paso, setPaso] = useState(0);
  const [prioridad, setPrioridad] = useState(null);
  const [tramite, setTramite] = useState(null);

  function reiniciar() {
    setPaso(0);
    setPrioridad(null);
    setTramite(null);
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-7 sm:p-9 max-w-xl mx-auto">
      {paso === 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Pregunta 1 de 2</p>
          <h3 className="font-fraunces text-xl sm:text-2xl font-bold text-primary mb-6">
            ¿Qué priorizas para tu máster?
          </h3>
          <div className="grid gap-3">
            {QUIZ_PRIORIDADES.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => { setPrioridad(op); setPaso(1); }}
                className="text-left px-5 py-4 rounded-xl border border-neutral-200 hover:border-accent hover:bg-accent/5 font-semibold text-primary transition-all"
              >
                {op}
              </button>
            ))}
          </div>
        </>
      )}
      {paso === 1 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Pregunta 2 de 2</p>
          <h3 className="font-fraunces text-xl sm:text-2xl font-bold text-primary mb-6">
            ¿Ya tienes resuelto tu visado o estancia?
          </h3>
          <div className="grid gap-3">
            {QUIZ_TRAMITE.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => { setTramite(op); setPaso(2); }}
                className="text-left px-5 py-4 rounded-xl border border-neutral-200 hover:border-accent hover:bg-accent/5 font-semibold text-primary transition-all"
              >
                {op}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaso(0)}
            className="mt-5 text-xs text-neutral-400 hover:text-neutral-600"
          >
            ← Volver
          </button>
        </>
      )}
      {paso === 2 && (
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-4">
            <Icono nombre="destello" size={26} />
          </div>
          <h3 className="font-fraunces text-xl sm:text-2xl font-bold text-primary mb-3">
            Ya sabemos por dónde empezar
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-7">
            Priorizas <b>{prioridad?.toLowerCase()}</b>, y sobre el visado nos dices: “{tramite}”.
            En tu asesoría de 30 minutos armamos el plan exacto para tu caso — comunidades,
            universidades y presupuesto real, no una respuesta genérica.
          </p>
          <CTAButton pulse fullWidth>Reservar mi asesoría →</CTAButton>
          <button
            type="button"
            onClick={reiniciar}
            className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-4"
          >
            Volver a empezar
          </button>
        </div>
      )}
    </div>
  );
}

function HerramientaCard({ h }) {
  const [abierto, setAbierto] = useState(false);
  const esCalculadora = h.href === "/calculadora-master.html";

  return (
    <div className="h-full bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
      <IconBadge nombre={h.icono} tone={h.tono} size="lg" />
      <h3 className="font-bold text-primary mt-4">{h.titulo}</h3>
      <p className="text-sm text-neutral-500 mt-2 leading-relaxed flex-1">{h.texto}</p>
      {esCalculadora ? (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-dark"
        >
          {abierto ? "Ocultar calculadora ▲" : `${h.cta} ▾`}
        </button>
      ) : (
        <a
          href={h.href}
          target={h.externo ? "_blank" : undefined}
          rel={h.externo ? "noopener" : undefined}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-dark"
        >
          {h.cta} →
        </a>
      )}
      {esCalculadora && abierto && (
        <div className="mt-4 -mx-2 rounded-xl overflow-hidden border border-neutral-200">
          <iframe
            src="/calculadora-master.html"
            title="Calculadora Máster Gratis — Inspira"
            className="w-full border-0"
            style={{ height: "560px" }}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

export default function MasterAdsLanding() {
  const [faqOpen, setFaqOpen] = useState(0);
  const [etapaActiva, setEtapaActiva] = useState(0);
  const [barDismissed, setBarDismissed] = useState(false);
  const [modal, setModal] = useState(null); // null | "recordatorio" | "precio" | "salida"
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  function abrirModal(clave) {
    try {
      if (sessionStorage.getItem(`master_ads_popup_${clave}`)) return;
      sessionStorage.setItem(`master_ads_popup_${clave}`, "1");
    } catch { /* noop */ }
    setModal((actual) => actual ?? clave);
  }

  // Entrada del hero al montar.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Paralaje del hero + barra de progreso de lectura + ventana por scroll.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrollY(y);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.round((y / max) * 100)) : 0);
      if (max > 0 && y / max > 0.55) abrirModal("precio");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ventana por tiempo (15s) — la primera si nadie hizo scroll todavía.
  useEffect(() => {
    const t = setTimeout(() => abrirModal("recordatorio"), 15000);
    return () => clearTimeout(t);
  }, []);

  // Ventana de intención de salida (desktop: mouse sale por arriba de la ventana).
  useEffect(() => {
    if (window.innerWidth < 768) return;
    function onLeave(e) {
      if (e.clientY <= 0) abrirModal("salida");
    }
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, []);

  return (
    <div className="w-full bg-white overflow-x-hidden font-sans">
      <style>{`
        @keyframes marqueeComunidades { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes floatSlowA { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-18px) translateX(8px); } }
        @keyframes floatSlowB { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(16px) translateX(-10px); } }
        @keyframes fadeInUpBar { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes revealSlideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
        @keyframes modalPopIn { from { transform: scale(0.92) translateY(14px); } to { transform: scale(1) translateY(0); } }
      `}</style>

      {/* Barra de progreso de lectura */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-100/50">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* Marca mínima, con salida hacia el sitio completo */}
      <div className="px-6 pt-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Inspira Legal" className="h-8 w-auto" />
            <span className="text-xs text-neutral-400 hidden sm:inline">· Sueña · Aprende · Viaja</span>
          </div>
          <a
            href="/servicios/master"
            className="text-xs font-semibold text-primary/70 hover:text-primary underline underline-offset-4 shrink-0"
          >
            Ver sitio completo →
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none bg-accent opacity-[0.08] animate-[floatSlowA_9s_ease-in-out_infinite]"
          style={{ transform: `translate(calc(30% + ${scrollY * 0.06}px), -30%)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none bg-sky opacity-[0.12] animate-[floatSlowB_11s_ease-in-out_infinite]"
          style={{ transform: `translate(-30%, calc(30% - ${scrollY * 0.04}px))` }}
        />
        <div
          className={`max-w-3xl mx-auto relative z-10 text-center transition-transform duration-700 ease-out ${mounted ? "translate-y-0" : "translate-y-6"}`}
        >
          <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary/80 text-sm px-4 py-1.5 rounded-full mb-6">
            <Icono nombre="birrete" size={16} />
            Método 360° · España 2027/2028
          </span>
          <h1 className="font-fraunces text-4xl md:text-5xl font-bold leading-tight mb-5 text-primary">
            Ayudamos a profesionales latinoamericanos a estudiar un{" "}
            <span className="text-accent">máster en universidades públicas de España</span>,
            con acompañamiento 360°.
          </h1>
          <p className="text-neutral-500 text-lg mb-5 leading-relaxed max-w-xl mx-auto">
            Te acompañamos desde la búsqueda del máster hasta la matrícula: asesoría educativa,
            admisión universitaria, postulación y seguimiento integral.
          </p>

          <div className="inline-flex items-center gap-2 bg-sun/15 border border-sun/40 rounded-full px-4 py-2 mb-8">
            <Icono nombre="euro" size={16} className="text-[#C98F1B]" />
            <span className="text-sm font-bold text-[#8A6415]">
              Desde programas económicos por 730 €/año hasta MBA de mejor ranking
            </span>
          </div>

          <div className="flex gap-4 mb-9 max-w-md mx-auto">
            {[
              { value: 98, suffix: "%", l: "Admisión", tone: "sky" },
              { value: 45, prefix: "+", l: "Universidades", tone: "sun" },
              { value: 4, l: "Etapas", tone: "accent" },
            ].map((s) => (
              <div key={s.l} className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-center flex-1">
                <div className={`text-2xl font-bold tabular-nums ${s.tone === "sky" ? "text-sky-dark" : s.tone === "sun" ? "text-[#C98F1B]" : "text-accent"}`}>
                  <AnimatedNumber value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="text-neutral-500 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <CTAButton pulse>Quiero mi asesoría personalizada →</CTAButton>
            <a
              href="/servicios/master"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/70 hover:text-primary px-2 py-2"
            >
              Conocer el Método 360° completo
            </a>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            30 minutos · {ASESORIA_PRINCIPAL.precio} ({ASESORIA_PRINCIPAL.precioAlt})
          </p>
        </div>
      </section>

      {/* El método */}
      <section className="py-16 px-6 bg-secondary-light">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>El Método 360°</Eyebrow>
            <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
              Trabajamos 4 etapas hasta tu máster
            </h2>
            <p className="text-neutral-500 mt-3">
              Un proceso claro y estructurado, con soporte experto en cada paso. No son sesiones
              aisladas.
            </p>
          </div>

          {/* Selector de etapas: clic para ver el detalle de cada una */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {ETAPAS.map((e, i) => (
              <button
                key={e.n}
                type="button"
                onClick={() => setEtapaActiva(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  etapaActiva === i
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-white text-primary/60 border border-neutral-200 hover:border-primary/40"
                }`}
              >
                <span>{e.n}</span>
                <span className="hidden sm:inline">{e.title}</span>
              </button>
            ))}
          </div>

          <article className="bg-white rounded-2xl border border-neutral-200 p-7 sm:p-9 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-start gap-4">
              <IconBadge nombre={ETAPAS[etapaActiva].icono} tone={["primary", "accent", "sky", "sun"][etapaActiva % 4]} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black text-accent">{ETAPAS[etapaActiva].n}</span>
                  <h3 className="font-bold text-xl text-primary">{ETAPAS[etapaActiva].title}</h3>
                </div>
                <ul className="space-y-2">
                  {ETAPAS[etapaActiva].bullets.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-neutral-600 text-sm">
                      <span className="flex-shrink-0 mt-0.5 font-bold text-accent">✓</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Lo que lograrás */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow>¿Por qué elegirnos?</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Esto es lo que obtienes con el Método 360°
          </h2>
        </div>

        <div className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-2 gap-5">
          {LOGROS.map((l, i) => (
            <Reveal key={l.texto} delay={i * 60}>
              <div className="flex items-start gap-3.5 bg-secondary-light/60 rounded-2xl p-5 hover:bg-secondary-light transition-colors">
                <IconBadge nombre={l.icono} tone={["primary", "accent", "sky", "sun"][i % 4]} />
                <span className="text-neutral-700 text-sm leading-relaxed pt-1.5">{l.texto}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <CTAButton>Quiero mi asesoría personalizada →</CTAButton>
        </div>
      </section>

      {/* Herramientas: portal, calendario, calculadora */}
      <section className="py-16 px-6 bg-secondary-light">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Eyebrow>Todo en un solo lugar</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            No trabajamos por WhatsApp: tenemos sistema propio
          </h2>
          <p className="text-neutral-500 mt-3">
            Un portal privado, un calendario en vivo y una calculadora gratuita, para que
            avances aunque todavía no hayas agendado tu asesoría.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5 items-stretch">
          {HERRAMIENTAS.map((h, i) => (
            <Reveal key={h.titulo} delay={i * 100} className="h-full">
              <HerramientaCard h={h} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Comparativa: por qué no por WhatsApp */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Eyebrow>La diferencia real</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Otras asesorías vs. Inspira Legal
          </h2>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-2 mb-2 px-1">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 text-center">✕ Otras asesorías</p>
          <p className="text-xs font-black uppercase tracking-widest text-accent text-center">✓ Inspira Legal</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {COMPARATIVA.map((row, i) => (
            <Reveal key={row.tema} delay={i * 80}>
              <div className="group relative grid sm:grid-cols-2 rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="bg-neutral-50 p-5 sm:pr-9">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{row.tema}</p>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-xs font-black">✕</span>
                    <p className="text-sm text-neutral-500 leading-snug">{row.otros}</p>
                  </div>
                </div>
                <div className="bg-accent/10 p-5 sm:pl-9 border-t sm:border-t-0 sm:border-l border-neutral-200">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black">✓</span>
                    <p className="text-sm text-primary font-semibold leading-snug">{row.inspira}</p>
                  </div>
                </div>
                <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-white items-center justify-center text-[10px] font-black shadow-lg z-10 group-hover:scale-110 transition-transform">
                  VS
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <CTAButton>Quiero mi asesoría personalizada →</CTAButton>
        </div>
      </section>

      {/* Cobertura nacional: franja animada de comunidades reales */}
      <section className="py-14 bg-primary overflow-hidden">
        <div className="text-center mb-7 px-6">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Cobertura nacional real · 17 comunidades · +80 universidades públicas y privadas
          </p>
        </div>
        <div className="flex w-max animate-[marqueeComunidades_32s_linear_infinite]">
          {[...COMUNIDADES, ...COMUNIDADES].map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="shrink-0 mx-2.5 px-5 py-2.5 rounded-full bg-white/10 border border-white/15 text-white text-sm font-semibold whitespace-nowrap"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Testimonios reales */}
      <section className="py-16 px-6 bg-sky-light">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Eyebrow>Casos reales</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Lo que dicen quienes ya pasaron por esto
          </h2>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {TESTIMONIOS.map((t, i) => (
            <Reveal key={t.nombre} delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex gap-0.5 mb-3 text-sun">
                  {Array.from({ length: t.estrellas }).map((_, j) => (
                    <Icono key={j} nombre="estrella" size={16} />
                  ))}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed mb-4">“{t.texto}”</p>
                <p className="text-xs font-bold text-primary">{t.nombre}</p>
                <p className="text-xs text-neutral-400">{t.servicio} · {t.fuente}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sobre Inspira Legal */}
      <section className="py-16 px-6 bg-primary overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow dark>Sobre Inspira Legal</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold text-white mt-2">
            Un equipo real, no una plantilla genérica.
          </h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto leading-relaxed">
            Combinamos derecho migratorio español con herramientas digitales para que cada
            trámite sea claro, medible y acompañado. Detrás de tu expediente hay personas de
            verdad, no un chatbot.
          </p>
        </div>

        <div className="max-w-md mx-auto mt-10 grid grid-cols-2 gap-5">
          {EQUIPO_FOTOS.map((p) => (
            <img
              key={p.alt}
              src={p.foto}
              alt={p.alt}
              className="w-full rounded-3xl shadow-2xl ring-4 ring-white/10 transition-transform duration-300 hover:scale-105 hover:-rotate-1"
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 grid sm:grid-cols-3 gap-5">
          {COMO_TRABAJAMOS.map((item) => (
            <div key={item.titulo} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-3 text-sun"><Icono nombre={item.icono} size={26} /></div>
              <h3 className="font-bold text-white">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz interactivo: personaliza el mensaje y empuja a reservar */}
      <section className="py-16 px-6 bg-secondary-light">
        <div className="max-w-xl mx-auto text-center mb-8">
          <Eyebrow>Antes de reservar</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Cuéntanos en 2 clics qué buscas
          </h2>
        </div>
        <Reveal><PlanQuiz /></Reveal>
      </section>

      {/* FAQ interactivo */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>Preguntas frecuentes</Eyebrow>
            <h2 className="font-fraunces text-3xl font-bold mt-2 text-primary">
              Antes de agendar
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem
                key={f.q}
                item={f}
                open={faqOpen === i}
                onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-secondary-light">
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow>Da el primer paso</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Reserva tu {ASESORIA_PRINCIPAL.nombre.toLowerCase()}
          </h2>
          <p className="text-neutral-500 mt-3">{ASESORIA_PRINCIPAL.descripcion}</p>

          <ul className="mt-8 space-y-2.5 text-left max-w-md mx-auto">
            {ASESORIA_PRINCIPAL.incluye.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-neutral-700 text-sm">
                <span className="flex-shrink-0 mt-0.5 font-bold text-accent">✓</span>
                {x}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <CTAButton pulse className="text-lg px-9 py-5">Agendar mi asesoría — {ASESORIA_PRINCIPAL.precio}</CTAButton>
          </div>
          <p className="text-xs text-neutral-400 mt-4">
            {ASESORIA_PRINCIPAL.duracion} · {ASESORIA_PRINCIPAL.precioAlt} · Reunión online desde
            cualquier parte del mundo.
          </p>

          <a
            href="/"
            className="inline-block mt-6 text-xs font-semibold text-primary/60 hover:text-primary underline underline-offset-4"
          >
            Prefiero conocer todos los servicios de Inspira Legal primero
          </a>
        </div>
      </section>

      {/* Footer mínimo (padding extra abajo: la barra fija de reserva es siempre visible) */}
      <footer className="py-8 pb-24 px-6 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Inspira Legal" className="h-5 w-auto opacity-70" />
            <span>· Asesoría educativa y extranjería · © 2026</span>
          </div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-neutral-600">Sitio completo</a>
            <a href="/legal/terminos" className="hover:text-neutral-600">Términos</a>
            <a href="/legal/privacidad" className="hover:text-neutral-600">Privacidad</a>
          </div>
        </div>
      </footer>

      {/* Barra fija de reserva: siempre disponible desde que carga la página */}
      {!barDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] animate-[fadeInUpBar_0.5s_ease-out]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 hidden sm:block">
              <p className="text-white text-sm font-semibold truncate flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Asesoría personalizada 1:1 · 30 min
              </p>
              <p className="text-white/60 text-xs">{ASESORIA_PRINCIPAL.precio} · {ASESORIA_PRINCIPAL.precioAlt} · Disponible ahora</p>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <CTAButton className="!px-5 !py-2.5 text-sm whitespace-nowrap">Reservar ahora</CTAButton>
              <button
                type="button"
                onClick={() => setBarDismissed(true)}
                aria-label="Cerrar"
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ventana emergente: recordatorio, precio (por scroll) o salida */}
      {modal && (() => {
        const m = MODALES[modal];
        const badgeTone = { accent: "bg-accent", sun: "bg-sun", primary: "bg-primary" }[m.tono] || "bg-accent";
        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setModal(null)}
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center animate-[modalPopIn_0.3s_ease-out_both]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                ✕
              </button>
              <div className={`mx-auto w-14 h-14 rounded-2xl ${badgeTone} text-white flex items-center justify-center mb-4`}>
                <Icono nombre={m.icono} size={28} />
              </div>
              <h3 className="font-fraunces text-xl font-bold text-primary mb-2">{m.titulo}</h3>
              <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{m.texto}</p>
              <CTAButton pulse fullWidth>{m.cta}</CTAButton>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
