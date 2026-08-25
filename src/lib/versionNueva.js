// Qué hacer cuando la aplicación se actualizó bajo los pies del usuario.
//
// La aplicación se sirve partida en trozos que se descargan solo cuando hacen
// falta. Si alguien tenía la pestaña abierta cuando desplegamos, esos trozos
// pueden haber cambiado de nombre, y al pulsar algo el navegador pide un
// archivo que ya no está. El usuario ve un error técnico incomprensible
// después de haber hecho algo perfectamente normal.
//
// El despliegue conserva los archivos de la versión anterior una semana, así
// que esto casi nunca debería saltar. Es la red por debajo: para la pestaña
// que llevaba más tiempo abierta, o para un despliegue en el que los archivos
// viejos ya no estaban.

const MARCA = "inspira:recargado-por-version";

/** ¿Este fallo es "la aplicación cambió" y no un problema de verdad? */
export function esVersionCaducada(error) {
  const m = String(error?.message || error || "");
  return (
    m.includes("Failed to fetch dynamically imported module") ||
    m.includes("error loading dynamically imported module") ||
    m.includes("Importing a module script failed")
  );
}

/**
 * Recarga la página una sola vez.
 *
 * El "una sola vez" no es un detalle: si el fallo no fuera por la versión, un
 * recargado automático dejaría al usuario en un bucle infinito sin poder ni
 * leer el error. La marca vive en sessionStorage, así que se olvida al cerrar
 * la pestaña y un intento posterior legítimo vuelve a poder recargar.
 */
export function recargarUnaVez() {
  try {
    if (sessionStorage.getItem(MARCA)) return false;
    sessionStorage.setItem(MARCA, "1");
  } catch {
    // Navegador con el almacenamiento bloqueado: mejor no recargar que
    // arriesgar el bucle.
    return false;
  }
  window.location.reload();
  return true;
}

/** Se llama al arrancar: limpia la marca si la carga fue bien. */
export function marcarArranqueCorrecto() {
  try { sessionStorage.removeItem(MARCA); } catch { /* da igual */ }
}

/**
 * Vite avisa con este evento cuando no puede traer un trozo de la aplicación.
 * Es la señal más fiable que tenemos de que hay una versión nueva publicada.
 */
export function vigilarVersionNueva() {
  window.addEventListener("vite:preloadError", (e) => {
    // Se evita que Vite lance el error sin más: primero intentamos recargar.
    e.preventDefault?.();
    if (!recargarUnaVez()) {
      console.warn("[version] no se pudo recargar automáticamente", e.payload);
    }
  });
}
