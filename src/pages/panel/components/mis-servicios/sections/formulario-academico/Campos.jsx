// Los controles del formulario académico: pastillas, etiquetas, campos de
// texto, botones de opción y avisos de error. Salieron de
// FormularioDatosAcademicos.jsx al partirlo en piezas (09/10/2026).

export function Pill({ active, onClick, children, error = false }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : error
          ? "border-red-300 text-neutral-700 bg-white hover:border-red-400"
          : "border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary bg-white"
      }`}>
      {children}
    </button>
  );
}

export function FLabel({ children }) {
  return (
    <p className="text-sm font-semibold text-neutral-800 mb-3">
      {children}<span className="text-red-400 ml-0.5">*</span>
    </p>
  );
}

export function EMsg({ show, msg = "Selecciona una opción para continuar" }) {
  if (!show) return null;
  return <p className="text-xs text-red-500 mt-2">⚠ {msg}</p>;
}

export function FInput({ value, onChange, placeholder, type = "text", err = false, ...rest }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full rounded-xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 transition ${
        err ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
      }`}
      {...rest} />
  );
}

export function WBtn({ active, onClick, children, err = false }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : err
          ? "border-red-300 text-neutral-700 bg-white hover:border-red-400"
          : "border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary bg-white"
      }`}>
      {active && <span className="float-right opacity-70">✓</span>}
      {children}
    </button>
  );
}

export function ErrBox({ show, children }) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      <span className="text-base shrink-0 mt-0.5">⚠</span>
      <span>{children || "Completa todos los campos requeridos para continuar."}</span>
    </div>
  );
}
