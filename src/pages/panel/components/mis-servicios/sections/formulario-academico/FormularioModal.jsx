import { ErrBox } from "./Campos";
import { STEPS } from "./constantes";
import { validateStep } from "./utilidades";

// Modo modal: el asistente de nueve pasos en una ventana, con la barra de
// progreso y los círculos para saltar. Salió de FormularioDatosAcademicos.jsx
// al partirlo en piezas (09/10/2026).
export default function FormularioModal({
  step, setStep, hasData, savingForm, formData,
  savingX, xWarning, setXWarning, setModalOpen, showErrors,
  handleCerrarConX, handleNext, handleSave, scrollAreaRef, renderStep,
}) {
  const isLast   = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        {/* Cabecera del modal */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <p className="text-sm font-bold text-primary">Formulario de datos académicos</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Paso {step + 1} / {STEPS.length} — {STEPS[step].title}
            </p>
          </div>
          <button type="button" onClick={handleCerrarConX} disabled={savingX}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40">
            {savingX
              ? <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            }
          </button>
        </div>

        {/* Advertencia al cerrar con X */}
        {xWarning && (
          <div className="shrink-0 mx-5 mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Tu progreso se ha guardado, pero el formulario está incompleto.</p>
              <p className="text-xs text-amber-700 mt-0.5">Vuelve cuando puedas para terminar de rellenarlo.</p>
            </div>
            <button type="button" onClick={() => { setXWarning(false); setModalOpen(false); }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold transition">
              Cerrar
            </button>
          </div>
        )}

        {/* Barra de progreso */}
        <div className="shrink-0 px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary">
              {Math.round(((step + 1) / STEPS.length) * 100)}% completado
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full">
            <div className="h-1.5 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        {/* Círculos de navegación */}
        <div className="shrink-0 hidden sm:flex items-center px-5 pb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button type="button"
                onClick={() => { if (i !== step && (i < step || hasData)) setStep(i); }}
                title={s.title}
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                  i < step   ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400 shadow-sm"
                  : i === step ? "bg-primary text-white shadow-md ring-[3px] ring-primary/25"
                  : hasData    ? "bg-primary-light/15 text-primary-light cursor-pointer hover:bg-primary-light/30"
                  :              "bg-neutral-100 text-neutral-400 cursor-default"
                }`}>
                {i < step ? "✓" : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-300" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso (scrolleable) */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-5 py-4">
            {/* Card del paso */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm mb-4">
              <div className="px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-primary/6 to-transparent flex items-center gap-2.5">
                <span className="text-lg shrink-0">{STEPS[step].icon}</span>
                <h3 className="text-sm font-bold text-primary">{STEPS[step].title}</h3>
              </div>
              <div className="px-4 py-5">
                {renderStep()}
              </div>
            </div>

            </div>

          {/* Navegación — siempre visible al pie del modal */}
          <div className="shrink-0 border-t border-neutral-100 bg-white px-5 pb-4 pt-3 flex flex-col gap-3">
            {showErrors && validateStep(step, formData).length > 0 && (
              <ErrBox show>Completa todos los campos requeridos antes de continuar.</ErrBox>
            )}
            <div className="flex items-center justify-between">
            <button type="button"
              onClick={() => setStep(p => Math.max(0, p - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-30 hover:bg-neutral-50 transition active:scale-95">
              ← Anterior
            </button>

            {!isLast && (
              <button type="button" onClick={handleNext}
                className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light transition-all active:scale-95 shadow-sm">
                Continuar →
              </button>
            )}
            {isLast && (
              <button type="submit" disabled={savingForm}
                className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-50 transition-all active:scale-95 shadow-sm">
                {savingForm
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
                  : "✓ Guardar formulario"
                }
              </button>
            )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
