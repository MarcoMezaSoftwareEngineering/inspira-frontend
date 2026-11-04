#!/usr/bin/env bun
// ============================================================================
// Inspira · capturas del panel del asesorado con datos FICTICIOS
//
// Abre Chrome sin cabeza, intercepta por CDP todas las llamadas a la API
// (<base>/* que no sean documentos ni estáticos) y las responde con los
// fixtures de ./fixtures.mjs. Pone un JWT ficticio en localStorage y captura
// cada ruta en móvil (390×844 @2x) y escritorio (1280×800) —y en tableta
// (834×1112 @2x, iPad) si se pide—: el primer viewport («-arriba») y la
// página entera (se estira el viewport hasta que nada tenga scroll, porque el
// panel desplaza dentro de <main>).
//
// Cada captura empieza con el almacenamiento del sitio vacío (más la sesión
// ficticia), así que sale igual sola (--solo) que dentro de la pasada entera:
// los «Nuevo» de Novedades, lo pospuesto y lo plegado no dependen del orden.
//
// Uso (desde inspira-frontend, con `vite preview --outDir dist-qa --port 4173` ya sirviendo):
//   bun scripts/panel-qa/capturar.mjs [--salida <carpeta>] [--solo <nombre|ruta>[,…]]
//                                     [--vista movil|escritorio|tableta[,…]] [--base http://localhost:4173]
//
//   --solo   un nombre o una ruta exactos (panel-servicios-156, /panel/servicios/156)
//            eligen esas entradas; si nada coincide exacto, vale como subcadena.
//            Admite varios separados por comas.
//   --vista  sin ella, móvil y escritorio. La tableta solo se captura si se pide.
//
// Sale: <salida>/<nombre>-<movil|escritorio|tableta>[-arriba].png,
//       <salida>/indice.html (cuadrícula), <salida>/consola.txt (errores de
//       consola, avisos y rutas de API sin fixture) y <salida>/capturas.json,
//       de donde salen los dos anteriores. Varias pasadas a la misma carpeta se
//       suman: el índice y la consola enseñan la última captura de cada ruta y vista.
// ============================================================================
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as esperar } from "node:timers/promises";
import { crearFixtures, CLIENTE, NOMBRES_ESCENARIOS } from "./fixtures.mjs";

const SALIDA_POR_DEFECTO = "/private/tmp/claude-501/-Users-carinadiocelynmezaramon-InspiraCore/dd85a1f5-8e5a-45f9-94a7-bdab4781e330/scratchpad/panel-qa/antes";

const CHROME = [
  process.env.NAVEGADOR,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter(Boolean).find(existsSync);

const UA_ESCRITORIO = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const VISTAS = {
  movil: {
    metrics: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "portraitPrimary", angle: 0 } },
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    plataforma: "iPhone",
    touch: true,
  },
  // iPad de 11" en vertical, con el UA de Safari para iPad (no el de «sitio de
  // escritorio»): por encima de md (768) y por debajo de lg (1024).
  tableta: {
    metrics: { width: 834, height: 1112, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "portraitPrimary", angle: 0 } },
    ua: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    plataforma: "iPad",
    touch: true,
  },
  escritorio: {
    metrics: { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
    ua: UA_ESCRITORIO,
    plataforma: "MacIntel",
    touch: false,
  },
};
const VISTAS_POR_DEFECTO = ["movil", "escritorio"];

// ── Interacciones ───────────────────────────────────────────────────────────
// Los clics buscan por texto, rol o ARIA antes que por clases: el rediseño
// cambia las clases, no los textos ni el ARIA. No se toca el código de la app.
const abrirBloque = (titulo) => async (p) => {
  // Estancia, PAC y modificatoria: bloques plegables, sin sección en la URL.
  const spec = { selector: "button[aria-expanded]", contiene: titulo };
  await p.clic(spec);
  await p.esperar(250);
  await p.desplazar(spec);
};
// La hoja de mensajes: el botón flotante «Mensajes» (con o sin contador).
const abrirMensajes = (p) => p.clic({ selector: "button", patron: "^Mensajes", fijo: true });

