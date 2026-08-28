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
export default function SidebarItem({ label, active, onClick, icono }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`pnl-item${active ? " activo" : ""}`}
    >
      {icono && <Icono nombre={icono} size={17} />}
      {label}
    </button>
  );
}
