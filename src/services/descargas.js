// src/services/descargas.js
//
// Descarga de archivos que viven detrás de un endpoint autenticado.
//
// Un `<a href="/portales/justificantes/1/descargar">` no sirve para esto por
// dos motivos, y ambos se estaban dando a la vez en el panel del cliente:
//
//   1. La ruta es relativa, así que apunta al dominio del frontend
//      (inspira-legal.cloud) y no a la API (api.inspira-legal.cloud): el enlace
//      caía en el router de la SPA y no descargaba nada.
//   2. El navegador no manda la cabecera Authorization al seguir un enlace, y
//      esos endpoints exigen token.
//
// La solución es pedir el archivo con fetch, llevando el token, y entregar el
// blob resultante al navegador.

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

// Misma clave que usa services/api.js para el panel del cliente.
function tokenPorDefecto() {
  return localStorage.getItem("token");
}

/**
 * Pide un archivo protegido y lo entrega al navegador.
 *
 * @param {string}  ruta                 ruta del endpoint, empezando por "/"
 * @param {object}  [opciones]
 * @param {string}  [opciones.nombre]    nombre de descarga; si se omite, se abre en una pestaña
 * @param {string}  [opciones.token]     token a usar (por defecto, el del panel del cliente)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function descargarArchivoProtegido(ruta, { nombre, token } = {}) {
  const jwt = token ?? tokenPorDefecto();
  if (!jwt) return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };

  let url = null;
  try {
    const r = await fetch(API_URL + ruta, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });

    if (r.status === 401) return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
    if (r.status === 403) return { ok: false, error: "Este documento no está disponible para ti." };
    if (r.status === 404) return { ok: false, error: "El documento ya no está disponible." };
    if (!r.ok) return { ok: false, error: "No se pudo abrir el documento." };

    const blob = await r.blob();
    url = URL.createObjectURL(blob);

    if (nombre) {
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(url, "_blank", "noopener");
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo abrir el documento." };
  } finally {
    // Se revoca con retraso: si se revoca de inmediato, la pestaña recién
    // abierta puede quedarse sin el blob antes de haberlo leído.
    if (url) setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
