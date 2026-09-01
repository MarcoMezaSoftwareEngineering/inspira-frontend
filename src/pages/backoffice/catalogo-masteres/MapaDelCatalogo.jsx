// Cómo encajan las cuatro pantallas del catálogo.
//
// La confusión era razonable y era culpa del diseño: había un sitio llamado
// «Universidades», otro llamado «Catálogo de másteres» y un «Sistematizador»,
// y ninguno decía qué relación tenía con los otros. Parecían tres catálogos
// compitiendo cuando en realidad son un catálogo, dos capas de contexto y una
// puerta de entrada.
//
// Esta tira se pinta arriba de las cuatro, con el paso actual marcado. Explicar
// el flujo en una nota suelta no sirve: nadie la lee dos meses después. Tiene
// que estar donde se trabaja.
import { navigate } from "../../../services/navigate";

const PASOS = [
  {
    id: "universidades",
    href: "/backoffice/universidades",
    orden: "Dónde",
    titulo: "Universidades",
    texto: "Las 47 fichas: ciudad, comunidad, precio del crédito, ranking, enlaces.",
    papel: "contexto",
  },
  {
    id: "tracker",
    href: "/backoffice/tracker-universidades",
    orden: "Cuándo",
    titulo: "Plazos",
    texto: "Las fases de preinscripción de cada universidad, curso a curso.",
    papel: "contexto",
  },
  {
    id: "sistematizador",
    href: "/backoffice/sistematizador",
    orden: "Cómo entra",
    titulo: "Sistematizador",
    texto: "La puerta de carga: pegas la oferta de una universidad y entra al catálogo.",
    papel: "puerta",
  },
  {
    id: "masteres",
    href: "/backoffice/masteres",
    orden: "Qué se recomienda",
    titulo: "Buscador de másteres",
    texto: "El catálogo final. Cada máster con su universidad, su precio y su plazo ya resueltos.",
    papel: "salida",
  },
];

const TONO = {
  contexto: "border-neutral-200 bg-white",
  puerta: "border-amber-200 bg-[#FEFBF5]",
  salida: "border-[#1D6A4A]/30 bg-[#F4FAF6]",
};

export default function MapaDelCatalogo({ activo }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 sm:p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] font-mono text-neutral-400 mb-2">
        Un solo catálogo, cuatro pantallas
      </p>

      {/* En pantalla ancha van en fila, como el flujo que son. En el móvil se
          apilan: cuatro columnas de 90px no se leen. */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {PASOS.map((p) => {
          const on = p.id === activo;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => !on && navigate(p.href)}
              className={`text-left rounded-lg border px-3 py-2.5 transition-all ${
                on
                  ? "border-[#1A3557] bg-white shadow-sm ring-1 ring-[#1A3557]/15"
                  : `${TONO[p.papel]} hover:border-neutral-400 cursor-pointer`
              }`}
            >
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-neutral-400">
                {p.orden}
              </p>
              <p className={`text-[13px] font-semibold mt-0.5 ${
                on ? "text-[#1A3557]" : "text-neutral-800"}`}>
                {p.titulo}
                {on && <span className="ml-1.5 text-[10px] font-normal text-neutral-400">estás aquí</span>}
              </p>
              <p className="text-[11.5px] text-neutral-600 leading-snug mt-1">{p.texto}</p>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed mt-2.5">
        Los másteres cuelgan de su universidad y heredan de ella la ciudad, el precio del
        crédito y las fechas. Por eso no hay dos catálogos: sólo uno, mirado desde la
        universidad o desde el máster según lo que se necesite en ese momento.
      </p>
    </div>
  );
}
