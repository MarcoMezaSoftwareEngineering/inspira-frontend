// src/pages/backoffice/panel-asesoras/partes/UnisTab.jsx
import { fv, uniEstCls } from "./utilidades";
import { CopyBtn } from "./CopyBtn";

export function UnisTab({ c }) {
  if (!c.unis?.length) return <div className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-4 text-center">Aún no hay universidades asociadas.</div>;
  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-lg">
      <table className="w-full text-[11px] border-collapse min-w-[640px]">
        <thead className="bg-neutral-50">
          <tr className="text-neutral-500 uppercase tracking-wide">
            <th className="text-left px-2.5 py-2 font-bold">Universidad</th>
            <th className="text-left px-2.5 py-2 font-bold">Máster</th>
            <th className="text-left px-2.5 py-2 font-bold">F. postulación</th>
            <th className="text-left px-2.5 py-2 font-bold">F. resultados</th>
            <th className="text-left px-2.5 py-2 font-bold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {c.unis.map((u, i) => (
            <tr key={u._idAcceso || i} className="border-t border-neutral-100">
              <td className="px-2.5 py-2 font-semibold text-neutral-700"><div className="flex items-center gap-1 min-w-0"><span className="truncate max-w-[160px]">{u.u}</span><CopyBtn value={u.u} label="Universidad" /></div></td>
              <td className="px-2.5 py-2 text-neutral-500"><div className="flex items-center gap-1 min-w-0"><span className="truncate max-w-[160px]">{fv(u.master)}</span>{u.master && <CopyBtn value={u.master} label="Máster" />}</div></td>
              <td className="px-2.5 py-2 text-neutral-500 whitespace-nowrap">{fv(u.fPost)}</td>
              <td className="px-2.5 py-2 text-neutral-500 whitespace-nowrap">{fv(u.fResult)}</td>
              <td className={`px-2.5 py-2 font-semibold ${uniEstCls(u.est)}`}>{u.est}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
