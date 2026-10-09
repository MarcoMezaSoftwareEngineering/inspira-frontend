// Un documento de la lista: su estado, sus archivos, sus observaciones y los
// botones de aprobar, observar y subir.
import { useState } from "react";
import { boPATCH, boPOST } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";
import Observacion from "./Observacion";
import { ESTADO_DOC, input } from "./constantes";

export default function FilaDocumento({ id, clave, def, onCambio, onSubir, subiendo, onVer }) {
  const [observando, setObservando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ultimo = def.archivos[0];
  const est = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;

  async function revisar(estado, observacion) {
    if (!ultimo) return;
    setEnviando(true);
    // Una observación sobre un documento ya observado se añade a las que tiene;
    // el PATCH de revisión sólo se usa para la primera y para aprobar.
    const yaObservado = def.estado === "OBSERVADO" && estado === "OBSERVADO";
    const r = yaObservado
      ? await boPOST(
        `/backoffice/solicitudes/${id}/modificatoria/documentos/archivo/${ultimo.id_documento}/observaciones`,
        { texto: observacion },
      )
      : await boPATCH(
        `/backoffice/solicitudes/${id}/modificatoria/documentos/archivo/${ultimo.id_documento}/revision`,
        { estado, observacion },
      );
    setEnviando(false);
    if (r?.ok) { setObservando(false); setTexto(""); onCambio(); }
    else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }

  const fondo =
    def.estado === "APROBADO" ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/40"
      : def.estado === "OBSERVADO" ? "border-red-300 bg-red-50/50"
      : def.estado === "PENDIENTE" ? "border-amber-300 bg-amber-50/40"
      : "border-neutral-200 bg-white";

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${fondo}`}>
      <div className="flex items-start gap-2.5">
        <span className={`shrink-0 mt-0.5 text-[15px] font-bold leading-none ${est.clase}`}>
          {est.icono}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12.5px] font-semibold text-neutral-800">{def.etiqueta}</span>
            {def.obligatorio && def.estado === "SIN_SUBIR" && (
              <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
                rounded bg-neutral-100 text-neutral-500">obligatorio</span>
            )}
            {ultimo?.subido_por_quien && (
          <span className="text-[10.5px] text-neutral-400 truncate max-w-[30%]"
            title={`Lo subió ${ultimo.subido_por_quien}`}>
            {ultimo.subido_por_quien}
          </span>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wide ${est.clase}`}>
              {est.label}
            </span>
          </div>

          {def.requisito && (
            <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{def.requisito}</p>
          )}

          {def.archivos.map((a) => (
            <button type="button" key={a.id_documento}
              onClick={() => onVer(a)}
              className="block text-[11.5px] text-[#046C8C] hover:underline truncate mt-1">
              📄 {a.nombre}
            </button>
          ))}

          {(ultimo?.observaciones || []).map((o) => (
            <Observacion key={o.id_observacion} id={id} obs={o} onCambio={onCambio} />
          ))}

          {observando && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <input autoFocus className={`${input} flex-1 min-w-[160px]`}
                placeholder="Qué tiene que corregir…"
                value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && texto.trim() && revisar("OBSERVADO", texto)} />
              <button type="button" disabled={!texto.trim() || enviando}
                onClick={() => revisar("OBSERVADO", texto)}
                className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-600
                  text-white disabled:opacity-40">Observar</button>
              <button type="button" onClick={() => setObservando(false)}
                className="text-[11.5px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          {ultimo && !observando && (
            <>
              {def.estado !== "APROBADO" && (
                <button type="button" disabled={enviando} onClick={() => revisar("APROBADO")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                    border-[#1D6A4A]/40 text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-40">
                  Aprobar
                </button>
              )}
              <button type="button" disabled={enviando} onClick={() => setObservando(true)}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                  border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
                {def.estado === "OBSERVADO" ? "+ observación" : "Observar"}
              </button>
            </>
          )}
          {def.de === "asesor" && (
            <label className="text-[11px] font-semibold text-[#023A4B] cursor-pointer hover:underline px-1">
              {subiendo === clave ? "…" : def.archivos.length ? "reemplazar" : "subir"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => onSubir(clave, e.target.files?.[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
