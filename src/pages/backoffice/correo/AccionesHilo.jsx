// Qué hacer con un correo: convertirlo en tarea, crear el lead, descartarlo o dejarlo como
// no leído para luego. Ningún correo es pendiente por sí solo: lo decide quien
// lo lee.
import { useState } from "react";
import { createPortal } from "react-dom";
import { boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

export default function AccionesHilo({ hilo, equipo, onHecho, onNoLeido, onDescartar }) {
  const [tarea, setTarea] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const asunto = hilo.mensajes[0]?.asunto || "(sin asunto)";
  const externo = hilo.mensajes.find((m) => !m.nuestro)?.de;
  const hoy = new Date().toISOString().slice(0, 10);

  async function crearTarea() {
    setGuardando(true);
    const quien = hilo.cliente?.nombre || hilo.lead?.nombre || externo?.nombre || externo?.correo || "";
    const r = await boPOST("/backoffice/tareas", {
      titulo: `${tarea.titulo}${quien ? ` · ${quien}` : ""}`.slice(0, 180),
      descripcion: `Desde el correo «${asunto}» de ${externo?.correo || "—"}.\n${tarea.nota || ""}\nAbrir: /backoffice/correo?hilo=${hilo.id}`.trim(),
      categoria: hilo.lead ? "LEADS" : "SERVICIOS",
      prioridad: tarea.prioridad,
      vence_el: tarea.vence_el || null,
      id_asignado: tarea.id_asignado ? Number(tarea.id_asignado) : undefined,
      id_solicitud: hilo.cliente?.proceso?.id_solicitud || undefined,
      id_lead: hilo.lead?.id_lead || undefined,
    });
    setGuardando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo crear la tarea", "error"); return; }
    dialog.toast("Tarea creada", "success");
    window.dispatchEvent(new Event("inspira:tareas-cambio"));
    setTarea(null);
    onHecho?.();
  }

  async function crearLead() {
    const nombre = await dialog.prompt("Nombre del interesado", externo?.nombre || "", "Crear lead");
    if (!nombre) return;
    const r = await boPOST("/backoffice/leads", {
      nombre, email: externo?.correo, origen_detalle: "Correo recibido",
      nota: `Escribió por correo: «${asunto}».`,
    });
    if (r.ok) { dialog.toast("Lead creado", "success"); onHecho?.(); }
    else dialog.toast(r.msg || "No se pudo crear el lead", "error");
  }

  const boton = "text-[11.5px] font-semibold rounded-lg px-2.5 py-1 border bg-white border-[#d8e4ef] text-[#0d2c3a] hover:bg-[#f4f8fb]";
  const campo = "w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5 bg-white";

  return (
    <>
      <button type="button" className={boton}
        onClick={() => setTarea({ titulo: asunto.replace(/^(re|rv|fw|fwd):\s*/i, ""), id_asignado: "", vence_el: hoy, prioridad: "MEDIA", nota: "" })}>
        Convertir en tarea
      </button>
      {!hilo.cliente && !hilo.lead && externo?.correo && (
        <button type="button" className={boton} onClick={crearLead}>Crear lead</button>
      )}
      <button type="button" className={boton} onClick={onNoLeido}>Marcar no leído</button>
      <button type="button" className={boton} onClick={onDescartar}
        title={hilo.descartado ? "Vuelve a la bandeja" : "Relleno o ya resuelto: sale de la bandeja (no se borra)"}>
        {hilo.descartado ? "Recuperar" : "Descartar"}
      </button>

      {tarea && createPortal(
        <div className="fixed inset-0 z-[90] bg-[#011c26]/60 grid place-items-end sm:place-items-center sm:p-4" onClick={() => setTarea(null)} role="presentation">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-4 space-y-2.5 shadow-2xl" onClick={(e) => e.stopPropagation()} role="presentation"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
            <p className="text-[15px] font-semibold text-[#013446]">Convertir en tarea</p>
            <input value={tarea.titulo} onChange={(e) => setTarea({ ...tarea, titulo: e.target.value })} placeholder="Qué hay que hacer" className={campo} />
            <select value={tarea.id_asignado} onChange={(e) => setTarea({ ...tarea, id_asignado: e.target.value })} className={campo}>
              <option value="">Para mí</option>
              {equipo.map((u) => <option key={u.id_usuario} value={u.id_usuario}>Para {u.nombre}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={tarea.vence_el} onChange={(e) => setTarea({ ...tarea, vence_el: e.target.value })} className={campo} />
              <select value={tarea.prioridad} onChange={(e) => setTarea({ ...tarea, prioridad: e.target.value })} className={campo}>
                <option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="URGENTE">Urgente</option>
              </select>
            </div>
            <textarea rows={3} value={tarea.nota} onChange={(e) => setTarea({ ...tarea, nota: e.target.value })} placeholder="Nota (opcional)" className={campo} />
            {(hilo.cliente || hilo.lead) && (
              <p className="text-[12px] text-[#62808f]">Quedará enlazada a {hilo.cliente ? `el cliente ${hilo.cliente.nombre}` : `el lead ${hilo.lead.nombre || ""}`}.</p>
            )}
            <button type="button" onClick={crearTarea} disabled={guardando || !tarea.titulo.trim()}
              className="w-full min-h-[46px] rounded-xl bg-[#013446] text-white text-[14px] font-bold disabled:opacity-40">
              {guardando ? "Creando…" : "Crear tarea"}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
