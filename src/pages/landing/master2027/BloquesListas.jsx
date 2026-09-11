// src/pages/landing/master2027/BloquesListas.jsx
// Bloques de las tres listas con sus planes. En móvil se ve solo la lista del
// chip activo de la leyenda del mapa; en escritorio, las tres en columnas.
import Icono from "../../../components/common/Icono";
import {
  ADEMAS,
  DESCARGOS,
  INCLUYE,
  LISTAS,
  PLANES_ENCABEZADO,
  eur,
} from "../../../config/paqueteMaster2027";
import { BotonReserva, Descargo } from "./comunes";
import { tonoDe } from "./tonos";
import ilusCarpeta from "../../../assets/images/landing/master-2027/ilus-carpeta-archivos.webp";

function ListaMarcada({ items, icono = "escudo" }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((x) => (
        <li key={x} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
          <span className="mt-0.5 shrink-0 text-accent-dark">
            <Icono nombre={icono} size={16} />
          </span>
          {x}
        </li>
      ))}
    </ul>
  );
}

function TarjetaPlan({ plan }) {
  return (
    <article
      id={`plan-${plan.id}`}
      className={`relative scroll-mt-6 rounded-2xl p-5 ${
        plan.destacado
          ? "border-2 border-accent bg-accent/[0.06]"
          : "border border-neutral-200 bg-white"
      }`}
    >
      {plan.masElegido && (
        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-sun px-3 py-0.5 text-xs font-bold text-primary shadow-sm">
          <Icono nombre="estrella" size={12} />
          {PLANES_ENCABEZADO.masElegido}
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-fraunces text-base font-bold leading-snug text-primary">{plan.nombre}</h4>
          <p className="mt-0.5 text-sm italic text-neutral-600">{plan.alcance}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-base font-bold text-white">
          {eur(plan.precio)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">{plan.detalle}</p>
      {plan.desplegable && (
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-primary-light underline underline-offset-4 [&::-webkit-details-marker]:hidden">
            {plan.desplegable.titulo}
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">{plan.desplegable.texto}</p>
        </details>
      )}
    </article>
  );
}

export default function BloquesListas({ listaVisible }) {
  return (
    <div id="planes-listas" className="mt-14 scroll-mt-4">
      <div className="mx-auto max-w-3xl rounded-2xl bg-secondary-light p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <img
            src={ilusCarpeta}
            alt=""
            width={361}
            height={395}
            loading="lazy"
            decoding="async"
            className="h-auto w-[64px] shrink-0 sm:w-[96px]"
          />
          <div className="min-w-0">
            <p className="font-fraunces text-lg font-bold leading-snug text-primary sm:text-xl">
              {PLANES_ENCABEZADO.titulo}
            </p>
            <p className="mt-2 text-sm font-semibold text-primary-light">{PLANES_ENCABEZADO.sinTasas}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{PLANES_ENCABEZADO.moneda}</p>
          </div>
        </div>

        <details id="que-incluye" className="group mt-4 scroll-mt-6 rounded-xl border border-primary/10 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-primary [&::-webkit-details-marker]:hidden">
            {PLANES_ENCABEZADO.verIncluye}
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-light text-lg leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="grid gap-5 border-t border-primary/10 px-4 py-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
                {PLANES_ENCABEZADO.incluyeTitulo}
              </p>
              <ListaMarcada items={INCLUYE} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
                {PLANES_ENCABEZADO.ademasTitulo}
              </p>
              <ListaMarcada items={ADEMAS} icono="destello" />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
                {PLANES_ENCABEZADO.noIncluyeTitulo}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{DESCARGOS.precio}</p>
            </div>
          </div>
        </details>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-6">
        {LISTAS.map((l) => (
          <section
            key={l.id}
            id={`bloque-${l.id}`}
            aria-labelledby={`bloque-${l.id}-titulo`}
            className={`${listaVisible === l.id ? "block" : "hidden"} scroll-mt-6 lg:block`}
          >
            <div className={`rounded-2xl px-4 py-3.5 ${tonoDe(l.id).chip}`}>
              <h3 id={`bloque-${l.id}-titulo`} className="font-fraunces text-lg font-bold leading-snug">
                {l.cabecera}
              </h3>
              <p className="mt-0.5 text-sm font-semibold">{l.lineaDesde}</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-primary">{l.comunidadesTexto}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{l.frase}</p>
            <div className="mt-6 space-y-6">
              {l.planes.map((p) => (
                <TarjetaPlan key={p.id} plan={p} />
              ))}
            </div>
            <div className="mt-8 text-center lg:hidden">
              <BotonReserva ubicacion="planes" ancho />
            </div>
          </section>
        ))}
      </div>

      {/* En escritorio, un solo botón bajo las tres columnas: en una columna de
          350 px la etiqueta no cabe en una línea. */}
      <div className="mt-10 hidden text-center lg:block">
        <BotonReserva ubicacion="planes" />
      </div>

      <Descargo className="mx-auto mt-8 max-w-3xl text-center">{DESCARGOS.admision}</Descargo>
    </div>
  );
}
