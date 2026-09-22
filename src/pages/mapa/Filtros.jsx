// src/pages/mapa/Filtros.jsx
// Barra de herramientas del mapa: buscador con autocompletado (patrón
// combobox), filtros por rama, titularidad, ranking QS, plazo de postulación,
// becas, lista, matrícula máxima (precio aproximado de un máster por año) y
// presupuesto total (matrícula + vida), contador de resultados, orden de las
// universidades y capas visibles. Los filtros no esconden nada: atenúan en el
// mapa lo que no cumple. Cada filtro opcional solo sale si la API trae su dato.
//
// 17/09/2026: cada control lleva su icono de trazo delante (antes el buscador
// tenía una lupa dibujada aquí y la casilla de becas era el carácter «✓», que
// cada sistema pinta de un tamaño). Los filtros y su comportamiento no cambian.
import { useId, useMemo, useState } from "react";
import Icono from "../../components/common/Icono";
import IconoMapa from "./IconosMapa";
import { SIN_RAMA, buscar, hayRanking, hayTitularidad, nombreRama } from "./indice";
import { tonoDe } from "./tonosMapa";
import {
  BECAS,
  ORDEN,
  PAQUETE,
  PLAZOS,
  PRESUPUESTO,
  RANKING,
  T,
  TITULARIDAD,
  VACIO,
  eur,
  etiquetaLista,
  plural,
} from "./mapaTextos";

const CLASE_SELECT =
  "w-full min-h-[46px] rounded-2xl border border-neutral-300 bg-white pr-3 py-3 text-sm font-semibold text-[#003648] focus:outline-none focus:ring-4 focus:ring-[#96CCFC]";
const ACTIVO = "border-[#F09C48] ring-2 ring-[#F09C48]/40";

