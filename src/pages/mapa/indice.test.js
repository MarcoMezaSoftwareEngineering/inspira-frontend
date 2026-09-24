// Las funciones puras del índice del mapa, con los datos reales de la API.
import { describe, it, expect } from "vitest";
import { crearIndice, casosEnMapa, normalizar, universidadPorNombre } from "./indice";
import api from "../../../tests/datos/api-mapa.json";

const indice = crearIndice(api);

describe("normalizar", () => {
  it("quita tildes, mayúsculas y signos", () => {
    expect(normalizar("Universitat Politècnica de València")).toBe(normalizar("universitat politecnica de valencia"));
    expect(normalizar("A Coruña")).toBe(normalizar("a coruna"));
  });
  it("es estable ante espacios sobrantes", () => {
    expect(normalizar("  Madrid ")).toBe(normalizar("Madrid"));
  });
});

describe("crearIndice", () => {
  it("indexa las 46 ciudades y 47 universidades de la API", () => {
    expect(indice.ciudades.size).toBe(46);
    expect(indice.datos.universidades.length).toBe(47);
  });
  it("cada ciudad tiene comunidad", () => {
    for (const c of indice.ciudades.values()) expect(c.comunidad, c.id).toBeTruthy();
  });
});

describe("universidadPorNombre", () => {
  it("resuelve el nombre exacto", () => {
    expect(universidadPorNombre(indice, "Universidad de Málaga")?.id).toBe("uma");
  });
  it("ignora tildes y mayúsculas", () => {
    expect(universidadPorNombre(indice, "universidad de malaga")?.id).toBe("uma");
  });
  it("acepta cola («… San Vicente Mártir») y cabeza («Zaragoza Logistics Center · …»)", () => {
    expect(universidadPorNombre(indice, "Universidad Católica de Valencia San Vicente Mártir")?.id).toBe("ucv");
    expect(universidadPorNombre(indice, "Zaragoza Logistics Center · Universidad de Zaragoza")?.id).toBe("unizar");
  });
  it("devuelve null si no hay coincidencia, nunca una equivocada", () => {
    expect(universidadPorNombre(indice, "Universidad Inexistente del Sur")).toBeNull();
    expect(universidadPorNombre(indice, "")).toBeNull();
  });
});

describe("casosEnMapa", () => {
  it("coloca un caso por ciudad conocida y descarta el resto", () => {
    const r = casosEnMapa(indice, [
      { id: "a", ciudad: "Valencia" },
      { id: "b", ciudad: "Ciudad Que No Existe" },
      { id: "c", ciudad: "santiago de compostela" },
    ]);
    expect(r.map((k) => k.id)).toEqual(["a", "c"]);
    expect(r[0].ciudadId).toBe("valencia");
    expect(r[0].comunidadId).toBe("comunidad-valenciana");
  });
});
