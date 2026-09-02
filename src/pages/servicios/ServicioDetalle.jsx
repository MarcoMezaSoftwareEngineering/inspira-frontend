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
import { procesoDe } from "../../config/serviciosProceso";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import Icono from "../../components/common/Icono";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
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
  const proceso = procesoDe(servicio.id);
  const relacionados = TODOS_SERVICIOS.filter(
    (s) => s.categoriaId === servicio.categoriaId && s.id !== servicio.id
  ).slice(0, 3);

  return (
    <main className="w-full">
      <PageHero
        etiqueta={servicio.categoria}
        icono="brujula"
        titulo={d.titulo}
        descripcion={d.intro}
        volver={{ label: servicio.categoria, href: `/servicios#${servicio.categoriaId}` }}
        accesos={[
          { icono: "robot", label: "¿Es mi trámite?", href: "/asistente" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
          { icono: "brujula", label: "Todos los servicios", href: "/servicios" },
        ]}
      >
        <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
        <span className="text-sm text-white/65">
          {ASESORIA.duracion} · {PRECIO_ASESORIA.eur} · {PRECIO_ASESORIA.usd} ·{" "}
          {PRECIO_ASESORIA.pen}
        </span>
      </PageHero>

      {/* Gancho del servicio */}
      <div className="border-b border-neutral-200 bg-secondary-light px-6 py-5">
        <p className="mx-auto max-w-4xl text-center text-lg font-bold text-primary">
          {d.gancho}
        </p>
      </div>

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

        {/* Proceso paso a paso, propio de este servicio */}
        <section className="mb-12">
          <h2 className="font-fraunces text-2xl font-bold text-primary">
            Cómo es el proceso, paso a paso
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Así trabajamos este trámite en concreto — cada servicio tiene su
            propio camino.
          </p>
          <ol className="mt-6 space-y-3">
            {proceso.map((paso, i) => (
              <li
                key={paso.titulo}
                className="group relative flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-dark/50 hover:shadow-md"
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-light text-primary transition group-hover:bg-accent group-hover:text-white">
                    <Icono nombre={paso.icono} size={20} />
                  </span>
                  {i < proceso.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-neutral-200" />
                  )}
                </div>
                <div className="pb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
                    Paso {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-0.5 font-bold text-neutral-900">
                    {paso.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                    {paso.texto}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-light text-primary">
                  <Icono nombre={v.icono} size={21} />
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
      <SigueExplorando destinos={["asistente","casos","calculadora","servicios"]} />
    </main>
  );
}
