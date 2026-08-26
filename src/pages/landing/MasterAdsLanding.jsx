// src/pages/landing/MasterAdsLanding.jsx
//
// Landing standalone para campañas de ads (Meta/IG). Sin Header ni Footer
// del sitio: una sola página, un solo objetivo — agendar la asesoría
// personalizada de 30 minutos. Todo el contenido (etapas, beneficios,
// precios) sale de lo que ya existe en /servicios/master y /nosotros; nada
// inventado.
import { CALENDLY_URL } from "../../config/contacto";
import { ASESORIA_PRINCIPAL } from "../../config/asesorias";

const ETAPAS = [
  {
    n: "01",
    title: "Búsqueda y viabilidad",
    bullets: [
      "Entrevista inicial y análisis de perfil",
      "Informe de viabilidad académica",
      "Lista de centros oficiales para visado",
    ],
  },
  {
    n: "02",
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
    title: "Matrícula y admisión final",
    bullets: [
      "Revisión de carta de admisión oficial",
      "Gestión documentaria final",
      "Asesoría en pagos de matrícula y plazos",
    ],
  },
];

const LOGROS = [
  "Acompañamiento por especialistas en extranjería y educación española en cada paso.",
  "Reuniones 1 a 1 para avances, dudas y subsanaciones en tiempo real.",
  "Trámites que cumplen la normativa española vigente, sin riesgos.",
  "Gestión integral: de documentos y CV a admisión, postulación y matrícula final.",
  "Acceso a becas como Generación Bicentenario y Fundación Carolina.",
  "Búsqueda personalizada entre +80 universidades públicas españolas.",
];

const COMO_TRABAJAMOS = [
  {
    titulo: "Diagnóstico honesto",
    texto:
      "En la primera asesoría te decimos qué vía te conviene de verdad — incluso si eso significa esperar o elegir un proceso distinto al que tenías en mente.",
  },
  {
    titulo: "Paquete a tu medida",
    texto:
      "No vendemos paquetes genéricos: después de conocer tu caso armamos exactamente los servicios que necesitas, ni uno más.",
  },
  {
    titulo: "Seguimiento medible",
    texto:
      "Cada expediente vive en nuestro panel digital: sabes en qué paso está tu trámite, qué falta y qué sigue, sin perseguir a nadie.",
  },
];

function CTAButton({ children, className = "" }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center justify-center gap-2 font-semibold px-7 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95 ${className}`}
      style={{ background: "#FA943A", color: "#fff" }}
    >
      {children}
    </a>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#FA943A" }}>
      {children}
    </span>
  );
}

export default function MasterAdsLanding() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Marca mínima, sin menú */}
      <div className="px-6 pt-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="font-fraunces font-bold text-lg" style={{ color: "#013446" }}>
            Inspira Legal
          </span>
          <span className="text-xs text-neutral-400">· Asesoría educativa y extranjería</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 rounded-full pointer-events-none"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, #FA943A 0%, transparent 70%)",
            opacity: 0.08,
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <span
            className="inline-block bg-[#013446]/5 border border-[#013446]/10 text-[#013446]/80 text-sm px-4 py-1.5 rounded-full mb-6"
          >
            Programa Máster 360° · España 2026/2027
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: "#013446" }}>
            Ayudamos a profesionales latinoamericanos a estudiar un{" "}
            <span style={{ color: "#FA943A" }}>máster en universidades públicas de España</span>,
            con acompañamiento 360°.
          </h1>
          <p className="text-neutral-500 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Te acompañamos desde la búsqueda del máster hasta la matrícula: asesoría educativa,
            admisión universitaria, postulación y seguimiento integral.
          </p>

          <div className="flex gap-4 mb-9 max-w-md mx-auto">
            {[
              { n: "98%", l: "Admisión" },
              { n: "+45", l: "Universidades" },
              { n: "4", l: "Etapas" },
            ].map((s) => (
              <div key={s.l} className="bg-[#013446]/5 border border-[#013446]/10 rounded-xl px-4 py-3 text-center flex-1">
                <div className="text-2xl font-bold" style={{ color: "#FA943A" }}>{s.n}</div>
                <div className="text-neutral-500 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          <CTAButton>Quiero mi asesoría personalizada →</CTAButton>
          <p className="text-xs text-neutral-400 mt-3">
            30 minutos · {ASESORIA_PRINCIPAL.precio} ({ASESORIA_PRINCIPAL.precioAlt})
          </p>
        </div>
      </section>

      {/* El método */}
      <section className="py-16 px-6" style={{ background: "#F4F8FC" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>El Programa 360°</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: "#013446" }}>
              Trabajamos 4 etapas hasta tu máster
            </h2>
            <p className="text-neutral-500 mt-3">
              Un proceso claro y estructurado, con soporte experto en cada paso. No son sesiones
              aisladas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ETAPAS.map((e) => (
              <article key={e.n} className="bg-white rounded-2xl border border-neutral-200 p-7 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                    style={{ background: "linear-gradient(135deg, #013446, #02506B)" }}
                  >
                    {e.n}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-3" style={{ color: "#013446" }}>{e.title}</h3>
                    <ul className="space-y-1.5">
                      {e.bullets.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-neutral-600 text-sm">
                          <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: "#FA943A" }}>✓</span>
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
          <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: "#013446" }}>
            Esto es lo que obtienes con el Programa 360°
          </h2>
        </div>

        <ul className="max-w-2xl mx-auto mt-10 space-y-4">
          {LOGROS.map((l) => (
            <li key={l} className="flex items-start gap-3 text-neutral-700">
              <span
                className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "#013446" }}
              >
                ✓
              </span>
              <span>{l}</span>
            </li>
          ))}
        </ul>

        <div className="text-center mt-10">
          <CTAButton>Quiero mi asesoría personalizada →</CTAButton>
        </div>
      </section>

      {/* Sobre Inspira Legal */}
      <section className="py-16 px-6" style={{ background: "#013446" }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Sobre Inspira Legal</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Un equipo de abogados asociados, no una plantilla genérica.
          </h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto leading-relaxed">
            Combinamos derecho migratorio español con herramientas digitales para que cada
            trámite sea claro, medible y acompañado.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-12 grid sm:grid-cols-3 gap-5">
          {COMO_TRABAJAMOS.map((item) => (
            <div key={item.titulo} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow>Da el primer paso</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: "#013446" }}>
            Reserva tu {ASESORIA_PRINCIPAL.nombre.toLowerCase()}
          </h2>
          <p className="text-neutral-500 mt-3">{ASESORIA_PRINCIPAL.descripcion}</p>

          <ul className="mt-8 space-y-2.5 text-left max-w-md mx-auto">
            {ASESORIA_PRINCIPAL.incluye.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-neutral-700 text-sm">
                <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: "#FA943A" }}>✓</span>
                {x}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <CTAButton className="text-lg px-9 py-5">Agendar mi asesoría — {ASESORIA_PRINCIPAL.precio}</CTAButton>
          </div>
          <p className="text-xs text-neutral-400 mt-4">
            {ASESORIA_PRINCIPAL.duracion} · {ASESORIA_PRINCIPAL.precioAlt} · Reunión online desde
            cualquier parte del mundo.
          </p>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="py-8 px-6 border-t border-neutral-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <span>Inspira Legal · Asesoría educativa y extranjería · © 2026</span>
          <div className="flex gap-4">
            <a href="/legal/terminos" className="hover:text-neutral-600">Términos</a>
            <a href="/legal/privacidad" className="hover:text-neutral-600">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
