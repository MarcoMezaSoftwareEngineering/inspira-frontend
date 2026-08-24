import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

const checklist = [
  "Búsqueda personalizada",
  "Universidades y becas",
  "Postulaciones",
  "Seguimiento",
  "Panel de avance",
  "Matrícula",
];

export default function Servicios() {
  return (
    <section className="services">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Servicios</span>
            <h2>Lo importante no es darte información. Es mover tu caso.</h2>
          </div>
          <p>
            Migrar a España por estudios es nuestro destino principal — y lo rodeamos
            de todo lo demás: extranjería, nacionalidad, homologaciones y gestiones
            en España.
          </p>
        </Reveal>

        <div className="cards">
          <Reveal
            as="a"
            className="service-card main"
            href="/servicios/master"
            onClick={(e) => go(e, "/servicios/master")}
          >
            <span className="tag">Más elegido</span>
            <h3>Programa Máster 360°</h3>
            <p>
              Desde la búsqueda personalizada hasta la matrícula: construimos tu
              shortlist, gestionamos postulaciones, revisamos requisitos y seguimos
              cada hito.
            </p>
            <div className="checklist">
              {checklist.map((c) => (
                <div className="checkline" key={c}>{c}</div>
              ))}
            </div>
            <span className="btn btn-primary">
              Explorar programa <span className="arr">→</span>
            </span>
            <div className="mini-dashboard">
              <small>Avance del proceso</small>
              <br />
              <strong>72%</strong>
              <div className="bar">
                <i style={{ width: "72%", background: "#f49e4b" }} />
              </div>
              <small>Próximo: documentación final</small>
            </div>
          </Reveal>

          <Reveal
            as="a"
            className="service-card"
            href="/servicios/estancia"
            onClick={(e) => go(e, "/servicios/estancia")}
            delay={120}
          >
            <span className="tag" style={{ background: "#e9f6ef", color: "#1d6a4a" }}>
              Especializado
            </span>
            <h3>Visa y estancia por estudios</h3>
            <p>
              Mismo permiso, distinto proceso: desde tu consulado o ya en España.
              Gestión documental completa con seguimiento de cada requisito.
            </p>
            <div style={{ height: "34px" }} />
            <span style={{ fontWeight: 850, color: "#063f50", fontSize: "13px" }}>
              Ver servicio <span className="arr">→</span>
            </span>
          </Reveal>
        </div>

        <Reveal className="services-more" delay={160}>
          <p>
            También: residencia nómada digital, visado PAC, nacionalidad española,
            arraigos, homologaciones, TIE, empadronamiento y más.
          </p>
          <a
            className="btn btn-primary"
            href="/servicios"
            onClick={(e) => go(e, "/servicios")}
          >
            Ver todos los servicios <span className="arr">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
