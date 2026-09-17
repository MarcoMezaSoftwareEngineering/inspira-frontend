// src/pages/mapa/TarjetaPrecio.jsx
// «¿Cuánto cuesta un máster aquí?»: precio aproximado de un máster por año
// (lo calcula la API por universidad y por comunidad, en `precios`) con su
// rango visual —barra desde–hasta con marca en lo habitual— y hasta 3 ejemplos.
//
// Siempre con la etiqueta «Aproximado por año · puede variar por máster y
// universidad». Si la confianza del dato es baja, se dice con discreción. En
// las comunidades que la API marca en `precios.sinPublicar` (Cataluña) no hay
// cifra: «La matrícula la fija cada universidad». Si no hay dato, no se pinta.
import Icono from "../../components/common/Icono";
import { useContador } from "./useContador";
import { PRECIO, eur, numero, plural } from "./mapaTextos";

export default function TarjetaPrecio({ precio, ejemplos = [], ramas = [], referencia = null, sinPublicar = false }) {
  const habitual = useContador(precio && !sinPublicar ? Math.round(precio.tipico) : 0);

  if (sinPublicar) {
    return (
      <section className="relative mt-5 overflow-hidden rounded-3xl bg-white p-4 ring-1 ring-[#CFE6FD]">
        <p className="mapa-rotulo">
          <Icono nombre="euro" size={14} />
          {PRECIO.titulo}
        </p>
        <p className="mapa-titular mt-1.5 text-xl font-bold leading-snug text-[#003648]">{PRECIO.sinPublicar}</p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-700">{PRECIO.sinPublicarDetalle}</p>
      </section>
    );
  }
  if (!precio) return null;

  const tope = Math.max(precio.hasta, precio.tipico, 1) * 1.08;
  const pos = (v) => Math.min(100, Math.max(0, (v / tope) * 100));
  const hayRango = precio.hasta > precio.desde;
  const nombreDeRama = (id) => ramas.find((r) => r.id === id)?.nombre || id || null;

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl bg-white p-4 shadow-[0_22px_44px_-32px_rgba(0,54,72,0.55)] ring-1 ring-[#CFE6FD]">
      <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#96CCFC]/25" />
      <p className="mapa-rotulo relative">
        <Icono nombre="euro" size={14} />
        {PRECIO.titulo}
      </p>
      <p className="mapa-titular relative mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[#003648]">
        <span className="text-[32px] font-bold leading-none tabular-nums">
          ≈ {numero(habitual)}
          {" "}€
        </span>
        <span className="text-sm font-semibold text-neutral-700">al año · {PRECIO.habitual}</span>
      </p>

      {hayRango && (
        <div className="relative mt-4">
          <div
            className="relative h-5"
            role="img"
            aria-label={`De ${eur(precio.desde)} a ${eur(precio.hasta)} al año; lo habitual, ${eur(precio.tipico)}`}
          >
            <div className="absolute inset-x-0 top-1.5 h-2 rounded-full bg-[#E6F2FE]" />
            <div
              className="mapa-barra absolute top-1.5 h-2 rounded-full bg-[#0A5873]"
              style={{ left: `${pos(precio.desde)}%`, width: `${Math.max(2, pos(precio.hasta) - pos(precio.desde))}%` }}
            />
            <span
              title={`Lo habitual: ${eur(precio.tipico)}`}
              className="absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#F09C48] shadow-md"
              style={{ left: `${pos(precio.tipico)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between gap-3 text-[11px] font-bold text-[#003648]">
            <span>desde {eur(precio.desde)}</span>
            <span>hasta {eur(precio.hasta)}</span>
          </div>
        </div>
      )}

      <p className="relative mt-2 text-[11px] leading-snug text-neutral-700">
        {PRECIO.etiqueta}
        {precio.n ? ` · ${plural(precio.n, "máster con precio", "másteres con precio")}` : ""}
      </p>
      {precio.confianza === "baja" && (
        <p className="relative mt-1 text-[11px] italic leading-snug text-neutral-700">{precio.nota || PRECIO.confianzaBaja}</p>
      )}
      {referencia && <p className="relative mt-1 text-[11px] leading-snug text-neutral-700">{PRECIO.deLaComunidad(referencia)}</p>}

      {ejemplos.length > 0 && (
        <div className="relative mt-4 border-t border-[#E1EFFD] pt-3">
          <p className="mapa-rotulo">
            <Icono nombre="libro" size={14} />
            {PRECIO.ejemplos}
          </p>
          <ul className="mt-2 space-y-2">
            {ejemplos.map((x, i) => (
              <li key={`${x.nombre}-${i}`} className="flex items-start justify-between gap-3 rounded-2xl bg-[#F6FBFF] px-3 py-2">
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-snug text-[#003648]">{x.nombre}</span>
                  <span className="block text-[11px] text-neutral-700">{[x.universidad, nombreDeRama(x.rama)].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap text-sm font-extrabold text-[#003648]">≈ {eur(Math.round(x.precio))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
