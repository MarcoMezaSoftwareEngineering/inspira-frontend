import Reveal from "../../../components/common/Reveal";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Gancho de enganche: el dato que más sorprende a los latinoamericanos.
export default function SabiasQue() {
  return (
    <section className="sabias">
      <div className="v4-container">
        <Reveal className="sabias-box">
          <span className="sabias-badge">¿Sabías que...?</span>
          <h2>
            Para los latinoamericanos, <span>2 años</span> de residencia legal
            dan derecho a la nacionalidad española.
          </h2>
          <p>
            La regla general exige 10 años. Los nacionales de países
            iberoamericanos solo necesitan 2. Cada trámite que haces bien desde
            el inicio —y en el orden correcto— te acerca a un pasaporte europeo.
          </p>
          <div className="sabias-links">
            <a
              href="/servicios/nacionalidad"
              onClick={(e) => go(e, "/servicios/nacionalidad")}
            >
              Ver cómo funciona <span className="arr">→</span>
            </a>
            <a
              href="/blog/nacionalidad-espanola-latinoamericanos-2-anos"
              onClick={(e) => go(e, "/blog/nacionalidad-espanola-latinoamericanos-2-anos")}
            >
              Leer la guía completa <span className="arr">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
