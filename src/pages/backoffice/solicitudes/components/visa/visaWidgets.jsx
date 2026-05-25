// Widgets compartidos para los bloques de Visado en el backoffice.

export function Campo({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-[12px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A] placeholder:text-neutral-300"
      />
    </div>
  );
}

export function Selecc({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="text-[12px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function GuardarBtn({ onClick, saving, children = "Guardar" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition-colors"
    >
      {saving ? "Guardando…" : children}
    </button>
  );
}

export function SubLabel({ children }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2 mt-3">{children}</p>;
}
