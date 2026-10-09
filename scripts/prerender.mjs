// scripts/prerender.mjs
// Se ejecuta después de `vite build` y de scripts/html-compartir.mjs (ver
// "build" en package.json). Desde el 09/10/2026.
//
// Por qué: la web era CSR puro. El HTML llegaba con <div id="root"></div>
// vacío y nada se pintaba hasta descargar y ejecutar el JavaScript; en el
// móvil, el H1 de la portada (el LCP) salía a 5,9 s en producción. Aquí cada
// página pública principal se pinta en Node y su HTML sale ya con el
// contenido; el navegador lo enseña en cuanto llega el CSS y main.jsx lo
// hidrata después, sin volver a pintarlo.
//
// Cómo, sin navegador (el build corre en el VPS, sin Chromium):
//   1. Vite compila src/entry-server.jsx para Node, en node_modules/.cache
//      (nunca en dist/: sería código del servidor publicado).
//   2. Cada página se pinta en su propio worker con `prerender` de
//      react-dom/static, que espera a las páginas diferidas (lazy). Un worker
//      por página porque así cada una carga sus módulos desde cero y se sabe
//      exactamente qué trozos diferidos pintó; y porque si una se cuelga, se
//      la mata sin colgar el build.
//   3. Con el manifiesto del cliente (.vite/manifest.json) se enlazan en su
//      HTML el CSS de esos trozos (sin él, la página se pintaría sin estilos
//      hasta que llegara su JavaScript) y un modulepreload de su JavaScript,
//      para que la hidratación no espere a main.js para pedirlo. En los HTML
//      de compartir, el JavaScript va con fetchpriority="low" (ver inyectar).
//   4. El contenido entra en <div id="root">, y <html> lleva
//      data-prerender="/ruta" y data-prerender-dia (lib/hidratacion.js).
//
// La guarda (scripts/prerender-guarda.js): nginx sirve index.html, con la
// portada dentro, también a /mapa, /panel o un 404. Por eso #root sale
// escondido por una regla <style> en línea y un script externo mínimo, al
// final del <head>, lo enseña solo si la ruta es la del HTML. En otra ruta la
// portada no se ve nunca y main.jsx monta de cero, como siempre.
//
// El build NO se rompe por esto: si una página falla (error, desajuste,
// tiempo agotado), sale sin prerender y con un aviso; si falla todo, la web
// queda exactamente como antes. Siempre termina con código 0.
//
// Qué páginas: "/" (dist/index.html) y las rutas con HTML propio en el map de
// nginx (dist/compartir/, scripts/nginx-compartir.md). Si una ruta no está en
// ese map, nginx le da index.html y prerenderizarla no serviría de nada.
// Fuera a propósito:
//   - /metodo-inspira: redirige a /servicios/master#pago-por-etapas. Con el
//     prerender se vería la cabecera de /servicios/master uno o dos segundos y
//     luego saltaría a mitad de página al hidratar.
//
// Pruebas: INSPIRA_DIST=<carpeta> npm run build compila en otra carpeta.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

const ESTE_ARCHIVO = fileURLToPath(import.meta.url);
const RAIZ = path.resolve(path.dirname(ESTE_ARCHIVO), "..");
const DIST = process.env.INSPIRA_DIST ? path.resolve(process.env.INSPIRA_DIST) : path.join(RAIZ, "dist");
// Dentro de node_modules para que el código compilado encuentre react y
// compañía al importarlos (se quedan fuera del paquete, como en cualquier SSR).
const SSR = path.join(RAIZ, "node_modules", ".cache", "inspira-prerender");
const GUARDA = path.join(RAIZ, "scripts", "prerender-guarda.js");

