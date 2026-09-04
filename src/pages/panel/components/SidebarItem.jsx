// src/pages/panel/components/SidebarItem.jsx
import Icono from "../../../components/common/Icono";

/**
 * Un ítem del menú lateral.
 *
 * Los iconos eran emoji (👤 📁 🎓). Cada sistema operativo los dibuja a su
 * manera y con su propio color, así que el menú se veía distinto en cada
 * ordenador y nunca combinaba con la paleta. Ahora usa el mismo juego de
 * trazo que la portada, que hereda el color del contenedor.
 */
/**
 * @param badge  cuántas cosas esperan detrás de este destino; se pinta como
 *               contador a la derecha. Cero o nada: no se pinta.
 * @param sub    ítem secundario, colgado del anterior (los expedientes bajo
 *               «Mis servicios»).
 */
export default function SidebarItem({ label, active, onClick, icono, badge = 0, sub = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`pnl-item${active ? " activo" : ""}${sub ? " pnl-sub" : ""}`}
    >
      {icono && <Icono nombre={icono} size={sub ? 14 : 17} />}
      <span className="pnl-item-texto">{label}</span>
      {badge > 0 && <span className="pnl-badge" aria-label={`${badge} pendientes`}>{badge}</span>}
    </button>
  );
}
