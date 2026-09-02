// src/pages/plataforma/Plataforma.jsx
import { CAPACIDADES, COMPARATIVA } from "../../config/plataforma";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function Plataforma() {
  return (
    <main className="w-full">
      <PageHero
        etiqueta="Sistema propio"
        icono="laptop"
        titulo="No trabajamos por WhatsApp."
        destacado="Tu caso vive en nuestro sistema."
        descripcion="Somos una firma con plataforma propia: accedes con tus credenciales a un panel donde está tu expediente completo, subes tus documentos, tu asesor los valida y el sistema te avisa solo en cada hito del proceso."
        accesos={[
          { icono: "brujula", label: "Ver servicios", href: "/servicios" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
          { icono: "robot", label: "Asistente IA", href: "/asistente" },
        ]}
      >
        <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
      </PageHero>

      {/* Maqueta del panel */}
      <section className="border-b border-neutral-200 bg-secondary-light px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-primary px-5 py-3.5 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Icono nombre="escudo" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold">Mi panel Inspira</p>
                <p className="text-[11px] text-white/60">
                  Acceso privado con credenciales
                </p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-[11px] font-bold text-green-300 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Expediente activo
              </span>
            </div>

            <div className="grid gap-px bg-neutral-200 sm:grid-cols-3">
              {[
                {
                  i: "usuarios",
                  t: "Perfil",
                  d: "Tus datos académicos y migratorios, completados una sola vez.",
                },
                {
                  i: "maletin",
                  t: "Mis servicios",
                  d: "Cada servicio contratado con su estado real y su avance.",
                },
                {
                  i: "documento",
                  t: "Documentos",
                  d: "Checklist por trámite: subes, tu asesor valida.",
                },
              ].map((c) => (
                <div key={c.t} className="bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                    <Icono nombre={c.i} size={19} />
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-primary">
                    {c.t}
                  </h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>

            {/* Ejemplo de checklist */}
            <div className="border-t border-neutral-200 p-5">
              <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
                Ejemplo · Checklist de tu expediente
              </p>
              <ul className="space-y-2">
                {[
                  { d: "Pasaporte vigente", e: "Validado", ok: true },
                  { d: "Carta de admisión", e: "Validado", ok: true },
                  { d: "Antecedentes penales apostillados", e: "En revisión", ok: null },
                  { d: "Seguro médico internacional", e: "Pendiente", ok: false },
                ].map((f) => (
                  <li
                    key={f.d}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-2.5"
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-semibold text-neutral-900">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white ${
                          f.ok === true
                            ? "bg-green-600"
                            : f.ok === null
                            ? "bg-sky-dark"
                            : "bg-neutral-300"
                        }`}
                      >
                        {f.ok === true ? "✓" : f.ok === null ? "•" : ""}
                      </span>
                      {f.d}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                        f.ok === true
                          ? "bg-green-50 text-green-700"
                          : f.ok === null
                          ? "bg-sky-light text-sky-dark"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {f.e}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-500">
            Vista ilustrativa del panel. El acceso se activa al contratar un
            servicio.
          </p>
        </div>
      </section>

      {/* Capacidades */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
            Qué incluye el sistema
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-primary md:text-3xl">
            Todo tu proceso, en un solo lugar
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {CAPACIDADES.map((c) => (
            <article
              key={c.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-sky hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-light text-sky-dark">
                <Icono nombre={c.icono} size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary">
                {c.titulo}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-700">
                {c.texto}
              </p>
              <ul className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4">
                {c.puntos.map((p) => (
                  <li
                    key={p}
                    className="flex gap-2 text-[12.5px] leading-relaxed text-neutral-600"
                  >
                    <span className="font-bold text-accent" aria-hidden>
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Comparativa */}
      <section className="bg-primary px-6 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
            La diferencia, punto por punto
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/70">
            Lo que cambia entre una asesoría que trabaja por chat y una firma
            con sistema propio.
          </p>

          <div className="mt-9 overflow-hidden rounded-2xl border border-white/15">
            <div className="hidden bg-white/10 sm:grid sm:grid-cols-[1fr_1fr_1fr]">
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white/50">
                Tema
              </span>
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white/50">
                Otras asesorías
              </span>
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-accent">
                Con Inspira
              </span>
            </div>
            {COMPARATIVA.map((f, i) => (
              <div
                key={f.tema}
                className={`grid gap-2 px-5 py-4 sm:grid-cols-[1fr_1fr_1fr] sm:gap-4 sm:py-3.5 ${
                  i % 2 ? "bg-white/[0.04]" : ""
                }`}
              >
                <span className="font-display text-sm font-bold text-white">
                  {f.tema}
                </span>
                <span className="flex gap-2 text-[13px] leading-relaxed text-white/55">
                  <span className="shrink-0 text-white/30" aria-hidden>✕</span>
                  {f.otros}
                </span>
                <span className="flex gap-2 text-[13px] font-medium leading-relaxed text-white">
                  <span className="shrink-0 text-accent" aria-hidden>✓</span>
                  {f.inspira}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
          Tu acceso se activa al contratar
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-700">
          Empieza por la asesoría de 30 minutos: si tu caso es viable y decides
          avanzar, abrimos tu expediente en el sistema ese mismo día.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <BotonAsesoria />
          <a
            href="/servicios"
            onClick={(e) => go(e, "/servicios")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 font-extrabold text-primary transition hover:bg-secondary"
          >
            Ver los servicios
          </a>
        </div>
      </section>

      <SigueExplorando destinos={["casos", "servicios", "asistente", "nosotros"]} />
    </main>
  );
}
