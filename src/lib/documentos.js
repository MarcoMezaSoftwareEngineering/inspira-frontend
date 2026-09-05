// Reglas de los documentos del expediente, las mismas para el panel del
// asesorado y para Inspira Core. Espejo de inspira-backend/src/modules/documentos/documentos.utils.js.
//
// Regla de Carina (04/09/2026): cada documento va en un solo PDF, con todo
// junto, y sin subcarpetas. Solo «experiencia profesional» y «formación
// complementaria» admiten varios archivos, porque son varios certificados.
// La salida se enumera «1. Pasaporte», «2. Título apostillado»… con el nombre
// del documento, no con un código.

const VARIOS = [/experiencia/i, /formaci[oó]n\s+complementaria/i, /complementari/i, /extracurricular/i, /otros\s+documentos/i, /certificados?\s+de\s+trabajo/i];

/** ¿Este ítem del checklist admite varios archivos? Se decide por su nombre. */
export function permiteVarios(nombreItem) {
  const n = String(nombreItem || "");
  return VARIOS.some((rx) => rx.test(n));
}

function extensionDe(nombre) {
  const m = /\.([a-z0-9]{1,5})$/i.exec(String(nombre || ""));
  return m ? `.${m[1].toLowerCase()}` : "";
}

function limpio(texto) {
  return String(texto || "").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Nombre con el que se descarga un archivo: «3. Título apostillado.pdf» si
 * el ítem es de un solo archivo; «7. Experiencia profesional - Constancia
 * ACME.pdf» si admite varios.
 */
export function nombreDescarga(it, doc) {
  const numero = it?.numero ? `${it.numero}. ` : "";
  const item = limpio(it?.item?.nombre_item || "Documento");
  const original = limpio(doc?.nombre_original || "");
  const ext = extensionDe(original) || (String(doc?.mime_type || "").includes("pdf") ? ".pdf" : "");
  if (permiteVarios(it?.item?.nombre_item)) {
    const base = original.replace(/\.[a-z0-9]{1,5}$/i, "") || "archivo";
    return `${numero}${item} - ${base}${ext}`;
  }
  return `${numero}${item}${ext}`;
}
