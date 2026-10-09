// Los formateadores de formatos.js tienen que dar exactamente lo mismo que la
// llamada toLocale*String que sustituyen; si no, el refactor cambia la web.
//
// Se prueba en Europe/Madrid a propósito: tiene horario de verano y Lima no,
// así que cualquier diferencia de zona horaria sale aquí. La zona se fija con
// vi.hoisted porque los formatos sin timeZone la toman al cargar el módulo.
import { vi, describe, it, expect, afterAll } from "vitest";

const zonaOriginal = vi.hoisted(() => {
  const antes = globalThis.process.env.TZ;
  globalThis.process.env.TZ = "Europe/Madrid";
  return antes;
});

import * as f from "./formatos.js";

afterAll(() => {
  if (zonaOriginal === undefined) delete globalThis.process.env.TZ;
  else globalThis.process.env.TZ = zonaOriginal;
});

// Una fecha cada 7 h 13 min durante dos años: pasa por todas las horas, los
// cambios de hora y los fines de mes y de año.
const FECHAS = [];
for (let t = Date.UTC(2025, 0, 1); t < Date.UTC(2027, 0, 1); t += 3600000 * 7 + 60000 * 13) {
  FECHAS.push(new Date(t));
}

const CASOS = [
  ["fechaNumerica", (d) => d.toLocaleDateString("es-ES")],
  ["fechaLarga", (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })],
  ["fechaHoraLarga", (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })],
  ["fechaCortaConHora", (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
  ["fechaConDiaSemana", (d) => d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short", year: "numeric" })],
  ["diaSemanaYMes", (d) => d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })],
  ["diaSemanaYMesLima", (d) => d.toLocaleDateString("es-ES", { timeZone: "America/Lima", weekday: "long", day: "numeric", month: "long" })],
  ["mesCorto", (d) => d.toLocaleDateString("es-ES", { month: "short" })],
  ["hora", (d) => d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })],
  ["horaLima", (d) => d.toLocaleTimeString("es-ES", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" })],
  ["horaLimaPE", (d) => d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" })],
];

describe("formatos de fecha", () => {
  it.each(CASOS)("%s da lo mismo que toLocale*String", (nombre, original) => {
    const distintos = FECHAS.filter((d) => f[nombre](d) !== original(d));
    expect(distintos).toEqual([]);
  });

  it.each(CASOS)("%s acepta texto ISO y milisegundos como new Date()", (nombre, original) => {
    const iso = "2026-03-29T00:30:00.000Z";
    expect(f[nombre](iso)).toBe(original(new Date(iso)));
    expect(f[nombre](Date.parse(iso))).toBe(original(new Date(iso)));
  });

  it.each(CASOS)("%s con una fecha inválida devuelve «Invalid Date» y no lanza", (nombre, original) => {
    expect(f[nombre](undefined)).toBe(original(new Date(undefined)));
    expect(f[nombre]("no es fecha")).toBe("Invalid Date");
  });

  it("ejemplos legibles", () => {
    const d = new Date("2026-10-09T19:05:00Z"); // 21:05 en Madrid, 14:05 en Lima
    expect(f.fechaLarga(d)).toBe("09 de octubre de 2026");
    expect(f.horaLima(d)).toBe("14:05");
    expect(f.horaLimaPE(d)).toBe("02:05 p. m."); // ICU separa «p.» y «m.» con espacio duro
    expect(f.diaSemanaYMesLima(d)).toBe("viernes, 9 de octubre");
  });
});

describe("formatos de número", () => {
  const NUMEROS = [0, 5, 999, 1000, 1234, 12345, 1234567, 0.5, 1.25, 12.75, 2.45, -3000, 25000.5, NaN, Infinity];

  it("numero da lo mismo que toLocaleString('es-ES')", () => {
    for (const n of NUMEROS) expect(f.numero(n)).toBe(n.toLocaleString("es-ES"));
  });

  it("numeroUnDecimalPE da lo mismo que toLocaleString('es-PE', { maximumFractionDigits: 1 })", () => {
    for (const n of NUMEROS) expect(f.numeroUnDecimalPE(n)).toBe(n.toLocaleString("es-PE", { maximumFractionDigits: 1 }));
  });

  it("euros pone el símbolo detrás, como la web", () => {
    expect(f.euros(12345)).toBe("12.345 €");
    expect(f.euros(1234)).toBe("1234 €");
  });

  it("si llega un texto se comporta como su propio toLocaleString", () => {
    expect(f.numero("15000")).toBe("15000");
    expect(() => f.numero(null)).toThrow(TypeError);
  });
});
