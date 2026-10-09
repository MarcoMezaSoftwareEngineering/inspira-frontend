// Una fila del panel de «los que no entraron»: puntuación, nombre,
// universidad y el botón de añadir o quitar en modo edición.
import { euros } from "../../../../../lib/formatos";
import { scoreChip } from "./utilidades";

export default function FilaRelacionada({ r, yaEsta, editMode, onAñadir, onQuitar }) {
  const m = r.master || {};
  const becas = [...new Set((m.becas || []).map((b) => b.entidad))];
  return (
    <li className="flex items-center gap-2 min-w-0 py-1.5 border-b border-neutral-100 last:border-0">
      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(r.score)}`}>
        {r.score != null ? `${r.score}%` : "—"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] text-neutral-700 leading-snug truncate">
          {/* Por qué está por encima o por debajo de otro con más puntuación:
              primero va lo que coincide de verdad con lo que pidió, y después
              lo que se le acerca. Sin decirlo, un 55 encima de un 79 parece
              una lista mal ordenada. */}
          {m.afinidad_deseada === "fuerte" && (
            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1 py-px mr-1.5 align-middle">coincide</span>
          )}
          {m.afinidad_deseada === "parcial" && (
            <span className="text-[9.5px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 rounded px-1 py-px mr-1.5 align-middle">se acerca</span>
          )}
          {m.nombre_limpio}
        </p>
        <p className="text-[10.5px] text-neutral-400 leading-snug truncate">
          {m.universidad?.sigla || m.universidad?.nombre_completo}
          {m.universidad?.comunidad ? ` · ${m.universidad.comunidad?.nombre ?? m.universidad.comunidad}` : ""}
          {m.precio_total_estimado != null ? ` · ${euros(Math.round(Number(m.precio_total_estimado)))}` : ""}
          {m.coincide_con ? ` · ≈ «${m.coincide_con}»` : ""}
          {becas.length ? ` · 🎓 ${becas.join(" · ")}` : ""}
        </p>
        {m.de_que_va && (
          <p className="text-[10px] text-neutral-400/90 leading-snug truncate">{m.de_que_va.replace(/ · /g, ", ")}</p>
        )}
      </div>
      {m.url_ficha && (
        <a href={m.url_ficha} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-[10px] text-neutral-400 hover:text-[#1D6A4A] px-1" title="Ver la ficha">↗</a>
      )}
      {!editMode ? null : yaEsta ? (
        <button type="button" onClick={onQuitar}
          className="ux-tap shrink-0 text-[10px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition">
          quitar
        </button>
      ) : (
        <button type="button" onClick={onAñadir}
          className="ux-tap shrink-0 text-[10px] font-bold px-2 py-1 rounded-md bg-[#E8F5EE] text-[#1D6A4A] border border-[#1D6A4A]/25 hover:bg-[#1D6A4A] hover:text-white transition">
          + añadir
        </button>
      )}
    </li>
  );
}
