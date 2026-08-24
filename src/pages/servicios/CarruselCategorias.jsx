// src/pages/servicios/CarruselCategorias.jsx
// Slides por categoría: cada una con su color, su icono y sus grupos, con
// autoavance y navegación manual. Da movimiento a /servicios y deja ver de
// un vistazo cómo se reparte cada área.
import { useEffect, useState, useCallback } from "react";
import { CATEGORIAS, hrefServicio } from "../../config/servicios";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";

const ESTILO = {
  extranjeria: { color: "sky", icono: "pasaporte", ruta: "/ruta/rapidas", cta: "Ver vías de residencia" },
  "tramites-espana": { color: "orange", icono: "huella", ruta: "/ruta/en-espana", cta: "Ya estoy en España" },
  educativa: { color: "sun", icono: "birrete", ruta: "/ruta/estudios", cta: "Ver la ruta de estudios" },
};

export default function CarruselCategorias() {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const cat = CATEGORIAS[i];
  const est = ESTILO[cat.id];

  const ir = useCallback((n) => setI((n + CATEGORIAS.length) % CATEGORIAS.length), []);

  useEffect(() => {
    if (pausa) return;
    const t = setInterval(() => setI((v) => (v + 1) % CATEGORIAS.length), 8000);
    return () => clearInterval(t);
  }, [pausa]);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const total = cat.grupos.reduce((n, g) => n + g.servicios.length, 0);

  return (
    <section
      className="cat-slider"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
    >
      <div className="cat-slider-inner">
        {/* Pestañas */}
        <div className="cat-tabs" role="tablist">
          {CATEGORIAS.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={idx === i}
              onClick={() => ir(idx)}
              className={`cat-tab c-${ESTILO[c.id].color}${idx === i ? " activo" : ""}`}
            >
              <Icono nombre={ESTILO[c.id].icono} size={19} />
              <span>{c.titulo}</span>
              <em>{c.grupos.reduce((n, g) => n + g.servicios.length, 0)}</em>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className={`cat-panel c-${est.color}`} key={cat.id}>
          <div className="cat-panel-head">
            <div>
              <span className="cat-badge">
                <Icono nombre={est.icono} size={14} />
                {total} servicios · {cat.grupos.length} bloques
              </span>
              <h3>{cat.titulo}</h3>
              <p>{cat.descripcion}</p>
            </div>
            <a
              className="cat-cta"
              href={est.ruta}
              onClick={(e) => go(e, est.ruta)}
            >
              {est.cta} <span className="arr">→</span>
            </a>
          </div>

          <div className="cat-grupos">
            {cat.grupos.map((g) => (
              <div className="cat-grupo" key={g.id}>
                <h4>{g.titulo}</h4>
                <div className="cat-chips">
                  {g.servicios.map((s) => (
                    <a
                      key={s.id}
                      href={hrefServicio(s)}
                      onClick={(e) => go(e, hrefServicio(s))}
                      className="cat-chip"
                    >
                      {s.nombre}
                      {s.etiqueta && <em>{s.etiqueta}</em>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Puntos */}
        <div className="cat-dots">
          {CATEGORIAS.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Ver ${c.titulo}`}
              onClick={() => ir(idx)}
              className={idx === i ? "activo" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
