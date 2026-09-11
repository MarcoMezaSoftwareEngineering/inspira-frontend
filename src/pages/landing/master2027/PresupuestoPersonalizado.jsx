// src/pages/landing/master2027/PresupuestoPersonalizado.jsx
// A6b: presupuesto personalizado, a todo el ancho y sin precio (cliente,
// 11/09/2026). Mismo CTA, UTM y eventos que el resto de la landing.
import Icono from "../../../components/common/Icono";
import { PERSONALIZADO } from "../../../config/paqueteMaster2027";
import { BotonReserva, Contexto, Eyebrow } from "./comunes";
import { TarjetaOtrosServicios } from "./OtrosServicios";

export default function PresupuestoPersonalizado({ onAbrirOtros }) {
  return (
    <section
      id="personalizado"
      aria-labelledby="personalizado-titulo"
      className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20"
    >
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl bg-primary px-5 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky/15 blur-2xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#FA943A,#F9C846)]"
        />
        <div className="relative">
          <Eyebrow oscuro>{PERSONALIZADO.eyebrow}</Eyebrow>
          <h2
            id="personalizado-titulo"
            className="mt-4 max-w-4xl font-fraunces text-[26px] font-bold leading-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.12]"
          >
            {PERSONALIZADO.titulo}
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-white/85 sm:text-lg">{PERSONALIZADO.intro}</p>

          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-sky">{PERSONALIZADO.ejemplosTitulo}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {PERSONALIZADO.ejemplos.map((e) => (
              <li
                key={e.titulo}
                className="flex items-start gap-3.5 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 sm:block sm:p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun text-primary">
                  <Icono nombre={e.icono} size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-fraunces text-lg font-bold leading-snug text-white sm:mt-3">{e.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80 sm:mt-1.5">{e.texto}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Contexto oscuro>{PERSONALIZADO.contexto}</Contexto>
            <BotonReserva ubicacion="personalizado" grande ancho />
          </div>
        </div>
      </div>
      <TarjetaOtrosServicios onAbrir={onAbrirOtros} />
    </section>
  );
}
