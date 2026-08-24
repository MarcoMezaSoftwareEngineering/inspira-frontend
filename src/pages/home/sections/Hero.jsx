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

// Las tres formas de migrar a España, en slides. Cada una tiene su promesa
// y su ruta: estudios (la más efectiva), residencias (las más rápidas) y
// nacionalidad (el objetivo a largo plazo).
const VIAS = [
  {
    id: "estudios",
    etiqueta: "La vía más efectiva",
    icono: "birrete",
    titulo: "Por estudios",
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
  },
  {
    id: "residencias",
    etiqueta: "Las vías más rápidas",
    icono: "maletin",
    titulo: "Por residencia",
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
  },
  {
    id: "nacionalidad",
    etiqueta: "El objetivo a largo plazo",
    icono: "bandera",
    titulo: "Por nacionalidad",
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

export default function Hero() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  const ir = useCallback((i) => setActivo((i + VIAS.length) % VIAS.length), []);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setActivo((a) => (a + 1) % VIAS.length), 6500);
    return () => clearInterval(t);
  }, [pausado]);

  const via = VIAS[activo];

  return (
    <section className="hero" id="inicio">
      <div className="v4-container">
        {/* Encabezado */}
        <Reveal className="hero-head">
          <div className="eyebrow">
            <span className="dot" />
            Migra a España · Rumbo a septiembre 2027
          </div>
          <h1>
            Una asesoría de distancia
            <br />
            para <span>migrar y vivir en España</span> legalmente.
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
              <Icono nombre="calendario" size={19} />
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
        </Reveal>

        {/* Slides de las tres vías */}
        <div
          className="vias"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {/* Selector */}
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
                <Icono nombre={v.icono} size={20} />
                <span className="vias-tab-txt">
                  <small>{v.etiqueta}</small>
                  <b>{v.titulo}</b>
                </span>
              </button>
            ))}
          </div>

          {/* Panel activo */}
          <div className={`via-panel c-${via.color}`} key={via.id} role="tabpanel">
            <div className="via-main">
              <span className="via-badge">
                <Icono nombre={via.icono} size={16} />
                {via.etiqueta}
              </span>
              <h2>{via.frase}</h2>
              <p>{via.texto}</p>
              <ul>
                {via.puntos.map((p) => (
                  <li key={p}>
                    <Icono nombre="escudo" size={16} />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                className="via-cta"
                href={via.href}
                onClick={(e) => go(e, via.href)}
              >
                {via.cta} <span className="arr">→</span>
              </a>
            </div>

            {/* Lado visual: gancho de los 2 años en la vía de nacionalidad */}
            <div className="via-side">
              {via.destacado ? (
                <div className="via-dato">
                  <span className="via-dato-label">¿Sabías que...?</span>
                  <strong>2</strong>
                  <span className="via-dato-unidad">años de residencia</span>
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
              ) : (
                <div className="via-stats">
                  {via.id === "estudios" ? (
                    <>
                      <div className="via-stat">
                        <Icono nombre="birrete" size={22} />
                        <b>+1,100</b>
                        <small>másteres analizados</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="estrella" size={22} />
                        <b>+100</b>
                        <small>becas logradas</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="reloj" size={22} />
                        <b>30 h</b>
                        <small>de trabajo semanal</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="euro" size={22} />
                        <b>Desde 700 €</b>
                        <small>matrícula pública</small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="via-stat">
                        <Icono nombre="laptop" size={22} />
                        <b>100%</b>
                        <small>proceso digital</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="reloj" size={22} />
                        <b>20 días</b>
                        <small>plazos de resolución</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="usuarios" size={22} />
                        <b>Familia</b>
                        <small>cónyuge e hijos</small>
                      </div>
                      <div className="via-stat">
                        <Icono nombre="bandera" size={22} />
                        <b>Computa</b>
                        <small>para la nacionalidad</small>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Puntos de navegación */}
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

        {/* Accesos rápidos */}
        <Reveal className="hero-quick" delay={120}>
          {[
            { i: "birrete", label: "Máster en España", href: "/servicios/master" },
            { i: "pasaporte", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
            { i: "bandera", label: "Estancia por Estudios", href: "/servicios/estancia-estudios" },
            { i: "brujula", label: "Nuestros servicios", href: "/servicios" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              onClick={(e) => go(e, a.href)}
              className="hero-quick-item"
            >
              <Icono nombre={a.i} size={18} />
              {a.label}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
