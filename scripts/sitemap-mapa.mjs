// scripts/sitemap-mapa.mjs
// Añade a public/sitemap.xml una entrada por comunidad (/master/galicia) y
// por universidad (/universidad/udc), las páginas de pages/mapa/PaginaLugar.
//
// Va aparte de sitemap.mjs a propósito: aquel importa la configuración de la
// aplicación (servicios, rutas, blog) y hoy no arranca en Node moderno porque
// esos módulos se importan sin extensión y con JSON sin `with { type }`, que
// es lo que resuelve Vite pero no Node. Arreglarlo es tocar decenas de
// imports de la aplicación; esto solo lee el XML y la API, así que funciona
// igual y no depende de nada de src/.
//
// Las rutas salen de la API porque ahí vive el catálogo. Escribirlas a mano
// sería tener dos listas que se desincronizan al primer cambio.
//
//   node scripts/sitemap-mapa.mjs
//
// Idempotente: una URL que ya está en el sitemap conserva su <lastmod>, para
// no decirle a Google que cambió una página que no ha cambiado.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.join(RAIZ, "public", "sitemap.xml");
const BASE = "https://www.inspira-legal.cloud";
const API = process.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const hoy = new Date().toISOString().slice(0, 10);

const bloque = (loc, prio, fecha) =>
  `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${fecha}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${prio}</priority>\n  </url>`;

async function main() {
  if (!fs.existsSync(SALIDA)) {
    console.error(`✗ No existe ${SALIDA}. Genera antes el sitemap base.`);
    process.exit(1);
  }

  let datos;
  try {
    const r = await fetch(`${API}/api/mapa`, { headers: { Accept: "application/json" } });
    datos = await r.json();
    if (!datos?.ok || !Array.isArray(datos.comunidades)) throw new Error("respuesta inesperada de /api/mapa");
  } catch (e) {
    console.error(`✗ No se pudo leer el catálogo: ${e.message}`);
    process.exit(1);
  }

  const xml = fs.readFileSync(SALIDA, "utf8");
  // Fechas de las que ya estaban: no se rejuvenece lo que no cambió.
  const previas = new Map();
  for (const b of xml.split("<url>").slice(1)) {
    const loc = b.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const mod = b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && mod) previas.set(loc.replace(BASE, ""), mod);
  }

  const nuevas = [
    ...datos.comunidades.map((c) => ({ loc: `/master/${c.id}`, prio: "0.7" })),
    ...(datos.universidades || []).map((u) => ({ loc: `/universidad/${u.id}`, prio: "0.6" })),
  ].filter((p) => p.loc && !p.loc.endsWith("/undefined"));

  // Se quitan las que ya estaban para volver a escribirlas juntas y en orden.
  const sinMapa = xml
    .split("\n")
    .join("\n")
    .replace(/ {2}<url>\n(?:(?! {2}<\/url>)[\s\S])*?<loc>[^<]*\/(?:master|universidad)\/[^<]*<\/loc>[\s\S]*?<\/url>\n/g, "");

  const cuerpo = nuevas.map((p) => bloque(p.loc, p.prio, previas.get(p.loc) || hoy)).join("\n");
  const salida = sinMapa.replace("</urlset>", `${cuerpo}\n</urlset>`);
  fs.writeFileSync(SALIDA, salida, "utf8");

  const total = (salida.match(/<url>/g) || []).length;
  console.log(`✓ sitemap: ${nuevas.length} páginas del mapa (${datos.comunidades.length} comunidades y ${(datos.universidades || []).length} universidades). ${total} URLs en total.`);
}

main();
