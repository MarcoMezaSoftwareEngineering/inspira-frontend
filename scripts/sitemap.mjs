// scripts/sitemap.mjs
// Genera public/sitemap.xml a partir de las rutas reales de la aplicación:
// el catálogo de servicios, las rutas migratorias y las entradas del blog.
//
// Se escribía a mano, y cada servicio o artículo nuevo obligaba a acordarse de
// añadirlo. Ejecuta `npm run sitemap` después de publicar contenido nuevo.
//
// La fecha de cada URL que ya existía se conserva tal cual: un `lastmod`
// nuevo en una página que no cambió le dice a Google algo que no es cierto.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.join(RAIZ, "public", "sitemap.xml");
const BASE = "https://inspira-legal.cloud";

const importa = (rel) => import(pathToFileURL(path.join(RAIZ, "src", rel)).href);

const { TODOS_SERVICIOS } = await importa("config/servicios.js");
const { IDS_RUTAS } = await importa("config/rutas.js");
const { POSTS } = await importa("pages/blog/blog.data.js");

const hoy = new Date().toISOString().slice(0, 10);

// prioridad y frecuencia por sección: la portada y los servicios se revisan
// más a menudo que un aviso legal.
const paginas = [
  { loc: "/", freq: "weekly", prio: "1.0" },
  { loc: "/servicios", freq: "weekly", prio: "0.9" },
  { loc: "/servicios/master", freq: "weekly", prio: "0.9" },
  { loc: "/servicios/estancia", freq: "weekly", prio: "0.9" },
  { loc: "/calculadora-master", freq: "monthly", prio: "0.8" },
  { loc: "/asistente", freq: "monthly", prio: "0.8" },
  { loc: "/casos-de-exito", freq: "monthly", prio: "0.8" },
  { loc: "/eventos", freq: "weekly", prio: "0.8" },
  { loc: "/blog", freq: "weekly", prio: "0.8" },
  { loc: "/nosotros", freq: "monthly", prio: "0.7" },
  { loc: "/plataforma", freq: "monthly", prio: "0.7" },
  { loc: "/tienda", freq: "monthly", prio: "0.7" },
  { loc: "/reservar", freq: "monthly", prio: "0.7" },
  ...IDS_RUTAS.map((id) => ({ loc: `/ruta/${id}`, freq: "monthly", prio: "0.8" })),
  ...TODOS_SERVICIOS.filter((s) => s.detalle).map((s) => ({
    loc: `/servicios/${s.id}`,
    freq: "monthly",
    prio: "0.7",
  })),
  ...POSTS.map((p) => ({
    loc: `/blog/${p.slug}`,
    freq: "monthly",
    prio: "0.6",
    lastmod: p.fecha, // la fecha del propio artículo
  })),
  { loc: "/legal/privacidad", freq: "yearly", prio: "0.3" },
  { loc: "/legal/cookies", freq: "yearly", prio: "0.3" },
  { loc: "/legal/terminos", freq: "yearly", prio: "0.3" },
  { loc: "/legal/derechos", freq: "yearly", prio: "0.3" },
  { loc: "/libro-de-reclamaciones", freq: "yearly", prio: "0.3" },
];

// Fechas del sitemap anterior, para no rejuvenecer páginas que no han cambiado.
const previas = new Map();
if (fs.existsSync(SALIDA)) {
  const xml = fs.readFileSync(SALIDA, "utf8");
  for (const bloque of xml.split("<url>").slice(1)) {
    const loc = bloque.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const mod = bloque.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && mod) previas.set(loc.replace(BASE, "") || "/", mod);
  }
}

const cuerpo = paginas
  .map(({ loc, freq, prio, lastmod }) => {
    const url = loc === "/" ? `${BASE}/` : `${BASE}${loc}`;
    const fecha = lastmod || previas.get(loc) || hoy;
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${fecha}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
  })
  .join("\n");

fs.writeFileSync(
  SALIDA,
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generado por scripts/sitemap.mjs — no editar a mano: ejecuta npm run sitemap -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cuerpo}

</urlset>
`,
  "utf8"
);

const nuevas = paginas.filter((p) => !previas.has(p.loc)).map((p) => p.loc);
console.log(`sitemap.xml: ${paginas.length} URLs${nuevas.length ? ` · nuevas: ${nuevas.join(", ")}` : ""}`);