// Las rutas que se capturan.
//   sinToken   abre la Bienvenida (sin sesión).
//   vistas     solo en esas vistas; si no, en todas las pedidas.
//   escenario  variante de los fixtures (fixtures.mjs, ESCENARIOS).
//   antes      async (pagina) => {…}: tras cargar y antes de capturar (clics,
//              despliegues). Después se esperan 400 ms por las transiciones y
//              a que la pantalla quede quieta. pagina = { vista, clic(spec),
//              desplazar(spec), evaluar(expr), esperar(ms) }; spec = { selector
//              (o lista), texto (exacto) | contiene | patron, visible, fijo }.
//              Si no encuentra a qué hacer clic, lo anota en consola.txt y
//              captura igual.
//   estirar    false: la captura «entera» es el viewport, sin estirarlo (hojas,
//              menús y ventanas encima de la página: estirada saldrían deformes).
//
// Anotado:
//   · /panel/servicios/155/documentos y /155/mensajes no son secciones del
//     máster: DetalleSolicitud cae en la primera («docs») con cualquier tercer
//     segmento que no conozca. Se dejan con su nombre por las capturas de
//     «antes»; -mensajes abre la hoja de mensajes con un clic.
//   · Secciones del máster (DetalleSolicitud.jsx, navSections): docs, form,
//     informe, eleccion, post, cierre. «form» no se captura: abre el
//     formulario académico, que comparte Core y tiene su propio test.
//   · 157, 158 y 159 (estancia, PAC, modificatoria) no tienen secciones en la
//     URL: «-documentos» abre el bloque «Tus documentos» con un clic.
//   · 160 (doctorado) y 161 (grado) sí las tienen: -diagnostico es un paso ya
//     hecho con un documento por corregir; -documentos, el de la homologación.
//   · Ninguna ruta redirige ni sale vacía con estos fixtures. 155-cierre
//     enseña su estado de espera («se activa con tu primera admisión»): el
//     bloque 8 de los fixtures aún no tiene ninguna admisión.
//   · Core (core-155, la ficha de SolicitudDetalleBackoffice): no se añade.
//     Pide sesión de backoffice (bo_token, bo_user con permisos) y más de una
//     docena de endpoints de admin con formas propias; se verifica por la vía
//     del principio (diff de className, vitest y revisión de Carina).
const RUTAS = [
  { ruta: "/panel", nombre: "panel" },
  { ruta: "/panel/servicios", nombre: "panel-servicios" },
  { ruta: "/panel/servicios/155", nombre: "panel-servicios-155" },
  { ruta: "/panel/servicios/155/documentos", nombre: "panel-servicios-155-documentos" },
  { ruta: "/panel/servicios/155/mensajes", nombre: "panel-servicios-155-mensajes", antes: abrirMensajes, estirar: false },
  { ruta: "/panel/servicios/155/informe", nombre: "panel-servicios-155-informe" },
  { ruta: "/panel/servicios/155/eleccion", nombre: "panel-servicios-155-eleccion" },
  { ruta: "/panel/servicios/155/post", nombre: "panel-servicios-155-postulaciones" },
  { ruta: "/panel/servicios/155/cierre", nombre: "panel-servicios-155-cierre" },
  // El servidor falla al dar la solicitud (escenario error-155): el error de
  // carga con «Reintentar». Solo en el teléfono, que es donde más se recarga.
  { ruta: "/panel/servicios/155", nombre: "panel-servicios-155-error", vistas: ["movil"], escenario: "error-155" },
  { ruta: "/panel/servicios/156", nombre: "panel-servicios-156" },
  // El selector de secciones del visado solo existe en el teléfono (md:hidden).
  { ruta: "/panel/servicios/156", nombre: "panel-servicios-156-selector", vistas: ["movil"], estirar: false,
    antes: (p) => p.clic({ selector: 'button[aria-haspopup="listbox"]' }) },
  { ruta: "/panel/servicios/157", nombre: "panel-servicios-157" },
  { ruta: "/panel/servicios/157", nombre: "panel-servicios-157-documentos", antes: abrirBloque("Tus documentos") },
  { ruta: "/panel/servicios/158", nombre: "panel-servicios-158" },
  { ruta: "/panel/servicios/158", nombre: "panel-servicios-158-documentos", antes: abrirBloque("Tus documentos") },
  { ruta: "/panel/servicios/159", nombre: "panel-servicios-159" },
  { ruta: "/panel/servicios/159", nombre: "panel-servicios-159-documentos", antes: abrirBloque("Tus documentos") },
  { ruta: "/panel/servicios/160", nombre: "panel-servicios-160" },
  { ruta: "/panel/servicios/160/diagnostico", nombre: "panel-servicios-160-diagnostico" },
  { ruta: "/panel/servicios/161", nombre: "panel-servicios-161" },
  { ruta: "/panel/servicios/161/documentos", nombre: "panel-servicios-161-documentos" },
  // Expediente ajeno (invitado): el aviso de «Estás viendo el expediente de…».
  { ruta: "/panel/servicios/162", nombre: "panel-servicios-162" },
  { ruta: "/panel/ruta", nombre: "panel-ruta" },
  { ruta: "/panel/perfil", nombre: "panel-perfil" },
  { ruta: "/panel/perfil", nombre: "panel-perfil-editar",
    antes: (p) => p.clic({ selector: [".pnl-perfil-cab button", "button"], texto: "Editar" }) },
  { ruta: "/panel/pagos", nombre: "panel-pagos" },
  { ruta: "/panel/becas", nombre: "panel-becas" },
  { ruta: "/panel/guia", nombre: "panel-guia" },
  { ruta: "/panel/portal", nombre: "panel-portal" },
  // La campana del centro de avisos: en el teléfono los avisos van en Inicio.
  { ruta: "/panel", nombre: "panel-avisos-abierto", vistas: ["escritorio", "tableta"], estirar: false,
    antes: (p) => p.clic({ selector: [".pnl-avc-boton", 'button[aria-haspopup="dialog"][aria-label^="Avisos"]'] }) },
  // «Instalar la app» del menú lateral (PanelSidebar → InstalarAppModal). En el
  // teléfono el lateral está fuera de la pantalla, pero en el DOM: se le hace clic igual.
  { ruta: "/panel", nombre: "panel-instalar", estirar: false,
    antes: (p) => p.clic({ selector: "button", texto: "Instalar la app", visible: false }) },
  // Sin servicios y con el perfil incompleto: la app gratuita (AppGratis).
  { ruta: "/panel", nombre: "panel-app-gratis", escenario: "sin-servicios" },
  ...["presupuesto", "becas", "calendario", "schengen", "listas", "admision", "nota", "plazos", "trabajo", "grado", "amigos"].map((h) => (
    { ruta: `/panel/herramientas/${h}`, nombre: `panel-herramientas-${h}`, escenario: "sin-servicios" })),
  { ruta: "/panel/herramientas/admision", nombre: "panel-herramientas-admision-lista", escenario: "con-busqueda" },
  { ruta: "/panel/herramientas/postulaciones", nombre: "panel-herramientas-postulaciones", escenario: "con-busqueda" },
  { ruta: "/panel/herramientas/guia-documentos", nombre: "panel-herramientas-guia-documentos", escenario: "sin-servicios" },
  // Con servicios, las herramientas sin el bloque «Reservado para clientes».
  { ruta: "/panel/herramientas", nombre: "panel-herramientas" },
  { ruta: "/panel", nombre: "panel-sin-token", sinToken: true },
  // La puerta pública a la app (/app), sin sesión.
  { ruta: "/app", nombre: "app-publica", sinToken: true },
];

