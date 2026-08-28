// Recordatorio de lo que le falta al asesorado, con su plazo.
//
// Se enseña ANTES de mandarlo. El mensaje lleva fechas calculadas, y una fecha
// mal dicha a alguien que tiene que presentar ante extranjería cuesta cara: el
// asesor lo lee, y si algo no cuadra, no lo manda.
//
// El correo lo envía el servidor. WhatsApp no: se abre wa.me con el texto ya
// escrito y la persona le da a enviar desde su propio número, que es lo que
// tiene sentido sin contratar la API de WhatsApp Business.
import { useState } from "react";
import { boGET, boPOST } from "../../../../../services/backofficeApi";
import { dialog } from "../../../../../services/dialogService";

function Lista({ titulo, items, tono }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <p className={`text-[10px] font-bold uppercase tracking-widest font-mono ${tono}`}>
        {titulo}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((i) => (
          <li key={i} className="text-[12px] text-neutral-700">· {i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function RecordatorioEstancia({ id }) {
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Se pide al desplegar, no al montar: la pantalla del expediente ya hace
  // varias llamadas y esta solo hace falta si el asesor abre el panel.
  async function abrir() {
    const yaAbierto = abierto;
    setAbierto(!yaAbierto);
    if (yaAbierto || datos) return;

    setCargando(true);
    const r = await boGET(`/backoffice/solicitudes/${id}/estancia/recordatorio`);
    setCargando(false);
    if (r?.ok) setDatos(r.recordatorio);
    else dialog.toast(r?.msg || "No se pudo preparar el recordatorio", "error");
  }

  async function enviarCorreo() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/recordatorio`, {});
    setEnviando(false);
    if (r?.ok) dialog.toast(`Recordatorio enviado a ${r.enviado_a}`, "exito");
    else dialog.toast(r?.msg || "No se pudo enviar el correo", "error");
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <button
        type="button"
        onClick={abrir}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-neutral-900 flex-1">
          Recordarle lo que falta
        </span>
        <span className="text-[11px] text-neutral-400">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          {cargando && <p className="text-[12px] text-neutral-400">Preparando…</p>}

          {!cargando && datos && !datos.hay_pendientes && (
            <p className="text-[12.5px] text-[#1D6A4A] font-semibold">
              No le falta nada. No hay nada que recordarle.
            </p>
          )}

          {!cargando && datos?.hay_pendientes && (
            <>
              <Lista titulo="Hay que volver a subirlos"
                items={datos.documentos_observados} tono="text-red-600" />
              <Lista titulo="Documentos que faltan"
                items={datos.documentos_faltan} tono="text-amber-600" />
              <Lista titulo="Datos por completar"
                items={datos.datos_faltan} tono="text-amber-600" />

              {datos.plazo ? (
                <div className="mt-3 rounded-lg bg-[#FEF3E7] border border-amber-300/60 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-800">
                    Todo aprobado, como muy tarde
                  </p>
                  <p className="text-[15px] font-bold text-amber-900 mt-0.5">
                    {datos.plazo.todo_listo_para_largo}
                  </p>
                  <p className="text-[11.5px] text-amber-800/90 leading-relaxed mt-1">
                    Presentación: {datos.plazo.limite_largo} ·{" "}
                    {datos.plazo.dias_para_todo_listo > 0
                      ? `quedan ${datos.plazo.dias_para_todo_listo} días`
                      : datos.plazo.dias_para_todo_listo === 0
                        ? "es hoy"
                        : `pasó hace ${Math.abs(datos.plazo.dias_para_todo_listo)} días`}
                  </p>
                </div>
              ) : (
                // Sin fecha de clases ni de llegada no hay plazo que calcular, y
                // es mejor decirlo que mandar un recordatorio mudo de fechas.
                <p className="mt-3 text-[11.5px] text-neutral-500 leading-relaxed">
                  Sin fecha de inicio de clases ni de llegada a España no se puede
                  calcular su plazo. El mensaje irá sin fechas.
                </p>
              )}

              <details className="mt-3">
                <summary className="text-[11.5px] text-neutral-500 cursor-pointer hover:text-neutral-800">
                  Ver el mensaje que se le manda
                </summary>
                <pre className="mt-2 text-[11px] text-neutral-600 bg-neutral-50 border
                  border-neutral-200 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
                  {datos.texto_plano}
                </pre>
              </details>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={enviarCorreo}
                  disabled={enviando || !datos.correo}
                  title={datos.correo || "No tiene correo en su ficha"}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B]
                    text-white hover:bg-[#035670] disabled:opacity-40"
                >
                  {enviando ? "Enviando…" : "Enviar por correo"}
                </button>

                {datos.whatsapp ? (
                  <a
                    href={datos.whatsapp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border
                      border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10"
                  >
                    Abrir WhatsApp ↗
                  </a>
                ) : (
                  <span className="text-[11.5px] text-neutral-400 self-center">
                    Sin teléfono en su ficha para WhatsApp
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
