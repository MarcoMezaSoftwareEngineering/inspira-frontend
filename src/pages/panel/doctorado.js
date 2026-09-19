// El recorrido del doctorado en el panel (18/09/2026).
//
// Seis pasos sencillos, del diagnóstico a la llegada a España. El paso en el
// que está se deduce de la etapa que el equipo mueve en Inspira Core
// (Solicitud.etapa; backend: modules/solicitudes/catalogo.js, ETAPAS.doc).
//
// Los documentos son los del servicio. Cada uno sabe en qué paso se pide y
// con qué nombres puede aparecer en su checklist: así cada paso enseña los
// suyos, venga el checklist de la plantilla del doctorado
// (prisma/sql/checklist_doctorado_2026_09_18.sql) o de una más antigua.

export const GUIA_DOCTORADO = "/guias/guia-servicio-doctorado.pdf";

export const PASOS_DOCTORADO = [
  {
    id: "diagnostico", icono: "search", corto: "Diagnóstico", titulo: "Diagnóstico de acceso",
    explica: "Revisamos tus títulos y tus notas para confirmar que te dan acceso a un doctorado en España y qué programas encajan contigo.",
    tuParte: "Sube tus títulos y certificados de notas apostillados, el certificado de acceso a doctorado de tu universidad y tu CV.",
  },
  {
    id: "programas", icono: "book", corto: "Programas", titulo: "Programas y director",
    explica: "Buscamos los programas de doctorado y las líneas de investigación que encajan con tu perfil, y preparamos el contacto con posibles directores de tesis.",
    tuParte: "Cuéntale a tu asesor tu tema de investigación y ten tu CV al día: es lo primero que mira un director.",
  },
  {
    id: "candidatura", icono: "send", corto: "Candidatura", titulo: "Candidatura",
    explica: "Preparamos y presentamos tu solicitud de admisión al programa, con la documentación que pide cada universidad.",
    tuParte: "Sube la carta de motivación, el anteproyecto de investigación y el aval del director.",
  },
  {
    id: "admision", icono: "award", corto: "Admisión", titulo: "Admisión y matrícula",
    explica: "La comisión académica del programa estudia tu candidatura. Con la admisión, te acompañamos en la matrícula.",
    tuParte: "Estate atento a los mensajes de tu asesor: la matrícula tiene plazos cortos.",
  },
  {
    id: "residencia", icono: "idCard", corto: "Residencia", titulo: "Residencia (UGE)",
    explica: "Con la admisión o el convenio de investigación, tramitamos tu autorización de residencia ante la Unidad de Grandes Empresas (UGE).",
    tuParte: "Sube el seguro médico sin copagos, el certificado de antecedentes penales y la acreditación de medios económicos.",
  },
  {
    id: "espana", icono: "flag", corto: "En España", titulo: "En España",
    explica: "Llegas a España con tu autorización. Te orientamos con la toma de huellas, la TIE y los primeros trámites.",
    tuParte: "Guarda a mano tu pasaporte, la resolución de residencia y la carta de admisión.",
  },
];

// Etapa de Core → paso del recorrido. Las que no están aquí (o vacías) caen
// en el primero.
const PASO_DE_ETAPA = {
  "Nuevo": 0,
  "Documentación": 0,
  "Búsqueda de programa": 1,
  "Contacto con directores": 1,
  "Preinscrito": 2,
  "Esperando admisión": 3,
  "Admitido": 3,
  "Matriculado": 3,
  "No admitido": 3,
  "Residencia UGE": 4,
  "Residencia concedida": 5,
  "Finalizado": 5,
};

/**
 * Dónde está: índice del paso actual y cómo va. `hecho` = recorrido terminado;
 * `pausa` = Suspendido; `admitido` = ya tiene la admisión (paso 3 cumplido a medias).
 * @returns {{ indice: number, hecho: boolean, pausa: boolean, admitido: boolean, noAdmitido: boolean }}
 */
export function pasoDoctorado(etapa) {
  const e = String(etapa || "").trim();
  return {
    indice: PASO_DE_ETAPA[e] ?? 0,
    hecho: e === "Finalizado",
    pausa: e === "Suspendido",
    admitido: e === "Admitido" || e === "Matriculado",
    noAdmitido: e === "No admitido",
  };
}

