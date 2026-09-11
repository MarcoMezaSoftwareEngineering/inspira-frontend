// scripts/html-compartir.mjs
// Se ejecuta después de `vite build` (ver "build" en package.json).
// Lee dist/index.html y escribe un HTML de entrada por ruta en
// dist/compartir/<ruta-con-guiones>.html, con title, description, canonical,
// og:* y twitter:* propios. El JavaScript y el CSS enlazados son los mismos,
// así que la aplicación arranca igual en esa ruta.
//
// Por qué dist/compartir/ y no dist/<ruta>.html: ya existen
// public/calculadora-master.html (la calculadora embebible en iframe) y otros
// HTML sueltos; una carpeta propia evita choques. «compartir» no es ninguna
// ruta de la aplicación (regla: nada en dist/ con nombre de ruta SPA).
//
// dist/index.html también se reescribe con los datos de "/", para que no haya
// dos fuentes de verdad. backoffice.html no se toca.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RUTAS_COMPARTIR, datosRuta, nombreArchivo } from "./rutas-compartir.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(RAIZ, "dist");
const SALIDA = path.join(DIST, "compartir");
const INDEX = path.join(DIST, "index.html");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let fallos = 0;

/** Sustituye el atributo content (o href) de una etiqueta; exige que exista. */
function poner(html, patron, valor, archivo) {
  let n = 0;
  const salida = html.replace(patron, (_m, antes, _v, despues) => {
    n++;
    return `${antes}${esc(valor)}${despues}`;
  });
  if (n !== 1) {
    console.error(`  ✗ ${archivo}: ${patron} coincide ${n} veces (se esperaba 1)`);
    fallos++;
  }
  return salida;
}

const meta = (attr, nombre) =>
  new RegExp(`(<meta\\s+${attr}="${nombre.replace(/[:.]/g, "\\$&")}"\\s+content=")([^"]*)(")`, "g");

function generar(base, ruta, archivo) {
  const d = datosRuta(ruta);
  let h = base;
  h = poner(h, /(<title>)([^<]*)(<\/title>)/g, d.title, archivo);
  h = poner(h, meta("name", "description"), d.description, archivo);
  h = poner(h, /(<link\s+rel="canonical"\s+href=")([^"]*)(")/g, d.url, archivo);
  h = poner(h, meta("property", "og:type"), d.type, archivo);
  h = poner(h, meta("property", "og:title"), d.title, archivo);
  h = poner(h, meta("property", "og:description"), d.description, archivo);
  h = poner(h, meta("property", "og:url"), d.url, archivo);
  h = poner(h, meta("property", "og:image"), d.image, archivo);
  h = poner(h, meta("property", "og:image:alt"), d.imageAlt, archivo);
  h = poner(h, meta("name", "twitter:title"), d.title, archivo);
  h = poner(h, meta("name", "twitter:description"), d.description, archivo);
  h = poner(h, meta("name", "twitter:image"), d.image, archivo);
  h = poner(h, meta("name", "twitter:image:alt"), d.imageAlt, archivo);
  return h;
}

if (!fs.existsSync(INDEX)) {
  console.error("html-compartir: no existe dist/index.html; ejecuta antes `vite build`.");
  process.exit(1);
}

const base = fs.readFileSync(INDEX, "utf8");
if (!/<script[^>]+src="\/assets\//.test(base)) {
  console.error("html-compartir: dist/index.html no enlaza /assets/…; ¿es el HTML compilado?");
  process.exit(1);
}

fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(SALIDA, { recursive: true });

const rutas = Object.keys(RUTAS_COMPARTIR);
for (const ruta of rutas) {
  const nombre = nombreArchivo(ruta);
  if (ruta === "/") {
    fs.writeFileSync(INDEX, generar(base, ruta, "index.html"));
    continue;
  }
  fs.writeFileSync(path.join(SALIDA, `${nombre}.html`), generar(base, ruta, `compartir/${nombre}.html`));
}

if (fallos) {
  console.error(`html-compartir: ${fallos} sustituciones fallidas. Revisa las etiquetas de index.html.`);
  process.exit(1);
}
console.log(`html-compartir: ${rutas.length - 1} HTML en dist/compartir/ y dist/index.html actualizado.`);
