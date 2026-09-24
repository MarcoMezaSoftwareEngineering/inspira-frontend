// Las opiniones: que la cabecera de Google no mienta y que cada ficha esté
// completa. Antes la cuenta iba escrita a mano y se desfasaba sola.
import { describe, it, expect } from "vitest";
import { TESTIMONIOS, RESENAS_GOOGLE } from "./testimonios";

describe("testimonios", () => {
  it("cada opinión está completa", () => {
    for (const t of TESTIMONIOS) {
      expect(t.nombre).toBeTruthy();
      expect(["Google", "Facebook"]).toContain(t.fuente);
      expect(t.estrellas).toBeGreaterThanOrEqual(1);
      expect(t.estrellas).toBeLessThanOrEqual(5);
      expect(t.texto.length, t.nombre).toBeGreaterThan(20);
      expect(t.servicio, t.nombre).toBeTruthy();
    }
  });

  it("nombre de pila más inicial: nunca el apellido entero", () => {
    // «Maria Belen A.» sí; «Elias Gutierrez» no.
    const mal = TESTIMONIOS.filter((t) => !/\b[A-ZÁÉÍÓÚÑ]\.$/.test(t.nombre.trim())).map((t) => t.nombre);
    expect(mal).toEqual([]);
  });

  it("la cabecera de Google cuenta exactamente las reseñas de Google", () => {
    const deGoogle = TESTIMONIOS.filter((t) => t.fuente === "Google").length;
    expect(RESENAS_GOOGLE.cabecera).toContain(`${deGoogle} reseña`);
  });

  it("la cabecera no lleva fecha escrita a mano", () => {
    expect(RESENAS_GOOGLE.cabecera).not.toMatch(/20\d\d/);
  });
});
