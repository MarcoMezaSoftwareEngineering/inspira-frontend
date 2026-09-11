// src/pages/landing/master2027/Hero.jsx
// A1 (hero) y A2 (barra de prueba). Un solo titular, igual que el anuncio, y
// el botón a la vista sin desplazarse en 390 × 844.
import Icono from "../../../components/common/Icono";
import { HERO, PRUEBA } from "../../../config/paqueteMaster2027";
import { BotonReserva, CifraAnimada, Entrada } from "./comunes";
import { evento, irA } from "./medicion";
import fotoHero from "../../../assets/images/landing/master-2027/foto-hero-aeropuerto-pasaporte.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-4 min-[380px]:px-5 sm:px-6 lg:pb-20 lg:pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky/20 blur-2xl sm:h-[520px] sm:w-[520px]"
      />
      <div className="relative mx-auto grid max-w-[1100px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_45%] lg:gap-12">
        <Entrada>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary-light px-3.5 py-1.5 text-[13px] font-bold text-primary">
            <Icono nombre="birrete" size={16} />
            {HERO.pildora}
          </span>
          <h1 className="mt-4 font-fraunces text-[26px] font-bold leading-[1.22] text-primary min-[380px]:text-[28px] sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
            {HERO.tituloInicio}
            <span className="box-decoration-clone bg-[linear-gradient(transparent_60%,rgba(249,200,70,0.55)_60%)]">
              {HERO.tituloResaltado}
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-700 sm:text-lg">{HERO.subtitulo}</p>

          {/* Entre lg y xl la columna es estrecha: el enlace baja bajo el botón
              en vez de partirse en dos líneas. */}
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5 lg:flex-col lg:items-start lg:gap-3 xl:flex-row xl:items-center xl:gap-5">
            <BotonReserva ubicacion="hero" pulso ancho />
            <a
              href="#planes"
              onClick={(e) => {
                e.preventDefault();
                evento("ads2027_ver_planes");
                irA("planes");
              }}
              className="whitespace-nowrap text-center text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
            >
              {HERO.secundario}
            </a>
          </div>

          <a
            href="#fechas"
            onClick={(e) => {
              e.preventDefault();
              irA("fechas");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-sun bg-sun/25 px-3 py-1.5 text-xs font-bold text-primary hover:bg-sun/40 lg:text-[11px] xl:text-xs"
          >
            <Icono nombre="calendario" size={15} />
            {HERO.chipFecha}
          </a>

          <p className="mt-4 text-sm leading-relaxed text-neutral-700">{HERO.microcopy}</p>
        </Entrada>

        <div className="relative">
          <img
            src={fotoHero}
            alt={HERO.imagenAlt}
            width={1600}
            height={1064}
            fetchPriority="high"
            decoding="async"
            className="aspect-[4/3] w-full rounded-3xl object-cover object-[70%_50%] shadow-[0_30px_60px_-30px_rgba(1,52,70,0.45)] lg:aspect-[4/5]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden rounded-3xl bg-[linear-gradient(to_top,rgba(1,52,70,0.7),rgba(1,52,70,0.08)_55%,transparent)] lg:block"
          />
          <p className="absolute inset-x-5 bottom-5 hidden items-center gap-3 rounded-2xl bg-white/95 px-4 py-3.5 text-[13px] font-bold text-primary shadow-lg lg:flex xl:text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sun">
              <Icono nombre="birrete" size={20} />
            </span>
            {HERO.tarjeta}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BarraPrueba() {
  return (
    <section aria-label="Resultados y becas logradas" className="bg-primary px-4 py-10 min-[380px]:px-5 sm:px-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1fr_1.7fr]">
          {PRUEBA.cifras.map((c, i) => (
            <Entrada key={c.id} retraso={i * 80}>
              <div className="h-full rounded-2xl bg-white/[0.06] px-2 py-4 text-center ring-1 ring-white/10 sm:px-4">
                <p className="font-fraunces text-[22px] font-bold leading-none text-sun sm:text-4xl">
                  <CifraAnimada valor={c.valor} prefijo={c.prefijo} sufijo={c.sufijo} />
                </p>
                <p className="mt-2 text-[11px] leading-snug text-white/85 sm:text-sm">{c.etiqueta}</p>
              </div>
            </Entrada>
          ))}
          <Entrada retraso={240} className="col-span-3 lg:col-span-1">
            <div className="h-full rounded-2xl bg-white/[0.06] px-4 py-4 text-center ring-1 ring-white/10 lg:text-left">
              <p className="flex items-center justify-center gap-2 font-fraunces text-xl font-bold text-sun lg:justify-start">
                <Icono nombre="estrella" size={18} />
                {PRUEBA.becasTitulo}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/90">{PRUEBA.becasNombres}</p>
            </div>
          </Entrada>
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-white/75">{PRUEBA.pie}</p>
      </div>
    </section>
  );
}
