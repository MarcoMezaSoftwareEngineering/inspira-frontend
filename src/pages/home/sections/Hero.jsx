import { useEffect, useState, useCallback } from "react";
import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { CALENDLY_URL } from "../../../config/contacto";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Cada cuánto pasa sola la tarjeta de una vía a la siguiente. La barra de
// progreso de la tarjeta dura exactamente lo mismo, para que se vea venir.
const CADA_MS = 7000;

// Las tres formas de migrar a España, en slides. Cada una tiene su promesa
// y su ruta: estudios (la más efectiva), residencias (las más rápidas) y
// nacionalidad (el objetivo a largo plazo).
const VIAS = [
  {
    id: "estudios",
    etiqueta: "La vía más efectiva",
    corto: "Más efectiva",
    icono: "birrete",
    titulo: "Estudios",
    frase: "La puerta de entrada que más funciona.",
    texto:
      "Máster, grado o carrera técnica. Entras legalmente, puedes trabajar 30 horas semanales y desde ahí construyes tu residencia.",
    puntos: [
      "Visa de Estudios o Estancia por Estudios",
      "Trabaja hasta 30 h semanales",
      "Acceso a becas y universidades públicas",
    ],
    href: "/servicios#estudios",
    cta: "Ver la ruta de estudios",
    color: "sky",
    stats: [
      { i: "birrete", n: "+1.100", t: "másteres analizados" },
      { i: "estrella", n: "+100", t: "becas logradas" },
      { i: "reloj", n: "30 h", t: "de trabajo semanal" },
      { i: "euro", n: "700 €", t: "matrícula pública, desde" },
    ],
  },
  {
    id: "residencias",
    etiqueta: "Las vías más rápidas",
    corto: "Más rápidas",
    icono: "maletin",
    titulo: "Residencia",
    frase: "Resoluciones ágiles para perfiles que califican.",
    texto:
      "Nómada digital, profesional altamente cualificado, no lucrativa o doctorado. Requisitos altos, pero plazos cortos y permiso para tu familia.",
    puntos: [
      "Nómada Digital · Visado PAC",
      "No Lucrativa · Doctorado",
      "Autorización para cónyuge e hijos",
    ],
    href: "/servicios#rapidos",
    cta: "Ver las vías rápidas",
    color: "orange",
    stats: [
      { i: "laptop", n: "100%", t: "proceso digital" },
      { i: "reloj", n: "20 días", t: "plazos de resolución" },
      { i: "usuarios", n: "Familia", t: "cónyuge e hijos" },
      { i: "bandera", n: "Computa", t: "para la nacionalidad" },
    ],
  },
  {
    id: "nacionalidad",
    etiqueta: "El objetivo a largo plazo",
    corto: "Largo plazo",
    icono: "bandera",
    titulo: "Nacionalidad",
    frase: "Solo 2 años de residencia legal si eres latinoamericano.",
    texto:
      "La regla general exige 10 años. Los iberoamericanos, solo 2. Cada trámite hecho bien y en el orden correcto te acerca al pasaporte europeo.",
    puntos: [
      "2 años de residencia, no 10",
      "La estancia por estudios NO computa: la residencia sí",
      "Nacionalidad, arraigos y modificatorias",
    ],
    href: "/servicios/nacionalidad",
    cta: "Ver cómo se consigue",
    color: "sun",
    destacado: true,
  },
];

