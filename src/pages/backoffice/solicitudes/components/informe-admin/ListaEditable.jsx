// Modo edición: la lista curada con flechas, puesto, puntuación y quitar.
import MasterRowAdmin from "./MasterRowAdmin";

export default function ListaEditable({
  listaEdit, FINALISTAS, moverArriba, moverAbajo, eliminarItem, moverAPosicion, cambiarScore,
}) {
  return (
    <div>
      {listaEdit.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
          <span className="text-3xl">📋</span>
          <p className="text-xs text-neutral-400">Lista vacía. Busca y añade programas arriba.</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {listaEdit.map((r, i) => (
            <div key={r.master.id_master}>
              {/* Dónde acaba lo que el asesorado lee como su lista. Se
                  reordena con las flechas, así que el corte es algo
                  que el asesor decide, no algo que le pasa. */}
              {i === FINALISTAS && (
                <div className="flex items-center gap-2 my-3 px-1">
                  <div className="flex-1 h-px bg-[#F5C842]" />
                  <span className="text-[10px] font-bold text-[#7a5b00] uppercase tracking-wide whitespace-nowrap">
                    hasta aquí su lista · lo de abajo va como extras
                  </span>
                  <div className="flex-1 h-px bg-[#F5C842]" />
                </div>
              )}
              <div className={i >= FINALISTAS ? "opacity-60" : ""}>
                <MasterRowAdmin
                  posicion={i + 1}
                  resultado={r}
                  editMode={true}
                  esFirst={i === 0}
                  esLast={i === listaEdit.length - 1}
                  onArriba={() => moverArriba(i)}
                  onAbajo={() => moverAbajo(i)}
                  onEliminar={() => eliminarItem(i)}
                  onPosicion={(v) => moverAPosicion(i, v)}
                  onScoreChange={(v) => cambiarScore(i, v)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
