import Reveal from "../../../components/common/Reveal";
import { OPCIONES_ASESORIA, promoVigente } from "../../../config/asesorias";

export default function Asesorias() {
  const promo = promoVigente();
  const opciones = OPCIONES_ASESORIA.filter((o) => !o.promo || promo);

  return (
    <section className="asesorias">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Empieza aquí</span>
            <h2>Elige cuánto tiempo necesita tu caso.</h2>
          </div>
          <p>
            Todas son reuniones online con un especialista. Después de la sesión
            armamos tu paquete a medida — sin precios genéricos.
          </p>
        </Reveal>

        <div className={`asesoria-grid${opciones.length === 2 ? " dos" : ""}`}>
          {opciones.map((o, i) => (
            <Reveal
              className={`asesoria-card${o.destacada ? " destacada" : ""}${
                o.promo ? " promo" : ""
              }`}
              key={o.id}
              delay={i * 100}
            >
              {o.destacada && <span className="asesoria-tag">Más elegida</span>}
              {o.promo && (
                <span className="asesoria-tag promo-tag">
                  Solo hasta el 22 de septiembre
                </span>
              )}
              <span className="asesoria-dur">{o.duracion}</span>
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
                className={`btn ${o.destacada || o.promo ? "btn-primary" : "btn-outline"}`}
              >
                📅 Reservar <span className="arr">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
