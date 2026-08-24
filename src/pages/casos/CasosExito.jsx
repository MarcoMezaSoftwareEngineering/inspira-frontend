// src/pages/casos/CasosExito.jsx
// Casos de éxito por tipo de expediente, con fichas al estilo de las que la
// empresa publica en redes: perfil, destino, programa y costo real.
import { useState } from "react";
import { CATEGORIAS_CASOS, CASOS } from "../../config/casos";
import { TESTIMONIOS } from "../../config/testimonios";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import Icono from "../../components/common/Icono";

function FichaCaso({ caso }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {/* Cabecera con el destino */}
      <div className="relative overflow-hidden bg-primary px-6 py-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-sky/20 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              <Icono nombre="estrella" size={12} />
              {caso.destacado}
            </span>
            <h3 className="mt-3 font-display text-2xl font-black leading-tight">
              {caso.nombre}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <span className="flex items-center justify-end gap-1.5 text-sm font-bold text-sky">
              <Icono nombre="mapa" size={15} />
              {caso.ciudad}
            </span>
            <span className="text-[11px] text-white/60">{caso.comunidad}</span>
          </div>
        </div>
      </div>

      {/* Datos del caso */}
      <div className="px-6 py-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            { i: "birrete", k: "Máster", v: caso.programa },
            { i: "casa", k: "Universidad", v: caso.universidad },
            { i: "documento", k: "Carrera de origen", v: caso.origen },
            { i: "euro", k: "Costo del máster", v: caso.costo, destacado: true },
          ].map((d) => (
            <div key={d.k} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  d.destacado
                    ? "bg-accent/10 text-accent"
                    : "bg-sky-light text-sky-dark"
                }`}
              >
                <Icono nombre={d.i} size={17} />
              </span>
              <div className="min-w-0">
                <dt className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-500">
                  {d.k}
                </dt>
                <dd
                  className={`text-[13px] leading-snug ${
                    d.destacado
                      ? "font-extrabold text-accent-dark"
                      : "font-semibold text-neutral-900"
                  }`}
                >
                  {d.v}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="mt-5 border-l-2 border-accent pl-4 text-[13.5px] italic leading-relaxed text-neutral-700">
          {caso.texto}
        </p>

        {caso.porQue && (
          <div className="mt-5 rounded-2xl bg-secondary-light p-4">
            <p className="mb-2 font-display text-sm font-bold text-primary">
              Universidad ideal si…
            </p>
            <ul className="space-y-1.5">
              {caso.porQue.map((p) => (
                <li
                  key={p}
                  className="flex gap-2 text-[12.5px] leading-relaxed text-neutral-700"
                >
                  <span className="font-bold text-sky-dark" aria-hidden>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function CasosExito() {
  const [filtro, setFiltro] = useState("todos");
  const visibles =
    filtro === "todos" ? CASOS : CASOS.filter((c) => c.categoria === filtro);

  return (
    <div className="w-full">
      <PageHero
        etiqueta="Casos de éxito"
        icono="estrella"
        titulo="Expedientes reales,"
        destacado="resultados reales"
        descripcion="Admisiones a máster, visas aprobadas, apelaciones ganadas y estancias concedidas. Cada ficha es un proceso que gestionamos de principio a fin."
        accesos={[
          { icono: "pasaporte", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
          { icono: "balanza", label: "Recurso de Reposición", href: "/servicios/recurso-reposicion" },
          { icono: "usuarios", label: "Conoce al equipo", href: "/nosotros" },
        ]}
      >
        <BotonAsesoria>Quiero ser el siguiente</BotonAsesoria>
      </PageHero>

      {/* Contadores por categoría (también filtran) */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIAS_CASOS.map((c) => {
            const n = CASOS.filter((x) => x.categoria === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFiltro(filtro === c.id ? "todos" : c.id)}
                className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                  filtro === c.id
                    ? "border-accent bg-accent/5"
                    : "border-neutral-200 bg-white hover:border-sky"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                  <Icono nombre={c.icono} size={20} />
                </span>
                <p className="mt-3 font-display text-2xl font-black text-primary">
                  {n > 0 ? n : "—"}
                </p>
                <h2 className="text-[13px] font-bold leading-snug text-neutral-900">
                  {c.titulo}
                </h2>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-600">
                  {c.descripcion}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Fichas */}
      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-primary">
            {filtro === "todos"
              ? "Últimos casos"
              : CATEGORIAS_CASOS.find((c) => c.id === filtro)?.titulo}
          </h2>
          {filtro !== "todos" && (
            <button
              type="button"
              onClick={() => setFiltro("todos")}
              className="text-sm font-bold text-primary hover:underline"
            >
              ← Ver todos
            </button>
          )}
        </div>

        {visibles.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {visibles.map((c) => (
              <FichaCaso key={c.id} caso={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-secondary-light p-10 text-center">
            <p className="font-semibold text-primary">
              Estamos preparando las fichas de esta categoría.
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Mientras tanto, puedes ver el resto de casos o agendar tu asesoría.
            </p>
          </div>
        )}
      </section>

      {/* Reseñas reales */}
      <section className="bg-secondary-light px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold text-primary">
            Lo que dicen nuestros clientes
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {TESTIMONIOS.map((t) => (
              <article
                key={t.nombre}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sun" aria-label={`${t.estrellas} de 5`}>
                    {"★".repeat(t.estrellas)}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary">
                    {t.fuente}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  “{t.texto}”
                </p>
                <p className="mt-4 text-sm font-bold text-neutral-900">{t.nombre}</p>
                <p className="text-xs text-neutral-500">
                  {t.servicio} · {t.fecha}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
          ¿Quieres ser el siguiente caso?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-700">
          Empieza por el diagnóstico: analizamos tu caso y te decimos con
          honestidad si es viable y cuál es tu mejor vía.
        </p>
        <div className="mt-6 flex justify-center">
          <BotonAsesoria />
        </div>
      </section>

      <SigueExplorando destinos={["estudios", "rapidas", "enEspana", "asistente"]} />
    </div>
  );
}
