// Sustituye {variables} por los datos del caso; las que faltan quedan a la vista.
export function rellenar(texto, vars = {}) {
  return String(texto || "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] ? vars[k] : m));
}
