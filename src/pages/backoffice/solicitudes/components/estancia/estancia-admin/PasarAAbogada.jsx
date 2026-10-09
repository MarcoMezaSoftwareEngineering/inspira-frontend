import { useState } from "react";
import { boPOST } from "../../../../../../services/backofficeApi";
import { fechaLarga } from "../../../../../../lib/formatos";
import { Cabecera } from "./Cabecera";
import { input } from "./constantes";

/* ── Pasarle la carpeta a la abogada ─────────────────────────────────────── */

/**
 * Un paso distinto de cerrar la carpeta.
 *
 * Cerrarla le dice al asesorado que su parte terminó. Esto se la entrega a
 * quien la va a presentar, con el enlace directo a Drive para que no tenga que
 * buscarla entre carpetas. Son dos avisos a dos personas distintas, y hacerlos
 * a la vez obligaría a esperar a que el cliente estuviera listo para poder
 * mandarle nada a la letrada.
 */
export function PasarAAbogada({ id, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [para, setPara] = useState(exp.abogada_email || "");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const ya = exp.abogada_avisada_at;

  async function enviar() {
    setEnviando(true); setMsg("");
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/avisar-abogada`, {
      para: para.trim(),
      nota: nota.trim() || null,
    });
    setEnviando(false);
    if (r?.ok) {
      const acceso = !r.carpeta ? "sin enlace: Drive no respondió"
        : r.acceso?.nuevo ? "con el enlace y acceso a la carpeta del asesorado"
        : r.acceso?.compartida ? "con el enlace; ya tenía acceso"
        : "con el enlace, pero NO se le pudo dar acceso: compártesela a mano";
      setMsg(`Enviado a ${r.para} ${acceso}`);
      setAbierto(false);
      onHecho();
    } else {
      setMsg(r?.msg || "No se pudo enviar");
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <Cabecera numero="4b" titulo="Pasársela a la abogada"
        extra={ya ? (
          <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1
            rounded border bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35">
            avisada
          </span>
        ) : null} />

      {ya && !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Avisada el {fechaLarga(ya)}
            {exp.abogada_email && <> a <b>{exp.abogada_email}</b></>}.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg border
              border-neutral-300 text-neutral-600 hover:border-neutral-400">
            Volver a enviar
          </button>
        </div>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Le manda un correo con los datos del asesorado, la fecha de presentación y el
            enlace a la carpeta <b>de este asesorado</b>, y le da acceso a esa carpeta
            —sólo a esa— para que pueda abrirla y dejar ahí lo que llegue de extranjería.
            El estado de los documentos no va en ese correo: lo que deba saber, escríbeselo
            en la nota.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg
              bg-[#1A3557] text-white hover:opacity-90">
            Enviar a la abogada
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <p className="text-[11.5px] font-semibold text-neutral-600 mb-1">Correo de la abogada</p>
            <input type="email" value={para} onChange={(e) => setPara(e.target.value)}
              placeholder="nombre@despacho.com" className={input + " w-full"} />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold text-neutral-600 mb-1">
              Nota para ella <span className="text-neutral-400 font-normal">(opcional)</span>
            </p>
            <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
              placeholder="Cualquier cosa que deba saber antes de abrirla…"
              className={input + " w-full"} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={enviar} disabled={enviando || !para.trim()}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#1A3557]
                text-white hover:opacity-90 disabled:opacity-40">
              {enviando ? "Enviando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-700">cancelar</button>
            {msg && <span className="text-[11.5px] text-neutral-600">{msg}</span>}
          </div>
        </div>
      )}
      {!abierto && msg && <p className="text-[11.5px] text-[#1D6A4A] mt-2">{msg}</p>}
    </div>
  );
}
