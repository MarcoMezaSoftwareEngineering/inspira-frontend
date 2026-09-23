// src/pages/mapa/MapaInteractivo.jsx
// El mapa, con identidad propia de Inspira:
// - Relieve plano por capas: sombra sobre el mar, canto del color de la lista
//   y cara superior; la comunidad sube al pasar por encima y al elegirla.
// - Mar en el cielo de la marca con patrón de puntos de carta náutica y olas
//   que corren despacio.
// - Burbujas de ciudades (área proporcional a sus másteres oficiales) que
//   crecen al entrar y cambian de tamaño con transición al filtrar por rama.
// - Ruta punteada con el avión de la marca desde Lima hasta la ciudad elegida
//   o, sin nada elegido, hasta las ciudades de los casos de éxito.
// - Zoom suave a la comunidad elegida y onda al elegirla.
//
// Interacción:
// - Ratón: pasar por encima levanta la comunidad y enseña el tooltip; clic
//   elige; la rueda acerca y aleja sobre el puntero; arrastrar desplaza; el
//   doble clic acerca.
// - Toque: las comunidades pequeñas tienen una zona de 22 px alrededor de su
//   centro, como en el mapa de la landing. El pellizco acerca y aleja. Con el
//   mapa acercado, un dedo lo desplaza; sin acercar, un dedo hace scroll de la
//   página, que es lo que se espera al leer.
// - Teclado: cada comunidad es un botón (Tab, Enter o espacio). Las burbujas
//   de una comunidad entran en la tabulación cuando está abierta; la lista
//   textual de la página cubre el resto. Los mandos de zoom son botones.
// - prefers-reduced-motion: sin zoom animado, sin burbujas que crecen, sin
//   olas, sin ondas y con el avión quieto a mitad de ruta.
//
// La geometría (pages/landing/master2027/mapaEspana.data.js) la carga la
// página con import dinámico y llega aquí ya resuelta. Cada comunidad se
// define una vez en <defs> y se pinta con <use>: tres capas sin triplicar el
// trazado.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import IconoMapa from "./IconosMapa";
import { proyectar } from "./proyeccion";
import { masteresDe, mejorRanking, prefiereMenosMovimiento } from "./indice";
import { NOCHE, SOL, tonoDe } from "./tonosMapa";
import { T, etiquetaLista, importeMatricula, numero, plural, textoRanking } from "./mapaTextos";

const CIUDADES_AUTONOMAS = new Set(["ceuta", "melilla"]);
const PEQUENAS = ["la-rioja", "cantabria", "asturias", "navarra", "pais-vasco", "murcia", "baleares", "ceuta", "melilla"];
const DURACION_ZOOM = 560;
// Sin nada elegido el avión vuela a las ciudades con más casos. Una ruta por
// caso cruzaba España de líneas en cuanto pasaron de cinco: el avión es un
// gesto de marca, no un dato, y tres bastan para contar de dónde a dónde.
const RUTAS_SIN_FOCO = 3;
// Arriba a la derecha de la burbuja de la ciudad: no tapa el nombre, que se
// dibuja debajo, ni el borde de la comunidad, que queda a la izquierda. Es el
// sitio preferido; si ya está ocupado se prueban los demás en este orden.
const ANGULOS_CUMULO = [-45, -135, 45, 135, -90, 90, 0, 180].map((g) => (g * Math.PI) / 180);
const RADIO_TOQUE_PX = 22;
const PREFIJO = "mapa-geo";
// Cuánto se puede acercar y alejar a mano, medido sobre el encuadre de España.
const ZOOM_MIN = 0.92;
const ZOOM_MAX = 9;
// A partir de aquí el dedo desplaza el mapa en vez de hacer scroll de página.
const ZOOM_PAN_TACTIL = 1.08;
// Un gesto que mueve menos de esto sigue contando como clic.
const UMBRAL_CLIC_PX = 7;
// Avión del set de iconos de la marca (components/common/Icono.jsx), en 24×24.
const AVION =
  "M10.2 13.8 3 12V9.5l2 .6 1.5 1.2 3-.6L6 4.5l2.5.5 4 5 4.6-1c1.3-.3 2.4.3 2.6 1.2.2.9-.5 1.8-1.8 2.2l-4.6 1.3-2 6.3-2.4.5 1.3-6.7Z";

const suavizar = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const f1 = (n) => n.toFixed(1);
const acotar = (n, min, max) => Math.min(max, Math.max(min, n));

/** viewBox que enmarca una caja con margen y la proporción del mapa. */
function encuadre(caja, aspecto, minAncho) {
  const margen = 0.16;
  let w = Math.max(caja.width * (1 + 2 * margen), minAncho);
  let h = Math.max(caja.height * (1 + 2 * margen), minAncho / aspecto);
  if (w / h > aspecto) h = w / aspecto;
  else w = h * aspecto;
  const cx = caja.x + caja.width / 2;
  const cy = caja.y + caja.height / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}

function estrella(cx, cy, rExt, rInt) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? rInt : rExt;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}

/** Arco desde Lima (fuera del mapa, a la izquierda) hasta un punto. */
function rutaDesdeLima(vb, destino) {
  const o = [vb[0] - vb[2] * 0.05, vb[1] + vb[3] * 0.8];
  const fin = [destino.x, destino.y];
  const dist = Math.hypot(fin[0] - o[0], fin[1] - o[1]);
  const c = [(o[0] + fin[0]) / 2, Math.min(o[1], fin[1]) - dist * 0.3];
  return { d: `M${f1(o[0])} ${f1(o[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(fin[0])} ${f1(fin[1])}`, o, c, fin };
}

