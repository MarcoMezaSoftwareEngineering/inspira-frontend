// src/pages/servicios/ServiciosCatalogo.jsx
// Catálogo completo de servicios, organizado por categorías con anclas
// (#extranjeria, #tramites-espana, #educativa) para el mega-menú del header.
import { useEffect } from "react";
import {
  CATEGORIAS,
  PRECIO_ASESORIA,
  DIFERENCIALES,
  hrefServicio,
} from "../../config/servicios";
import { ASESORIA } from "../../config/contacto";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

function PrecioBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-white">
      <span className="text-sm text-white/70">Primera asesoría:</span>
      <span className="text-lg font-bold">{PRECIO_ASESORIA.eur}</span>
      <span className="text-white/40">·</span>
      <span className="text-lg font-bold">{PRECIO_ASESORIA.usd}</span>
      <span className="text-white/40">·</span>
      <span className="text-lg font-bold">{PRECIO_ASESORIA.pen}</span>
    </div>
  );
}

function ServicioCard({ servicio }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-bold text-neutral-900 leading-snug">
          {servicio.nombre}
        </h4>
        {servicio.etiqueta && (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
            {servicio.etiqueta}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        {servicio.resumen}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
        Ver servicio
        <span aria-hidden>→</span>
      </span>
    </>
  );

  const destino = hrefServicio(servicio);
  return (
    <a
      id={servicio.id}
      href={destino}
      onClick={(e) => go(e, destino)}
      className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg scroll-mt-40"
    >
      {body}
    </a>
  );
}

export default function ServiciosCatalogo() {
  // Con navegación SPA el hash no dispara scroll nativo: lo hacemos a mano,
  // tanto al montar como cuando el mega-menú navega dentro de /servicios.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("popstate", scrollToHash);
    return () => window.removeEventListener("popstate", scrollToHash);
  }, []);

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="w-full px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0F2C52 0%, #17406F 100%)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/75">
            Todos nuestros servicios
          </span>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl">
            Tu camino a España,
            <br />
            <span style={{ color: "#F5871F" }}>trámite por trámite</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/65">
            Extranjería, asesoría educativa y gestiones en España. Cada paquete se
            arma a tu medida: el único precio fijo es tu primera asesoría.
          </p>
          <PrecioBanner />
          <div className="mt-7 flex justify-center">
            <BotonAsesoria />
          </div>
        </div>
      </section>

      {/* Diferenciales */}
      <section className="border-b border-neutral-200 bg-secondary-light px-6 py-10">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIALES.map((v) => (
            <div key={v.titulo}>
              <span className="text-2xl" aria-hidden>
                {v.icono}
              </span>
              <h3 className="mt-2 text-sm font-bold text-neutral-900">
                {v.titulo}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                {v.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Navegación por categoría */}
      {/* top-20 deja libre la franja del header flotante (fixed, ~80px) */}
      <nav className="sticky top-20 z-30 rounded-b-2xl border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 overflow-x-auto px-4 py-3">
          {CATEGORIAS.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(cat.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-secondary hover:text-primary"
            >
              {cat.titulo}
            </a>
          ))}
        </div>
      </nav>

      {/* Categorías */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        {CATEGORIAS.map((cat, i) => (
          <section
            key={cat.id}
            id={cat.id}
            className={`scroll-mt-40 ${i > 0 ? "mt-20" : ""}`}
          >
            <div className="mb-8 max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
                {cat.titulo}
              </span>
              <p className="mt-2 text-lg leading-relaxed text-neutral-700">
                {cat.descripcion}
              </p>
            </div>

            {cat.grupos.map((grupo) => (
              <div key={grupo.id} className="mb-10">
                <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-fraunces text-2xl font-bold text-primary">
                    {grupo.titulo}
                  </h3>
                  {grupo.nota && (
                    <span className="text-sm text-neutral-500">{grupo.nota}</span>
                  )}
                </div>
                <div
                  className={`grid gap-4 ${
                    grupo.destacado
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {grupo.servicios.map((s) => (
                    <ServicioCard key={s.id} servicio={s} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {/* CTA final */}
        <section className="mt-20 rounded-3xl bg-primary px-8 py-12 text-center text-white">
          <h2 className="font-fraunces text-3xl font-bold">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            {PRECIO_ASESORIA.descripcion}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <BotonAsesoria />
            <span className="text-sm text-white/70">
              {ASESORIA.duracion} · {PRECIO_ASESORIA.eur} · {PRECIO_ASESORIA.usd} ·{" "}
              {PRECIO_ASESORIA.pen}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
