/* ── 0 · Flujo ───────────────────────────────────────────────────────────── */

import Cabecera from "./Cabecera";
import { TONOS } from "./constantes";

export default function Flujo({ revision, onCambiar, guardando }) {
  const recorrido = revision?.recorrido || [];
  const etapa = revision?.etapa;
  if (!etapa) return null;

  return (
    <div id="bloque-flujo" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="0" titulo="Dónde está el expediente"
        extra={
          <span className={`ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${TONOS[etapa.tono]}`}>
            {etapa.asesor}
          </span>
        } />

      {/* Los pasos son botones: mover el expediente es la acción más frecuente
          de esta pantalla, y esconderla en un desplegable la vuelve lenta. */}
      <div className="flex flex-wrap gap-1.5">
        {recorrido.map((e) => (
          <button
            key={e.clave} type="button" disabled={guardando}
            onClick={() => onCambiar(e.clave)}
            className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              e.actual ? `${TONOS[e.tono]} ring-1 ring-offset-1 ring-[#023A4B]`
                : e.pasada ? "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/25"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
            } disabled:opacity-50`}
          >
            {e.pasada && "✓ "}{e.asesor}
          </button>
        ))}
        <button type="button" disabled={guardando} onClick={() => onCambiar("DESFAVORABLE")}
          className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-200
            text-red-600 hover:bg-red-50 disabled:opacity-50">
          Desfavorable
        </button>
      </div>

      <p className="text-[11.5px] text-neutral-500 mt-2.5 leading-relaxed">
        El asesorado ve «{etapa.cliente}»: {etapa.explica_cliente}
      </p>
    </div>
  );
}
