// src/pages/landing/master2027/Opiniones.jsx
// Las opiniones reales (fuente única: config/testimonios.js): cabecera de
// Google, carrusel con scroll-snap (una tarjeta en móvil, dos en tableta, tres
// en escritorio) y enlace a la ficha. Las tarjetas crecen con su texto:
// ninguna se trunca. Se usa en la landing, en /servicios/master y en la
// portada; por eso no importa el config del paquete, que es grande.
import { useEffect, useRef, useState } from "react";
import { RESENAS_GOOGLE, TESTIMONIOS } from "../../../config/testimonios";
import { evento } from "./medicion";

export function Estrellas({ n, size }) {
  return (
    <span className="inline-flex gap-0.5 text-sun" role="img" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: n }).map((_, j) => (
        <svg key={j} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Flecha({ izquierda = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={izquierda ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

const CLASE_FLECHA =
  "flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white disabled:cursor-default disabled:border-neutral-300 disabled:text-neutral-400 disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky";

function CarruselOpiniones() {
  const pista = useRef(null);
  const [indice, setIndice] = useState(0);
  const [visibles, setVisibles] = useState(1);
  const total = TESTIMONIOS.length;

  function paso() {
    const el = pista.current;
    if (!el || !el.firstElementChild) return 0;
    return el.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
  }

  function medir() {
    const el = pista.current;
    const p = paso();
    if (!el || !p) return;
    setVisibles(Math.max(1, Math.round((el.clientWidth + 1) / p)));
    setIndice(Math.min(total - 1, Math.round(el.scrollLeft / p)));
  }

  // Tarjetas por vista y posición al montar y al cambiar el ancho.
  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mover(dir) {
    const el = pista.current;
    const p = paso();
    if (!el || !p) return;
    el.scrollBy({ left: dir * p, behavior: "smooth" });
    evento("ads2027_opiniones_carrusel", { direccion: dir > 0 ? "siguiente" : "anterior" });
  }

  const ultimoInicio = Math.max(0, total - visibles);
  const hasta = Math.min(total, indice + visibles);

  return (
    <div className="mt-6">
      <div
        ref={pista}
        role="region"
        aria-roledescription="carrusel"
        aria-label={RESENAS_GOOGLE.ariaCarrusel}
        tabIndex={0}
        onScroll={medir}
        onFocus={medir}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            mover(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            mover(-1);
          }
        }}
        className="-mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky min-[380px]:-mx-5 min-[380px]:px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIOS.map((t, i) => (
          <figure
            key={t.nombre}
            aria-roledescription="opinión"
            aria-label={`${i + 1} de ${total}`}
            className="m-0 flex w-[85%] shrink-0 snap-start flex-col rounded-2xl bg-white p-5 text-left shadow-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <Estrellas n={t.estrellas} size={16} />
            <p className="m-0 mt-2 text-xs font-bold uppercase tracking-wide text-primary-light">
              {t.servicio} · {t.fuente} · {t.fecha}
            </p>
            <blockquote className="m-0 mt-3 text-sm leading-relaxed text-neutral-700">«{t.texto}»</blockquote>
            <figcaption className="mt-4 text-sm font-bold text-primary">{t.nombre}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" onClick={() => mover(-1)} disabled={indice <= 0} aria-label={RESENAS_GOOGLE.anterior} className={CLASE_FLECHA}>
          <Flecha izquierda />
        </button>
        <p aria-live="polite" className="m-0 min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-primary">
          {visibles > 1 ? `${indice + 1}–${hasta}` : indice + 1} / {total}
        </p>
        <button type="button" onClick={() => mover(1)} disabled={indice >= ultimoInicio} aria-label={RESENAS_GOOGLE.siguiente} className={CLASE_FLECHA}>
          <Flecha />
        </button>
      </div>
    </div>
  );
}

/** Cabecera de Google + carrusel + enlace a la ficha. */
export default function Opiniones({ ubicacion, id = "opiniones", className = "" }) {
  return (
    <div id={id} className={`scroll-mt-24 ${className}`}>
      <div className="text-center">
        <p className="m-0 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Estrellas n={RESENAS_GOOGLE.estrellas} size={20} />
          <span className="font-fraunces text-xl font-bold text-primary sm:text-2xl">{RESENAS_GOOGLE.cabecera}</span>
        </p>
        <p className="m-0 mt-2 text-sm text-neutral-700">{RESENAS_GOOGLE.subtitulo}</p>
      </div>
      <CarruselOpiniones />
      <p className="m-0 mt-6 text-center">
        <a
          href={RESENAS_GOOGLE.url}
          target="_blank"
          rel="noopener"
          onClick={() => evento("ads2027_opiniones_google", { ubicacion })}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-white px-5 py-2.5 text-sm font-bold text-primary no-underline hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
        >
          {RESENAS_GOOGLE.enlace}
          <span aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  );
}
