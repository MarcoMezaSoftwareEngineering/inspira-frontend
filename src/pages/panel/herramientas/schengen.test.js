import { describe, it, expect } from "vitest";
import { usados, salidaMaxima } from "./schengen";

describe("regla 90/180", () => {
  it("cuenta entrada y salida, y no suma doble los viajes solapados", () => {
    const e = [{ entrada: "2026-01-01", salida: "2026-01-10" }, { entrada: "2026-01-05", salida: "2026-01-12" }];
    expect(usados(e, "2026-02-01")).toBe(12);
  });

  it("solo mira los 180 días que terminan en la fecha", () => {
    const e = [{ entrada: "2026-01-01", salida: "2026-01-30" }];
    expect(usados(e, "2026-06-29")).toBe(30); // 29/06 − 179 = 01/01
    expect(usados(e, "2026-07-15")).toBe(14);
    expect(usados(e, "2026-08-01")).toBe(0);
  });

  it("sin viajes previos se puede quedar 90 días", () => {
    expect(salidaMaxima([], "2026-03-01")).toBe("2026-05-29");
  });

  it("con 90 días ya usados no puede entrar", () => {
    const e = [{ entrada: "2026-01-01", salida: "2026-03-31" }];
    expect(usados(e, "2026-03-31")).toBe(90);
    expect(salidaMaxima(e, "2026-04-01")).toBeNull();
  });
});
