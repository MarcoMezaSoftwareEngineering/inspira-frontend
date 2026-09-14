// src/pages/mapa/Recomendador.jsx
// «Recomiéndame»: tres preguntas (tope de matrícula al año, área y ciudad
// grande o tranquila) y las 3 comunidades que mejor encajan, resaltadas en el
// mapa, con una línea que explica cada una.
//
// Lógica transparente, en el navegador y con los datos de GET /api/mapa:
// - Descarta las comunidades cuya matrícula orientativa (la típica de un
//   máster al año; si no, la de la norma) pasa del tope, las que no tienen
//   másteres del área y, si se pide, las que no tienen ciudad de ese tamaño.
// - «Ciudad grande»: 100 o más másteres oficiales (Madrid, Barcelona,
//   Valencia, Sevilla, Santiago, Granada…); «tranquila», menos.
// - Ordena por 45 % matrícula (más barata, mejor), 40 % oferta del área y
//   15 % ciudades del tamaño pedido.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import { CALENDLY_URL } from "../../config/contacto";
import { SIN_RAMA, masteresDe, nombreRama } from "./indice";
import { RECOMENDAR, eur, numero } from "./mapaTextos";

const CIUDAD_GRANDE = 100;

function matriculaDe(indice, c) {
  if (indice.datos.precios?.sinPublicar?.includes(c.id)) return null;
  const v = c.precioAnual?.tipico ?? (c.matricula && !c.matricula.cadaUniversidad ? c.matricula.min : null);
  return Number.isFinite(v) ? v : null;
}

function motivo(indice, o, rama, ciudad) {
  const partes = [o.precio != null ? `Matrícula ≈ ${eur(Math.round(o.precio))} al año` : "Matrícula: la fija cada universidad"];
  partes.push(`${numero(o.n)} ${o.n === 1 ? "máster" : "másteres"} ${rama ? `de ${nombreRama(indice, rama)}` : "oficiales"}`);
  const lista = ciudad === "grande" ? o.grandes : ciudad === "tranquila" ? o.tranquilas : [...o.grandes, ...o.tranquilas];
  const nombres = [...lista]
    .sort((a, b) => masteresDe(b, rama) - masteresDe(a, rama))
    .slice(0, 2)
    .map((x) => x.nombre);
  if (nombres.length) {
    const etiqueta = ciudad === "grande" ? "ciudad grande" : ciudad === "tranquila" ? "ciudad tranquila" : "sobre todo en";
    partes.push(`${etiqueta}${ciudad ? ":" : ""} ${nombres.join(" y ")}`);
  }
  return partes.join(" · ");
}

/** Las 3 comunidades que mejor encajan: [{ id, nombre, motivo }]. */
function recomendar(indice, { tope = null, rama = null, ciudad = null } = {}) {
  const candidatas = indice.datos.comunidades
    .map((c) => {
      const ciudades = c.ciudades.map((id) => indice.ciudades.get(id)).filter((x) => x && masteresDe(x, rama) > 0);
      return {
        c,
        precio: matriculaDe(indice, c),
        n: masteresDe(c, rama),
        grandes: ciudades.filter((x) => x.masteres >= CIUDAD_GRANDE),
        tranquilas: ciudades.filter((x) => x.masteres < CIUDAD_GRANDE),
      };
    })
    .filter(
      (o) =>
        o.n > 0 &&
        (tope == null || (o.precio != null && o.precio <= tope)) &&
        (ciudad !== "grande" || o.grandes.length > 0) &&
        (ciudad !== "tranquila" || o.tranquilas.length > 0)
    );
  if (!candidatas.length) return [];

  const precios = candidatas.map((o) => o.precio).filter((v) => v != null);
  const pMin = precios.length ? Math.min(...precios) : 0;
  const pMax = precios.length ? Math.max(...precios) : 0;
  const nMax = Math.max(...candidatas.map((o) => o.n));
  return candidatas
    .map((o) => {
      const sPrecio = o.precio == null ? 0 : pMax > pMin ? 1 - (o.precio - pMin) / (pMax - pMin) : 1;
      const sOferta = Math.sqrt(o.n / nMax);
      const sCiudad = ciudad === "grande" ? Math.min(1, o.grandes.length / 2) : ciudad === "tranquila" ? Math.min(1, o.tranquilas.length / 3) : 0.5;
      return { ...o, puntos: 0.45 * sPrecio + 0.4 * sOferta + 0.15 * sCiudad };
    })
    .sort((a, b) => b.puntos - a.puntos || b.n - a.n)
    .slice(0, 3)
    .map((o) => ({ id: o.c.id, nombre: o.c.nombre, motivo: motivo(indice, o, rama, ciudad) }));
}

function Opcion({ activa, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`mapa-boton rounded-full px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
        activa ? "bg-[#003648] text-white" : "bg-white text-[#003648] ring-1 ring-[#CFE6FD] hover:bg-[#F6FBFF]"
      }`}
    >
      {children}
    </button>
  );
}

