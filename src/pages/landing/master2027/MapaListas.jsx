// src/pages/landing/master2027/MapaListas.jsx
//
// Sección de planes (A5): mapa de España, lista de comunidades, leyenda y
// bloques de las tres listas. Un solo estado para los tres controles
// (`seleccion` = { comunidad, lista }, que vive en la página porque también lo
// abren «los más elegidos»): ningún control guarda nada por su cuenta.
//
// - Ratón: pasar el cursor un momento sobre una comunidad la selecciona.
// - Toque: las comunidades pequeñas tienen una zona de 44 px alrededor de su
//   etiqueta; si el dedo cae cerca de varias, gana la más cercana (círculos
//   fijos se solaparían entre La Rioja, Navarra y el País Vasco).
// - Teclado: cada comunidad es un botón (Tab, Enter o espacio); el select es
//   la vía equivalente para lector de pantalla.
import { useEffect, useRef } from "react";
import Icono from "../../../components/common/Icono";
import { viewBox, comunidades as GEOMETRIA, recuadroCanarias } from "./mapaEspana.data";
import {
  COMUNIDADES_FUERA,
  COMUNIDADES_INFO,
  LISTAS,
  MAPA,
  eur,
  listaPorId,
  planPorId,
} from "../../../config/paqueteMaster2027";
import { BotonReserva, Chip, Contexto, TituloSeccion } from "./comunes";
import { esEscritorio, evento, prefiereMenosMovimiento } from "./medicion";
import { TONO, tonoDe } from "./tonos";
import BloquesListas from "./BloquesListas";

const ETIQUETA_EN_MOVIL = new Set([
  "andalucia",
  "galicia",
  "castilla-y-leon",
  "comunidad-valenciana",
  "cataluna",
  "madrid",
]);
const ZONA_TOQUE_AMPLIADA = [
  "la-rioja",
  "cantabria",
  "asturias",
  "navarra",
  "pais-vasco",
  "murcia",
  "baleares",
  "ceuta",
  "melilla",
];
const CIUDADES = new Set(["ceuta", "melilla"]);
const RADIO_TOQUE_PX = 22;
const ANCHO_VIEWBOX = Number(viewBox.split(" ")[2]);

const grupoDe = (id) => (id ? COMUNIDADES_INFO[id]?.lista || "fuera" : null);
const geometriaDe = (id) => GEOMETRIA.find((c) => c.id === id) || null;
const nombreDe = (id) => geometriaDe(id)?.nombre || id;

// En móvil, 32 unidades del viewBox son unos 11 px en pantalla.
const CLASE_ETIQUETA =
  "pointer-events-none select-none fill-primary stroke-white font-bold [paint-order:stroke] [stroke-linejoin:round] [stroke-width:0.24em] text-[32px] sm:text-[19px]";

// Dónde se dibuja el nombre cuando el punto de mapaEspana.data.js lo hace
// chocar (esos puntos siguen sirviendo de centro para las zonas de toque).
// C. Valenciana es una franja estrecha: el nombre arranca sobre Castellón y
// sigue hacia el mar. Medido sobre la geometría del mapa.
const POSICION_ETIQUETA = {
  "comunidad-valenciana": { x: 664, y: 328, ancla: "start" },
  cantabria: { x: 388, y: 50 },
  "pais-vasco": { x: 495, y: 74 },
  "castilla-la-mancha": { x: 455, y: 460 },
};

function EtiquetaComunidad({ c, atenuada }) {
  const pos = POSICION_ETIQUETA[c.id];
  const [x, y] = pos ? [pos.x, pos.y] : c.etiqueta;
  const clases = `${CLASE_ETIQUETA} ${ETIQUETA_EN_MOVIL.has(c.id) ? "" : "max-sm:hidden"} ${atenuada ? "opacity-60" : ""}`;
  return (
    <text x={x} y={y} textAnchor={pos?.ancla || "middle"} dominantBaseline="central" className={clases}>
      {c.nombreCorto}
    </text>
  );
}