/** Ruta → HTML (relativo a dist/) en el que se pinta. */
const PAGINAS = {
  "/": "index.html",
  "/master-2027-2028": "compartir/master-2027-2028.html",
  "/servicios/master": "compartir/servicios-master.html",
  "/servicios/estancia": "compartir/servicios-estancia.html",
  "/servicios": "compartir/servicios.html",
  "/visa-o-estancia": "compartir/visa-o-estancia.html",
  // Un iframe con la calculadora: el prerender adelanta su descarga (antes
  // esperaba a que React pintara el <iframe>) y pinta cabecera y pie.
  "/calculadora-master": "compartir/calculadora-master.html",
};

const PLAZO_PAGINA_MS = 20000;
const ROOT_VACIO = '<div id="root"></div>';

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const kb = (n) => `${(n / 1024).toFixed(1).replace(".", ",")} KB`;
const seg = (ms) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

// ── Worker: pinta una página ────────────────────────────────────────────────
async function trabajador() {
  const { entrada, ruta } = workerData;
  // La compilación del servidor (plugin anotarTrozos) llama a esto en cada
  // import() diferido: así se sabe qué trozos pintó esta página.
  const trozos = new Set();
  globalThis.__inspiraTrozo = (id) => trozos.add(id);
  try {
    const { renderizar } = await import(pathToFileURL(entrada).href);
    const r = await renderizar(ruta, { signal: AbortSignal.timeout(PLAZO_PAGINA_MS - 2000) });
    parentPort.postMessage({ ok: true, ...r, trozos: [...trozos] });
  } catch (e) {
    parentPort.postMessage({ ok: false, error: String(e?.stack || e) });
  }
}

// ── Compilación para Node ───────────────────────────────────────────────────

/**
 * Envuelve cada import() diferido del código compilado para que anote qué
 * módulo de src/ carga: `import("./x.mjs")` pasa a ser
 * `(globalThis.__inspiraTrozo?.("src/pages/…/X.jsx"), import("./x.mjs"))`.
 * Las claves son las mismas que las del manifiesto del cliente.
 */
function anotarTrozos() {
  return {
    name: "inspira-prerender-trozos",
    renderDynamicImport({ targetModuleId }) {
      if (!targetModuleId || targetModuleId.startsWith("\0")) return null;
      const id = path.relative(RAIZ, targetModuleId).split(path.sep).join("/");
      return { left: `(globalThis.__inspiraTrozo?.(${JSON.stringify(id)}), import(`, right: "))" };
    },
  };
}

/**
 * Inspira Core y el panel del asesorado no se prerenderizan nunca (son
 * privados): en la compilación del servidor, App.jsx los recibe vacíos. Así
 * no se compilan sus cientos de archivos en cada build del VPS.
 */
function sinZonasPrivadas() {
  const VACIO = "\0inspira-prerender-zona-privada";
  return {
    name: "inspira-prerender-sin-zonas-privadas",
    enforce: "pre",
    resolveId(fuente, importador) {
      if (importador && /[\\/]src[\\/]App\.jsx$/.test(importador) && /\/pages\/(backoffice|panel)\//.test(fuente)) {
        return VACIO;
      }
      return null;
    },
    load(id) {
      return id === VACIO ? "export default function ZonaPrivada() { return null; }" : null;
    },
  };
}

async function compilarServidor() {
  const { build } = await import("vite");
  await build({
    root: RAIZ,
    configFile: path.join(RAIZ, "vite.config.js"),
    mode: "production",
    logLevel: "warn",
    plugins: [sinZonasPrivadas(), anotarTrozos()],
    build: {
      ssr: "src/entry-server.jsx",
      outDir: SSR,
      emptyOutDir: true,
      copyPublicDir: false,
      manifest: false,
      minify: false,
      rollupOptions: {
        input: path.join(RAIZ, "src/entry-server.jsx"),
        output: { entryFileNames: "entry-server.mjs", chunkFileNames: "trozos/[name]-[hash].mjs" },
      },
    },
  });
  return path.join(SSR, "entry-server.mjs");
}

