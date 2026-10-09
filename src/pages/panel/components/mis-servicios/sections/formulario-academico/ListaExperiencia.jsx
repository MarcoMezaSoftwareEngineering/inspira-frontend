/* Los puestos de trabajo, uno por empleador: entidad, cargo, sector, fechas y
   qué hacía. Es lo que puntúan las universidades y lo que va al Europass; con
   «2–3 años» a secas el asesor no tenía con qué escribir. (Carina, 08/09/2026) */
const SECTORES = [
  { value: "publico",   label: "Sector público" },
  { value: "privado",   label: "Empresa privada" },
  { value: "ong",       label: "ONG / cooperación" },
  { value: "academico", label: "Universidad / investigación" },
  { value: "propio",    label: "Negocio propio" },
];
const PUESTO_VACIO = { entidad: "", cargo: "", sector: "", desde: "", hasta: "", actual: false, funciones: "", vinculada: false };
const CAMPO_CHICO = "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

export default function ListaExperiencia({ valor, onChange }) {
  const puestos = Array.isArray(valor) ? valor : [];
  const cambiar = (i, campo, v) => onChange(puestos.map((p, j) => (j === i ? { ...p, [campo]: v } : p)));
  const quitar = (i) => onChange(puestos.filter((_, j) => j !== i));
  const anadir = () => onChange([...puestos, { ...PUESTO_VACIO }]);

  return (
    <div className="space-y-3">
      {puestos.map((p, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-light">Puesto {i + 1}</p>
            <button type="button" onClick={() => quitar(i)} className="text-[11px] font-semibold text-red-500 hover:underline">Quitar</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <input type="text" value={p.entidad || ""} onChange={(e) => cambiar(i, "entidad", e.target.value)}
              placeholder="Entidad o empresa" className={CAMPO_CHICO} />
            <input type="text" value={p.cargo || ""} onChange={(e) => cambiar(i, "cargo", e.target.value)}
              placeholder="Cargo" className={CAMPO_CHICO} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SECTORES.map((s) => (
              <button key={s.value} type="button" onClick={() => cambiar(i, "sector", p.sector === s.value ? "" : s.value)}
                className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all active:scale-95 ${
                  p.sector === s.value ? "bg-primary text-white border-primary" : "border-neutral-200 text-neutral-600 bg-white hover:border-primary"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-center">
            <input type="month" value={p.desde || ""} onChange={(e) => cambiar(i, "desde", e.target.value)}
              aria-label="Desde" className={CAMPO_CHICO} />
            <input type="month" value={p.hasta || ""} onChange={(e) => cambiar(i, "hasta", e.target.value)}
              aria-label="Hasta" disabled={!!p.actual} className={`${CAMPO_CHICO} disabled:opacity-40`} />
            <label className="flex items-center gap-2 text-[12.5px] text-neutral-700 col-span-2 sm:col-span-1">
              <input type="checkbox" checked={!!p.actual} onChange={(e) => cambiar(i, "actual", e.target.checked)} className="accent-primary" />
              Trabajo aquí actualmente
            </label>
          </div>
          <textarea rows={2} value={p.funciones || ""} onChange={(e) => cambiar(i, "funciones", e.target.value)}
            placeholder="Qué hacías: funciones, responsabilidades, logros…" className={`${CAMPO_CHICO} resize-y`} />
          <label className="flex items-center gap-2 text-[12.5px] text-neutral-700">
            <input type="checkbox" checked={!!p.vinculada} onChange={(e) => cambiar(i, "vinculada", e.target.checked)} className="accent-primary" />
            Este puesto tiene que ver con el máster que busco
          </label>
        </div>
      ))}
      <button type="button" onClick={anadir}
        className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-600 hover:border-primary hover:text-primary transition-all active:scale-[0.99]">
        + Añadir {puestos.length ? "otro puesto" : "un puesto de trabajo"}
      </button>
    </div>
  );
}
