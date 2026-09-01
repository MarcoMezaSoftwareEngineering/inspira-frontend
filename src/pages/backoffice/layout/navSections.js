import {
  LayoutDashboard, Calendar, FileText, Calculator, TrendingUp, Users,
  GraduationCap, Settings, Wrench,
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
// Ocho destinos. Se probo con seis y se quedo corto: el tracker de
// universidades y los leads son herramientas de uso diario, no configuracion,
// y esconderlas bajo otra seccion las volvia inencontrables.
//
// Lo que si desaparecio del menu son las vistas duplicadas: Solicitudes vive
// dentro de Procesos, y Catalogo, Documentos y Checklist bajo Configuracion.
// Ninguna ruta se ha borrado.
// Un solo panel. Los seguimientos por servicio (tracker de master, tracker de
// visado, panel de asesoras) NO son secciones aparte: son pestanas dentro de
// Procesos, porque son el mismo dato mirado por servicio.
//
// Ninguna ruta se ha borrado: las antiguas siguen respondiendo.
// El tracker de universidades es seccion propia: es una herramienta de trabajo
// distinta —una hoja de seguimiento por universidad— y meterla dentro de
// Procesos la volvia inencontrable.
//
// Ninguna ruta se ha borrado: las antiguas siguen respondiendo.
export const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/backoffice/dashboard", perm: "dashboard.ver", icon: LayoutDashboard },
      {
        label: "Procesos",
        href: "/backoffice/procesos",
        alsoActive: ["/backoffice/solicitudes"],
        icon: FileText,
      },
      { label: "Clientes", href: "/backoffice/clientes", icon: Users },
      { label: "Herramientas", href: "/backoffice/herramientas", icon: Wrench },
      {
        label: "Tracker Universidades",
        href: "/backoffice/tracker-universidades",
        alsoActive: ["/backoffice/panel-asesoras"],
        perm: "tracker.ver",
        icon: GraduationCap,
      },
      { label: "Agenda",   href: "/backoffice/agenda", icon: Calendar },
      { label: "Leads",    href: "/backoffice/calculadora", icon: TrendingUp },
      { label: "Finanzas", href: "/backoffice/presupuestos", icon: Calculator },
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
