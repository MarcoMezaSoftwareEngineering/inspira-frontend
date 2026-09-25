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
import { RUTAS_COMPARTIR, SITIO, MARCA, datosRuta, nombreArchivo } from "./rutas-compartir.mjs";
import { POSTS, AUTOR_POR_DEFECTO } from "../src/pages/blog/blog.data.js";

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
  return generarCon(base, datosRuta(ruta), archivo);
}

function generarCon(base, d, archivo) {
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
// ── Entradas del blog: pre-renderizadas ──────────────────────────────────
// Los rastreadores (y los resúmenes de IA de Google) leen primero el HTML que
// devuelve el servidor. Hasta el 25/09/2026 una entrada del blog llegaba con
// el título genérico del sitio y sin texto: todo lo ponía el JavaScript. Aquí
// cada entrada sale con su título, su descripción, sus fichas Article y
// FAQPage y el artículo entero en el HTML. La aplicación, al arrancar, quita
// el bloque pre-renderizado (#prerender) y pinta lo suyo. nginx sirve
// /compartir/blog-<slug>.html para /blog/<slug> (map con expresión regular).
function bloqueHtml(b) {
  const li = (items, tag) => `<${tag}>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</${tag}>`;
  if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
  if (b.type === "ul") return li(b.items, "ul");
  if (b.type === "ol") return li(b.items, "ol");
  if (b.type === "faq") return b.items.map((f) => `<section><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></section>`).join("");
  if (b.type === "enlace") return `<p><a href="${esc(b.href)}">${esc(b.texto)}</a></p>`;
  return `<p>${esc(b.text || "")}</p>`;
}

function generarPost(base, post) {
  const ruta = `/blog/${post.slug}`;
  const autor = post.autor || AUTOR_POR_DEFECTO;
  const d = {
    title: `${post.titulo} | ${MARCA}`,
    description: post.extracto,
    type: "article",
    url: SITIO + ruta,
    image: `${SITIO}/blog/${post.slug}.jpg`,
    imageAlt: post.titulo,
  };
  let h = generarCon(base, d, `compartir/blog-${post.slug}.html`);

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titulo,
    description: post.extracto,
    image: d.image,
    datePublished: post.fecha,
    dateModified: post.actualizado || post.fecha,
    inLanguage: "es",
    author: { "@type": "Person", name: autor.nombre, jobTitle: autor.cargo },
    publisher: { "@type": "Organization", name: MARCA, url: SITIO },
    mainEntityOfPage: d.url,
  };
  const faq = post.content.find((b) => b.type === "faq");
  const faqPage = faq && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  // Los mismos ids que usa SEOSchema en la aplicación: al montar, los quita y
  // pone los suyos, así nunca hay dos fichas iguales.
  const fichas = `<script type="application/ld+json" id="ld-post">${JSON.stringify(article)}</script>`
    + (faqPage ? `<script type="application/ld+json" id="ld-post-faq">${JSON.stringify(faqPage)}</script>` : "");
  h = h.replace("</head>", `${fichas}</head>`);

  const cuerpo = `<div id="prerender"><article><p>${esc(post.categoria)} · ${esc(post.fecha)}</p><h1>${esc(post.titulo)}</h1><p>${esc(post.extracto)}</p>`
    + post.content.map(bloqueHtml).join("")
    + `<p>${esc(autor.nombre)} · ${esc(autor.cargo)}</p></article></div>`;
  if (!h.includes('<div id="root"></div>')) {
    console.error(`  ✗ blog-${post.slug}: no se encontró <div id="root"></div>`);
    fallos++;
  }
  return h.replace('<div id="root"></div>', `${cuerpo}<div id="root"></div>`);
}

for (const post of POSTS) {
  fs.writeFileSync(path.join(SALIDA, `blog-${post.slug}.html`), generarPost(base, post));
}
if (fallos) {
  console.error(`html-compartir: ${fallos} fallos en las entradas del blog.`);
  process.exit(1);
}
console.log(`html-compartir: ${rutas.length - 1} HTML en dist/compartir/, ${POSTS.length} entradas del blog pre-renderizadas y dist/index.html actualizado.`);
