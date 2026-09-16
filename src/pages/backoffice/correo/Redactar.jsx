// Escribir un correo nuevo desde Core.
//
// Regla de la casa (16/09/2026): a universidades, consulados y organismos se
// escribe desde la dirección PERSONAL de quien escribe (firma con su nombre y
// cargo); a asesorados, desde la del servicio; a interesados, desde consultas@
// o presupuestos@. Se elige el tipo y la dirección se pone sola; si el
// destinatario parece una universidad u organismo, se propone ese tipo.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import SelectorRespuestas from "../comun/SelectorRespuestas";

const D = "@inspira-legal.cloud";
const TIPOS = [
  { k: "universidad", t: "Universidad u organismo", ayuda: "Desde su dirección personal, con su firma" },
  { k: "asesorado", t: "Asesorado", ayuda: "Desde la dirección del servicio" },
  { k: "consulta", t: "Interesado / consulta", ayuda: `Desde consultas${D}` },
  { k: "presupuesto", t: "Presupuesto", ayuda: `Desde presupuestos${D}` },
  { k: "empresa", t: "Empresa o convenio", ayuda: `Desde empresas${D}` },
];

const PERSONALES = /@(gmail|hotmail|outlook|yahoo|icloud|live|msn|protonmail|aol)\./i;
const INSTITUCIONAL = /@([a-z0-9-]+\.)*(edu|ac|gob|gov|gouv|mil|int)(\.[a-z]{2})?$|@([a-z0-9-]+\.)*(u[a-z]{1,6}|univ[a-z-]*|universidad[a-z-]*|maec|exteriores|inclusion|interior|educacion|ciencia|mecd|uned)\.(es|pe|org|com)$/i;

export default function Redactar({ para: paraInicial = "", desde: desdeInicial = "", idSolicitud = null, onCerrar, onEnviado }) {
  const [direcciones, setDirecciones] = useState([]);
  const [miDireccion, setMiDireccion] = useState(null);
  const [tipo, setTipo] = useState(desdeInicial ? "asesorado" : "");
  const [tipoManual, setTipoManual] = useState(Boolean(desdeInicial));
  const [para, setPara] = useState(paraInicial);
  const [desde, setDesde] = useState(desdeInicial);
  const [asunto, setAsunto] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [plantillas, setPlantillas] = useState(false);

  useEffect(() => {
    boGET("/backoffice/correo/buzones").then((r) => {
      if (!r.ok) return;
      setDirecciones(r.direcciones || []);
      setMiDireccion(r.mi_direccion || null);
    });
  }, []);

  function elegirTipo(k, manual = true) {
    setTipo(k);
    if (manual) setTipoManual(true);
    if (k === "universidad") setDesde(miDireccion || "");
    else if (k === "consulta") setDesde(`consultas${D}`);
    else if (k === "presupuesto") setDesde(`presupuestos${D}`);
    else if (k === "empresa") setDesde(`empresas${D}`);
    else if (k === "asesorado") setDesde(desdeInicial || `asesorados${D}`);
  }

  function cambiarPara(v) {
    setPara(v);
    // Detección: dominio institucional → universidad u organismo.
    if (!tipoManual && /@.+\..+/.test(v) && !PERSONALES.test(v) && INSTITUCIONAL.test(v.trim())) elegirTipo("universidad", false);
  }

  async function enviar() {
    setEnviando(true);
    const r = await boPOST("/backoffice/correo/enviar", { para, asunto, texto, desde, id_solicitud: idSolicitud });
    setEnviando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo enviar", "error"); return; }
    dialog.toast("Correo enviado", "success");
    onEnviado?.();
    onCerrar?.();
  }

  const campo = "w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-4 focus:ring-[#013446]/10";
  const personal = desde && miDireccion && desde === miDireccion;

  return createPortal(
    <div className="fixed inset-0 z-[86] bg-[#011c26]/60 grid place-items-end sm:place-items-center sm:p-4" onClick={onCerrar} role="presentation">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6eef5]">
          <p className="flex-1 text-[15px] font-semibold text-[#013446]">Nuevo correo</p>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full grid place-items-center text-[#62808f] hover:bg-neutral-100">✕</button>
        </div>
        <div className="p-4 space-y-2.5 overflow-y-auto">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#62808f] mb-1.5">¿A quién escribe?</p>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS.map((x) => (
                <button key={x.k} type="button" onClick={() => elegirTipo(x.k)} aria-pressed={tipo === x.k}
                  className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-xl border ${tipo === x.k ? "bg-[#013446] border-[#013446] text-white" : "bg-white border-[#d8e4ef] text-[#0d2c3a]"}`}>
                  {x.t}
                </button>
              ))}
            </div>
            {tipo && <p className="text-[11.5px] text-[#62808f] mt-1">{TIPOS.find((x) => x.k === tipo)?.ayuda}{!tipoManual && tipo === "universidad" ? " · detectado por el dominio" : ""}</p>}
            {tipo === "universidad" && !miDireccion && (
              <p className="text-[11.5px] text-[#b9770e] mt-1">Usted aún no tiene dirección personal: saldrá desde administracion@.</p>
            )}
          </div>

          <input type="email" value={para} onChange={(e) => cambiarPara(e.target.value)} placeholder="Para: correo@ejemplo.com" className={campo} />
          <select value={desde} onChange={(e) => setDesde(e.target.value)} className={campo}>
            <option value="">Desde: administracion@ (principal)</option>
            {direcciones.filter((d) => !d.principal).map((d) => <option key={d.correo} value={d.correo}>Desde: {d.nombre || d.correo}</option>)}
          </select>
          <p className="text-[11.5px] text-[#62808f] -mt-1">
            Firma: {personal ? "personal, con su nombre y cargo" : desde ? "su nombre como parte del equipo de esa dirección" : "equipo Inspira Legal"} (diseño del kit de marca).
          </p>
          <input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Asunto" className={campo} />
          <div className="flex justify-end">
            <button type="button" onClick={() => setPlantillas(true)} className="text-[12.5px] font-semibold text-[#013446] border border-[#d8e4ef] rounded-lg px-3 py-1.5">
              {tipo === "universidad" ? "Plantillas para universidades" : "Respuestas guardadas"}
            </button>
          </div>
          <textarea rows={9} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Estimados señores: … (registro formal). La firma se añade sola." className={campo} />
        </div>
        <div className="p-4 border-t border-[#e6eef5]" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <button type="button" onClick={enviar} disabled={enviando || !para.trim() || !asunto.trim() || !texto.trim()}
            className="w-full min-h-[46px] rounded-xl bg-[#013446] text-white text-[14px] font-bold disabled:opacity-40">
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
      {plantillas && (
        <SelectorRespuestas idSolicitud={idSolicitud} busquedaInicial={tipo === "universidad" ? "Universidad" : ""}
          onCerrar={() => setPlantillas(false)}
          onElegir={(t, r) => {
            setTexto((x) => (x ? `${x}\n\n${t}` : t));
            if (!asunto && r?.titulo) setAsunto(r.titulo.replace(/^Universidad · /, ""));
            setPlantillas(false);
          }} />
      )}
    </div>,
    document.body,
  );
}