for (const r of RUTAS) {
  if (r.escenario && !NOMBRES_ESCENARIOS.includes(r.escenario)) throw new Error(`${r.nombre}: escenario desconocido ${r.escenario}`);
  for (const v of r.vistas || []) if (!VISTAS[v]) throw new Error(`${r.nombre}: vista desconocida ${v}`);
}

const ALTO_MAXIMO = 9000; // px CSS: tope para la captura «entera»

// ── Argumentos ──────────────────────────────────────────────────────────────
function leerArgumentos(argv) {
  const op = { salida: SALIDA_POR_DEFECTO, solo: null, vista: null, base: "http://localhost:4173" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    let [clave, valor] = a.slice(2).split("=", 2);
    if (valor === undefined) valor = argv[++i];
    if (!(clave in op)) { console.error(`Opción desconocida: --${clave}`); process.exit(2); }
    op[clave] = valor;
  }
  op.salida = resolve(op.salida);
  op.vistas = op.vista ? String(op.vista).split(",").map((s) => s.trim()).filter(Boolean) : VISTAS_POR_DEFECTO;
  const malas = op.vistas.filter((v) => !VISTAS[v]);
  if (!op.vistas.length || malas.length) { console.error(`--vista admite ${Object.keys(VISTAS).join(", ")} (o varias con comas)`); process.exit(2); }
  return op;
}

/** Las entradas de RUTAS que pide --solo: exactas por nombre o ruta; si no, por subcadena. */
function elegirRutas(solo) {
  if (!solo) return RUTAS;
  const elegidas = new Set();
  for (const t of String(solo).split(",").map((s) => s.trim()).filter(Boolean)) {
    const exactas = RUTAS.filter((r) => r.nombre === t || r.ruta === t);
    (exactas.length ? exactas : RUTAS.filter((r) => r.ruta.includes(t) || r.nombre.includes(t))).forEach((r) => elegidas.add(r));
  }
  return RUTAS.filter((r) => elegidas.has(r));
}

// ── JWT ficticio (cabecera.payload.firma en base64url; nadie verifica la firma) ──
const b64url = (s) => Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function tokenFicticio() {
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const cuerpo = b64url(JSON.stringify({
    id_cliente: CLIENTE.id_cliente, email: CLIENTE.email, nombre: CLIENTE.nombre,
    iat: ahora, exp: ahora + 30 * 86400,
  }));
  return `${cab}.${cuerpo}.${b64url("firma-ficticia-qa")}`;
}

// ── Chrome: arrancar, hablarle por CDP y cerrarlo siempre (forma de videos-redes/motor/render.mjs) ──
const vivos = new Set();

async function conPlazo(promesa, ms, siVence) {
  let reloj;
  const plazo = new Promise((r) => { reloj = setTimeout(() => r(siVence), ms); });
  try { return await Promise.race([promesa, plazo]); } finally { clearTimeout(reloj); }
}

async function apagar(proc) {
  if (proc.exitCode !== null || proc.signalCode !== null) return;
  const fin = new Promise((r) => proc.once("exit", r));
  proc.kill("SIGTERM");
  const salio = await conPlazo(fin.then(() => true), 3000, false);
  if (!salio) { proc.kill("SIGKILL"); await conPlazo(fin, 2000); }
}

function cerrarChrome(nav) {
  if (!nav || !vivos.has(nav)) return Promise.resolve();
  nav.cierre ??= (async () => {
    nav.cdp?.cerrar();
    await apagar(nav.proc);
    for (let i = 0; i < 5; i++) {
      try { rmSync(nav.perfil, { recursive: true, force: true }); break; } catch { await esperar(200); }
    }
    vivos.delete(nav);
  })();
  return nav.cierre;
}

process.on("exit", () => {
  for (const nav of vivos) {
    try { nav.proc.kill("SIGKILL"); } catch {}
    try { rmSync(nav.perfil, { recursive: true, force: true }); } catch {}
  }
});
for (const [senal, codigo] of [["SIGINT", 130], ["SIGTERM", 143]]) {
  process.on(senal, async () => {
    await Promise.all([...vivos].map(cerrarChrome));
    process.exit(codigo);
  });
}

