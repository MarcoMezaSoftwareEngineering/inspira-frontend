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

/**
 * Las observaciones que el asesor ha escrito y el asesorado todavía no ha
 * recibido.
 *
 * Van aquí y no junto a cada documento porque aquí es donde el asesor mira qué
 * le queda por decirle. El correo sale con todas juntas: revisar un expediente
 * son seis o siete documentos seguidos, y avisando al observar cada uno el
 * asesorado se encontraría seis correos en cinco minutos sin saber cuál mirar.
 */
function ObservacionesSinAvisar({ id, docs, onCambio }) {
  const [enviando, setEnviando] = useState(false);

  const porDocumento = Object.values(docs?.ranuras || {})
    .map((d) => ({
      etiqueta: d.etiqueta,
      textos: (d.archivos?.[0]?.observaciones || [])
        .filter((o) => !o.avisada_at)
        .map((o) => o.texto),
    }))
    .filter((d) => d.textos.length);

  const cuantas = porDocumento.reduce((n, d) => n + d.textos.length, 0);
  if (!cuantas) return null;

  async function avisar() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/avisar-observaciones`);
    setEnviando(false);
    if (r?.ok) {
      dialog.toast(r.msg || "Avisado", r.avisado ? "exito" : "info");
      onCambio?.();
    } else dialog.toast(r?.msg || "No se pudo avisar", "error");
  }

  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-700">
        Observaciones sin comunicar
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {porDocumento.map((d) => (
          <li key={d.etiqueta}>
            <p className="text-[12px] font-semibold text-amber-900">{d.etiqueta}</p>
            {d.textos.map((t, i) => (
              <p key={i} className="text-[11.5px] text-amber-800 leading-relaxed pl-2.5
                border-l-2 border-amber-300 mt-0.5">{t}</p>
            ))}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={avisar}
        disabled={enviando}
        className="mt-2.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#B45309]
          text-white hover:opacity-90 disabled:opacity-40"
      >
        {enviando ? "Enviando…" : `Mandarle ${cuantas === 1 ? "la observación" : "las observaciones"}`}
      </button>
    </div>
  );
}

export default function RecordatorioEstancia({ id, docs, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Se cuenta aquí y no al abrir: el asesor tiene que ver que hay algo que
  // mandar sin desplegar el bloque, o no lo despliega nunca.
  const sinAvisar = Object.values(docs?.ranuras || {})
    .flatMap((d) => d.archivos?.[0]?.observaciones || [])
    .filter((o) => !o.avisada_at).length;

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
        {sinAvisar > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded
            border bg-amber-50 text-amber-800 border-amber-300">
            {sinAvisar} sin comunicar
          </span>
        )}
        <span className="text-[11px] text-neutral-400">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <ObservacionesSinAvisar id={id} docs={docs} onCambio={onCambio} />

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

              {/* Los DOS plazos, y cual es la fecha. Antes solo salia el mas
                  cercano, asi que a quien se le habia pasado la antelacion se
                  le daba por fecha una vencida y se le ocultaba el tope, que
                  era el unico que aun podia cumplir. */}
              {datos.plazos?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {datos.plazos.map((p) => (
                    <div
                      key={p.motivo}
                      className={`flex items-baseline gap-2 text-[11.5px] px-2.5 py-1.5 rounded-lg border ${
                        p.manda
                          ? "bg-[#FEF3E7] border-amber-300/60"
                          : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      <span className="font-semibold text-neutral-700 flex-1">{p.etiqueta}</span>
                      <span className={p.vencido ? "text-red-600 font-semibold" : "text-neutral-700"}>
                        {p.limite_largo}
                      </span>
                      <span className={`shrink-0 ${p.vencido ? "text-red-500" : "text-neutral-400"}`}>
                        {p.vencido ? `pasó hace ${Math.abs(p.dias_restantes)} d` : `${p.dias_restantes} d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {datos.plazo ? (
                <div className="mt-2 rounded-lg bg-[#023A4B] px-3 py-2.5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-300">
                    {datos.plazo.vencido
                      ? "El tope ya pasó"
                      : "Todo aprobado, como muy tarde"}
                  </p>
                  <p className="text-[15px] font-bold mt-0.5">
                    {datos.plazo.vencido
                      ? datos.plazo.limite_largo
                      : datos.plazo.todo_listo_para_largo}
                  </p>
                  <p className="text-[11.5px] text-white/70 leading-relaxed mt-1">
                    {datos.plazo.vencido
                      ? "Habla con el asesorado antes de presentar nada."
                      : `Tope: ${datos.plazo.limite_largo} · ${datos.plazo.dias_de_margen} días de margen para revisar` }
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[11.5px] text-neutral-500 leading-relaxed">
                  Sin fecha de llegada a España no hay tope que calcular, y el tope es la
                  fecha que se le da. El mensaje irá sin ella.
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
