// Piezas del expediente que comparten estancia y modificatoria.
//
// Estaban copiadas tal cual en los dos archivos —bloque, paso, estado del
// proceso, quién más entra, cómo escanear— y cada retoque había que hacerlo
// dos veces o se olvidaba en uno. Aquí viven una vez.
import { useState } from "react";

import Icono from "../../../../components/common/Icono";
import IconoPaso from "../../../../components/common/IconoPaso";
import { IconoCamara } from "./AvisoArchivo";

// El tono de la etapa (lo manda el servidor) en los cinco del panel; el color
// lo pone styles/panel/tramites.css con data-tono. El violeta se retira.
const TONO_ETAPA = { neutral: "neutro", azul: "info", ambar: "aviso", violeta: "info", rojo: "alto", verde: "ok" };

function Chevron({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** El triángulo de aviso, en línea: IconoPaso no lo trae como trazo («alert» cae en «info»). */
function Alerta({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  );
}

// El chevrón y el triángulo, para las piezas del expediente que no traen el suyo.
export { Chevron as ChevronPlegable, Alerta as IconoAlerta };

// Estilos en styles/panel-app.css (pnl-bloque, pnl-paso, pnl-estado), pisados
// desde styles/panel/tramites.css: el bloque abierto se ilumina y su contenido
// se despliega en vez de aparecer.
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
        <span className="pnl-paso-num">
          {completo ? <IconoPaso nombre="check" className="w-3.5 h-3.5" strokeWidth={2.6} /> : numero}
        </span>
        <span className="pnl-paso-txt">
          <b>{titulo}</b>
          {subtitulo && <span>{subtitulo}</span>}
        </span>
        {!completo && <span className="pnl-chip pnl-paso-faltan" data-talla="sm" data-tono="aviso">faltan {faltan}</span>}
        <Chevron className="pnl-paso-chev" />
      </button>
      {abierto && (
        <div className="pnl-paso-cuerpo">
          {children}
          {onSiguiente && (
            <div className="pnl-paso-pie">
              <button type="button" onClick={onSiguiente} className="pnl-btn-primario ux-tap">
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
  // «Etapa n de m» (Carina, 02/11/2026): la posición de la etapa activa en el
  // recorrido tal como lo manda el servidor; cómo se calcula no cambia.
  const nActual = recorrido.findIndex((e) => e.actual) + 1;
  if (!etapa) return null;
  return (
    <div className="pnl-estado">
      <p className="pnl-eyebrow pnl-estado-eyebrow">En qué va tu expediente</p>
      <p className="pnl-estado-etapa" data-tono={TONO_ETAPA[etapa.tono] || "neutro"}>{etapa.cliente}</p>
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
      {nActual > 0 && <p className="pnl-estado-meta">Etapa {nActual} de {recorrido.length}</p>}
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

    <div className="pnl-aviso pnl-aviso-arriba" data-tono="info">
      <span className="pnl-aviso-icono" aria-hidden="true"><Icono nombre="usuarios" size={16} /></span>
      <div className="pnl-aviso-texto">
        <p className="m-0">
          <b>{plural ? "Otras personas entran" : "Otra persona entra"} a tu expediente</b>
        </p>

        <p className="pnl-aviso-detalle">
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

    <div className="pnl-aviso pnl-aviso-arriba" data-tono="info">
      <span className="pnl-aviso-icono" aria-hidden="true"><Icono nombre="usuarios" size={16} /></span>
      <p className="pnl-aviso-texto">
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

    <div className="pnl-ayuda" data-tono="info" data-abierta={abierto ? "1" : "0"}>
      <button type="button" onClick={() => setAbierto((v) => !v)}

        className="pnl-ayuda-cab" aria-expanded={abierto}>
        <span className="pnl-ayuda-ico" aria-hidden="true"><IconoCamara /></span>
        <span className="pnl-ayuda-txt">
          <span className="pnl-ayuda-resumen">Cómo escanear: un archivo, nítido, menos de 4 MB</span>
        </span>

        <Chevron className="pnl-chev" />
      </button>

      {abierto && (

        <p className="pnl-ayuda-cuerpo">
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