async function conectar(url) {
  const sock = new WebSocket(url);
  await new Promise((res, rej) => {
    sock.onopen = res;
    sock.onerror = () => rej(new Error("no pude conectar con Chrome"));
  });
  let id = 0;
  const pendientes = new Map(), oyentes = new Set();
  const rechazarTodo = (error) => {
    for (const p of pendientes.values()) { clearTimeout(p.reloj); p.rej(error); }
    pendientes.clear();
  };
  sock.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id) {
      const p = pendientes.get(d.id);
      if (!p) return;
      pendientes.delete(d.id);
      clearTimeout(p.reloj);
      d.error ? p.rej(new Error(`${p.metodo}: ${d.error.message}`)) : p.res(d.result);
    } else if (d.method === "Inspector.targetCrashed") {
      rechazarTodo(new Error("la pestaña de Chrome se cayó"));
    } else if (d.method) {
      oyentes.forEach((f) => { try { f(d); } catch (e) { console.error("oyente:", e.message); } });
    }
  };
  sock.onclose = () => rechazarTodo(new Error("Chrome cerró la conexión"));

  const enviar = (metodo, params = {}, ms = 60000) => new Promise((res, rej) => {
    if (sock.readyState !== WebSocket.OPEN) return rej(new Error("Chrome cerró la conexión"));
    const i = ++id;
    const reloj = setTimeout(() => { pendientes.delete(i); rej(new Error(`${metodo}: sin respuesta en ${ms / 1000} s`)); }, ms);
    pendientes.set(i, { res, rej, reloj, metodo });
    sock.send(JSON.stringify({ id: i, method: metodo, params }));
  });
  const escuchar = (f) => { oyentes.add(f); return () => oyentes.delete(f); };
  const evento = (nombre, ms) => new Promise((res, rej) => {
    const f = (d) => { if (d.method === nombre) { oyentes.delete(f); clearTimeout(reloj); res(d.params); } };
    const reloj = setTimeout(() => { oyentes.delete(f); rej(new Error(`${nombre}: no llegó en ${ms / 1000} s`)); }, ms);
    oyentes.add(f);
  });
  return { enviar, evento, escuchar, cerrar: () => { try { sock.close(); } catch {} } };
}

async function lanzarChrome() {
  const perfil = mkdtempSync(join(tmpdir(), "inspira-panel-qa-"));
  const extra = (process.env.CHROME_ARGS || "").split(/\s+/).filter(Boolean);
  const proc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${perfil}`,
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--disable-component-update", "--disable-sync", "--mute-audio",
    "--use-mock-keychain",
    "--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    // Las animaciones de entrada congelan las capturas a medias (ver memoria
    // «Capturas y animaciones»): se pide movimiento reducido desde el arranque.
    "--force-prefers-reduced-motion",
    "--lang=es-PE",
    "--window-size=1280,800",
    ...extra,
    "about:blank",
  ], { stdio: "ignore" });
  const nav = { proc, perfil, cdp: null };
  vivos.add(nav);
  proc.on("error", () => {});
  try {
    let puerto = null;
    for (let i = 0; i < 300 && !puerto; i++) {
      if (proc.exitCode !== null) throw new Error(`Chrome se cerró al arrancar (código ${proc.exitCode})`);
      try {
        const txt = readFileSync(join(perfil, "DevToolsActivePort"), "utf8");
        if (txt.includes("\n")) puerto = Number(txt.split("\n")[0]) || null;
      } catch { /* aún no existe */ }
      if (!puerto) await esperar(50);
    }
    if (!puerto) throw new Error("Chrome no abrió el puerto de depuración");
    let ws = null;
    for (let i = 0; i < 100 && !ws; i++) {
      try {
        const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
        ws = lista.find((t) => t.type === "page")?.webSocketDebuggerUrl ?? null;
      } catch { /* aún arrancando */ }
      if (!ws) await esperar(50);
    }
    if (!ws) throw new Error("Chrome no ofreció ninguna pestaña");
    nav.cdp = await conectar(ws);
    return nav;
  } catch (e) {
    await cerrarChrome(nav);
    throw e;
  }
}

async function evaluar(nav, expresion, ms = 30000) {
  const r = await nav.cdp.enviar("Runtime.evaluate", { expression: expresion, awaitPromise: true, returnByValue: true }, ms);
  if (r.exceptionDetails) throw new Error(`error en la página: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result.value;
}

// ── Intercepción de la API ──────────────────────────────────────────────────
const ESTATICO = /\.(js|mjs|css|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|json|webmanifest|pdf|txt|map|html|xml|mp4|webm)$/i;

function esEstatico(pathname) {
  return pathname === "/" || pathname.startsWith("/assets/") || pathname.startsWith("/panel")
    || pathname.startsWith("/icons/") || pathname.startsWith("/email/") || pathname.startsWith("/guias/")
    || ESTATICO.test(pathname);
}

