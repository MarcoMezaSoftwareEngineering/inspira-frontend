// src/pages/nosotros/Nosotros.jsx
import { EQUIPO } from "../../config/equipo";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function Nosotros() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="w-full px-6 py-20"
        style={{ background: "linear-gradient(135deg, #013446 0%, #02506B 100%)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/75">
            Nosotros
          </span>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl">
            El equipo que mueve
            <br />
            <span style={{ color: "#FA943A" }}>tu caso</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/65">
            Somos un equipo de abogados asociados especializados en extranjería
            española y asesoría educativa para latinoamericanos. Combinamos derecho
            migratorio con herramientas digitales para que cada trámite sea claro,
            medible y acompañado.
          </p>
        </div>
      </section>

      {/* Equipo */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
            Abogados asociados
          </span>
          <h2 className="mt-2 font-fraunces text-3xl font-bold text-primary">
            Quiénes están detrás de Inspira Legal
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EQUIPO.map((persona) => (
            <div
              key={persona.nombre}
              className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-xl font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, #013446, #02506B)" }}
              >
                {persona.iniciales}
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{persona.nombre}</h3>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-accent">
                {persona.cargo}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {persona.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="bg-secondary-light px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-fraunces text-3xl font-bold text-primary">
            Cómo trabajamos
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                titulo: "Diagnóstico honesto",
                texto:
                  "En la primera asesoría te decimos qué vía te conviene de verdad — incluso si eso significa esperar o elegir un proceso distinto al que tenías en mente.",
              },
              {
                titulo: "Paquete a tu medida",
                texto:
                  "No vendemos paquetes genéricos: después de conocer tu caso armamos exactamente los servicios que necesitas, ni uno más.",
              },
              {
                titulo: "Seguimiento medible",
                texto:
                  "Cada expediente vive en nuestro panel digital: sabes en qué paso está tu trámite, qué falta y qué sigue, sin perseguir a nadie.",
              },
            ].map((item) => (
              <div key={item.titulo} className="rounded-2xl bg-white p-6">
                <h3 className="font-bold text-neutral-900">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-fraunces text-3xl font-bold text-primary">
          Hablemos de tu caso
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-700">
          Reserva tu primera asesoría y conoce al equipo que va a acompañar tu
          proceso de principio a fin.
        </p>
        <a
          href="/reservar"
          onClick={(e) => go(e, "/reservar")}
          className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 font-bold text-white transition hover:bg-accent-dark"
        >
          Reservar asesoría →
        </a>
      </section>
    </div>
  );
}
