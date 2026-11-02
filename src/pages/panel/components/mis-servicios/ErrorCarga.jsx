// El error de carga de un expediente, con «Reintentar» (Carina, 02/11/2026).
//
// Antes era un <p className="pnl-error"> sin salida: si la primera carga
// fallaba, solo quedaba recargar la página. El botón vuelve a llamar a la
// carga que cada expediente ya tiene (cargarTodo o equivalente). Sobre la caja
// .pnl-error de base.css; el aspecto en styles/panel/mejoras.css.
import { IconoAlerta } from "./Bloques";

/**
 * @param {{ mensaje: string, onReintentar: () => void, className?: string }} props
 * `className`: lo que necesite el sitio donde va (flex-1 en una fila, mb-3 en
 * una columna); la hoja no declara ni flex ni márgenes.
 */
export default function ErrorCarga({ mensaje, onReintentar, className = "" }) {
  return (
    <div className={`pnl-error pnl-error-carga ${className}`.trim()} role="alert">
      <span className="pnl-error-carga-icono" aria-hidden="true"><IconoAlerta /></span>
      <p className="pnl-error-carga-texto">{mensaje}</p>
      <button type="button" className="pnl-btn" onClick={onReintentar}>Reintentar</button>
    </div>
  );
}
