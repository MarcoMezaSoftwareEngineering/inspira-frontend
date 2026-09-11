// src/pages/landing/master2027/Equipo.jsx
// A12: personas reales y todas las opiniones reales (Google y Facebook), con
// su servicio real (visado). Citas literales y completas; sin logos.
// Carrusel con scroll-snap: una tarjeta en móvil, tres en escritorio. Las
// tarjetas crecen con su texto: ninguna se trunca.
import { useEffect, useRef, useState } from "react";
import Icono from "../../../components/common/Icono";
import { EQUIPO, OPINIONES } from "../../../config/paqueteMaster2027";
import { TituloSeccion } from "./comunes";
import { evento } from "./medicion";

function Estrellas({ n, size }) {
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
// Retratos recortados de las piezas de redes (carina-meza.jpg y
// sebastian-alpiste.jpg), sin el texto incrustado, que a este tamaño no se leía.
import fotoCarina from "../../../assets/images/landing/master-2027/equipo-carina-meza-retrato.webp";
import fotoSebastian from "../../../assets/images/landing/master-2027/equipo-sebastian-alpiste-retrato.webp";

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
  const total = OPINIONES.citas.length;

  function medir() {
    const el = pista.current;
    if (!el || !el.firstElementChild) return;
    const paso = el.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
    const porVista = Math.max(1, Math.round((el.clientWidth + 1) / paso));
    setVisibles(porVista);
    setIndice(Math.min(total - 1, Math.round(el.scrollLeft / paso)));
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
    if (!el || !el.firstElementChild) return;
    const paso = el.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: dir * paso, behavior: "smooth" });
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
        aria-label={OPINIONES.ariaCarrusel}
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
        {OPINIONES.citas.map((c, i) => (
          <figure
            key={c.autor}
            aria-roledescription="opinión"
            aria-label={`${i + 1} de ${total}`}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl bg-white p-5 shadow-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <Estrellas n={OPINIONES.estrellas} size={16} />
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-primary-light">
              {c.servicio} · {c.fuente} · {c.fecha}
            </p>
            <blockquote className="mt-3 text-sm leading-relaxed text-neutral-700">«{c.texto}»</blockquote>
            <figcaption className="mt-4 text-sm font-bold text-primary">{c.autor}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" onClick={() => mover(-1)} disabled={indice <= 0} aria-label={OPINIONES.anterior} className={CLASE_FLECHA}>
          <Flecha izquierda />
        </button>
        <p aria-live="polite" className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-primary">
          {visibles > 1 ? `${indice + 1}–${hasta}` : indice + 1} / {total}
        </p>
        <button type="button" onClick={() => mover(1)} disabled={indice >= ultimoInicio} aria-label={OPINIONES.siguiente} className={CLASE_FLECHA}>
          <Flecha />
        </button>
      </div>
    </div>
  );
}

const FOTOS = {
  carina: { src: fotoCarina, ancho: 256, alto: 320 },
  sebastian: { src: fotoSebastian, ancho: 230, alto: 288 },
};

export default function Equipo() {
  return (
    <section id="equipo" className="scroll-mt-4 bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={EQUIPO.eyebrow} titulo={EQUIPO.titulo} intro={EQUIPO.intro} />

        <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 sm:gap-6">
          {EQUIPO.personas.map((p) => (
            <figure key={p.id}>
              <img
                src={FOTOS[p.id].src}
                alt={p.alt}
                width={FOTOS[p.id].ancho}
                height={FOTOS[p.id].alto}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-2xl object-cover object-top shadow-md"
              />
              <figcaption className="mt-2 text-center">
                <span className="block text-sm font-bold text-primary">{p.nombre}</span>
                <span className="block text-xs text-neutral-600">{p.cargo}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {EQUIPO.razones.map((r) => (
            <div key={r.titulo} className="rounded-2xl bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sun">
                <Icono nombre={r.icono} size={20} />
              </span>
              <h3 className="mt-3 font-fraunces text-base font-bold text-primary">{r.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{r.texto}</p>
            </div>
          ))}
        </div>

        <div id="opiniones" className="mt-14 scroll-mt-6">
          <div className="text-center">
            <p className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Estrellas n={OPINIONES.estrellas} size={20} />
              <span className="font-fraunces text-xl font-bold text-primary sm:text-2xl">{OPINIONES.cabecera}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-700">{OPINIONES.subtitulo}</p>
          </div>
          <CarruselOpiniones />
          <p className="mt-6 text-center">
            <a
              href={OPINIONES.url}
              target="_blank"
              rel="noopener"
              onClick={() => evento("ads2027_opiniones_google", { ubicacion: "equipo" })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
            >
              {OPINIONES.enlace}
              <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
