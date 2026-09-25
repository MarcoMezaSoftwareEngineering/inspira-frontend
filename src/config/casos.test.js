// Los casos de éxito: que lo que se publica sea coherente con la API y con
// las reglas que la cabecera de casos.js pone por escrito.
import { describe, it, expect } from "vitest";
import { CASOS, CATEGORIAS_CASOS } from "./casos";
import { crearIndice, casosEnMapa, universidadPorNombre } from "../pages/mapa/indice";
import api from "../../tests/datos/api-mapa.json";

const indice = crearIndice(api);

describe("casos de éxito", () => {
  it("cada caso tiene id único", () => {
    const ids = CASOS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("solo nombre de pila: nunca apellidos", () => {
    // Un nombre compuesto («María José») son dos palabras como mucho; tres ya
    // es nombre y apellido, que la cabecera del archivo prohíbe publicar.
    const conApellido = CASOS.filter((c) => c.nombre.trim().split(/\s+/).length > 2);
    expect(conApellido.map((c) => c.nombre)).toEqual([]);
  });

  it("no queda el campo «origen», que se retiró del modelo", () => {
    expect(CASOS.filter((c) => "origen" in c).map((c) => c.id)).toEqual([]);
  });

  it("todo caso tiene lo mínimo: nombre, ciudad, universidad, programa, categoría", () => {
    for (const c of CASOS) {
      expect(c.nombre, c.id).toBeTruthy();
      expect(c.ciudad, c.id).toBeTruthy();
      expect(c.universidad, c.id).toBeTruthy();
      expect(c.programa, c.id).toBeTruthy();
      expect(CATEGORIAS_CASOS.map((k) => k.id), c.id).toContain(c.categoria);
    }
  });

  it("toda ciudad existe en la API: si no, el caso se descarta en silencio", () => {
    const colocados = casosEnMapa(indice, CASOS);
    const perdidos = CASOS.filter((c) => !colocados.some((k) => k.id === c.id));
    expect(perdidos.map((c) => `${c.id} (${c.ciudad})`)).toEqual([]);
  });

  it("los destinos secundarios también tienen ciudad conocida", () => {
    const nombres = new Set(api.ciudades.map((c) => c.nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()));
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const malos = [];
    for (const c of CASOS) for (const d of c.destinos || []) if (!nombres.has(norm(d.ciudad))) malos.push(`${c.id} → ${d.ciudad}`);
    expect(malos).toEqual([]);
  });

  it("toda universidad principal enlaza con el catálogo", () => {
    const sinEnlace = CASOS.filter((c) => !universidadPorNombre(indice, c.universidad)).map((c) => c.universidad);
    expect([...new Set(sinEnlace)]).toEqual([]);
  });

  it("una misma universidad no aparece con dos grafías", () => {
    // Pasó con la Católica de Valencia: «… de Valencia» y «… San Vicente Mártir»
    // contaban como dos centros con una alumna cada uno en vez de uno con dos.
    const porCatalogo = new Map();
    for (const c of CASOS) {
      const u = universidadPorNombre(indice, c.universidad);
      if (!u) continue;
      if (!porCatalogo.has(u.id)) porCatalogo.set(u.id, new Set());
      porCatalogo.get(u.id).add(c.universidad);
    }
    const dobles = [...porCatalogo.entries()].filter(([, g]) => g.size > 1).map(([id, g]) => `${id}: ${[...g].join(" | ")}`);
    expect(dobles).toEqual([]);
  });
});

// ── Resoluciones de estancia (casosEstancia.js) ──────────────────────────
import { CASOS_ESTANCIA, diasResolucion, mesesVigencia, etiquetaTipo } from "./casosEstancia";

describe("CASOS_ESTANCIA", () => {
  it("solo nombre de pila, y nada que identifique a la persona", () => {
    for (const c of CASOS_ESTANCIA) {
      expect(c.nombre, c.id).toMatch(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/);
      for (const clave of ["nie", "expediente", "pasaporte", "apellido", "apellidos", "registro"]) {
        expect(c, `${c.id} publica ${clave}`).not.toHaveProperty(clave);
      }
      // La foto es la tapada, servida desde /media, nunca la subida original.
      if (c.resolucion) expect(c.resolucion, c.id).toMatch(/^https:\/\/www\.inspira-legal\.cloud\/media\/resoluciones\/[a-z0-9-]+\.jpg$/);
    }
  });
  it("tipo, oficina y fechas con forma", () => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    for (const c of CASOS_ESTANCIA) {
      expect(["inicial", "prorroga"], c.id).toContain(c.tipo);
      expect(c.oficina, c.id).toBeTruthy();
      expect(String(c.anio), c.id).toMatch(/^20\d{2}$/);
      expect(c.vigencia.desde, c.id).toMatch(iso);
      expect(c.vigencia.hasta, c.id).toMatch(iso);
      if (c.presentada) expect(c.presentada, c.id).toMatch(iso);
      if (c.resuelta) expect(c.resuelta, c.id).toMatch(iso);
      expect(mesesVigencia(c), c.id).toBeGreaterThan(0);
    }
  });
  it("los días de resolución solo salen cuando constan las dos fechas", () => {
    const brian = CASOS_ESTANCIA.find((c) => c.id === "brian-sevilla-2026");
    expect(diasResolucion(brian)).toBe(2);
    // Denisse: la resolución no trae la fecha de resolución; vale lo que sabe Inspira.
    const denisse = CASOS_ESTANCIA.find((c) => c.id === "denisse-madrid-2026");
    expect(diasResolucion(denisse)).toBe(26);
    expect(diasResolucion({ presentada: null, resuelta: "2026-07-23", vigencia: {} })).toBeNull();
    expect(etiquetaTipo(CASOS_ESTANCIA.find((c) => c.id === "jhonatan-alicante-2026"))).toBe("Prórroga n.º 1");
  });
});
