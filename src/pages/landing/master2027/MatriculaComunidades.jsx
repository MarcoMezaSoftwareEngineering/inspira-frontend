// src/pages/landing/master2027/MatriculaComunidades.jsx
// «¿Cuánto cuesta un máster al año en cada comunidad?»: mapa y tabla con la
// matrícula orientativa (config: MATRICULA), los mismos datos que la lámina 10
// del PDF. Reutilizable; hoy solo lo usa /servicios/master (en la landing no
// se añade sin confirmación del cliente).
//
// En móvil el mapa va sin cifras (a ese tamaño no se leen): manda la tabla.
import Icono from "../../../components/common/Icono";
import { viewBox, comunidades as GEOMETRIA, recuadroCanarias } from "./mapaEspana.data";
import { LISTAS, MATRICULA, eur, importeMatricula, numero } from "../../../config/paqueteMaster2027";
import { navigate } from "../../../services/navigate";
import { Chip, Descargo, TituloSeccion } from "./comunes";
import { tonoDe } from "./tonos";

const nombreDe = (id) => GEOMETRIA.find((c) => c.id === id)?.nombre || id;
const filaDe = (id) => MATRICULA.filas.find((f) => f.id === id) || null;

// Posición de cada cifra en el mapa (unidades del viewBox, medidas sobre la
// geometría como en el PDF). `claro`: texto blanco sobre petróleo. `lateral`:
// la cifra va fuera de la comunidad, con una línea guía. `partir`: dos líneas.
const ETIQUETAS = {
  andalucia: { x: 326, y: 610, claro: true },
  "castilla-y-leon": { x: 331, y: 200, claro: true },
  asturias: { x: 262, y: 54, claro: true },
  galicia: { x: 105, y: 95, claro: true, partir: true },
  "castilla-la-mancha": { x: 462, y: 452, claro: true },
  extremadura: { x: 243, y: 425, partir: true },
  aragon: { x: 640, y: 240 },
  "comunidad-valenciana": { x: 698, y: 405, lateral: true, guia: [625, 405, 690, 405] },
  cataluna: { x: 800, y: 300, lateral: true, partir: true, guia: [770, 228, 794, 290] },
  murcia: { x: 658, y: 605, lateral: true, guia: [580, 560, 650, 598] },
};

// Comunidades pequeñas: un número en el mapa que remite a la tabla.
const MARCAS = {
  cantabria: [395, 62],
  navarra: [568, 125],
  "pais-vasco": [492, 84],
  "la-rioja": [505, 150],
  madrid: [405, 318],
};

function lineasDe(f, partir) {
  const texto = importeMatricula(f);
  if (!partir) return [texto];
  if (f.max) return [`${numero(f.min)} –`, `${eur(f.max)}${f.ast ? "*" : ""}`];
  // «Lo fija cada / universidad»: la última palabra baja, para que la primera
  // línea no se salga del mapa por la derecha.
  const palabras = texto.split(" ");
  return [palabras.slice(0, -1).join(" "), palabras[palabras.length - 1]];
}

