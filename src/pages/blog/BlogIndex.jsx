// src/pages/blog/BlogIndex.jsx
import { POSTS } from "./blog.data";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function BlogIndex() {
  const [destacado, ...resto] = POSTS;

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="w-full px-6 py-20"
        style={{ background: "linear-gradient(135deg, #023A4B 0%, #054A5E 100%)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/75">
            Blog
          </span>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl">
            Guías claras para
            <br />
            <span style={{ color: "#F49E4B" }}>migrar y estudiar en España</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/65">
            Extranjería, visados, nacionalidad y vida académica en España,
            explicados por el equipo legal de Inspira.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Post destacado */}
        {destacado && (
          <a
            href={`/blog/${destacado.slug}`}
            onClick={(e) => go(e, `/blog/${destacado.slug}`)}
            className="block rounded-3xl border border-neutral-200 bg-secondary-light p-8 transition hover:-translate-y-1 hover:shadow-lg md:p-10"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-wide">
              <span className="rounded-full bg-accent px-3 py-1 text-white">
                Destacado
              </span>
              <span className="text-primary">{destacado.categoria}</span>
              <span className="font-semibold normal-case tracking-normal text-neutral-500">
                {fechaLarga(destacado.fecha)} · {destacado.minutos} min de lectura
              </span>
            </div>
            <h2 className="mt-4 font-fraunces text-3xl font-bold leading-tight text-primary md:text-4xl">
              {destacado.titulo}
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-neutral-700">
              {destacado.extracto}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-primary">
              Leer artículo <span aria-hidden>→</span>
            </span>
          </a>
        )}

        {/* Resto de entradas */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {resto.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={(e) => go(e, `/blog/${post.slug}`)}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-extrabold uppercase tracking-wide text-accent">
                  {post.categoria}
                </span>
                <span className="text-neutral-500">
                  {fechaLarga(post.fecha)} · {post.minutos} min
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold leading-snug text-neutral-900">
                {post.titulo}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-700">
                {post.extracto}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Leer artículo <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
