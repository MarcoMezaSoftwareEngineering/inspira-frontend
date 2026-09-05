function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Fila de solicitud — usada solo en la tabla desktop
export default function SolicitudRow({ s, isAdmin, onVer, onEliminar }) {
  const moneda = s.pagos?.[0]?.moneda || "";
  const totalPagado = (s.pagos || []).filter((p) => p.estado_pago === "pagado").reduce((acc, p) => acc + p.monto, 0);

  return (
    <tr className="border-b border-neutral-100 last:border-0 hover:bg-[#fbfcfb] transition-colors">
      <td className="px-3 py-3 text-xs text-neutral-400 font-mono tabular-nums">#{s.id_solicitud}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e8f5ee] to-[#d7ece1] text-[#0f5b3a] font-extrabold text-[11px] flex items-center justify-center shrink-0">
            {iniciales(s.cliente_nombre)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-neutral-900 leading-snug truncate">{s.cliente_nombre || "Sin nombre"}</span>
            {s.cliente_email && <span className="text-[11px] text-neutral-400 truncate">{s.cliente_email}</span>}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-xs max-w-[180px]">
        {s.tipo ? <span className="inline-flex px-2 py-1 rounded-md bg-[#e8f5ee] text-[#0f5b3a] text-[11px] font-bold whitespace-normal leading-tight">{s.tipo}</span> : "—"}
      </td>
      <td className="px-3 py-3 text-xs">
        {s.estado ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf2ff] text-[#2866b1] text-[11px] font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s.estado}
          </span>
        ) : "—"}
        {s.mensajes_sin_leer > 0 && (
          <span title="Mensajes del asesorado sin leer" className="ml-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FA943A] text-white text-[10.5px] font-black whitespace-nowrap">
            ✉ {s.mensajes_sin_leer}
          </span>
        )}
      </td>
      <td className="px-3 py-3 text-xs text-neutral-400 whitespace-nowrap">{s.origen || "—"}</td>
      <td className="px-3 py-3 text-xs text-neutral-500 whitespace-nowrap tabular-nums">
        {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap tabular-nums">
        {totalPagado > 0
          ? <span className="font-bold text-neutral-800">{totalPagado} {moneda}</span>
          : <span className="text-neutral-300 font-medium">—</span>}
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onVer(s.id_solicitud)} className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 h-8 rounded-lg border border-[#cfe0d6] bg-[#f3faf6] text-[#0f5b3a] hover:bg-[#e8f5ee] hover:border-[#b7d2c2] hover:-translate-y-px transition-all">
            Ver
          </button>
          {isAdmin && (
            <button type="button" onClick={() => onEliminar(s.id_solicitud)} className="text-[11px] font-bold px-3 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
              Eliminar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Card para móvil — exportada para usar en SolicitudesList
export function SolicitudCard({ s, isAdmin, onVer, onEliminar }) {
  const moneda = s.pagos?.[0]?.moneda || "";
  const totalPagado = (s.pagos || []).filter((p) => p.estado_pago === "pagado").reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="p-4 border-b border-neutral-100 last:border-0 active:bg-neutral-50">
      {/* Fila superior: ID + estado */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold text-neutral-300">#{s.id_solicitud}</span>
        {s.estado && (
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-[#eaf2ff] text-[#2866b1] font-bold leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s.estado}
          </span>
        )}
        {s.mensajes_sin_leer > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FA943A] text-white text-[10.5px] font-black leading-none">
            ✉ {s.mensajes_sin_leer}
          </span>
        )}
      </div>

      {/* Cliente */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e8f5ee] to-[#d7ece1] text-[#0f5b3a] font-extrabold text-[11px] flex items-center justify-center shrink-0">
          {iniciales(s.cliente_nombre)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{s.cliente_nombre || "Sin nombre"}</p>
          {s.cliente_email && <p className="text-xs text-neutral-400 truncate">{s.cliente_email}</p>}
        </div>
      </div>

      {/* Meta: tipo + fecha + pagado */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-3">
        {s.tipo && <span className="px-2 py-0.5 rounded-md bg-[#e8f5ee] text-[#0f5b3a] font-bold text-[11px]">{s.tipo}</span>}
        <span>{s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString("es-ES") : "—"}</span>
        {totalPagado > 0 && <span className="font-bold text-neutral-700">{totalPagado} {moneda}</span>}
      </div>

      {/* Footer: botones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => onVer(s.id_solicitud)}
          className="text-xs px-4 py-2 rounded-lg border border-[#cfe0d6] bg-[#f3faf6] text-[#0f5b3a] font-bold active:opacity-80 transition"
        >
          Ver expediente
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onEliminar(s.id_solicitud)}
            className="text-xs px-4 py-2 rounded-lg border border-red-200 text-red-600 font-bold active:bg-red-50 transition"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
