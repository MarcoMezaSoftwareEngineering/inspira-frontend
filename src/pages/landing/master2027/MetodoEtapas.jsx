// src/pages/landing/master2027/MetodoEtapas.jsx
// A7: el pago por etapas del Método Inspira, la sesión diagnóstico y el
// simulador de pagos.
import Icono from "../../../components/common/Icono";
import { METODO } from "../../../config/paqueteMaster2027";
import { BotonReserva, TituloSeccion } from "./comunes";
import SimuladorPagos from "./SimuladorPagos";
import ilusAsesora from "../../../assets/images/landing/master-2027/ilus-asesora-auriculares.webp";

export default function MetodoEtapas() {
  return (
    <section id="metodo" className="scroll-mt-4 bg-white px-4 pt-16 min-[380px]:px-5 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={METODO.eyebrow} titulo={METODO.titulo} intro={METODO.intro} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-12">
          {/* Tarjeta de la sesión */}
          <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-white sm:p-6">
            <img
              src={ilusAsesora}
              alt=""
              width={839}
              height={478}
              loading="lazy"
              decoding="async"
              className="-mt-1 mb-4 h-auto w-[140px]"
            />
            <p className="font-fraunces text-lg font-bold leading-snug text-sun">{METODO.sesion.titulo}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{METODO.sesion.gancho}</p>            <ul className="mt-4 space-y-2.5">
              {METODO.sesion.incluye.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-sm leading-snug text-white/90">
                  <span className="mt-0.5 shrink-0 text-sun">
                    <Icono nombre="escudo" size={16} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <BotonReserva ubicacion="metodo" ancho />
            </div>
          </div>

          {/* Línea de cuatro hitos */}
          <div>
            <ol className="relative space-y-6 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-0.5 before:bg-primary/15">
              {METODO.hitos.map((h) => (
                <li key={h.n} className="relative flex items-start gap-4">
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-light text-primary ring-4 ring-white">
                    <Icono nombre={h.icono} size={22} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
                      {h.n} · {h.etapa}
                    </p>
                    <p className="mt-1 font-bold leading-snug text-primary">{h.importe}</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-700">{h.cuando}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 space-y-2 rounded-2xl bg-secondary-light p-4">
              {METODO.notas.map((n) => (
                <p key={n} className="text-sm leading-relaxed text-neutral-700">
                  {n}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SimuladorPagos />
        </div>
      </div>
    </section>
  );
}
