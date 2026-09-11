// src/pages/landing/master2027/Rastreo.jsx
// A8: el Portal Inspira, con las funciones que existen y en su redacción
// verificada. El mock es HTML con textos genéricos (sin fechas ni nombres).
import Icono from "../../../components/common/Icono";
import { RASTREO } from "../../../config/paqueteMaster2027";
import { CierreCta, TituloSeccion } from "./comunes";
import fotoPortatil from "../../../assets/images/landing/master-2027/foto-manos-portatil.webp";

function MockPanel() {
  const { mock } = RASTREO;
  return (
    <div className="relative mx-3 -mt-12 space-y-3 sm:mx-8">
      <div className="rounded-2xl bg-white p-4 text-primary shadow-xl">
        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-600">{mock.rotulo}</p>
        <p className="mt-1.5 flex items-center gap-2 text-sm font-bold">
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-sun" />
          {mock.hoy}
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 text-primary shadow-xl">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Icono nombre="panel" size={16} />
          {mock.portal}
        </p>
        <ol className="mt-3 grid grid-cols-4 gap-1">
          {mock.pasos.map((paso, i) => (
            <li key={paso} className="flex flex-col items-center gap-1.5 text-center">
              <span
                aria-hidden="true"
                className={`h-3 w-full rounded-full ${i < 2 ? "bg-primary-light" : "bg-neutral-200"}`}
              />
              <span className="text-[11px] font-semibold leading-tight text-neutral-700">{paso}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Rastreo() {
  return (
    <section id="rastreo" className="scroll-mt-4 bg-primary px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div>
            <TituloSeccion
              oscuro
              centrado={false}
              eyebrow={RASTREO.eyebrow}
              titulo={RASTREO.titulo}
              intro={RASTREO.intro}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {RASTREO.puntos.map((p) => (
                <li
                  key={p.texto}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/90 ring-1 ring-white/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sun">
                    <Icono nombre={p.icono} size={19} />
                  </span>
                  {p.texto}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <img
              src={fotoPortatil}
              alt={RASTREO.imagenAlt}
              width={900}
              height={600}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
            <MockPanel />
          </div>
        </div>

        <CierreCta oscuro contexto={RASTREO.contexto} ubicacion="rastreo" />
      </div>
    </section>
  );
}
