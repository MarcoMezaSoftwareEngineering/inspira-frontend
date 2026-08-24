// src/pages/rutas/RutaLanding.jsx
// Página puente de una ruta (/ruta/<id>): presenta la situación del
// visitante, el gancho de esa vía y solo los servicios que le sirven.
import { getRuta } from "../../config/rutas";
import { getServicio, hrefServicio } from "../../config/servicios";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";
import NotFound from "../NotFound";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

function TarjetaServicio({ id }) {
  const s = getServicio(id);
  if (!s) return null;
  const href = hrefServicio(s);
  return (
    <a
      href={href}
      onClick={(e) => go(e, href)}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-sans text-[15px] font-bold leading-snug text-neutral-900">
          {s.nombre}
        </h4>
        {s.etiqueta && (
          <span className="shrink-0 rounded-full bg-sky-light px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-primary">
            {s.etiqueta}
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-neutral-600">
        {s.resumen}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary">
        Ver servicio
        <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
      </span>
    </a>
  );
}

export default function RutaLanding({ id }) {
  const ruta = getRuta(id);
  if (!ruta) return <NotFound />;

  return (
    <div className="w-full">
      <PageHero
        etiqueta={ruta.etiqueta}
        icono={ruta.icono}
        titulo={ruta.titulo}
        destacado={ruta.destacado}
        descripcion={ruta.intro}
        volver={{ label: "Todas las rutas", href: "/#rutas" }}
        accesos={[
          { icono: "robot", label: "¿Cuál me toca a mí?", href: "/asistente" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
          { icono: "brujula", label: "Ver catálogo completo", href: "/servicios" },
        ]}
      >
        <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
      </PageHero>

      {/* Gancho de la ruta */}
      {ruta.gancho && (
        <section className="bg-primary px-6 py-12 text-white">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="text-center md:text-left">
              <span className="block font-display text-5xl font-black leading-none text-sun md:text-6xl">
                {ruta.gancho.dato}
              </span>
              <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-white/60">
                {ruta.gancho.datoTexto}
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold leading-snug md:text-3xl">
                {ruta.gancho.titulo}
              </h2>
              <p className="mt-2 leading-relaxed text-white/75">
                {ruta.gancho.texto}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bloques de servicios */}
      <div className="mx-auto max-w-5xl px-6 py-14">
        {ruta.bloques.map((bloque, i) => (
          <section key={bloque.titulo} className={i > 0 ? "mt-12" : ""}>
            <div className="mb-5 flex items-baseline gap-3">
              <span className="font-display text-2xl font-black text-sky-dark">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-primary md:text-2xl">
                  {bloque.titulo}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">{bloque.texto}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bloque.servicios.map((sid) => (
                <TarjetaServicio key={sid} id={sid} />
              ))}
            </div>
          </section>
        ))}

        {/* Qué viene después */}
        {ruta.despues && (
          <section className="mt-14 rounded-3xl border-2 border-dashed border-sky-dark/40 bg-sky-light/50 p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-dark">
                <Icono nombre="brujula" size={22} />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-primary">
                  {ruta.despues.titulo}
                </h2>
                <p className="mt-2 leading-relaxed text-neutral-700">
                  {ruta.despues.texto}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {ruta.despues.servicios.map((sid) => (
                    <TarjetaServicio key={sid} id={sid} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-14 rounded-3xl bg-primary px-8 py-12 text-center text-white">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            ¿No sabes cuál de estas vías es la tuya?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            En 30 minutos con un abogado especialista sales con el diagnóstico
            de tu caso y un plan de acción concreto.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BotonAsesoria />
            <a
              href="/asistente"
              onClick={(e) => go(e, "/asistente")}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 font-extrabold text-white transition hover:bg-white/10"
            >
              <Icono nombre="robot" size={18} />
              Probar el asistente gratis
            </a>
          </div>
        </section>
      </div>
      <SigueExplorando destinos={["asistente","calculadora","casos","servicios"]} />
    </div>
  );
}
