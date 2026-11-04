// Rellena la plantilla oficial del EX-10 con los datos del expediente.
import { RUTA_EX10, valoresEX10, casillasEX10 } from "./ex10";

export async function construirEX10(exp, cargarPlantilla = () => fetch(RUTA_EX10)) {
  const [{ PDFDocument, StandardFonts }, resp] = await Promise.all([import("pdf-lib"), cargarPlantilla()]);
  if (!resp.ok) throw new Error("No se encontró la plantilla del EX-10");

  const pdf = await PDFDocument.load(await resp.arrayBuffer());
  const form = pdf.getForm();
  const fuente = await pdf.embedFont(StandardFonts.Helvetica);

  for (const [campo, valor] of Object.entries(valoresEX10(exp))) {
    if (!valor) continue;
    try {
      const c = form.getTextField(campo);
      c.setText(String(valor));
      c.setFontSize(9);
    } catch { /* casilla ausente en esta versión de la plantilla */ }
  }
  for (const casilla of casillasEX10(exp)) {
    try { form.getCheckBox(casilla).check(); } catch { /* idem */ }
  }
  form.updateFieldAppearances(fuente);

  const apellido = (exp.apellido1 || "solicitud").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([await pdf.save()], { type: "application/pdf" }),
    nombre: `EX10-${apellido}.pdf`,
  };
}
