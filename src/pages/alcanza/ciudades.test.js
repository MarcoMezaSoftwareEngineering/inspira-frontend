// Las cartas del juego, con los datos reales de la API y del censo.
import { describe, it, expect } from "vitest";
import { crearIndice } from "../mapa/indice";
import { cartasCiudad, partida, rasgoDe } from "./ciudades";
import api from "../../../tests/datos/api-mapa.json";

const indice = crearIndice(api);
const cartas = cartasCiudad(indice);

describe("cartasCiudad", () => {
  it("una carta por ciudad con universidad, ordenadas por másteres", () => {
    expect(cartas.length).toBeGreaterThanOrEqual(30);
    for (let i = 1; i < cartas.length; i++) expect(cartas[i - 1].masteres).toBeGreaterThanOrEqual(cartas[i].masteres);
    expect(cartas[0].nombre).toBe("Madrid");
  });

  it("toda carta tiene ciudad, comunidad y universidades; la matrícula, si la comunidad la publica", () => {
    for (const c of cartas) {
      expect(c.nombre, c.id).toBeTruthy();
      expect(c.comunidad, c.id).toBeTruthy();
      expect(c.universidades.length, c.id).toBeGreaterThan(0);
      expect(c.principal.sigla, c.id).toBeTruthy();
      if (c.matricula !== null) expect(c.matricula, c.id).toBeGreaterThan(0);
    }
    // La mayoría sí la tiene: si esto baja, la API dejó de mandar precios.
    expect(cartas.filter((c) => c.matricula).length).toBeGreaterThan(cartas.length * 0.7);
  });

  it("el máster de ejemplo, cuando lo hay, es MBA, IA o gestión de proyectos, de una universidad de la ciudad", () => {
    const conEjemplo = cartas.filter((c) => c.ejemplo);
    expect(conEjemplo.length).toBeGreaterThanOrEqual(20);
    for (const c of conEjemplo) {
      expect(["MBA", "Inteligencia artificial", "Gestión de proyectos"]).toContain(c.ejemplo.campo);
      expect(c.universidades.map((u) => u.id), c.id).toContain(c.ejemplo.universidad.id);
    }
  });

  it("la universidad principal es la mejor del ranking cuando hay ranking", () => {
    const madrid = cartas.find((c) => c.id === "madrid");
    expect(madrid.principal.sigla).toBe("UCM");
  });
});

describe("rasgoDe", () => {
  it("prefiere la línea de estilo que nombra a la ciudad", () => {
    const granada = indice.ciudades.get("granada");
    const andalucia = indice.comunidades.get("andalucia");
    expect(rasgoDe(granada, andalucia)).toMatch(/Granada/);
  });
  it("cae al clima si nada nombra a la ciudad", () => {
    expect(rasgoDe({ nombre: "Ninguna" }, { vida: { estilo: ["Otra cosa."], clima: "Suave; lluvioso" } })).toBe("Suave");
  });
});

describe("partida", () => {
  const seis = partida(cartas);
  it("son seis, todas con ejemplo, matrícula y dibujo propio", () => {
    expect(seis).toHaveLength(6);
    for (const c of seis) {
      expect(c.ejemplo, c.id).toBeTruthy();
      expect(c.matricula, c.id).toBeGreaterThan(0);
      expect(c.dibujo, c.id).not.toBe("CAMPUS");
    }
  });
  it("reparte entre tantas comunidades distintas como haya con carta completa", () => {
    // Solo repite comunidad cuando no quedan más completas: hoy Cataluña no
    // trae precio y Barcelona se cae, así que salen cinco distintas y Granada
    // repite Andalucía. Si Cataluña publica precio, esto exige seis.
    const completas = cartas.filter((c) => c.ejemplo && c.matricula && c.dibujo !== "CAMPUS");
    const distintasPosibles = new Set(completas.map((c) => c.comunidadId)).size;
    const distintas = new Set(seis.map((c) => c.comunidadId)).size;
    expect(distintas).toBe(Math.min(6, distintasPosibles));
    expect(distintas).toBeGreaterThanOrEqual(5);
  });
  it("es determinista", () => {
    expect(partida(cartas).map((c) => c.id)).toEqual(seis.map((c) => c.id));
  });
});
