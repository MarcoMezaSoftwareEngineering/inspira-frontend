import { useMemo, useState } from "react";
import { boPOST } from "../../../../../../services/backofficeApi";
import { fechaLarga } from "../../../../../../lib/formatos";
import Cabecera from "./Cabecera";
import { input } from "./constantes";

/**
 * Cerrar la carpeta.
 *
 * Es el momento en que el expediente pasa al staff de abogados y deja de estar
 * en manos del asesorado. Se le avisa con la fecha prevista de presentacion,
 * que es lo unico que va a querer saber a partir de aqui.
 */
export default function CerrarCarpeta({ id, exp, docs, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(exp.presentacion_prevista || "");
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const oblig = useMemo(() => (docs ? Object.values(docs.ranuras).filter((d) => d.obligatorio) : []), [docs]);
  const aprobados = oblig.filter((d) => d.estado === "APROBADO").length;
  const todoAprobado = oblig.length > 0 && aprobados === oblig.length;
  const yaCerrada = Boolean(exp.carpeta_lista_at);

  async function cerrar() {
    setEnviando(true); setMsg("");
    const r = await boPOST(`/backoffice/solicitudes/${id}/modificatoria/carpeta-lista`, {
      presentacion_prevista: fecha || null,
      avisar,
    });
    setEnviando(false);
    setMsg(r?.msg || (r?.ok ? "Cerrada" : "No se pudo cerrar"));
    if (r?.ok) { setAbierto(false); onHecho(); }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <Cabecera numero="3" titulo="Cerrar la carpeta"
        extra={
          yaCerrada ? (
            <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1
              rounded border bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35">
              cerrada
            </span>
          ) : (
            <span className={`ml-auto text-[11.5px] font-semibold ${
              todoAprobado ? "text-[#1D6A4A]" : "text-neutral-400"
            }`}>
              {aprobados} de {oblig.length} aprobados
            </span>
          )
        } />

      {yaCerrada && !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Cerrada el {fechaLarga(exp.carpeta_lista_at)}
            {exp.presentacion_prevista && <> · presentacion prevista el <b>{exp.presentacion_prevista}</b></>}.
            El asesorado ya fue avisado. Si ha subsanado algo, revisalo y vuelve a enviarlo:
            el correo sale con el estado de ese momento.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg border
              border-neutral-300 text-neutral-600 hover:border-neutral-400">
            Revisar y reenviar
          </button>
        </div>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Marca la carpeta como revisada y terminada. Se le avisa de que pasa al staff de
            abogados y de cuando esta prevista la presentacion.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className={`shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg ${
              todoAprobado ? "bg-[#1D6A4A] text-white hover:opacity-90"
                : "border border-neutral-300 text-neutral-600 hover:border-neutral-400"
            }`}>
            Cerrar carpeta
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {!todoAprobado && (
            <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-300
              rounded-lg px-3 py-2 leading-relaxed">
              Todavia hay {oblig.length - aprobados} documento(s) obligatorio(s) sin aprobar.
              Puedes cerrarla igual: el correo al asesorado saldra con el detalle de cada
              observacion y con la advertencia legal de que el expediente se presenta por
              plazo y de que lo aportado es responsabilidad suya.
            </p>
          )}
          <label className="flex items-center gap-2 text-[12px] text-neutral-600">
            Presentacion prevista
            <input type="date" className={input} value={fecha}
              onChange={(e) => setFecha(e.target.value)} />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
            <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
            Avisar al asesorado por correo
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={cerrar} disabled={enviando}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A]
                text-white disabled:opacity-40">
              {enviando ? "Enviando…" : yaCerrada ? "Reenviar aviso" : "Cerrar y avisar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="text-[11.5px] text-neutral-600 mt-2">{msg}</p>}
    </div>
  );
}
