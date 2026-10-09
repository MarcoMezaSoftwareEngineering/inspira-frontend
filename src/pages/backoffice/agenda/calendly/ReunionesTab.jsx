import { DAYS_OPTIONS } from "../constantes";
import DaySection from "./DaySection";
import { EmptyState, LoadingSkeleton } from "./EstadosReuniones";

/* ===== TAB REUNIONES ===== */
export default function ReunionesTab({
  days, setDays, data, copied, copyBookingLink, loadEvents,
  loading, error, grouped, todayKey, isAdmin, openCancelModal,
}) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Controles */}
      <div className="flex items-center gap-2 flex-wrap bg-white/80 border border-neutral-200 rounded-2xl shadow-sm p-3">
        <div className="flex p-0.5 rounded-xl border border-neutral-200 overflow-hidden text-xs bg-white">
          {DAYS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${days === opt.value ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {data?.booking_url && (
          <button onClick={copyBookingLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"}`}>
            {copied ? "✓ Copiado" : "Copiar link de reserva"}
          </button>
        )}
        <button onClick={() => loadEvents(days)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
          Actualizar
        </button>
      </div>

      {loading ? <LoadingSkeleton /> : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">Error: {error}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState bookingUrl={data?.booking_url} onCopy={copyBookingLink} copied={copied} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, events]) => (
            <DaySection key={dateKey} dateKey={dateKey} isToday={dateKey === todayKey}
              events={events} isAdmin={isAdmin} onCancel={openCancelModal} />
          ))}
        </div>
      )}
    </div>
  );
}
