// Tracker de visados: la hoja de seguimiento, dentro del sistema.
//
// Mismas columnas con las que ya se trabaja —prioridad, cita final, fecha
// tentativa, paquete— y edición en la propia celda. Obligar a entrar al
// expediente para mover una fecha es lo que hace que la gente vuelva al Excel.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  sky:     "bg-sky-50 text-sky-800 border-sky-200",
  blue:    "bg-[#1A3557] text-white border-[#1A3557]",
  amber:   "bg-amber-50 text-amber-800 border-amber-300",
  violet:  "bg-violet-100 text-violet-800 border-violet-300",
  brown:   "bg-[#6B4423] text-white border-[#6B4423]",
  green:   "bg-[#1D6A4A] text-white border-[#1D6A4A]",
  red:     "bg-red-100 text-red-800 border-red-300",
  slate:   "bg-slate-200 text-slate-700 border-slate-300",
};

/* Celda de texto que guarda al salir. Sin botones: escribir y pasar a la
   siguiente es exactamente el gesto de la hoja de cálculo. */
function Celda({ valor, onGuardar, placeholder, ancho = "w-28" }) {
  const [guardando, setGuardando] = useState(false);
  // La celda se resincroniza cuando cambia el valor de fuera. Se usa `key`
  // en el padre para eso en vez de un efecto, que dispara render en cascada.
  const [v, setV] = useState(valor || "");

  async function salir() {
    if ((v || "") === (valor || "")) return;
    setGuardando(true);
    await onGuardar(v);
    setGuardando(false);
  }

  return (
    <input
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={salir}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      disabled={guardando}
      className={`${ancho} text-[11.5px] text-neutral-800 bg-transparent border border-transparent rounded px-1.5 py-1
        hover:border-neutral-200 focus:border-[#1D6A4A] focus:bg-white outline-none
        placeholder:text-neutral-300 disabled:opacity-50`}
    />
  );
}

