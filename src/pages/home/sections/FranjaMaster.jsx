// src/pages/home/sections/FranjaMaster.jsx
// Franja destacada del máster, justo bajo el hero: el servicio estrella a la
// vista sin quitarle a la portada su mensaje de despacho multiservicio.
// Textos y precio: config/paqueteMaster2027Resumen.js.
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { HREF_PAQUETE, MASTER_EN_PORTADA } from "../../../config/paqueteMaster2027Resumen";

const F = MASTER_EN_PORTADA.franja;

export default function FranjaMaster() {
  return (
    <section aria-label={F.etiqueta} className="px-4 pb-2 pt-1 sm:px-6">
      <a
        href={HREF_PAQUETE}
        onClick={(e) => {
          e.preventDefault();
          navigate(HREF_PAQUETE);
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
        className="mx-auto flex max-w-[1180px] flex-col gap-3 rounded-2xl bg-primary px-5 py-4 text-white no-underline shadow-[0_18px_40px_-24px_rgba(1,52,70,0.6)] transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      >
        <span className="flex min-w-0 items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun text-primary">
            <Icono nombre="birrete" size={20} />
          </span>
          <span className="min-w-0 text-sm leading-snug">
            <span className="block font-fraunces text-base font-bold text-sun sm:text-lg">{F.etiqueta}</span>
            <span className="text-white/90">{F.texto}</span>
            <span className="text-white/60"> · </span>
            <b className="whitespace-nowrap font-bold text-white">{F.precio}</b>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white sm:self-auto">
          {F.enlace}
          <span aria-hidden="true">→</span>
        </span>
      </a>
    </section>
  );
}
