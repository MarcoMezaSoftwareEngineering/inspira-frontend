import { fechaCortaConHora, hora } from "../../../../lib/formatos";

/* ── Event Card ───────────────────────────────────────────────── */
export default function EventCard({ event, isAdmin, onCancel }) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const now = new Date();
  const isPast = end < now;
  const isNow = start <= now && now <= end;
  const invitee = event.invitees?.[0];
  const duration = Math.round((end - start) / 60000);
  const msUntil = start - now;
  const hoursUntil = Math.floor(msUntil / 3600000);
  const minutesUntil = Math.floor((msUntil % 3600000) / 60000);
  const countdown = msUntil > 0 && msUntil < 86400000
    ? hoursUntil > 0 ? `en ${hoursUntil}h ${minutesUntil}m` : `en ${minutesUntil} min`
    : null;
  const bookedAt = invitee?.created_at
    ? fechaCortaConHora(invitee.created_at)
    : null;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${
      isNow ? "border-primary ring-2 ring-primary/20" : isPast ? "border-neutral-100 opacity-60" : "border-neutral-200 hover:border-neutral-300"
    }`}>
      {isNow && <div className="bg-primary text-white text-xs font-semibold text-center py-1 tracking-wide">EN CURSO AHORA</div>}
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Hora */}
        <div className="flex-shrink-0 w-28 text-center sm:text-left">
          <div className="text-2xl font-bold text-primary leading-tight">
            {hora(start)}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {hora(start)} – {hora(end)}
          </div>
          <div className="text-xs text-neutral-400">{duration} min</div>
          <StatusBadge status={event.status} past={isPast} isNow={isNow} />
          {countdown && <div className="mt-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 inline-block">{countdown}</div>}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-neutral-800">{invitee?.name || "Sin datos del cliente"}</span>
            <span className="text-xs text-neutral-400 bg-neutral-100 rounded px-2 py-0.5">{event.event_name}</span>
          </div>
          {invitee?.email && (
            <a href={`mailto:${invitee.email}`} className="text-xs text-primary hover:underline block">{invitee.email}</a>
          )}
          {(invitee?.questions || []).map((q, i) => (
            <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{q.question}</div>
              <div className="text-xs text-neutral-700">{q.answer}</div>
            </div>
          ))}
          {bookedAt && <div className="text-[10px] text-neutral-400 mt-1">Agendado el {bookedAt}</div>}
        </div>
        {/* Acciones */}
        <div className="flex sm:flex-col gap-2 flex-wrap items-start sm:items-end justify-end flex-shrink-0">
          {event.location && !isPast && (
            <a href={event.location} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 10l4.553-2.776A1 1 0 0121 8.175v7.65a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Unirse
            </a>
          )}
          {invitee?.reschedule_url && !isPast && (
            <a href={invitee.reschedule_url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:border-neutral-300 transition-colors">
              Reprogramar
            </a>
          )}
          {isAdmin && !isPast && event.status === "active" && (
            <button onClick={() => onCancel(event.uuid, invitee?.name || "cliente")}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */
function StatusBadge({ status, past, isNow }) {
  if (isNow) return null;
  if (past) return <span className="text-[10px] text-neutral-400 mt-1 block">Completada</span>;
  if (status === "canceled") return <span className="text-[10px] text-red-400 mt-1 block font-medium">Cancelada</span>;
  return <span className="text-[10px] text-green-600 mt-1 block font-medium">Confirmada</span>;
}
