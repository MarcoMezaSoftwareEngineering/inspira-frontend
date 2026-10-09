import { useMemo, useState } from "react";
import FilaRelacionada from "./FilaRelacionada";
import { filtrarRelacionados } from "./utilidades";

// ── Los que no entraron al informe ────────────────────────────────────────────
//
// Tres montones, porque con cada uno el asesor hace algo distinto: los de su
// plan se suben y ya está; los de beca dependen de conseguirla; los de fuera
// del plan hay que venderle antes esa comunidad.
//
// Iban en dos `details` que sólo mostraban veinte y sin buscador: el asesor
// decía «estoy ignorando» lo que hay debajo, y tenía razón, porque no había
// forma de mirarlo. Ahora se filtran, se ven enteros y se añaden y se quitan
// desde aquí.

export default function PanelRelacionados({ grupos, editMode, idsEnLista, onAñadir, onQuitar, onEntrarEdicion }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(grupos.find((g) => g.items.length)?.clave || null);

  // El filtro pasa cada fila del montón por `sinAcentos`, y el panel se
  // vuelve a pintar con cada cambio de la lista de arriba (cada letra del
  // buscador, cada flecha). Se recalcula solo si cambian el montón o el texto.
  // Va antes del `return null` porque un hook no puede ir detrás de un
  // retorno anticipado; `grupos` siempre trae los tres montones.
  const grupo = grupos.find((g) => g.clave === abierto) || grupos[0];
  const visibles = useMemo(() => filtrarRelacionados(grupo.items, q), [grupo.items, q]);

  const total = grupos.reduce((n, g) => n + g.items.length, 0);
  if (!total) return null;

  return (
    <div className="px-5 pb-4">
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-3.5 py-2.5 bg-neutral-50/70 border-b border-neutral-100">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[11.5px] font-bold text-[#1A3557]">
              Otros {total} máster{total === 1 ? "" : "es"} que el motor encontró
              <span className="font-normal text-neutral-400"> · no entraron en el informe</span>
            </p>
            {!editMode && (
              <button type="button" onClick={onEntrarEdicion}
                className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#175a3d] transition">
                Editar para añadirlos
              </button>
            )}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {grupos.map((g) => (
              <button key={g.clave} type="button" onClick={() => setAbierto(g.clave)}
                disabled={!g.items.length}
                className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-lg border transition disabled:opacity-35 ${
                  g.clave === grupo.clave
                    ? "bg-[#1A3557] text-white border-[#1A3557]"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                }`}>
                {g.titulo} <b>{g.items.length}</b>
              </button>
            ))}
          </div>
          <p className="text-[10.5px] text-neutral-400 mt-1.5">{grupo.sub}</p>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar por nombre, universidad o comunidad…"
            className="w-full mt-2 text-[11.5px] px-2.5 py-1.5 border border-neutral-200 rounded-lg outline-none focus:border-[#1D6A4A] focus:ring-2 focus:ring-[#1D6A4A]/10 bg-white"
          />
        </div>
        <ul className="px-3.5 max-h-[420px] overflow-y-auto">
          {visibles.length === 0 ? (
            <li className="py-4 text-center text-[11px] text-neutral-400">Ninguno coincide con «{q}».</li>
          ) : visibles.map((r) => (
            <FilaRelacionada
              key={r.master.id_master}
              r={r}
              yaEsta={idsEnLista.has(r.master.id_master)}
              editMode={editMode}
              onAñadir={() => onAñadir(r)}
              onQuitar={() => onQuitar(r.master.id_master)}
            />
          ))}
        </ul>
        {visibles.length > 0 && q && (
          <p className="px-3.5 py-2 text-[10.5px] text-neutral-400 border-t border-neutral-100">
            {visibles.length} de {grupo.items.length}
          </p>
        )}
      </div>
    </div>
  );
}