function instalarInterceptor(nav, fixtures, registro) {
  const { enviar, escuchar } = nav.cdp;
  const enVuelo = new Set();
  escuchar(async (d) => {
    if (d.method !== "Fetch.requestPaused") return;
    const { requestId, request, resourceType } = d.params;
    let url;
    try { url = new URL(request.url); } catch { return enviar("Fetch.continueRequest", { requestId }).catch(() => {}); }
    const ruta = url.pathname;
    // El service worker se registra solo en producción: un 404 lo deja fuera y
    // las peticiones siguen pasando por aquí en vez de por él.
    if (ruta === "/sw.js") {
      return enviar("Fetch.fulfillRequest", { requestId, responseCode: 404, responseHeaders: [{ name: "Content-Type", value: "text/plain" }], body: Buffer.from("no en QA").toString("base64") }).catch(() => {});
    }
    // Una navegación siempre es la SPA, aunque su ruta parezca de la API.
    if (resourceType === "Document" || esEstatico(ruta) || request.method === "OPTIONS") {
      return enviar("Fetch.continueRequest", { requestId }).catch(() => {});
    }
    enVuelo.add(requestId);
    try {
      const r = fixtures.responder(request.method, ruta, url.search);
      if (!r.prevista) registro.sinFixture(`${request.method} ${ruta}${url.search}`);
      const cuerpo = Buffer.from(JSON.stringify(r.cuerpo)).toString("base64");
      await enviar("Fetch.fulfillRequest", {
        requestId,
        responseCode: r.status || 200,
        responseHeaders: [
          { name: "Content-Type", value: "application/json; charset=utf-8" },
          { name: "Cache-Control", value: "no-store" },
          { name: "Access-Control-Allow-Origin", value: "*" },
        ],
        body: cuerpo,
      });
    } catch (e) {
      registro.error(`interceptor ${ruta}: ${e.message}`);
      await enviar("Fetch.continueRequest", { requestId }).catch(() => {});
    } finally {
      enVuelo.delete(requestId);
    }
  });
  return { pendientes: () => enVuelo.size };
}

// ── Consola ─────────────────────────────────────────────────────────────────
function instalarConsola(nav, registro) {
  nav.cdp.escuchar((d) => {
    if (d.method === "Runtime.exceptionThrown") {
      const e = d.params.exceptionDetails;
      registro.consola(`excepción: ${e.exception?.description || e.text}`);
    } else if (d.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(d.params.type)) {
      const texto = d.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
      registro.consola(`console.${d.params.type}: ${texto.slice(0, 400)}`);
    } else if (d.method === "Log.entryAdded" && d.params.entry.level === "error") {
      const e = d.params.entry;
      registro.consola(`${e.source}: ${e.text}${e.url ? ` (${e.url})` : ""}`.slice(0, 400));
    }
  });
}

// ── Espera a que la pantalla esté quieta ────────────────────────────────────
const ESTA_LISTA = `(async () => {
  await document.fonts.ready;
  const esq = document.querySelectorAll('.pnl-esq, .pnl-esqueleto, [aria-busy="true"], .pnl-spinner').length;
  const root = document.getElementById("root");
  return JSON.stringify({ esq, vacio: !root || root.children.length === 0, titulo: document.title });
})()`;

async function esperarQuieta(nav, interceptor, { maxMs = 20000, quietoMs = 700 } = {}) {
  const t0 = Date.now();
  let ultimoCambio = Date.now();
  let anterior = null;
  while (Date.now() - t0 < maxMs) {
    const estado = JSON.parse(await evaluar(nav, ESTA_LISTA));
    const ahoraTexto = JSON.stringify(estado) + "|" + interceptor.pendientes();
    if (ahoraTexto !== anterior) { anterior = ahoraTexto; ultimoCambio = Date.now(); }
    const quieta = estado.esq === 0 && !estado.vacio && interceptor.pendientes() === 0;
    if (quieta && Date.now() - ultimoCambio >= quietoMs) return estado;
    await esperar(120);
  }
  return JSON.parse(await evaluar(nav, ESTA_LISTA));
}

// ── Interacciones dentro de la página ───────────────────────────────────────
// Se manda a la página con toString(): no puede usar nada de fuera.
function enPagina(spec, accion) {
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  const fijo = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (["fixed", "sticky"].includes(getComputedStyle(n).position)) return 1;
    }
    return 0;
  };
  const re = spec.patron ? new RegExp(spec.patron) : null;
  for (const sel of [].concat(spec.selector || "button")) {
    let els = [...document.querySelectorAll(sel)].filter((el) => {
      const t = norm(el.textContent);
      if (spec.texto != null && t !== spec.texto) return false;
      if (spec.contiene != null && !t.includes(spec.contiene)) return false;
      return !re || re.test(t);
    });
    if (spec.visible !== false) els = els.filter(visible);
    if (spec.fijo) els.sort((a, b) => fijo(b) - fijo(a));
    const el = els[spec.indice || 0];
    if (!el) continue;
    if (accion === "clic") {
      el.click();
    } else if (accion === "desplazar") {
      el.scrollIntoView({ block: "start" });
      // Que la barra superior pegajosa no tape lo que se quiere ver.
      const caja = el.closest("main") || document.scrollingElement;
      if (caja) caja.scrollTop = Math.max(0, caja.scrollTop - (spec.margen ?? 88));
    }
    return `${sel} «${norm(el.textContent).slice(0, 48)}»`;
  }
  return null;
}

const describir = (spec) => [].concat(spec.selector || "button").join(" | ")
  + (spec.texto != null ? ` con el texto «${spec.texto}»` : "")
  + (spec.contiene != null ? ` que diga «${spec.contiene}»` : "")
  + (spec.patron ? ` que case con /${spec.patron}/` : "");