function Mapa() {
  return (
    <svg viewBox={viewBox} role="img" aria-label={MATRICULA.ariaMapa} className="mx-auto block h-auto w-full max-w-[600px]">
      <rect
        x={recuadroCanarias.x}
        y={recuadroCanarias.y}
        width={recuadroCanarias.width}
        height={recuadroCanarias.height}
        rx={10}
        fill="none"
        className="stroke-neutral-300"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      />
      {GEOMETRIA.map((c) => {
        const tono = tonoDe(filaDe(c.id)?.lista);
        if (c.id === "ceuta" || c.id === "melilla") {
          return <circle key={c.id} cx={c.etiqueta[0]} cy={c.etiqueta[1]} r={7} className={`${tono.relleno} stroke-neutral-400`} strokeWidth={1} />;
        }
        return (
          <path
            key={c.id}
            d={c.d}
            className={`${tono.relleno} stroke-white`}
            strokeWidth={1.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      <g className="max-sm:hidden" aria-hidden="true">
        {Object.entries(ETIQUETAS).map(([id, e]) => {
          const f = filaDe(id);
          if (!f) return null;
          const lineas = lineasDe(f, e.partir);
          return (
            <g key={id}>
              {e.guia && (
                <>
                  <line x1={e.guia[0]} y1={e.guia[1]} x2={e.guia[2]} y2={e.guia[3]} className="stroke-primary" strokeWidth={2} />
                  <circle cx={e.guia[0]} cy={e.guia[1]} r={4} className="fill-primary" />
                </>
              )}
              <text
                x={e.x}
                y={e.y}
                textAnchor={e.lateral ? "start" : "middle"}
                dominantBaseline="middle"
                className={`font-fraunces font-bold ${e.claro ? "fill-white" : "fill-primary"}`}
                fontSize={27}
              >
                {lineas.map((l, i) => (
                  <tspan key={l} x={e.x} dy={i === 0 ? 0 : 30}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        {Object.entries(MARCAS).map(([id, [x, y]]) => (
          <g key={id}>
            <circle cx={x} cy={y} r={19} className="fill-sun stroke-primary" strokeWidth={3} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" className="fill-primary font-fraunces font-extrabold" fontSize={24}>
              {filaDe(id)?.marca}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function MatriculaComunidades() {
  return (
    <section id="matricula" className="scroll-mt-24 border-t border-neutral-100 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={MATRICULA.eyebrow} titulo={MATRICULA.titulo} intro={MATRICULA.intro} />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <Mapa />
            <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-hidden="true">
              {LISTAS.map((l) => (
                <li key={l.id}>
                  <Chip className={tonoDe(l.id).chip}>{l.etiqueta}</Chip>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full border-collapse text-sm">
                <caption className="border-b border-neutral-200 bg-secondary-light px-4 py-3 text-left font-fraunces text-base font-bold text-primary">
                  {MATRICULA.tablaTitulo}
                </caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">{MATRICULA.columnas[0]}</th>
                    <th scope="col">{MATRICULA.columnas[1]}</th>
                  </tr>
                </thead>
                {LISTAS.map((l) => (
                  <tbody key={l.id}>
                    <tr>
                      <th colSpan={2} scope="colgroup" className="px-4 pb-1 pt-3 text-left">
                        <Chip className={tonoDe(l.id).chip}>{l.etiqueta}</Chip>
                      </th>
                    </tr>
                    {MATRICULA.filas
                      .filter((f) => f.lista === l.id)
                      .map((f) => (
                        <tr key={f.id} className="border-t border-neutral-100">
                          <th scope="row" className="px-4 py-2 text-left font-semibold text-primary">
                            {f.marca && (
                              <span
                                aria-hidden="true"
                                className="mr-2 hidden h-5 w-5 place-items-center rounded-full border-2 border-primary bg-sun align-middle text-[11px] font-extrabold leading-none text-primary sm:inline-grid"
                              >
                                {f.marca}
                              </span>
                            )}
                            {nombreDe(f.id)}
                            {f.rama && <span className="ml-1.5 text-xs font-normal text-neutral-500">· {MATRICULA.segunRama}</span>}
                          </th>
                          <td
                            className={`px-4 py-2 text-right font-fraunces font-bold text-primary ${
                              f.cadaUniversidad ? "text-xs sm:text-sm" : "whitespace-nowrap"
                            }`}
                          >
                            {importeMatricula(f)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">{MATRICULA.asterisco}</p>
          </div>
        </div>

        <Descargo className="mx-auto mt-6 max-w-3xl text-center">{MATRICULA.nota}</Descargo>
        <p className="mt-4 text-center">
          <a
            href={MATRICULA.calculadoraHref}
            onClick={(e) => {
              e.preventDefault();
              navigate(MATRICULA.calculadoraHref);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
          >
            <Icono nombre="euro" size={16} />
            {MATRICULA.calculadora}
          </a>
        </p>
      </div>
    </section>
  );
}