/**
 * Los documentos del servicio. `patron` reconoce el ítem del checklist por su
 * nombre; van de más a menos concreto (el máster antes que el grado, porque
 * «certificado de notas» a secas es el del grado).
 */
export const DOCS_DOCTORADO = [
  { clave: "pasaporte", paso: "diagnostico", nombre: "Pasaporte", patron: /pasaporte/i },
  { clave: "titulo_master", paso: "diagnostico", nombre: "Título de máster apostillado", patron: /t[ií]tulo.*(m[aá]ster|maestr[ií]a)/i },
  { clave: "notas_master", paso: "diagnostico", nombre: "Notas de máster apostilladas", patron: /notas.*(m[aá]ster|maestr[ií]a)/i },
  { clave: "acceso", paso: "diagnostico", nombre: "Certificado de acceso a doctorado", patron: /acceso.*doctorado|doctorado.*acceso/i },
  { clave: "titulo_grado", paso: "diagnostico", nombre: "Título de grado apostillado", patron: /t[ií]tulo|\bdiploma\b|bachiller/i },
  { clave: "notas_grado", paso: "diagnostico", nombre: "Notas de grado apostilladas", patron: /notas/i },
  { clave: "cv", paso: "diagnostico", nombre: "Currículum vitae (CV)", patron: /\bcv\b|curr[ií]cul/i },
  { clave: "motivacion", paso: "candidatura", nombre: "Carta de motivación", patron: /motivaci/i },
  { clave: "anteproyecto", paso: "candidatura", nombre: "Anteproyecto de investigación", patron: /anteproyecto|proyecto de (tesis|investigaci)/i },
  { clave: "aval", paso: "candidatura", nombre: "Aval del director de tesis", patron: /aval|director/i },
  { clave: "seguro", paso: "residencia", nombre: "Seguro médico sin copagos", patron: /seguro/i },
  { clave: "antecedentes", paso: "residencia", nombre: "Antecedentes penales apostillados", patron: /antecedentes/i },
  { clave: "medios", paso: "residencia", nombre: "Medios económicos", patron: /medios|solvencia|econ[oó]mic|extracto/i },
];

const nombreItem = (it) => String(it?.item?.nombre_item || "");

/** El documento del servicio al que corresponde un ítem del checklist, o null. */
export function docDeItem(it) {
  const n = nombreItem(it);
  return DOCS_DOCTORADO.find((d) => d.patron.test(n)) || null;
}

/**
 * El checklist repartido por pasos: { diagnostico: [...], candidatura: [...] }.
 * Lo que no se reconoce va al primer paso, para que nada quede escondido.
 */
export function checklistPorPaso(checklist = []) {
  const out = {};
  for (const it of checklist || []) {
    const paso = docDeItem(it)?.paso || PASOS_DOCTORADO[0].id;
    (out[paso] ||= []).push(it);
  }
  return out;
}

const ESTADOS_LISTOS = ["aprobado", "no_aplica"];

/**
 * Cómo va cada documento del servicio de un paso: «listo», «en revisión»,
 * «por corregir», «falta» o «sin pedir» (no está aún en su checklist).
 */
export function docsDelPaso(paso, checklist = []) {
  return DOCS_DOCTORADO.filter((d) => d.paso === paso).map((d) => {
    const items = (checklist || []).filter((it) => docDeItem(it)?.clave === d.clave);
    const estados = items.map((it) => String(it.estado_item || "pendiente").toLowerCase());
    let estado = "sin_pedir";
    if (items.length) {
      if (estados.some((e) => e === "observado" || e === "rechazado")) estado = "corregir";
      else if (estados.every((e) => ESTADOS_LISTOS.includes(e))) estado = "listo";
      else if (estados.some((e) => e === "enviado")) estado = "revision";
      else estado = "falta";
    }
    return { ...d, estado };
  });
}

export const ETIQUETA_DOC = {
  listo: { texto: "Listo", tono: "ok" },
  revision: { texto: "En revisión", tono: "info" },
  corregir: { texto: "Por corregir", tono: "alto" },
  falta: { texto: "Falta", tono: "aviso" },
  sin_pedir: { texto: "Te lo pedirá tu asesor", tono: "tipo" },
};
