// src/services/archivos.js
//
// Abrir un archivo del expediente.
//
// No se puede hacer con un `<a href>` y ya está, que es como estaba y por eso
// salía la página de "404 · Página no encontrada":
//
//   1. La ruta era relativa, así que apuntaba a www.inspira-legal.cloud en vez
//      de a api.inspira-legal.cloud. nginx sirve la aplicación para cualquier
//      ruta que no reconoce, el enrutador no encontraba nada y pintaba su 404.
//   2. Llevaba un `/api` de más: el backend monta estas rutas en `/backoffice`
//      y en `/solicitudes`, sin prefijo.
//   3. Y lo de fondo: estos endpoints exigen `Authorization: Bearer`, y una
//      etiqueta <a> no puede mandar cabeceras. Aunque el dominio y la ruta
//      hubieran estado bien, habría contestado 401.
//
// Así que hay que pedirlo con fetch, con el token, y abrir el resultado.

import { dialog } from "./dialogService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Los tres argumentos que comparten las tres funciones:
 *
 * @param {string}  ruta      ruta del backend ya montada, p. ej.
 *                            "/backoffice/solicitudes/12/estancia/documentos/archivo/34"
 * @param {boolean} opciones.interno  true = usuario del backoffice (bo_token),
 *                                    false = asesorado en su panel (token)
 * @param {string}  opciones.nombre   con qué nombre guardarlo en el disco
 */

/** El archivo en bruto, para que lo pinte el visor. */
export async function pedirArchivo(ruta, { interno = false } = {}) {
  const token = localStorage.getItem(interno ? "bo_token" : "token");
  if (!token) return { error: "Tu sesión ha caducado, vuelve a entrar" };
  try {
    const r = await fetch(`${API_URL}${ruta}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      return {
        error:
          r.status === 401 || r.status === 403 ? "No tienes acceso a ese archivo"
          : r.status === 404 ? "Ese archivo ya no está"
          : "No se pudo cargar el archivo",
      };
    }
    return { blob: await r.blob() };
  } catch {
    return { error: "Error al cargar el archivo" };
  }
}

/** Descargarlo al disco, con su nombre. */
export async function descargarArchivo(ruta, { interno = false, nombre } = {}) {
  const { blob, error } = await pedirArchivo(ruta, { interno });
  if (error) { dialog.toast(error, "error"); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre || "documento";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Abrirlo en una pestaña: para un PDF, eso es verlo. */
export async function abrirArchivo(ruta, { interno = false, nombre } = {}) {
  const token = localStorage.getItem(interno ? "bo_token" : "token");
  if (!token) {
    dialog.toast("Tu sesión ha caducado, vuelve a entrar", "error");
    return;
  }

  // Dos cosas, y las dos importan:
  //
  // La pestaña se abre AHORA, no después del await: si se abriera al terminar
  // la descarga, el navegador lo trataría como una ventana emergente no pedida
  // por la persona y la bloquearía.
  //
  // Y va SIN "noopener". Con esa opción, `window.open` devuelve null por
  // especificación —quien abre no puede conservar referencia a la ventana—, así
  // que no había forma de mandarla a ningún sitio después. La referencia hace
  // falta, y el aislamiento se consigue anulando `opener` a mano.
  const ventana = window.open("", "_blank");
  if (ventana) { try { ventana.opener = null; } catch { /* da igual */ } }

  try {
    const r = await fetch(`${API_URL}${ruta}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) {
      ventana?.close();
      dialog.toast(
        r.status === 401 || r.status === 403
          ? "No tienes acceso a ese archivo"
          : r.status === 404
            ? "Ese archivo ya no está"
            : "No se pudo abrir el archivo",
        "error"
      );
      return;
    }

    const blob = await r.blob();
    const url = URL.createObjectURL(blob);

    if (ventana) {
      ventana.location = url;
    } else {
      // Emergentes bloqueadas: al menos que se lo pueda descargar.
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre || "documento";
      a.click();
    }

    // Sin la espera, se revoca antes de que la pestaña recién abierta llegue a
    // leerlo y sale en blanco.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    ventana?.close();
    dialog.toast("Error al abrir el archivo", "error");
  }
}
