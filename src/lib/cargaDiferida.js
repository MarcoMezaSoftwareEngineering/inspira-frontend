// Cargar una pantalla que viene en su propio archivo, sobreviviendo a un
// despliegue.
//
// Vite parte la aplicación en trozos con un hash en el nombre. Al desplegar,
// los archivos viejos desaparecen del servidor. Quien tenía la aplicación
// abierta —y en el móvil instalado la gente la deja abierta días— sigue con
// el índice antiguo: al entrar en una pantalla que aún no había cargado, pide
// un archivo que ya no existe, la importación falla y React desmonta el árbol.
// Eso es la pantalla en blanco que vio Carina en el Informe el 08/09/2026.
//
// Aquí se reintenta una vez (por si fue la red) y, si vuelve a fallar, se
// recarga la página: el índice nuevo trae los nombres nuevos y la pantalla
// abre a la primera. La recarga se hace una sola vez por sesión para no
// entrar en un bucle si el fallo es de otra cosa.
import { lazy } from "react";

const MARCA = "inspira:recarga-por-version";

function yaSeRecargo() {
  try { return sessionStorage.getItem(MARCA) === "1"; } catch { return false; }
}

function anotarRecarga() {
  try { sessionStorage.setItem(MARCA, "1"); } catch { /* modo privado: da igual */ }
}

/** Como `lazy`, pero si el trozo ya no está en el servidor recarga la página. */
export function lazyConRecarga(importar) {
  return lazy(() =>
    importar().catch(() =>
      // Un segundo intento: puede haber sido un corte de red.
      importar().catch((err) => {
        if (!yaSeRecargo()) {
          anotarRecarga();
          window.location.reload();
          // Devuelve algo mientras el navegador recarga, para no romper React.
          return { default: () => null };
        }
        throw err;
      })
    )
  );
}

/** Al volver de una recarga por versión, se limpia la marca. */
export function limpiarMarcaRecarga() {
  try { sessionStorage.removeItem(MARCA); } catch { /* nada */ }
}
