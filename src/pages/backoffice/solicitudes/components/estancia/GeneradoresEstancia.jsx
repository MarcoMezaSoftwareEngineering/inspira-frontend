// Generadores del EX-00 y de la carta de representación.
//
// Los dos salen del mismo expediente, así que no hay que reescribir nada: lo
// que el asesorado puso en sus datos es lo que aparece en los impresos. Eso
// evita el error clásico de copiar un apellido mal al pasarlo a mano.
//
// Además de descargarse, se pueden archivar directamente en el expediente:
// descargarlo sólo lo deja en el ordenador de quien pulsó el botón, y quien
// tiene que poder cogerlo es el cliente.
import { useState } from "react";
import { boFetch } from "../../../../../services/backofficeApi";
import {
  REPRESENTANTE, valoresEX00, casillasEX00, faltaParaEX00, nombreCompleto,
} from "./ex00";

const RUTA_EX00 = "/formularios/ex00-estancia.pdf";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function hoyLargo() {
  const d = new Date();
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ── EX-00 ───────────────────────────────────────────────────────────────── */

async function construirEX00(exp) {
  const [{ PDFDocument, StandardFonts }, resp] = await Promise.all([
    import("pdf-lib"),
    fetch(RUTA_EX00),
  ]);
  if (!resp.ok) throw new Error("No se encontró la plantilla del EX-00");

  const pdf = await PDFDocument.load(await resp.arrayBuffer());
  const form = pdf.getForm();
  // La plantilla pide una fuente que no lleva incrustada; sin pasarla, pdf-lib
  // cae en otra que desentona con el impreso.
  const times = await pdf.embedFont(StandardFonts.TimesRoman);

  for (const [campo, valor] of Object.entries(valoresEX00(exp))) {
    if (!valor) continue;
    try {
      const c = form.getTextField(campo);
      c.setText(String(valor));
      c.setFontSize(9);
    } catch { /* casilla ausente en esta versión de la plantilla */ }
  }
  for (const casilla of casillasEX00(exp)) {
    try { form.getCheckBox(casilla).check(); } catch { /* idem */ }
  }

  for (const c of form.getFields()) {
    try { c.updateAppearances?.(times); } catch { /* no todos aceptan fuente */ }
  }
  form.updateFieldAppearances(times);

  const apellido = (exp.apellido1 || "solicitud").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([await pdf.save()], { type: "application/pdf" }),
    nombre: `EX00-${apellido}.pdf`,
  };
}

/* ── Carta de representación ─────────────────────────────────────────────── */

async function construirCarta(exp) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([595.28, 841.89]); // A4
  const normal = await pdf.embedFont(StandardFonts.TimesRoman);
  const negrita = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const M = 70;              // margen
  const ANCHO = 595.28 - M * 2;
  let y = 760;

  const centrar = (txt, fuente, tam) => {
    const w = fuente.widthOfTextAtSize(txt, tam);
    pagina.drawText(txt, { x: (595.28 - w) / 2, y, size: tam, font: fuente, color: rgb(0, 0, 0) });
  };

  centrar("CARTA DE REPRESENTACIÓN", negrita, 14);
  y -= 50;

  const completo = nombreCompleto(exp) || "________________";
  const pasaporte = exp.pasaporte_numero || "____________";

  const cuerpo =
    `Yo, ${completo}, identificado con Pasaporte N.º ${pasaporte}, comparezco y por medio ` +
    `de la presente OTORGO a la letrada ${REPRESENTANTE.nombre}, identificada con número de ` +
    `DNI ${REPRESENTANTE.dni}, y número de colegiatura (Colegiado N. ${REPRESENTANTE.colegiatura}) ` +
    `para que inicie con el procedimiento administrativo ante la oficina de extranjería de ` +
    `España para el procedimiento de estancia por estudios de mi persona.`;

  // Justificado a la izquierda, partiendo por palabras: el texto es corto y
  // no compensa un algoritmo de justificado completo.
  const TAM = 11.5;
  let linea = "";
  for (const palabra of cuerpo.split(" ")) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (normal.widthOfTextAtSize(prueba, TAM) > ANCHO) {
      pagina.drawText(linea, { x: M, y, size: TAM, font: normal });
      y -= 19;
      linea = palabra;
    } else {
      linea = prueba;
    }
  }
  if (linea) { pagina.drawText(linea, { x: M, y, size: TAM, font: normal }); y -= 19; }

  y -= 40;
  const ciudad = exp.uni_localidad || exp.dom_localidad || "________________";
  pagina.drawText(`${ciudad}, ${hoyLargo()}`, { x: M, y, size: TAM, font: normal });

  // Espacio para la firma: la carta la firma el titular, de su puño y letra.
  y -= 90;
  pagina.drawLine({
    start: { x: M, y }, end: { x: M + 220, y },
    thickness: 0.8, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 18;
  pagina.drawText(completo, { x: M, y, size: TAM, font: negrita });
  y -= 17;
  pagina.drawText(`Pasaporte N.º ${pasaporte}`, { x: M, y, size: TAM, font: normal });

  const apellido = (exp.apellido1 || "carta").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([await pdf.save()], { type: "application/pdf" }),
    nombre: `Carta-representacion-${apellido}.pdf`,
  };
}

