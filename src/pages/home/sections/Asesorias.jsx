import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { OPCIONES_ASESORIA, promoVigente } from "../../../config/asesorias";

export default function Asesorias() {
  const promo = promoVigente();
  const opciones = OPCIONES_ASESORIA.filter((o) => !o.promo || promo);
  const principales = opciones.filter((o) => !o.secundaria);
  const secundaria = opciones.find((o) => o.secundaria);

  return (
    <section className="asesorias">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Empieza aquí</span>
            <h2>Tu caso, cara a cara con un abogado.</h2>
          </div>
          <p>
            La asesoría 1:1 de 30 minutos es el punto de partida de todos
            nuestros procesos. Después armamos tu paquete a medida.
          </p>
        </Reveal>

        <div className="asesoria-grid dos">
          {principales.map((o, i) => (
            <Reveal
              className={`asesoria-card${o.destacada ? " destacada" : ""}`}
              key={o.id}
              delay={i * 100}
            >
              {o.destacada && <span className="asesoria-tag">Recomendada</span>}
              <div className="asesoria-icon">
                <Icono nombre={o.icono} size={24} />
              </div>
              <span className="asesoria-dur">
                <Icono nombre="reloj" size={13} /> {o.duracion}
              </span>
              <h3>{o.nombre}</h3>
              <div className="asesoria-precio">
                {o.precio}
                {o.precioAlt && <small>{o.precioAlt}</small>}
              </div>
              <p>{o.descripcion}</p>
              <ul>
                {o.incluye.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${o.destacada ? "btn-primary" : "btn-outline"}`}
              >
                <Icono nombre="calendario" size={17} />
                Reservar <span className="arr">→</span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* La gratuita, en segundo plano y como paso previo opcional */}
        {secundaria && (
          <Reveal className="asesoria-previa" delay={220}>
            <div className="asesoria-previa-txt">
              <span className="asesoria-previa-tag">
                <Icono nombre="chat" size={14} />
                Solo hasta el 22 de septiembre
              </span>
              <p>
                <b>¿Prefieres un primer contacto antes?</b> Tenemos una
                orientación gratuita de {secundaria.duracion} para indicarte qué
                vía explorar. No sustituye al diagnóstico jurídico de la
                asesoría de 30 minutos.
              </p>
            </div>
            <a
              href={secundaria.url}
              target="_blank"
              rel="noopener noreferrer"
              className="asesoria-previa-link"
            >
              Orientación gratuita <span className="arr">→</span>
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
