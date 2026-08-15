// src/pages/backoffice/settings/components/UsuariosForm.jsx
export default function UsuariosForm({
  form,
  onChange,
  onSubmit,
  saving,
  editingId,
  onCancelEdit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border"
    >
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Nombre
        </label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={onChange}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          {editingId ? "Nueva contraseña (opcional)" : "Password"}
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder={editingId ? "Dejar vacío para no cambiarla" : ""}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          required={!editingId}
          minLength={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Rol
        </label>
        <select
          name="rol"
          value={form.rol}
          onChange={onChange}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="asesor">Asesor</option>
          <option value="soporte">Soporte</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Teléfono
        </label>
        <input
          name="telefono"
          value={form.telefono}
          onChange={onChange}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Cargo
        </label>
        <input
          name="cargo"
          value={form.cargo}
          onChange={onChange}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving
            ? editingId
              ? "Guardando..."
              : "Creando..."
            : editingId
            ? "Guardar cambios"
            : "Crear usuario"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-3 py-2 rounded-lg border text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