function Pregunta({ numero: n, titulo, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex items-start gap-2 text-sm font-bold leading-snug text-[#003648]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F09C48] text-xs font-extrabold text-[#003648]">{n}</span>
        {titulo}
      </legend>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

export default function Recomendador({ indice, onCerrar, onResultado, onElegir, onGuardar, onComparar }) {
  const [tope, setTope] = useState(null);
  const [rama, setRama] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [resultado, setResultado] = useState(null);

  function calcular() {
    const r = recomendar(indice, { tope, rama, ciudad });
    setResultado(r);
    onResultado(r.map((x) => x.id));
  }

  const ramas = indice.ramas.filter((r) => r.id !== SIN_RAMA);
  const ids = (resultado || []).map((x) => x.id);

  return (
    <section
      id="mapa-recomendador"
      aria-labelledby="mapa-recomendador-titulo"
      className="mapa-ficha-entra mt-5 scroll-mt-28 rounded-[28px] border-2 border-[#F09C48]/60 bg-[#FFF6EC] p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#B8661F]">
            <Icono nombre="brujula" size={14} />
            {RECOMENDAR.rotulo}
          </p>
          <h2 id="mapa-recomendador-titulo" className="mapa-titular mt-1 text-[24px] font-bold leading-tight text-[#003648]">
            {RECOMENDAR.titulo}
          </h2>
          <p className="mt-1 text-sm text-neutral-700">{RECOMENDAR.subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={RECOMENDAR.cerrar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-[#003648] ring-1 ring-[#F09C48]/50 hover:bg-[#FFEBD6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
        >
          ×
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Pregunta numero={1} titulo={RECOMENDAR.p1}>
          {RECOMENDAR.topes.map((o) => (
            <Opcion key={String(o.valor)} activa={tope === o.valor} onClick={() => setTope(o.valor)}>
              {o.nombre}
            </Opcion>
          ))}
        </Pregunta>
        <Pregunta numero={2} titulo={RECOMENDAR.p2}>
          <label htmlFor="mapa-recomendar-rama" className="sr-only">
            {RECOMENDAR.p2}
          </label>
          <select
            id="mapa-recomendar-rama"
            value={rama || ""}
            onChange={(e) => setRama(e.target.value || null)}
            className="w-full rounded-2xl border border-[#CFE6FD] bg-white px-3 py-2.5 text-sm font-semibold text-[#003648] focus:outline-none focus:ring-4 focus:ring-[#96CCFC]"
          >
            <option value="">{RECOMENDAR.igual}</option>
            {ramas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </Pregunta>
        <Pregunta numero={3} titulo={RECOMENDAR.p3}>
          <Opcion activa={ciudad === "grande"} onClick={() => setCiudad("grande")}>
            {RECOMENDAR.grande}
          </Opcion>
          <Opcion activa={ciudad === "tranquila"} onClick={() => setCiudad("tranquila")}>
            {RECOMENDAR.tranquila}
          </Opcion>
          <Opcion activa={ciudad === null} onClick={() => setCiudad(null)}>
            {RECOMENDAR.igual}
          </Opcion>
        </Pregunta>
      </div>

      <button
        type="button"
        onClick={calcular}
        className="mapa-boton mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#003648] px-5 py-3 text-sm font-extrabold text-white sm:w-auto focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
      >
        <Icono nombre="destello" size={17} />
        {resultado ? RECOMENDAR.recalcular : RECOMENDAR.ver}
      </button>

      {resultado && (
        <div className="mt-5" aria-live="polite">
          {resultado.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#003648] ring-1 ring-[#F09C48]/40">{RECOMENDAR.vacio}</p>
          ) : (
            <>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#B8661F]">{RECOMENDAR.resultado}</h3>
              <ol className="mt-2 grid gap-2 md:grid-cols-3">
                {resultado.map((r, i) => (
                  <li key={r.id} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#F09C48]/40">
                    <span className="mapa-titular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F09C48] text-base font-bold text-[#003648]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="mapa-titular text-base font-bold leading-tight text-[#003648]">{r.nombre}</p>
                      <p className="mt-0.5 text-xs leading-snug text-neutral-800">{r.motivo}</p>
                      <button
                        type="button"
                        onClick={() => onElegir("comunidad", r.id)}
                        className="mt-1 text-xs font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
                      >
                        {RECOMENDAR.verMapa}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003648]"
                >
                  <Icono nombre="calendario" size={17} />
                  {RECOMENDAR.sesion}
                </a>
                <button
                  type="button"
                  onClick={() => onGuardar("comunidad", ids)}
                  className="mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#003648] ring-1 ring-[#96CCFC] hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
                >
                  <Icono nombre="documento" size={17} />
                  {RECOMENDAR.guardar}
                </button>
                <button
                  type="button"
                  onClick={() => onComparar(ids)}
                  className="mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-[#003648] ring-1 ring-[#003648]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
                >
                  <Icono nombre="balanza" size={17} />
                  {RECOMENDAR.comparar}
                </button>
              </div>
            </>
          )}
          <p className="mt-3 text-[11px] leading-snug text-neutral-700">{RECOMENDAR.transparencia(CIUDAD_GRANDE)}</p>
        </div>
      )}
    </section>
  );
}
