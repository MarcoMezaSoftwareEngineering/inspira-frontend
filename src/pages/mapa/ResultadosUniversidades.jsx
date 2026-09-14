// src/pages/mapa/ResultadosUniversidades.jsx
// Lista de universidades bajo el mapa: sale cuando hay filtros (las que
// cumplen) o cuando se pide «Mejor ranking primero» (todas, en ese orden).
// Cada tarjeta abre su ficha en el mapa. El ranking siempre como
// «QS World University Rankings 2027 · puesto X», sin enlace.
import { ordenarUniversidades, posicionRanking, precioDeUniversidad } from "./indice";
import { tonoDe } from "./tonosMapa";
import { ORDEN, RANKING, VACIO, eur, plural, textoRanking } from "./mapaTextos";

export function SelectorOrden({ orden, onOrden, compacto = false }) {
  return (
    <div role="group" aria-label={ORDEN.etiqueta} className="inline-flex rounded-full bg-[#E6F2FE] p-0.5">
      {[
        ["masteres", ORDEN.masteres],
        ["ranking", ORDEN.ranking],
      ].map(([id, texto]) => (
        <button
          key={id}
          type="button"
          aria-pressed={orden === id}
          onClick={() => onOrden(id)}
          className={`rounded-full font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
            compacto ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
          } ${orden === id ? "bg-[#003648] text-white shadow-sm" : "text-[#003648] hover:bg-white"}`}
        >
          {texto}
        </button>
      ))}
    </div>
  );
}

export default function ResultadosUniversidades({ indice, filtros, orden, onOrden, onElegir }) {
  if (!filtros.activos && orden !== "ranking") return null;
  const base = filtros.activos ? [...filtros.universidades].map((id) => indice.universidades.get(id)).filter(Boolean) : indice.datos.universidades;
  const unis = ordenarUniversidades(base, orden, filtros.rama);
  const titulo = filtros.ranking
    ? `Universidades ${RANKING.resumen[filtros.ranking]}`
    : filtros.activos
      ? "Universidades que cumplen los filtros"
      : "Universidades por ranking QS";

  return (
    <section id="mapa-resultados" aria-labelledby="mapa-resultados-titulo" className="mt-10 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0A5873]">Resultados</p>
          <h2 id="mapa-resultados-titulo" className="mapa-titular mt-1 text-[26px] font-bold leading-tight text-[#003648]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-neutral-700">
            {plural(unis.length, "universidad", "universidades")} · toca una para ver cuánto cuesta un máster allí.
          </p>
        </div>
        <SelectorOrden orden={orden} onOrden={onOrden} />
      </div>

      {unis.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-[#96CCFC] bg-[#F6FBFF] px-5 py-6 text-sm font-semibold text-[#003648]">{VACIO.filtros}</p>
      ) : (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {unis.map((u) => {
            const puesto = posicionRanking(u);
            const ranking = textoRanking(u.ranking);
            const precio = precioDeUniversidad(indice, u);
            const ciudad = indice.ciudades.get(u.ciudad)?.nombre || u.sedes[0];
            const com = indice.comunidades.get(u.comunidad)?.nombre;
            const sinPublicar = indice.datos.precios?.sinPublicar?.includes(u.comunidad);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onElegir("universidad", u.id)}
                  className="mapa-boton flex h-full w-full items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left hover:border-[#96CCFC] hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
                >
                  <span
                    className={`flex h-11 min-w-[3.4rem] shrink-0 flex-col items-center justify-center rounded-xl px-1.5 text-center ${
                      puesto != null ? "bg-[#003648] text-white" : "bg-[#E6F2FE] text-[#003648]"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-80">{puesto != null ? "QS" : u.sigla}</span>
                    {puesto != null && <span className="text-[13px] font-extrabold leading-none tabular-nums">{puesto}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded ${tonoDe(u.lista).muestra}`} />
                      <span className="text-[13px] font-bold leading-snug text-[#003648]">{u.nombre}</span>
                    </span>
                    <span className="block text-xs text-neutral-700">{[ciudad, com, u.titularidad].filter(Boolean).join(" · ")}</span>
                    {ranking && <span className="mt-0.5 block text-[11px] font-semibold text-[#0A5873]">{ranking}</span>}
                    <span className="mt-1 block text-xs font-bold text-[#003648]">
                      {sinPublicar
                        ? "Matrícula: la fija cada universidad"
                        : precio
                          ? `Máster ≈ ${eur(Math.round(precio.tipico))} al año (matrícula)`
                          : "Matrícula sin dato"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
