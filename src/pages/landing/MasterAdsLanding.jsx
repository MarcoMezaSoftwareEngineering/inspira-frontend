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
    q: "¿Cuánto cuesta el Programa 360° completo?",
    a: "Depende de tu perfil y del alcance que necesites (universidades y comunidades). En la asesoría revisamos tu caso y te damos el costo exacto para tu situación, sin compromiso.",
  },
  {
    q: "¿Qué pasa después de la asesoría?",
    a: "Si decides avanzar, entras al Programa 360°: 4 etapas guiadas, desde la búsqueda y viabilidad hasta tu matrícula final, con seguimiento en nuestro panel digital.",
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

function HerramientaCard({ h }) {
  const [abierto, setAbierto] = useState(false);
  const esCalculadora = h.href === "/calculadora-master.html";

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all flex flex-col">
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
  const [barVisible, setBarVisible] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Barra fija: aparece al bajar más allá del hero.
  useEffect(() => {
    function onScroll() {
      setBarVisible(window.scrollY > 620);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ventana emergente: una sola vez por sesión, a los 18s.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("master_ads_popup_visto")) return;
    } catch { /* noop */ }
    const t = setTimeout(() => {
      setModalOpen(true);
      try { sessionStorage.setItem("master_ads_popup_visto", "1"); } catch { /* noop */ }
    }, 18000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full bg-white overflow-x-hidden font-sans">
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
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none bg-accent opacity-[0.08]"
          style={{ transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none bg-sky opacity-[0.12]"
          style={{ transform: "translate(-30%, 30%)" }}
        />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary/80 text-sm px-4 py-1.5 rounded-full mb-6">
            <Icono nombre="birrete" size={16} />
            Programa Máster 360° · España 2026/2027
          </span>
          <h1 className="font-fraunces text-4xl md:text-5xl font-bold leading-tight mb-5 text-primary">
            Ayudamos a profesionales latinoamericanos a estudiar un{" "}
            <span className="text-accent">máster en universidades públicas de España</span>,
            con acompañamiento 360°.
          </h1>
          <p className="text-neutral-500 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Te acompañamos desde la búsqueda del máster hasta la matrícula: asesoría educativa,
            admisión universitaria, postulación y seguimiento integral.
          </p>

          <div className="flex gap-4 mb-9 max-w-md mx-auto">
            {[
              { n: "98%", l: "Admisión", tone: "sky" },
              { n: "+45", l: "Universidades", tone: "sun" },
              { n: "4", l: "Etapas", tone: "accent" },
            ].map((s) => (
              <div key={s.l} className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-center flex-1">
                <div className={`text-2xl font-bold ${s.tone === "sky" ? "text-sky-dark" : s.tone === "sun" ? "text-[#C98F1B]" : "text-accent"}`}>
                  {s.n}
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
              Conocer el Programa 360° completo
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
            <Eyebrow>El Programa 360°</Eyebrow>
            <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
              Trabajamos 4 etapas hasta tu máster
            </h2>
            <p className="text-neutral-500 mt-3">
              Un proceso claro y estructurado, con soporte experto en cada paso. No son sesiones
              aisladas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ETAPAS.map((e, i) => (
              <article key={e.n} className="bg-white rounded-2xl border border-neutral-200 p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-4">
                  <IconBadge nombre={e.icono} tone={["primary", "accent", "sky", "sun"][i % 4]} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black text-accent">{e.n}</span>
                      <h3 className="font-bold text-lg text-primary">{e.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {e.bullets.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-neutral-600 text-sm">
                          <span className="flex-shrink-0 mt-0.5 font-bold text-accent">✓</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lo que lograrás */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow>¿Por qué elegirnos?</Eyebrow>
          <h2 className="font-fraunces text-3xl md:text-4xl font-bold mt-2 text-primary">
            Esto es lo que obtienes con el Programa 360°
          </h2>
        </div>

        <div className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-2 gap-5">
          {LOGROS.map((l, i) => (
            <div key={l.texto} className="flex items-start gap-3.5 bg-secondary-light/60 rounded-2xl p-5">
              <IconBadge nombre={l.icono} tone={["primary", "accent", "sky", "sun"][i % 4]} />
              <span className="text-neutral-700 text-sm leading-relaxed pt-1.5">{l.texto}</span>
            </div>
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
          {HERRAMIENTAS.map((h) => (
            <HerramientaCard key={h.titulo} h={h} />
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
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <div className="min-w-[560px] rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-[1fr,1.3fr,1.3fr] bg-primary text-white text-sm font-bold">
              <div className="px-4 py-3"> </div>
              <div className="px-4 py-3 border-l border-white/10">Otras asesorías</div>
              <div className="px-4 py-3 border-l border-white/10 bg-accent">Inspira Legal</div>
            </div>
            {COMPARATIVA.map((row, i) => (
              <div
                key={row.tema}
                className={`grid grid-cols-[1fr,1.3fr,1.3fr] text-sm ${i % 2 ? "bg-secondary-light/60" : "bg-white"}`}
              >
                <div className="px-4 py-3.5 font-semibold text-primary">{row.tema}</div>
                <div className="px-4 py-3.5 border-l border-neutral-100 text-neutral-500">{row.otros}</div>
                <div className="px-4 py-3.5 border-l border-neutral-100 text-neutral-700 font-medium bg-accent/5">
                  {row.inspira}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <CTAButton>Quiero mi asesoría personalizada →</CTAButton>
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
          {TESTIMONIOS.map((t) => (
            <div key={t.nombre} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3 text-sun">
                {Array.from({ length: t.estrellas }).map((_, i) => (
                  <Icono key={i} nombre="estrella" size={16} />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed mb-4">“{t.texto}”</p>
              <p className="text-xs font-bold text-primary">{t.nombre}</p>
              <p className="text-xs text-neutral-400">{t.servicio} · {t.fuente}</p>
            </div>
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
              className="w-full rounded-3xl shadow-2xl ring-4 ring-white/10"
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

      {/* Footer mínimo */}
      <footer className="py-8 px-6 border-t border-neutral-100">
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

      {/* Barra fija de reserva */}
      {barVisible && !barDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 hidden sm:block">
              <p className="text-white text-sm font-semibold truncate">Asesoría personalizada 1:1 · 30 min</p>
              <p className="text-white/60 text-xs">{ASESORIA_PRINCIPAL.precio} · {ASESORIA_PRINCIPAL.precioAlt}</p>
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

      {/* Ventana emergente */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              ✕
            </button>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center mb-4">
              <Icono nombre="birrete" size={28} />
            </div>
            <h3 className="font-fraunces text-xl font-bold text-primary mb-2">
              ¿Todavía tienes dudas sobre tu máster?
            </h3>
            <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
              Resuélvelas en una asesoría personalizada de 30 minutos con un especialista. Sales
              con un plan de acción concreto para tu caso.
            </p>
            <CTAButton fullWidth>Reservar mi asesoría — {ASESORIA_PRINCIPAL.precio}</CTAButton>
          </div>
        </div>
      )}
    </div>
  );
}
