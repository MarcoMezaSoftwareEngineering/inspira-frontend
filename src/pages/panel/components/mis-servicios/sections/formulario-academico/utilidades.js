// Utilidades puras del formulario académico: las fechas de inicio que se
// ofrecen, los temas sugeridos, la detección de universidades AUIP y la
// validación de cada paso. Salieron de FormularioDatosAcademicos.jsx al
// partirlo en piezas (09/10/2026).
import { SUGERENCIAS_TEMAS, SUGERENCIAS_POR_RAMA, AUIP_KEYS } from "./constantes";

// Cuándo quiere empezar. La lista estaba escrita a mano y se quedó en enero
// de 2027: quien apunta al curso siguiente no tenía casilla. Se generan las
// cuatro entradas que vienen (septiembre y enero, alternando) y, si el
// formulario guardado tiene una que ya no está, se conserva para que no
// desaparezca lo que contestó.
export function opcionesInicio(actual, hoy = new Date()) {
  const out = [];
  let y = hoy.getFullYear();
  let esSep = hoy.getMonth() <= 8; // septiembre de este año vale hasta que acaba
  if (!esSep) y += 1;
  for (let i = 0; i < 4; i += 1) {
    if (esSep) { out.push({ value: `sep_${y}`, label: `Sep ${y}` }); esSep = false; y += 1; }
    else { out.push({ value: `ene_${y}`, label: `Ene ${y}` }); esSep = true; }
  }
  if (actual && actual !== "flexible" && !out.some((o) => o.value === actual)) {
    const m = /^(sep|ene)_(\d{4})$/.exec(actual);
    out.unshift({ value: actual, label: m ? `${m[1] === "sep" ? "Sep" : "Ene"} ${m[2]}` : actual });
  }
  out.push({ value: "flexible", label: "Flexible / No sé" });
  return out;
}

export function sugerirTemas(areaCarrera, rama) {
  const lista = [...(SUGERENCIAS_TEMAS[areaCarrera] || []), ...(SUGERENCIAS_POR_RAMA[rama] || [])];
  if (!lista.length) return SUGERENCIAS_TEMAS.Otra;
  return [...new Set(lista)];
}

export function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function detectarAuip(texto) {
  const val = norm(texto);
  if (val.length < 4) return null;
  const found = AUIP_KEYS.some((k) => {
    const kn = norm(k);
    if (kn.length < 5) return false;
    const esc = kn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|\\s)" + esc + "(\\s|$)").test(val);
  });
  if (found) return "si";
  if (val.length >= 6) return "no_detectado";
  return null;
}

export function validateStep(s, formData, planCCAAs = null) {
  const missing = [];
  const coms = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];

  switch (s) {
    case 0:
      if (!formData.carrera_titulo?.trim()) missing.push("carrera_titulo");
      if (!formData.area_carrera)           missing.push("area_carrera");
      break;
    case 1: {
      if (!formData.universidad_origen?.trim()) missing.push("universidad_origen");
      const promStr = String(formData.promedio_peru || "").trim();
      if (!promStr) {
        missing.push("promedio_peru");
      } else {
        const nota   = parseFloat(promStr);
        const escala = formData.promedio_escala || "20";
        const maxMap = { "20": 20, "10": 10, "5": 5, "4": 4, "100": 100 };
        const max    = maxMap[escala] || 20;
        if (isNaN(nota) || nota < 0 || nota > max)
          missing.push("promedio_rango");
      }
      if (!formData.ubicacion_grupo)    missing.push("ubicacion_grupo");
      if (!formData.otra_maestria_tiene) missing.push("otra_maestria_tiene");
      break;
    }
    case 2:
      if (!formData.experiencia_anios) missing.push("experiencia_anios");
      if (formData.experiencia_anios && formData.experiencia_anios !== "sin") {
        if (!formData.experiencia_vinculada) missing.push("experiencia_vinculada");
      }
      break;
    case 3:
      if (!formData.investigacion_experiencia) missing.push("investigacion_experiencia");
      if (!formData.formacion_diplomados && !formData.formacion_encuentros &&
          !formData.formacion_otros && !formData.formacion_ninguna)
        missing.push("formacion_complementaria");
      break;
    case 4:
      if (!formData.ingles_situacion) missing.push("ingles_situacion");
      if (formData.ingles_situacion === "uni"  && !formData.ingles_uni_nivel)           missing.push("ingles_uni_nivel");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_tipo)           missing.push("ingles_intl_tipo");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_puntaje?.trim()) missing.push("ingles_intl_puntaje");
      break;
    case 5:
      if (!formData.idioma_master_es && !formData.idioma_master_bilingue && !formData.idioma_master_ingles)
        missing.push("idioma_master");
      if (!formData.beca_desea) missing.push("beca_desea");
      break;
    case 6: {
      // La rama es opcional si ya escribió qué máster busca: se deduce de ahí.
      const escribioMaster = Array.isArray(formData.masteres_deseados)
        && formData.masteres_deseados.some((t) => String(t || "").trim());
      if (!formData.area_interes_master && !escribioMaster) missing.push("area_interes_master");
      break;
    }
    case 7:
      if (!formData.duracion_preferida)    missing.push("duracion_preferida");
      if (!formData.practicas_preferencia) missing.push("practicas_preferencia");
      if (!formData.modalidad_preferida)   missing.push("modalidad_preferida");
      break;
    case 8:
      if (coms.length === 0) missing.push("comunidades_preferidas");
      if (!formData.inicio_previsto) missing.push("inicio_previsto");
      break;
    default:
      break;
  }
  return missing;
}
