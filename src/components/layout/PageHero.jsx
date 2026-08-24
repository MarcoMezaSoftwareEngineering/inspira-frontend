// src/components/layout/PageHero.jsx
// Cabecera común a todas las páginas internas: mismo lenguaje visual que el
// home (fondo azul petróleo, acentos celeste/naranja, accesos rápidos y CTA),
// para que la navegación se sienta continua.
import Icono from "../common/Icono";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function PageHero({
  etiqueta,
  icono,
  titulo,
  destacado,
  descripcion,
  accesos = [],
  children,
  volver,
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-glow" aria-hidden />
      <div className="page-hero-grid" aria-hidden />
      <div className="page-hero-inner">
        {volver && (
          <a
            href={volver.href}
            onClick={(e) => go(e, volver.href)}
            className="page-hero-volver"
          >
            ← {volver.label}
          </a>
        )}

        {etiqueta && (
          <span className="page-hero-tag">
            {icono && <Icono nombre={icono} size={15} />}
            {etiqueta}
          </span>
        )}

        <h1>
          {titulo}
          {destacado && (
            <>
              <br />
              <span>{destacado}</span>
            </>
          )}
        </h1>

        {descripcion && <p className="page-hero-lead">{descripcion}</p>}

        {children && <div className="page-hero-acciones">{children}</div>}

        {accesos.length > 0 && (
          <div className="page-hero-quick">
            {accesos.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={a.externo ? undefined : (e) => go(e, a.href)}
                target={a.externo ? "_blank" : undefined}
                rel={a.externo ? "noopener noreferrer" : undefined}
              >
                {a.icono && <Icono nombre={a.icono} size={16} />}
                {a.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
