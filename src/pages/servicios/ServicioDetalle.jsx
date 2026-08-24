// src/pages/servicios/ServicioDetalle.jsx
// Página de un servicio concreto (/servicios/<id>), construida a partir de
// `detalle` en config/servicios.js.
import {
  getServicio,
  TODOS_SERVICIOS,
  hrefServicio,
  PRECIO_ASESORIA,
  DIFERENCIALES,
} from "../../config/servicios";
import { ASESORIA } from "../../config/contacto";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import { navigate } from "../../services/navigate";
import NotFound from "../NotFound";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function ServicioDetalle({ id }) {
  const servicio = getServicio(id);
  if (!servicio?.detalle) return <NotFound />;

  const d = servicio.detalle;
  const relacionados = TODOS_SERVICIOS.filter(
    (s) => s.categoriaId === servicio.categoriaId && s.id !== servicio.id
  ).slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="w-full px-6 py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #0F2C52 0%, #17406F 100%)" }}
      >
        <div className="mx-auto max-w-4xl">
          <a
            href={`/servicios#${servicio.categoriaId}`}
            onClick={(e) => go(e, `/servicios#${servicio.categoriaId}`)}
            className="text-sm font-semibold text-white/60 transition hover:text-white"
          >
            ← {servicio.categoria}
          </a>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            {d.titulo}
          </h1>
          <p className="mt-4 text-xl font-semibold" style={{ color: "#F5871F" }}>
            {d.gancho}
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            {d.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BotonAsesoria>Agenda tu asesoría diagnóstica</BotonAsesoria>
            <span className="text-sm text-white/60">
              {ASESORIA.duracion} · {PRECIO_ASESORIA.eur} · {PRECIO_ASESORIA.usd} ·{" "}
              {PRECIO_ASESORIA.pen}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Bloques de contenido */}
        {d.bloques?.map((bloque) => (
          <section key={bloque.titulo} className="mb-10">
            <h2 className="font-fraunces text-2xl font-bold text-primary">
              {bloque.titulo}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {bloque.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-700"
                >
                  <span className="font-bold text-green-700" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Dirigido a */}
        {d.dirigidoA && (
          <section className="mb-10 rounded-2xl bg-secondary-light p-6">
            <h2 className="font-fraunces text-xl font-bold text-primary">
              Dirigido a
            </h2>
            <ul className="mt-3 space-y-2">
              {d.dirigidoA.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-neutral-700">
                  <span className="text-accent" aria-hidden>
                    ●
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* No incluye */}
        {d.noIncluye && (
          <section className="mb-10 rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-fraunces text-xl font-bold text-neutral-900">
              No incluye
            </h2>
            <ul className="mt-3 space-y-2">
              {d.noIncluye.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-neutral-700">
                  <span className="font-bold text-neutral-400" aria-hidden>
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {d.faq && (
          <section className="mb-10">
            <h2 className="font-fraunces text-2xl font-bold text-primary">
              Preguntas frecuentes
            </h2>
            <div className="mt-4 space-y-3">
              {d.faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-neutral-200 bg-white p-5"
                >
                  <summary className="cursor-pointer list-none font-bold text-neutral-900 marker:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {f.q}
                      <span
                        className="shrink-0 text-accent transition group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Por qué Inspira */}
        <section className="mb-10">
          <h2 className="font-fraunces text-2xl font-bold text-primary">
            Por qué elegir Inspira
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {DIFERENCIALES.map((v) => (
              <div
                key={v.titulo}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <span className="text-2xl" aria-hidden>
                  {v.icono}
                </span>
                <h3 className="mt-2 font-bold text-neutral-900">{v.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                  {v.texto}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-primary px-8 py-12 text-center text-white">
          <h2 className="font-fraunces text-3xl font-bold">
            Empieza por el diagnóstico
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            {PRECIO_ASESORIA.descripcion}
          </p>
          <div className="mt-6 flex justify-center">
            <BotonAsesoria />
          </div>
        </section>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-14">
            <h2 className="font-fraunces text-xl font-bold text-primary">
              Otros servicios de {servicio.categoria}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relacionados.map((s) => (
                <a
                  key={s.id}
                  href={hrefServicio(s)}
                  onClick={(e) => go(e, hrefServicio(s))}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="text-sm font-bold leading-snug text-neutral-900">
                    {s.nombre}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                    {s.resumen}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
