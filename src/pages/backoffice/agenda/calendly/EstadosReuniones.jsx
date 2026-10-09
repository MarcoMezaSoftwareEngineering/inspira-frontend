// Estados de la lista de reuniones: vacía y cargando.

export function EmptyState({ bookingUrl, onCopy, copied }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center">
      <div className="text-4xl mb-3">📅</div>
      <div className="text-base font-semibold text-neutral-700 mb-1">No hay reuniones programadas</div>
      <div className="text-sm text-neutral-400 mb-5">Para este período no tienes citas agendadas.</div>
      {bookingUrl && (
        <button onClick={onCopy}
          className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-primary text-white border-primary hover:opacity-90"}`}>
          {copied ? "✓ Link copiado" : "Copiar link de reserva para clientes"}
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, g) => (
        <div key={g}>
          <div className="h-6 w-32 bg-neutral-100 rounded-full mb-3 animate-pulse" />
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-xl p-4 flex gap-4 animate-pulse">
                <div className="w-24 space-y-2"><div className="h-7 bg-neutral-100 rounded" /><div className="h-3 bg-neutral-100 rounded w-2/3" /></div>
                <div className="flex-1 space-y-2"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-3 bg-neutral-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
