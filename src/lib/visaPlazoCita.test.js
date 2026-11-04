import { describe, expect, it } from "vitest";
import { plazoCitaBls, textoVentana, leerFecha } from "./visaPlazoCita";

describe("plazoCitaBls", () => {
  it("clases el 15 de septiembre: límite 15 de julio y ventana completa del 7 al 15 de julio", () => {
    const p = plazoCitaBls({ inicioClases: "2027-09-15" });
    expect(p.limite).toBe("2027-07-15");
    expect(textoVentana(p.ventana)).toBe("7 al 15 de julio de 2027");
    expect(p.ventana.cuentasHasta).toBe("junio de 2027");
    expect(textoVentana(p.ventanaAnterior)).toBe("7 al 15 de junio de 2027");
  });

  it("si el límite cae dentro de la ventana, la recorta", () => {
    const p = plazoCitaBls({ inicioClases: "2027-09-10" });
    expect(p.limite).toBe("2027-07-10");
    expect(textoVentana(p.ventana)).toBe("7 al 10 de julio de 2027");
    expect(p.ventana.recortada).toBe(true);
  });

  it("si el límite cae antes del día 7, la ventana es la del mes anterior", () => {
    const p = plazoCitaBls({ inicioClases: "2027-10-01" });
    expect(p.limite).toBe("2027-08-01");
    expect(textoVentana(p.ventana)).toBe("7 al 15 de julio de 2027");
    expect(textoVentana(p.ventanaAnterior)).toBe("7 al 15 de junio de 2027");
  });

  it("fin de mes: 31 de octubre menos dos meses es el 31 de agosto; 30 de abril → 28 de febrero", () => {
    expect(plazoCitaBls({ inicioClases: "2027-10-31" }).limite).toBe("2027-08-31");
    expect(plazoCitaBls({ inicioClases: "2027-04-30" }).limite).toBe("2027-02-28");
  });

  it("cruza el año: clases el 15 de enero → límite 15 de noviembre", () => {
    const p = plazoCitaBls({ inicioClases: "2028-01-15" });
    expect(p.limite).toBe("2027-11-15");
    expect(p.ventana.cuentasHasta).toBe("octubre de 2027");
  });

  it("evalúa la cita: en regla, fuera de ventana y fuera de plazo (DJ)", () => {
    const ok = plazoCitaBls({ inicioClases: "2027-09-15", citaFecha: "2027-07-09" }).cita;
    expect(ok.tono).toBe("ok");
    expect(ok.requiereDJ).toBe(false);

    const temprana = plazoCitaBls({ inicioClases: "2027-09-15", citaFecha: "2027-07-03" }).cita;
    expect(temprana.tono).toBe("aviso");
    expect(temprana.texto).toMatch(/junio de 2027/);

    const tarde = plazoCitaBls({ inicioClases: "2027-09-15", citaFecha: "2027-07-20" }).cita;
    expect(tarde.tono).toBe("mal");
    expect(tarde.requiereDJ).toBe(true);
  });

  it("marca si hoy ya pasó el límite", () => {
    expect(plazoCitaBls({ inicioClases: "2027-09-15", hoy: "2027-07-16" }).hoyFueraDePlazo).toBe(true);
    expect(plazoCitaBls({ inicioClases: "2027-09-15", hoy: "2027-07-15" }).hoyFueraDePlazo).toBe(false);
  });

  it("acepta DD/MM/AAAA y rechaza fechas imposibles", () => {
    expect(plazoCitaBls({ inicioClases: "15/09/2027" }).limite).toBe("2027-07-15");
    expect(leerFecha("31/02/2027")).toBeNull();
    expect(plazoCitaBls({ inicioClases: "" })).toBeNull();
  });
});
