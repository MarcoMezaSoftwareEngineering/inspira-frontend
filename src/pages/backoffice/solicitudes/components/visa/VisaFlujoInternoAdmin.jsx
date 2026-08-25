// Flujo interno de gestión del visado. Sólo asesores.
//
// Responde a una pregunta concreta: "abro este expediente, ¿dónde está y qué
// toca hacer?". Cada paso se marca al hacerlo y queda la fecha, para que
// cualquiera del equipo pueda retomar un caso ajeno sin preguntar.
import { useEffect, useRef, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { ETAPAS, resumenFlujo } from "../../../../../lib/visaFlujoInterno";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function fechaCorta(v) {
  if (!v) return "";
  try {
    return new Date(`${v}T00:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  } catch {
    return v;
  }
}

export default function VisaFlujoInternoAdmin({ idSolicitud, expediente, onSaved }) {
  const [flujo, setFlujo] = useState(expediente?.flujo_interno || {});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const sucio = useRef(false);

  useEffect(() => {
    if (!sucio.current) setFlujo(expediente?.flujo_interno || {});
  }, [expediente?.flujo_interno]);

  const r = resumenFlujo(flujo);

  function alternar(id) {
    sucio.current = true;
    setMsg("");
    setFlujo((f) => {
      const actual = f[id];
      if (actual?.hecho) {
        const copia = { ...f };
        delete copia[id];
        return copia;
      }
      return { ...f, [id]: { hecho: true, fecha: hoyISO() } };
    });
  }

  function nota(id, texto) {
    sucio.current = true;
    setFlujo((f) => ({ ...f, [id]: { ...(f[id] || { hecho: true, fecha: hoyISO() }), nota: texto } }));
  }

  async function guardar() {
    setSaving(true);
    setMsg("");
    try {
      const resp = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
        flujo_interno: flujo,
      });
      if (resp.ok) {
        sucio.current = false;
        onSaved?.(resp.expediente);
        setMsg("Guardado.");
      } else {
        setMsg(resp.msg || "No se pudo guardar.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Dónde está el expediente */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
              Dónde está este expediente
            </p>
            <p className="text-[15px] font-bold text-[#023A4B] mt-0.5">
              {r.siguiente ? r.etapaActual : "🎉 Todo el flujo completado"}
            </p>
            {r.siguiente && (
              <p className="text-[12.5px] text-neutral-600 mt-1">
                Siguiente: <b>{r.siguiente.titulo}</b>
                <span className="text-neutral-400"> · depende de {r.siguiente.quien}</span>
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[22px] font-bold text-[#1D6A4A] leading-none">{r.pct}%</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">{r.hechos} de {r.total} pasos</p>
          </div>
        </div>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-3">
          <div className="h-full rounded-full bg-[#1D6A4A] transition-all duration-500" style={{ width: `${r.pct}%` }} />
        </div>
      </div>

      {/* Pasos */}
      {ETAPAS.map((etapa) => {
        const hechos = etapa.pasos.filter((p) => flujo[p.id]?.hecho).length;
        const completa = hechos === etapa.pasos.length;
        return (
          <div key={etapa.codigo}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
                {etapa.nombre}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                completa ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                {hechos}/{etapa.pasos.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {etapa.pasos.map((paso) => {
                const est = flujo[paso.id];
                const hecho = !!est?.hecho;
                return (
                  <div key={paso.id} className={`rounded-lg border px-3 py-2.5 transition-colors ${
                    hecho ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-white"
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => alternar(paso.id)}
                        aria-label={hecho ? "Desmarcar" : "Marcar como hecho"}
                        className={`shrink-0 mt-0.5 w-5 h-5 rounded-md grid place-items-center text-[11px] font-black transition-colors ${
                          hecho ? "bg-[#1D6A4A] text-white" : "bg-neutral-100 text-transparent hover:bg-neutral-200"
                        }`}
                      >✓</button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className={`text-[13px] font-semibold ${hecho ? "text-neutral-500 line-through" : "text-neutral-800"}`}>
                            {paso.titulo}
                          </p>
                          {hecho && est.fecha && (
                            <span className="text-[10.5px] font-semibold text-emerald-700">{fechaCorta(est.fecha)}</span>
                          )}
                          <span className="text-[10px] text-neutral-400 ml-auto shrink-0">{paso.quien}</span>
                        </div>
                        <p className="text-[11.5px] text-neutral-500 leading-snug mt-0.5">{paso.pista}</p>

                        {hecho && (
                          <input
                            value={est.nota || ""}
                            onChange={(e) => nota(paso.id, e.target.value)}
                            placeholder="Nota interna (opcional)"
                            className="mt-1.5 w-full text-[11.5px] text-neutral-700 bg-white border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-[#1D6A4A] placeholder:text-neutral-300"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button" onClick={guardar} disabled={saving}
          className="text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar flujo"}
        </button>
        {sucio.current && !msg && <p className="text-[11.5px] text-amber-700">Tienes cambios sin guardar</p>}
        {msg && <p className="text-[11.5px] text-neutral-500">{msg}</p>}
      </div>
    </div>
  );
}
