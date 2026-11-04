// Documentos que se generan con los datos del expediente de arraigo
// socioformativo: el EX-10 (apartados 1, 4 y 6) y la declaración jurada de
// compromiso de matriculación, en Word.
//
// Solo se descargan. Archivarlos en el expediente necesita la ranura del
// servicio en el servidor, que se añade con el servicio mismo.
import { useState } from "react";
import { RUTA_EX10, valoresEX10, casillasEX10, faltaParaEX10 } from "./ex10";
import { construirDDJJ } from "./ddjj";

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

function Generador({ titulo, descripcion, construir, exp, faltan }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function descargar() {
    setOcupado(true);
    setEstado({ tipo: "trabajando", texto: "Generando…" });
    try {
      const { blob, nombre } = await construir(exp);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setEstado({ tipo: "ok", texto: "Generado y descargado." });
    } catch (e) {
      setEstado({ tipo: "error", texto: e.message || "No se pudo generar" });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 px-3.5 py-3">
      <p className="text-[12.5px] font-semibold text-neutral-800">{titulo}</p>
      <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-0.5">{descripcion}</p>
      {faltan.length > 0 && (
        <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
          Saldrá incompleto: falta {faltan.slice(0, 4).join(", ")}
          {faltan.length > 4 ? ` y ${faltan.length - 4} más` : ""}.
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        <button type="button" onClick={descargar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:opacity-90 disabled:opacity-40">
          {ocupado ? "…" : "Generar y descargar"}
        </button>
        {estado && (
          <span className={`text-[11.5px] ${
            estado.tipo === "error" ? "text-red-600" : estado.tipo === "ok" ? "text-[#1D6A4A]" : "text-neutral-500"
          }`}>{estado.texto}</span>
        )}
      </div>
    </div>
  );
}

export default function GeneradoresArraigo({ exp }) {
  const faltan = faltaParaEX10(exp);
  return (
    <div id="bloque-generadores" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[13.5px] font-bold text-[#1A3557]">Documentos que generamos</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">con los datos del expediente</span>
      </div>
      <div className="space-y-2">
        <Generador
          exp={exp} faltan={faltan} construir={construirEX10}
          titulo="Formulario EX-10"
          descripcion="Residencia por circunstancias excepcionales. Rellena los apartados 1 (persona extranjera), 4 (notificaciones) y 6 (centro de formación)."
        />
        <Generador
          exp={exp}
          faltan={[exp.apellido1 || exp.nombres, exp.pasaporte_numero, exp.form_denominacion, exp.form_entidad].every(Boolean)
            ? [] : ["nombre, pasaporte o datos de la formación"]}
          construir={(e) => construirDDJJ(e)}
          titulo="Declaración jurada de matriculación (Word)"
          descripcion="Compromiso de matriculación a efectos del arraigo para la formación, en .docx para poder ajustarlo antes de que el titular lo firme a mano."
        />
      </div>
      <p className="text-[11px] text-neutral-400 leading-relaxed mt-3">
        Salen de los datos del expediente: revísalos antes de presentarlos.
      </p>
    </div>
  );
}
