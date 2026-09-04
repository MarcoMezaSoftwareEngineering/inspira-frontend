// Recordatorio de lo que le falta al asesorado de máster: datos del perfil,
// formulario, documentos por subir y observados. Se enseña ANTES de mandarlo,
// como el de estancia. Sin plazos: en máster los marca cada universidad y
// viven en el bloque 6.
import { useState } from "react";
import { boGET, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

function Lista({ titulo, items, tono }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <p className={`text-[10px] font-bold uppercase tracking-widest font-mono ${tono}`}>{titulo}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((i) => <li key={i} className="text-[12px] text-neutral-700">· {i}</li>)}
      </ul>
    </div>
  );
}

function fechaLarga(iso) {
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function RecordatorioMaster({ detalle }) {
  const id = detalle?.id_solicitud;
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Si el asesorado pidió revisión, el asesor tiene que verlo sin desplegar nada.
  const revision = detalle?.datos_panel?.revision_solicitada_at
    ? { fecha: detalle.datos_panel.revision_solicitada_at, nota: detalle.datos_panel.revision_nota }
    : null;

  async function abrir() {
    const ya = abierto;
    setAbierto(!ya);
    if (ya || datos) return;
    setCargando(true);
    const r = await boGET(`/backoffice/solicitudes/${id}/master/recordatorio`);
    setCargando(false);
    if (r?.ok) setDatos(r.recordatorio);
    else dialog.toast(r?.msg || "No se pudo preparar el recordatorio", "error");
  }

  async function enviarCorreo() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/master/recordatorio`, {});
    setEnviando(false);
    if (r?.ok) dialog.toast(`Recordatorio enviado a ${r.enviado_a}`, "exito");
    else dialog.toast(r?.msg || "No se pudo enviar el correo", "error");
  }

  return (
    <div className="mt-4 bg-white border border-neutral-200 rounded-xl p-4">
      {revision && (
        <div className="mb-3 rounded-lg border border-[#1D6A4A]/30 bg-[#E8F5EE] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-[#14532d]">
            Pidió revisión el {fechaLarga(revision.fecha)}
          </p>
          {revision.nota && (
            <p className="text-[12px] text-[#14532d] mt-1 leading-relaxed">«{revision.nota}»</p>
          )}
        </div>
      )}

      <button type="button" onClick={abrir} className="w-full flex items-center gap-2 text-left">
        <span className="text-[13px] font-semibold text-neutral-900 flex-1">Recordarle lo que falta</span>
        <span className="text-[11px] text-neutral-400">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          {cargando && <p className="text-[12px] text-neutral-400">Preparando…</p>}
          {!cargando && datos && !datos.hay_pendientes && (
            <p className="text-[12.5px] text-[#1D6A4A] font-semibold">No le falta nada. No hay nada que recordarle.</p>
          )}
          {!cargando && datos?.hay_pendientes && (
            <>
              <Lista titulo="Hay que volver a subirlos" items={datos.documentos_observados} tono="text-red-600" />
              <Lista titulo="Documentos que faltan" items={datos.documentos_faltan} tono="text-amber-600" />
              <Lista titulo="Datos por completar" items={datos.datos_faltan} tono="text-amber-600" />
              <details className="mt-3">
                <summary className="text-[11.5px] text-neutral-500 cursor-pointer hover:text-neutral-800">
                  Ver el mensaje que se le manda
                </summary>
                <pre className="mt-2 text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
                  {datos.texto_plano}
                </pre>
              </details>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={enviarCorreo} disabled={enviando || !datos.correo}
                  title={datos.correo || "No tiene correo en su ficha"}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1A3557] text-white hover:opacity-90 disabled:opacity-40">
                  {enviando ? "Enviando…" : "Enviar por correo"}
                </button>
                {datos.whatsapp ? (
                  <a href={datos.whatsapp.url} target="_blank" rel="noreferrer"
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10">
                    Abrir WhatsApp ↗
                  </a>
                ) : (
                  <span className="text-[11.5px] text-neutral-400 self-center">Sin teléfono en su ficha para WhatsApp</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
