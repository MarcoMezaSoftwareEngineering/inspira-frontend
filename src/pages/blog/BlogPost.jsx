// src/pages/blog/BlogPost.jsx
import { getPost, POSTS, autorDe, portadaDe } from "./blog.data";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL } from "../../config/contacto";
import NotFound from "../NotFound";

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

function Bloque({ bloque }) {
  if (bloque.type === "h2") {
    return (
      <h2 className="mt-10 font-fraunces text-2xl font-bold text-primary">
        {bloque.text}
      </h2>
    );
  }
  if (bloque.type === "ul") {
    return (
      <ul className="mt-4 space-y-2 pl-1">
        {bloque.items.map((item) => (
          <li key={item} className="flex gap-2.5 leading-relaxed text-neutral-700">
            <span className="mt-0.5 font-bold text-primary" aria-hidden>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-4 leading-relaxed text-neutral-700">{bloque.text}</p>
  );
}

export default function BlogPost({ slug }) {
  const post = getPost(slug);
  if (!post) return <NotFound />;
  const autor = autorDe(post);

  const relacionados = POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="w-full">
      <article className="mx-auto max-w-3xl px-6 py-14">
        <a
          href="/blog"
          onClick={(e) => go(e, "/blog")}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Volver al blog
        </a>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold uppercase tracking-wide text-accent">
            {post.categoria}
          </span>
          <span className="text-neutral-500">
            {fechaLarga(post.fecha)} · {post.minutos} min de lectura
          </span>
        </div>

        <img
          src={portadaDe(post)}
          alt=""
          width="1200"
          height="600"
          className="mt-5 aspect-[2/1] w-full rounded-2xl object-cover"
        />

        <h1 className="mt-6 font-fraunces text-3xl font-bold leading-tight text-primary md:text-4xl">
          {post.titulo}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-700">
          {post.extracto}
        </p>

        {/* Firma del autor */}
        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-secondary-light p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
            {autor.iniciales}
          </span>
          <div>
            <p className="text-sm font-bold text-neutral-900">{autor.nombre}</p>
            <p className="text-xs text-neutral-600">{autor.cargo}</p>
          </div>
        </div>

        <hr className="mt-8 border-neutral-200" />

        <div className="mt-2">
          {post.content.map((bloque, i) => (
            <Bloque key={i} bloque={bloque} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-primary p-8 text-center text-white">
          <h3 className="font-fraunces text-2xl font-bold">
            ¿Tu caso necesita una respuesta concreta?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
            Reserva una primera asesoría con nuestro equipo y sal con una ruta
            clara para tu trámite.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 font-bold text-white transition hover:bg-accent-dark"
          >
            📅 Agenda tu asesoría →
          </a>
        </div>
      </article>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="border-t border-neutral-200 bg-secondary-light px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-fraunces text-xl font-bold text-primary">
              Sigue leyendo
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {relacionados.map((p) => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  onClick={(e) => go(e, `/blog/${p.slug}`)}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-xs font-extrabold uppercase tracking-wide text-accent">
                    {p.categoria}
                  </span>
                  <h3 className="mt-2 text-base font-bold leading-snug text-neutral-900">
                    {p.titulo}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
