import { describe, it, expect } from "vitest";
import { ESCALAS, notaEspanola, tramoNota, hitosDesde, inicioPorDefecto } from "./calculos";

const pe = ESCALAS.find((e) => e.id === "pe");

describe("nota en la escala española", () => {
  it("convierte entre el aprobado y la máxima", () => {
    expect(notaEspanola(11, pe)).toBe(5);
    expect(notaEspanola(20, pe)).toBe(10);
    expect(notaEspanola(15.5, pe)).toBe(7.5);
    expect(tramoNota(7.5)).toBe("Notable");
  });
  it("no convierte lo suspenso ni lo que pasa de la máxima", () => {
    expect(notaEspanola(9, pe)).toBeNull();
    expect(notaEspanola(21, pe)).toBeNull();
    expect(notaEspanola("", pe)).toBeNull();
  });
});

describe("plazos hacia atrás", () => {
  it("elige el septiembre que aún deja margen", () => {
    expect(inicioPorDefecto("2026-11-03")).toBe("2027-09-15");
    expect(inicioPorDefecto("2027-01-10")).toBe("2027-09-15");
    expect(inicioPorDefecto("2027-03-01")).toBe("2028-09-15");
  });
  it("cuenta los días de cada hito", () => {
    const h = hitosDesde("2027-09-15", "2026-11-03");
    expect(h[0]).toMatchObject({ fecha: "2027-01-18", faltan: 76 });
    expect(h.at(-1).fecha).toBe("2027-09-05");
  });
});
