// Línea de tiempo del cliente en su ficha.
//
// Todo lo que ha pasado con esta persona, junto y en orden: documentos que
// subió y cómo se revisaron, mensajes, cambios de etapa, recordatorios, notas,
// pagos y tareas. Responde a «¿qué ha pasado con este cliente?» sin abrir
// seis pantallas.
import { useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const TIPOS = {
  alta:        { t: "Alta",          color: "#1D6A4A", icono: "M12 4v16m8-8H4" },
  asignacion:  { t: "Asignación",    color: "#023A4B", icono: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" },
  documento:   { t: "Documento",     color: "#1A3557", icono: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12" },
  aprobado:    { t: "Aprobado",      color: "#1D6A4A", icono: "M4.5 12.75l6 6 9-13.5" },
  observado:   { t: "Observado",     color: "#B45309", icono: "M12 9v4m0 4h.01" },
  mensaje:     { t: "Mensaje",       color: "#046C8C", icono: "M8 10h8M8 14h5M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" },
  etapa:       { t: "Etapa",         color: "#7D3C98", icono: "M13 7l5 5-5 5M6 7l5 5-5 5" },
  recordatorio:{ t: "Recordatorio",  color: "#B45309", icono: "M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" },
  cambio:      { t: "Cambio",        color: "#6b7280", icono: "M4 4v5h5M20 20v-5h-5M5 15a7 7 0 0 0 12.9 2M19 9A7 7 0 0 0 6.1 7" },
  nota:        { t: "Nota",          color: "#6b7280", icono: "M4 5h16v10H9l-5 4z" },
  pago:        { t: "Pago",          color: "#1D6A4A", icono: "M3 7h18v10H3zM3 11h18" },
  tarea:       { t: "Tarea",         color: "#1A3557", icono: "M9 11l3 3 8-8M4 6h4M4 12h4M4 18h16" },
  tarea_hecha: { t: "Tarea hecha",   color: "#1D6A4A", icono: "M4.5 12.75l6 6 9-13.5" },
};

const FILTROS = [
  ["", "Todo"],
  ["documento,aprobado,observado", "Documentos"],
  ["mensaje", "Mensajes"],
  ["etapa,recordatorio,cambio,asignacion,alta", "Gestión"],
  ["tarea,tarea_hecha", "Tareas"],
  ["nota,pago", "Notas y pagos"],
];

const SERVICIO = { master: "Máster", visa: "Visado", ee: "Estancia", mod: "Modificatoria", fp: "FP", legal: "Extranjería", doc: "Doctorado" };

function cuando(iso) {
  const d = new Date(iso);
  const dias = Math.floor((Date.now() - d) / 86400000);
  const hora = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  if (dias <= 0 && new Date().getDate() === d.getDate()) return `hoy ${hora}`;
  if (dias <= 1) return `ayer ${hora}`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: dias > 300 ? "numeric" : undefined });
}

export default function HistorialCliente({ idCliente }) {
  const [eventos, setEventos] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [todos, setTodos] = useState(false);

  useEffect(() => {
    boGET(`/backoffice/ficha-cliente/${idCliente}/historial`).then((r) => setEventos(r.ok ? r.eventos || [] : []));
  }, [idCliente]);

  const visibles = useMemo(() => {
    const lista = (eventos || []).filter((e) => !filtro || filtro.split(",").includes(e.tipo));
    return todos ? lista : lista.slice(0, 15);
  }, [eventos, filtro, todos]);
  const total = (eventos || []).filter((e) => !filtro || filtro.split(",").includes(e.tipo)).length;

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
          Historial{eventos ? ` · ${eventos.length}` : ""}
        </h2>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {FILTROS.map(([k, t]) => (
          <button key={t} type="button" onClick={() => { setFiltro(k); setTodos(false); }}
            className={`shrink-0 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border ${
              filtro === k ? "bg-[#023A4B] border-[#023A4B] text-white" : "bg-white border-neutral-200 text-neutral-600"}`}>
            {t}
          </button>
        ))}
      </div>

      {eventos === null ? (
        <p className="text-[12.5px] text-neutral-400 py-4 text-center">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="text-[12.5px] text-neutral-400 py-4 text-center">Nada registrado todavía.</p>
      ) : (
        <ol className="relative">
          {visibles.map((e, i) => {
            const tipo = TIPOS[e.tipo] || TIPOS.cambio;
            const ultimo = i === visibles.length - 1;
            return (
              <li key={`${e.tipo}-${e.fecha}-${i}`} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-7 h-7 rounded-full grid place-items-center text-white" style={{ background: tipo.color }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={tipo.icono} />
                    </svg>
                  </span>
                  {!ultimo && <span className="flex-1 w-px bg-neutral-200 my-1" />}
                </div>
                <div className={`min-w-0 flex-1 ${ultimo ? "" : "pb-3"}`}>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[11.5px] font-bold" style={{ color: tipo.color }}>{tipo.t}</span>
                    {e.servicio && SERVICIO[e.servicio] && (
                      <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 rounded px-1.5">{SERVICIO[e.servicio]}</span>
                    )}
                    <span className="text-[10.5px] text-neutral-400 ml-auto whitespace-nowrap">{cuando(e.fecha)}</span>
                  </div>
                  <p className={`text-[12.5px] leading-snug mt-0.5 break-words ${
                    e.tipo === "mensaje" ? "text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-1.5 whitespace-pre-wrap" : "text-neutral-700"}`}>
                    {e.texto}
                  </p>
                  {e.quien && <p className="text-[10.5px] text-neutral-400 mt-0.5">{e.quien}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!todos && total > 15 && (
        <button type="button" onClick={() => setTodos(true)}
          className="mt-2 w-full text-[12px] font-semibold text-[#1D6A4A] py-2 rounded-lg hover:bg-[#E8F5EE]">
          Ver los {total} eventos
        </button>
      )}
    </section>
  );
}
