// src/pages/mapa/Comparador.jsx
// Hasta 3 comunidades o 3 universidades lado a lado, en una tabla con barras
// (en móvil se desplaza en horizontal). No se mezclan tipos: las filas no
// serían las mismas. Las filas opcionales (precio por año, titularidad,
// ranking) solo salen si alguno de los elementos tiene ese dato. Sin enlaces a
// webs de universidades (decisión del cliente, 14/09/2026).
//
// Barras: un solo tono, cada una con su cifra al lado; la longitud es relativa
// al mayor de la fila.
import Icono from "../../components/common/Icono";
import IconoMapa from "./IconosMapa";
import { precioDeUniversidad, ramaPrincipal } from "./indice";
import { tonoDe } from "./tonosMapa";
import { gastoMensual } from "./vida";
import { BotonGuardar } from "./GuardarComparativa";
import { PAQUETE, PRECIO, VIDA, eur, etiquetaLista, importeMatricula, mayus, numero, textoRanking } from "./mapaTextos";

function Marca({ children }) {
  return (
    <span className="ml-1.5 inline-block rounded-full bg-[#F09C48]/25 px-2 py-0.5 align-middle text-[10px] font-extrabold text-[#003648]">
      {children}
    </span>
  );
}

function ConBarra({ texto, valor, max, marca }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-1">
        <span className="font-bold tabular-nums text-[#003648]">{texto}</span>
        {marca}
      </div>
      {valor != null && max > 0 && (
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E6F2FE]" aria-hidden="true">
          <div className="mapa-barra h-2 rounded-full bg-[#0A5873]" style={{ width: `${Math.max(4, (valor / max) * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

const textoRama = (indice, conteo) => {
  const r = ramaPrincipal(conteo, indice.ramas);
  return r ? `${r.nombre} (${numero(r.n)})` : "—";
};

const maximo = (valores) => Math.max(0, ...valores.filter((v) => Number.isFinite(v)));

function filaPrecio(precioDe, items, extremos) {
  const max = maximo(items.map((it) => precioDe(it)?.tipico));
  return {
    id: "precio",
    etiqueta: "Matrícula de un máster por año (lo habitual)",
    opcional: (it) => !!precioDe(it),
    valor: (it) => {
      const p = precioDe(it);
      return p ? (
        <ConBarra
          texto={`≈ ${eur(Math.round(p.tipico))}`}
          valor={p.tipico}
          max={max}
          marca={extremos.precio === it.id && <Marca>el más bajo</Marca>}
        />
      ) : (
        "—"
      );
    },
  };
}

/** «Gasto mensual de un estudiante» (solo si la API trae `comunidad.vida`). */
function filaGasto(gastoDe, items) {
  const max = maximo(items.map((it) => gastoDe(it)?.medio));
  return {
    id: "gasto",
    etiqueta: VIDA.fila,
    opcional: (it) => !!gastoDe(it),
    valor: (it) => {
      const g = gastoDe(it);
      return g ? (
        <>
          <ConBarra texto={g.texto} valor={g.medio} max={max} />
          <span className="mt-1 block text-[11px] text-neutral-700">
            {VIDA.aproximado} · {g.detalle}
          </span>
        </>
      ) : (
        "—"
      );
    },
  };
}

/** Celda del paquete de postulación: nunca se confunde con la matrícula. */
const celdaPaquete = (plan) =>
  plan ? (
    <>
      <strong className="text-[#003648]">{PAQUETE.desde(plan.eur)}</strong>
      <span className="block text-xs text-neutral-700">{plan.nombre}</span>
    </>
  ) : (
    "—"
  );

function filasComunidad(indice, items, extremos) {
  const maxMatricula = maximo(items.map((c) => c.matricula?.min));
  const maxUnis = maximo(items.map((c) => c.universidades));
  const maxMasteres = maximo(items.map((c) => c.masteres));
  return [
    { id: "lista", etiqueta: "Lista", valor: (c) => etiquetaLista(indice.listas.get(c.lista)) },
    filaPrecio((c) => c.precioAnual, items, extremos),
    {
      id: "matricula",
      etiqueta: "Matrícula según la norma (60 ECTS)",
      valor: (c) => (
        <ConBarra
          texto={mayus(importeMatricula(c.matricula))}
          valor={c.matricula?.min ?? null}
          max={maxMatricula}
          marca={extremos.matricula === c.id && <Marca>la más baja</Marca>}
        />
      ),
    },
    { id: "universidades", etiqueta: "Universidades", valor: (c) => <ConBarra texto={numero(c.universidades)} valor={c.universidades} max={maxUnis} /> },
    {
      id: "masteres",
      etiqueta: "Másteres oficiales",
      valor: (c) => (
        <ConBarra texto={numero(c.masteres)} valor={c.masteres} max={maxMasteres} marca={extremos.masteres === c.id && <Marca>más oferta</Marca>} />
      ),
    },
    { id: "rama", etiqueta: "Rama con más másteres", valor: (c) => textoRama(indice, c.ramas) },
    filaGasto((c) => gastoMensual(c), items),
    { id: "postulacion", etiqueta: "Cómo se postula", valor: (c) => <span className="text-xs leading-relaxed">{c.postulacion.texto}</span> },
    { id: "plan", etiqueta: PAQUETE.fila, valor: (c) => celdaPaquete(c.plan) },
  ];
}

function filasUniversidad(indice, items, extremos) {
  const com = (u) => indice.comunidades.get(u.comunidad);
  const maxMasteres = maximo(items.map((u) => u.masteres));
  const maxMatricula = maximo(items.map((u) => com(u)?.matricula?.min));
  return [
    { id: "donde", etiqueta: "Ciudad y comunidad", valor: (u) => `${indice.ciudades.get(u.ciudad)?.nombre || u.sedes[0]} · ${com(u)?.nombre || ""}` },
    { id: "lista", etiqueta: "Lista", valor: (u) => etiquetaLista(indice.listas.get(u.lista)) },
    { id: "titularidad", etiqueta: "Titularidad", opcional: (u) => !!u.titularidad, valor: (u) => u.titularidad || "—" },
    filaPrecio((u) => precioDeUniversidad(indice, u), items, extremos),
    {
      id: "masteres",
      etiqueta: "Másteres oficiales",
      valor: (u) => (
        <ConBarra texto={numero(u.masteres)} valor={u.masteres} max={maxMasteres} marca={extremos.masteres === u.id && <Marca>más oferta</Marca>} />
      ),
    },
    { id: "rama", etiqueta: "Rama con más másteres", valor: (u) => textoRama(indice, u.ramas) },
    { id: "ranking", etiqueta: "Ranking mundial", opcional: (u) => !!textoRanking(u.ranking), valor: (u) => textoRanking(u.ranking) || "—" },
    {
      id: "matricula",
      etiqueta: "Matrícula según la norma (60 ECTS)",
      valor: (u) => (
        <ConBarra
          texto={mayus(importeMatricula(com(u)?.matricula))}
          valor={com(u)?.matricula?.min ?? null}
          max={maxMatricula}
          marca={extremos.matricula === u.id && <Marca>la más baja</Marca>}
        />
      ),
    },
    filaGasto((u) => gastoMensual(com(u), indice.ciudades.get(u.ciudad)?.nombre), items),
    { id: "plan", etiqueta: PAQUETE.fila, valor: (u) => celdaPaquete(com(u)?.plan) },
  ];
}

function calcularExtremos(items, indice, tipo) {
  if (items.length < 2) return {};
  const unico = (lista) => (lista.length === 1 ? lista[0].id : null);
  const minimoDe = (valorDe) => {
    const con = items.filter((it) => Number.isFinite(valorDe(it)));
    if (!con.length) return null;
    const min = Math.min(...con.map(valorDe));
    return unico(con.filter((it) => valorDe(it) === min));
  };
  const matriculaDe = (it) => (tipo === "comunidad" ? it.matricula : indice.comunidades.get(it.comunidad)?.matricula)?.min;
  const precioDe = (it) => (tipo === "comunidad" ? it.precioAnual : precioDeUniversidad(indice, it))?.tipico;
  const maxMasteres = Math.max(...items.map((it) => it.masteres));
  return {
    matricula: minimoDe(matriculaDe),
    precio: minimoDe(precioDe),
    masteres: unico(items.filter((it) => it.masteres === maxMasteres)),
  };
}

function IlustracionVacia() {
  return (
    <svg width="76" height="56" viewBox="0 0 76 56" aria-hidden="true">
      <rect x="2" y="50" width="72" height="3" rx="1.5" fill="#96CCFC" opacity="0.6" />
      <rect x="10" y="26" width="14" height="22" rx="4" fill="#0A5873" />
      <rect x="31" y="12" width="14" height="36" rx="4" fill="#96CCFC" />
      <rect x="52" y="32" width="14" height="16" rx="4" fill="#F09C48" />
    </svg>
  );
}

export default function Comparador({ indice, comparar, aviso, ejemplo, onQuitar, onVaciar, onVer, onProbar, onGuardar }) {
  const items = comparar.ids
    .map((id) => (comparar.tipo === "comunidad" ? indice.comunidades.get(id) : indice.universidades.get(id)))
    .filter(Boolean);
  const extremos = calcularExtremos(items, indice, comparar.tipo);
  const filas = (comparar.tipo === "comunidad" ? filasComunidad(indice, items, extremos) : filasUniversidad(indice, items, extremos)).filter(
    (f) => !f.opcional || items.some((it) => f.opcional(it))
  );
  const conPrecio = filas.some((f) => f.id === "precio");
  const nombresEjemplo = ejemplo.map((id) => indice.comunidades.get(id)?.nombre).filter(Boolean);

  return (
    <section id="mapa-comparador" aria-labelledby="mapa-comparador-titulo" className="mt-14 scroll-mt-28" data-revelar>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mapa-rotulo">
            <Icono nombre="balanza" size={14} />
            Comparador
          </p>
          <h2 id="mapa-comparador-titulo" className="mapa-titular mt-1 text-[26px] font-bold leading-tight text-[#003648]">
            Compara lado a lado
          </h2>
          <p className="mt-1 text-sm text-neutral-700">Hasta 3 comunidades o 3 universidades. Añádelas con el botón «Comparar» de su ficha.</p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {onGuardar && <BotonGuardar claro onClick={onGuardar} />}
            <button
              type="button"
              onClick={onVaciar}
              className="mov-toque inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
            >
              <IconoMapa nombre="cerrar" size={14} />
              Vaciar el comparador
            </button>
          </div>
        )}
      </div>
      {aviso && (
        <p role="status" className="mt-3 rounded-xl bg-[#F09C48]/20 px-3 py-2 text-sm font-semibold text-[#003648]">
          {aviso}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#96CCFC] bg-[#F6FBFF] px-5 py-9 text-center">
          <span className="mov-flota">
            <IlustracionVacia />
          </span>
          <p className="mapa-titular text-lg font-bold text-[#003648]">Aún no hay nada que comparar</p>
          <p className="max-w-md text-sm leading-relaxed text-neutral-700">
            Abre una comunidad o una universidad en el mapa y pulsa «Comparar». Verás cuánto cuesta un máster en cada una, su oferta y cómo se
            postula, una junto a otra.
          </p>
          {nombresEjemplo.length > 1 && (
            <button
              type="button"
              onClick={onProbar}
              className="mapa-boton mov-toque mt-1 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#003648] px-4 py-2.5 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
            >
              <Icono nombre="destello" size={16} className="text-[#F09C48]" />
              Probar con {nombresEjemplo.slice(0, -1).join(", ")} y {nombresEjemplo[nombresEjemplo.length - 1]}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* La tabla se desplaza dentro de su caja; en el teléfono eso no se
              adivina, así que se dice. Desaparece en cuanto hay sitio. */}
          <p className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-neutral-700 sm:hidden">
            <Icono nombre="toque" size={14} className="text-[#F09C48]" />
            Desliza la tabla a los lados para ver todas las columnas.
          </p>
          <div className="mt-2 overflow-x-auto rounded-3xl border border-neutral-200 bg-white sm:mt-4">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparación de {comparar.tipo === "comunidad" ? "comunidades" : "universidades"}</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-44 bg-[#F6FBFF] px-4 py-3 text-xs font-bold text-[#003648]">
                    <span className="sr-only">Dato</span>
                  </th>
                  {items.map((it) => {
                    const lista = indice.listas.get(it.lista);
                    return (
                      <th key={it.id} scope="col" className="min-w-[190px] border-l border-neutral-200 px-4 py-3 align-top">
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded ${tonoDe(lista?.id).muestra}`} />
                              <span className="mapa-titular text-base font-bold leading-tight text-[#003648]">
                                {comparar.tipo === "comunidad" ? it.nombre : it.sigla}
                              </span>
                            </span>
                            {comparar.tipo === "universidad" && <span className="mt-0.5 block text-xs font-semibold text-neutral-700">{it.nombre}</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuitar(it.id)}
                            aria-label={`Quitar ${it.nombre} del comparador`}
                            className="mov-toque inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-[#E6F2FE] hover:text-[#003648]"
                          >
                            <IconoMapa nombre="cerrar" size={12} />
                            Quitar
                          </button>
                        </span>
                        <button
                          type="button"
                          onClick={() => onVer(comparar.tipo, it.id)}
                          className="mov-toque mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
                        >
                          <Icono nombre="mapa" size={12} />
                          Ver en el mapa
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.id} className="border-t border-neutral-200">
                    <th scope="row" className="bg-[#F6FBFF] px-4 py-3 align-top text-xs font-bold text-[#003648]">
                      {f.etiqueta}
                    </th>
                    {items.map((it) => (
                      <td key={it.id} className="border-l border-neutral-200 px-4 py-3 align-top text-neutral-900">
                        {f.valor(it)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-neutral-700">
            {conPrecio ? `${PRECIO.etiqueta}. ` : ""}
            {PAQUETE.leyenda}
          </p>
        </>
      )}
    </section>
  );
}
