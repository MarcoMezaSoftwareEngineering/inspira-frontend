// src/pages/mapa/Filtros.jsx
// Barra de herramientas del mapa: buscador con autocompletado (patrón
// combobox), filtros por lista, rama, titularidad y matrícula máxima (precio
// aproximado de un máster por año), contador de resultados y capas visibles.
// Los filtros no esconden nada: atenúan en el mapa lo que no cumple.
import { useId, useMemo, useState } from "react";
import { SIN_RAMA, buscar, hayTitularidad, nombreRama } from "./indice";
import { tonoDe } from "./tonosMapa";
import { T, TITULARIDAD, eur, etiquetaLista, plural } from "./mapaTextos";

const CLASE_SELECT =
  "w-full rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm font-semibold text-[#003648] focus:outline-none focus:ring-4 focus:ring-[#96CCFC]";

function IconoLupa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

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
        <IconoLupa />
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

function Interruptor({ etiqueta, activo, onCambiar }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-[#003648]">
      <input type="checkbox" checked={activo} onChange={(e) => onCambiar(e.target.checked)} className="h-4 w-4 accent-[#0A5873]" />
      {etiqueta}
    </label>
  );
}

export default function Filtros({ indice, entrada, filtros, capas, onCapas, onCambiar, onBuscar, comparados, onVerComparador }) {
  const id = useId();
  const { listas, rama, max, titularidad } = entrada;
  const totales = indice.datos.totales;
  const limites = indice.limitesPrecio;
  const valorSlider = Math.min(max ?? limites.max, limites.max);
  const conTitularidad = hayTitularidad(indice);

  const alternarLista = (lista) =>
    onCambiar({ listas: listas.includes(lista) ? listas.filter((x) => x !== lista) : [...listas, lista] });

  return (
    <div className="rounded-[28px] border border-[#E1EFFD] bg-white p-4 shadow-[0_22px_48px_-36px_rgba(0,54,72,0.5)] sm:p-5">
      <div className={`grid gap-3 ${conTitularidad ? "md:grid-cols-[minmax(0,1fr)_240px_200px]" : "md:grid-cols-[minmax(0,1fr)_260px]"}`}>
        <Buscador indice={indice} onElegir={onBuscar} />
        <div>
          <label htmlFor={`${id}-rama`} className="sr-only">
            {T.filtroRama}
          </label>
          <select id={`${id}-rama`} value={rama || ""} onChange={(e) => onCambiar({ rama: e.target.value || null })} className={CLASE_SELECT}>
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
        {conTitularidad && (
          <div>
            <label htmlFor={`${id}-titularidad`} className="sr-only">
              {TITULARIDAD.etiqueta}
            </label>
            <select
              id={`${id}-titularidad`}
              value={titularidad || ""}
              onChange={(e) => onCambiar({ titularidad: e.target.value || null })}
              className={CLASE_SELECT}
            >
              <option value="">{TITULARIDAD.todas}</option>
              {TITULARIDAD.opciones.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                className={`mapa-boton inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
                  activa ? `border-transparent bg-[#E6F2FE] text-[#003648] ring-2 ${tono.anillo}` : "border-neutral-200 bg-white text-neutral-900 hover:bg-[#F6FBFF]"
                }`}
              >
                <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded ${tono.muestra}`} />
                {etiquetaLista(l)}
                <span className="font-semibold text-neutral-700">· desde {eur(l.desde)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 items-center gap-3 lg:w-[380px]">
          <label htmlFor={`${id}-max`} className="shrink-0 text-xs font-bold text-[#003648]">
            {T.filtroMatricula}
          </label>
          <input
            id={`${id}-max`}
            type="range"
            min={limites.min}
            max={limites.max}
            step={limites.paso}
            value={valorSlider}
            onChange={(e) => {
              const v = Number(e.target.value);
              onCambiar({ max: v >= limites.max ? null : v });
            }}
            aria-valuetext={max == null ? T.sinLimite : `hasta ${eur(max)} al año`}
            className="min-w-0 flex-1 accent-[#F09C48]"
          />
          <output htmlFor={`${id}-max`} className="w-[6.2rem] shrink-0 text-right text-xs font-extrabold tabular-nums text-[#003648]">
            {max == null ? T.sinLimite : `hasta ${eur(max)}`}
          </output>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E1EFFD] pt-3">
        <div aria-live="polite" className="min-w-0 text-sm text-neutral-700">
          {filtros.activos && filtros.universidades.size === 0 ? (
            <p className="font-semibold text-[#003648]">Ninguna universidad cumple estos filtros. Prueba a subir la matrícula máxima o a quitar la rama.</p>
          ) : filtros.activos ? (
            <p>
              Cumplen los filtros: <strong className="text-[#003648]">{plural(filtros.universidades.size, "universidad", "universidades")}</strong> en{" "}
              {plural(filtros.comunidades.size, "comunidad", "comunidades")} · {plural(filtros.masteres, "máster oficial", "másteres oficiales")}
              {rama ? ` de ${nombreRama(indice, rama)}` : ""}
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
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Interruptor etiqueta={T.capaCiudades} activo={capas.ciudades} onCambiar={(v) => onCapas((c) => ({ ...c, ciudades: v }))} />
          <Interruptor etiqueta={T.capaCasos} activo={capas.casos} onCambiar={(v) => onCapas((c) => ({ ...c, casos: v }))} />
          {filtros.activos && (
            <button
              type="button"
              onClick={() => onCambiar({ listas: [], rama: null, max: null, titularidad: null })}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
            >
              {T.limpiar}
            </button>
          )}
          {comparados > 0 && (
            <button type="button" onClick={onVerComparador} className="mapa-boton rounded-full bg-[#003648] px-3 py-1.5 text-xs font-bold text-white">
              {T.verComparador} ({comparados})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
