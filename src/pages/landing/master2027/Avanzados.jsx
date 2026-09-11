// src/pages/landing/master2027/Avanzados.jsx
// A6: paquetes avanzados estándar: Económicas + Intermedias, Premium e
// Infinity. El presupuesto personalizado va aparte (PresupuestoPersonalizado).
import Icono from "../../../components/common/Icono";
import { AVANZADOS, eur } from "../../../config/paqueteMaster2027";
import { BotonReserva, TituloSeccion } from "./comunes";
import ilusInfinito from "../../../assets/images/landing/master-2027/ilus-infinito.webp";

function TarjetaAvanzado({ plan }) {
  const esInfinity = plan.id === "infinity-1100";
  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl bg-white p-6 sm:p-7 ${
        plan.destacado ? "border-2 border-accent" : "border border-neutral-200"
      }`}
    >
      {plan.masElegido && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-sun px-3 py-0.5 text-xs font-bold text-primary shadow-sm">
          <Icono nombre="estrella" size={12} />
          {AVANZADOS.masElegido}
        </span>
      )}
      {esInfinity && (
        <img
          src={ilusInfinito}
          alt=""
          width={900}
          height={401}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute right-4 top-4 h-auto w-[110px] sm:w-[140px]"
        />
      )}
      <h3 className={`font-fraunces text-2xl font-bold text-primary ${esInfinity ? "pr-28 sm:pr-36" : ""}`}>
        {plan.nombre}
      </h3>
      <p className="mt-3">
        <span className="inline-block whitespace-nowrap rounded-full bg-primary px-4 py-1.5 font-fraunces text-2xl font-bold text-white">
          {eur(plan.precio)}
        </span>
      </p>
      <ul className="mt-5 space-y-2">
        {plan.puntos.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-sm font-semibold leading-snug text-primary">
            <span className="mt-0.5 shrink-0 text-accent-dark">
              <Icono nombre="escudo" size={16} />
            </span>
            {x}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm italic text-neutral-700">{plan.frase}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-light">{AVANZADOS.idealTitulo}</p>
      <ul className="mt-2 space-y-1.5">
        {plan.ideal.map((x) => (
          <li key={x} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
            <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {x}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Avanzados() {
  return (
    <section id="avanzados" className="scroll-mt-4 bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={AVANZADOS.eyebrow} titulo={AVANZADOS.titulo} intro={AVANZADOS.intro} />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {AVANZADOS.planes.map((p) => (
            <div id={`plan-${p.id}`} key={p.id} className="h-full scroll-mt-6">
              <TarjetaAvanzado plan={p} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <BotonReserva ubicacion="avanzados" ancho />
        </div>
      </div>
    </section>
  );
}
