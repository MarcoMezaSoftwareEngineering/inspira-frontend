// src/pages/landing/master2027/CtaFinal.jsx
// A14: CTA final y pie con la identificación del proveedor.
import Icono from "../../../components/common/Icono";
import { CTA_FINAL, PIE } from "../../../config/paqueteMaster2027";
import { BotonReserva, EnlaceWhatsapp, Eyebrow } from "./comunes";
import logo from "../../../assets/images/logo.png";
import fotoGraduada from "../../../assets/images/landing/master-2027/foto-graduada-birrete.webp";

export function CtaFinal() {
  return (
    <section id="reservar" className="scroll-mt-4 bg-primary px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-[1100px] items-center gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
        <img
          src={fotoGraduada}
          alt={CTA_FINAL.imagenAlt}
          width={900}
          height={600}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full rounded-3xl object-cover object-[48%_30%] lg:aspect-[4/5]"
        />
        <div>
          <Eyebrow oscuro>{CTA_FINAL.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-fraunces text-[26px] font-bold leading-tight text-white sm:text-4xl">
            {CTA_FINAL.titulo}
          </h2>
          <p className="mt-4 leading-relaxed text-white/85">{CTA_FINAL.texto}</p>
          <p className="mt-4 text-sm leading-relaxed text-sky">{CTA_FINAL.incluye}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {CTA_FINAL.pilares.map((p) => (
              <li
                key={p.texto}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/20"
              >
                <span className="text-sun">
                  <Icono nombre={p.icono} size={16} />
                </span>
                {p.texto}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-white/80">{CTA_FINAL.admision}</p>
          <div className="mt-8">
            <BotonReserva ubicacion="final" pulso grande ancho />
          </div>
          <p className="mt-4 text-xs text-white/75">{CTA_FINAL.microcopy}</p>
          <p className="mt-6">
            <EnlaceWhatsapp ubicacion="final" oscuro />
          </p>
        </div>
      </div>
    </section>
  );
}

export function Pie() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 pt-8 pb-[calc(var(--m27-barra)+2rem)] min-[380px]:px-5 sm:px-6">
      <div className="mx-auto max-w-[1100px] text-xs leading-relaxed text-neutral-600">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <img
              src={logo}
              alt="Inspira Legal"
              width={320}
              height={107}
              className="h-6 w-auto"
              loading="lazy"
              decoding="async"
            />
            <span>{PIE.marca}</span>
          </p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-4">
            {PIE.enlaces.map((e) => (
              <a key={e.href} href={e.href} className="font-semibold underline underline-offset-4 hover:text-primary">
                {e.texto}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-4">{PIE.identificacion}</p>
        <p className="mt-2">{PIE.lineaFinal}</p>
      </div>
    </footer>
  );
}
