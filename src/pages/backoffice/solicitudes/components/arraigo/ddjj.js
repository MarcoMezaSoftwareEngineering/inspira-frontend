// Declaración jurada de compromiso de matriculación, en Word (.docx).
//
// Recoge el contenido del apartado «Compromiso de matriculación a efectos del
// arraigo para la formación (art. 124.4)» del modelo oficial, pero como
// documento propio y editable: el asesor puede ajustar el texto antes de
// imprimirlo y que el titular lo firme a mano.
import { aDMY, nombreCompleto } from "../estancia/ex00";
import { TIPOS_FORMACION, MODALIDADES } from "./ex10";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const RAYA = "____________________";
const v = (x) => (String(x ?? "").trim() ? String(x).trim() : RAYA);

function hoyLargo(fecha = new Date()) {
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/** Las filas «etiqueta: valor» de la declaración, en el orden del modelo. */
export function filasDDJJ(exp = {}) {
  const igual = (a, b) => String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
  const tipo = TIPOS_FORMACION.find((t) => igual(t.clave, exp.form_tipo) || igual(t.etiqueta, exp.form_tipo))?.etiqueta;
  const modalidad = MODALIDADES.find((m) => igual(m.clave, exp.form_modalidad) || igual(m.etiqueta, exp.form_modalidad))?.etiqueta;
  const duracion = exp.form_horas ? `${exp.form_horas} horas` : "";
  const fechas = [exp.form_inicio && aDMY(exp.form_inicio), exp.form_fin && aDMY(exp.form_fin)]
    .filter(Boolean).join(" – ");

  return {
    persona: [
      ["Nombre y apellidos", nombreCompleto(exp)],
      ["Pasaporte", exp.pasaporte_numero],
      ["N.I.E.", exp.nie],
      ["Fecha de nacimiento", aDMY(exp.fecha_nacimiento)],
      ["Lugar y país de nacimiento", [exp.lugar_nacimiento, exp.pais_nacimiento].filter(Boolean).join(", ")],
      ["Nacionalidad", exp.nacionalidad],
    ],
    formacion: [
      ["Tipo de formación", tipo],
      ["Código del curso", exp.form_codigo],
      ["Denominación completa del programa formativo o de los estudios", exp.form_denominacion],
      ["Entidad que imparte la formación", exp.form_entidad],
      ["Domicilio de la entidad", [exp.form_direccion, exp.form_provincia].filter(Boolean).join(", ")],
      ["Duración de la formación", [duracion, modalidad].filter(Boolean).join(" · ")],
      ["Fecha de matriculación prevista / plazo de matriculación", fechas],
    ],
  };
}

export async function construirDDJJ(exp = {}, fecha = new Date()) {
  const {
    Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
    WidthType, BorderStyle,
  } = await import("docx");

  const FUENTE = "Times New Roman";
  const run = (text, o = {}) => new TextRun({ text, font: FUENTE, size: 24, ...o });
  const parrafo = (children, o = {}) => new Paragraph({
    children: Array.isArray(children) ? children : [run(children)],
    spacing: { after: 160, line: 300 }, ...o,
  });

  const borde = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
  const bordes = { top: borde, bottom: borde, left: borde, right: borde };
  const tabla = (filas) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: filas.map(([etiqueta, valor]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 38, type: WidthType.PERCENTAGE }, borders: bordes,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [run(etiqueta, { bold: true, size: 21 })] })],
        }),
        new TableCell({
          width: { size: 62, type: WidthType.PERCENTAGE }, borders: bordes,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [run(v(valor), { size: 21 })] })],
        }),
      ],
    })),
  });

  const { persona, formacion } = filasDDJJ(exp);
  const completo = nombreCompleto(exp) || RAYA;
  const pasaporte = v(exp.pasaporte_numero);
  const ciudad = v(exp.dom_localidad);

  const doc = new Document({
    creator: "Inspira",
    title: "Declaración jurada de compromiso de matriculación",
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1304, right: 1304 } } },
      children: [
        parrafo([run("DECLARACIÓN JURADA", { bold: true, size: 30 })], { alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
        parrafo([run("Compromiso de matriculación a efectos del arraigo para la formación (art. 124.4 del Reglamento de Extranjería)", { bold: true, size: 22 })],
          { alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

        parrafo([
          run("Yo, "), run(completo, { bold: true }), run(`, con pasaporte n.º ${pasaporte}, `),
          run("DECLARO BAJO JURAMENTO que me comprometo a matricularme y a realizar la formación que se detalla a continuación, "
            + "a efectos de la autorización de residencia temporal por circunstancias excepcionales por arraigo socioformativo que solicito."),
        ], { alignment: AlignmentType.JUSTIFIED }),

        parrafo([run("1) Datos de la persona extranjera", { bold: true })], { spacing: { before: 120, after: 100 } }),
        tabla(persona),

        parrafo([run("2) Formación a la que me comprometo", { bold: true })], { spacing: { before: 240, after: 100 } }),
        tabla(formacion),

        parrafo("Me comprometo a acreditar la matriculación ante la Oficina de Extranjería en el plazo de tres meses desde la notificación "
          + "de la resolución de concesión de la autorización, y soy consciente de que, en caso contrario, la autorización podrá ser extinguida. "
          + "Declaro que los datos consignados son ciertos.",
        { alignment: AlignmentType.JUSTIFIED, spacing: { before: 240, after: 200 } }),

        parrafo(`En ${ciudad}, a ${hoyLargo(fecha)}.`, { spacing: { before: 200, after: 700 } }),

        parrafo([run("______________________________")], { spacing: { after: 20 } }),
        parrafo([run("Firma del solicitante", { bold: true })], { spacing: { after: 20 } }),
        parrafo(`${completo} · Pasaporte n.º ${pasaporte}`),
      ],
    }],
  });

  const apellido = (exp.apellido1 || "solicitante").split(" ")[0].toLowerCase();
  return {
    blob: await Packer.toBlob(doc),
    nombre: `DDJJ-compromiso-matriculacion-${apellido}.docx`,
  };
}
