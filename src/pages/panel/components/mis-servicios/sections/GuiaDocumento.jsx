// La ficha de un documento de la guía: qué es, por qué importa, qué verificar
// antes de subirlo y cómo debe verse (modelo real con los datos tapados).
//
// Se monta dentro de la tarjeta del checklist («¿Cómo debe verse?») y en la
// guía completa de Instructivos. El modelo se abre a tamaño completo en un
// visor propio: en el móvil instalado no hay pestañas nuevas que valgan.
import { useEffect, useState } from "react";

function Visor({ modelo, onCerrar }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);
  return (
    <div className="fixed inset-0 z-[80] bg-black/85 flex flex-col" onClick={onCerrar} role="dialog" aria-label={modelo.pie}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/90 shrink-0">
        <p className="text-[12.5px] leading-snug">{modelo.pie}</p>
        <button type="button" onClick={onCerrar} className="ux-tap text-[13px] font-bold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25">Cerrar ✕</button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-2 pb-4">
        <img src={modelo.src} alt={modelo.pie} className="mx-auto max-w-full h-auto rounded-md shadow-2xl bg-white" onClick={(e) => e.stopPropagation()} />
      </div>
    </div>
  );
}

export default function GuiaDocumento({ guia, compacta = false }) {
  const [abierto, setAbierto] = useState(null);
  if (!guia) return null;

  return (
    <div className={compacta ? "space-y-3" : "space-y-4"}>
      {!compacta && (
        <div>
          <p className="text-[13px] text-neutral-700 leading-relaxed">{guia.que_es}</p>
        </div>
      )}
      <div className="rounded-xl bg-primary/5 border border-primary/10 px-3.5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary-light mb-1">Por qué importa</p>
        <p className="text-[12.5px] text-neutral-700 leading-relaxed">{guia.por_que}</p>
      </div>
      {guia.verifica?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">
            {guia.conjunto ? "Cómo lo hacemos entre los dos" : "Antes de subirlo, verifica"}
          </p>
          <ul className="space-y-1.5">
            {guia.verifica.map((v) => (
              <li key={v} className="flex gap-2 text-[12.5px] text-neutral-700 leading-snug">
                <span className="text-accent font-black shrink-0">✓</span><span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {guia.enlaces?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {guia.enlaces.map((e) => (
            <a key={e.url} href={e.url} target="_blank" rel="noopener noreferrer"
              className="ux-tap inline-flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-2 rounded-full bg-primary text-white hover:opacity-90">
              {e.label} ↗
            </a>
          ))}
        </div>
      )}
      {guia.modelos?.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Así debe verse</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
            {guia.modelos.map((m) => (
              <button key={m.src} type="button" onClick={() => setAbierto(m)}
                className="ux-tap shrink-0 w-[112px] text-left group" title={m.pie}>
                <span className="block w-[112px] h-[150px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm group-hover:border-primary/40 group-hover:shadow">
                  <img src={m.src} alt={m.pie} loading="lazy" className="w-full h-full object-cover object-top" />
                </span>
                <span className="block text-[10.5px] text-neutral-500 leading-snug mt-1 line-clamp-2">{m.pie}</span>
              </button>
            ))}
          </div>
          <p className="text-[10.5px] text-neutral-400 mt-1">Modelos reales con los datos personales tapados. Toca uno para verlo grande.</p>
        </div>
      ) : (
        !compacta && <p className="text-[11.5px] text-neutral-400">Tu asesor te facilita el modelo o el formato de solicitud cuando haga falta.</p>
      )}
      {abierto && <Visor modelo={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  );
}
