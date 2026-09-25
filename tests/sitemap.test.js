// Que ninguna página se quede huérfana ni el sitemap mienta.
//
// Nació el 24/09/2026, el día en que se descubrió que /te-alcanza llevaba
// meses publicado, funcionando, y sin una sola puerta: no estaba en el sitemap
// y ninguna página lo enlazaba. Dos visitas en los registros; el mapa, 2.193.
// Un juego construido como gancho y guardado en un cajón.
//
// Tres comprobaciones:
//   1. Toda URL del sitemap responde a una ruta que App.jsx sabe pintar.
//   2. Toda ruta pública de App.jsx está en el sitemap.
//   3. Toda ruta pública está enlazada desde alguna otra parte del sitio.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(__dirname, "..");
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), "utf8");

const app = leer("src/App.jsx");
const sitemap = leer("public/sitemap.xml");

/** Rutas que App.jsx pinta con `path === "/x"`. */
const estaticas = [...new Set([...app.matchAll(/path === "(\/[a-z0-9/-]*)"/g)].map((m) => m[1]))];
/** Prefijos que pinta con `path.startsWith("/x")`. */
const prefijos = [...app.matchAll(/path\.startsWith\("(\/[a-z0-9/-]*)"\)/g)].map((m) => m[1]);
/** Lo que hay en el sitemap, sin el dominio. */
const enSitemap = [...sitemap.matchAll(/<loc>https:\/\/www\.inspira-legal\.cloud(\/[^<]*)<\/loc>/g)].map((m) => m[1]);

// Páginas que existen a propósito fuera del sitemap: pantallas de proceso,
// legales y de desarrollo. No son destinos, son pasos.
const FUERA_DEL_SITEMAP = new Set([
  // /expediente: Marco la retiró de menús y sitemap el 25/09/2026 («ese no»);
  // sigue respondiendo para quien tenga el enlace, con noindex.
  "/expediente",
  "/auth/success",
  "/dev/muestra",
  "/pago-exitoso",
  "/pago-fallido",
  "/pago-pendiente",
  "/legal/cookies",
  "/legal/derechos",
  "/legal/privacidad",
  "/legal/terminos",
  "/libro-de-reclamaciones",
]);

// Landings que se entran desde fuera —anuncios, el enlace de la bio de
// Instagram y TikTok— y que a propósito no se enlazan desde dentro.
const ENTRADA_EXTERNA = new Set(["/enlaces", "/master-2027-2028"]);

// Huérfanas conocidas: páginas públicas que aún no enlaza nadie y cuya suerte
// no se ha decidido. Vacía desde el 24/09/2026 (/reservar y /doctorado se
// enlazaron desde el pie y desde /enlaces). Si entra una, que sea con TODO.
const HUERFANAS_CONOCIDAS = new Set([]);

/** ¿App.jsx sabe pintar esta URL? */
const laPinta = (url) =>
  estaticas.includes(url) || prefijos.some((p) => url.startsWith(p) && url.length > p.length);

/** Todos los archivos fuente menos App.jsx, para buscar enlaces. */
const fuentes = (() => {
  const salida = [];
  const andar = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) andar(f);
      else if (/\.(jsx?|tsx?)$/.test(e.name) && !f.endsWith("App.jsx")) salida.push(f);
    }
  };
  andar(path.join(RAIZ, "src"));
  return salida.map((f) => ({ f: path.relative(RAIZ, f), t: fs.readFileSync(f, "utf8") }));
})();

/**
 * ¿Alguien enlaza a esta ruta? Se busca en contexto de enlace —href, interno(),
 * navigate(), irA(), to:— y no como texto suelto: la propia página lleva su
 * ruta en el SEO (`path: "/x"`) y eso no cuenta como puerta.
 */
const enlazada = (ruta) => {
  const re = new RegExp(`(href|interno|navigate|irA|to|url|ruta)\\s*[=(:]\\s*["'\`]${ruta.replace(/[/-]/g, "\\$&")}["'\`?#]`);
  return fuentes.filter(({ t }) => re.test(t)).map(({ f }) => f);
};

describe("sitemap", () => {
  it("las huérfanas conocidas siguen siéndolo (si alguna se arregló, quítala de la lista)", () => {
    const yaEnlazadas = [...HUERFANAS_CONOCIDAS].filter((r) => enlazada(r).length > 0);
    expect(yaEnlazadas, "ya tienen puerta, sácalas de HUERFANAS_CONOCIDAS").toEqual([]);
  });

  it("tiene entradas", () => {
    expect(enSitemap.length).toBeGreaterThan(50);
  });

  it("toda URL del sitemap es una ruta que App.jsx sabe pintar", () => {
    const huerfanas = enSitemap.filter((u) => !laPinta(u));
    expect(huerfanas, `en el sitemap pero sin ruta: ${huerfanas.join(", ")}`).toEqual([]);
  });

  it("toda ruta pública de App.jsx está en el sitemap", () => {
    const publicas = estaticas.filter((r) => !FUERA_DEL_SITEMAP.has(r));
    const faltan = publicas.filter((r) => !enSitemap.includes(r));
    expect(faltan, `rutas sin entrada en el sitemap: ${faltan.join(", ")}`).toEqual([]);
  });

  it("toda ruta pública está enlazada desde alguna parte del sitio", () => {
    const publicas = estaticas.filter(
      (r) => !FUERA_DEL_SITEMAP.has(r) && !ENTRADA_EXTERNA.has(r) && !HUERFANAS_CONOCIDAS.has(r) && r !== "/"
    );
    const sinPuerta = publicas.filter((r) => enlazada(r).length === 0);
    expect(
      sinPuerta,
      `páginas a las que no se puede llegar sin escribir la URL: ${sinPuerta.join(", ")}`
    ).toEqual([]);
  });
});
