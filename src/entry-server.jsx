// src/entry-server.jsx
//
// Entrada del prerender (scripts/prerender.mjs, 09/10/2026). Vite la compila
// para Node (`build.ssr`) y el script pinta con ella cada página pública
// principal dentro de su HTML. No llega nunca al navegador.
//
// Pinta exactamente el mismo árbol que main.jsx (Raiz.jsx), con la ruta dada
// en vez de window.location. `prerender` de react-dom/static espera a las
// páginas diferidas (lazy) y a sus Suspense antes de devolver el HTML, que es
// lo que hace falta aquí: renderToString se quedaría con el hueco de carga.
import { prerender } from "react-dom/static";
import Raiz from "./Raiz.jsx";
import { diaLocal, fijarDiaDelPrerender } from "./lib/hidratacion";

/**
 * @param {string} ruta  "/servicios/master"
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{ html: string, dia: string, errores: string[] }>}
 *   `errores`: lo que falló dentro de algún Suspense. React lo deja para el
 *   navegador (pinta el hueco), así que una página con errores no se usa.
 */
export async function renderizar(ruta, { signal } = {}) {
  // El día con el que se pinta lo que depende de la fecha (año del pie,
  // promoción). Viaja en <html data-prerender-dia> para que la hidratación
  // use el mismo (lib/hidratacion.js).
  const dia = diaLocal();
  fijarDiaDelPrerender(dia);

  const errores = [];
  const { prelude } = await prerender(<Raiz ruta={ruta} prerenderizada />, {
    signal,
    // Sin límite: con el de serie (12,5 KB), React saca las páginas grandes
    // fuera de su sitio y las coloca con un <script> en línea ($RC), que la
    // CSP del sitio bloquea. Así cada página va entera y en su orden.
    progressiveChunkSize: Number.MAX_SAFE_INTEGER,
    onError(error) {
      errores.push(String(error?.stack || error));
    },
  });
  const html = await new Response(prelude).text();
  return { html, dia, errores };
}