function crearPagina(nav, vista) {
  const hacer = async (accion, spec) => {
    const r = await evaluar(nav, `(${enPagina.toString()})(${JSON.stringify(spec)}, ${JSON.stringify(accion)})`);
    if (!r) throw new Error(`no encontré ${describir(spec)}`);
    return r;
  };
  return {
    vista,
    clic: (spec) => hacer("clic", spec),
    desplazar: (spec) => hacer("desplazar", spec),
    evaluar: (expr) => evaluar(nav, expr),
    esperar: (ms) => esperar(ms),
  };
}

// ── Medidas y capturas ──────────────────────────────────────────────────────
// Cuánto contenido hay de verdad: el documento y, si <main> (u otra caja)
// desplaza por dentro, lo que le sobra. El panel usa h-dvh + overflow en <main>.
const ALTO_CONTENIDO = `(() => {
  const h = document.documentElement;
  let alto = Math.max(h.scrollHeight, document.body ? document.body.scrollHeight : 0);
  let extra = 0;
  for (const el of document.querySelectorAll("main, .pnl > *, [class*='overflow-y-auto'], [class*='overflow-auto']")) {
    const cs = getComputedStyle(el);
    if (!/(auto|scroll)/.test(cs.overflowY)) continue;
    const sobra = el.scrollHeight - el.clientHeight;
    if (sobra > extra) extra = sobra;
  }
  return alto + extra;
})()`;

async function fijarVista(nav, vista, altoOverride = null) {
  const m = { ...VISTAS[vista].metrics };
  if (altoOverride) m.height = altoOverride;
  await nav.cdp.enviar("Emulation.setDeviceMetricsOverride", m);
}

async function capturarPng(nav, vista, alto) {
  const { width } = VISTAS[vista].metrics;
  const r = await nav.cdp.enviar("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height: alto, scale: 1 },
    fromSurface: true,
    captureBeyondViewport: true,
  }, 60000);
  return Buffer.from(r.data, "base64");
}

async function irA(nav, url) {
  const carga = nav.cdp.evento("Page.loadEventFired", 30000);
  const r = await nav.cdp.enviar("Page.navigate", { url });
  if (r.errorText) throw new Error(`no pude abrir ${url}: ${r.errorText}`);
  await carga.catch(() => {});
}

async function capturarRuta(nav, interceptor, registro, op, vista, item) {
  const { enviar } = nav.cdp;
  const v = VISTAS[vista];

  // Cada captura parte de cero: fuera de la página, se vacía lo que el sitio
  // guarda en el navegador (la sesión ficticia se vuelve a poner al cargar).
  await irA(nav, "about:blank");
  await enviar("Storage.clearDataForOrigin", {
    origin: new URL(op.base).origin,
    storageTypes: "local_storage,session_storage,indexeddb,cache_storage,service_workers",
  }).catch((e) => registro.consola(`aviso: no pude vaciar el almacenamiento (${e.message})`));

  await fijarVista(nav, vista);
  await enviar("Emulation.setUserAgentOverride", { userAgent: v.ua, acceptLanguage: "es-PE,es;q=0.9", platform: v.plataforma });
  await enviar("Emulation.setTouchEmulationEnabled", { enabled: v.touch, maxTouchPoints: v.touch ? 5 : 1 }).catch(() => {});

  await irA(nav, op.base + item.ruta);
  let estado = await esperarQuieta(nav, interceptor);
  // Un respiro para transiciones que no respetan prefers-reduced-motion.
  await esperar(500);

  if (item.antes) {
    try {
      await item.antes(crearPagina(nav, vista));
    } catch (e) {
      registro.consola(`interacción: ${e.message}`);
    }
    await esperar(400);
    estado = await esperarQuieta(nav, interceptor, { maxMs: 10000 });
  }
  if (estado.esq > 0) registro.consola(`aviso: quedaron ${estado.esq} esqueletos/spinners al capturar`);
  if (estado.vacio) registro.consola("aviso: #root vacío al capturar");

  // 1) El primer viewport (con lo que haya desplazado la interacción).
  const altoVista = v.metrics.height;
  const arriba = await capturarPng(nav, vista, altoVista);
  const base = `${item.nombre}-${vista}`;
  writeFileSync(join(op.salida, `${base}-arriba.png`), arriba);

  // 2) La página entera: se estira el viewport hasta que nada desplace.
  let alto = altoVista;
  for (let i = 0; i < 4 && item.estirar !== false; i++) {
    const necesario = Math.min(ALTO_MAXIMO, Math.ceil(await evaluar(nav, ALTO_CONTENIDO)));
    if (necesario <= alto + 2) break;
    alto = necesario;
    await fijarVista(nav, vista, alto);
    await esperar(250);
  }
  // Volver arriba por si algo desplazó.
  await evaluar(nav, `(() => { window.scrollTo(0,0); document.querySelectorAll("main").forEach((m) => { m.scrollTop = 0; }); return true; })()`);
  await esperar(150);
  const entera = await capturarPng(nav, vista, alto);
  writeFileSync(join(op.salida, `${base}.png`), entera);
  await fijarVista(nav, vista);
  return { arriba: `${base}-arriba.png`, entera: `${base}.png`, alto, ancho: v.metrics.width };
}

// ── Registro de la carpeta (capturas.json) ──────────────────────────────────
// Lo de pasadas anteriores a la misma carpeta se conserva: cada pasada
// sustituye solo las capturas que hace.
function leerRegistro(salida) {
  try {
    const r = JSON.parse(readFileSync(join(salida, "capturas.json"), "utf8"));
    if (r && typeof r.rutas === "object") return r;
  } catch { /* primera pasada */ }
  return { rutas: {} };
}

