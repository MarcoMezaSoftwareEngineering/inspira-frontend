// src/pages/mapa/MapaInteractivo.jsx
// El mapa, con identidad propia de Inspira:
// - Relieve plano por capas: sombra sobre el mar, canto del color de la lista
//   y cara superior; la comunidad sube al pasar por encima y al elegirla.
// - Mar en el cielo de la marca con patrón de puntos de carta náutica.
// - Burbujas de ciudades (área proporcional a sus másteres oficiales) que
//   crecen al entrar.
// - Ruta punteada con el avión de la marca desde Lima hasta la ciudad elegida
//   o, sin nada elegido, hasta las ciudades de los casos de éxito.
// - Zoom suave a la comunidad elegida.
//
// Interacción:
// - Ratón: pasar por encima levanta la comunidad y enseña el tooltip; clic elige.
// - Toque: las comunidades pequeñas tienen una zona de 22 px alrededor de su
//   centro, como en el mapa de la landing.
// - Teclado: cada comunidad es un botón (Tab, Enter o espacio). Las burbujas
//   de una comunidad entran en la tabulación cuando está abierta; la lista
//   textual de la página cubre el resto.
// - prefers-reduced-motion: sin zoom animado, sin burbujas que crecen y con el
//   avión quieto a mitad de ruta.
//
// La geometría (pages/landing/master2027/mapaEspana.data.js) la carga la
// página con import dinámico y llega aquí ya resuelta. Cada comunidad se
// define una vez en <defs> y se pinta con <use>: tres capas sin triplicar el
// trazado.
import { useEffect, useMemo, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import { proyectar } from "./proyeccion";
import { masteresDe, prefiereMenosMovimiento } from "./indice";
import { NOCHE, SOL, tonoDe } from "./tonosMapa";
import { T, etiquetaLista, importeMatricula, numero, plural } from "./mapaTextos";

const CIUDADES_AUTONOMAS = new Set(["ceuta", "melilla"]);
const PEQUENAS = ["la-rioja", "cantabria", "asturias", "navarra", "pais-vasco", "murcia", "baleares", "ceuta", "melilla"];
const DURACION_ZOOM = 560;
const RADIO_TOQUE_PX = 22;
const PREFIJO = "mapa-geo";
// Avión del set de iconos de la marca (components/common/Icono.jsx), en 24×24.
const AVION =
  "M10.2 13.8 3 12V9.5l2 .6 1.5 1.2 3-.6L6 4.5l2.5.5 4 5 4.6-1c1.3-.3 2.4.3 2.6 1.2.2.9-.5 1.8-1.8 2.2l-4.6 1.3-2 6.3-2.4.5 1.3-6.7Z";

const suavizar = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const f1 = (n) => n.toFixed(1);

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
  return (
    <g>
      {cuerpo}
      <animateMotion
        dur="3.6s"
        repeatCount="indefinite"
        rotate="auto"
        calcMode="linear"
        keyPoints="0;0;1;1"
        keyTimes={`0;${salida.toFixed(2)};${(salida + 0.6).toFixed(2)};1`}
        path={ruta.d}
      />
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
            ? `Máster por año: ≈ ${numero(Math.round(c.precioAnual.tipico))} €`
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
        {noCumple(filtros.ciudades, c.id) && <p className="mt-1 text-[#F09C48]">{T.noCumple}</p>}
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
          {k.nombre} · {k.destacado}
        </p>
        <p>{k.universidad}</p>
      </>
    );
  }
  return null;
}

