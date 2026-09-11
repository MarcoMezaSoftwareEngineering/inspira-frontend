// src/pages/landing/master2027/Equipo.jsx
// A12: personas reales y todas las opiniones reales (Google y Facebook), con
// su servicio real (visado). Las opiniones las pinta Opiniones.jsx, que
// comparten la portada y /servicios/master (fuente: config/testimonios.js).
import Icono from "../../../components/common/Icono";
import { EQUIPO } from "../../../config/paqueteMaster2027";
import { TituloSeccion } from "./comunes";
import Opiniones from "./Opiniones";
// Retratos recortados de las piezas de redes (carina-meza.jpg y
// sebastian-alpiste.jpg), sin el texto incrustado, que a este tamaño no se leía.
import fotoCarina from "../../../assets/images/landing/master-2027/equipo-carina-meza-retrato.webp";
import fotoSebastian from "../../../assets/images/landing/master-2027/equipo-sebastian-alpiste-retrato.webp";

const FOTOS = {
  carina: { src: fotoCarina, ancho: 256, alto: 320 },
  sebastian: { src: fotoSebastian, ancho: 230, alto: 288 },
};

export default function Equipo() {
  return (
    <section id="equipo" className="scroll-mt-4 bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={EQUIPO.eyebrow} titulo={EQUIPO.titulo} intro={EQUIPO.intro} />

        <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 sm:gap-6">
          {EQUIPO.personas.map((p) => (
            <figure key={p.id}>
              <img
                src={FOTOS[p.id].src}
                alt={p.alt}
                width={FOTOS[p.id].ancho}
                height={FOTOS[p.id].alto}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-2xl object-cover object-top shadow-md"
              />
              <figcaption className="mt-2 text-center">
                <span className="block text-sm font-bold text-primary">{p.nombre}</span>
                <span className="block text-xs text-neutral-600">{p.cargo}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {EQUIPO.razones.map((r) => (
            <div key={r.titulo} className="rounded-2xl bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sun">
                <Icono nombre={r.icono} size={20} />
              </span>
              <h3 className="mt-3 font-fraunces text-base font-bold text-primary">{r.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{r.texto}</p>
            </div>
          ))}
        </div>

        <Opiniones ubicacion="equipo" className="mt-14" />
      </div>
    </section>
  );
}
