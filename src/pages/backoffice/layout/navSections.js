import {
  LayoutDashboard, Calendar, FileText, Calculator, Users, Settings,
} from "lucide-react";

// Cada ítem puede llevar `perm` (clave del checklist de Roles y Permisos),
// `adminOnly: true` (fijo, no configurable) o `anyPerm: [...]` (visible para
// admin o para quien tenga alguno de esos permisos). Sin ninguno de los tres,
// el ítem es visible para cualquier rol interno logueado.
// Compartido entre Sidebar (desktop) y MobileDrawer (móvil) para no duplicar.
// Un solo bloque, seis destinos. Antes eran once items repartidos en cuatro
// grupos, y varios eran vistas distintas de lo mismo: Solicitudes, Panel
// Asesoras y Tracker leen todos la tabla `Solicitud`. Ahora hay un unico
// sitio donde estan los procesos, y lo demas se agrupa por para que sirve.
//
// Las rutas antiguas siguen funcionando: solo dejan de tener entrada propia
// en el menu. Nada se ha borrado.
export const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/backoffice/dashboard", perm: "dashboard.ver", icon: LayoutDashboard },
      { label: "Clientes",  href: "/backoffice/clientes", icon: Users },
      {
        label: "Procesos",
        href: "/backoffice/procesos",
        // Solicitudes y Panel Asesoras siguen accesibles y marcan este item
        // como activo mientras dure la migracion.
        alsoActive: ["/backoffice/solicitudes", "/backoffice/panel-asesoras", "/backoffice/tracker-universidades"],
        icon: FileText,
      },
      { label: "Agenda",    href: "/backoffice/agenda", icon: Calendar },
      {
        label: "Finanzas",
        href: "/backoffice/presupuestos",
        alsoActive: ["/backoffice/calculadora"],
        icon: Calculator,
      },
      {
        label: "Configuración",
        href: "/backoffice/configuracion",
        alsoActive: [
          "/backoffice/planes", "/backoffice/precios", "/backoffice/correos",
          "/backoffice/media", "/backoffice/legal", "/backoffice/settings",
          "/backoffice/catalogo-masters", "/backoffice/documentos",
          "/backoffice/checklist-servicios", "/backoffice/instructivos",
        ],
        icon: Settings,
      },
    ],
  },
];

export function initials(user) {
  if (!user) return "IL";
  if (user.nombre) return user.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (user.email || "IL").slice(0, 2).toUpperCase();
}
