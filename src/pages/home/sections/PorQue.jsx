import Reveal from "../../../components/common/Reveal";
import { DIFERENCIALES } from "../../../config/servicios";
import BotonAsesoria from "../../../components/common/BotonAsesoria";

export default function PorQue() {
  return (
    <section className="porque">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Por qué Inspira</span>
            <h2>Abogados especialistas, no gestores.</h2>
          </div>
          <p>
            Tu expediente lo lleva un abogado colegiado en extranjería, con
            presentación telemática y firma digital. Y solo asumimos los casos
            que consideramos viables.
          </p>
        </Reveal>

        <div className="porque-grid">
          {DIFERENCIALES.map((v, i) => (
            <Reveal className="porque-card" key={v.titulo} delay={i * 80}>
              <span className="porque-icon" aria-hidden>{v.icono}</span>
              <h3>{v.titulo}</h3>
              <p>{v.texto}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="becas-banner" delay={200}>
          <div>
            <span className="eyebrow"><span className="dot" />Becas logradas</span>
            <h3>
              Nuestros asesorados han obtenido becas de Generación Bicentenario,
              Universidad de Jaén y Fundación Carolina.
            </h3>
            <p>
              Trabajamos las convocatorias desde antes de la postulación al máster,
              porque las mejores cierran meses antes del inicio de clases.
            </p>
          </div>
          <BotonAsesoria variante="contorno">Hablemos de tu beca</BotonAsesoria>
        </Reveal>
      </div>
    </section>
  );
}
