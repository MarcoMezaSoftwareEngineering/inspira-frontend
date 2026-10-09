// src/pages/backoffice/panel-asesoras/partes/PendientesTab.jsx

export function PendientesTab({ pending }) {
  if (!pending?.length) return <div className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-4 text-center">Sin pendientes registrados.</div>;
  return (
    <ul className="space-y-1.5">
      {pending.map((p, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-neutral-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {p}
        </li>
      ))}
    </ul>
  );
}
