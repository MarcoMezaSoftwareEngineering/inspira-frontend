// La navegación del teléfono, al alcance del pulgar.
//
// Hasta el 17/09/2026 todo el panel se recorría desde el botón ☰ de arriba a
// la izquierda: la esquina más lejana del pulgar y un cajón que hay que abrir
// para saber qué hay. Las cuatro pantallas que más se usan van ahora abajo, a
// un toque; el resto (guías, becas, «¿Cómo funciona?», cerrar sesión) sigue
// en el menú, que abre «Más».
//
// No sale dentro de un expediente: allí mandan su propia barra de secciones
// y los botones de guardar fijos abajo.
import Icono from "../../../components/common/Icono";

function IconoMas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" />
    </svg>
  );
}

export default function BarraPestanas({ tab, pendientes = 0, conPagos = false, conRuta = false, menuAbierto = false, onIr, onMas }) {
  const pestanas = [
    { clave: "inicio", icono: "panel", texto: "Inicio", badge: pendientes },
    { clave: "servicios", icono: "maletin", texto: "Servicios" },
    conPagos
      ? { clave: "pagos", icono: "euro", texto: "Pagos" }
      : conRuta ? { clave: "ruta", icono: "avion", texto: "Mi ruta" } : null,
    { clave: "perfil", icono: "usuario", texto: "Perfil" },
    { clave: "mas", texto: "Más" },
  ].filter(Boolean);

  const activa = menuAbierto ? "mas" : tab;
  const i = pestanas.findIndex((p) => p.clave === activa);

  return (
    <nav
      className="pnl-tabbar md:hidden"
      aria-label="Navegación principal"
      data-tour="menu"
      data-sin-activo={i < 0 ? "1" : undefined}
      style={{ "--n": pestanas.length, "--i": Math.max(0, i) }}
    >
      <span className="pnl-tabbar-pildora" aria-hidden="true" />
      {pestanas.map((p) => (
        <button
          key={p.clave}
          type="button"
          className="pnl-tab"
          aria-current={activa === p.clave ? "page" : undefined}
          aria-label={p.badge ? `${p.texto}, ${p.badge} pendientes` : p.texto}
          onClick={() => {
            try { navigator.vibrate?.(5); } catch { /* sin vibración */ }
            if (p.clave === "mas") onMas?.();
            else onIr?.(p.clave);
          }}
        >
          {p.clave === "mas" ? <IconoMas /> : <Icono nombre={p.icono} size={20} />}
          <span>{p.texto}</span>
          {p.badge > 0 && <span className="pnl-tab-badge" aria-hidden="true">{p.badge > 9 ? "9+" : p.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
