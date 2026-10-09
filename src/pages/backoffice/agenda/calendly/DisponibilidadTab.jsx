import WeeklyScheduleCard from "./WeeklyScheduleCard";
import AvailableSlotsCard from "./AvailableSlotsCard";

/* ===== TAB DISPONIBILIDAD ===== */
export default function DisponibilidadTab({ avail, setAvail, availLoading, availError, copiedSlot, copySlotLink, loadAvailability }) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 space-y-5">
      {availLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : availError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error: {availError}
        </div>
      ) : avail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Horario semanal */}
          <WeeklyScheduleCard schedule={avail.schedule} />
          {/* Slots disponibles */}
          <AvailableSlotsCard
            slots={avail.available_slots}
            copiedSlot={copiedSlot}
            onCopySlot={copySlotLink}
            onRefresh={() => { setAvail(null); loadAvailability(); }}
          />
        </div>
      )}
    </div>
  );
}
