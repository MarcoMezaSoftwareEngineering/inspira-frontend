const steps = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Reserva tu asesoría inicial y conoce las opciones ideales para tu perfil académico.",
  },
  {
    n: "02",
    title: "Formulario previo",
    desc: "Completa tu perfil académico y laboral para personalizar la búsqueda.",
  },
  {
    n: "03",
    title: "Pago y confirmación",
    desc: "Proceso seguro y automático. Recibes confirmación por email y WhatsApp.",
  },
  {
    n: "04",
    title: "Reunión con asesor",
    desc: "Sesión personalizada donde analizamos tu caso y definimos la estrategia.",
  },
  {
    n: "05",
    title: "Contrata tu paquete",
    desc: "Elige el paquete ideal y activa tu panel de seguimiento con checklist.",
  },
  {
    n: "06",
    title: "Documentos y checklist",
    desc: "Accede a tu panel con plazos, documentos requeridos y alertas automáticas.",
  },
  {
    n: "07",
    title: "Postulación y seguimiento",
    desc: "Tu asesor gestiona las postulaciones y te acompaña en cada subsanación.",
  },
  {
    n: "08",
    title: "Matrícula o visa",
    desc: "Finaliza con matrícula confirmada o visa aprobada. ¡Objetivo cumplido!",
  },
];

export default function ComoFunciona() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "#F49E4B" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
            Proceso
          </span>
          <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 tracking-tight">
            ¿Cómo funciona Inspira?
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            8 pasos claros para llegar desde el primer contacto hasta tu máster en España.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <div
              key={step.n}
              className="relative p-6 rounded-3xl border border-neutral-200 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default bg-white"
            >
              <div
                className="font-fraunces text-6xl font-bold leading-none mb-3 select-none tracking-tight"
                style={{ color: "#E8F4FF" }}
              >
                {step.n}
              </div>
              <h3 className="text-primary font-semibold text-base mb-2 group-hover:text-accent transition-colors">
                {step.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
