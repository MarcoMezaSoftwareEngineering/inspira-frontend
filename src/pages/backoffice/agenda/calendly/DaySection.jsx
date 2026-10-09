import { diaSemanaYMes } from "../../../../lib/formatos";
import EventCard from "./EventCard";

/* ── Day Section ──────────────────────────────────────────────── */
export default function DaySection({ dateKey, isToday, events, isAdmin, onCancel }) {
  const date = new Date(dateKey + "T12:00:00");
  const label = isToday ? "Hoy"
    : diaSemanaYMes(date);
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${isToday ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"}`}>
          {label}
        </div>
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">{events.length} reunión{events.length !== 1 ? "es" : ""}</span>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <EventCard key={event.uuid} event={event} isAdmin={isAdmin} onCancel={onCancel} />
        ))}
      </div>
    </div>
  );
}
