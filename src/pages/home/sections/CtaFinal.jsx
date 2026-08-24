import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";
import BotonAsesoria from "../../../components/common/BotonAsesoria";
import { PRECIO_ASESORIA } from "../../../config/servicios";
import { ASESORIA } from "../../../config/contacto";

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
            <span className="eyebrow"><span className="dot" />Primera asesoría</span>
            <h2>Tu mejor decisión empieza aquí.</h2>
            <p>
              {ASESORIA.duracion} con un abogado especialista en extranjería.
              {" "}{ASESORIA.modalidad}. Sales con un diagnóstico de tu caso y un
              plan de acción concreto — por {PRECIO_ASESORIA.eur},{" "}
              {PRECIO_ASESORIA.usd} o {PRECIO_ASESORIA.pen}.
            </p>
            <p style={{ marginTop: "14px", fontSize: "13px" }}>
              ¿Prefieres empezar gratis?{" "}
              <a
                href="/calculadora-master"
                onClick={(e) => go(e, "/calculadora-master")}
                style={{ color: "#f49e4b", fontWeight: 800 }}
              >
                Usa la calculadora de máster →
              </a>
            </p>
          </div>
          <div style={{ zIndex: 2 }}>
            <BotonAsesoria>Elegir día y hora</BotonAsesoria>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
