import Reveal from "../../../components/common/Reveal";

// ⚠️ TESTIMONIOS DE EJEMPLO — reemplazar con opiniones reales de clientes
// (con su autorización) antes de considerarlos definitivos. Publicar reseñas
// inventadas como si fueran reales infringe la normativa de INDECOPI sobre
// publicidad (ver inspira-backend/docs/legal/09-claims-publicitarios.md).
const testimonios = [
  {
    nombre: "Alejandra R.",
    origen: "Lima, Perú",
    servicio: "Máster en España",
    texto:
      "Llegué sin saber ni por dónde empezar y salí con admisión en una universidad pública de Madrid. Me acompañaron en cada paso, desde la postulación hasta la visa.",
  },
  {
    nombre: "Diego C.",
    origen: "Arequipa, Perú",
    servicio: "Estancia por estudios",
    texto:
      "Lo que más valoro es la claridad: siempre supe qué documento faltaba y qué venía después. Mi estancia por estudios salió aprobada sin requerimientos.",
  },
  {
    nombre: "Valeria M.",
    origen: "Bogotá, Colombia",
    servicio: "Nómada digital",
    texto:
      "Mi residencia de nómada digital fue aprobada en tiempo récord. El expediente estaba tan bien armado que no hubo ni una sola observación.",
  },
];

export default function Testimonios() {
  return (
    <section className="testimonials">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Opiniones</span>
            <h2>Historias que ya están en España.</h2>
          </div>
          <p>
            Cada proceso es distinto, pero el resultado que buscamos es el mismo:
            que llegues con todo en orden.
          </p>
        </Reveal>

        <div className="testimonial-grid">
          {testimonios.map((t, i) => (
            <Reveal className="testimonial-card" key={t.nombre} delay={i * 100}>
              <div className="stars" aria-label="5 de 5 estrellas">★★★★★</div>
              <p className="quote">“{t.texto}”</p>
              <div className="who">
                <div className="avatar">{t.nombre[0]}</div>
                <div>
                  <b>{t.nombre}</b>
                  <span>
                    {t.origen} · {t.servicio}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
