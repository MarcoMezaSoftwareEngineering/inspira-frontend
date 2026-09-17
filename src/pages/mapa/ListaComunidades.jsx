// src/pages/mapa/ListaComunidades.jsx
// La misma información del mapa, en texto: todas las comunidades agrupadas
// por lista, con su matrícula y sus recuentos. Es la vía para lectores de
// pantalla y para quien prefiere leer a tocar un mapa; cada una abre su ficha.
//
// Con «Mejor ranking primero», dentro de cada lista van primero las comunidades
// cuya mejor universidad tiene mejor puesto en QS, y se dice cuál es.
import Icono from "../../components/common/Icono";
import { cascada } from "../../lib/revelar";
import { mejorRanking } from "./indice";
import { tonoDe } from "./tonosMapa";
import { PAQUETE, eur, etiquetaLista, importeMatricula, mayus, plural } from "./mapaTextos";

export default function ListaComunidades({ indice, geoPorId, filtros, foco, orden = "masteres", onElegir }) {
  const porRanking = orden === "ranking";
  const mejorDe = (c) => mejorRanking(indice, c.universidadesIds);
  const grupos = indice.datos.listas.map((l) => ({
    lista: l,
    comunidades: l.comunidades
      .map((id) => indice.comunidades.get(id))
      .filter(Boolean)
      .sort((a, b) =>
        porRanking
          ? (mejorDe(a)?.posicion ?? Infinity) - (mejorDe(b)?.posicion ?? Infinity)
          : (a.matricula?.min ?? Infinity) - (b.matricula?.min ?? Infinity)
      ),
  }));
  const fuera = indice.datos.fueraDeListas.comunidades.map((id) => ({ id, nombre: geoPorId.get(id)?.nombre || id }));
  const paso = cascada(90);

  return (
    <section aria-labelledby="mapa-lista-titulo" className="mt-14" data-revelar>
      <p className="mapa-rotulo">
        <Icono nombre="libro" size={14} />
        En texto
      </p>
      <h2 id="mapa-lista-titulo" className="mapa-titular mt-1 text-[26px] font-bold leading-tight text-[#003648]">
        Cuánto cuesta un máster en cada comunidad
      </h2>
      <p className="mt-1 text-sm text-neutral-700">
        {porRanking ? "Ordenadas por su universidad mejor situada en el ranking QS" : "Ordenadas por matrícula orientativa"} dentro de cada lista. Toca
        una para abrir su ficha en el mapa.
      </p>
      <p className="mt-1 text-xs text-neutral-700">
        La cifra de la derecha es la matrícula de un máster al año. {PAQUETE.leyenda}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {grupos.map(({ lista, comunidades }) => (
          <div key={lista.id} data-revelar="suave" style={paso()} className="mapa-tarjeta p-4">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-[#003648]">
              <span aria-hidden="true" className={`h-3.5 w-3.5 rounded ${tonoDe(lista.id).muestra}`} />
              <span className="mapa-titular text-base">{etiquetaLista(lista)}</span>
              <span className="font-semibold text-neutral-700">· {PAQUETE.desdeCorto(lista.desde)}</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {comunidades.map((c) => {
                const activa = foco.comunidad === c.id;
                const noCumple = filtros.activos && !filtros.comunidades.has(c.id);
                const mejor = porRanking ? mejorDe(c) : null;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={activa}
                      onClick={() => onElegir("comunidad", c.id)}
                      className={`mapa-boton mov-toque flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
                        activa ? "border-[#0A5873] bg-[#E6F2FE]" : "border-neutral-200 bg-white"
                      } ${noCumple ? "opacity-55" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#003648]">{c.nombre}</span>
                        <span className="block text-xs text-neutral-700">
                          {plural(c.universidades, "universidad", "universidades")} · {plural(c.masteres, "máster", "másteres")}
                          {noCumple ? " · no cumple los filtros" : ""}
                        </span>
                        {porRanking && (
                          <span className="block text-[11px] font-semibold text-[#0A5873]">
                            {mejor ? `Mejor en QS: ${mejor.u.sigla}, puesto ${String(mejor.u.ranking.posicion).replace(/^=/, "").replace("-", "–")}` : "Sin universidades en QS"}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-right text-xs font-extrabold text-[#003648]">
                        {c.precioAnual ? `Máster ≈ ${eur(Math.round(c.precioAnual.tipico))}` : mayus(importeMatricula(c.matricula))}
                        {(c.precioAnual || !c.matricula?.cadaUniversidad) && (
                          <span className="block font-semibold text-neutral-700">matrícula al año</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {fuera.length > 0 && (
        <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-700">
          <span className="inline-flex items-center gap-2 font-bold text-[#003648]">
            <span aria-hidden="true" className="h-3.5 w-3.5 rounded bg-[#E3E9EF] ring-1 ring-neutral-300" />
            Fuera de las listas:
          </span>
          {fuera.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onElegir("comunidad", f.id)}
              className="mapa-boton mov-toque inline-flex min-h-[44px] items-center rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-bold text-[#003648] hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
            >
              {f.nombre}
            </button>
          ))}
          <span className="text-xs">Sin universidades en nuestras listas: te hacemos un presupuesto personalizado.</span>
        </p>
      )}
    </section>
  );
}
