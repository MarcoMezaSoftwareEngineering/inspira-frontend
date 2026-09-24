// src/pages/landing/master/Herramientas.jsx
// Las herramientas gratuitas que Inspira publica y que ninguna otra
// consultora tiene: el mapa, el juego de cartas, el expediente de ejemplo y el
// test visa/estancia. Aquí van como puertas; la calculadora va incrustada en
// su propia sección.
import Icono from "../../../components/common/Icono";
import { RejillaVideos } from "../../../components/common/VideoVertical";
import { TituloSeccion } from "../master2027/comunes";
import { evento } from "../master2027/medicion";

const MEDIA = "https://www.inspira-legal.cloud/media";

const HERRAMIENTAS = [
  {
    id: "mapa",
    href: "/mapa-estudiar-en-espana",
    img: "/og/mapa-estudiar-en-espana.jpg",
    titulo: "El mapa de universidades y costos",
    texto: "46 ciudades, 47 universidades públicas, la matrícula de máster por comunidad y los casos de éxito de Inspira sobre el mapa.",
    accion: "Abrir el mapa",
  },
  {
    id: "juego",
    href: "/te-alcanza",
    icono: "euro",
    titulo: "¿Dónde te ves estudiando? · 6 cartas, 30 segundos",
    texto: "Seis ciudades, sus universidades, un máster de ejemplo con lo que cuesta. Deslizas y te quedas con las que te llamen.",
    accion: "Jugar",
  },
  {
    id: "test",
    href: "/visa-o-estancia",
    icono: "balanza",
    titulo: "¿Visa o estancia por estudios?",
    texto: "Cinco preguntas y te decimos qué vía te toca y cuánto dinero tienes que acreditar.",
    accion: "Hacer el test",
  },
  {
    id: "expediente",
    href: "/expediente",
    icono: "maletin",
    titulo: "Un expediente de visado, papel por papel",
    texto: "Los nueve documentos reconstruidos con datos tapados, y lo que hace que rechacen cada uno.",
    accion: "Ver el expediente",
  },
];

const VIDEOS = [
  { id: "1", src: `${MEDIA}/video/carina-1.mp4`, poster: `${MEDIA}/video/carina-1.jpg`, titulo: "¿Quieres estudiar un máster en España?" },
  { id: "3", src: `${MEDIA}/video/carina-3.mp4`, poster: `${MEDIA}/video/carina-3.jpg`, titulo: "Me rechazaron en la Complutense… y qué hicimos" },
  { id: "4", src: `${MEDIA}/video/carina-4.mp4`, poster: `${MEDIA}/video/carina-4.jpg`, titulo: "Admitida a un máster en Andalucía" },
  { id: "7", src: `${MEDIA}/video/carina-7.mp4`, poster: `${MEDIA}/video/carina-7.jpg`, titulo: "Beca AUIP para un máster en Valencia" },
  { id: "2", src: `${MEDIA}/video/carina-2.mp4`, poster: `${MEDIA}/video/carina-2.jpg`, titulo: "Máster + trabajo de 30 h a la semana" },
  { id: "8", src: `${MEDIA}/video/carina-8.mp4`, poster: `${MEDIA}/video/carina-8.jpg`, titulo: "Cuándo postular: las fechas que importan" },
];

export function VideosCarina() {
  return (
    <section id="videos" className="scroll-mt-4 bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[900px] text-center">
        <TituloSeccion eyebrow="Carina te lo cuenta" titulo="Un minuto por vídeo, sin humo" intro="Casos reales de admisión, una beca conseguida y lo que pasa cuando una universidad dice que no." />
        <div className="mt-8 md:grid md:grid-cols-3 md:gap-4 [&>.vv-rejilla]:md:contents">
          <RejillaVideos lista={VIDEOS} evento="master_todo_video" />
        </div>
      </div>
    </section>
  );
}

export default function Herramientas() {
  return (
    <section id="herramientas" className="scroll-mt-4 bg-[#f6fbff] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow="Herramientas gratuitas" titulo="Antes de pagar nada, mira, compara y juega" intro="Las publicamos porque queremos que llegues a la sesión sabiendo lo que quieres. Ninguna pide registro." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {HERRAMIENTAS.map((h) => (
            <a
              key={h.id}
              href={h.href}
              onClick={() => evento("master_todo_herramienta", { id: h.id })}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[#dbe9f5] bg-white transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {h.img ? (
                <img src={h.img} alt="" loading="lazy" width="1200" height="630" className="aspect-[1200/630] w-full object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#0a5873] to-[#003648] text-[#f09c48]">
                  <Icono nombre={h.icono} size={40} />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-lg leading-snug text-[#003648]">{h.titulo}</h3>
                <p className="mt-2 text-sm text-[#4b6b78]">{h.texto}</p>
                <span className="mt-4 text-sm font-extrabold text-[#003648] group-hover:underline">{h.accion} →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
