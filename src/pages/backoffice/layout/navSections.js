import {
  LayoutDashboard, Calendar, FileText, Calculator, TrendingUp, Users,
  GraduationCap, BookOpen, FolderOpen, CheckSquare, UserCog, Layers,
  Tag, Mail, Settings,
} from "lucide-react";

// Cada ítem puede llevar `perm` (clave del checklist de Roles y Permisos) o
// `adminOnly: true` (fijo, no configurable). Sin ninguno de los dos, el
// ítem es visible para cualquier rol interno logueado.
// Compartido entre Sidebar (desktop) y MobileDrawer (móvil) para no duplicar.
export const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard",   href: "/backoffice/dashboard", perm: "dashboard.ver", icon: LayoutDashboard },
      { label: "Agenda",      href: "/backoffice/agenda", icon: Calendar },
      { label: "Solicitudes", href: "/backoffice/solicitudes", icon: FileText },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Presupuestos Portal",   href: "/backoffice/presupuestos", icon: Calculator },
      { label: "Calculadora — Leads",   href: "/backoffice/calculadora", icon: TrendingUp },
      { label: "Clientes",              href: "/backoffice/clientes", icon: Users },
      { label: "Tracker Universidades", href: "/backoffice/tracker-universidades", perm: "tracker.ver", icon: GraduationCap },
    ],
  },
  {
    label: "Operación",
    items: [
      { label: "Catálogo Másteres",      href: "/backoffice/catalogo-masters", perm: "catalogo.ver", icon: BookOpen },
      { label: "Documentos",             href: "/backoffice/documentos", icon: FolderOpen },
      { label: "Checklist / Instructivos", href: "/backoffice/checklist-servicios", alsoActive: ["/backoffice/instructivos"], perm: "checklist.ver", icon: CheckSquare },
      { label: "Panel Asesoras",         href: "/backoffice/panel-asesoras", perm: "panel_asesoras.ver", icon: UserCog },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Planes",            href: "/backoffice/planes", perm: "planes.ver", icon: Layers },
      { label: "Precios/Servicios", href: "/backoffice/precios", perm: "precios.ver", icon: Tag },
      { label: "Correos / Media",   href: "/backoffice/correos", alsoActive: ["/backoffice/media"], adminOnly: true, icon: Mail },
      { label: "Settings",          href: "/backoffice/settings", adminOnly: true, icon: Settings },
    ],
  },
];

export function initials(user) {
  if (!user) return "IL";
  if (user.nombre) return user.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (user.email || "IL").slice(0, 2).toUpperCase();
}