function pintarEnWorker(entrada, ruta) {
  return new Promise((resolve) => {
    const w = new Worker(ESTE_ARCHIVO, { workerData: { entrada, ruta } });
    let hecho = false;
    const acabar = (r) => {
      if (hecho) return;
      hecho = true;
      clearTimeout(t);
      w.terminate().catch(() => {});
      resolve(r);
    };
    const t = setTimeout(() => acabar({ ok: false, error: `más de ${seg(PLAZO_PAGINA_MS)} pintando` }), PLAZO_PAGINA_MS);
    w.once("message", acabar);
    w.once("error", (e) => acabar({ ok: false, error: String(e?.stack || e) }));
    w.once("exit", (codigo) => acabar({ ok: false, error: `el worker terminó (código ${codigo}) sin responder` }));
  });
}

// ── HTML ────────────────────────────────────────────────────────────────────

/** CSS y JavaScript que piden los trozos pintados y que el HTML aún no enlaza. */
function recursosDe(trozos, manifiesto, html) {
  const css = [];
  const js = [];
  const visto = new Set();
  const recorrer = (clave) => {
    if (visto.has(clave)) return;
    visto.add(clave);
    const e = manifiesto[clave];
    if (!e) throw new Error(`${clave} no está en el manifiesto del cliente`);
    // Primero lo que importa, como hace Vite al cargarlo en el navegador.
    for (const dep of e.imports || []) recorrer(dep);
    for (const c of e.css || []) css.push(`/${c}`);
    js.push(`/${e.file}`);
  };
  trozos.forEach(recorrer);
  const nuevo = (url, i, lista) => lista.indexOf(url) === i && !html.includes(`"${url}"`);
  return { css: css.filter(nuevo), js: js.filter(nuevo) };
}

/**
 * Valida lo pintado y lo mete en el HTML. Lanza un Error si algo no cuadra.
 * `archivoPropio`: nginx solo sirve este HTML a su ruta (no es index.html).
 */
