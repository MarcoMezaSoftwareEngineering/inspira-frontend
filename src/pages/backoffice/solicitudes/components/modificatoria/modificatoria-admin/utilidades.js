// Utilidades puras del panel de la modificatoria. Salieron de
// ModificatoriaAdmin.jsx al partirlo en piezas (09/10/2026).

// El número escrito en un campo de texto de la ficha («24.000», «16.576,50»).
// Sin sueldo escrito no hay nada que juzgar. `Number("")` es 0, y por ese
// camino un expediente recien abierto salia en rojo diciendo que no llega al
// minimo: no es que no llegue, es que aun no se ha preguntado.
export const num = (v) => {
  const txt = String(v ?? "").trim();
  if (!txt) return null;
  const n = Number(txt.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
