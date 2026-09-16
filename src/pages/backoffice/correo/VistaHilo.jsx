// Una conversación de correo: los mensajes en orden y la respuesta abajo,
// desde la dirección del servicio y con las respuestas guardadas a mano.
import { useEffect, useState } from "react";
import { boGET, boPOST, boFetch } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import SelectorRespuestas from "../comun/SelectorRespuestas";
import { DESDE_BUZON } from "./desdeBuzon";
import AccionesHilo from "./AccionesHilo";


function hora(ms) {
  const d = new Date(ms);
  const hoy = new Date();
  return d.toDateString() === hoy.toDateString()
    ? d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

async function abrirAdjunto(mensaje, a) {
  const r = await boFetch(`/backoffice/correo/adjunto/${mensaje}/${a.id}?mime=${encodeURIComponent(a.mime || "")}&nombre=${encodeURIComponent(a.nombre)}`);
  if (!r?.ok) { dialog.toast("No se pudo abrir el adjunto", "error"); return; }
  const url = URL.createObjectURL(await r.blob());
  const enlace = document.createElement("a");
  enlace.href = url; enlace.target = "_blank"; enlace.rel = "noopener";
  if (!/pdf|image/.test(a.mime || "")) enlace.download = a.nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function VistaHilo({ id, direcciones: dirs = [], onVolver, onRespondido }) {
  const [h, setH] = useState(null);
  const [texto, setTexto] = useState("");
  const [desde, setDesde] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [plantillas, setPlantillas] = useState(false);
  const [direcciones, setDirecciones] = useState(dirs);
  const [equipo, setEquipo] = useState([]);

  // Direcciones y equipo, si no vienen del buzón (p. ej. desde la ficha).
  useEffect(() => {
    if (!dirs.length) boGET("/backoffice/correo/buzones").then((r) => r.ok && setDirecciones(r.direcciones || []));
    boGET("/backoffice/solicitudes/equipo").then((r) => r.ok && setEquipo(r.equipo || []));
  }, [dirs.length]);

  // «Lo estoy respondiendo yo»: aviso a los demás mientras está abierto.
  useEffect(() => {
    const marcar = () => boPOST(`/backoffice/correo/hilo/${id}/atender`, {});
    marcar();
    const t = setInterval(marcar, 60000);
    return () => { clearInterval(t); boPOST(`/backoffice/correo/hilo/${id}/atender`, { soltar: true }); };
  }, [id]);

  async function asignar(id_usuario) {
    const r = await boPOST(`/backoffice/correo/hilo/${id}/asignar`, { id_usuario: id_usuario || null });
    if (r.ok) { setH((x) => ({ ...x, asignado: r.asignado })); dialog.toast(r.asignado ? `Asignado a ${r.asignado}` : "Sin asignar", "success"); onRespondido?.(); }
    else dialog.toast(r.msg || "No se pudo asignar", "error");
  }

  useEffect(() => {
    boGET(`/backoffice/correo/hilo/${id}`).then((r) => {
      if (!r.ok) { dialog.toast(r.msg || "No se pudo abrir", "error"); onVolver?.(); return; }
      setH(r);
      const alias = DESDE_BUZON[r.buzon];
      setDesde(alias ? `${alias}@inspira-legal.cloud` : "");
    });
  }, [id, onVolver]);

  async function responder() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/correo/hilo/${id}/responder`, { texto, desde });
    setEnviando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo enviar", "error"); return; }
    dialog.toast("Respuesta enviada", "success");
    setTexto("");
    onRespondido?.();
    boGET(`/backoffice/correo/hilo/${id}`).then((x) => x.ok && setH(x));
  }

  if (!h) return <div className="p-6 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="ase-esq" style={{ height: 90 }} />)}</div>;
  const asunto = h.mensajes[0]?.asunto || "(sin asunto)";

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="flex items-start gap-2 px-4 py-3 border-b border-[#e6eef5]">
        <button type="button" onClick={onVolver} aria-label="Volver" className="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-[#013446] hover:bg-[#f4f8fb]">←</button>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#0d2c3a] leading-snug break-words">{asunto}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {h.cliente && (
              <button type="button" onClick={() => navigate(`/backoffice/clientes?cliente=${h.cliente.id_cliente}`)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#1d6a4a]">
                Cliente: {h.cliente.nombre}{h.cliente.proceso?.responsable ? ` · ${h.cliente.proceso.responsable}` : ""} →
              </button>
            )}
            {h.lead && (
              <button type="button" onClick={() => navigate(`/backoffice/leads?lead=${h.lead.id_lead}`)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e3f0fe] text-[#013446]">Lead: {h.lead.nombre || "sin nombre"} →</button>
            )}
            {!h.cliente && !h.lead && <span className="text-[11px] text-[#62808f]">No está en Core como cliente ni lead</span>}
          </div>
          {h.atendiendo && (
            <p className="mt-1.5 text-[12px] font-semibold text-[#92400E] bg-[#fef3e7] rounded-lg px-2 py-1">
              {h.atendiendo.nombre} lo tiene abierto ahora: cuidado con responder dos veces.
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <AccionesHilo hilo={h} equipo={equipo} onHecho={onRespondido}
            onNoLeido={async () => { await boPOST(`/backoffice/correo/hilo/${id}/leido`, { leido: false }); onRespondido?.(); onVolver?.(); }} />
          <label className="inline-flex items-center gap-1.5 text-[11.5px] text-[#62808f]">
            Asignado a
            <select value={equipo.find((u) => u.nombre === h.asignado)?.id_usuario || ""} onChange={(e) => asignar(e.target.value)}
              className="text-[12px] border border-[#d8e4ef] rounded-lg px-2 py-1 bg-white text-[#0d2c3a]">
              <option value="">Nadie</option>
              {equipo.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
            </select>
          </label>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 bg-[#f4f8fb]">
        {h.mensajes.map((m) => (
          <div key={m.id} className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 ${m.nuestro ? "ml-auto bg-[#013446] text-white" : "bg-white border border-[#e6eef5] text-[#0d2c3a]"}`}>
            <div className={`flex items-baseline gap-2 text-[11px] mb-1 ${m.nuestro ? "text-white/70" : "text-[#62808f]"}`}>
              <b className={m.nuestro ? "text-white" : "text-[#0d2c3a]"}>{m.de.nombre || m.de.correo}</b>
              <span className="truncate">{m.nuestro ? `desde ${m.de.correo}` : ""}</span>
              <span className="ml-auto whitespace-nowrap">{hora(m.fecha)}</span>
            </div>
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{m.texto?.split(/\n>|\nEl .{5,80}escribió:|\nOn .{5,80}wrote:/)[0] || "(sin texto)"}</p>
            {m.adjuntos?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {m.adjuntos.map((a) => (
                  <button key={a.id} type="button" onClick={() => abrirAdjunto(m.id, a)}
                    className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-lg ${m.nuestro ? "bg-white/15 text-white" : "bg-[#eef2f6] text-[#013446]"}`}>
                    📎 {a.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#e6eef5] p-3 space-y-2 bg-white" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-center gap-2">
          <select value={desde} onChange={(e) => setDesde(e.target.value)}
            className="min-w-0 flex-1 text-[12.5px] border border-[#d8e4ef] rounded-lg px-2 py-2 bg-white text-[#0d2c3a]">
            <option value="">Desde: administracion@ (principal)</option>
            {direcciones.filter((d) => !d.principal).map((d) => <option key={d.correo} value={d.correo}>Desde: {d.nombre || d.correo}</option>)}
          </select>
          <button type="button" onClick={() => setPlantillas(true)}
            className="shrink-0 text-[12.5px] font-semibold text-[#013446] border border-[#d8e4ef] rounded-lg px-3 py-2">Respuestas</button>
        </div>
        <textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escriba la respuesta (de usted). La firma se añade sola."
          className="w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-[#013446]/10" />
        <button type="button" onClick={responder} disabled={!texto.trim() || enviando}
          className="w-full min-h-[46px] rounded-xl bg-[#013446] text-white text-[14px] font-bold disabled:opacity-40">
          {enviando ? "Enviando…" : "Enviar respuesta"}
        </button>
      </div>

      {plantillas && (
        <SelectorRespuestas idSolicitud={h.cliente?.proceso?.id_solicitud}
          onCerrar={() => setPlantillas(false)}
          onElegir={(t) => { setTexto((x) => (x ? `${x}\n\n${t}` : t)); setPlantillas(false); }} />
      )}
    </div>
  );
}
