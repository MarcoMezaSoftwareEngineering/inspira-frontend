// src/components/layout/Header/MegaMenu.jsx
// Mega-menú de servicios del header (solo escritorio). Muestra una selección
// de servicios por categoría; el catálogo completo vive en /servicios.
import { CATEGORIAS, PRECIO_ASESORIA, hrefServicio } from "../../../config/servicios";
import { CALENDLY_URL } from "../../../config/contacto";
import { navigate } from "../../../services/navigate";

// Ids de los servicios destacados en el menú, por categoría.
const DESTACADOS = {
  extranjeria: [
    "visa-estudios",
    "estancia-estudios",
    "nomada-digital",
    "visado-pac",
    "nacionalidad",
    "arraigos",
  ],
  "tramites-espana": [
    "tie",
    "empadronamiento",
    "certificado-digital",
    "canje-dgt",
    "carta-invitacion",
    "seguridad-social",
  ],
  educativa: [
    "master-espana",
    "becas-espana",
    "homologacion-titulo",
    "grado-espana",
    "formacion-profesional",
    "apostillas",
  ],
};

export default function MegaMenu({ onNavigate }) {
  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
    onNavigate?.(href);
  };

  return (
    <div className="v4-mega" role="menu">
      {CATEGORIAS.map((cat) => {
        const todos = cat.grupos.flatMap((g) => g.servicios);
        const items = DESTACADOS[cat.id]
          .map((id) => todos.find((s) => s.id === id))
          .filter(Boolean);
        return (
          <div className="v4-mega-col" key={cat.id}>
            <h4>{cat.titulo}</h4>
            {items.map((s) => {
              const href = hrefServicio(s);
              return (
                <a key={s.id} href={href} onClick={(e) => go(e, href)}>
                  {s.nombre}
                </a>
              );
            })}
            <a
              className="v4-mega-all"
              href={`/servicios#${cat.id}`}
              onClick={(e) => go(e, `/servicios#${cat.id}`)}
            >
              Ver todo →
            </a>
          </div>
        );
      })}

      <div className="v4-mega-foot">
        <span>
          Primera asesoría: <b>{PRECIO_ASESORIA.eur}</b> · <b>{PRECIO_ASESORIA.usd}</b> ·{" "}
          <b>{PRECIO_ASESORIA.pen}</b> — cada paquete es personalizado.
        </span>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
          <b>📅 Agendar asesoría →</b>
        </a>
      </div>
    </div>
  );
}
