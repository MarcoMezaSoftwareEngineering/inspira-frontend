import Reveal from "../../../components/common/Reveal";
import BotonAsesoria from "../../../components/common/BotonAsesoria";

const preguntas = [
  {
    q: "¿Qué pasa exactamente en la primera asesoría?",
    a: "Son 30 minutos por videollamada con un abogado especialista. Revisamos tu perfil, objetivos y documentos; analizamos requisitos, plazos y medios económicos; definimos si tu mejor vía es visado o estancia por estudios; y te entregamos un plan de acción con los próximos pasos.",
  },
  {
    q: "¿Por qué la primera asesoría se paga?",
    a: "Porque no es una llamada de ventas: es un diagnóstico jurídico real con un abogado. Sales de ella con una estrategia clara, aunque decidas no contratar ningún paquete después.",
  },
  {
    q: "¿Cuánto cuestan los paquetes completos?",
    a: "Depende de tu caso: no vendemos paquetes genéricos. Tras la asesoría te enviamos una propuesta con exactamente los servicios que necesitas y su costo, sin sorpresas ni cobros ocultos.",
  },
  {
    q: "¿Puedo trabajar mientras estudio en España?",
    a: "Sí. El permiso de estudios habilita a trabajar hasta 30 horas semanales, compatibilizando tu formación con una actividad laboral.",
  },
  {
    q: "¿Me garantizan que me den el visado o la admisión?",
    a: "No, y desconfía de quien lo prometa: la resolución depende siempre del consulado, de Extranjería o de la universidad. Lo que sí garantizamos es un expediente completo, bien fundamentado y presentado en plazo — y solo asumimos casos que consideramos viables.",
  },
  {
    q: "¿Atienden desde toda Latinoamérica?",
    a: "Sí. Las asesorías son reuniones online desde cualquier parte del mundo, y los trámites en España se presentan de forma telemática con firma digital del abogado.",
  },
];

export default function Faq() {
  return (
    <section className="faq">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Preguntas frecuentes</span>
            <h2>Lo que todos nos preguntan antes de empezar.</h2>
          </div>
          <p>
            Si tu duda no está aquí, la resolvemos en la primera asesoría — y sales
            con una respuesta concreta para tu caso.
          </p>
        </Reveal>

        <div className="faq-list">
          {preguntas.map((p, i) => (
            <Reveal key={p.q} delay={i * 60}>
              <details className="faq-item">
                <summary>
                  {p.q}
                  <span className="faq-plus" aria-hidden>+</span>
                </summary>
                <p>{p.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal className="faq-cta" delay={200}>
          <p>¿Tu caso es distinto? Casi siempre lo es.</p>
          <BotonAsesoria />
        </Reveal>
      </div>
    </section>
  );
}
