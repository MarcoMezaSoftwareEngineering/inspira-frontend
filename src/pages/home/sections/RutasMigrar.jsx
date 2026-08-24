import Reveal from "../../../components/common/Reveal";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Punto de entrada intuitivo: el visitante se reconoce en una situación
// antes de tener que saber cómo se llama su trámite.
const rutas = [
  {
    emoji: "🎓",
    titulo: "Quiero estudiar en España",
    texto:
      "Máster, grado o carrera técnica, con el permiso de estudios que te deja trabajar 30 h semanales.",
    items: ["Visa de Estudios", "Estancia por Estudios", "Máster · Grado · FP"],
    href: "/servicios#estudios",
    destacado: true,
  },
  {
    emoji: "💼",
    titulo: "Tengo una oferta o trabajo en remoto",
    texto:
      "Procesos rápidos para perfiles cualificados: resoluciones ágiles y permiso para tu familia.",
    items: ["Visado PAC", "Nómada Digital", "Residencia No Lucrativa"],
    href: "/servicios#rapidos",
  },
  {
    emoji: "🇪🇸",
    titulo: "Ya estoy en España",
    texto:
      "Renovaciones, cambios de situación, arraigos y la nacionalidad en solo 2 años.",
    items: ["Nacionalidad", "Arraigos", "Modificatorias"],
    href: "/servicios#otros-extranjeria",
  },
  {
    emoji: "📄",
    titulo: "Me denegaron un trámite",
    texto:
      "Analizamos la resolución y te decimos con honestidad si el recurso es viable.",
    items: ["Recurso de Reposición", "Plan B: Estancia por Estudios"],
    href: "/servicios/recurso-reposicion",
    urgente: true,
  },
];

export default function RutasMigrar() {
  return (
    <section className="rutas">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Migra a España</span>
            <h2>¿Por dónde empieza tu caso?</h2>
          </div>
          <p>
            No necesitas saber cómo se llama tu trámite. Elige la situación en la
            que estás y te llevamos a la vía correcta.
          </p>
        </Reveal>

        <div className="rutas-grid">
          {rutas.map((r, i) => (
            <Reveal
              as="a"
              key={r.titulo}
              className={`ruta-card${r.destacado ? " destacada" : ""}${
                r.urgente ? " urgente" : ""
              }`}
              href={r.href}
              onClick={(e) => go(e, r.href)}
              delay={i * 90}
            >
              <span className="ruta-emoji" aria-hidden>{r.emoji}</span>
              <h3>{r.titulo}</h3>
              <p>{r.texto}</p>
              <div className="ruta-tags">
                {r.items.map((it) => (
                  <span key={it}>{it}</span>
                ))}
              </div>
              <span className="ruta-link">
                Ver esta ruta <span className="arr">→</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