export default function MapaListas({ seleccion, onSeleccion }) {
  const svgRef = useRef(null);
  const panelRef = useRef(null);
  const temporizador = useRef(null);
  const tipoPuntero = useRef("mouse");

  useEffect(() => {
    const t = temporizador;
    return () => clearTimeout(t.current);
  }, []);

  const comunidadSel = seleccion.comunidad;
  const grupoActivo = grupoDe(comunidadSel) || seleccion.lista;
  const listaVisible = seleccion.lista || LISTAS[0].id;
  const geoSel = geometriaDe(comunidadSel);
  const info = comunidadSel ? COMUNIDADES_INFO[comunidadSel] : null;
  const listaSel = info ? listaPorId(info.lista) : null;
  const planesSel = info ? info.planes.map(planPorId).filter(Boolean) : [];

  function elegir(id, origen) {
    const lista = COMUNIDADES_INFO[id]?.lista || null;
    onSeleccion((prev) => {
      const siguiente = { comunidad: id, lista: lista || prev.lista };
      return prev.comunidad === siguiente.comunidad && prev.lista === siguiente.lista ? prev : siguiente;
    });
    if (!origen) return;
    evento("ads2027_mapa_comunidad", { comunidad: id, lista: lista || "fuera", origen });
    if (!esEscritorio()) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({
          block: "start",
          behavior: prefiereMenosMovimiento() ? "auto" : "smooth",
        })
      );
    }
  }

  function elegirLista(id) {
    onSeleccion((prev) => ({
      comunidad: grupoDe(prev.comunidad) === id ? prev.comunidad : null,
      lista: id,
    }));
    evento("ads2027_lista_tab", { lista: id });
  }

  function alEntrar(id, e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => elegir(id, null), 220);
  }

  function alSalir() {
    clearTimeout(temporizador.current);
  }

  function pequenaCercana(e) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM?.();
    if (!ctm) return null;
    const punto = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const escala = svg.getBoundingClientRect().width / ANCHO_VIEWBOX;
    const radio = RADIO_TOQUE_PX / Math.max(escala, 0.01);
    let mejor = null;
    let distancia = Infinity;
    ZONA_TOQUE_AMPLIADA.forEach((id) => {
      const [x, y] = geometriaDe(id).etiqueta;
      const d = Math.hypot(punto.x - x, punto.y - y);
      if (d < radio && d < distancia) {
        mejor = id;
        distancia = d;
      }
    });
    return mejor;
  }

  function alPulsarMapa(e) {
    const directa =
      e.target instanceof Element
        ? e.target.closest("[data-comunidad]")?.getAttribute("data-comunidad") || null
        : null;
    let id = directa;
    if (tipoPuntero.current !== "mouse") {
      const cercana = pequenaCercana(e);
      if (cercana && !ZONA_TOQUE_AMPLIADA.includes(directa)) id = cercana;
    }
    if (id) elegir(id, "mapa");
  }

  function propsComunidad(c) {
    const lista = listaPorId(COMUNIDADES_INFO[c.id]?.lista);
    return {
      "data-comunidad": c.id,
      role: "button",
      tabIndex: 0,
      "aria-label": `${c.nombre}, ${lista ? `Lista ${lista.numero} ${lista.nombre}` : MAPA.grupoFuera.toLowerCase()}`,
      "aria-pressed": comunidadSel === c.id,
      onPointerEnter: (e) => alEntrar(c.id, e),
      onPointerLeave: alSalir,
      onFocus: () => elegir(c.id, null),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          elegir(c.id, "mapa");
        }
      },
    };
  }

  return (
    <section
      id="planes"
      aria-labelledby="planes-titulo"
      className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion id="planes-titulo" eyebrow={MAPA.eyebrow} titulo={MAPA.titulo} />
        <p className="mx-auto mt-2 max-w-3xl text-center text-sm font-semibold text-primary-light">
          {MAPA.microcopy}
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-center leading-relaxed text-neutral-700">{MAPA.intro}</p>

        <div
          data-m27-zona="mapa"
          className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-x-10"
        >
          {/* Lista de comunidades: arriba en móvil; en escritorio, en la columna
              derecha sobre la leyenda, a la vista junto al panel */}
          <div className="lg:col-start-2 lg:row-start-1">
            <label htmlFor="m27-comunidad" className="block text-sm font-bold text-primary">
              {MAPA.selectEtiqueta}
            </label>
            <select
              id="m27-comunidad"
              value={comunidadSel || ""}
              onChange={(e) => e.target.value && elegir(e.target.value, "lista")}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base font-semibold text-primary focus:outline-none focus:ring-4 focus:ring-sky"
            >
              <option value="" disabled>
                {MAPA.selectPlaceholder}
              </option>
              {LISTAS.map((l) => (
                <optgroup key={l.id} label={l.etiqueta}>
                  {l.comunidades.map((id) => (
                    <option key={id} value={id}>
                      {nombreDe(id)}
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup label={MAPA.grupoFuera}>
                {COMUNIDADES_FUERA.map((id) => (
                  <option key={id} value={id}>
                    {nombreDe(id)}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Leyenda: los chips son a la vez las pestañas de los bloques */}
          <div role="group" aria-label={MAPA.ariaLeyenda} className="lg:col-start-2 lg:row-start-2">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {LISTAS.map((l) => {
                const activa = listaVisible === l.id;
                const tono = tonoDe(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={activa}
                    aria-controls={`bloque-${l.id}`}
                    onClick={() => elegirLista(l.id)}
                    className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${
                      activa
                        ? `border-transparent bg-secondary-light ring-2 ${tono.anillo}`
                        : "border-neutral-200 bg-white hover:bg-secondary-light"
                    }`}
                  >
                    <span aria-hidden="true" className={`mt-1 h-3.5 w-3.5 shrink-0 rounded ${tono.muestra}`} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold leading-snug text-primary">
                        {l.etiqueta} · <span className="whitespace-nowrap">{l.rango}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-600">{l.lineaDesde}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
              <span aria-hidden="true" className={`h-3 w-3 rounded ring-1 ring-neutral-300 ${TONO.fuera.muestra}`} />
              {MAPA.leyendaFuera}
            </p>
          </div>

          {/* Mapa */}
          <div className="lg:col-start-1 lg:row-span-3 lg:row-start-1">
            <svg
              ref={svgRef}
              viewBox={viewBox}
              role="group"
              aria-label={MAPA.ariaMapa}
              className="mx-auto block h-auto w-full max-w-[640px] touch-manipulation"
              onPointerDown={(e) => {
                tipoPuntero.current = e.pointerType || "mouse";
              }}
              onClick={alPulsarMapa}
            >
              <rect
                x={recuadroCanarias.x}
                y={recuadroCanarias.y}
                width={recuadroCanarias.width}
                height={recuadroCanarias.height}
                rx={14}
                fill="none"
                className="stroke-neutral-400"
                strokeWidth={1.2}
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />

              {GEOMETRIA.map((c) => {
                const grupo = grupoDe(c.id);
                const tono = tonoDe(grupo);
                const atenuada = !!grupoActivo && grupo !== grupoActivo;
                if (CIUDADES.has(c.id)) {
                  const [x, y] = c.etiqueta;
                  return (
                    <g key={c.id} {...propsComunidad(c)} className="cursor-pointer outline-none">
                      <circle
                        cx={x}
                        cy={y}
                        r={10}
                        className={`${tono.relleno} stroke-neutral-500`}
                        strokeWidth={1.2}
                        vectorEffect="non-scaling-stroke"
                        fillOpacity={atenuada ? 0.45 : 1}
                      />
                      <text
                        x={x + 18}
                        y={y}
                        dominantBaseline="central"
                        className={`${CLASE_ETIQUETA} max-sm:hidden ${atenuada ? "opacity-60" : ""}`}
                      >
                        {c.nombreCorto}
                      </text>
                    </g>
                  );
                }
                return (
                  <path
                    key={c.id}
                    d={c.d}
                    {...propsComunidad(c)}
                    className={`cursor-pointer outline-none transition-[fill-opacity] duration-200 ${tono.relleno} stroke-white`}
                    strokeWidth={1}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    fillOpacity={atenuada ? 0.4 : 1}
                  />
                );
              })}

              {geoSel &&
                (CIUDADES.has(geoSel.id) ? (
                  <circle
                    cx={geoSel.etiqueta[0]}
                    cy={geoSel.etiqueta[1]}
                    r={15}
                    fill="none"
                    className="stroke-sun"
                    strokeWidth={3}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                ) : (
                  <path
                    d={geoSel.d}
                    fill="none"
                    className="stroke-sun"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                ))}

              {GEOMETRIA.filter((c) => !CIUDADES.has(c.id) && c.id !== "canarias").map((c) => (
                <EtiquetaComunidad
                  key={c.id}
                  c={c}
                  atenuada={!!grupoActivo && grupoDe(c.id) !== grupoActivo}
                />
              ))}
              <text
                x={geometriaDe("canarias").etiqueta[0]}
                y={geometriaDe("canarias").etiqueta[1]}
                dominantBaseline="hanging"
                className="pointer-events-none select-none fill-neutral-700 text-[26px] font-bold sm:text-[17px]"
              >
                {MAPA.canarias}
              </text>
            </svg>
          </div>

          {/* Panel de la comunidad */}
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-3 lg:self-start">
            <div
              ref={panelRef}
              aria-live="polite"
              className="scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_18px_40px_-24px_rgba(1,52,70,0.35)] sm:p-6"
            >
              {!info ? (
                <p className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                  <span className="mt-0.5 shrink-0 text-primary-light">
                    <Icono nombre="mapa" size={20} />
                  </span>
                  {MAPA.panelVacio}
                </p>
              ) : (
                <>
                  <p className="font-fraunces text-xl font-bold text-primary">{nombreDe(comunidadSel)}</p>
                  <Chip className={`mt-2 ${listaSel ? tonoDe(listaSel.id).chip : TONO.fuera.chip}`}>
                    {listaSel ? listaSel.etiqueta : MAPA.grupoFuera}
                  </Chip>
                  {info.universidades && (
                    <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                      <span className="font-bold text-primary">{MAPA.universidadesRotulo}</span>{" "}
                      {info.universidades}
                    </p>
                  )}
                  {listaSel?.id === "premium" && (
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">{MAPA.privadas}</p>
                  )}
                  {info.texto && <p className="mt-3 text-sm leading-relaxed text-neutral-700">{info.texto}</p>}
                  {planesSel.length > 0 && (
                    <>
                      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-light">
                        {MAPA.planesRotulo}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {planesSel.map((p, i) => (
                          <li
                            key={p.id}
                            className={`flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 ${
                              i === 0 ? "border-2 border-accent bg-accent/[0.06]" : "border border-neutral-200"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-bold leading-snug text-primary">
                                {p.nombreCompleto}
                              </span>
                              <span className="block text-xs text-neutral-600">{p.alcance}</span>
                            </span>
                            <span className="shrink-0 whitespace-nowrap text-sm font-bold text-primary">
                              {eur(p.precio)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-5">
                    <Contexto>{MAPA.contexto}</Contexto>
                    <BotonReserva ubicacion="planes" ancho />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <BloquesListas listaVisible={listaVisible} />
      </div>
    </section>
  );
}
