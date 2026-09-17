// Lo que se le dice al subir un documento, en el sitio donde lo sube.
//
// Tres momentos y un solo componente, para que en todas las tarjetas (máster,
// visado, estancia, modificatoria) suene y se vea igual:
//   · antes de subir, si algo no cuadra: borrosa, una sola cara, pesa mucho;
//   · si no se puede subir, por qué y qué hacer;
//   · después, que ha llegado y qué pasa ahora.
//
// Los avisos no bloquean. Ofrecen «Subir igualmente» porque quien tiene el
// documento delante sabe más que un cálculo sobre píxeles.
//
// Estilos en styles/panel-documentos.css (pnl-arch-*).
import { useRef } from "react";

function IconoCamara() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

/**
 * «Hacer foto»: abre la cámara trasera directamente en el móvil.
 *
 * En el ordenador se oculta por CSS (puntero fino): ahí `capture` no hace nada
 * y sería un segundo botón que abre el mismo selector.
 */
export function BotonHacerFoto({ onFotos, disabled, className = "" }) {
  return (
    <label className={`pnl-arch-foto ${className}`} data-off={disabled ? "1" : "0"}>
      <IconoCamara />
      Hacer foto
      <input type="file" accept="image/*" capture="environment" className="pnl-arch-oculto"
        disabled={disabled}
        onChange={(e) => { onFotos(e.target.files); e.target.value = ""; }} />
    </label>
  );
}

export default function AvisoArchivo({ subida, onElegirOtra }) {
  const masFotos = useRef(null);
  const { preparando, error, pendiente, recibido } = subida;

  if (preparando) {
    return (
      <p className="pnl-arch-estado" role="status">
        <span className="pnl-arch-giro" aria-hidden="true" />
        Preparando tu archivo…
      </p>
    );
  }

  if (error) {
    return (
      <div className="pnl-arch-aviso" data-tono="error" role="alert">
        <p>{error}</p>
        {onElegirOtra && (
          <div className="pnl-arch-botones">
            <button type="button" className="pnl-btn"
              onClick={() => { subida.setError(""); onElegirOtra(); }}>
              Elegir otro archivo
            </button>
          </div>
        )}
      </div>
    );
  }

  if (pendiente) {
    const faltaCara = pendiente.avisos.some((a) => a.tipo === "paginas");
    return (
      <div className="pnl-arch-aviso" data-tono="aviso" role="alert">
        <ul>
          {pendiente.avisos.map((a) => <li key={a.tipo}>{a.mensaje}</li>)}
        </ul>
        <div className="pnl-arch-botones">
          <button type="button" className="pnl-btn-cta" onClick={subida.confirmar}>
            Subir igualmente
          </button>
          {faltaCara && pendiente.desdeFotos && (
            <button type="button" className="pnl-btn" onClick={() => masFotos.current?.click()}>
              Añadir otra foto
            </button>
          )}
          <button type="button" className="pnl-btn"
            onClick={() => { subida.descartar(); onElegirOtra?.(); }}>
            Elegir otra
          </button>
        </div>
        {/* Sin `capture`: la otra cara puede estar ya en la galería. */}
        <input ref={masFotos} type="file" accept="image/*" multiple className="pnl-arch-oculto"
          onChange={(e) => { subida.anadir(e.target.files); e.target.value = ""; }} />
      </div>
    );
  }

  if (recibido) {
    return (
      <div className="pnl-arch-aviso" data-tono="ok" role="status">
        <p><b>Recibido.</b> Tu asesor lo revisa y te avisaremos aquí y por correo.</p>
        <button type="button" className="pnl-arch-cerrar" onClick={subida.cerrarRecibido}
          aria-label="Cerrar aviso">×</button>
      </div>
    );
  }

  return null;
}
