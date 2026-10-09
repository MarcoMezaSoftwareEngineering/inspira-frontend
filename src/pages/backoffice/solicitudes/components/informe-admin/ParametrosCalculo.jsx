// Los datos del formulario con los que el motor hizo el cálculo, plegados.
export default function ParametrosCalculo({ showParams, setShowParams, paramRows }) {
  return (
    <div className="mb-4">
      <button onClick={() => setShowParams((p) => !p)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 transition-colors duration-150">
        <svg className={`w-3 h-3 transition-transform duration-200 ${showParams ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Parámetros usados en el cálculo
      </button>
      {showParams && (
        <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-[11px]">
          {paramRows.map(([label, val]) => (
            <div key={label} className="flex justify-between gap-2 border-b border-neutral-100 pb-1 last:border-0">
              <span className="text-neutral-400 shrink-0">{label}</span>
              <span className="font-medium text-neutral-700 text-right truncate">{val || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
