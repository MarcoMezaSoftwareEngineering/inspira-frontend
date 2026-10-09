import { useMemo } from "react";
import { diaSemanaYMesLima, horaLima } from "../../../../lib/formatos";

/* ── Slots disponibles ────────────────────────────────────────── */
export default function AvailableSlotsCard({ slots, copiedSlot, onCopySlot, onRefresh }) {
  // Agrupar por día en zona horaria Lima. Solo cuando cambian los huecos: al
  // copiar un enlace la tarjeta se vuelve a pintar y no hace falta reagrupar.
  const grouped = useMemo(() => {
    const grouped = {};
    slots.forEach((s) => {
      const dayKey = diaSemanaYMesLima(s.start_time);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(s);
    });
    return grouped;
  }, [slots]);

  const totalSlots = slots.length;
  const days = Object.keys(grouped).length;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-700">Slots disponibles</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Próximos 7 días · {totalSlots} huecos en {days} días</p>
        </div>
        <button onClick={onRefresh}
          className="text-xs text-neutral-500 hover:text-primary border border-neutral-200 rounded-lg px-2.5 py-1 hover:border-primary transition-colors">
          Actualizar
        </button>
      </div>

      {totalSlots === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
          Sin slots disponibles esta semana
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-80 pr-1">
          {Object.entries(grouped).map(([dayLabel, daySlots]) => (
            <div key={dayLabel}>
              <p className="text-xs font-semibold text-neutral-500 capitalize mb-1.5">{dayLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {daySlots.map((s) => {
                  const timeStr = horaLima(s.start_time);
                  const slotKey = s.start_time;
                  const isCopied = copiedSlot === slotKey;
                  return (
                    <button
                      key={slotKey}
                      onClick={() => onCopySlot(s.scheduling_url, slotKey)}
                      title="Clic para copiar link de este slot"
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isCopied
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-primary hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {isCopied ? "✓" : "🔗"} {timeStr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
        Clic en un slot para copiar el link directo y mandárselo a un cliente.
      </p>
    </div>
  );
}
