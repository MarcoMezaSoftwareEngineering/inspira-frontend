import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function CtaFinal() {
  return (
    <section className="cta" id="cta">
      <div className="v4-container">
        <Reveal className="cta-box">
          <div>
            <span className="eyebrow"><span className="dot" />Empieza gratis</span>
            <h2>Descubre qué opciones encajan contigo.</h2>
            <p>
              Usa la calculadora como primera puerta de entrada y convierte tus datos
              en una ruta de estudio más concreta.
            </p>
          </div>
          <a
            className="btn btn-primary"
            href="/calculadora-master"
            onClick={(e) => go(e, "/calculadora-master")}
            style={{ zIndex: 2 }}
          >
            Abrir calculadora <span className="arr">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