function inyectar(html, ruta, r, recursos, guarda, archivoPropio) {
  if (r.errores.length) throw new Error(`error al pintar: ${r.errores[0].split("\n")[0]}`);
  // <!--$!--> es un Suspense que el servidor dejó para el navegador (falló o
  // se agotó el tiempo) y <!--$?--> uno sin terminar: la página no está entera.
  if (r.html.includes("<!--$!-->") || r.html.includes("<!--$?-->")) {
    throw new Error("quedó un Suspense sin resolver en el servidor");
  }
  if (r.html.length < 500) throw new Error(`el HTML pintado es demasiado corto (${r.html.length} caracteres)`);
  // Un <script> en línea lo bloquearía la CSP (script-src sin 'unsafe-inline').
  if (/<script\b/i.test(r.html)) throw new Error("el HTML pintado lleva un <script> en línea");
  // React abre con los avisos de precarga de las imágenes que pinta
  // (<link rel="preload" as="image">): van al <head>, no dentro de #root.
  const cabecera = r.html.match(/^(?:\s*<link\b[^>]*>)*/)[0];
  const cuerpo = r.html.slice(cabecera.length);
  if (/^\s*<(title|meta|link|style)\b/i.test(cuerpo)) {
    throw new Error("React pintó etiquetas de <head> dentro de la página; revisa qué componente las pone");
  }
  if (html.split(ROOT_VACIO).length !== 2) throw new Error(`no hay un único ${ROOT_VACIO}`);
  if (html.includes("data-prerender=")) throw new Error("el HTML ya estaba prerenderizado");

  if (!/<html\b[^>]*>/.test(html)) throw new Error("no se encontró <html>");
  if (!html.includes("</head>")) throw new Error("no se encontró </head>");

  // Reemplazos con función: el HTML pintado puede llevar «$» (precios) y en
  // una cadena de reemplazo «$&» o «$1» tienen significado.
  let h = html.replace(/<html\b([^>]*)>/, (_m, attrs) =>
    `<html${attrs} data-prerender="${esc(ruta)}" data-prerender-dia="${esc(r.dia)}">`);

  // Las reglas de la guarda (scripts/prerender-guarda.js): #root sale
  // escondido y la guarda lo enseña si la ruta es la del HTML. Sin JavaScript,
  // el <noscript> lo enseña. Van en línea (la CSP admite estilos en línea).
  const reglas = [
    `<!-- Prerender (scripts/prerender.mjs): #root se enseña solo si la ruta es ${esc(ruta)}. -->`,
    "<style>html[data-prerender]:not([data-prerender-ok]) #root,html[data-aviso-cookies-oculto] [data-aviso-cookies]{display:none}</style>",
    // !important: la regla de arriba es más específica (por el :not).
    "<noscript><style>html[data-prerender] #root{display:block!important}</style></noscript>",
  ].map((l) => `\n    ${l}`).join("");
  const csp = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i;
  const ancla = csp.test(h) ? csp : /<head>/i;
  if (!ancla.test(h)) throw new Error("no se encontró dónde poner la guarda");
  h = h.replace(ancla, (m) => `${m}${reglas}`);

  // El JavaScript, con prioridad baja, salvo en index.html. Esta página ya se
  // ve sin él: que no le quite ancho de banda al CSS (con HTTP/1.1, Chrome
  // deja pasar uno solo a la vez mientras baja el CSS). Con la red de móvil de
  // Lighthouse, el FCP de /servicios/master pasa de 4,0 a 2,6 s (09/10/2026).
  // index.html no: nginx también lo sirve a las rutas sin prerender (/mapa…),
  // que sí necesitan el JavaScript para pintar, y ahí la prioridad baja les
  // costaba medio segundo.
  if (archivoPropio) {
    h = h.replace(/<script type="module"(?![^>]*fetchpriority)/g, '<script type="module" fetchpriority="low"');
    h = h.replace(/<link rel="modulepreload"(?![^>]*fetchpriority)/g, '<link rel="modulepreload" fetchpriority="low"');
  }
  const bajo = archivoPropio ? ' fetchpriority="low"' : "";
  const enlaces = [
    ...recursos.css.map((u) => `    <link rel="stylesheet" crossorigin href="${u}">`),
    ...recursos.js.map((u) => `    <link rel="modulepreload"${bajo} crossorigin href="${u}">`),
    ...(cabecera.match(/<link\b[^>]*>/g) || []).map((l) => `    ${l}`),
    // La guarda, al final del <head> y bloqueante, a propósito (medido con
    // Lighthouse y red de móvil aplicada, 09/10/2026):
    //  - delante del CSS retrasaba todas las descargas una ida y vuelta:
    //    Chrome deja de adelantarlas mientras espera un script, por la CSP en
    //    <meta>;
    //  - asíncrona, el navegador leía todo el <body> antes de que llegara el
    //    CSS y el primer fotograma tenía que maquetar la página entera (1,5 s
    //    de tarea en un móvil lento; FCP de la portada a 3,7 s en vez de 3,0);
    //  - aquí todo lo demás ya está pedido, el análisis tenía que esperar al
    //    CSS de todas formas y, al seguir, Chrome pinta el primer pantallazo
    //    sin esperar al resto de la página.
    `    <script src="${guarda}"></script>`,
  ];
  h = h.replace(/[ \t]*<\/head>/, () => `${enlaces.join("\n")}\n  </head>`);
  h = h.replace(ROOT_VACIO, () => `<div id="root">${cuerpo}</div>`);
  return h;
}

/** Copia la guarda, minificada, a dist/assets con hash en el nombre (caché larga). */
async function publicarGuarda() {
  let codigo = fs.readFileSync(GUARDA, "utf8");
  try {
    // esbuild viene con Vite. Sin los comentarios pasa de 1 KB a ~150 bytes.
    const { transform } = await import("esbuild");
    // es2015: que la entienda hasta un navegador viejo (sin `catch {}`); si
    // fallara, en /mapa se vería la portada un instante.
    codigo = (await transform(codigo, { minify: true, target: "es2015" })).code;
  } catch { /* se publica tal cual: funciona igual */ }
  const hash = crypto.createHash("sha256").update(codigo).digest("base64url").slice(0, 8);
  const nombre = `assets/prerender-guarda-${hash}.js`;
  fs.writeFileSync(path.join(DIST, nombre), codigo);
  return `/${nombre}`;
}