const ACCESOS = [
  { i: "birrete", label: "Máster en España", href: "/servicios/master" },
  { i: "pasaporte", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
  { i: "bandera", label: "Estancia por Estudios", href: "/servicios/estancia-estudios" },
  { i: "brujula", label: "Todos los servicios", href: "/servicios" },
];

export default function Hero() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  const ir = useCallback((i) => setActivo((i + VIAS.length) % VIAS.length), []);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setActivo((a) => (a + 1) % VIAS.length), CADA_MS);
    return () => clearInterval(t);
  }, [pausado, activo]);

  const via = VIAS[activo];

  return (
    <section className="hero" id="inicio">
      <div className="hero-luz hero-luz-a" aria-hidden="true" />
      <div className="hero-luz hero-luz-b" aria-hidden="true" />

      <div className="v4-container">
        <div className="hero-grid">
          {/* Columna del mensaje */}
          <Reveal className="hero-head">
            <div className="eyebrow hero-eyebrow">
              <span className="dot" />
              <span className="hero-eyebrow-largo">Migra a España · </span>Rumbo a septiembre 2027
            </div>
            <h1>
              Una asesoría de distancia para{" "}
              <em>migrar y vivir en España</em> legalmente.
            </h1>
            <p className="lead">
              Hay tres caminos para quedarte en España. Te mostramos cuál encaja
              con tu caso y lo recorremos contigo, de principio a fin.
            </p>
            <div className="actions">
              <a
                className="btn btn-primary"
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icono nombre="calendario" size={18} />
                Agenda tu asesoría 1:1 <span className="arr">→</span>
              </a>
              <a
                className="btn btn-ghost"
                href="/servicios"
                onClick={(e) => go(e, "/servicios")}
              >
                Ver todos los servicios <span className="arr">↗</span>
              </a>
            </div>

            {/* Lo que respalda la promesa, en una línea y sin gritar. */}
            <ul className="hero-proof" aria-label="Por qué confiar en Inspira">
              <li>
                <Icono nombre="balanza" size={15} />
                Abogados de extranjería
              </li>
              <li>
                <Icono nombre="birrete" size={15} />
                +1.100 másteres analizados
              </li>
              <li>
                <Icono nombre="laptop" size={15} />
                Atención 100 % a distancia
              </li>
            </ul>
          </Reveal>

          {/* Columna de las tres vías: una tarjeta, tres pestañas */}
          <Reveal
            className="vias"
            delay={90}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={() => setPausado(false)}
          >
            <div className="vias-card">
              <div className="vias-tabs" role="tablist" aria-label="Formas de migrar a España">
                {VIAS.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activo}
                    onClick={() => ir(i)}
                    className={`vias-tab${i === activo ? " activo" : ""} c-${v.color}`}
                  >
                    <Icono nombre={v.icono} size={18} />
                    <span className="vias-tab-txt">
                      <small>{v.corto}</small>
                      <b>{v.titulo}</b>
                    </span>
                  </button>
                ))}
              </div>

              {/* La barra que avanza: dice cuánto queda para el siguiente. */}
              <div className="vias-progress" aria-hidden="true">
                <i
                  key={via.id}
                  className={`c-${via.color}`}
                  style={{ animationDuration: `${CADA_MS}ms`, animationPlayState: pausado ? "paused" : "running" }}
                />
              </div>

              {/* Los tres paneles viven apilados en la misma celda: la tarjeta
                  mide lo que el más alto y la página no salta al rotar. */}
              <div className="via-panels">
              {VIAS.map((via, idx) => (
              <div
                className={`via-panel c-${via.color}${idx === activo ? " activo" : ""}`}
                key={via.id}
                role="tabpanel"
                aria-hidden={idx !== activo}
                inert={idx !== activo ? true : undefined}
              >
                <div className="via-main">
                  <span className="via-badge">
                    <Icono nombre={via.icono} size={14} />
                    {via.etiqueta}
                  </span>
                  <h2>{via.frase}</h2>
                  <p>{via.texto}</p>
                  <ul>
                    {via.puntos.map((p) => (
                      <li key={p}>
                        <Icono nombre="escudo" size={15} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="via-side">
                  {via.destacado ? (
                    <div className="via-dato">
                      <div className="via-dato-cifra">
                        <strong>2</strong>
                        <span className="via-dato-unidad">años de<br />residencia</span>
                      </div>
                      <div className="via-dato-txt">
                        <span className="via-dato-label">¿Sabías que…?</span>
                        <p>
                          Es todo lo que necesita un latinoamericano para pedir la
                          nacionalidad española. El resto del mundo necesita 10.
                        </p>
                        <a
                          href="/blog/nacionalidad-espanola-latinoamericanos-2-anos"
                          onClick={(e) =>
                            go(e, "/blog/nacionalidad-espanola-latinoamericanos-2-anos")
                          }
                        >
                          Leer la guía <span className="arr">→</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="via-stats">
                      {via.stats.map((s) => (
                        <div className="via-stat" key={s.t}>
                          <Icono nombre={s.i} size={18} />
                          <div>
                            <b>{s.n}</b>
                            <small>{s.t}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="via-foot">
                  <a className="via-cta" href={via.href} onClick={(e) => go(e, via.href)}>
                    {via.cta} <span className="arr">→</span>
                  </a>
                  <div className="vias-dots">
                    {VIAS.map((v, i) => (
                      <button
                        key={v.id}
                        type="button"
                        aria-label={`Ver ${v.titulo}`}
                        onClick={() => ir(i)}
                        className={i === activo ? "activo" : undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
              ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Accesos directos: una fila discreta, separada del mensaje */}
        <Reveal className="hero-quick" delay={160}>
          <span className="hero-quick-label">Accesos directos</span>
          <div className="hero-quick-list">
            {ACCESOS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={(e) => go(e, a.href)}
                className="hero-quick-item"
              >
                <Icono nombre={a.i} size={16} />
                {a.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