/* ── Interfaz ────────────────────────────────────────────────────────────── */

function Generador({ id, titulo, descripcion, ranura, construir, exp, faltan, onArchivado }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function conDoc(quehacer, aviso) {
    setOcupado(true);
    setEstado({ tipo: "trabajando", texto: aviso });
    try {
      const { blob, nombre } = await construir(exp);
      await quehacer(blob, nombre);
    } catch (e) {
      setEstado({ tipo: "error", texto: e.message || "No se pudo generar" });
    } finally {
      setOcupado(false);
    }
  }

  const descargar = () => conDoc((blob, nombre) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setEstado({ tipo: "ok", texto: "Generado y descargado." });
  }, "Generando…");

  const archivar = () => conDoc(async (blob, nombre) => {
    const datos = new FormData();
    datos.append("archivo", new File([blob], nombre, { type: "application/pdf" }));
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/documentos/${ranura}`, {
      method: "POST", body: datos,
    });
    const j = await r?.json().catch(() => null);
    if (!r?.ok || j?.ok === false) throw new Error(j?.msg || "No se pudo archivar");
    onArchivado?.();
    setEstado({ tipo: "ok", texto: "Archivado en el expediente. El cliente ya puede descargarlo." });
  }, "Generando y archivando…");

  return (
    <div className="rounded-xl border border-neutral-200 px-3.5 py-3">
      <p className="text-[12.5px] font-semibold text-neutral-800">{titulo}</p>
      <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-0.5">{descripcion}</p>

      {faltan.length > 0 && (
        <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200
          rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
          Saldrá incompleto: falta {faltan.slice(0, 4).join(", ")}
          {faltan.length > 4 ? ` y ${faltan.length - 4} más` : ""}.
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        <button type="button" onClick={descargar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B]
            text-white hover:opacity-90 disabled:opacity-40">
          {ocupado ? "…" : "Generar y descargar"}
        </button>
        <button type="button" onClick={archivar} disabled={ocupado}
          title="Lo deja en el expediente para que el cliente lo descargue"
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border-[1.5px]
            border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B]/5 disabled:opacity-40">
          Archivar en el expediente
        </button>
        {estado && (
          <span className={`text-[11.5px] ${
            estado.tipo === "error" ? "text-red-600"
              : estado.tipo === "ok" ? "text-[#1D6A4A]" : "text-neutral-500"
          }`}>{estado.texto}</span>
        )}
      </div>
    </div>
  );
}

export default function GeneradoresEstancia({ id, exp, onArchivado }) {
  const faltan = faltaParaEX00(exp);

  return (
    <div id="bloque-generadores" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
          font-bold text-white font-serif" style={{ background: "#023A4B" }}>5</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Documentos que generamos</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">
          con los datos del expediente
        </span>
      </div>

      <div className="space-y-2">
        <Generador
          id={id} exp={exp} faltan={faltan} onArchivado={onArchivado}
          construir={construirEX00} ranura="ex00"
          titulo="Formulario EX-00"
          descripcion="Autorización de estancia de larga duración, relleno con los datos del asesorado y de la letrada."
        />
        <Generador
          id={id} exp={exp} onArchivado={onArchivado}
          faltan={[exp.apellido1 || exp.nombres, exp.pasaporte_numero].every(Boolean)
            ? [] : ["nombre y pasaporte"]}
          construir={construirCarta} ranura="representacion"
          titulo="Carta de representación"
          descripcion={`Otorga la representación a ${REPRESENTANTE.nombre}. La firma el titular a mano, así que va con el espacio para la firma.`}
        />
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed mt-3">
        Los dos salen de los datos del expediente: si algo está mal escrito allí, saldrá mal
        aquí. Revísalos antes de presentarlos.
      </p>
    </div>
  );
}