// ── Principal ───────────────────────────────────────────────────────────────
async function principal() {
  const inicio = performance.now();
  const avisar = (m) => console.warn(`prerender: ⚠ ${m}`);
  const manifiestoRuta = path.join(DIST, ".vite", "manifest.json");
  let hechas = 0;
  try {
    if (!fs.existsSync(path.join(DIST, "index.html")) || !fs.existsSync(manifiestoRuta)) {
      avisar("no están dist/index.html o dist/.vite/manifest.json; la web sale sin prerender.");
      return;
    }
    const manifiesto = JSON.parse(fs.readFileSync(manifiestoRuta, "utf8"));

    const t0 = performance.now();
    let entrada;
    try {
      entrada = await compilarServidor();
    } catch (e) {
      avisar(`no se pudo compilar src/entry-server.jsx; la web sale sin prerender.\n${e?.stack || e}`);
      return;
    }
    const tCompilar = performance.now() - t0;

    // Workers en paralelo, sin pasar de los núcleos (el VPS tiene 2).
    const rutas = Object.keys(PAGINAS);
    const paralelo = Math.max(1, Math.min(4, os.availableParallelism?.() ?? os.cpus().length));
    const resultados = new Map();
    const t1 = performance.now();
    for (let i = 0; i < rutas.length; i += paralelo) {
      const tanda = rutas.slice(i, i + paralelo);
      const rs = await Promise.all(tanda.map((ruta) => pintarEnWorker(entrada, ruta)));
      tanda.forEach((ruta, j) => resultados.set(ruta, rs[j]));
    }
    const tPintar = performance.now() - t1;

    let guarda = null;
    for (const ruta of rutas) {
      const archivo = PAGINAS[ruta];
      const destino = path.join(DIST, archivo);
      const r = resultados.get(ruta);
      try {
        if (!r.ok) throw new Error(r.error.split("\n").slice(0, 3).join(" | "));
        if (!fs.existsSync(destino)) throw new Error(`no existe ${archivo} (¿cambió html-compartir.mjs?)`);
        const html = fs.readFileSync(destino, "utf8");
        const recursos = recursosDe(r.trozos, manifiesto, html);
        guarda ??= await publicarGuarda();
        fs.writeFileSync(destino, inyectar(html, ruta, r, recursos, guarda, archivo !== "index.html"));
        hechas++;
        const extra = [recursos.css.length && `${recursos.css.length} CSS`, recursos.js.length && `${recursos.js.length} JS`]
          .filter(Boolean).join(" + ");
        console.log(`prerender: ✓ ${ruta} → ${archivo} (${kb(r.html.length)}${extra ? `, ${extra}` : ""})`);
      } catch (e) {
        avisar(`${ruta} sale sin prerender: ${e.message}`);
      }
    }
    console.log(
      `prerender: ${hechas}/${rutas.length} páginas en ${seg(performance.now() - inicio)} `
      + `(compilar ${seg(tCompilar)}, pintar ${seg(tPintar)} con ${paralelo} en paralelo).`
    );
  } catch (e) {
    avisar(`fallo inesperado; ${hechas ? "las páginas ya escritas quedan bien" : "la web sale sin prerender"}.\n${e?.stack || e}`);
  } finally {
    // Ni el manifiesto ni el código del servidor se publican.
    fs.rmSync(path.join(DIST, ".vite"), { recursive: true, force: true });
    fs.rmSync(SSR, { recursive: true, force: true });
  }
}

if (isMainThread) {
  await principal();
  // Algún módulo de la aplicación pudo dejar temporizadores vivos: el build
  // no los espera.
  process.exit(0);
} else {
  await trabajador();
}
