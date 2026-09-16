// Panel del equipo, para quien gestiona: carga y cumplimiento por persona.
// Si quien entra no gestiona el equipo, el servidor responde 403 y no se pinta.
import { useEffect, useState } from "react";
import { boFetch } from "../../../services/backofficeApi";

export default function PanelEquipo() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    // boFetch y no boGET: un 403 aquí es normal (no gestiona) y no debe
    // enseñar el aviso de «sin permiso».
    boFetch("/backoffice/gestion-clientes/equipo")
      .then((r) => (r?.ok ? r.json() : null))
      .then((d) => d?.ok && setDatos(d))
      .catch(() => {});
  }, []);

  if (!datos) return null;
  const th = "text-[9.5px] font-bold uppercase tracking-widest text-neutral-400 px-3 py-2 whitespace-nowrap";

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2 flex-wrap">
        <h2 className="text-[15px] font-extrabold text-[#1A3557]">Equipo</h2>
        <span className="text-[11px] text-neutral-500">Últimos 7 días</span>
        {datos.sin_responsable > 0 && (
          <span className="ml-auto text-[11px] font-bold text-red-700 bg-red-50 rounded-full px-2.5 py-0.5">
            {datos.sin_responsable} proceso(s) sin responsable
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12.5px]">
          <thead className="bg-neutral-50 border-y border-neutral-200">
            <tr>
              <th className={`${th} text-left`}>Persona</th>
              <th className={th}>Procesos</th>
              <th className={th}>Tareas abiertas</th>
              <th className={th}>Vencidas</th>
              <th className={th}>Hechas</th>
              <th className={th}>Docs revisados</th>
              <th className={th}>Recordatorios y WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {datos.personas.map((p) => (
              <tr key={p.id_usuario} className="border-b border-neutral-100 last:border-b-0">
                <td className="px-3 py-2.5 font-semibold text-neutral-800 whitespace-nowrap">{p.nombre}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{p.procesos}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">
                  {p.tareas_abiertas}{p.tareas_auto ? <span className="text-[10px] text-neutral-400"> ({p.tareas_auto} auto)</span> : null}
                </td>
                <td className={`px-3 py-2.5 text-center tabular-nums font-bold ${p.tareas_vencidas ? "text-red-700" : "text-neutral-300"}`}>{p.tareas_vencidas}</td>
                <td className="px-3 py-2.5 text-center tabular-nums text-[#1D6A4A] font-semibold">{p.hechas_7d}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{p.documentos_revisados_7d}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{p.contactos_7d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
