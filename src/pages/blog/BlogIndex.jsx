// src/pages/blog/BlogIndex.jsx
import { POSTS, autorDe, portadaDe } from "./blog.data";
import { navigate } from "../../services/navigate";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";

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
    <main className="w-full">
      <PageHero
        etiqueta="Blog"
        icono="libro"
        titulo="Guías claras para"
        destacado="migrar y estudiar en España"
        descripcion="Extranjería, visados, nacionalidad y vida académica en España, explicados por el equipo legal de Inspira."
        accesos={[
          { icono: "robot", label: "Asistente IA", href: "/asistente" },
          { icono: "brujula", label: "Servicios", href: "/servicios" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Post destacado */}
        {destacado && (
          <a
            href={`/blog/${destacado.slug}`}
            onClick={(e) => go(e, `/blog/${destacado.slug}`)}
            className="group block overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={portadaDe(destacado)}
              alt=""
              width="1200"
              height="600"
              loading="eager"
              className="h-52 w-full object-cover md:h-64"
            />
            <div className="p-8 md:p-10">
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
            </div>
          </a>
        )}

        {/* Resto de entradas */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {resto.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={(e) => go(e, `/blog/${post.slug}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <img
                src={portadaDe(post)}
                alt=""
                width="1200"
                height="600"
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-extrabold uppercase tracking-wide text-accent">
                  {post.categoria}
                </span>
                <span className="text-neutral-500">
                  {fechaLarga(post.fecha)} · {post.minutos} min · {autorDe(post).nombre}
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
              </div>
            </a>
          ))}
        </div>
      </div>
      <SigueExplorando destinos={["asistente","servicios","casos","tienda"]} />
    </main>
  );
}
