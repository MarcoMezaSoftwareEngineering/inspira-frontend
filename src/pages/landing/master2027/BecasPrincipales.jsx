// src/pages/landing/master2027/BecasPrincipales.jsx
// A9: principales becas 2027-28, sin logos y sin prometer nada.
import Icono from "../../../components/common/Icono";
import { BECAS, DESCARGOS } from "../../../config/paqueteMaster2027";
import { CierreCta, Descargo, TituloSeccion } from "./comunes";
import { irA } from "./medicion";
import fotoEstudiante from "../../../assets/images/landing/master-2027/foto-estudiante-leyendo.webp";

const ESTILO_CHIP = {
  cruce: "bg-sky-light text-primary",
  lograda: "bg-sun/40 text-primary",
  orientacion: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300",
};

function TarjetaBeca({ beca }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="font-fraunces text-base font-bold leading-snug text-primary sm:text-lg">{beca.titulo}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {beca.chips.map((c) => (
          <span key={c.texto} className={`rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${ESTILO_CHIP[c.tipo]}`}>
            {c.texto}
          </span>
        ))}
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">{beca.texto}</p>
      <p className="mt-4 flex items-start gap-2 border-t border-neutral-100 pt-3 text-sm text-primary">
        <span className="mt-0.5 shrink-0 text-primary-light">
          <Icono nombre="calendario" size={16} />
        </span>
        <span>
          <span className="font-bold">{BECAS.ventanaRotulo}</span> {beca.ventana}
        </span>
      </p>
    </article>
  );
}

export default function BecasPrincipales() {
  return (
    <section id="becas" className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid items-center gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
          <img
            src={fotoEstudiante}
            alt={BECAS.imagenAlt}
            width={900}
            height={600}
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] w-full rounded-3xl object-cover object-[60%_40%] lg:aspect-[3/4]"
          />
          <TituloSeccion titulo={BECAS.titulo} intro={BECAS.subtitulo} centrado={false} />
        </div>

        {/* Carrusel en móvil, rejilla de 3 × 2 en escritorio */}
        <div
          role="region"
          aria-label={BECAS.ariaCarrusel}
          tabIndex={0}
          className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] min-[380px]:-mx-5 min-[380px]:px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {BECAS.tarjetas.map((b) => (
            <div key={b.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
              <TarjetaBeca beca={b} />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-secondary-light p-5 sm:p-6">
          <p className="flex items-center gap-2 font-fraunces text-lg font-bold text-primary">
            <Icono nombre="bandera" size={20} />
            {BECAS.paisTitulo}
          </p>
          <ul className="mt-3 space-y-2.5">
            {BECAS.paises.map((p) => (
              <li key={p.pais} className="text-sm leading-relaxed text-neutral-700">
                <span className="font-bold text-primary">{p.pais}</span> · {p.texto}
              </li>
            ))}
          </ul>
        </div>

        <Descargo className="mt-5">{DESCARGOS.becas}</Descargo>

        <p className="mt-5">
          <a
            href="#fechas"
            onClick={(e) => {
              e.preventDefault();
              irA("fechas");
            }}
            className="text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
          >
            {BECAS.enlaceFechas}
          </a>
        </p>

        <CierreCta contexto={BECAS.contexto} ubicacion="becas" />
      </div>
    </section>
  );
}
