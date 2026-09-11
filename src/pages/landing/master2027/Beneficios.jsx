// src/pages/landing/master2027/Beneficios.jsx
// A3: lo que hay detrás de cada plan.
import Icono from "../../../components/common/Icono";
import { BENEFICIOS } from "../../../config/paqueteMaster2027";
import { CierreCta, Entrada, TituloSeccion } from "./comunes";
import { irA } from "./medicion";
import ilusDocumentos from "../../../assets/images/landing/master-2027/ilus-documentos-lupa.webp";
import ilusPortapapeles from "../../../assets/images/landing/master-2027/ilus-portapapeles-lapiz.webp";

const IMAGENES = {
  documentos: { src: ilusDocumentos, ancho: 460, alto: 466 },
  portapapeles: { src: ilusPortapapeles, ancho: 836, alto: 524 },
};

export default function Beneficios() {
  return (
    <section id="beneficios" className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={BENEFICIOS.eyebrow} titulo={BENEFICIOS.titulo} intro={BENEFICIOS.intro} />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-6">
          {BENEFICIOS.tarjetas.map((t, i) => {
            const imagen = t.imagen ? IMAGENES[t.imagen] : null;
            return (
              <Entrada key={t.id} retraso={i * 90} className="h-full">
                <article className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_14px_34px_-26px_rgba(1,52,70,0.45)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {!imagen && (
                        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sun">
                          <Icono nombre={t.icono} size={22} />
                        </span>
                      )}
                      <h3 className="font-fraunces text-lg font-bold leading-snug text-primary">{t.titulo}</h3>
                    </div>
                    {imagen && (
                      <img
                        src={imagen.src}
                        alt=""
                        width={imagen.ancho}
                        height={imagen.alto}
                        loading="lazy"
                        decoding="async"
                        className="-mr-2 -mt-2 h-auto w-[92px] shrink-0 sm:w-[120px]"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">{t.texto}</p>
                </article>
              </Entrada>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {BENEFICIOS.chips.map((c) => (
            <a
              key={c.texto}
              href={`#${c.destino}`}
              onClick={(e) => {
                e.preventDefault();
                irA(c.destino);
              }}
              className="inline-flex items-center justify-center gap-2 text-center rounded-full border border-primary/15 bg-secondary-light px-3.5 py-2 text-[13px] font-semibold text-primary hover:border-primary/40"
            >
              <Icono nombre={c.icono} size={16} />
              {c.texto}
            </a>
          ))}
        </div>

        <CierreCta ubicacion="beneficios" />
      </div>
    </section>
  );
}
