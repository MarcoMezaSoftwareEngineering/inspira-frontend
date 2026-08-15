// src/pages/backoffice/settings/components/UsuariosForm.jsx
import { useEffect, useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

const ROL_OPTIONS = [
  { value: "asesor", label: "Asesor" },
  { value: "soporte", label: "Soporte" },
  { value: "admin", label: "Admin" },
];

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-500 mt-0.5">{msg}</p>;
}

function Field({ label, required, children, error, hint, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-neutral-400">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

function inputCls(error) {
  return `border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-400 focus:ring-red-200 bg-red-50"
      : "border-neutral-300 focus:ring-primary/25 focus:border-primary"
  }`;
}

export default function UsuariosForm({
  open,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
  editingId,
}) {
  const [touched, setTouched] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstRef.current?.focus(), 80);
      setTouched({});
    }
  }, [open, editingId]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function touch(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  function handleChange(e) {
    touch(e.target.name);
    onChange(e);
  }

  const errors = {};
  if (touched.nombre && !form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (touched.email && !form.email.trim()) errors.email = "El email es obligatorio.";
  if (touched.email && form.email && !EMAIL_RE.test(form.email)) errors.email = "Email no válido.";
  if (touched.password && !editingId && !form.password) errors.password = "La contraseña es obligatoria.";
  if (touched.password && form.password && form.password.length < PASSWORD_MIN)
    errors.password = `Mínimo ${PASSWORD_MIN} caracteres.`;

  const canSubmit =
    form.nombre.trim().length > 0 &&
    EMAIL_RE.test(form.email) &&
    (editingId ? !form.password || form.password.length >= PASSWORD_MIN : form.password.length >= PASSWORD_MIN) &&
    !saving;

  function handleSubmit(e) {
    setTouched({ nombre: true, email: true, password: true });
    if (!canSubmit) { e.preventDefault(); return; }
    onSubmit(e);
  }

  const titulo = editingId ? "Editar usuario" : "Nuevo usuario";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {editingId ? "Actualiza los datos de este miembro del staff." : "Crea una cuenta de acceso al backoffice."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          <form
            id="usuario-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field label="Nombre" required error={errors.nombre} className="sm:col-span-2">
              <input
                ref={firstRef}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.nombre)}
                placeholder="Nombre y apellido"
                autoComplete="off"
              />
            </Field>

            <Field label="Email" required error={errors.email} className="sm:col-span-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.email)}
                placeholder="persona@inspira.com"
                autoComplete="off"
              />
            </Field>

            <Field
              label={editingId ? "Nueva contraseña" : "Password"}
              required={!editingId}
              error={errors.password}
              hint={editingId ? "Deja vacío para no cambiarla." : `Mínimo ${PASSWORD_MIN} caracteres.`}
              className="sm:col-span-2"
            >
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.password)}
                placeholder={editingId ? "••••••••" : ""}
                autoComplete="new-password"
              />
            </Field>

            <Field label="Rol">
              <select
                name="rol"
                value={form.rol}
                onChange={onChange}
                className={`${inputCls()} bg-white`}
              >
                {ROL_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Teléfono">
              <input
                name="telefono"
                value={form.telefono}
                onChange={onChange}
                className={inputCls()}
                placeholder="+51 987 654 321"
              />
            </Field>

            <Field label="Cargo" className="sm:col-span-2">
              <input
                name="cargo"
                value={form.cargo}
                onChange={onChange}
                className={inputCls()}
                placeholder="Asesora comercial, soporte técnico…"
              />
            </Field>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="usuario-form"
            disabled={saving}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}
