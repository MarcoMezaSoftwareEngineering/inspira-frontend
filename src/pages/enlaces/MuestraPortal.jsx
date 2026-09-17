// src/pages/enlaces/MuestraPortal.jsx
//
// «Expediente Digital Inspira» en /enlaces (17/09/2026): enseñar el portal en
// vez de contarlo. Quien llega desde la biografía no sabe que cada asesorado
// tiene su propio panel; con tres pantallas reales se entiende de un vistazo.
//
// Las capturas son de una clienta ficticia (banco de pruebas con la API
// interceptada): nunca salen datos reales. Van en public/enlaces/portal-*.jpg
// a 520 px de ancho, ~50 KB cada una, y solo la primera se carga al entrar.
import { useEffect, useState } from "react";

const PANTALLAS = [
  { img: "/enlaces/portal-1.jpg", titulo: "Tu próximo paso", texto: "Al entrar ves qué te toca hacer, con su fecha límite." },
  { img: "/enlaces/portal-2.jpg", titulo: "Tus documentos", texto: "Subes desde el móvil y ves cuáles ya están aprobados." },
  { img: "/enlaces/portal-3.jpg", titulo: "Tus postulaciones", texto: "En qué va cada universidad y qué plazos vienen." },
];

const PASO_MS = 3800;

export default function MuestraPortal({ style, onAbrir, href }) {
  const [i, setI] = useState(0);
  // Se lee una vez al montar, no en cada pintado.
  const [quieto] = useState(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  });

  useEffect(() => {
    if (quieto) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % PANTALLAS.length), PASO_MS);
    return () => clearTimeout(t);
  }, [i, quieto]);

  const p = PANTALLAS[i];

  return (
    <section data-wa="portal" aria-label="Expediente Digital Inspira" className="enl-sube enl-tarjeta mt-3 p-4" style={style}>
      <p className="enl-portal-eyebrow">📱 Expediente Digital Inspira</p>
      <p className="enl-portal-lema">No tienes una carpeta. Tienes un expediente.</p>

      <div className="enl-portal-fila">
        {/* El teléfono: marco fino y la pantalla que toca, que se funde con la
            siguiente. Altura fija para que la tarjeta no salte al cambiar. */}
        <div className="enl-portal-movil" aria-hidden="true">
          {PANTALLAS.map((x, k) => (
            <img
              key={x.img}
              src={x.img}
              alt=""
              className="enl-portal-pantalla"
              data-on={k === i ? "1" : "0"}
              loading={k === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>

        <div className="enl-portal-texto">
          <p className="enl-portal-titulo" aria-live="polite">{p.titulo}</p>
          <p className="enl-tarjeta-texto">{p.texto}</p>
          <div className="enl-portal-puntos" role="tablist" aria-label="Pantallas del portal">
            {PANTALLAS.map((x, k) => (
              <button
                key={x.img}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={x.titulo}
                className={k === i ? "on" : ""}
                onClick={() => setI(k)}
              />
            ))}
          </div>
        </div>
      </div>

      <a href={href} onClick={onAbrir} className="enl-portal-cta">
        Así trabajamos contigo
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </section>
  );
}
