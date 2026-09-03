// La barra inferior del móvil.
//
// El menú del asesor tiene trece destinos. En escritorio caben en la barra
// lateral y se ven todos a la vez; en el móvil vivían detrás del botón de
// hamburguesa, arriba a la izquierda —la esquina más lejos del pulgar de
// quien sostiene el teléfono con una mano—. Para cambiar de sección había que
// recolocar el móvil, abrir el cajón, buscar en una lista de trece y pulsar.
//
// Aquí bajan los cuatro sitios donde de verdad se pasa el día, más el acceso
// al resto. Cuatro y no seis: por debajo de 68px por destino, el dedo empieza
// a fallar en una pantalla de 390.
//
// El cajón NO desaparece: sigue teniendo los trece, y este es el atajo a los
// que se usan siempre. Quitar el cajón dejaría lo demás inalcanzable.
import { MoreHorizontal } from "lucide-react";
import { navigate } from "../../../services/navigate";
import { useAuth } from "../context/AuthContext";
import { NAV_SECTIONS } from "./navSections";

// Los cuatro, en el orden del día de trabajo: se mira qué hay, se atiende a
// quien lo pide, se busca lo que necesita y se consulta la agenda.
const PRINCIPALES = [
  "/backoffice/dashboard",
  "/backoffice/procesos",
  "/backoffice/clientes",
  "/backoffice/masteres",
];

// Rótulos cortos: en 78px de ancho, «Buscador de másteres» sale en tres
// líneas o cortado, y las dos cosas se leen peor que una palabra.
const CORTO = {
  "/backoffice/dashboard": "Inicio",
  "/backoffice/procesos": "Procesos",
  "/backoffice/clientes": "Clientes",
  "/backoffice/masteres": "Másteres",
};

export default function BottomNav({ path, onMas, drawerAbierto }) {
  const { isAdmin, hasPermission } = useAuth();

  // El mismo criterio que la barra lateral. Si divergieran, alguien vería en
  // la barra de abajo un sitio al que no puede entrar.
  function visible(item) {
    if (item.adminOnly) return isAdmin;
    if (item.anyPerm) return isAdmin || item.anyPerm.some((p) => hasPermission(p));
    if (item.perm) return hasPermission(item.perm);
    return true;
  }

  const todos = NAV_SECTIONS.flatMap((s) => s.items);
  const items = PRINCIPALES
    .map((href) => todos.find((it) => it.href === href))
    .filter((it) => it && visible(it));

  if (!items.length) return null;

  function activo(it) {
    return path === it.href
      || path.startsWith(it.href + "/")
      || (it.alsoActive || []).some((p) => path === p || path.startsWith(p + "/"));
  }

  return (
    <nav className="ux-barra-abajo" aria-label="Navegación principal">
      {items.map((it) => {
        const Icono = it.icon;
        const on = activo(it) && !drawerAbierto;
        return (
          <button key={it.href} type="button"
            className="ux-nav-item" data-on={on ? "1" : "0"}
            aria-current={on ? "page" : undefined}
            onClick={() => navigate(it.href)}>
            <span className="ux-nav-icono">
              <Icono size={21} strokeWidth={on ? 2.4 : 1.9} />
            </span>
            {CORTO[it.href] || it.label}
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
