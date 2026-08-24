// src/pages/casos/CasosExito.jsx
// Casos de éxito por tipo de expediente. Mientras `CASOS` esté vacío, la
// página muestra las categorías y el CTA sin inventar resultados concretos.
import { useState } from "react";
import { CATEGORIAS_CASOS, CASOS } from "../../config/casos";
import { TESTIMONIOS } from "../../config/testimonios";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";

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
        descripcion="Admisiones a máster, visas aprobadas, apelaciones ganadas y estancias concedidas. Esto es lo que hacemos todos los días."
        accesos={[
          { icono: "pasaporte", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
          { icono: "balanza", label: "Recurso de Reposición", href: "/servicios/recurso-reposicion" },
          { icono: "usuarios", label: "Conoce al equipo", href: "/nosotros" },
        ]}
      >
        <BotonAsesoria>Quiero ser el siguiente</BotonAsesoria>
      </PageHero>

      {/* Categorías */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS_CASOS.map((c) => {
            const n = CASOS.filter((x) => x.categoria === c.id).length;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                <span className="text-3xl" aria-hidden>
                  {c.icono}
                </span>
                <h2 className="mt-3 text-lg font-bold text-neutral-900">
                  {c.titulo}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {c.descripcion}
                </p>
                {n > 0 && (
                  <p className="mt-3 text-2xl font-extrabold text-primary">{n}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Listado de casos */}
      {CASOS.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltro("todos")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtro === "todos"
                  ? "bg-primary text-white"
                  : "bg-secondary text-primary hover:bg-secondary-light"
              }`}
            >
              Todos
            </button>
            {CATEGORIAS_CASOS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFiltro(c.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filtro === c.id
                    ? "bg-primary text-white"
                    : "bg-secondary text-primary hover:bg-secondary-light"
                }`}
              >
                {c.icono} {c.titulo}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {visibles.map((caso) => (
              <article
                key={caso.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <h3 className="font-bold text-neutral-900">{caso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {caso.texto}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  {caso.cliente} · {caso.pais} · {caso.fecha}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        /* Sin casos cargados aún: mostramos las reseñas reales publicadas */
        <section className="bg-secondary-light px-6 py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-fraunces text-2xl font-bold text-primary">
              Lo que dicen nuestros clientes
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {TESTIMONIOS.map((t) => (
                <article
                  key={t.nombre}
                  className="rounded-2xl border border-neutral-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-accent" aria-label={`${t.estrellas} de 5`}>
                      {"★".repeat(t.estrellas)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      {t.fuente}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                    “{t.texto}”
                  </p>
                  <p className="mt-4 text-sm font-bold text-neutral-900">
                    {t.nombre}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {t.servicio} · {t.fecha}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-fraunces text-3xl font-bold text-primary">
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
      <SigueExplorando destinos={["estudios","rapidas","enEspana","asistente"]} />
    </div>
  );
}
