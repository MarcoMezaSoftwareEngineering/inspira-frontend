// Aviso de cierre de carpeta: la hora a partir de la cual ya no se puede
// ampliar documentación.
//
// No es el recordatorio de lo que falta, aunque lo incluya. Es el comunicado
// que fija por escrito el momento de la presentación y deja constancia de las
// consecuencias: presentada la solicitud, solo entra documentación nueva si
// Extranjería la requiere, y un expediente incompleto puede acabar en
// denegación.
//
// Por eso la fecha y la hora las escribe el asesor, no las calcula el sistema:
// cuándo se cierra una carpeta es una decisión, no un cálculo, y quien la toma
// tiene que verla escrita antes de mandarla.
import { useState } from "react";
import { boPOST } from "../../../../../services/backofficeApi";
import { dialog } from "../../../../../services/dialogService";

/** Hoy en formato AAAA-MM-DD, para no ofrecer fechas ya pasadas. */
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function enLargo(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return null;
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export default function DeadlineEstancia({ id }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("11:00");
  const [recomendada, setRecomendada] = useState("");
  const [conPendientes, setConPendientes] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const fechaLarga = enLargo(fecha);
  const recomendadaLarga = enLargo(recomendada);
  const listo = Boolean(fechaLarga) && /^\d{2}:\d{2}$/.test(hora);

  async function enviar() {
    if (!listo) return;
    // Se confirma con la fecha escrita en largo: un dedazo en el día es la
    // diferencia entre avisar a tiempo y avisar tarde, y aquí no hay vuelta
    // atrás una vez sale el correo.
    const ok = await dialog.confirm(
      `Se le comunicará formalmente que el cierre documental es el ${fechaLarga} `
      + `a las ${hora} h (hora peninsular española), con carácter improrrogable, y que `
      + `después solo cabrá aportar documentación si Extranjería la requiere. ¿Se envía?`,
      "Enviar el aviso de cierre",
    );
    if (!ok) return;

    setEnviando(true);
    try {
      const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/deadline`, {
        fecha_limite: fecha,
        hora_limite: hora,
        fecha_recomendada: recomendada || null,
        incluir_pendientes: conPendientes,
      });
      if (r?.ok) {
        dialog.toast(`Aviso de cierre enviado a ${r.enviado_a}`, "exito");
        setAbierto(false);
      } else {
        dialog.toast(r?.msg || "No se pudo enviar el aviso", "error");
      }
    } catch (e) {
      dialog.toast(e?.message || "No se pudo enviar el aviso", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="text-[13px] font-semibold text-neutral-800">
            Aviso de cierre de carpeta
          </span>
          <span className="block text-[11.5px] text-neutral-500 leading-relaxed">
            Fija la hora de presentación y advierte de que después no se puede ampliar
          </span>
        </span>
        <span className="text-[11px] text-neutral-400">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <label className="text-[11.5px] text-neutral-600">
              <span className="block font-semibold text-neutral-700 mb-1">Se cierra el</span>
              <input
                type="date"
                value={fecha}
                min={hoyISO()}
                onChange={(e) => setFecha(e.target.value)}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-[12.5px]"
              />
            </label>

            <label className="text-[11.5px] text-neutral-600">
              <span className="block font-semibold text-neutral-700 mb-1">A las (España)</span>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-[12.5px]"
              />
            </label>

            <label className="text-[11.5px] text-neutral-600">
              <span className="block font-semibold text-neutral-700 mb-1">
                Fecha recomendada <span className="font-normal text-neutral-400">(opcional)</span>
              </span>
              <input
                type="date"
                value={recomendada}
                max={fecha || undefined}
                onChange={(e) => setRecomendada(e.target.value)}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-[12.5px]"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[12px] text-neutral-700">
            <input
              type="checkbox"
              checked={conPendientes}
              onChange={(e) => setConPendientes(e.target.checked)}
            />
            Enumerar en el correo lo que aún le falta
          </label>

          {fechaLarga && (
            <div className="rounded-lg bg-[#FEF2F2] border border-red-200 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-red-700">
                Se le dirá
              </p>
              <p className="text-[14px] font-bold text-red-700 mt-0.5 first-letter:uppercase">
                {fechaLarga}, {hora} h
              </p>
              <p className="text-[11.5px] text-red-900/70 leading-relaxed mt-1">
                {recomendadaLarga
                  ? <>Con recomendación de tenerlo todo el <b className="first-letter:uppercase">{recomendadaLarga}</b>.</>
                  : "Sin fecha recomendada: solo se le da el tope."}
              </p>
            </div>
          )}

          <p className="text-[11.5px] text-neutral-500 leading-relaxed">
            El correo va en registro formal e incluye los tres plazos del expediente
            (antelación de dos meses, tope de los noventa días y fecha recomendada), la
            fecha que se le comunicó al inicio, y la advertencia de que una vez presentada
            la solicitud solo cabe aportar documentación si Extranjería la requiere
            (art. 68 Ley 39/2015). Delimita también el servicio: los requerimientos
            entran, el recurso de reposición no.
          </p>

          <button
            type="button"
            onClick={enviar}
            disabled={!listo || enviando}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B]
              text-white hover:bg-[#035670] disabled:opacity-40"
          >
            {enviando ? "Enviando…" : "Enviar aviso de cierre"}
          </button>
        </div>
      )}
    </div>
  );
}