function Etapa({ fila, etapas, onCambiar }) {
  const def = etapas.find((e) => e.valor === fila.etapa);
  return (
    <div className="relative inline-block">
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border whitespace-nowrap
        ${TONOS[def?.tono || "neutral"]} ${fila.etapa_deducida ? "border-dashed opacity-80" : ""}`}>
        {fila.etapa}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
      <select
        value={fila.etapa} onChange={(e) => onCambiar(e.target.value)}
        aria-label="Cambiar etapa"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {etapas.map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
      </select>
    </div>
  );
}

export default function TrackerVisa({ onAbrirProceso }) {
  const [datos, setDatos] = useState({ filas: [], etapas: [], resumen: {} });
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState("");
  const [soloConCita, setSoloConCita] = useState(false);

  const cargar = useCallback(() => (
    boGET("/backoffice/tracker-visa").then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    })
  ), []);

  useEffect(() => {
    boGET("/backoffice/tracker-visa").then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    });
  }, []);

  // Optimista: la celda se queda con lo escrito y sólo se recarga si falla.
  async function guardar(id_solicitud, campo, valor) {
    setDatos((d) => ({
      ...d,
      filas: d.filas.map((f) => (f.id_solicitud === id_solicitud ? { ...f, [campo]: valor } : f)),
    }));
    const mapa = {
      cita_fecha: "cita_fecha", cita_hora: "cita_hora",
      cita_tentativa: "cita_fecha_tentativa", cita_ref: "cita_ref_bls", etapa: "etapa",
    };
    const r = await boPATCH(`/backoffice/tracker-visa/${id_solicitud}`, { [mapa[campo]]: valor });
    if (!r.ok) cargar();
  }

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return datos.filas.filter((f) => {
      if (soloConCita && !f.cita_fecha) return false;
      if (t && !`${f.cliente} ${f.paquete}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [datos.filas, q, soloConCita]);

  const r = datos.resumen || {};
  const sel = "text-[12px] text-neutral-700 border border-neutral-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {[
          { n: r.total, t: "Expedientes" },
          { n: r.con_cita, t: "Con cita final" },
          { n: r.solo_tentativa, t: "Solo tentativa" },
          { n: r.sin_fecha, t: "Sin fecha" },
          { n: r.con_requerimiento, t: "Requerimiento", c: "text-red-600" },
          { n: r.aprobadas, t: "Aprobadas", c: "text-[#1D6A4A]" },
        ].map((c) => (
          <div key={c.t} className="shrink-0 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 min-w-[86px]">
            <p className={`text-[17px] font-bold leading-none ${c.c || "text-[#1A3557]"}`}>{c.n ?? 0}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">{c.t}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o paquete…"
          className={`${sel} flex-1 min-w-[160px]`} />
        <label className="flex items-center gap-1 text-[11.5px] text-neutral-600">
          <input type="checkbox" checked={soloConCita} onChange={(e) => setSoloConCita(e.target.checked)} />
          Solo con cita confirmada
        </label>
        <span className="text-[11px] text-neutral-400 ml-auto">{visibles.length} de {datos.filas.length}</span>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-8 text-center">Cargando…</p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {["#", "Cliente", "Prioridad", "Fecha de cita final", "Hora", "Fecha tentativa", "Ref. BLS", "Paquete", "Responsable", ""]
                  .map((h) => (
                    <th key={h} className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-2 py-2 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((f, i) => (
                <tr key={f.id_solicitud}
                  className={`border-b border-neutral-100 hover:bg-neutral-50/60 ${
                    f.requerimiento === "SOLICITADO" ? "bg-red-50/40" : ""
                  }`}>
                  <td className="px-2 py-1.5 text-[11px] text-neutral-400">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <p className="text-[12.5px] font-semibold text-neutral-800 whitespace-nowrap">{f.cliente}</p>
                    {(f.docs_observados > 0 || f.requerimiento === "SOLICITADO") && (
                      <p className="text-[10px] font-semibold text-red-600">
                        {f.requerimiento === "SOLICITADO" ? "requerimiento" : `${f.docs_observados} obs`}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <Etapa fila={f} etapas={datos.etapas}
                      onCambiar={(v) => guardar(f.id_solicitud, "etapa", v)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Celda key={`cf-${f.id_solicitud}-${f.cita_fecha}`} valor={f.cita_fecha} placeholder="22 de julio"
                      onGuardar={(v) => guardar(f.id_solicitud, "cita_fecha", v)} />
                    {f.dias_cita !== null && !f.cita_es_tentativa && (
                      <span className={`block text-[10px] px-1.5 ${
                        f.dias_cita < 0 ? "text-neutral-400" : f.dias_cita <= 10 ? "text-amber-700 font-semibold" : "text-neutral-400"
                      }`}>
                        {f.dias_cita < 0 ? `hace ${Math.abs(f.dias_cita)}d` : `en ${f.dias_cita}d`}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <Celda key={`ch-${f.id_solicitud}-${f.cita_hora}`} valor={f.cita_hora} placeholder="09:20" ancho="w-16"
                      onGuardar={(v) => guardar(f.id_solicitud, "cita_hora", v)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Celda key={`ct-${f.id_solicitud}-${f.cita_tentativa}`} valor={f.cita_tentativa} placeholder="junio"
                      onGuardar={(v) => guardar(f.id_solicitud, "cita_tentativa", v)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Celda key={`cr-${f.id_solicitud}-${f.cita_ref}`} valor={f.cita_ref} placeholder="—" ancho="w-24"
                      onGuardar={(v) => guardar(f.id_solicitud, "cita_ref", v)} />
                  </td>
                  <td className="px-2 py-1.5 text-[11.5px] text-neutral-600 max-w-[150px] truncate">{f.paquete}</td>
                  <td className="px-2 py-1.5 text-[11.5px] text-neutral-600 whitespace-nowrap">
                    {f.responsable || <span className="text-amber-600 font-semibold">sin asignar</span>}
                  </td>
                  <td className="px-2 py-1.5">
                    <button type="button" onClick={() => onAbrirProceso?.(f.id_solicitud)}
                      className="text-[11px] font-semibold text-[#1D6A4A] hover:underline">Abrir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        Las fechas se escriben como en la hoja —«22 de julio», «16/06/2026», «junio»— y se
        guardan al salir de la celda. Poner una fecha de cita final marca la cita como agendada.
      </p>
    </div>
  );
}