const ORDEN_VISTAS = ["movil", "tableta", "escritorio"];

function filasDelRegistro(reg) {
  const orden = new Map(RUTAS.map((r, i) => [r.nombre, i]));
  return Object.entries(reg.rutas)
    .sort(([a], [b]) => (orden.get(a) ?? 1e9) - (orden.get(b) ?? 1e9) || a.localeCompare(b))
    .map(([nombre, f]) => ({ nombre, ...f }));
}

function escribirConsola(op, reg) {
  const filas = filasDelRegistro(reg);
  const sinFixture = new Set();
  const lineas = [];
  for (const f of filas) {
    for (const vista of ORDEN_VISTAS) {
      const c = f.vistas?.[vista];
      if (!c) continue;
      (c.sinFixture || []).forEach((t) => sinFixture.add(t));
      for (const n of c.notas || []) lineas.push(`[${f.ruta}${f.sinToken ? " sin token" : ""} · ${f.nombre} · ${vista}] ${n}`);
    }
  }
  const texto = [
    `Capturas del panel · ${new Date().toISOString()} · base ${op.base}`,
    "",
    "== Rutas de API sin fixture (respondidas con {ok:true}) ==",
    ...(sinFixture.size ? [...sinFixture].sort() : ["(ninguna)"]),
    "",
    "== Consola y avisos por ruta ==",
    ...(lineas.length ? lineas : ["(sin errores de consola)"]),
    "",
  ].join("\n");
  writeFileSync(join(op.salida, "consola.txt"), texto);
}

