// src/pages/plataforma/Plataforma.jsx
// «Portal Inspira» (/plataforma): el portal propio del asesorado y su app.
// Textos en config/plataforma.js, solo con funciones verificadas. Capturas con
// el desenfoque horneado (components/common/capturasPortal.js). Sin animaciones
// de aparición: todo el contenido está visible desde la carga.
import {
  HERO,
  BENEFICIOS,
  EN_TU_HORA,
  AUTOMATIZACION,
  POR_SERVICIO,
  COMPARATIVA,
  INSTALAR,
  FAQ,
  CTA_FINAL,
} from "../../config/plataforma";
import { CAPTURAS_PORTAL } from "../../components/common/capturasPortal";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";
import { NOMBRE_CORTO } from "../../config/portalMarca";
import { MarcoTelefono, MarcoNavegador } from "../../components/common/MarcoDispositivo";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

function Telefono({ id, className = "", eager = false }) {
  return <MarcoTelefono captura={CAPTURAS_PORTAL[id]} className={className} eager={eager} />;
}

function Eyebrow({ children, claro = false }) {
  return (
    <span
      className={`text-xs font-extrabold uppercase tracking-widest ${claro ? "text-sky" : "text-accent-dark"}`}
    >
      {children}
    </span>
  );
}

function BotonPortal({ claro = false, children = HERO.secundario.texto }) {
  return (
    <a
      href={HERO.secundario.href}
      onClick={(e) => go(e, HERO.secundario.href)}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 font-extrabold transition hover:-translate-y-0.5 ${
        claro
          ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
          : "border-primary text-primary hover:bg-secondary"
      }`}
    >
      <Icono nombre="panel" size={18} />
      {children}
    </a>
  );
}

export default function Plataforma() {
  return (
    <main className="w-full">
      <PageHero
        etiqueta={HERO.etiqueta}
        icono="panel"
        titulo={HERO.titulo}
        destacado={HERO.destacado}
        descripcion={HERO.descripcion}
      >
        <BotonAsesoria>{HERO.cta}</BotonAsesoria>
        <BotonPortal claro />
      </PageHero>

      {/* Escaparate: ordenador y teléfono */}
      <section className="border-b border-neutral-200 bg-secondary-light px-4 pb-16 pt-10 sm:px-6">
        {/* Composición: navegador y tres teléfonos (máster, inicio y visado) */}
        <div className="relative mx-auto max-w-5xl pb-16 sm:pb-12">
          <MarcoNavegador captura={CAPTURAS_PORTAL.inicioEscritorio} eager className="w-[92%] md:w-[80%]" />
          <div className="absolute bottom-0 right-0 flex w-[64%] items-end gap-2 sm:w-[50%] sm:gap-3 md:w-[44%]">
            <Telefono id="masterPostulaciones" eager className="w-1/3" />
            <Telefono id="inicio" eager className="w-1/3 -translate-y-6 sm:-translate-y-10" />
            <Telefono id="visadoCalculadora" eager className="w-1/3" />
          </div>
        </div>
        <p className="text-center text-xs text-neutral-500">{HERO.nota}</p>
      </section>

      {/* Beneficios con captura */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>{NOMBRE_CORTO}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold text-primary md:text-3xl">
            {HERO.lema}
          </h2>
          <p className="mt-3 text-neutral-700">
            {HERO.apoyo}
          </p>
        </div>

        <div className="mt-12 space-y-16">
          {BENEFICIOS.map((b, i) => (
            <article key={b.id} className="grid items-center gap-8 md:grid-cols-[1fr_300px] md:gap-14">
              <div className={i % 2 ? "md:order-2" : ""}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-light text-primary">
                  <Icono nombre={b.icono} size={21} />
                </span>
                <p className="mt-4">
                  <Eyebrow>{b.eyebrow}</Eyebrow>
                </p>
                <h3 className="mt-1 font-display text-xl font-bold leading-snug text-primary md:text-2xl">
                  {b.titulo}
                </h3>
                <p className="mt-3 leading-relaxed text-neutral-700">{b.texto}</p>
                <ul className="mt-4 space-y-2">
                  {b.puntos.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700">
                      <span className="font-bold text-accent" aria-hidden>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <Telefono id={b.captura} className={`mx-auto w-[62%] max-w-[270px] md:w-full ${i % 2 ? "md:order-1" : ""}`} />
            </article>
          ))}
        </div>
      </section>

      {/* En tu teléfono, en tu hora */}
      <section className="bg-primary px-5 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <Eyebrow claro>{EN_TU_HORA.eyebrow}</Eyebrow>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{EN_TU_HORA.titulo}</h2>
            </div>
            <p className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white md:self-auto">
              <Icono nombre="reloj" size={16} />
              {EN_TU_HORA.hora}
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EN_TU_HORA.puntos.map((p) => (
              <div key={p.titulo} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sky">
                  <Icono nombre={p.icono} size={19} />
                </span>
                <h3 className="mt-3 font-bold">{p.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automatización */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>{AUTOMATIZACION.eyebrow}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold text-primary md:text-3xl">
            {AUTOMATIZACION.titulo}
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUTOMATIZACION.puntos.map((p) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-sky hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                <Icono nombre={p.icono} size={19} />
              </span>
              <h3 className="mt-3 font-bold text-primary">{p.titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lo que ves según tu servicio */}
      <section className="border-y border-neutral-200 bg-secondary-light px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <Eyebrow>Según tu servicio</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-bold text-primary md:text-3xl">
              Lo que ves en tu {NOMBRE_CORTO}
            </h2>
            <p className="mt-3 text-neutral-700">
              Siempre ves quién te atiende, lo que te toca hoy, tus documentos y los mensajes con tu asesor. Además, cada servicio tiene lo suyo.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {POR_SERVICIO.map((s, i) => (
              <article
                key={s.id}
                id={`portal-${s.id}`}
                className="grid scroll-mt-24 items-center gap-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 md:grid-cols-[1fr_320px]"
              >
                <div className={i % 2 ? "md:order-2" : ""}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-light px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary">
                    <Icono nombre={s.icono} size={14} />
                    {s.etiqueta}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-primary md:text-2xl">{s.titulo}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-700">{s.intro}</p>
                  <ul className="mt-4 space-y-2">
                    {s.puntos.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700">
                        <span className="font-bold text-accent" aria-hidden>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={s.enlace.href}
                    onClick={(e) => go(e, s.enlace.href)}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline"
                  >
                    {s.enlace.texto} <span aria-hidden>→</span>
                  </a>
                </div>
                <div className={`mx-auto grid w-full max-w-[320px] grid-cols-2 items-start gap-3 ${i % 2 ? "md:order-1" : ""}`}>
                  {s.capturas.map((c, j) => (
                    <Telefono key={c} id={c} className={j === 1 ? "mt-8" : ""} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativa */}
      <section className="bg-primary px-5 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
            Otras asesorías vs. Inspira
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/70">
            Lo que cambia entre una asesoría que trabaja por WhatsApp y una firma con portal propio.
          </p>

          <div className="mt-9 overflow-hidden rounded-2xl border border-white/15">
            <div className="hidden bg-white/10 sm:grid sm:grid-cols-[0.8fr_1fr_1fr]">
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white/50">Tema</span>
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white/50">Otras asesorías</span>
              <span className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-accent">Con Inspira</span>
            </div>
            {COMPARATIVA.map((f, i) => (
              <div
                key={f.tema}
                className={`grid gap-2 px-5 py-4 sm:grid-cols-[0.8fr_1fr_1fr] sm:gap-4 sm:py-3.5 ${i % 2 ? "bg-white/[0.04]" : ""}`}
              >
                <span className="font-display text-sm font-bold text-white">{f.tema}</span>
                <span className="flex gap-2 text-[13px] leading-relaxed text-white/60">
                  <span className="shrink-0 text-white/40" aria-hidden>✕</span>
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

      {/* Instala la app */}
      <section id="instalar" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>{INSTALAR.eyebrow}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold text-primary md:text-3xl">{INSTALAR.titulo}</h2>
          <p className="mt-3 text-neutral-700">{INSTALAR.intro}</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-primary">En iPhone</h3>
            <ol className="mt-4 space-y-4">
              {INSTALAR.iphone.map((p, i) => (
                <li key={p.titulo} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold text-neutral-900">{p.titulo}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-neutral-700">{p.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-primary">En Android</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{INSTALAR.android}</p>
            </div>
            <div className="rounded-3xl bg-secondary-light p-6">
              <p className="text-sm leading-relaxed text-neutral-700">{INSTALAR.nota}</p>
              <div className="mt-4">
                <BotonPortal>Entrar a mi {NOMBRE_CORTO}</BotonPortal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="border-t border-neutral-200 bg-white px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-neutral-200 bg-white p-5">
                <summary className="cursor-pointer list-none font-bold text-neutral-900 marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {f.q}
                    <span className="shrink-0 text-accent transition group-open:rotate-45" aria-hidden>+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{CTA_FINAL.titulo}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">{CTA_FINAL.texto}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BotonAsesoria>{HERO.cta}</BotonAsesoria>
            <BotonPortal claro />
          </div>
        </div>
      </section>

      <SigueExplorando destinos={["servicios", "casos", "asistente", "nosotros"]} />
    </main>
  );
}