function puntoEnRuta({ o, c, fin }, t) {
  const u = 1 - t;
  const x = u * u * o[0] + 2 * u * t * c[0] + t * t * fin[0];
  const y = u * u * o[1] + 2 * u * t * c[1] + t * t * fin[1];
  const dx = 2 * u * (c[0] - o[0]) + 2 * t * (fin[0] - c[0]);
  const dy = 2 * u * (c[1] - o[1]) + 2 * t * (fin[1] - c[1]);
  return { x, y, angulo: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/**
 * El avión y, detrás, tres puntos de estela que recorren la misma curva un
 * poco más tarde: se lee el sentido del viaje sin dibujar nada más.
 */
function Avion({ ruta, escala, reducir, espera }) {
  const cuerpo = (
    <g transform={`scale(${escala.toFixed(4)}) translate(-12 -12)`}>
      <path d={AVION} fill={NOCHE} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  );
  if (reducir) {
    const p = puntoEnRuta(ruta, 0.7);
    return <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.angulo)})`}>{cuerpo}</g>;
  }
  // Espera en Lima (fuera de la vista), vuela y se queda un momento en destino.
  const salida = Math.min(espera, 0.3);
  const tiempos = `0;${salida.toFixed(2)};${(salida + 0.6).toFixed(2)};1`;
  return (
    <g>
      {[0.14, 0.09, 0.05].map((r, i) => (
        <g key={r}>
          <circle r={escala * 12 * r * 2.6} fill={SOL} opacity={0.55 - i * 0.14} />
          <animateMotion
            dur="3.6s"
            repeatCount="indefinite"
            calcMode="linear"
            keyPoints="0;0;1;1"
            keyTimes={tiempos}
            begin={`${-(i + 1) * 0.12}s`}
            path={ruta.d}
          />
        </g>
      ))}
      {cuerpo}
      <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;0;1;1" keyTimes={tiempos} path={ruta.d} />
    </g>
  );
}

const alTeclado = (onElegir, tipo, id) => (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onElegir(tipo, id);
  }
};

function Tooltip({ hover, indice, geoPorId, casos, filtros }) {
  if (!hover) return null;
  const noCumple = (conjunto, id) => filtros.activos && !conjunto.has(id);

  if (hover.tipo === "comunidad") {
    const c = indice.comunidades.get(hover.id);
    if (!c) {
      return (
        <>
          <p className="mapa-titular text-sm font-bold">{geoPorId.get(hover.id)?.nombre}</p>
          <p className="text-white/75">{T.fuera}</p>
        </>
      );
    }
    return (
      <>
        <p className="mapa-titular text-sm font-bold">{c.nombre}</p>
        <p className="text-[#96CCFC]">{etiquetaLista(indice.listas.get(c.lista))}</p>
        <p className="mt-1">
          {c.precioAnual
            ? `Matrícula de un máster al año: ≈ ${numero(Math.round(c.precioAnual.tipico))} €`
            : `Matrícula al año: ${importeMatricula(c.matricula)}`}
        </p>
        <p>
          {plural(c.universidades, "universidad", "universidades")} · {plural(masteresDe(c, filtros.rama), "máster oficial", "másteres oficiales")}
        </p>
        {noCumple(filtros.comunidades, c.id) && <p className="mt-1 text-[#F09C48]">{T.noCumple}</p>}
      </>
    );
  }

  if (hover.tipo === "ciudad") {
    const c = indice.ciudades.get(hover.id);
    if (!c) return null;
    const n = masteresDe(c, filtros.rama);
    const mejor = mejorRanking(indice, [...c.universidades, ...c.campus]);
    return (
      <>
        <p className="mapa-titular text-sm font-bold">{c.nombre}</p>
        <p className="text-white/75">{indice.comunidades.get(c.comunidad)?.nombre}</p>
        <p className="mt-1">
          {c.universidades.length
            ? `${plural(c.universidades.length, "universidad", "universidades")} · ${plural(n, "máster oficial", "másteres oficiales")}`
            : "Campus universitario"}
        </p>
        {c.campus.length > 0 && (
          <p className="text-white/75">
            Campus de {c.campus.map((id) => indice.universidades.get(id)?.sigla).filter(Boolean).join(", ")}
          </p>
        )}
        {mejor && (
          <p className="mt-1 text-[#96CCFC]">
            {mejor.u.sigla}: {textoRanking(mejor.u.ranking)}
          </p>
        )}
        {noCumple(filtros.ciudades, c.id) && <p className="mt-1 text-[#F09C48]">{T.noCumple}</p>}
      </>
    );
  }

  if (hover.tipo === "cumulo") {
    const dentro = casos.filter((k) => k.ciudadId === hover.id);
    if (!dentro.length) return null;
    const c = indice.ciudades.get(hover.id);
    return (
      <>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#F09C48]">{T.leyendaCumulo}</p>
        <p className="mapa-titular text-sm font-bold">
          {plural(dentro.length, "caso de éxito", "casos de éxito")} en {c?.nombre || ""}
        </p>
        <p>{dentro.slice(0, 4).map((k) => k.nombre).join(", ")}{dentro.length > 4 ? "…" : ""}</p>
      </>
    );
  }

  if (hover.tipo === "caso") {
    const k = casos.find((x) => x.id === hover.id);
    if (!k) return null;
    return (
      <>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#F09C48]">{T.leyendaCaso}</p>
        <p className="mapa-titular text-sm font-bold">
          {k.nombre}
          {k.destacado ? ` · ${k.destacado}` : ""}
        </p>
        <p>{k.universidad}</p>
      </>
    );
  }
  return null;
}

/** Mandos de zoom: acercar, alejar y volver al encuadre que toca. */
function Mandos({ zoom, manual, onZoom, onCentrar }) {
  const boton =
    "mapa-mando mov-toque flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#003648] ring-1 ring-[#CFE6FD] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] disabled:opacity-40";
  return (
    <div className="mapa-mandos absolute right-3 top-3 z-[2] flex flex-col gap-1.5 sm:top-[3.25rem]">
      <button type="button" className={boton} onClick={() => onZoom(1.55)} disabled={zoom >= ZOOM_MAX - 0.01} aria-label="Acercar el mapa">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button type="button" className={boton} onClick={() => onZoom(1 / 1.55)} disabled={zoom <= ZOOM_MIN + 0.01} aria-label="Alejar el mapa">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        className={`${boton} ${manual ? "mapa-mando-vivo" : ""}`}
        onClick={onCentrar}
        disabled={!manual}
        aria-label="Centrar el mapa"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21" />
        </svg>
      </button>
    </div>
  );
}

export default function MapaInteractivo({
  geo,
  indice,
  foco,
  filtros,
  capas,
  casos,
  onElegir,
  onToda,
  recomendadas = [],
  resaltada = null,
}) {
  const base = useMemo(() => geo.viewBox.split(/\s+/).map(Number), [geo.viewBox]);
  const aspecto = base[2] / base[3];
  const geoPorId = useMemo(() => new Map(geo.comunidades.map((g) => [g.id, g])), [geo]);
  const conRelieve = useMemo(() => geo.comunidades.filter((g) => !CIUDADES_AUTONOMAS.has(g.id)), [geo]);

  const envoltorio = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const caminos = useRef(new Map());
  const vbRef = useRef(base);
  const tipoPuntero = useRef("mouse");
  const animacion = useRef(0);
  // Punteros vivos sobre el mapa: uno desplaza, dos pellizcan.
  const punteros = useRef(new Map());
  const gesto = useRef(null);
  const [vb, setVb] = useState(base);
  const [ancho, setAncho] = useState(640);
  const [hover, setHover] = useState(null);
  // Vista movida a mano: hasta que se centre, el foco no vuelve a encuadrar.
  const [manual, setManual] = useState(false);
  // Onda al elegir: { x, y, n } — n hace que cada elección vuelva a animar.
  const [onda, setOnda] = useState(null);
  const reducir = prefiereMenosMovimiento();

  // Ancho real en píxeles: burbujas, trazos y textos se dibujan a tamaño de pantalla.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const medir = () => setAncho(el.getBoundingClientRect().width || 640);
    medir();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", medir);
      return () => window.removeEventListener("resize", medir);
    }
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Deja la vista donde se le diga, sin animar, y corta cualquier animación. */
  const fijarVista = useCallback((v) => {
    cancelAnimationFrame(animacion.current);
    vbRef.current = v;
    setVb(v);
  }, []);

  /** Lleva la vista hasta `destino` con la curva de siempre. */
  const animarHasta = useCallback(
    (destino) => {
      const inicio = vbRef.current;
      if (inicio.every((v, i) => Math.abs(v - destino[i]) < 0.5)) return;
      if (prefiereMenosMovimiento()) {
        fijarVista(destino);
        return;
      }
      cancelAnimationFrame(animacion.current);
      const t0 = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / DURACION_ZOOM);
        const e = suavizar(k);
        const v = inicio.map((a, i) => a + (destino[i] - a) * e);
        vbRef.current = v;
        setVb(v);
        if (k < 1) animacion.current = requestAnimationFrame(paso);
      };
      animacion.current = requestAnimationFrame(paso);
    },
    [fijarVista]
  );

  /** Encuadre que le toca al foco actual (o a toda España). */
  const encuadreDelFoco = useCallback(() => {
    const id = foco.comunidad;
    if (id === "canarias") return encuadre(geo.recuadroCanarias, aspecto, 300);
    if (id && CIUDADES_AUTONOMAS.has(id)) {
      const g = geoPorId.get(id);
      if (g) return encuadre({ x: g.etiqueta[0], y: g.etiqueta[1], width: 0, height: 0 }, aspecto, 160);
      return base;
    }
    if (id) {
      const el = caminos.current.get(id);
      if (el) {
        try {
          return encuadre(el.getBBox(), aspecto, 170);
        } catch {
          return base;
        }
      }
    }
    return base;
  }, [foco.comunidad, geo, aspecto, geoPorId, base]);

  // Zoom a la comunidad elegida (o vuelta a toda España). Un zoom hecho a
  // mano manda hasta que se toque «centrar»: si no, el mapa se le escapaba de
  // las manos a quien lo estaba mirando de cerca.
  useEffect(() => {
    if (manual) return undefined;
    animarHasta(encuadreDelFoco());
    return () => cancelAnimationFrame(animacion.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco.comunidad, base, aspecto, geo, geoPorId, manual]);

  // Elegir algo deja una onda en su sitio, como el toque en el agua.
  const marcarOnda = useCallback(
    (x, y) => {
      if (prefiereMenosMovimiento() || !Number.isFinite(x)) return;
      setOnda((o) => ({ x, y, n: (o?.n || 0) + 1 }));
    },
    [setOnda]
  );

  const ppu = ancho / vb[2];
  const px = (n) => n / Math.max(ppu, 0.0001);
  const zoom = base[2] / vb[2];
  const escalaPantalla = Math.min(1, Math.max(0.55, ancho / 640));
  const factorZoom = Math.min(1.25, Math.pow(zoom, 0.3));
  const radioPx = (n) => (n > 0 ? 3.5 + Math.sqrt(n) * 1.05 : 3.5) * escalaPantalla * factorZoom;
  const rama = filtros.rama;
  const activa = foco.comunidad;
  const listaDe = (id) => indice.comunidades.get(id)?.lista;

  /** Coordenadas del mapa bajo un evento de puntero. */
  const aCoordenadas = useCallback((cliente) => {
    const ctm = svgRef.current?.getScreenCTM?.();
    if (!ctm) return null;
    return new DOMPoint(cliente.x, cliente.y).matrixTransform(ctm.inverse());
  }, []);

  /**
   * Acerca o aleja dejando quieto el punto `centro` (coordenadas del mapa).
   * El encuadre no se puede ir más allá de media España fuera de la vista.
   */
  const zoomEn = useCallback(
    (centro, factor) => {
      const v = vbRef.current;
      const anchoMin = base[2] / ZOOM_MAX;
      const anchoMax = base[2] / ZOOM_MIN;
      const w = acotar(v[2] / factor, anchoMin, anchoMax);
      if (Math.abs(w - v[2]) < 0.01) return;
      const h = w / aspecto;
      const k = w / v[2];
      const p = centro || { x: v[0] + v[2] / 2, y: v[1] + v[3] / 2 };
      const holgura = base[2] * 0.5;
      const x = acotar(p.x - (p.x - v[0]) * k, base[0] - holgura, base[0] + base[2] + holgura - w);
      const y = acotar(p.y - (p.y - v[1]) * k, base[1] - holgura, base[1] + base[3] + holgura - h);
      fijarVista([x, y, w, h]);
      setManual(w < anchoMax - 0.5 || Math.abs(x - base[0]) > 1);
    },
    [base, aspecto, fijarVista]
  );

  /** Desplaza la vista en píxeles de pantalla. */
  const mover = useCallback(
    (dxPx, dyPx) => {
      const v = vbRef.current;
      const k = v[2] / Math.max(ancho, 1);
      const holgura = base[2] * 0.5;
      const x = acotar(v[0] - dxPx * k, base[0] - holgura, base[0] + base[2] + holgura - v[2]);
      const y = acotar(v[1] - dyPx * k, base[1] - holgura, base[1] + base[3] + holgura - v[3]);
      fijarVista([x, y, v[2], v[3]]);
      setManual(true);
    },
    [ancho, base, fijarVista]
  );

  const centrar = useCallback(() => {
    setManual(false);
    animarHasta(encuadreDelFoco());
  }, [animarHasta, encuadreDelFoco]);

  // La rueda acerca y aleja: hay que registrarlo a mano porque React lo pone
  // como pasivo y entonces no se puede evitar el scroll de la página.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const alaRueda = (e) => {
      if (tipoPuntero.current === "touch") return;
      e.preventDefault();
      const paso = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomEn(aCoordenadas({ x: e.clientX, y: e.clientY }), Math.exp(-acotar(paso, -240, 240) * 0.0022));
    };
    el.addEventListener("wheel", alaRueda, { passive: false });
    return () => el.removeEventListener("wheel", alaRueda);
  }, [zoomEn, aCoordenadas]);

  const puntos = useMemo(
    () =>
      indice.datos.ciudades
        .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lon))
        .map((c) => {
          const [x, y] = proyectar(c.lat, c.lon);
          return { c, x, y, n: masteresDe(c, rama) };
        })
        // Las grandes primero: las pequeñas quedan encima y se pueden pulsar.
        .sort((a, b) => b.n - a.n),
    [indice, rama]
  );
  const puntoPorId = useMemo(() => new Map(puntos.map((p) => [p.c.id, p])), [puntos]);
  // Los casos de éxito se agrupan por ciudad: un cúmulo por ciudad con su
  // cuenta dentro. Antes se abrían en abanico alrededor de la burbuja, y el
  // abanico da la vuelta completa al séptimo hermano: con doce en Valencia las
  // estrellas se pisaban unas a otras y la prueba social quedaba en un borrón.
  // La cuenta dice lo mismo de un vistazo y no crece con la lista; los nombres
  // salen en el panel al elegir la ciudad (Fichas.jsx, FichaCiudad).
  // Ordenados de más a menos para que las rutas desde Lima tomen las de arriba.
  const cumulos = useMemo(() => {
    const m = new Map();
    for (const k of casos) {
      const punto = puntoPorId.get(k.ciudadId);
      if (!punto) continue;
      const c = m.get(k.ciudadId);
      if (c) c.casos.push(k);
      else m.set(k.ciudadId, { ciudadId: k.ciudadId, punto, casos: [k] });
    }
    return [...m.values()].sort((a, b) => b.casos.length - a.casos.length);
  }, [casos, puntoPorId]);

  // Dónde va la marca de cada cúmulo. Se recorren de mayor a menor y cada uno
  // se queda con el primer ángulo que no choque con los ya colocados: en
  // Galicia, Santiago y A Coruña caen tan juntos que con un ángulo fijo sus
  // píldoras se montaban una encima de otra. Es una colocación voraz, no la
  // óptima, pero es estable —el orden no depende de la vista— y basta para
  // que no se toquen.
  const marcas = useMemo(() => {
    // Las mismas fórmulas que px() y radioPx(), aquí dentro: esas se rehacen
    // en cada pintado y como dependencia obligarían a recalcular siempre.
    const aVb = (n) => n / Math.max(ppu, 0.0001);
    const radio = (n) => (n > 0 ? 3.5 + Math.sqrt(n) * 1.05 : 3.5) * escalaPantalla * factorZoom;
    const puestas = [];
    const salida = new Map();
    for (const c of cumulos) {
      const p = c.punto;
      // Todo en unidades del viewBox, que es donde viven p.x y p.y: las
      // medidas de pantalla se convierten con px() o las distancias no
      // significarían lo mismo a un zoom que a otro.
      const rc = capas.ciudades ? aVb(radio(p.n)) : 0;
      const rm = aVb(9.5 * Math.sqrt(escalaPantalla));
      const solo = c.casos.length === 1;
      const alto = rm * 2;
      const ancho = solo ? alto : alto * 1.06 + String(c.casos.length).length * alto * 0.56 * 0.66;
      const d = (rc + rm * 0.35) * 1.02;
      let elegido = null;
      for (const a of ANGULOS_CUMULO) {
        const mx = p.x + Math.cos(a) * d;
        const my = p.y + Math.sin(a) * d;
        const choca = puestas.some(
          (q) =>
            Math.abs(q.mx - mx) < (q.ancho + ancho) / 2 + aVb(2) &&
            Math.abs(q.my - my) < (q.alto + alto) / 2 + aVb(2)
        );
        if (!choca) {
          elegido = { mx, my, ancho, alto };
          break;
        }
      }
      // Si todo está ocupado se queda en su sitio preferido: tapar algo es
      // mejor que desplazar la marca lejos de la ciudad a la que pertenece.
      if (!elegido) {
        elegido = { mx: p.x + Math.cos(ANGULOS_CUMULO[0]) * d, my: p.y + Math.sin(ANGULOS_CUMULO[0]) * d, ancho, alto };
      }
      puestas.push(elegido);
      salida.set(c.ciudadId, elegido);
    }
    return salida;
  }, [cumulos, capas.ciudades, escalaPantalla, factorZoom, ppu]);

  const destinoRuta = foco.ciudad ? puntoPorId.get(foco.ciudad) : null;
  const rutas = destinoRuta
    ? [{ id: "foco", punto: destinoRuta, principal: true }]
    : !foco.tipo && capas.casos
      ? cumulos.slice(0, RUTAS_SIN_FOCO).map((c) => ({ id: c.ciudadId, punto: c.punto, principal: false }))
      : [];

  const opacidadComunidad = (id) => {
    if (filtros.activos && !filtros.comunidades.has(id)) return 0.3;
    if (recomendadas.length && !recomendadas.includes(id)) return 0.45;
    if (activa && activa !== id) return 0.55;
    if (resaltada && resaltada !== id) return 0.62;
    return 1;
  };

  function alMover(e) {
    if (gesto.current) return;
    if (e.pointerType === "touch") return;
    const destino = e.target instanceof Element ? e.target.closest("[data-tipo]") : null;
    const tipo = destino?.getAttribute("data-tipo") || null;
    const id = destino?.getAttribute("data-id") || null;
    setHover((prev) => (prev?.tipo === tipo && prev?.id === id ? prev : tipo ? { tipo, id } : null));
    const tip = tooltipRef.current;
    const caja = envoltorio.current?.getBoundingClientRect();
    if (!tip || !caja) return;
    const x = e.clientX - caja.left;
    const y = e.clientY - caja.top;
    const izquierda = x > caja.width - 250;
    const arriba = y > caja.height - 110;
    tip.style.transform = `translate(${x + (izquierda ? -14 : 14)}px, ${y + (arriba ? -14 : 14)}px) translate(${
      izquierda ? "-100%" : "0"
    }, ${arriba ? "-100%" : "0"})`;
  }

  function pequenaCercana(p) {
    if (!p) return null;
    const radio = RADIO_TOQUE_PX / Math.max(ppu, 0.01);
    let mejor = null;
    let distancia = Infinity;
    for (const id of PEQUENAS) {
      const g = geoPorId.get(id);
      if (!g) continue;
      const d = Math.hypot(p.x - g.etiqueta[0], p.y - g.etiqueta[1]);
      if (d < radio && d < distancia) {
        mejor = id;
        distancia = d;
      }
    }
    return mejor;
  }

  /* ── Gestos: arrastrar y pellizcar ─────────────────────────────────── */

  const centroPunteros = () => {
    const vivos = [...punteros.current.values()];
    const x = vivos.reduce((s, p) => s + p.x, 0) / vivos.length;
    const y = vivos.reduce((s, p) => s + p.y, 0) / vivos.length;
    const d = vivos.length > 1 ? Math.hypot(vivos[0].x - vivos[1].x, vivos[0].y - vivos[1].y) : 0;
    return { x, y, d };
  };

  function alBajar(e) {
    tipoPuntero.current = e.pointerType || "mouse";
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const tactil = e.pointerType === "touch";
    // Con un dedo y el mapa sin acercar se deja hacer scroll de la página: el
    // gesto se sigue anotando, porque ese mismo toque puede ser una elección.
    const arrastrable = !(tactil && punteros.current.size === 1 && zoom < ZOOM_PAN_TACTIL);
    if (arrastrable) e.currentTarget.setPointerCapture?.(e.pointerId);
    const c = centroPunteros();
    const destino = e.target instanceof Element ? e.target.closest("[data-tipo]") : null;
    gesto.current = {
      x: c.x,
      y: c.y,
      d: c.d,
      recorrido: 0,
      arrastrable,
      cancelado: false,
      tipo: destino?.getAttribute("data-tipo") || null,
      id: destino?.getAttribute("data-id") || null,
      cliente: { x: e.clientX, y: e.clientY },
    };
    if (tactil) setHover(null);
  }

  function alArrastrar(e) {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;
    const c = centroPunteros();
    const dx = c.x - g.x;
    const dy = c.y - g.y;
    g.recorrido += Math.hypot(dx, dy);
    if (g.arrastrable) {
      if (punteros.current.size > 1 && g.d > 12 && c.d > 12) {
        zoomEn(aCoordenadas({ x: c.x, y: c.y }), c.d / g.d);
      } else if (dx || dy) {
        mover(dx, dy);
      }
    }
    g.x = c.x;
    g.y = c.y;
    g.d = c.d;
  }

  /**
   * Elegir al soltar, no en el `click`: al capturar el puntero para poder
   * arrastrar, el navegador manda el clic al propio lienzo y ya no se sabe
   * sobre qué comunidad se soltó. El destino se guarda al pulsar.
   */
  function alSoltar(e) {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size > 0) {
      const c = centroPunteros();
      if (gesto.current) {
        gesto.current.x = c.x;
        gesto.current.y = c.y;
        gesto.current.d = c.d;
      }
      return;
    }
    const g = gesto.current;
    gesto.current = null;
    if (!g || g.cancelado || g.recorrido > UMBRAL_CLIC_PX) return;
    let { tipo, id } = g;
    const p = aCoordenadas(g.cliente);
    // Un cúmulo abre la ficha de su ciudad: agrupa a su gente, no es un lugar
    // aparte. Se despacha aquí y no en el marcador para que el toque y el
    // teclado sigan el mismo camino que el ratón.
    if (tipo === "cumulo") tipo = "ciudad";
    if (tipoPuntero.current !== "mouse" && zoom < 1.6 && tipo !== "ciudad" && tipo !== "caso") {
      const cercana = pequenaCercana(p);
      if (cercana) {
        tipo = "comunidad";
        id = cercana;
      }
    }
    if (!tipo || !id) return;
    if (p) marcarOnda(p.x, p.y);
    onElegir(tipo, id);
  }

  function alCancelar(e) {
    if (gesto.current) gesto.current.cancelado = true;
    alSoltar(e);
  }

  function alDobleClic(e) {
    if (tipoPuntero.current === "touch") return;
    zoomEn(aCoordenadas({ x: e.clientX, y: e.clientY }), 1.9);
  }

  const canarias = geoPorId.get("canarias");
  const alzaActiva = `translate(0 ${f1(-px(4))})`;
  // Con el mapa acercado el dedo lo desplaza; sin acercar, hace scroll.
  const tactoCss = zoom >= ZOOM_PAN_TACTIL ? "none" : "pan-y";

  return (
    <div ref={envoltorio} className="relative">
      <svg
        ref={svgRef}
        viewBox={vb.map((n) => n.toFixed(2)).join(" ")}
        role="group"
        aria-label={T.ariaMapa}
        className="mapa-lienzo block h-auto w-full select-none"
        style={{
          aspectRatio: `${base[2]} / ${base[3]}`,
          touchAction: tactoCss,
          cursor: gesto.current ? "grabbing" : "grab",
          "--mapa-alza": `${(-px(3)).toFixed(2)}px`,
          "--mapa-trazo-foco": `${px(3).toFixed(2)}px`,
        }}
        onPointerDown={alBajar}
        onPointerMove={(e) => {
          alArrastrar(e);
          alMover(e);
        }}
        onPointerUp={alSoltar}
        onPointerCancel={alCancelar}
        onPointerLeave={() => setHover(null)}
        onDoubleClick={alDobleClic}
      >
        <defs>
          <pattern id={`${PREFIJO}-puntos`} width={16} height={16} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={2} r={1.1} fill={NOCHE} fillOpacity={0.07} />
          </pattern>
          {/* Olas del mar: el patrón entero corre despacio hacia la derecha. */}
          <pattern id={`${PREFIJO}-olas`} width={44} height={30} patternUnits="userSpaceOnUse">
            <path d="M0 14q11 -7 22 0t22 0" fill="none" stroke={NOCHE} strokeOpacity={0.05} strokeWidth={1.6} strokeLinecap="round" />
            <path d="M-22 29q11 -7 22 0t22 0t22 0" fill="none" stroke={NOCHE} strokeOpacity={0.05} strokeWidth={1.4} strokeLinecap="round" />
            {!reducir && (
              <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="44 0" dur="14s" repeatCount="indefinite" />
            )}
          </pattern>
          <radialGradient id={`${PREFIJO}-brillo`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {conRelieve.map((g) => (
            <path key={g.id} id={`${PREFIJO}-${g.id}`} d={g.d} />
          ))}
        </defs>

        <rect x={-900} y={-900} width={2800} height={2600} fill={`url(#${PREFIJO}-olas)`} pointerEvents="none" />
        <rect x={-900} y={-900} width={2800} height={2600} fill={`url(#${PREFIJO}-puntos)`} pointerEvents="none" />
        {/* Destello sobre el mar, arriba a la derecha, donde está el sol de la marca */}
        <ellipse
          className="mapa-destello"
          cx={base[0] + base[2] * 0.82}
          cy={base[1] + base[3] * 0.12}
          rx={base[2] * 0.34}
          ry={base[3] * 0.26}
          fill={`url(#${PREFIJO}-brillo)`}
          pointerEvents="none"
        />
        <rect
          x={geo.recuadroCanarias.x}
          y={geo.recuadroCanarias.y}
          width={geo.recuadroCanarias.width}
          height={geo.recuadroCanarias.height}
          rx={14}
          fill="#ffffff"
          fillOpacity={0.45}
          stroke={NOCHE}
          strokeOpacity={0.35}
          strokeWidth={px(1)}
          strokeDasharray={`${f1(px(6))} ${f1(px(5))}`}
          pointerEvents="none"
        />

        {/* Relieve: sombra sobre el mar y canto del color de cada lista */}
        <g aria-hidden="true" pointerEvents="none">
          {conRelieve.map((g) => (
            <use
              key={`sombra-${g.id}`}
              href={`#${PREFIJO}-${g.id}`}
              fill={NOCHE}
              fillOpacity={0.12}
              transform={`translate(${f1(px(4))} ${f1(px(11))})`}
            />
          ))}
        </g>
        <g aria-hidden="true" pointerEvents="none">
          {conRelieve.map((g) => (
            <use
              key={`canto-${g.id}`}
              href={`#${PREFIJO}-${g.id}`}
              className="mapa-canto"
              fill={tonoDe(listaDe(g.id)).canto}
              fillOpacity={opacidadComunidad(g.id)}
              transform={`translate(0 ${f1(px(5))})`}
            />
          ))}
        </g>

        {/* Cara superior: las comunidades que se pueden elegir */}
        <g>
          {geo.comunidades.map((g) => {
            const c = indice.comunidades.get(g.id);
            const lista = c ? indice.listas.get(c.lista) : null;
            const tono = tonoDe(lista?.id);
            const comunes = {
              "data-tipo": "comunidad",
              "data-id": g.id,
              role: "button",
              tabIndex: 0,
              "aria-label": `${g.nombre}. ${etiquetaLista(lista)}${c ? `. ${plural(c.universidades, "universidad", "universidades")}` : ""}`,
              "aria-pressed": activa === g.id,
              onKeyDown: alTeclado(onElegir, "comunidad", g.id),
              fill: tono.relleno,
              fillOpacity: opacidadComunidad(g.id),
            };
            if (CIUDADES_AUTONOMAS.has(g.id)) {
              return (
                <circle
                  key={g.id}
                  cx={g.etiqueta[0]}
                  cy={g.etiqueta[1]}
                  r={px(6)}
                  className="mapa-comunidad"
                  stroke={NOCHE}
                  strokeOpacity={0.5}
                  strokeWidth={px(1)}
                  {...comunes}
                />
              );
            }
            return (
              <use
                key={g.id}
                ref={(el) => {
                  if (el) caminos.current.set(g.id, el);
                }}
                href={`#${PREFIJO}-${g.id}`}
                className="mapa-comunidad"
                stroke="#ffffff"
                strokeWidth={px(1.2)}
                strokeLinejoin="round"
                transform={activa === g.id ? alzaActiva : undefined}
                {...comunes}
              />
            );
          })}
        </g>

        {/* La comunidad señalada desde la lista de texto: mismo trazo que la elegida, sin elegirla */}
        {resaltada && resaltada !== activa && geoPorId.get(resaltada) && !CIUDADES_AUTONOMAS.has(resaltada) && (
          <use
            href={`#${PREFIJO}-${resaltada}`}
            fill="none"
            stroke={SOL}
            strokeWidth={px(2.6)}
            strokeLinejoin="round"
            strokeDasharray={`${f1(px(7))} ${f1(px(4))}`}
            className="mapa-contorno-vivo"
            pointerEvents="none"
          />
        )}

        {activa && geoPorId.get(activa) && !CIUDADES_AUTONOMAS.has(activa) && (
          <use
            href={`#${PREFIJO}-${activa}`}
            fill="none"
            stroke={SOL}
            strokeWidth={px(3.5)}
            strokeLinejoin="round"
            transform={alzaActiva}
            pointerEvents="none"
          />
        )}

        {/* Onda del toque: se dibuja donde se ha elegido y se apaga sola */}
        {onda && !reducir && (
          <g key={onda.n} pointerEvents="none" aria-hidden="true">
            <circle className="mapa-onda" cx={onda.x} cy={onda.y} r={px(10)} fill="none" stroke={SOL} strokeWidth={px(3)} />
            <circle
              className="mapa-onda"
              style={{ animationDelay: "160ms" }}
              cx={onda.x}
              cy={onda.y}
              r={px(10)}
              fill="none"
              stroke={SOL}
              strokeWidth={px(2)}
            />
          </g>
        )}

        {canarias && (
          <text
            x={canarias.etiqueta[0]}
            y={canarias.etiqueta[1]}
            dominantBaseline="hanging"
            fontSize={px(12)}
            fill={NOCHE}
            fillOpacity={0.7}
            className="mapa-titular pointer-events-none font-bold"
          >
            {T.canarias}
          </text>
        )}

        {/* Rutas desde Lima */}
        {rutas.map((r, i) => {
          const tr = rutaDesdeLima(vb, r.punto);
          const guion = px(r.principal ? 7 : 5);
          return (
            <g key={`ruta-${r.id}`} pointerEvents="none" aria-hidden="true">
              <path
                d={tr.d}
                fill="none"
                stroke={SOL}
                strokeWidth={px(r.principal ? 2.6 : 1.8)}
                strokeLinecap="round"
                strokeOpacity={r.principal ? 1 : 0.8}
                strokeDasharray={`${guion.toFixed(2)} ${(guion * 0.9).toFixed(2)}`}
              >
                {!reducir && (
                  <animate attributeName="stroke-dashoffset" from="0" to={(-guion * 1.9).toFixed(2)} dur="0.9s" repeatCount="indefinite" />
                )}
              </path>
              <Avion ruta={tr} escala={px(r.principal ? 24 : 17) / 24} reducir={reducir} espera={r.principal ? 0 : i * 0.14} />
            </g>
          );
        })}

        {/* Ciudades */}
        {capas.ciudades && (
          <g>
            {puntos.map(({ c, x, y, n }, i) => {
              const rpx = radioPx(n);
              const r = px(rpx);
              const fuera = filtros.activos && !filtros.ciudades.has(c.id);
              // Con el filtro de ranking, las ciudades que cumplen llevan un anillo Sol.
              const resaltadaQS = !!filtros.ranking && !fuera;
              const soloCampus = c.masteres === 0;
              return (
                <g
                  key={c.id}
                  data-tipo="ciudad"
                  data-id={c.id}
                  role="button"
                  tabIndex={activa === c.comunidad ? 0 : -1}
                  aria-label={`${c.nombre}: ${soloCampus ? "campus" : plural(n, "máster oficial", "másteres oficiales")}`}
                  aria-pressed={foco.ciudad === c.id}
                  onKeyDown={alTeclado(onElegir, "ciudad", c.id)}
                  className="mapa-burbuja cursor-pointer"
                  style={{ animationDelay: `${Math.min(i * 18, 420)}ms` }}
                >
                  <g opacity={fuera ? 0.25 : 1}>
                    <circle cx={x} cy={y} r={Math.max(r, px(11))} fill="transparent" />
                    {resaltadaQS && (
                      <circle cx={x} cy={y} r={r + px(3.2)} fill="none" stroke={SOL} strokeWidth={px(3.2)} className="pointer-events-none" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      className="mapa-burbuja-borde"
                      fill="#ffffff"
                      fillOpacity={soloCampus ? 0.6 : 0.96}
                      stroke={NOCHE}
                      strokeOpacity={soloCampus ? 0.5 : 1}
                      strokeWidth={px(soloCampus ? 1.2 : 1.8)}
                    />
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {capas.ciudades &&
          destinoRuta &&
          (() => {
            const r = px(radioPx(destinoRuta.n));
            return (
              <g pointerEvents="none" aria-hidden="true">
                {!reducir && (
                  <circle className="mapa-pulso" cx={destinoRuta.x} cy={destinoRuta.y} r={r} fill="none" stroke={SOL} strokeWidth={px(3)} />
                )}
                <circle cx={destinoRuta.x} cy={destinoRuta.y} r={r + px(3.5)} fill="none" stroke={SOL} strokeWidth={px(3)} />
              </g>
            );
          })()}

        {/* Cifras de las burbujas grandes y nombres de la comunidad abierta, encima de todas las
            burbujas. Un nombre que chocaría con otro nombre o con otra burbuja prueba el otro lado
            y, si tampoco cabe, se omite (sigue en el tooltip y en la ficha). */}
        {capas.ciudades &&
          (() => {
            const etiquetas = [];
            const cifras = [];
            for (const { c, x, y, n } of puntos) {
              const rpx = radioPx(n);
              if (c.masteres > 0 && rpx >= 13 && !(filtros.activos && !filtros.ciudades.has(c.id))) {
                const tam = rpx >= 20 ? 11 : 9.5;
                const texto = numero(n);
                const mitadAncho = px(texto.length * tam * 0.34 + 2);
                const mitadAlto = px(tam * 0.62);
                const caja = { x0: x - mitadAncho, x1: x + mitadAncho, y0: y - mitadAlto, y1: y + mitadAlto };
                // Las ciudades grandes van primero: una cifra que pisaría otra mayor no se escribe.
                if (cifras.some((o) => caja.x0 < o.x1 && caja.x1 > o.x0 && caja.y0 < o.y1 && caja.y1 > o.y0)) continue;
                cifras.push(caja);
                etiquetas.push({ clave: `n-${c.id}`, x, y, ancla: "middle", tam, halo: 2.5, texto, nombre: false });
              }
            }
            if (activa) {
              const deLaComunidad = puntos.filter((p) => p.c.comunidad === activa);
              const cajas = deLaComunidad.map(({ x, y, n }) => {
                const r = px(radioPx(n));
                return { x0: x - r, x1: x + r, y0: y - r, y1: y + r };
              });
              const choca = (b) => cajas.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
              for (const { c, x, y, n } of deLaComunidad) {
                const separacion = px(radioPx(n) + 4);
                const ancho = px(c.nombre.length * 7.4 + 4);
                const medio = px(8);
                const derecha = { x0: x + separacion, x1: x + separacion + ancho, y0: y - medio, y1: y + medio };
                const izquierda = { x0: x - separacion - ancho, x1: x - separacion, y0: y - medio, y1: y + medio };
                const caja = !choca(derecha) ? derecha : !choca(izquierda) ? izquierda : null;
                if (!caja) continue;
                cajas.push(caja);
                etiquetas.push({
                  clave: `c-${c.id}`,
                  x: caja === derecha ? caja.x0 : caja.x1,
                  y,
                  ancla: caja === derecha ? "start" : "end",
                  tam: 12.5,
                  halo: 3.5,
                  texto: c.nombre,
                  nombre: true,
                });
              }
            }
            return (
              <g key={`etiquetas-${activa || "espana"}`} className="mapa-etiquetas" pointerEvents="none" aria-hidden="true">
                {etiquetas.map((e) => (
                  <text
                    key={e.clave}
                    x={e.x}
                    y={e.y}
                    textAnchor={e.ancla}
                    dominantBaseline="central"
                    fontSize={px(e.tam)}
                    strokeWidth={px(e.halo)}
                    fill={NOCHE}
                    stroke="#ffffff"
                    className={`${e.nombre ? "mapa-titular font-bold" : "font-extrabold"} [paint-order:stroke] [stroke-linejoin:round]`}
                  >
                    {e.texto}
                  </text>
                ))}
              </g>
            );
          })()}

        {/* Recomendador: contorno Sol discontinuo y número de orden en las 3 comunidades */}
        {recomendadas.map((id, i) => {
          const g = geoPorId.get(id);
          if (!g) return null;
          return (
            <g key={`rec-${id}`} pointerEvents="none" aria-hidden="true">
              {!CIUDADES_AUTONOMAS.has(id) && activa !== id && (
                <use
                  href={`#${PREFIJO}-${id}`}
                  fill="none"
                  stroke={SOL}
                  strokeWidth={px(3)}
                  strokeLinejoin="round"
                  strokeDasharray={`${f1(px(8))} ${f1(px(4))}`}
                  className="mapa-contorno-vivo"
                />
              )}
              <circle cx={g.etiqueta[0]} cy={g.etiqueta[1]} r={px(13)} fill={SOL} stroke="#ffffff" strokeWidth={px(2.5)} />
              <text
                x={g.etiqueta[0]}
                y={g.etiqueta[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={px(14)}
                fill={NOCHE}
                className="mapa-titular font-bold"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Casos de éxito. Una ciudad con un caso enseña su estrella de
            siempre; con varios, una píldora con la estrella y la cuenta.
            La forma importa: las burbujas de ciudad ya llevan su cifra de
            másteres dentro de un círculo, así que un segundo círculo con
            número se leería como más de lo mismo. La píldora se distingue
            de lejos y la estrella dice de qué va sin necesidad de leyenda. */}
        {capas.casos &&
          cumulos.map((c) => {
            const n = c.casos.length;
            const solo = n === 1 ? c.casos[0] : null;
            const p = c.punto;
            const rm = px(9.5 * Math.sqrt(escalaPantalla));
            const { mx, my } = marcas.get(c.ciudadId) || { mx: p.x, my: p.y };
            const elegido = solo
              ? foco.caso === solo.id
              : foco.ciudad === c.ciudadId || c.casos.some((k) => k.id === foco.caso);
            const ciudad = indice.ciudades.get(c.ciudadId);
            const nombreCiudad = ciudad?.nombre || "";
            const tipo = solo ? "caso" : "cumulo";
            const idDestino = solo ? solo.id : c.ciudadId;

            // Píldora: la estrella a la izquierda y la cuenta a su derecha.
            const alto = rm * 2;
            const tipografia = alto * 0.56;
            const ancho = alto * 1.06 + String(n).length * tipografia * 0.66;
            const x0 = mx - ancho / 2;
            const y0 = my - alto / 2;
            const cxEstrella = x0 + alto * 0.52;

            return (
              <g
                key={c.ciudadId}
                data-tipo={tipo}
                data-id={idDestino}
                role="button"
                tabIndex={0}
                aria-label={
                  solo
                    ? `Caso de éxito: ${solo.nombre}, ${solo.universidad}`
                    : `${n} casos de éxito en ${nombreCiudad}`
                }
                aria-pressed={elegido}
                onKeyDown={alTeclado(onElegir, solo ? "caso" : "ciudad", idDestino)}
                className="mapa-burbuja cursor-pointer"
                style={{ animationDelay: "480ms" }}
              >
                {solo ? (
                  <>
                    <circle cx={mx} cy={my} r={Math.max(rm, px(12))} fill="transparent" />
                    <circle cx={mx} cy={my} r={rm} className="mapa-burbuja-borde" fill={NOCHE} stroke="#ffffff" strokeWidth={px(2)} />
                    <path d={estrella(mx, my, rm * 0.62, rm * 0.27)} fill={SOL} className="pointer-events-none" />
                    {elegido && <circle cx={mx} cy={my} r={rm + px(4)} fill="none" stroke={SOL} strokeWidth={px(3)} />}
                  </>
                ) : (
                  <>
                    <rect x={x0 - px(3)} y={y0 - px(3)} width={ancho + px(6)} height={alto + px(6)} rx={(alto + px(6)) / 2} fill="transparent" />
                    <rect
                      x={x0}
                      y={y0}
                      width={ancho}
                      height={alto}
                      rx={alto / 2}
                      className="mapa-burbuja-borde"
                      fill={NOCHE}
                      stroke="#ffffff"
                      strokeWidth={px(2)}
                    />
                    <path d={estrella(cxEstrella, my, rm * 0.56, rm * 0.24)} fill={SOL} className="pointer-events-none" />
                    <text
                      x={x0 + alto * 0.92}
                      y={my}
                      textAnchor="start"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize={tipografia}
                      fontWeight="800"
                      className="pointer-events-none select-none"
                    >
                      {n}
                    </text>
                    {elegido && (
                      <rect
                        x={x0 - px(4)}
                        y={y0 - px(4)}
                        width={ancho + px(8)}
                        height={alto + px(8)}
                        rx={(alto + px(8)) / 2}
                        fill="none"
                        stroke={SOL}
                        strokeWidth={px(3)}
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
      </svg>

      <Mandos zoom={zoom} manual={manual} onZoom={(f) => zoomEn(null, f)} onCentrar={centrar} />

      {activa && (
        <button
          type="button"
          onClick={onToda}
          className="mapa-boton mov-toque absolute left-2 top-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-extrabold text-[#003648] shadow-md ring-1 ring-[#96CCFC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
        >
          <IconoMapa nombre="izquierda" size={15} className="text-[#0A5873]" />
          {T.todaEspana}
        </button>
      )}

      {rutas.length > 0 && (
        <span
          className="pointer-events-none absolute left-2 inline-flex items-center gap-1.5 rounded-full bg-[#003648] px-2.5 py-1 text-[11px] font-bold text-white shadow-md"
          style={{ top: "calc(80% - 13px)" }}
        >
          <Icono nombre="avion" size={13} className="mov-flota text-[#F09C48]" />
          Desde Lima
        </span>
      )}

      <div
        ref={tooltipRef}
        aria-hidden="true"
        className={`mapa-globo pointer-events-none absolute left-0 top-0 z-10 w-max max-w-[240px] rounded-xl bg-[#003648] px-3.5 py-2.5 text-xs leading-snug text-white ${
          hover ? "mapa-globo-visible" : "opacity-0"
        }`}
      >
        <Tooltip hover={hover} indice={indice} geoPorId={geoPorId} casos={casos} filtros={filtros} />
      </div>
    </div>
  );
}
