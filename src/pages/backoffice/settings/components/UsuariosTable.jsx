// src/pages/backoffice/settings/components/UsuariosTable.jsx
const ROL_LABEL = { admin: "Admin", asesor: "Asesor", soporte: "Soporte" };

function fmtUltimoAcceso(iso) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UsuariosTable({ usuarios, loading, onToggleActivo, onEditClick }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-neutral-50 text-sm font-semibold text-neutral-700">
        Staff registrado
      </div>

      {loading && <div className="p-6 text-sm text-neutral-400 text-center">Cargando…</div>}

      {!loading && usuarios.length === 0 && (
        <div className="p-6 text-sm text-neutral-400 text-center">No hay usuarios que coincidan con el filtro.</div>
      )}

      {!loading && usuarios.length > 0 && (
        <>
          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Último acceso</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="border-t hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-800">{u.nombre}</td>
                    <td className="px-4 py-2.5 text-neutral-600 text-xs">{u.email}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{ROL_LABEL[u.rol] || u.rol}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500 text-xs whitespace-nowrap">{fmtUltimoAcceso(u.ultimo_login)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEditClick(u)} className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition">
                          Editar
                        </button>
                        <button
                          onClick={() => onToggleActivo(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${u.activo ? "border-red-300 text-red-600 hover:bg-red-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                        >
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil: cards */}
          <div className="sm:hidden divide-y divide-neutral-100">
            {usuarios.map((u) => (
              <div key={u.id_usuario} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{u.nombre}</p>
                    <p className="text-xs text-neutral-400">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-[11px] text-neutral-400">{ROL_LABEL[u.rol] || u.rol}</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400">Último acceso: {fmtUltimoAcceso(u.ultimo_login)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onEditClick(u)} className="flex-1 text-xs py-2 rounded-lg border border-neutral-300 text-neutral-700 font-medium active:bg-neutral-100 transition">
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleActivo(u)}
                    className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${u.activo ? "border-red-300 text-red-600 active:bg-red-50" : "border-emerald-300 text-emerald-700 active:bg-emerald-50"}`}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
