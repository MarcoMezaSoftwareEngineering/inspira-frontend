// src/pages/servicios/master/PortalPropio.jsx
// «Portal propio» de /servicios/master: cuatro beneficios con capturas reales
// del portal, recortadas y desenfocadas (las de la versión corta del PDF
// comercial). Textos solo con funciones verificadas (config: PORTAL_PROPIO).
import { PORTAL_PROPIO } from "../../../config/paqueteMaster2027";
import { CierreCta, TituloSeccion } from "../../landing/master2027/comunes";
import capInicio from "../../../assets/images/servicios/master/portal-inicio.webp";
import capExpediente from "../../../assets/images/servicios/master/portal-expediente.webp";
import capInforme from "../../../assets/images/servicios/master/portal-informe.webp";
import capPlazos from "../../../assets/images/servicios/master/portal-plazos.webp";

const CAPTURAS = {
  inicio: { src: capInicio, ancho: 420, alto: 909 },
  expediente: { src: capExpediente, ancho: 420, alto: 909 },
  informe: { src: capInforme, ancho: 420, alto: 697 },
  plazos: { src: capPlazos, ancho: 420, alto: 909 },
};

export default function PortalPropio() {
  return (
    <section id="portal" className="scroll-mt-24 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={PORTAL_PROPIO.eyebrow} titulo={PORTAL_PROPIO.titulo} intro={PORTAL_PROPIO.intro} />

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
          {PORTAL_PROPIO.items.map((it) => {
            const c = CAPTURAS[it.id];
            return (
              <li key={it.id} className="flex flex-col">
                <div className="overflow-hidden rounded-[1.4rem] border-[5px] border-primary bg-secondary-light shadow-[0_18px_40px_-24px_rgba(1,52,70,0.55)]">
                  <img
                    src={c.src}
                    alt={it.alt}
                    width={c.ancho}
                    height={c.alto}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[9/13] w-full object-cover object-top"
                  />
                </div>
                <h3 className="mt-4 font-fraunces text-base font-bold leading-snug text-primary sm:text-lg">{it.titulo}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-700 sm:text-sm">{it.texto}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-center text-xs text-neutral-500">{PORTAL_PROPIO.nota}</p>
        <CierreCta contexto={PORTAL_PROPIO.contexto} ubicacion="portal_propio" />
      </div>
    </section>
  );
}
