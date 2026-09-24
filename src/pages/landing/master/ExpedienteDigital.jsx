// src/pages/landing/master/ExpedienteDigital.jsx
// Por qué Inspira es distinta: el expediente digital. Solo lo que el portal
// hace de verdad (config/plataforma.js, inventario verificado).
import Icono from "../../../components/common/Icono";
import { BENEFICIOS, POR_SERVICIO, EN_TU_HORA } from "../../../config/plataforma";
import { TituloSeccion } from "../master2027/comunes";
import { evento } from "../master2027/medicion";

const MASTER = POR_SERVICIO.find((s) => s.id === "master");

export default function ExpedienteDigital() {
  return (
    <section id="expediente-digital" className="scroll-mt-4 bg-[#003648] px-4 py-14 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion
          oscuro
          eyebrow="Por qué somos distintos"
          titulo="Tu expediente digital: todo por escrito, en un portal propio y en una app"
          intro="No somos un chat de WhatsApp con un abogado detrás. Cada documento, cada plazo y cada mensaje con tu asesor queda en tu expediente, con fecha y constancia de lectura. Entras con tu correo de Google desde el teléfono."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {BENEFICIOS.map((b) => (
            <article key={b.id} className="rounded-3xl border border-white/15 bg-white/[0.06] p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f09c48] text-[#003648]">
                <Icono nombre={b.icono} size={20} />
              </span>
              <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#96ccfc]">{b.eyebrow}</p>
              <h3 className="mt-1 font-serif text-lg leading-snug">{b.titulo}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                {b.puntos.map((p) => (
                  <li key={p} className="flex gap-2"><span className="text-[#f09c48]">✓</span>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl bg-white p-6 text-[#0a2a38]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0a5873]">{MASTER.etiqueta}</p>
            <h3 className="mt-1 font-serif text-xl text-[#003648]">{MASTER.titulo}</h3>
            <p className="mt-2 text-sm text-[#4b6b78]">{MASTER.intro}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {MASTER.puntos.map((p) => (
                <li key={p} className="flex gap-2"><span className="font-extrabold text-[#1d6a4a]">✓</span>{p}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-white/15 bg-white/[0.06] p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#96ccfc]">{EN_TU_HORA.eyebrow}</p>
            <h3 className="mt-1 font-serif text-lg leading-snug">{EN_TU_HORA.titulo}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {EN_TU_HORA.puntos.map((p) => (
                <li key={p.titulo} className="flex gap-3">
                  <span className="mt-0.5 text-[#f09c48]"><Icono nombre={p.icono} size={18} /></span>
                  <span><strong>{p.titulo}.</strong> <span className="text-white/75">{p.texto}</span></span>
                </li>
              ))}
            </ul>
            <a
              href="/plataforma"
              onClick={() => evento("master_todo_plataforma")}
              className="mt-5 inline-block border-b-2 border-[#f09c48] text-sm font-extrabold text-white"
            >
              Ver el portal por dentro →
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
