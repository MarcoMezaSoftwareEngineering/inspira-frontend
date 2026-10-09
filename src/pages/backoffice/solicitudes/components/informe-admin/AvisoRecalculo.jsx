// Lo que cambió al recalcular con el formulario de hoy: qué entró, qué
// cambió de puntuación y qué dejó de salir.
import { scoreChip } from "./utilidades";

export default function AvisoRecalculo({
  nuevosCandidatos, aplicarRecalculo, setNuevosCandidatos,
}) {
  return (
    <div className="mx-5 mt-4 rounded-xl border border-[#F5C842]/60 bg-[#FFFBEA] px-4 py-3 text-xs text-neutral-700">
      <p className="font-bold text-[#7a5b00]">Recalculado con el formulario actual</p>
      {/* Con lista curada hay algo que decidir; sin ella la lista de la
          pantalla ya se ha actualizado sola y esto sólo cuenta qué pasó. */}
      <p className="mt-0.5">
        {nuevosCandidatos.nuevos.length} máster{nuevosCandidatos.nuevos.length === 1 ? "" : "es"}{" "}
        {nuevosCandidatos.esCurada ? "que no están en tu lista" : "que antes no salían"} ·{" "}
        {nuevosCandidatos.cambiados} cambiaron de puntuación
        {nuevosCandidatos.salieron ? ` · ${nuevosCandidatos.salieron} dejaron de salir` : ""}.{" "}
        {nuevosCandidatos.esCurada ? "La lista curada no se ha tocado." : "La lista de abajo ya está actualizada."}
      </p>
      {nuevosCandidatos.nuevos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {nuevosCandidatos.nuevos.slice(0, 8).map((n) => (
            <li key={n.master.id_master} className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(n.score)}`}>{n.score}%</span>
              <span className="truncate">{n.master.nombre_limpio} · {n.master.universidad?.nombre_completo}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 mt-2.5">
        {nuevosCandidatos.esCurada && (
          <button type="button" onClick={aplicarRecalculo}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:opacity-90">
            Revisar en la lista curada
          </button>
        )}
        <button type="button" onClick={() => setNuevosCandidatos(null)}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-white">
          {nuevosCandidatos.esCurada ? "Dejar como está" : "Entendido"}
        </button>
      </div>
    </div>
  );
}
