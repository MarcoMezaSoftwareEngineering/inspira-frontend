// La barra inferior del móvil.
//
// En el teléfono el menú vive en el cajón, detrás del botón de arriba a la
// izquierda —la esquina más lejos del pulgar de quien sostiene el teléfono con
// una mano—. Aquí bajan los cuatro sitios donde de verdad se pasa el día, más
// «Más», que abre el cajón con los siete destinos. Cuatro y no seis: por
// debajo de 68 px por destino, el dedo empieza a fallar en una pantalla de 390.
//
// Inicio · Procesos · Clientes · Leads · Más (14/09/2026). Agenda, Herramientas
// y Configuración quedan en el cajón.
import { MoreHorizontal } from "lucide-react";
import { navigate } from "../../../services/navigate";
import { useAuth } from "../context/AuthContext";
import { NAV_SECTIONS, resolverItem, itemActivo } from "./navSections";
import ContadorTareas from "./ContadorTareas";

// Por `id` (navSections.js): el destino puede cambiar con los permisos.
// Desde el 16/09/2026: Hoy (Inicio con «Mi día») · Clientes · Tareas · Procesos.
// Leads baja al cajón: se abre menos que las tareas del día.
const PRINCIPALES = ["inicio", "clientes", "tareas", "procesos"];
const ETIQUETA_CORTA = { inicio: "Hoy" };

export default function BottomNav({ path, onMas, drawerAbierto }) {
  const auth = useAuth();

  // El mismo criterio que la barra lateral. Si divergieran, alguien vería en
  // la barra de abajo un sitio al que no puede entrar.
  const todos = NAV_SECTIONS.flatMap((s) => s.items);
  const items = PRINCIPALES
    .map((id) => todos.find((it) => it.id === id))
    .map((it) => (it ? resolverItem(it, auth) : null))
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <nav className="ux-barra-abajo" aria-label="Navegación principal">
      {items.map((it) => {
        const Icono = it.icon;
        const on = itemActivo(it, path) && !drawerAbierto;
        return (
          <button key={it.id} type="button"
            className="ux-nav-item" data-on={on ? "1" : "0"}
            aria-current={on ? "page" : undefined}
            onClick={() => navigate(it.href)}>
            <span className="ux-nav-icono relative">
              <Icono size={21} strokeWidth={on ? 2.4 : 1.9} />
              {it.id === "tareas" && (
                <span className="absolute -top-1.5 left-[14px] [&>span]:!ml-0 [&>span]:!h-[17px] [&>span]:!min-w-[17px] [&>span]:!text-[9.5px] [&>span]:!bg-[#e5533d] [&>span]:!text-white">
                  <ContadorTareas />
                </span>
              )}
            </span>
            {ETIQUETA_CORTA[it.id] || it.label}
          </button>
        );
      })}

      <button type="button"
        className="ux-nav-item" data-on={drawerAbierto ? "1" : "0"}
        aria-label="Ver todas las secciones"
        aria-expanded={drawerAbierto}
        onClick={onMas}>
        <span className="ux-nav-icono">
          <MoreHorizontal size={21} strokeWidth={drawerAbierto ? 2.4 : 1.9} />
        </span>
        Más
      </button>
    </nav>
  );
}
