import SeccionPanel from "./SeccionPanel";
import useFormularioAcademico from "./formulario-academico/useFormularioAcademico";
import FormularioSecciones from "./formulario-academico/FormularioSecciones";
import FormularioModal from "./formulario-academico/FormularioModal";
import PasoCarrera from "./formulario-academico/pasos/PasoCarrera";
import PasoUniversidad from "./formulario-academico/pasos/PasoUniversidad";
import PasoExperiencia from "./formulario-academico/pasos/PasoExperiencia";
import PasoInvestigacion from "./formulario-academico/pasos/PasoInvestigacion";
import PasoIngles from "./formulario-academico/pasos/PasoIngles";
import PasoIdiomaBecas from "./formulario-academico/pasos/PasoIdiomaBecas";
import PasoTipoMaster from "./formulario-academico/pasos/PasoTipoMaster";
import PasoDetalles from "./formulario-academico/pasos/PasoDetalles";
import PasoRegionFechas from "./formulario-academico/pasos/PasoRegionFechas";

// El formulario académico del asesorado (el que alimenta el informe de
// másteres). Se partió en piezas el 09/10/2026 sin cambiar el HTML ni el
// comportamiento (lo vigilan las instantáneas de FormularioDatosAcademicos.test.jsx).
// Aquí queda el reparto; lo demás vive en formulario-academico/:
//   - useFormularioAcademico.js: estado, catálogo, autocompletado y acciones.
//   - pasos/: las preguntas de cada uno de los nueve pasos.
//   - FormularioSecciones.jsx: el modo del expediente (secciones plegables),
//     el que usan hoy el panel del asesorado e Inspira Core.
//   - FormularioModal.jsx: el asistente en ventana, cuando no hay contexto.
//   - constantes.js, utilidades.js (validación de cada paso), Campos.jsx,
//     ListaExperiencia, ListaTemas y ResumenDatos.

// ── Componente principal ──────────────────────────────────────────────────────

export default function FormularioDatosAcademicos({
  formData, setFormData, handleSubmitFormulario, onGuardarProgreso, savingForm, hasData,
  planCCAAs,  // { bloqueado: bool, opciones: string[] } | null
  lado = "asesorado", // "asesor" cuando lo rellena Inspira Core: mismo formulario, otros textos
}) {
  const {
    modalOpen, setModalOpen, step, setStep, showErrors, setShowErrors,
    ramas, sugCarreras, buscarCarreras, subareas, todasComunidades,
    xWarning, setXWarning, savingX, siempreAbierto, seccAbierta, setSeccAbierta,
    uniQ, showSugg, setShowSugg, auip, setAuip, uniWrap, scrollAreaRef,
    set, handleUniChange, selectSugerencia, confirmarAuip,
    handleCerrarConX, handleNext, handleSave,
    has, suggestions, comunidades, toggleComunidad,
  } = useFormularioAcademico({ formData, setFormData, handleSubmitFormulario, onGuardarProgreso, planCCAAs });

  // ── Renderizado de cada paso ──────────────────────────────────────────────

  function renderStep(s = step) {
    const errBox = (field) => has(field);

    switch (s) {
      case 0: return (
        <PasoCarrera formData={formData} set={set} has={has}
          buscarCarreras={buscarCarreras} sugCarreras={sugCarreras} />
      );
      case 1: return (
        <PasoUniversidad formData={formData} set={set} has={has}
          uniWrap={uniWrap} uniQ={uniQ} handleUniChange={handleUniChange} setShowSugg={setShowSugg}
          showSugg={showSugg} suggestions={suggestions} selectSugerencia={selectSugerencia}
          auip={auip} confirmarAuip={confirmarAuip} setAuip={setAuip} />
      );
      case 2: return <PasoExperiencia formData={formData} set={set} has={has} />;
      case 3: return <PasoInvestigacion formData={formData} set={set} has={has} />;
      case 4: return <PasoIngles formData={formData} set={set} has={has} />;
      case 5: return <PasoIdiomaBecas formData={formData} set={set} has={has} />;
      case 6: return (
        <PasoTipoMaster formData={formData} set={set} has={has} ramas={ramas} subareas={subareas} />
      );
      case 7: return <PasoDetalles formData={formData} set={set} has={has} />;
      case 8: return (
        <PasoRegionFechas formData={formData} set={set} has={has} planCCAAs={planCCAAs}
          todasComunidades={todasComunidades} comunidades={comunidades} toggleComunidad={toggleComunidad} />
      );

      default: return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const estado = hasData ? "completado" : "pendiente";

  // ── Modo inline: las secciones del expediente ────────────────────────────────
  // (las secciones plegables viven en FormularioSecciones.jsx)
  if (siempreAbierto) {
    return (
      <FormularioSecciones
        formData={formData} planCCAAs={planCCAAs} lado={lado} hasData={hasData}
        savingForm={savingForm} estado={estado}
        handleSubmitFormulario={handleSubmitFormulario} onGuardarProgreso={onGuardarProgreso}
        seccAbierta={seccAbierta} setSeccAbierta={setSeccAbierta} setStep={setStep}
        showErrors={showErrors} setShowErrors={setShowErrors} renderStep={renderStep} />
    );
  }

  // ── Modo modal (acordeón clásico) ─────────────────────────────────────────────

  const subtitulo = hasData
    ? "Ya tienes datos guardados. Haz clic para revisar o modificar."
    : "Completa este formulario para personalizar tu informe de búsqueda.";

  return (
    <>
      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modalOpen && (
        <FormularioModal
          step={step} setStep={setStep} hasData={hasData} savingForm={savingForm} formData={formData}
          savingX={savingX} xWarning={xWarning} setXWarning={setXWarning} setModalOpen={setModalOpen}
          showErrors={showErrors} handleCerrarConX={handleCerrarConX} handleNext={handleNext}
          handleSave={handleSave} scrollAreaRef={scrollAreaRef} renderStep={renderStep} />
      )}

      {/* ── Sección en el panel (siempre colapsada, abre el modal) ──────── */}
      <SeccionPanel
        numero="3"
        titulo="Formulario de datos académicos"
        subtitulo={subtitulo}
        estado={estado}
        open={false}
        onToggle={() => setModalOpen(true)}
      />
    </>
  );
}