export default function MapaInteractivo({ geo, indice, foco, filtros, capas, casos, onElegir, onToda }) {
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
  const [vb, setVb] = useState(base);
  const [ancho, setAncho] = useState(640);
  const [hover, setHover] = useState(null);
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

  // Zoom a la comunidad elegida (o vuelta a toda España).
  useEffect(() => {
    const id = foco.comunidad;
    let destino = base;
    if (id === "canarias") {
      destino = encuadre(geo.recuadroCanarias, aspecto, 300);
    } else if (id && CIUDADES_AUTONOMAS.has(id)) {
      const g = geoPorId.get(id);
      if (g) destino = encuadre({ x: g.etiqueta[0], y: g.etiqueta[1], width: 0, height: 0 }, aspecto, 160);
    } else if (id) {
      const el = caminos.current.get(id);
      if (el) {
        try {
          destino = encuadre(el.getBBox(), aspecto, 170);
        } catch {
          destino = base;
        }
      }
    }
    const inicio = vbRef.current;
    if (inicio.every((v, i) => Math.abs(v - destino[i]) < 0.5)) return undefined;
    if (prefiereMenosMovimiento()) {
      vbRef.current = destino;
      setVb(destino);
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / DURACION_ZOOM);
      const e = suavizar(k);
      const v = inicio.map((a, i) => a + (destino[i] - a) * e);
      vbRef.current = v;
      setVb(v);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [foco.comunidad, base, aspecto, geo, geoPorId]);

  const ppu = ancho / vb[2];
  const px = (n) => n / Math.max(ppu, 0.0001);
  const zoom = base[2] / vb[2];
  const escalaPantalla = Math.min(1, Math.max(0.55, ancho / 640));
  const factorZoom = Math.min(1.25, Math.pow(zoom, 0.3));
  const radioPx = (n) => (n > 0 ? 3.5 + Math.sqrt(n) * 1.05 : 3.5) * escalaPantalla * factorZoom;
  const rama = filtros.rama;
  const activa = foco.comunidad;
  const listaDe = (id) => indice.comunidades.get(id)?.lista;

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

  const destinoRuta = foco.ciudad ? puntoPorId.get(foco.ciudad) : null;
  const rutas = destinoRuta
    ? [{ id: "foco", punto: destinoRuta, principal: true }]
    : !foco.tipo && capas.casos
      ? casos.map((k) => ({ id: k.id, punto: puntoPorId.get(k.ciudadId), principal: false })).filter((r) => r.punto)
      : [];

  const opacidadComunidad = (id) => {
    if (filtros.activos && !filtros.comunidades.has(id)) return 0.3;
    if (activa && activa !== id) return 0.55;
    return 1;
  };

  function alMover(e) {
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

  function pequenaCercana(e) {
    const ctm = svgRef.current?.getScreenCTM?.();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
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

  function alPulsar(e) {
    const destino = e.target instanceof Element ? e.target.closest("[data-tipo]") : null;
    let tipo = destino?.getAttribute("data-tipo") || null;
    let id = destino?.getAttribute("data-id") || null;
    if (tipoPuntero.current !== "mouse" && zoom < 1.6 && tipo !== "ciudad" && tipo !== "caso") {
      const cercana = pequenaCercana(e);
      if (cercana) {
        tipo = "comunidad";
        id = cercana;
      }
    }
    if (tipo && id) onElegir(tipo, id);
  }

  const canarias = geoPorId.get("canarias");
  const alzaActiva = `translate(0 ${f1(-px(4))})`;

  return (
    <div ref={envoltorio} className="relative">
      <svg
        ref={svgRef}
        viewBox={vb.map((n) => n.toFixed(2)).join(" ")}
        role="group"
        aria-label={T.ariaMapa}
        className="block h-auto w-full touch-manipulation select-none"
        style={{
          aspectRatio: `${base[2]} / ${base[3]}`,
          "--mapa-alza": `${(-px(3)).toFixed(2)}px`,
          "--mapa-trazo-foco": `${px(3).toFixed(2)}px`,
        }}
        onPointerDown={(e) => {
          tipoPuntero.current = e.pointerType || "mouse";
        }}
        onPointerMove={alMover}
        onPointerLeave={() => setHover(null)}
        onClick={alPulsar}
      >
        <defs>
          <pattern id={`${PREFIJO}-puntos`} width={16} height={16} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={2} r={1.15} fill={NOCHE} fillOpacity={0.13} />
          </pattern>
          {conRelieve.map((g) => (
            <path key={g.id} id={`${PREFIJO}-${g.id}`} d={g.d} />
          ))}
        </defs>

        <rect x={-900} y={-900} width={2800} height={2600} fill={`url(#${PREFIJO}-puntos)`} pointerEvents="none" />
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
          <g key={`burbujas-${activa || "espana"}-${rama || "todas"}`}>
            {puntos.map(({ c, x, y, n }, i) => {
              const rpx = radioPx(n);
              const r = px(rpx);
              const fuera = filtros.activos && !filtros.ciudades.has(c.id);
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

        {/* Casos de éxito */}
        {capas.casos &&
          casos.map((k) => {
            const p = puntoPorId.get(k.ciudadId);
            if (!p) return null;
            const rc = capas.ciudades ? px(radioPx(p.n)) : 0;
            const rm = px(9.5 * Math.sqrt(escalaPantalla));
            const d = (rc + rm * 0.35) * 0.72;
            const mx = p.x + d;
            const my = p.y - d;
            const elegido = foco.caso === k.id;
            return (
              <g
                key={k.id}
                data-tipo="caso"
                data-id={k.id}
                role="button"
                tabIndex={0}
                aria-label={`Caso de éxito: ${k.nombre}, ${k.universidad}`}
                aria-pressed={elegido}
                onKeyDown={alTeclado(onElegir, "caso", k.id)}
                className="mapa-burbuja cursor-pointer"
                style={{ animationDelay: "480ms" }}
              >
                <circle cx={mx} cy={my} r={Math.max(rm, px(12))} fill="transparent" />
                <circle cx={mx} cy={my} r={rm} className="mapa-burbuja-borde" fill={NOCHE} stroke="#ffffff" strokeWidth={px(2)} />
                <path d={estrella(mx, my, rm * 0.62, rm * 0.27)} fill={SOL} className="pointer-events-none" />
                {elegido && <circle cx={mx} cy={my} r={rm + px(4)} fill="none" stroke={SOL} strokeWidth={px(3)} />}
              </g>
            );
          })}
      </svg>

      {activa && (
        <button
          type="button"
          onClick={onToda}
          className="mapa-boton absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-extrabold text-[#003648] shadow-md ring-1 ring-[#96CCFC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
        >
          <span aria-hidden="true">←</span> {T.todaEspana}
        </button>
      )}

      {rutas.length > 0 && (
        <span
          className="pointer-events-none absolute left-2 inline-flex items-center gap-1.5 rounded-full bg-[#003648] px-2.5 py-1 text-[11px] font-bold text-white shadow-md"
          style={{ top: "calc(80% - 13px)" }}
        >
          <Icono nombre="avion" size={13} className="text-[#F09C48]" />
          Desde Lima
        </span>
      )}

      <div
        ref={tooltipRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 w-max max-w-[240px] rounded-xl bg-[#003648] px-3 py-2 text-xs leading-snug text-white shadow-lg transition-opacity duration-100 ${
          hover ? "opacity-100" : "opacity-0"
        }`}
      >
        <Tooltip hover={hover} indice={indice} geoPorId={geoPorId} casos={casos} filtros={filtros} />
      </div>
    </div>
  );
}
