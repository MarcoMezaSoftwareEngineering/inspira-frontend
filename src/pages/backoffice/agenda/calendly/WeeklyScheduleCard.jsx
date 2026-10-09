import { WDAY_ES, WDAY_ORDER } from "../constantes";

/* ── Horario semanal ──────────────────────────────────────────── */
export default function WeeklyScheduleCard({ schedule }) {
  if (!schedule) return null;
  const rulesMap = Object.fromEntries(schedule.rules.map((r) => [r.wday, r.intervals]));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">Horario semanal</h3>
        <span className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded px-2 py-0.5">
          {schedule.timezone}
        </span>
      </div>
      <div className="space-y-2">
        {WDAY_ORDER.map((wday) => {
          const intervals = rulesMap[wday] || [];
          const isOpen = intervals.length > 0;
          return (
            <div key={wday} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isOpen ? "bg-green-50" : "bg-neutral-50"}`}>
              <span className={`text-sm font-medium ${isOpen ? "text-neutral-700" : "text-neutral-400"}`}>
                {WDAY_ES[wday]}
              </span>
              {isOpen ? (
                <div className="flex gap-2">
                  {intervals.map((iv, i) => (
                    <span key={i} className="text-xs font-semibold text-green-700 bg-green-100 border border-green-200 rounded px-2 py-0.5">
                      {iv.from} – {iv.to}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-neutral-400">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-400 mt-3">
        * Para modificar el horario, hazlo directamente en Calendly.
      </p>
    </div>
  );
}