function Buscador({ indice, onElegir }) {
  const id = useId();
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const resultados = useMemo(() => buscar(indice, q), [indice, q]);
  const hayLista = abierto && q.trim().length >= 2;

  function elegir(r) {
    onElegir(r.tipo, r.id);
    setQ(r.titulo);
    setAbierto(false);
  }

  function alTeclear(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(i + 1, Math.max(resultados.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (hayLista && resultados[activo]) {
        e.preventDefault();
        elegir(resultados[activo]);
      }
    } else if (e.key === "Escape" && abierto) {
      e.stopPropagation();
      setAbierto(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${id}-q`} className="sr-only">
        {T.buscar}
      </label>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0A5873]">
        <Icono nombre="lupa" size={18} />
      </span>
      <input
        id={`${id}-q`}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={hayLista}
        aria-controls={`${id}-lista`}
        aria-activedescendant={hayLista && resultados[activo] ? `${id}-op-${activo}` : undefined}
        value={q}
        placeholder={T.buscar}
        onChange={(e) => {
          setQ(e.target.value);
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 120)}
        onKeyDown={alTeclear}
        className="w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-10 pr-3 text-base text-[#003648] placeholder:text-neutral-500 focus:outline-none focus:ring-4 focus:ring-[#96CCFC]"
      />
      {hayLista && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          aria-label="Resultados de la búsqueda"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {resultados.length === 0 ? (
            <li role="option" aria-selected="false" aria-disabled="true" className="px-3 py-2.5 text-sm text-neutral-700">
              {T.buscarVacio}
            </li>
          ) : (
            resultados.map((r, i) => (
              <li
                key={`${r.tipo}-${r.id}`}
                id={`${id}-op-${i}`}
                role="option"
                aria-selected={i === activo}
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(r);
                }}
                onMouseEnter={() => setActivo(i)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${i === activo ? "bg-[#F6FBFF]" : ""}`}
              >
                <span className="shrink-0 rounded-md bg-[#E6F2FE] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#0A5873]">
                  {T.tipoBusqueda[r.tipo]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#003648]">{r.titulo}</span>
                  <span className="block truncate text-xs text-neutral-700">{r.detalle}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function Interruptor({ etiqueta, activo, onCambiar, icono = null }) {
  return (
    <label
      className={`mov-toque inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold text-[#003648] ${
        activo ? "border-[#96CCFC] bg-[#E6F2FE]" : "border-neutral-200 bg-white hover:bg-[#F6FBFF]"
      }`}
    >
      <input type="checkbox" checked={activo} onChange={(e) => onCambiar(e.target.checked)} className="h-4 w-4 accent-[#0A5873]" />
      {icono && <Icono nombre={icono} size={14} className={activo ? "text-[#0A5873]" : "text-neutral-500"} />}
      {etiqueta}
    </label>
  );
}

function Selector({ etiqueta, valor, vacio, opciones, onCambiar, icono = null }) {
  const id = useId();
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      {icono && (
        <span aria-hidden="true" className={`pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 ${valor ? "text-[#F09C48]" : "text-[#0A5873]"}`}>
          <Icono nombre={icono} size={16} />
        </span>
      )}
      <select
        id={id}
        value={valor || ""}
        onChange={(e) => onCambiar(e.target.value || null)}
        className={`${CLASE_SELECT} ${icono ? "pl-9" : "pl-3"} ${valor ? ACTIVO : ""}`}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

function Deslizador({ etiqueta, limites, valor, onCambiar, textoValor, acento = "accent-[#F09C48]", icono = "euro" }) {
  const id = useId();
  const v = Math.min(valor ?? limites.max, limites.max);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <label htmlFor={id} className="flex w-[7.4rem] shrink-0 items-center gap-1.5 text-xs font-bold text-[#003648]">
        <Icono nombre={icono} size={14} className={valor == null ? "text-[#0A5873]" : "text-[#F09C48]"} />
        <span className="min-w-0">{etiqueta}</span>
      </label>
      <input
        id={id}
        type="range"
        min={limites.min}
        max={limites.max}
        step={limites.paso}
        value={v}
        onChange={(e) => {
          const n = Number(e.target.value);
          onCambiar(n >= limites.max ? null : n);
        }}
        aria-valuetext={textoValor}
        className={`min-w-0 flex-1 ${acento}`}
      />
      <output htmlFor={id} className="w-[6.6rem] shrink-0 text-right text-xs font-extrabold tabular-nums text-[#003648]">
        {textoValor}
      </output>
    </div>
  );
}

export default function Filtros({
  indice,
  entrada,
  filtros,
  capas,
  onCapas,
  onCambiar,
  onBuscar,
  comparados,
  onVerComparador,
  onVerResultados,
}) {
  const id = useId();
  // En el teléfono el panel entero ocupaba dos pantallas antes de llegar al
  // mapa: se pliega y deja fuera lo que más se usa (buscar y rama). En
  // escritorio no cambia nada, siempre está abierto.
  const [abierto, setAbierto] = useState(false);
  const { listas, rama, max, titularidad, ranking, orden, abre, becas, presupuesto } = entrada;
  const totales = indice.datos.totales;
  const conTitularidad = hayTitularidad(indice);
  const conRanking = hayRanking(indice);
  const conPlazos = !!indice.hayPlazos;
  const conBecas = !!indice.hayBecas;
  const limitesPresupuesto = indice.limitesPresupuesto;
  const desdePaquete = Math.min(...indice.datos.listas.map((l) => l.desde).filter(Number.isFinite));
  const hayFila2 = conTitularidad || conRanking || conPlazos || conBecas;

  const alternarLista = (lista) =>
    onCambiar({ listas: listas.includes(lista) ? listas.filter((x) => x !== lista) : [...listas, lista] });

  const matices = [ranking && RANKING.resumen[ranking], abre && PLAZOS.resumen[abre], becas && BECAS.resumen].filter(Boolean).join(", ");
  const cuantosFiltros =
    listas.length + [titularidad, ranking, abre, max, presupuesto].filter((v) => v != null).length + (becas ? 1 : 0);

  return (
    <div className="mapa-panel rounded-[28px] border border-[#E1EFFD] bg-white p-4 shadow-[0_22px_48px_-36px_rgba(0,54,72,0.5)] sm:p-5" data-revelar="suave">
      <p className="mapa-rotulo mb-2.5">
        <IconoMapa nombre="ajustes" size={14} />
        Busca y filtra
      </p>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
        <Buscador indice={indice} onElegir={onBuscar} />
        <div className="relative">
          <label htmlFor={`${id}-rama`} className="sr-only">
            {T.filtroRama}
          </label>
          <span aria-hidden="true" className={`pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 ${rama ? "text-[#F09C48]" : "text-[#0A5873]"}`}>
            <Icono nombre="birrete" size={16} />
          </span>
          <select
            id={`${id}-rama`}
            value={rama || ""}
            onChange={(e) => onCambiar({ rama: e.target.value || null })}
            className={`${CLASE_SELECT} pl-9 ${rama ? ACTIVO : ""}`}
          >
            <option value="">{T.todasRamas}</option>
            {indice.ramas
              .filter((r) => r.id !== SIN_RAMA)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className={`mapa-boton mov-toque mt-3 flex min-h-[46px] w-full items-center justify-between gap-2 rounded-2xl border border-[#CFE6FD] bg-[#F6FBFF] px-4 py-2.5 text-sm font-extrabold text-[#003648] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] md:hidden`}
      >
        <span className="inline-flex items-center gap-2">
          <IconoMapa nombre="ajustes" size={16} className="text-[#0A5873]" />
          {abierto ? "Ocultar filtros" : "Más filtros"}
          {cuantosFiltros > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F09C48] px-1.5 text-[11px] font-extrabold text-[#003648]">
              {cuantosFiltros}
            </span>
          )}
        </span>
        <span aria-hidden="true" className={`transition-transform ${abierto ? "rotate-180" : ""}`}>
          <Icono nombre="flecha" size={14} className="rotate-90 text-[#0A5873]" />
        </span>
      </button>

      <div className={abierto ? "" : "hidden md:block"}>
      {hayFila2 && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {conTitularidad && (
            <Selector
              etiqueta={TITULARIDAD.etiqueta}
              icono="escudo"
              valor={titularidad}
              vacio={TITULARIDAD.todas}
              opciones={TITULARIDAD.opciones}
              onCambiar={(v) => onCambiar({ titularidad: v })}
            />
          )}
          {conRanking && (
            <Selector
              etiqueta={RANKING.etiqueta}
              icono="trofeo"
              valor={ranking}
              vacio={RANKING.todas}
              opciones={RANKING.opciones}
              // Al pedir un tope de ranking, la lista de resultados sale ya ordenada por ranking.
              onCambiar={(v) => onCambiar(v ? { ranking: v, orden: "ranking" } : { ranking: null })}
            />
          )}
          {conPlazos && (
            <Selector
              etiqueta={PLAZOS.filtro}
              icono="calendario"
              valor={abre}
              vacio={PLAZOS.todas}
              opciones={PLAZOS.opciones}
              onCambiar={(v) => onCambiar({ abre: v })}
            />
          )}
          {conBecas && (
            <button
              type="button"
              aria-pressed={becas}
              onClick={() => onCambiar({ becas: !becas })}
              className={`mapa-boton mov-toque inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
                becas ? `bg-[#FFF6EC] text-[#003648] ${ACTIVO}` : "border-neutral-300 bg-white text-[#003648] hover:bg-[#F6FBFF]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  becas ? "border-[#F09C48] bg-[#F09C48] text-[#003648]" : "border-neutral-400 text-transparent"
                }`}
              >
                <Icono nombre="check" size={13} strokeWidth={2.6} />
              </span>
              <Icono nombre="regalo" size={16} className={becas ? "text-[#B8661F]" : "text-neutral-500"} />
              {BECAS.filtro}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div role="group" aria-label={T.filtroListas} className="flex flex-wrap gap-2">
            {indice.datos.listas.map((l) => {
              const activa = listas.includes(l.id);
              const tono = tonoDe(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alternarLista(l.id)}
                  className={`mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
                    activa ? `border-transparent bg-[#E6F2FE] text-[#003648] ring-2 ${tono.anillo}` : "border-neutral-200 bg-white text-neutral-900 hover:bg-[#F6FBFF]"
                  }`}
                >
                  <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded ${tono.muestra}`} />
                  {etiquetaLista(l)}
                  {activa && <Icono nombre="check" size={13} strokeWidth={2.6} className="text-[#0A5873]" />}
                </button>
              );
            })}
          </div>
          {Number.isFinite(desdePaquete) && (
            <p className="mt-1.5 text-[11px] leading-snug text-neutral-700">
              <strong className="text-[#003648]">{PAQUETE.desde(desdePaquete)}</strong> en cualquier lista. {PAQUETE.leyenda}
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-2 lg:w-[410px]">
          <Deslizador
            etiqueta={T.filtroMatricula}
            limites={indice.limitesPrecio}
            valor={max}
            onCambiar={(v) => onCambiar({ max: v })}
            textoValor={max == null ? T.sinLimite : `hasta ${eur(max)}`}
          />
          {limitesPresupuesto && (
            <>
              <Deslizador
                etiqueta={PRESUPUESTO.etiqueta}
                limites={limitesPresupuesto}
                valor={presupuesto}
                onCambiar={(v) => onCambiar({ presupuesto: v })}
                textoValor={presupuesto == null ? PRESUPUESTO.sinLimite : `${eur(presupuesto)} ${PRESUPUESTO.sufijo}`}
                acento="accent-[#0A5873]"
                icono="maletin"
              />
              <p className="text-[11px] leading-snug text-neutral-700">
                {PRESUPUESTO.explicacion} <strong className="text-[#003648]">{PRESUPUESTO.iprem}</strong>
              </p>
            </>
          )}
        </div>
      </div>

      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E1EFFD] pt-3">
        <div aria-live="polite" className="min-w-0 text-sm text-neutral-700">
          {filtros.activos && filtros.universidades.size === 0 ? (
            <p className="font-semibold text-[#003648]">{VACIO.filtros}</p>
          ) : filtros.activos ? (
            <p>
              Cumplen los filtros: <strong className="text-[#003648]">{plural(filtros.universidades.size, "universidad", "universidades")}</strong>
              {matices ? ` ${matices}` : ""} en {plural(filtros.comunidades.size, "comunidad", "comunidades")} ·{" "}
              {plural(filtros.masteres, "máster oficial", "másteres oficiales")}
              {rama ? ` de ${nombreRama(indice, rama)}` : ""}
              {onVerResultados && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={onVerResultados}
                    className="inline-flex items-center gap-1 font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
                  >
                    Ver la lista
                    <Icono nombre="flecha" size={12} />
                  </button>
                </>
              )}
            </p>
          ) : (
            <p>
              <strong className="text-[#003648]">{plural(totales.universidades, "universidad", "universidades")}</strong> en{" "}
              {plural(totales.comunidades, "comunidad", "comunidades")} · {plural(totales.masteres, "máster oficial", "másteres oficiales")}
            </p>
          )}
          {filtros.sinCifra.length > 0 && (
            <p className="text-xs">{filtros.sinCifra.join(", ")}: sin precio con el que filtrar, queda fuera mientras uses la matrícula máxima.</p>
          )}
          {filtros.sinPresupuesto?.length > 0 && <p className="text-xs">{PRESUPUESTO.sinDato(filtros.sinPresupuesto.join(", "))}</p>}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {conRanking && (
            <label className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-0.5 pl-3 pr-1 text-xs font-bold text-[#003648]">
              <Icono nombre="grafico" size={14} className="text-[#0A5873]" />
              <span className="sr-only sm:not-sr-only">{ORDEN.etiqueta}</span>
              <select
                value={orden}
                onChange={(e) => onCambiar({ orden: e.target.value === "ranking" ? "ranking" : null })}
                aria-label={ORDEN.etiqueta}
                className="rounded-full bg-[#E6F2FE] px-2 py-1 text-xs font-bold text-[#003648] focus:outline-none focus:ring-4 focus:ring-[#96CCFC]"
              >
                <option value="masteres">{ORDEN.masteres}</option>
                <option value="ranking">{ORDEN.ranking}</option>
              </select>
            </label>
          )}
          <Interruptor icono="ubicacion" etiqueta={T.capaCiudades} activo={capas.ciudades} onCambiar={(v) => onCapas((c) => ({ ...c, ciudades: v }))} />
          <Interruptor icono="estrella" etiqueta={T.capaCasos} activo={capas.casos} onCambiar={(v) => onCapas((c) => ({ ...c, casos: v }))} />
          {filtros.activos && (
            <button
              type="button"
              onClick={() =>
                onCambiar({ listas: [], rama: null, max: null, titularidad: null, ranking: null, abre: null, becas: false, presupuesto: null })
              }
              className="mov-toque inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
            >
              <IconoMapa nombre="cerrar" size={13} />
              {T.limpiar}
            </button>
          )}
          {comparados > 0 && (
            <button
              type="button"
              onClick={onVerComparador}
              className="mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#003648] px-3.5 py-1.5 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
            >
              <Icono nombre="balanza" size={14} className="text-[#F09C48]" />
              {T.verComparador} ({comparados})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
