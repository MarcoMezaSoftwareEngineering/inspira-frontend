import { useEffect } from "react";
import { X } from "lucide-react";
import { navigate } from "../../../services/navigate";
import { useAuth } from "../context/AuthContext";
import { NAV_SECTIONS, initials } from "./navSections";

export default function MobileDrawer({ open, onClose, path, user, onLogout }) {
  const { isAdmin, hasPermission } = useAuth();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function itemVisible(item) {
    if (item.adminOnly) return isAdmin;
    if (item.perm) return hasPermission(item.perm);
    return true;
  }

  function handleNavClick(href, e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    onClose();
    navigate(href);
  }

  return (
    <div
      className={`md:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className="absolute inset-y-0 left-0 w-[min(86vw,320px)] flex flex-col text-white shadow-2xl transition-transform duration-200"
        style={{
          background: "linear-gradient(180deg,#124f35 0%,#0b3f2a 100%)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
          <span className="text-sm font-bold">Inspira Backoffice</span>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex items-center justify-center w-11 h-11 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(itemVisible);
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <p className="px-3 mb-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/35 select-none">
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
                          "flex items-center gap-3 w-full text-left px-3 py-3 rounded-[11px] transition-colors text-[14px] font-medium no-underline",
                          active
                            ? "bg-white/[0.14] font-semibold text-white shadow-[inset_3px_0_0_#67d49a]"
                            : "text-white/75 hover:bg-white/[0.08] hover:text-white",
                        ].join(" ")}
                      >
                        {Icon && <Icon className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={1.8} />}
                        <span className="truncate">{it.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {user && (
          <div className="shrink-0 border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
                {initials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user.nombre || user.email || "Usuario"}</p>
                <p className="text-[11px] text-white/40 capitalize">{user.rol || "—"}</p>
              </div>
              <button
                onClick={onLogout}
                className="shrink-0 text-[13px] text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
