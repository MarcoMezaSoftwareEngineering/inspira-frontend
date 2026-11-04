// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { valoresEX10, casillasEX10, faltaParaEX10 } from "./ex10";
import { construirDDJJ } from "./ddjj";
import { construirEX10 } from "./GeneradoresArraigo.jsx";

const PLANTILLA = path.resolve(__dirname, "../../../../../../public/formularios/ex10-arraigo-socioformativo.pdf");
const plantilla = async () => {
  const buf = fs.readFileSync(PLANTILLA);
  return { ok: true, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
};

const exp = {
  apellido1: "Quispe", apellido2: "Huamán", nombres: "María Elena", sexo: "Mujer", estado_civil: "Soltero/a",
  pasaporte_numero: "P1234567", nie: "Y1234567Z", fecha_nacimiento: "1998-03-07",
  lugar_nacimiento: "Lima", pais_nacimiento: "Perú", nacionalidad: "Peruana",
  nombre_padre: "Juan", nombre_madre: "Rosa",
  dom_direccion: "Calle Mayor", dom_numero: "5", dom_piso: "2B", dom_localidad: "Madrid", dom_cp: "28013",
  dom_provincia: "Madrid", telefono: "600111222", correo: "m@e.com",
  form_tipo: "certificado", form_entidad: "Centro Formación SL", form_denominacion: "Técnico en Cocina",
  form_codigo: "HOTR0408", form_nif_entidad: "B12345678", form_direccion: "Av. Libertad 1, Madrid",
  form_provincia: "Madrid", form_horas: "800", form_inicio: "2027-01-15", form_fin: "2027-07-30",
  form_modalidad: "PRESENCIAL",
};

describe("EX-10 arraigo socioformativo", () => {
  it("cada campo y casilla del mapa existe en la plantilla", async () => {
    const pdf = await PDFDocument.load(fs.readFileSync(PLANTILLA));
    const form = pdf.getForm();
    for (const campo of Object.keys(valoresEX10(exp))) expect(() => form.getTextField(campo), campo).not.toThrow();
    for (const c of casillasEX10(exp)) expect(() => form.getCheckBox(c), c).not.toThrow();
  });

  it("rellena los apartados 1, 4 y 6 y deja vacíos el 2, 3 y 5", async () => {
    const { blob } = await construirEX10(exp, plantilla);
    const form = (await PDFDocument.load(Buffer.from(await blob.arrayBuffer()))).getForm();
    const t = (n) => form.getTextField(n).getText();
    expect(t("Texto5")).toBe("QUISPE");
    expect(t("Texto8")).toBe("07");
    expect(t("Texto61")).toBe("MARÍA ELENA QUISPE HUAMÁN");
    expect(t("Texto89")).toBe("HOTR0408");
    expect(t("Texto94")).toBe("15/01/2027");
    for (const n of ["Texto27", "Texto48", "Texto71"]) expect(t(n) || "").toBe("");
    expect(form.getCheckBox("Casilla de verificación98").isChecked()).toBe(true);   // mujer
    expect(form.getCheckBox("Casilla de verificación97").isChecked()).toBe(false);  // hombre
    expect(form.getCheckBox("Casilla de verificación113").isChecked()).toBe(true);  // certificado
    expect(form.getCheckBox("Casilla de verificación116").isChecked()).toBe(true);  // presencial
  });

  it("avisa de lo que falta", () => {
    expect(faltaParaEX10(exp)).toEqual([]);
    expect(faltaParaEX10({})).toContain("Tipo de formación");
  });

  it("la declaración jurada sale en Word con los datos", async () => {
    const { blob, nombre } = await construirDDJJ(exp, new Date(2026, 10, 4));
    expect(nombre).toBe("DDJJ-compromiso-matriculacion-quispe.docx");
    const zip = await JSZip.loadAsync(Buffer.from(await blob.arrayBuffer()));
    const xml = await zip.file("word/document.xml").async("string");
    for (const s of ["DECLARACIÓN JURADA", "MARÍA ELENA QUISPE HUAMÁN", "P1234567", "HOTR0408", "Técnico en Cocina", "4 de noviembre de 2026", "tres meses"]) {
      expect(xml, s).toContain(s);
    }
  });
});
