import { useState } from "react";

const steps = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Reserva tu asesoría inicial",
    stageTitle: "Tu perfil se convierte en una estrategia.",
    stageText:
      "Reservas tu asesoría inicial y en la sesión revisamos formación, promedio, experiencia y objetivos para orientar la búsqueda desde el primer día.",
    checklist: [
      ["Perfil académico", "Completo"],
      ["Experiencia profesional", "Revisada"],
      ["Objetivos", "Definidos"],
    ],
  },
  {
    n: "02",
    title: "Formulario previo",
    desc: "Completa tu perfil académico",
    stageTitle: "Tu información, organizada en un solo lugar.",
    stageText:
      "Completas tu perfil académico y laboral en un formulario guiado que alimenta directamente tu búsqueda personalizada.",
    checklist: [
      ["Datos académicos", "Registrados"],
      ["Datos laborales", "Registrados"],
      ["Preferencias", "Guardadas"],
    ],
  },
  {
    n: "03",
    title: "Pago y confirmación",
    desc: "Proceso seguro y automático",
    stageTitle: "Un proceso de pago simple y seguro.",
    stageText:
      "Confirmas tu paquete con un proceso de pago automático y recibes la confirmación por email y WhatsApp al instante.",
    checklist: [
      ["Pago", "Confirmado"],
      ["Email", "Enviado"],
      ["WhatsApp", "Notificado"],
    ],
  },
  {
    n: "04",
    title: "Reunión con asesor",
    desc: "Analizamos tu caso",
    stageTitle: "Tu caso, revisado por un especialista.",
    stageText:
      "En una sesión personalizada analizamos tu perfil a fondo y definimos la estrategia de postulación más conveniente para ti.",
    checklist: [
      ["Diagnóstico", "Analizado"],
      ["Estrategia", "Definida"],
      ["Siguientes pasos", "Acordados"],
    ],
  },
  {
    n: "05",
    title: "Contrata tu paquete",
    desc: "Activa tu panel de seguimiento",
    stageTitle: "Eliges el paquete y activas tu panel.",
    stageText:
      "Seleccionas el paquete ideal según tu estrategia y activamos tu panel de seguimiento con checklist personalizado.",
    checklist: [
      ["Paquete", "Contratado"],
      ["Panel", "Activado"],
      ["Checklist", "Generado"],
    ],
  },
  {
    n: "06",
    title: "Documentos y checklist",
    desc: "Plazos y alertas automáticas",
    stageTitle: "Cada plazo y documento, bajo control.",
    stageText:
      "Accedes a tu panel con los documentos requeridos, plazos por universidad y alertas automáticas para no perder ninguna fecha.",
    checklist: [
      ["Documentos", "Listados"],
      ["Plazos", "Configurados"],
      ["Alertas", "Activas"],
    ],
  },
  {
    n: "07",
    title: "Postulación y seguimiento",
    desc: "Gestionamos cada subsanación",
    stageTitle: "Nosotros postulamos, tú avanzas.",
    stageText:
      "Tu asesor gestiona cada postulación y te acompaña en subsanaciones, mientras haces seguimiento en tiempo real desde tu panel.",
    checklist: [
      ["UAM", "Lista para enviar"],
      ["UPF", "En revisión"],
      ["UV", "Documentos completos"],
    ],
  },
  {
    n: "08",
    title: "Matrícula o visa",
    desc: "¡Objetivo cumplido!",
    stageTitle: "Objetivo cumplido: matrícula o visa.",
    stageText:
      "Cerramos el proceso con tu matrícula confirmada o tu visa aprobada, acompañándote hasta el último trámite.",
    checklist: [
      ["Carta de admisión", "Recibida"],
      ["Matrícula", "Confirmada"],
      ["Visa", "En trámite"],
    ],
  },
];

export default function ComoFunciona() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <section className="py-24 px-6" style={{ background: "#F4F8FC" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-8 mb-11 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#F49E4B" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
              Proceso
            </span>
            <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 tracking-tight">
              Un camino claro hacia España.
            </h2>
          </div>
          <p className="text-neutral-500 max-w-md leading-relaxed">
            8 pasos claros para llegar desde el primer contacto hasta tu máster en España,
            con seguimiento en cada etapa.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-10 items-start">
          {/* Step list */}
          <div className="lg:sticky lg:top-24 grid gap-1">
            {steps.map((s, i) => (
              <button
                key={s.n}
                onClick={() => setActive(i)}
                className={`grid grid-cols-[42px_1fr] gap-3 text-left p-3 rounded-2xl transition-all ${
                  active === i ? "bg-white shadow-[0_10px_24px_rgba(18,52,61,.07)]" : "hover:bg-white/60"
                }`}
              >
                <div
                  className={`w-[34px] h-[34px] rounded-xl grid place-items-center text-[11px] font-black ${
                    active === i ? "bg-primary text-white" : "bg-[#e9f0f2] text-[#789097]"
                  }`}
                >
                  {s.n}
                </div>
                <div>
                  <b className="text-sm block">{s.title}</b>
                  <small className="text-neutral-500 text-xs">{s.desc}</small>
                </div>
              </button>
            ))}
          </div>

          {/* Stage panel */}
          <div
            className="rounded-[30px] p-8 text-white relative overflow-hidden min-h-[420px]"
            style={{ background: "linear-gradient(145deg,#073948,#075667)" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "auto -12% -20% 35%",
                height: "70%",
                background: "radial-gradient(circle, rgba(244,158,75,.16), transparent 65%)",
              }}
            />
            <div className="relative z-10">
              <div className="text-[11px] uppercase tracking-widest text-white/50 font-extrabold">
                Paso {step.n} · {step.title}
              </div>
              <h3 className="font-fraunces text-3xl md:text-[38px] font-bold mt-3 mb-2.5 tracking-tight leading-tight">
                {step.stageTitle}
              </h3>
              <p className="max-w-lg text-white/65 leading-relaxed">{step.stageText}</p>

              <div className="mt-7 bg-white text-primary rounded-2xl p-1 shadow-[0_22px_50px_rgba(0,0,0,.2)]">
                {step.checklist.map(([label, status], i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3.5 text-sm ${
                      i < step.checklist.length - 1 ? "border-b border-neutral-200" : ""
                    }`}
                  >
                    <span className="w-[22px] h-[22px] rounded-full grid place-items-center bg-secondary text-primary font-black text-[11px] flex-shrink-0">
                      ✓
                    </span>
                    <div className="flex-1 font-semibold">{label}</div>
                    <span className="text-neutral-500 text-xs">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
