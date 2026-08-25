import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import BotonAsesoria from "../../../components/common/BotonAsesoria";
import {
  CALENDARIO_MASTER,
  etapaActual,
  proximaEtapa,
} from "../../../config/calendario";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Línea de tiempo del proceso de máster. Resalta sola la etapa en la que
// estamos hoy, para que el visitante sepa si va a tiempo o ya va tarde.
export default function Calendario() {
  const actual = etapaActual();
  const proxima = proximaEtapa();
  const { titulo, subtitulo, etapas } = CALENDARIO_MASTER;

  const aviso = actual
    ? etapas.find((e) => e.id === actual)
    : proxima
    ? { ...proxima, futura: true }
    : null;

  return (
    <section className="calendario">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Calendario</span>
            <h2>{titulo}</h2>
          </div>
          <p>{subtitulo}</p>
        </Reveal>

        {/* Dónde estamos hoy */}
        {aviso && (
          <Reveal className={`cal-hoy${aviso.urgente ? " urgente" : ""}`}>
            <span className="cal-hoy-icon">
              <Icono nombre={aviso.futura ? "calendario" : aviso.icono} size={22} />
            </span>
            <div>
              <span className="cal-hoy-label">
                {aviso.futura ? "Lo próximo que se abre" : "Estamos aquí"}
              </span>
              <b>{aviso.etiqueta}</b>
              <p>{aviso.consejo}</p>
            </div>
          </Reveal>
        )}

        <div className="cal-linea">
          {etapas.map((e, i) => {
            const esActual = e.id === actual;
            return (
              <Reveal
                className={`cal-etapa${esActual ? " activa" : ""}${
                  e.urgente ? " urgente" : ""
                }${e.paralelo ? " paralelo" : ""}`}
                key={e.id}
                delay={i * 90}
              >
                <div className="cal-cabeza">
                  <span className="cal-icon">
                    <Icono nombre={e.icono} size={19} />
                  </span>
                  {esActual && <span className="cal-badge">Ahora</span>}
                  {e.paralelo && !esActual && (
                    <span className="cal-badge paralelo">En paralelo</span>
                  )}
                </div>
                <span className="cal-periodo">{e.periodo}</span>
                <h3>{e.etiqueta}</h3>
                <p>{e.texto}</p>
                <span className="cal-consejo">
                  <Icono nombre="destello" size={13} />
                  {e.consejo}
                </span>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="cal-pie" delay={280}>
          <p>
            <b>¿Vas a tiempo?</b> En la asesoría revisamos tu calendario real y
            te decimos qué deberías estar haciendo este mes.
          </p>
          <div className="cal-pie-acciones">
            <BotonAsesoria>Revisar mi calendario</BotonAsesoria>
            <a
              href="/eventos"
              onClick={(e) => go(e, "/eventos")}
              className="cal-pie-link"
            >
              Ver la charla gratuita <span className="arr">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
