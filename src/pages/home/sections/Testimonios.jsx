import Reveal from "../../../components/common/Reveal";
import { TESTIMONIOS } from "../../../config/testimonios";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function Testimonios() {
  return (
    <section className="testimonials">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Opiniones reales</span>
            <h2>Lo que dicen quienes ya lo lograron.</h2>
          </div>
          <p>
            Reseñas publicadas por nuestros propios clientes en Facebook y
            Google. Cada proceso es distinto, pero el objetivo es el mismo.
          </p>
        </Reveal>

        <div className="testimonial-grid dos">
          {TESTIMONIOS.map((t, i) => (
            <Reveal className="testimonial-card" key={t.nombre} delay={i * 120}>
              <div className="t-head">
                <div className="stars" aria-label={`${t.estrellas} de 5 estrellas`}>
                  {"★".repeat(t.estrellas)}
                </div>
                <span className="fuente">{t.fuente}</span>
              </div>
              <p className="quote">“{t.texto}”</p>
              <div className="who">
                <div className="avatar">{t.nombre[0]}</div>
                <div>
                  <b>{t.nombre}</b>
                  <span>
                    {t.servicio} · {t.fecha}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal className="testimonial-card cta-card" delay={240}>
            <h3>Tu caso puede ser el siguiente.</h3>
            <p>
              Mira los expedientes que hemos resuelto: admisiones, visas,
              apelaciones ganadas y estancias aprobadas.
            </p>
            <a
              href="/casos-de-exito"
              onClick={(e) => go(e, "/casos-de-exito")}
              className="btn btn-primary"
            >
              Ver casos de éxito <span className="arr">→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
