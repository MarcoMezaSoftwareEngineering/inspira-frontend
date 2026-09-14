// src/components/layout/Header/MegaMenu.jsx
// Mega-menú de servicios (escritorio). Muestra el catálogo COMPLETO agrupado
// por categoría y subgrupo — nada queda escondido tras un "ver más". Al pie,
// las herramientas gratis y el botón de reservar (el mismo Calendly de toda
// la web).
import { CATEGORIAS, PRECIO_ASESORIA, hrefServicio } from "../../../config/servicios";
import { CALENDLY_URL } from "../../../config/contacto";
import { HERRAMIENTAS_GRATIS, RESERVAR_ETIQUETA } from "./header.data";
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

      {/* Herramientas gratis: salieron de la cabecera el 14/09/2026. «Casos
          de éxito» ya no se repite aquí: tiene su entrada en la cabecera. */}
      <div className="v4-mega-foot">
        <p className="v4-mega-foot-titulo">
          <Icono nombre="destello" size={13} />
          Herramientas gratis
        </p>
        {HERRAMIENTAS_GRATIS.map((h) => (
          <a
            key={h.href}
            className="v4-mega-foot-item"
            href={h.href}
            onClick={(e) => go(e, h.href)}
          >
            <Icono nombre={h.icono} size={18} />
            <span>
              <b>{h.titulo}</b>
              <small>{h.texto}</small>
            </span>
          </a>
        ))}
        <a
          className="v4-mega-foot-cta"
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icono nombre="calendario" size={17} />
          {RESERVAR_ETIQUETA} · {PRECIO_ASESORIA.eur}
        </a>
      </div>
    </div>
  );
}
