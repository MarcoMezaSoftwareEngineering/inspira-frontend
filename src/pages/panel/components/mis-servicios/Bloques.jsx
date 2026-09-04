// Piezas del expediente que comparten estancia y modificatoria.
//
// Estaban copiadas tal cual en los dos archivos —bloque, paso, estado del
// proceso, quién más entra, cómo escanear— y cada retoque había que hacerlo
// dos veces o se olvidaba en uno. Aquí viven una vez.
import { useState } from "react";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  azul:    "bg-[#EEF2F8] text-primary border-primary/20",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/30",
};

export function Bloque({ numero, titulo, subtitulo, abierto, onToggle, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50/60">
        <span className="shrink-0 w-8 h-8 rounded-xl grid place-items-center text-[13px]
          font-bold text-white font-serif" style={{ background: "#013446" }}>{numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-primary">{titulo}</span>
          {subtitulo && <span className="block text-[11.5px] text-neutral-500 mt-0.5">{subtitulo}</span>}
        </span>
        <span className="shrink-0 text-neutral-300 text-[13px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && <div className="px-4 pb-5 pt-1 border-t border-neutral-100">{children}</div>}
    </div>
  );
}

export function Paso({ numero, titulo, subtitulo, faltan, abierto, onToggle, onSiguiente, children }) {
  const completo = faltan === 0;
  return (
    <div className={`rounded-xl border overflow-hidden ${
      completo ? "border-[#1D6A4A]/25" : "border-neutral-200"
    }`}>
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-neutral-50/60">
        <span className={`shrink-0 w-6 h-6 rounded-lg grid place-items-center text-[11px] font-bold ${
          completo ? "bg-[#1D6A4A] text-white" : "bg-neutral-200 text-neutral-500"
        }`}>{completo ? "✓" : numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-neutral-800">{titulo}</span>
          {subtitulo && <span className="block text-[11px] text-neutral-400">{subtitulo}</span>}
        </span>
        {!completo && (
          <span className="shrink-0 text-[10.5px] font-bold text-amber-600">faltan {faltan}</span>
        )}
        <span className="shrink-0 text-neutral-300 text-[11px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <div className="px-3.5 pb-4 pt-1 border-t border-neutral-100">
          {children}
          {onSiguiente && (
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-100">
              <button type="button" onClick={onSiguiente}
                className="text-[12.5px] font-semibold px-4 py-2 rounded-lg
                  bg-neutral-900 text-white hover:opacity-90">
                Continuar
              </button>
              <span className="text-[11.5px] text-neutral-400">
                {completo ? "Este paso está completo" : "Puedes volver luego a lo que falta"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EstadoProceso({ revision }) {
  const etapa = revision?.etapa;
  const recorrido = revision?.recorrido || [];
  if (!etapa) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        En qué va tu expediente
      </p>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-3 ${TONOS[etapa.tono]}`}>
        <span className="text-[14px] font-bold">{etapa.cliente}</span>
      </div>
      <p className="text-[13px] text-neutral-600 leading-relaxed mb-4">{etapa.explica_cliente}</p>
      <div className="flex items-center gap-1">
        {recorrido.map((e) => (
          <div key={e.clave} className="flex-1 min-w-0" title={e.cliente}>
            <div className={`h-1.5 rounded-full ${
              e.actual ? "bg-primary" : e.pasada ? "bg-[#1D6A4A]" : "bg-neutral-200"
            }`} />
            <p className={`text-[9px] mt-1 truncate ${
              e.actual ? "text-primary font-bold" : "text-neutral-400"
            }`}>{e.cliente}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export /**
 * Quién más entra a este expediente.
 *
 * Se le enseña sin que tenga que buscarlo. Sus datos son suyos: si hay otra
 * persona entrando tiene que saberlo, y poder decir que no.
 */
function OtraPersona({ invitados }) {
  if (!invitados?.length) return null;
  const plural = invitados.length > 1;
  return (
    <div className="rounded-xl border border-primary/25 bg-[#EEF2F8]/60 px-3.5 py-3 mb-3
      flex items-start gap-2.5">
      <span className="shrink-0 text-[15px]" aria-hidden="true">👥</span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-primary">
          {plural ? "Otras personas entran" : "Otra persona entra"} a tu expediente
        </p>
        <p className="text-[12px] text-neutral-600 leading-relaxed mt-0.5">
          {invitados.map((i) => (
            <span key={i.correo} className="block">
              <b>{i.correo}</b>{i.quien ? ` · ${i.quien}` : ""}
            </span>
          ))}
          <span className="block mt-1">
            {plural ? "Ven" : "Ve"} tu expediente y {plural ? "reciben" : "recibe"} los mismos
            avisos que tú. Si prefieres que no, dínoslo y lo quitamos.
          </span>
        </p>
      </div>
    </div>
  );
}

export /**
 * Cuando quien mira NO es el titular.
 *
 * Sin esto, alguien invitado abre «Mis servicios», ve el expediente de otra
 * persona con sus apellidos y su pasaporte, y no entiende qué está pasando.
 */
function ComoInvitado({ solicitud }) {
  if (!solicitud?.invitado) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 mb-3">
      <p className="text-[12.5px] text-amber-900 leading-relaxed">
        Estás viendo el expediente de <b>{solicitud.titular}</b>, que te dio acceso. Lo que
        subas o completes aquí queda en su expediente.
      </p>
    </div>
  );
}

export /** Cómo tienen que verse los documentos. Se dice antes de que suba el primero. */
function ComoEscanear() {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-xl border border-primary/20 bg-[#EEF2F8]/50 px-3.5 py-2.5 mb-3">
      <button type="button" onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center gap-2 text-left">
        <span className="shrink-0 text-[14px]" aria-hidden="true">📷</span>
        <span className="text-[12.5px] font-semibold text-primary min-w-0 flex-1">
          Cómo escanear: un archivo, nítido, menos de 4 MB
        </span>
        <span className="shrink-0 text-neutral-400 text-[11px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <p className="text-[12.5px] text-neutral-700 leading-relaxed mt-2">
          Tienen que verse <b>nítidos y completos</b>: un documento borroso o con una esquina
          cortada te lo devuelven y hay que rehacerlo. Desde el celular puedes usar
          <b> CamScanner</b> o la app de escaneo que ya traiga tu teléfono —recorta, endereza y
          lo guarda en PDF—; y si tienes escáner a mano, mejor todavía. Foto suelta con el
          fondo de la mesa, no.
          <br /><br />
          <b>Cada documento va en un solo archivo</b>: si el pasaporte tiene diez páginas, van
          las diez en un PDF, no diez fotos sueltas. Y que <b>pese menos de 4 MB</b>. Si se te
          pasa, lo achicamos nosotros al subirlo, pero un escaneo que ya venía borroso no se
          arregla achicándolo.
        </p>
      )}
    </div>
  );
}
