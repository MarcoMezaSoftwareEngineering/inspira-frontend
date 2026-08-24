import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Punto de entrada intuitivo: el visitante se reconoce en una situación y
// entra a la página de esa ruta, no al catálogo completo.
const rutas = [
  {
    icono: "birrete",
    emoji: "🎓",
    titulo: "Quiero estudiar en España",
    texto:
      "Máster, grado o carrera técnica, con el permiso que te deja trabajar 30 h semanales. Matrículas desde 700 €.",
    items: ["Visa de Estudios", "Estancia por Estudios", "Máster · Grado · FP"],
    href: "/ruta/estudios",
    destacado: true,
  },
  {
    icono: "maletin",
    emoji: "💼",
    titulo: "Tengo una oferta o trabajo en remoto",
    texto:
      "Vías más fáciles y rápidas: resoluciones en semanas, permiso para tu familia y cómputo para la nacionalidad.",
    items: ["Nómada Digital", "Visado PAC", "No Lucrativa", "Doctorado"],
    href: "/ruta/rapidas",
  },
  {
    icono: "bandera",
    emoji: "🇪🇸",
    titulo: "Ya estoy en España",
    texto:
      "Renovaciones, cambios de situación, arraigos, nacionalidad en 2 años y todas las gestiones del día a día.",
    items: ["Nacionalidad", "Arraigos", "TIE", "Empadronamiento"],
    href: "/ruta/en-espana",
  },
  {
    icono: "documento",
    emoji: "📄",
    titulo: "Me denegaron un trámite",
    texto:
      "Analizamos la resolución y te decimos con honestidad si el recurso es viable. Los plazos son cortos.",
    items: ["Recurso de Reposición", "Plan B"],
    href: "/ruta/denegado",
    urgente: true,
  },
  {
    icono: "libro",
    emoji: "📚",
    titulo: "Aún no migro, pero quiero avanzar",
    texto:
      "Homologa tus estudios y prepárate para la universidad española. Lo que más tarda conviene empezarlo ya.",
    items: ["Homologaciones", "Grado y Máster", "Apostillas"],
    href: "/ruta/tramites",
  },
];

export default function RutasMigrar() {
  return (
    <section className="rutas" id="rutas">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Migra a España</span>
            <h2>¿Por dónde empieza tu caso?</h2>
          </div>
          <p>
            No necesitas saber cómo se llama tu trámite. Elige la situación en
            la que estás y te llevamos a la vía correcta.
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
              delay={i * 80}
            >
              <span className="ruta-icon">
                <Icono nombre={r.icono} size={24} />
              </span>
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
