import BaremoMaster from "../../../../../components/BaremoMaster";
import { numero } from "../../../../../lib/formatos";
import ScoreRing from "./ScoreRing";
import { durLabel, scoreChip } from "./utilidades";

// ── Master row ─────────────────────────────────────────────────────────────────

export default function MasterRowAdmin({ posicion, resultado, editMode, onArriba, onAbajo, onEliminar, onScoreChange, onPosicion, esFirst, esLast }) {
  const { master, score } = resultado;
  const dur = durLabel(master.duracion_anios);
  const precioFinal = master.precio_final != null
    ? { texto: `€${numero(Math.round(master.precio_final))}`, esRef: false }
    : master.precio_total_estimado != null
    ? { texto: `€${numero(Math.round(master.precio_total_estimado))}`, esRef: true }
    : null;

  const numBg =
    posicion === 1 ? "bg-[#1A3557] text-white"
    : posicion === 2 ? "bg-[#1D6A4A] text-white"
    : posicion === 3 ? "bg-amber-400 text-white"
    : "bg-neutral-100 text-neutral-500";

  return (
    // `min-w-0` en la propia fila: como hija de una rejilla o de un flex, sin
    // esto su mínimo es el ancho natural del contenido y se sale del móvil
    // por la derecha en vez de encoger.
    <div className={`group relative flex items-start gap-3 min-w-0 w-full p-3 sm:p-3.5 rounded-2xl transition-all duration-200 ${
      editMode
        ? "ux-tarjeta"
        : "border border-transparent hover:bg-neutral-50/80 md:rounded-xl"
    }`}>

      {/* Reorder arrows */}
      {editMode && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onArriba} disabled={esFirst}
            className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-150">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={onAbajo} disabled={esLast}
            className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-150">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Número de posición. En edición se escribe encima: el asesor ordena
          sus seis preferencias del Distrito Único poniendo 1, 2, 3… en vez de
          subir un máster doce veces con la flecha. */}
      {editMode && onPosicion ? (
        <input
          type="number"
          min="1"
          defaultValue={posicion}
          key={posicion}
          title="Escribe en qué puesto lo quieres y pulsa Enter"
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (!v || v === posicion) { e.target.value = posicion; return; }
            onPosicion(v);
          }}
          className={`shrink-0 w-7 h-7 mt-0.5 rounded-full text-[11px] font-bold text-center outline-none border-0 focus:ring-2 focus:ring-[#1D6A4A]/40 ${numBg}`}
        />
      ) : (
        <div className={`shrink-0 w-6 h-6 mt-0.5 rounded-full text-[11px] font-bold flex items-center justify-center ${numBg}`}>
          {posicion}
        </div>
      )}

      {/* Datos máster */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] sm:text-[13px] font-semibold text-[#1A3557] leading-snug">{master.nombre_limpio}</p>
        <p className="text-[11.5px] text-neutral-500 leading-snug mt-1 truncate">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
          {master.universidad.comunidad ? ` · ${master.universidad.comunidad?.nombre ?? master.universidad.comunidad}` : ""}
        </p>
        {/* De qué va según su ficha. Es lo que mira ahora el motor además del
            nombre, así que el asesor tiene que poder verlo para comprobar si
            entendió bien el máster. */}
        {master.de_que_va && (
          <p className="text-[10.5px] text-neutral-400 leading-snug mt-1 truncate">
            <span className="font-semibold text-neutral-500">De qué va:</span> {master.de_que_va.replace(/ · /g, ", ")}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {precioFinal && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              precioFinal.esRef
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-neutral-100 text-neutral-500"
            }`}>
              {precioFinal.texto}{precioFinal.esRef ? " (ref.)" : ""}
            </span>
          )}
          {dur && (
            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md">{dur}</span>
          )}
          {/* Con qué de lo que escribió coincide este máster. Decía siempre «lo
              pidió por su nombre», y desde el 09/09/2026 un tema de interés
              también cuenta como fuerte: hay que decir cuál, que es lo que le
              permite al asesor ver si el motor entendió lo que pidió. */}
          {master.afinidad_deseada && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
              master.afinidad_deseada === "fuerte"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-emerald-50/50 text-emerald-600/90 border-emerald-100"
            }`}>
              {master.coincide_con
                ? `${master.afinidad_deseada === "fuerte" ? "" : "se acerca a "}«${master.coincide_con}»`
                : "coincide con lo que pidió"}
            </span>
          )}
          {master.es_ancla && (
            <span className="text-[10px] font-semibold bg-[#EEF2F8] text-[#1A3557] border border-[#c9d6e6] px-1.5 py-0.5 rounded-md">
              el enlace que pegó
            </span>
          )}
          {/* Quién lo paga. Va junto al precio a propósito: un máster de 5.044 €
              con Fundación Carolina no es un máster de 5.044 €, y es la mitad
              de la conversación que la asesora tiene con el asesorado. */}
          {(master.becas || []).length > 0 && (
            <span className="text-[10px] font-semibold bg-[#FFF7E0] text-[#7a5b00] border border-[#F5C842] px-1.5 py-0.5 rounded-md"
              title={master.becas.map((b) => `${b.nombre} (${b.curso})${b.nota_minima ? ` · nota ≥ ${b.nota_minima}` : ""}${b.confianza === "probable" ? " · emparejado por nombre, conviene confirmarlo" : ""}`).join("\n")}>
              🎓 {[...new Set(master.becas.map((b) => b.entidad))].join(" · ")}
              {master.becas.some((b) => b.confianza === "probable") ? " (por confirmar)" : ""}
            </span>
          )}
          {/* El máster que él eligió sale siempre, aunque no cuadre. Si no
              cuadra hay que decir por qué: es de lo que va a preguntar. */}
          {master.es_ancla && master.motivo_descarte && (
            <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-md"
              title="El máster que eligió el asesorado no pasa sus propios filtros. Sale igual para que pueda hablarlo con él.">
              {master.motivo_descarte}
            </span>
          )}
          {/* Qué dice la lista de titulaciones de acceso del máster sobre su
              carrera. Sin lista no se dice nada: no saber no es no admitir. */}
          {master.acceso_titulo === "directo" && (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md">
              admite su carrera
            </span>
          )}
          {master.acceso_titulo === "afin" && (
            <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-md">
              carrera afín en su lista
            </span>
          )}
          {master.acceso_titulo === "fuera" && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md"
              title="El máster publica qué carreras admite y la del asesorado no está. Conviene confirmarlo con la universidad.">
              su carrera no está en la lista de acceso
            </span>
          )}
          {master.es_titulo_oficial === false && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
              título propio
            </span>
          )}
          {/* Consta en el registro del Ministerio pero el censo no lo encontró
              en la web de la universidad: hay que comprobar que se siga
              ofertando antes de publicarlo. */}
          {master.estado_ficha === "no_hallado" && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md"
              title="Está en el RUCT pero no aparece en la web de su universidad: confirmar que se sigue ofertando">
              sin confirmar en su web
            </span>
          )}
          {!editMode && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(score)}`}>
              {score != null ? `${score}% match` : "Sin score"}
            </span>
          )}
        </div>

        {/* El asesor tiene que poder abrir la ficha desde aquí: es lo que va a
            mirar antes de decidir si el máster entra en el informe, y es el
            mismo enlace que le llegará al asesorado. */}
        {(master.url_ficha || master.universidad?.url) && (
          <a href={master.url_ficha || master.universidad.url}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ux-tap inline-flex items-center gap-1 mt-2 py-1.5 pr-2 text-[11.5px] font-semibold text-[#1D6A4A] hover:underline">
            {master.url_ficha ? "Ver la ficha del máster" : "Ver la web de la universidad"}
            <span aria-hidden="true">↗</span>
          </a>
        )}

        {/* La baremación. En modo edición estorba —ahí se ordena y se puntúa—,
            así que solo se enseña al revisar. */}
        {!editMode && master.baremo?.length > 0 && (
          <BaremoMaster baremo={master.baremo} maxVisible={3} compacto />
        )}
      </div>

      {/* Score: ring en vista, input editable en edición */}
      {editMode ? (
        <div className="shrink-0 flex flex-col items-center gap-0.5 w-14">
          <input
            type="number"
            min="0"
            max="100"
            value={score ?? ""}
            placeholder="—"
            onChange={(e) => {
              const v = e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value)));
              onScoreChange?.(v);
            }}
            className="w-full text-center text-[12px] font-bold border border-neutral-200 rounded-lg px-1 py-1 outline-none focus:border-[#1D6A4A] focus:ring-1 focus:ring-[#1D6A4A]/20 bg-white transition-all"
          />
          <span className="text-[9px] text-neutral-400">match %</span>
        </div>
      ) : (
        <ScoreRing score={score} />
      )}

      {/* Quitar de la lista.
          Estaba en `opacity-0 group-hover:opacity-100`: en el ratón aparecía al
          pasar por encima y en una tableta no aparecía nunca, así que el asesor
          entraba a editar y no encontraba cómo quitar nada. Ahora se ve
          siempre, con su rótulo, que es la acción que más usa. */}
      {editMode && (
        <button onClick={onEliminar} title="Quitar de la lista" aria-label="Quitar de la lista"
          className="ux-tap shrink-0 flex items-center gap-1 h-8 px-2 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 ml-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline text-[10.5px] font-bold">quitar</span>
        </button>
      )}
    </div>
  );
}
