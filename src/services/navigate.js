/**
 * Cambia de página sin recargar.
 *
 * `replace` sustituye la entrada actual del historial en vez de añadir una:
 * es lo que toca cuando se corrige una URL que no lleva a nada, para que
 * «atrás» no devuelva al usuario a la misma ruta rota.
 */
export function navigate(href, { replace = false } = {}) {
  if (replace) window.history.replaceState({}, "", href);
  else window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
