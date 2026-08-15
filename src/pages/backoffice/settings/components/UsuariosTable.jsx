// src/pages/backoffice/settings/components/UsuariosTable.jsx
const ROL_LABEL = { admin: "Admin", asesor: "Asesor", soporte: "Soporte" };
const ROL_COLOR = {
  admin: { bg: "#1A3557", badge: "bg-[#1A3557]/10 text-[#1A3557]" },
  asesor: { bg: "#1a5c3a", badge: "bg-secondary text-primary" },
  soporte: { bg: "#D88436", badge: "bg-amber-50 text-amber-700" },
};

function initials(nombre, email) {
  const base = (nombre || email || "?").trim();
  if (!base) return "?";
  return base.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmtUltimoAcceso(iso) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function UsuarioCard({ u, onEditClick, onToggleActivo }) {
  const rolColor = ROL_COLOR[u.rol] || ROL_COLOR.asesor;
  const ini = initials(u.nombre, u.email);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1" style={{ backgroundColor: u.activo ? "#1D6A4A" : "#d1d5db" }} />

      <div className="p-4 flex-1 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 select-none"
            style={{ backgroundColor: rolColor.bg }}
          >
            {ini}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-neutral-900 text-sm leading-tight truncate">{u.nombre || "—"}</p>
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium leading-none ${
                  u.activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-emerald-500" : "bg-red-500"}`} />
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{u.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${rolColor.badge}`}>
            {ROL_LABEL[u.rol] || u.rol}
          </span>
          {u.cargo && <span className="text-[11px] text-neutral-400 truncate">{u.cargo}</span>}
        </div>

        <div className="space-y-1.5">
          {u.telefono && (
            <div className="flex gap-2 text-xs">
              <span className="text-neutral-400 w-16 shrink-0">Teléfono</span>
              <span className="text-neutral-700 truncate">{u.telefono}</span>
            </div>
          )}
          <div className="flex gap-2 text-xs">
            <span className="text-neutral-400 w-16 shrink-0">Últ. acceso</span>
            <span className="text-neutral-500 truncate">{fmtUltimoAcceso(u.ultimo_login)}</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onEditClick(u)}
            className="py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:border-[#1A3557] hover:text-[#1A3557] transition-colors font-medium"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleActivo(u)}
            className={`py-1.5 text-xs border rounded-lg transition-colors font-medium ${
              u.activo
                ? "border-red-200 text-red-500 hover:bg-red-50"
                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {u.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosTable({ usuarios, loading, onToggleActivo, onEditClick }) {
  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-10 text-center text-sm text-neutral-400">
        Cargando…
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-10 text-center text-sm text-neutral-400">
        No hay usuarios que coincidan con el filtro.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {usuarios.map((u) => (
        <UsuarioCard key={u.id_usuario} u={u} onEditClick={onEditClick} onToggleActivo={onToggleActivo} />
      ))}
    </div>
  );
}
