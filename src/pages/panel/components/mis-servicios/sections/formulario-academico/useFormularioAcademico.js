// Estado del formulario académico: paso del asistente, errores, modal,
// sección abierta, catálogo (ramas, sub-áreas, comunidades), autocompletado
// de la universidad y las acciones de guardar y avanzar. Salió de
// FormularioDatosAcademicos.jsx al partirlo en piezas (09/10/2026); el orden
// de los hooks y de los efectos es el de siempre.
import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { apiGET } from "../../../../../../services/api";
import { SeccionSiempreAbiertoCtx } from "../SeccionPanel";
import { TODAS_COMUNIDADES_FALLBACK, COMUNIDAD_INDIFERENTE, UNIS_SUGERENCIAS, STEPS } from "./constantes";
import { norm, detectarAuip, validateStep } from "./utilidades";

export default function useFormularioAcademico({
  formData, setFormData, handleSubmitFormulario, onGuardarProgreso, planCCAAs,
}) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [step, setStep]               = useState(0);
  const [showErrors, setShowErrors]   = useState(false);
  const [ramas, setRamas]             = useState([]);
  // Sugerencias de carrera desde el catálogo, con un pequeño retardo para no
  // pedir una por tecla.
  const [sugCarreras, setSugCarreras] = useState([]);
  const carrerasTimer = useRef(null);
  function buscarCarreras(texto) {
    clearTimeout(carrerasTimer.current);
    const q = String(texto || "").trim();
    if (q.length < 3) return;
    carrerasTimer.current = setTimeout(() => {
      apiGET(`/api/catalogo/titulaciones?q=${encodeURIComponent(q)}`).then((r) => {
        if (r?.ok && Array.isArray(r.titulaciones)) setSugCarreras(r.titulaciones.map((t) => t.titulacion));
      }).catch(() => {});
    }, 250);
  }
  const [subareas, setSubareas]       = useState([]);
  const [todasComunidades, setTodasComunidades] = useState(TODAS_COMUNIDADES_FALLBACK);
  const [xWarning, setXWarning]       = useState(false);
  const [savingX, setSavingX]         = useState(false);

  const siempreAbierto = useContext(SeccionSiempreAbiertoCtx);
  const [editando, setEditando]       = useState(false);
  const [seccAbierta, setSeccAbierta] = useState(0);

  useEffect(() => {
    apiGET("/api/catalogo/ramas").then((r) => {
      if (r.ok && Array.isArray(r.ramas)) setRamas(r.ramas);
    }).catch(() => {});
    apiGET("/api/catalogo/subareas").then((r) => {
      if (r.ok && Array.isArray(r.subareas)) setSubareas(r.subareas);
    }).catch(() => {});
    apiGET("/api/catalogo/comunidades").then((r) => {
      if (r.ok && Array.isArray(r.comunidades) && r.comunidades.length > 0)
        setTodasComunidades(r.comunidades);
    }).catch(() => {});
  }, []);

  // Universidad autocomplete
  const [uniQ, setUniQ]         = useState(formData.universidad_origen || "");
  const [showSugg, setShowSugg] = useState(false);
  const [auip, setAuip]         = useState(() => detectarAuip(formData.universidad_origen || ""));
  const uniWrap        = useRef(null);
  const scrollAreaRef  = useRef(null);

  // Sync uniQ if formData changes externally
  useEffect(() => {
    setUniQ(formData.universidad_origen || "");
  }, [formData.universidad_origen]);

  useEffect(() => {
    const handler = (e) => { if (uniWrap.current && !uniWrap.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  // Resetear errores al cambiar de paso
  useEffect(() => { setShowErrors(false); }, [step]);

  // Inicializar presupuesto_hasta si el usuario llega al paso sin haberlo tocado
  useEffect(() => {
    if (step === 7 && !formData.presupuesto_hasta) {
      setFormData((p) => ({ ...p, presupuesto_hasta: "3000" }));
    }
  }, [step]);


  function set(key, val) { setFormData((p) => ({ ...p, [key]: val })); }

  function handleUniChange(val) {
    setUniQ(val);
    set("universidad_origen", val);
    const det = detectarAuip(val);
    setAuip(det);
    if (det === "si") set("es_auip", "si");
    else if (det === "no_detectado") set("es_auip", "");
  }

  function selectSugerencia(uni) {
    setUniQ(uni); set("universidad_origen", uni);
    const det = detectarAuip(uni); setAuip(det);
    if (det === "si") set("es_auip", "si");
    setShowSugg(false);
  }

  function confirmarAuip(val) {
    setAuip(val); set("es_auip", val === "si" ? "si" : "no");
  }

  async function handleCerrarConX() {
    setSavingX(true);
    if (onGuardarProgreso) await onGuardarProgreso();
    setSavingX(false);
    const pendientes = STEPS.reduce((acc, _, i) => acc + validateStep(i, formData, planCCAAs).length, 0);
    if (pendientes > 0) {
      setXWarning(true);
      return; // no cerrar aún — el usuario verá la advertencia con botón confirmar
    }
    setModalOpen(false);
  }

  function handleNext() {
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) {
      setShowErrors(true);
      setTimeout(() => {
        const el = scrollAreaRef.current?.querySelector(
          ".border-red-200, .border-red-300, .border-red-400"
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 30);
      return;
    }
    setShowErrors(false);
    setStep((p) => Math.min(STEPS.length - 1, p + 1));
  }

  async function handleSave(e) {
    e.preventDefault();
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) { setShowErrors(true); return; }
    await handleSubmitFormulario(e);
    setModalOpen(false);
  }

  async function handleSaveInline(e) {
    e.preventDefault();
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) { setShowErrors(true); return; }
    if (step < STEPS.length - 1) {
      setShowErrors(false);
      setStep((p) => Math.min(STEPS.length - 1, p + 1));
      return;
    }
    await handleSubmitFormulario(e);
    setEditando(false);
    setStep(0);
  }

  // Computed
  const stepErrors = showErrors ? validateStep(step, formData, planCCAAs) : [];
  function has(f) { return stepErrors.includes(f); }

  // Las sugerencias solo dependen de lo escrito en la universidad: normalizar
  // la lista entera en cada render (cada tecla en cualquier campo) sobraba.
  const suggestions = useMemo(() => (uniQ.length >= 2
    ? UNIS_SUGERENCIAS.filter(u => norm(u).includes(norm(uniQ))).slice(0, 6)
    : []), [uniQ]);

  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];

  function toggleComunidad(c) {
    if (c === COMUNIDAD_INDIFERENTE) {
      set("comunidades_preferidas", comunidades.includes(c) ? [] : [c]);
    } else {
      const sinIndiferente = comunidades.filter(x => x !== COMUNIDAD_INDIFERENTE);
      const next = sinIndiferente.includes(c)
        ? sinIndiferente.filter(x => x !== c)
        : [...sinIndiferente, c];
      set("comunidades_preferidas", next);
    }
  }

  return {
    modalOpen, setModalOpen, step, setStep, showErrors, setShowErrors,
    ramas, sugCarreras, buscarCarreras, subareas, todasComunidades,
    xWarning, setXWarning, savingX, siempreAbierto, seccAbierta, setSeccAbierta,
    uniQ, showSugg, setShowSugg, auip, setAuip, uniWrap, scrollAreaRef,
    set, handleUniChange, selectSugerencia, confirmarAuip,
    handleCerrarConX, handleNext, handleSave,
    has, suggestions, comunidades, toggleComunidad,
  };
}
