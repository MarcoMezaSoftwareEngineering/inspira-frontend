function initials(user) {
  if (!user) return "IL";
  if (user.nombre) {
    return user.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
  return (user.email || "IL").slice(0, 2).toUpperCase();
}

export default function Topbar({ user, onLogout, onMenuToggle }) {
  return (
    <header
      style={{ zIndex: 50 }}
      className="relative w-full bg-white border-b border-neutral-200 px-4 py-2.5 flex justify-between items-center shrink-0"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Menú"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-neutral-100 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-primary font-semibold text-sm hidden sm:block">Inspira Core</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs font-semibold text-neutral-700">{user?.nombre || user?.email || "Usuario"}</span>
          <span className="text-[10px] text-neutral-400 capitalize">{user?.rol || "—"}</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#1a5c3a] text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
          {initials(user)}
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition text-sm font-medium"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
