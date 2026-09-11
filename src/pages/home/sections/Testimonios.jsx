// src/pages/home/sections/Testimonios.jsx
// Las 7 opiniones reales de la portada, con el mismo carrusel que
// /servicios/master y la landing (fuente única: config/testimonios.js).
import Reveal from "../../../components/common/Reveal";
import { navigate } from "../../../services/navigate";
import Opiniones from "../../landing/master2027/Opiniones";

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
            Reseñas publicadas por nuestros propios clientes en Google y
            Facebook. Cada proceso es distinto, pero el objetivo es el mismo.
          </p>
        </Reveal>

        <Opiniones ubicacion="portada" className="mt-8" />

        <div className="mt-8 text-center">
          <a
            href="/casos-de-exito"
            onClick={(e) => go(e, "/casos-de-exito")}
            className="btn btn-primary"
          >
            Ver casos de éxito <span className="arr">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
