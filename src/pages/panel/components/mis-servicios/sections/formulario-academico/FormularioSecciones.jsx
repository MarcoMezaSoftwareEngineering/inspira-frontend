import SeccionPanel from "../SeccionPanel";
import IconoPaso from "../../../../../../components/common/IconoPaso";
import ResumenDatos from "./ResumenDatos";
import { ErrBox } from "./Campos";
import { STEPS, SECCIONES } from "./constantes";
import { validateStep } from "./utilidades";

// Modo inline: las secciones del expediente. Salió de
// FormularioDatosAcademicos.jsx al partirlo en piezas (09/10/2026).
//
// El asistente de nueve pasos pasó a ser una lista de secciones plegables
// (Carina, 08/09/2026): se ve de un golpe lo que falta, se entra a corregir
// una sola cosa sin recorrer el resto, y se guarda solo. Las preguntas y su
// validación son exactamente las mismas: cada sección agrupa los pasos que
// ya existían, y el motor sigue recibiendo los mismos campos.
export default function FormularioSecciones({
  formData, planCCAAs, lado, hasData, savingForm, estado,
  handleSubmitFormulario, onGuardarProgreso,
  seccAbierta, setSeccAbierta, setStep, showErrors, setShowErrors, renderStep,
}) {
  const completa = (sec) => sec.pasos.every((i) => validateStep(i, formData, planCCAAs).length === 0);
  const nOk = SECCIONES.filter(completa).length;
  const abrirSecc = (i) => {
    const sec = SECCIONES[i];
    setSeccAbierta((prev) => (prev === i ? -1 : i));
    if (sec?.pasos?.length) { setStep(sec.pasos[0]); setShowErrors(false); }
  };
  const seguir = (i) => {
    const sec = SECCIONES[i];
    const falta = sec.pasos.find((p) => validateStep(p, formData, planCCAAs).length > 0);
    if (falta !== undefined) { setStep(falta); setShowErrors(true); return; }
    setShowErrors(false);
    onGuardarProgreso?.();
    setSeccAbierta(Math.min(SECCIONES.length - 1, i + 1));
    const sig = SECCIONES[i + 1];
    if (sig?.pasos?.length) setStep(sig.pasos[0]);
  };

  return (
    <SeccionPanel
      numero="2"
      titulo="Formulario académico"
      subtitulo={lado === "asesor"
        ? "Las mismas preguntas que responde el asesorado. Cada cambio queda guardado en la solicitud."
        : "Con esto preparamos tu informe. Puedes ir por partes: se guarda solo. Cuanto más concreto seas en qué quieres estudiar, más afinado saldrá."}
      estado={estado}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <p className="text-[12.5px] font-bold text-emerald-700 inline-flex items-center gap-1.5">
          <IconoPaso nombre="check" className="w-4 h-4" strokeWidth={2.6} />
          {hasData ? "Guardado automáticamente" : "Se guarda solo al escribir"}
        </p>
        <span className="ex-est" data-e={nOk === SECCIONES.length ? "ok" : "on"}>
          {nOk} de {SECCIONES.length} secciones
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-gradient-to-r from-[#1d7a52] to-[#35b57f] transition-all duration-700"
          style={{ width: `${Math.round((nOk / SECCIONES.length) * 100)}%` }} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
        {SECCIONES.map((sec, i) => {
          const open = seccAbierta === i;
          const ok = completa(sec);
          return (
            <section key={sec.t} className="ex-secc" data-abierta={open ? 1 : 0} data-ok={ok ? 1 : 0}>
              <button type="button" className="ex-secc-h" onClick={() => abrirSecc(i)} aria-expanded={open}>
                <span className="ex-secc-ico"><IconoPaso nombre={sec.ico} /></span>
                <span className="ex-secc-txt">
                  <b>{i + 1}. {sec.t}</b>
                  <span>{sec.s}</span>
                </span>
                <span className="ex-est" data-e={ok ? "ok" : "info"}>{ok ? "Completa" : "Pendiente"}</span>
                <svg className="ex-secc-chev" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {open && (
                <div className="ex-secc-b">
                  {sec.resumen ? (
                    <>
                      <ResumenDatos formData={formData} />
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <button type="button" onClick={handleSubmitFormulario} disabled={savingForm} className="ex-btn">
                          <IconoPaso nombre="send" />
                          {savingForm ? "Guardando…" : lado === "asesor" ? "Guardar el formulario" : hasData ? "Guardar y recalcular mi informe" : "Enviar a mi asesor"}
                        </button>
                        <span className="text-[11px] text-neutral-400">
                          {lado === "asesor" ? "Después, recalcular el informe desde el paso 3: la lista curada no se toca." : "Al enviar, tu asesor recalcula el informe sin perder lo que ya marcaste."}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {sec.pasos.map((p, k) => (
                        <div key={p} className={k > 0 ? "mt-5 pt-5 border-t border-neutral-100" : ""}>
                          {sec.pasos.length > 1 && (
                            <p className="ex-sub">{STEPS[p].title}</p>
                          )}
                          {renderStep(p)}
                        </div>
                      ))}
                      {showErrors && sec.pasos.some((p) => validateStep(p, formData, planCCAAs).length > 0) && (
                        <ErrBox show>Completa los campos marcados para seguir.</ErrBox>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <button type="button" onClick={() => seguir(i)} className="ex-btn">
                          Guardar y seguir <IconoPaso nombre="arrowRight" />
                        </button>
                        <span className="text-[11px] text-neutral-400">Se guarda solo al escribir.</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </form>
    </SeccionPanel>
  );
}
