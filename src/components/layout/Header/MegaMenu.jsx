// src/components/layout/Header/MegaMenu.jsx
// Mega-menú de servicios (escritorio). Muestra el catálogo COMPLETO agrupado
// por categoría y subgrupo — nada queda escondido tras un "ver más".
import { CATEGORIAS, PRECIO_ASESORIA, hrefServicio } from "../../../config/servicios";
import { CALENDLY_URL } from "../../../config/contacto";
import { navigate } from "../../../services/navigate";
import Icono from "../../common/Icono";

// Icono representativo de cada subgrupo del catálogo.
const ICONO_GRUPO = {
  estudios: "birrete",
  rapidos: "maletin",
  especializados: "balanza",
  "otros-extranjeria": "bandera",
  gestiones: "huella",
  master: "birrete",
  "becas-homologacion": "documento",
  adicionales: "avion",
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
      <div className="v4-mega-cols">
        {CATEGORIAS.map((cat) => (
          <div className="v4-mega-cat" key={cat.id}>
            <a
              className="v4-mega-cat-head"
              href={`/servicios#${cat.id}`}
              onClick={(e) => go(e, `/servicios#${cat.id}`)}
            >
              {cat.titulo}
              <span className="arr">→</span>
            </a>

            {cat.grupos.map((grupo) => (
              <div className="v4-mega-grupo" key={grupo.id}>
                <h5>
                  <Icono nombre={ICONO_GRUPO[grupo.id] || "documento"} size={14} />
                  {grupo.titulo}
                </h5>
                <ul>
                  {grupo.servicios.map((s) => {
                    const href = hrefServicio(s);
                    return (
                      <li key={s.id}>
                        <a href={href} onClick={(e) => go(e, href)}>
                          {s.nombre}
                          {s.etiqueta && (
                            <em className={`tag-${s.etiqueta
                              .toLowerCase()
                              .replace(/[^a-z]/g, "")}`}>
                              {s.etiqueta}
                            </em>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="v4-mega-foot">
        <a
          className="v4-mega-foot-item"
          href="/asistente"
          onClick={(e) => go(e, "/asistente")}
        >
          <Icono nombre="robot" size={18} />
          <span>
            <b>¿No sabes cuál es tu trámite?</b>
            <small>Responde 3 preguntas y te lo decimos</small>
          </span>
        </a>
        <a
          className="v4-mega-foot-item"
          href="/casos-de-exito"
          onClick={(e) => go(e, "/casos-de-exito")}
        >
          <Icono nombre="estrella" size={18} />
          <span>
            <b>Casos de éxito</b>
            <small>Visas, admisiones y apelaciones ganadas</small>
          </span>
        </a>
        <a
          className="v4-mega-foot-cta"
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icono nombre="calendario" size={17} />
          Asesoría 1:1 · {PRECIO_ASESORIA.eur}
        </a>
      </div>
    </div>
  );
}
