// src/pages/eventos/Eventos.jsx
import { eventosActivos } from "../../config/eventos";
import { navigate } from "../../services/navigate";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function Eventos() {
  const eventos = eventosActivos();
  const principal = eventos[0];

  return (
    <div className="w-full">
      <PageHero
        etiqueta="Evento gratuito"
        icono="calendario"
        titulo="Estudia en España"
        destacado="en 5 pasos"
        descripcion="El primer evento gratuito de Inspira para que estudies en España Rumbo al 2027. Sin costo, sin letra pequeña."
        accesos={[
          { icono: "birrete", label: "Máster en España", href: "/servicios/master" },
          { icono: "brujula", label: "Todos los servicios", href: "/servicios" },
          { icono: "robot", label: "Asistente IA", href: "/asistente" },
        ]}
      />

      {!principal ? (
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-fraunces text-2xl font-bold text-primary">
            No hay eventos programados ahora mismo
          </h2>
          <p className="mt-3 text-neutral-700">
            Estamos preparando la próxima edición. Mientras tanto puedes agendar
            una asesoría personalizada.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 py-16">
          {/* Ficha del evento */}
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-fraunces text-3xl font-bold leading-tight text-primary">
                {principal.titulo}
              </h2>
              <p className="mt-2 text-lg font-semibold text-accent">
                {principal.subtitulo}
              </p>
              <p className="mt-4 leading-relaxed text-neutral-700">
                {principal.resumen}
              </p>

              <h3 className="mt-10 font-fraunces text-2xl font-bold text-primary">
                Los 5 pasos que veremos
              </h3>
              <ol className="mt-5 space-y-3">
                {principal.agenda.map((a) => (
                  <li
                    key={a.paso}
                    className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
                      {a.paso}
                    </span>
                    <div>
                      <h4 className="font-bold text-neutral-900">{a.titulo}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                        {a.texto}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tarjeta de inscripción */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
                <div className="bg-primary px-6 py-5 text-white">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-accent">
                    Inscripción
                  </p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {principal.precio}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{principal.formato}</p>
                </div>
                <div className="px-6 py-5">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Fecha</dt>
                      <dd className="text-right font-semibold text-neutral-900">
                        {principal.fechaTexto}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Cupo</dt>
                      <dd className="text-right font-semibold text-neutral-900">
                        {principal.cupo}
                      </dd>
                    </div>
                  </dl>

                  <h4 className="mt-5 text-sm font-extrabold uppercase tracking-wide text-primary">
                    Beneficios
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {principal.beneficios.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2 text-sm leading-relaxed text-neutral-700"
                      >
                        <span className="font-bold text-accent" aria-hidden>
                          ★
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={principal.urlInscripcion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-extrabold text-white transition hover:bg-accent-dark"
                  >
                    Reserva tu inscripción aquí →
                  </a>
                  <p className="mt-3 text-center text-xs text-neutral-500">
                    ¿Prefieres algo uno a uno?{" "}
                    <a
                      href="/servicios"
                      onClick={(e) => go(e, "/servicios")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Mira nuestros servicios
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SigueExplorando destinos={["estudios","calculadora","asistente","casos"]} />
    </div>
  );
}
