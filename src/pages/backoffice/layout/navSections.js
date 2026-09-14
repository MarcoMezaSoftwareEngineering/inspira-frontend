import {
  LayoutDashboard, Calendar, FileText, TrendingUp, Users, Settings, Wrench, Wallet,
} from "lucide-react";

// El menú de Inspira Core. Lo leen la barra lateral (Sidebar), el cajón del
// móvil (MobileDrawer) y la barra de abajo (BottomNav): un solo sitio para los
// tres, para que nunca enseñen cosas distintas.
//
// Ocho destinos: los siete de la reducción aprobada por el cliente
// (14/09/2026) más Pagos, que es trabajo de cada día y tiene pantalla propia:
//
//   Inicio · Procesos · Clientes · Agenda · Leads · Pagos · Herramientas · Configuración
//
// Antes eran trece: Presupuesto, Buscador de másteres, Universidades, Tracker y
// Sistematizador estaban sueltos en el menú y otra vez como tarjetas de
// Herramientas, y había pantallas a las que solo se llegaba escribiendo la URL.
// Dónde quedó cada cosa (ninguna ruta se ha borrado; todas siguen respondiendo
// y encienden su sección en el menú):
//
//   - Procesos: Solicitudes (/backoffice/solicitudes) y Panel Asesoras
//     (/backoffice/panel-asesoras), que son el mismo dato mirado por servicio.
//   - Leads: la bandeja y, en pestaña, «Solicitudes web»
//     (/backoffice/presupuestos). La calculadora vieja (/backoffice/calculadora)
//     sigue sin entrada propia.
//   - Herramientas: tarjetas de Cotizador (/backoffice/presupuesto), Guías,
//     Buscador de másteres, Universidades, Sistematizador, Tracker
//     Universidades y Mantenimiento del catálogo, cada una según su permiso.
//   - Configuración: pestañas de Planes, Precios, Documentos, Checklist,
//     Instructivos, Correos, Media, Legal, Settings y Registro de cambios.
//
// Permisos: `perm` (clave del checklist de Roles y Permisos), `adminOnly: true`
// o `anyPerm: [...]` (admin o alguno de esos permisos). Sin ninguno, lo ve
// cualquier rol interno. `sinPermiso` es el destino para quien no tiene el
// permiso pero sí algo que ver dentro de la sección: Leads lleva entonces a
// «Solicitudes web», que nunca pidió permiso, y nadie pierde un sitio al que ya
// llegaba desde el menú.
//
// `id` no cambia aunque cambie el destino: por él busca la barra de abajo.
// `exacto` son rutas que encienden el ítem solo si coinciden enteras.
export const NAV_SECTIONS = [
  {
    label: null,
    items: [
      {
        id: "inicio", label: "Inicio", href: "/backoffice/dashboard",
        exacto: ["/backoffice"], perm: "dashboard.ver", icon: LayoutDashboard,
      },
      {
        id: "procesos", label: "Procesos", href: "/backoffice/procesos",
        alsoActive: ["/backoffice/solicitudes", "/backoffice/panel-asesoras"],
        icon: FileText,
      },
      { id: "clientes", label: "Clientes", href: "/backoffice/clientes", icon: Users },
      { id: "agenda", label: "Agenda", href: "/backoffice/agenda", icon: Calendar },
      {
        id: "leads", label: "Leads", href: "/backoffice/leads",
        perm: "leads.ver", sinPermiso: "/backoffice/presupuestos",
        alsoActive: ["/backoffice/presupuestos", "/backoffice/calculadora"],
        icon: TrendingUp,
      },
      // Pagos: cobros, comprobantes por validar y planes de pago. Entrada
      // propia y no dentro de Clientes: se abre a diario y la barra «Hoy» y
      // los correos internos enlazan aquí (?cliente=, ?pago=). No entra en la
      // barra de abajo del móvil: está en el cajón («Más»).
      {
        id: "pagos", label: "Pagos", href: "/backoffice/pagos",
        perm: "pagos.ver", icon: Wallet,
      },
      // ── Hueco reservado: «Tareas» ────────────────────────────────────────
      // Todavía no tiene pantalla: NO se añade hasta que exista. Iría aquí,
      // junto a Pagos, porque es trabajo de cada día:
      //
      //   { id: "tareas", label: "Tareas", href: "/backoffice/tareas", perm: "<clave>", icon: ListChecks },
      //
      // Al activarlo: la ruta en BackofficeApp.jsx, la clave de permiso en el
      // backend (backoffice/permisos.catalog.js) y el icono en el import de arriba.
      {
        id: "herramientas", label: "Herramientas", href: "/backoffice/herramientas",
        alsoActive: [
          "/backoffice/presupuesto", "/backoffice/guias", "/backoffice/masteres",
          "/backoffice/universidades", "/backoffice/sistematizador",
          "/backoffice/tracker-universidades", "/backoffice/catalogo-masters",
        ],
        icon: Wrench,
      },
      {
        id: "configuracion", label: "Configuración", href: "/backoffice/configuracion",
        alsoActive: [
          "/backoffice/planes", "/backoffice/precios", "/backoffice/documentos",
          "/backoffice/checklist-servicios", "/backoffice/instructivos",
          "/backoffice/correos", "/backoffice/media", "/backoffice/legal",
          "/backoffice/settings", "/backoffice/auditoria",
        ],
        icon: Settings,
      },
    ],
  },
];

/**
 * El ítem tal como lo ve este usuario: con su destino si puede entrar, con el
 * destino alternativo (`sinPermiso`) si lo tiene, o null si no le toca verlo.
 * `auth` es lo que devuelve useAuth(): { isAdmin, hasPermission }.
 */
export function resolverItem(item, { isAdmin, hasPermission }) {
  const permitido = item.adminOnly
    ? isAdmin
    : item.anyPerm
      ? isAdmin || item.anyPerm.some((p) => hasPermission(p))
      : item.perm
        ? hasPermission(item.perm)
        : true;
  if (permitido) return item;
  return item.sinPermiso ? { ...item, href: item.sinPermiso } : null;
}

/** Las secciones con solo los ítems que este usuario ve (y sin secciones vacías). */
export function itemsVisibles(auth) {
  return NAV_SECTIONS
    .map((s) => ({ ...s, items: s.items.map((it) => resolverItem(it, auth)).filter(Boolean) }))
    .filter((s) => s.items.length > 0);
}

/** ¿Está esta ruta dentro de la sección del ítem? */
export function itemActivo(item, path) {
  if ((item.exacto || []).includes(path)) return true;
  return [item.href, ...(item.alsoActive || [])]
    .some((r) => path === r || path.startsWith(`${r}/`));
}

export function initials(user) {
  if (!user) return "IL";
  if (user.nombre) return user.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (user.email || "IL").slice(0, 2).toUpperCase();
}
