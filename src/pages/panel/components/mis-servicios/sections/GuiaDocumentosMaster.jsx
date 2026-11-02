// La guía directa de documentos del paquete máster, entera: la cadena de
// legalización que casi todo documento recorre y, documento por documento,
// qué es, por qué importa, qué verificar y cómo debe verse.
//
// Va en la sección de Instructivos, arriba de los PDF. Cada ficha se pliega:
// la lista de catorce documentos abierta de golpe sería un muro.
import { useState } from "react";
import { GUIA_DOCUMENTOS, CADENA_LEGALIZACION } from "../guiaDocumentosMaster";
import GuiaDocumento from "./GuiaDocumento";
import { IconoLinea } from "../utils";

export default function GuiaDocumentosMaster() {
  const [abierta, setAbierta] = useState(null);

  return (
    <div className="mb-5">
      <div className="pnl-guiadoc">
        <p className="pnl-guiadoc-titulo">Guía directa de documentos</p>
        <p className="pnl-guiadoc-texto">
          Qué es cada documento, por qué lo piden y cómo debe verse, con modelos reales.
          Cada documento se sube en <strong>un solo PDF con todo junto</strong>; solo la experiencia
          profesional y la formación complementaria admiten varios archivos.
        </p>

        {/* La cadena: sello → SUNEDU → apostilla */}
        <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
          {CADENA_LEGALIZACION.map((p, i) => (
            <div key={p.titulo} className="pnl-guiadoc-paso">
              <p className="pnl-eyebrow"><span className="punto" />Paso {i + 1}</p>
              <p className="pnl-guiadoc-paso-titulo">{p.titulo}</p>
              <p className="pnl-guiadoc-paso-texto">{p.texto}</p>
            </div>
          ))}
        </div>

        {/* Documento por documento */}
        <ol className="pnl-guiadoc-lista mt-4">
          {GUIA_DOCUMENTOS.map((g, i) => {
            const open = abierta === g.slug;
            return (
              <li key={g.slug}>
                <button type="button" onClick={() => setAbierta(open ? null : g.slug)}
                  className="pnl-guiadoc-fila"
                  aria-expanded={open}>
                  <span className="pnl-guiadoc-num">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="pnl-guiadoc-fila-titulo">{g.titulo}</span>
                    <span className="pnl-guiadoc-fila-texto line-clamp-1">{g.que_es}</span>
                  </span>
                  {g.conjunto && <span className="hidden sm:inline"><span className="pnl-chip" data-talla="sm" data-tono="aviso">entre los dos</span></span>}
                  {g.modelos?.length > 0 && <span className="pnl-guiadoc-modelos">{g.modelos.length} modelo{g.modelos.length > 1 ? "s" : ""}</span>}
                  <IconoLinea nombre="chevron" className="pnl-chev" />
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