function escribirIndice(op, reg) {
  const filas = filasDelRegistro(reg);
  const vistas = ORDEN_VISTAS.filter((v) => filas.some((f) => f.vistas?.[v]));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const ancho = { movil: "220px", tableta: "300px", escritorio: "minmax(0,1fr)" };
  const tarjeta = (f, cual) => {
    const c = f.vistas?.[cual];
    if (!c) return `<figure><figcaption>${cual}: sin captura</figcaption></figure>`;
    if (c.error) return `<figure><figcaption>${cual}: error · ${esc(c.error)}</figcaption></figure>`;
    return `
      <figure>
        <a href="${c.entera}" target="_blank"><img src="${c.arriba}" alt="${esc(f.nombre)} ${cual}" loading="lazy"></a>
        <figcaption>${cual} · <a href="${c.arriba}" target="_blank">arriba</a> · <a href="${c.entera}" target="_blank">entera (${c.alto} px)</a></figcaption>
      </figure>`;
  };
  const notas = (f) => vistas.flatMap((v) => (f.vistas?.[v]?.notas || []).map((n) => `${v}: ${n}`));
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Panel del asesorado · capturas · ${esc(basename(op.salida))}</title>
<style>
  body{font:14px/1.4 -apple-system,Segoe UI,sans-serif;margin:24px;background:#f3f5f7;color:#013446}
  h1{font-size:20px;margin:0 0 4px} p.meta{margin:0 0 20px;color:#555}
  section{background:#fff;border:1px solid #dfe5ea;border-radius:12px;padding:14px 16px;margin-bottom:18px}
  section h2{font-size:15px;margin:0 0 10px;font-family:ui-monospace,Menlo,monospace}
  section h2 small{font-weight:400;color:#555}
  .fila{display:grid;grid-template-columns:${vistas.map((v) => ancho[v]).join(" ")};gap:18px;align-items:start}
  figure{margin:0} img{display:block;width:100%;border:1px solid #cfd8de;border-radius:8px;background:#fff}
  figcaption{margin-top:6px;color:#444;font-size:12px}
  pre{white-space:pre-wrap;background:#f7f9fa;border:1px solid #e3e8ec;border-radius:8px;padding:10px;font-size:12px}
</style></head><body>
<h1>Panel del asesorado · capturas</h1>
<p class="meta">Clienta ficticia ${esc(CLIENTE.nombre)} · ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })} · base ${esc(op.base)} · ${esc(op.salida)}</p>
${filas.map((f) => `<section><h2>${esc(f.nombre)} <small>${esc(f.ruta)}${f.sinToken ? " (sin sesión)" : ""}${f.escenario ? ` · escenario ${esc(f.escenario)}` : ""}${f.interaccion ? " · con interacción" : ""}</small></h2><div class="fila">${vistas.map((v) => tarjeta(f, v)).join("")}</div>${notas(f).length ? `<pre>${esc(notas(f).join("\n"))}</pre>` : ""}</section>`).join("\n")}
</body></html>`;
  writeFileSync(join(op.salida, "indice.html"), html);
}

// ── Principal ───────────────────────────────────────────────────────────────
async function main() {
  const op = leerArgumentos(process.argv.slice(2));
  if (!CHROME) { console.error("No encuentro Google Chrome (o define NAVEGADOR=/ruta/al/binario)."); process.exit(2); }
  const rutas = elegirRutas(op.solo);
  if (!rutas.length) { console.error(`--solo ${op.solo}: ninguna ruta coincide. Nombres: ${RUTAS.map((r) => r.nombre).join(", ")}`); process.exit(2); }
  const tareas = op.vistas.flatMap((vista) => rutas.filter((r) => !r.vistas || r.vistas.includes(vista)).map((r) => ({ vista, fila: r })));
  if (!tareas.length) { console.error(`Ninguna de esas rutas se captura en ${op.vistas.join(", ")}.`); process.exit(2); }
  mkdirSync(op.salida, { recursive: true });

  // ¿Está sirviendo el preview?
  try {
    const r = await fetch(op.base + "/", { redirect: "manual" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    console.error(`No responde ${op.base}: arranca antes «bun x vite preview --outDir dist-qa --port 4173 --strictPort» (${e.message})`);
    process.exit(1);
  }

  const fixtures = crearFixtures();
  let porCaptura = null; // notas y rutas sin fixture de la captura en curso
  const registro = {
    consola: (t) => porCaptura?.notas.push(t),
    sinFixture: (t) => { porCaptura?.notas.push(`sin fixture → {ok:true}: ${t}`); porCaptura?.sinFixture.add(t); },
    error: (t) => porCaptura?.notas.push(`ERROR ${t}`),
  };
  const reg = leerRegistro(op.salida);

  const nav = await lanzarChrome();
  try {
    const { enviar } = nav.cdp;
    await enviar("Page.enable");
    await enviar("Runtime.enable");
    await enviar("Log.enable").catch(() => {});
    await enviar("Network.enable");
    await enviar("Network.setBypassServiceWorker", { bypass: true }).catch(() => {});
    await enviar("Emulation.setTimezoneOverride", { timezoneId: "America/Lima" }).catch(() => {});
    await enviar("Emulation.setLocaleOverride", { locale: "es-PE" }).catch(() => {});
    await enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }, { name: "prefers-color-scheme", value: "light" }] }).catch(() => {});
    await enviar("Fetch.enable", { patterns: [{ urlPattern: `${op.base}/*`, requestStage: "Request" }] });
    const interceptor = instalarInterceptor(nav, fixtures, registro);
    instalarConsola(nav, registro);

    const token = tokenFicticio();
    const usuario = JSON.stringify({ id_cliente: CLIENTE.id_cliente, nombre: CLIENTE.nombre, email: CLIENTE.email });
    // Solo en el sitio del panel: about:blank (entre capturas) no tiene almacenamiento.
    const enElSitio = `location.origin === ${JSON.stringify(new URL(op.base).origin)}`;
    const SESION = `if (${enElSitio}) try {
      localStorage.setItem("token", ${JSON.stringify(token)});
      localStorage.setItem("user", ${JSON.stringify(usuario)});
      localStorage.setItem("inspira:instalar:pospuesto", new Date().toISOString());
      localStorage.setItem("inspira_consent", JSON.stringify({ categorias: { necesarias: true, preferencias: false, analitica: false, marketing: false }, fecha: new Date().toISOString(), version: "1.0", via: "rechazar_todo" }));
    } catch (e) {}`;
    const SIN_SESION = `if (${enElSitio}) try { localStorage.removeItem("token"); localStorage.removeItem("user"); localStorage.setItem("inspira_consent", JSON.stringify({ categorias: { necesarias: true }, fecha: new Date().toISOString(), version: "1.0", via: "rechazar_todo" })); } catch (e) {}`;

    let guion = null;
    const conSesion = async (si) => {
      if (guion) await enviar("Page.removeScriptToEvaluateOnNewDocument", { identifier: guion.identifier }).catch(() => {});
      guion = await enviar("Page.addScriptToEvaluateOnNewDocument", { source: si ? SESION : SIN_SESION });
    };

    const t0 = performance.now();
    let fallos = 0;
    for (const { vista, fila } of tareas) {
      const etiqueta = `${fila.nombre} · ${vista}`;
      porCaptura = { notas: [], sinFixture: new Set() };
      await conSesion(!fila.sinToken);
      fixtures.usarEscenario(fila.escenario || null);
      let res = null;
      try {
        res = await capturarRuta(nav, interceptor, registro, op, vista, fila);
        console.log(`  ${etiqueta} → ${res.entera} (${res.alto} px)`);
      } catch (e) {
        fallos += 1;
        registro.error(e.message);
        console.error(`  ${etiqueta}: ${e.message}`);
      }
      const entrada = (reg.rutas[fila.nombre] ??= { vistas: {} });
      Object.assign(entrada, { ruta: fila.ruta, sinToken: Boolean(fila.sinToken), escenario: fila.escenario || null, interaccion: Boolean(fila.antes) });
      entrada.vistas ??= {};
      entrada.vistas[vista] = {
        ...(res || { error: porCaptura.notas.at(-1) || "sin captura" }),
        notas: porCaptura.notas,
        sinFixture: [...porCaptura.sinFixture],
        fecha: new Date().toISOString(),
      };
    }
    porCaptura = null;
    fixtures.usarEscenario(null);
    writeFileSync(join(op.salida, "capturas.json"), JSON.stringify(reg, null, 1));
    escribirConsola(op, reg);
    escribirIndice(op, reg);
    console.log(`Listo en ${((performance.now() - t0) / 1000).toFixed(1)} s: ${tareas.length - fallos}/${tareas.length} capturas → ${op.salida}/indice.html`);
    if (fallos) process.exitCode = 1;
  } finally {
    await cerrarChrome(nav);
  }
}

main().catch(async (e) => {
  console.error(`Error: ${e.message}`);
  process.exitCode = 1;
  await Promise.all([...vivos].map(cerrarChrome));
});
