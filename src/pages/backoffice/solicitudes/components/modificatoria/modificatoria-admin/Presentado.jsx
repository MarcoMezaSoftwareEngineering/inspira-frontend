/* ── 4 · Presentado ante Extranjería ─────────────────────────────────────── */

import { useMemo, useState } from "react";
import { boPOST, boFetch } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";
import { fechaLarga } from "../../../../../../lib/formatos";
import Cabecera from "./Cabecera";

/**
 * El justificante de registro de MERCURIO, y la guía que sale con él.
 *
 * Es un paso propio y no una ranura más de la lista de documentos porque no es
 * un papel del expediente: es el acto de presentar. Al entrar el PDF, el
 * asesorado deja de esperar y pasa a poder seguir su expediente por su cuenta,
 * y la guía sale sola con el archivo adjunto —dónde se consulta, con qué datos,
 * qué número sirve ahora y cuál llega después—.
 *
 * Lo ideal sería que se disparase solo al dejar el archivo en la carpeta de
 * Drive; mientras esa parte no exista, se sube desde aquí.
 */
export default function Presentado({ id, docs, ext, onCambio }) {
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [adoptando, setAdoptando] = useState(null);

  // Lo que el vigilante encontró en la carpeta y nadie ha clasificado. Puede
  // haber varios: ahí caen también requerimientos y resoluciones, así que
  // cuál es el justificante lo dice una persona y no el nombre del archivo.
  const candidatos = useMemo(() => (ext || []).filter((r) => r.sin_clasificar), [ext]);

  async function adoptar(idRegistro) {
    setAdoptando(idRegistro);
    const r = await boPOST(
      `/backoffice/solicitudes/${id}/modificatoria/extranjeria/${idRegistro}/es-justificante`,
    );
    setAdoptando(null);
    if (r?.ok) { dialog.toast(r.msg || "Guardado", "exito"); onCambio(); }
    else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }

  const ranura = docs?.ranuras?.justificante;
  const archivo = ranura?.archivos?.[0] || null;

  async function subir(file) {
    if (!file) return;
    setSubiendo(true);
    const datos = new FormData();
    datos.append("archivo", file);
    const r = await boFetch(`/backoffice/solicitudes/${id}/modificatoria/documentos/justificante`, {
      method: "POST", body: datos,
    });
    setSubiendo(false);
    if (r?.ok) {
      dialog.toast("Justificante subido · ya puedes mandarle la guía", "exito");
      onCambio();
    } else dialog.toast(r?.msg || "No se pudo subir el justificante", "error");
  }

  async function reenviar() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/modificatoria/explicar-seguimiento`);
    setEnviando(false);
    if (r?.ok) dialog.toast(r.msg || "Enviado", "exito");
    else dialog.toast(r?.msg || "No se pudo enviar", "error");
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <Cabecera numero="4" titulo="Presentado ante Extranjería"
        extra={archivo ? (
          <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1
            rounded border bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35">
            presentado
          </span>
        ) : null} />

      {!archivo && candidatos.length > 0 && (
        <div className="mb-3 rounded-lg border border-[#1A3557]/25 bg-[#EEF2F8] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-[#1A3557]">
            Encontrados en la carpeta de Drive
          </p>
          <p className="text-[11.5px] text-[#1A3557]/80 leading-relaxed mt-1 mb-2">
            El vigilante los vio ahí y nadie los ha clasificado. Marca cuál es el
            justificante de registro; los demás se quedan en Extranjería.
          </p>
          <ul className="space-y-1.5">
            {candidatos.map((c) => (
              <li key={c.id_registro} className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-[#1A3557] min-w-0 flex-1 truncate">
                  📄 {c.archivo_nombre || c.titulo}
                </span>
                <button type="button" disabled={adoptando === c.id_registro}
                  onClick={() => adoptar(c.id_registro)}
                  className="shrink-0 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg
                    bg-[#1A3557] text-white hover:opacity-90 disabled:opacity-40">
                  {adoptando === c.id_registro ? "…" : "Es el justificante"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {archivo ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Justificante de registro subido el{" "}
            {fechaLarga(archivo.fecha)}.
            Cuando quieras, mándale la guía de seguimiento: sale con el PDF adjunto y le
            explica dónde consultar, con qué datos, y que las notificaciones le llegan a él
            y a nosotros.
          </p>
          <label className="shrink-0 text-[12px] font-semibold px-3 py-2 rounded-lg border
            border-neutral-300 text-neutral-600 hover:border-neutral-400 cursor-pointer">
            {subiendo ? "Subiendo…" : "Reemplazar"}
            <input type="file" accept="application/pdf,image/*" className="hidden"
              onChange={(e) => subir(e.target.files?.[0])} />
          </label>
          <button type="button" onClick={reenviar} disabled={enviando}
            className="shrink-0 text-[12px] font-semibold px-3 py-2 rounded-lg bg-[#1D6A4A]
              text-white hover:opacity-90 disabled:opacity-40">
            {enviando ? "Enviando…" : "Mandarle la guía"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Sube aquí el <b>justificante de registro</b> que devuelve MERCURIO al presentar.
            Una vez esté, podrás mandarle la guía completa de seguimiento —el portal de la
            sede, con qué datos consultar, el número que empieza por I-, el expediente formal
            que llega después, y qué hacer si recibe un requerimiento— con el PDF adjunto.
            El correo no sale solo: lo mandas tú cuando el expediente esté presentado.
          </p>
          <label className={`shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg
            cursor-pointer ${subiendo ? "bg-neutral-300 text-white"
              : "bg-[#1D6A4A] text-white hover:opacity-90"}`}>
            {subiendo ? "Subiendo…" : "Subir justificante"}
            <input type="file" accept="application/pdf,image/*" className="hidden"
              onChange={(e) => subir(e.target.files?.[0])} />
          </label>
        </div>
      )}

      <p className="text-[10.5px] text-neutral-400 mt-2 leading-relaxed">
        Los cuatro datos de consulta (nº de registro, expediente, NIE y fecha) se apuntan
        arriba, en «El expediente». No hacen falta para mandar la guía: el número está dentro
        del propio justificante y la guía dice dónde buscarlo.
      </p>
    </div>
  );
}
