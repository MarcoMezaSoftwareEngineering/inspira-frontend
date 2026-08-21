import { useState } from "react";
import Reveal from "../../../components/common/Reveal";

/* 8 pasos reales de Inspira (el mockup mostraba 6 genéricos). */
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
    <section className="process" id="proceso">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Proceso</span>
            <h2>Un camino claro hacia España.</h2>
          </div>
          <p>
            En vez de ocho tarjetas iguales, la experiencia avanza como tu caso real:
            diagnóstico, formulario, pago, asesoría, documentación, postulación,
            seguimiento y matrícula o visa.
          </p>
        </Reveal>

        <div className="process-layout">
          <div className="steps">
            {steps.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className={`step${active === i ? " active" : ""}`}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
              >
                <div className="step-num">{s.n}</div>
                <div>
                  <b>{s.title}</b>
                  <small>{s.desc}</small>
                </div>
              </button>
            ))}
          </div>

          <Reveal className="stage">
            <div className="stage-label">
              Paso {step.n} · {step.title}
            </div>
            <h3>{step.stageTitle}</h3>
            <p>{step.stageText}</p>
            <div className="stage-ui">
              {step.checklist.map(([label, status], i) => (
                <div className="todo" key={label}>
                  <span className="check">{i === 2 && active < 7 ? "●" : "✓"}</span>
                  <div className="todo-label">{label}</div>
                  <span className="todo-status">{status}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
