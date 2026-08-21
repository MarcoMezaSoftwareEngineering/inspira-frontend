import { useRef, useState } from "react";
import { navigate } from "../../../services/navigate";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Calendar, FileText, Calculator, TrendingUp, Users,
  GraduationCap, BookOpen, FolderOpen, CheckSquare, UserCog, Layers,
  Tag, Mail, Settings,
} from "lucide-react";

// Cada ítem puede llevar `perm` (clave del checklist de Roles y Permisos) o
// `adminOnly: true` (fijo, no configurable). Sin ninguno de los dos, el
// ítem es visible para cualquier rol interno logueado.
const NAV_SECTIONS = [
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

const MIN_W = 150;
const MAX_W = 380;
const DEFAULT_W = 210;

function initials(user) {
  if (!user) return "IL";
  if (user.nombre) return user.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (user.email || "IL").slice(0, 2).toUpperCase();
}

export default function Sidebar({ path, open, onClose, pinned, onTogglePin, user, onLogout }) {
  const { isAdmin, hasPermission } = useAuth();

  function itemVisible(item) {
    if (item.adminOnly) return isAdmin;
    if (item.perm) return hasPermission(item.perm);
    return true;
  }

  const [width, setWidth] = useState(() => {
    const s = localStorage.getItem("bo_sidebar_w");
    const n = s ? parseInt(s, 10) : DEFAULT_W;
    return isNaN(n) ? DEFAULT_W : Math.max(MIN_W, Math.min(MAX_W, n));
  });
  const curW = useRef(width);
  const asideRef = useRef(null);
  const innerRef = useRef(null);

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = curW.current;
    if (asideRef.current) asideRef.current.style.transition = "none";
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    function onMove(ev) {
      const next = Math.max(MIN_W, Math.min(MAX_W, startW + ev.clientX - startX));
      curW.current = next;
      if (asideRef.current) asideRef.current.style.width = `${next}px`;
      if (innerRef.current) innerRef.current.style.minWidth = `${next}px`;
    }

    function onUp() {
      const finalW = curW.current;
      if (asideRef.current) asideRef.current.style.transition = "";
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setWidth(finalW);
      localStorage.setItem("bo_sidebar_w", String(finalW));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleNavClick(href, e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
  }

  return (
    <aside
      ref={asideRef}
      className="shrink-0 flex flex-col text-white h-full overflow-hidden relative"
      style={{
        width: open ? `${width}px` : "0px",
        transition: "width 260ms ease-in-out",
        background: "linear-gradient(180deg,#124f35 0%,#0b3f2a 100%)",
      }}
    >
      <div ref={innerRef} className="flex flex-col h-full" style={{ minWidth: `${width}px` }}>

        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0 gap-2">
          <a
            href="/backoffice/dashboard"
            onClick={(e) => handleNavClick("/backoffice/dashboard", e)}
            className="text-sm font-bold leading-tight hover:text-white/90 transition truncate"
          >
            Inspira Backoffice
          </a>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onTogglePin}
              title={pinned ? "Desanclar" : "Fijar"}
              className={`flex items-center gap-1 px-2 h-7 rounded-lg hover:bg-white/10 transition text-[11px] font-medium ${pinned ? "text-emerald-300" : "text-white/50"}`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                {pinned
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M13 9l-3 3 3 3" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M11 9l3 3-3 3" />
                }
              </svg>
              <span>{pinned ? "Fijo" : "Fijar"}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(itemVisible);
            if (visibleItems.length === 0) return null;
            return (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white/35 select-none">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((it) => {
                  const active =
                    path === it.href ||
                    path.startsWith(it.href + "/") ||
                    (it.alsoActive || []).some((p) => path === p || path.startsWith(p + "/"));
                  const Icon = it.icon;
                  return (
                    <a
                      key={it.href}
                      href={it.href}
                      onClick={(e) => handleNavClick(it.href, e)}
                      className={[
                        "flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-[11px] transition-colors text-[13px] font-medium no-underline",
                        active
                          ? "bg-white/[0.14] font-semibold text-white shadow-[inset_3px_0_0_#67d49a]"
                          : "text-white/75 hover:bg-white/[0.08] hover:text-white",
                      ].join(" ")}
                    >
                      {Icon && <Icon className="w-[17px] h-[17px] shrink-0 opacity-90" strokeWidth={1.8} />}
                      <span className="truncate">{it.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
            );
          })}
        </nav>

        {/* Footer: usuario + logout */}
        {user && (
          <div className="shrink-0 border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
                {initials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.nombre || user.email || "Usuario"}</p>
                <p className="text-[10px] text-white/40 capitalize">{user.rol || "—"}</p>
              </div>
              <button
                onClick={onLogout}
                className="shrink-0 text-[11px] text-white/50 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition"
                title="Salir"
              >
                Salir
              </button>
            </div>
          </div>
        )}

        {/* Handle resize */}
        <div
          onMouseDown={startResize}
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-white/25 active:bg-white/40 transition-colors z-10"
        />
      </div>
    </aside>
  );
}
