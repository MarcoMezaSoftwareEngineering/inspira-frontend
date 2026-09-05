// La guía directa de documentos del paquete máster, entera: la cadena de
// legalización que casi todo documento recorre y, documento por documento,
// qué es, por qué importa, qué verificar y cómo debe verse.
//
// Va en la sección de Instructivos, arriba de los PDF. Cada ficha se pliega:
// la lista de catorce documentos abierta de golpe sería un muro.
import { useState } from "react";
import { GUIA_DOCUMENTOS, CADENA_LEGALIZACION } from "../guiaDocumentosMaster";
import GuiaDocumento from "./GuiaDocumento";

export default function GuiaDocumentosMaster() {
  const [abierta, setAbierta] = useState(null);

  return (
    <div className="mb-5">
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] px-4 py-4 sm:px-5">
        <p className="text-[14px] font-bold text-primary">Guía directa de documentos</p>
        <p className="text-[12.5px] text-neutral-600 leading-relaxed mt-1">
          Qué es cada documento, por qué lo piden y cómo debe verse, con modelos reales.
          Cada documento se sube en <strong>un solo PDF con todo junto</strong>; solo la experiencia
          profesional y la formación complementaria admiten varios archivos.
        </p>

        {/* La cadena: sello → SUNEDU → apostilla */}
        <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
          {CADENA_LEGALIZACION.map((p, i) => (
            <div key={p.titulo} className="rounded-xl bg-white border border-neutral-200 px-3.5 py-3">
              <p className="text-[11px] font-black text-accent">Paso {i + 1}</p>
              <p className="text-[13px] font-bold text-neutral-900 leading-snug">{p.titulo}</p>
              <p className="text-[12px] text-neutral-600 leading-relaxed mt-1">{p.texto}</p>
            </div>
          ))}
        </div>

        {/* Documento por documento */}
        <ol className="mt-4 divide-y divide-neutral-200 rounded-xl bg-white border border-neutral-200 overflow-hidden">
          {GUIA_DOCUMENTOS.map((g, i) => {
            const open = abierta === g.slug;
            return (
              <li key={g.slug}>
                <button type="button" onClick={() => setAbierta(open ? null : g.slug)}
                  className="ux-tap w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-neutral-50"
                  aria-expanded={open}>
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-[12px] font-black grid place-items-center shrink-0">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-neutral-900 leading-snug">{g.titulo}</span>
                    <span className="block text-[11.5px] text-neutral-500 leading-snug line-clamp-1">{g.que_es}</span>
                  </span>
                  {g.conjunto && <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">entre los dos</span>}
                  {g.modelos?.length > 0 && <span className="text-[10px] font-semibold text-neutral-400">{g.modelos.length} modelo{g.modelos.length > 1 ? "s" : ""}</span>}
                  <span className="text-[11px] text-neutral-400">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="px-3.5 pb-4 pt-1 sm:pl-[3.25rem]">
                    <GuiaDocumento guia={g} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
