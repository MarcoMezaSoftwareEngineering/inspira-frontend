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

function Chevron({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Estilos en styles/panel-app.css (pnl-bloque, pnl-paso, pnl-estado): el
// bloque abierto se ilumina y su contenido se despliega en vez de aparecer.
export function Bloque({ numero, titulo, subtitulo, abierto, onToggle, children }) {
  return (
    <div className="pnl-bloque" data-abierto={abierto ? "1" : "0"}>
      <button type="button" onClick={onToggle} className="pnl-bloque-cab" aria-expanded={abierto}>
        <span className="pnl-bloque-num">{numero}</span>
        <span className="pnl-bloque-txt">
          <b>{titulo}</b>
          {subtitulo && <span>{subtitulo}</span>}
        </span>
        <Chevron className="pnl-bloque-chev" />
      </button>
      {abierto && <div className="pnl-bloque-cuerpo">{children}</div>}
    </div>
  );
}

export function Paso({ numero, titulo, subtitulo, faltan, abierto, onToggle, onSiguiente, children }) {
  const completo = faltan === 0;
  return (
    <div className="pnl-paso" data-ok={completo ? "1" : "0"} data-abierto={abierto ? "1" : "0"}>
      <button type="button" onClick={onToggle} className="pnl-paso-cab" aria-expanded={abierto}>
        <span className="pnl-paso-num">{completo ? "✓" : numero}</span>
        <span className="pnl-paso-txt">
          <b>{titulo}</b>
          {subtitulo && <span>{subtitulo}</span>}
        </span>
        {!completo && <span className="pnl-paso-faltan">faltan {faltan}</span>}
        <Chevron className="pnl-bloque-chev" />
      </button>
      {abierto && (
        <div className="pnl-paso-cuerpo">
          {children}
          {onSiguiente && (
            <div className="pnl-paso-pie">
              <button type="button" onClick={onSiguiente} className="pnl-btn-cta ux-tap">
                Continuar
              </button>
              <small>{completo ? "Este paso está completo" : "Puedes volver luego a lo que falta"}</small>
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
    <div className="pnl-estado">
      <p className="pnl-estado-eyebrow">En qué va tu expediente</p>
      <span className={`pnl-estado-etapa ${TONOS[etapa.tono] || TONOS.neutral}`}>{etapa.cliente}</span>
      <p className="pnl-estado-texto">{etapa.explica_cliente}</p>
      <div className="pnl-estado-riel">
        {recorrido.map((e) => (
          <div key={e.clave} className="pnl-estado-tramo" title={e.cliente}
            data-e={e.actual ? "actual" : e.pasada ? "pasada" : "futura"}>
            <i />
            <small>{e.cliente}</small>
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
