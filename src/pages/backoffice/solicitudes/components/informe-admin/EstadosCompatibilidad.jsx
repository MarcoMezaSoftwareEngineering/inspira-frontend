// Calculando, no se pudo calcular y sin programas compatibles.
export default function EstadosCompatibilidad({ loadingCompat, compat }) {
  return (
    <>
      {/* Cargando */}
      {loadingCompat && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 border-2 border-[#1D6A4A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400">Calculando compatibilidad…</p>
        </div>
      )}

      {/* Sin datos de formulario */}
      {!loadingCompat && !compat && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">🔍</div>
          <p className="text-xs text-neutral-500 max-w-[220px]">
            No se pudo calcular. El cliente quizás no ha completado el formulario.
          </p>
        </div>
      )}

      {/* Sin compatibles */}
      {!loadingCompat && compat && compat.total === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">📭</div>
          <p className="text-xs text-neutral-500">Sin programas compatibles. El cliente no ha indicado área de interés.</p>
        </div>
      )}
    </>
  );
}
