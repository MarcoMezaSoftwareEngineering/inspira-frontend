// La sesión del asesorado, en un solo sitio.
//
// Hasta el 17/09/2026 la sesión era un token en localStorage que nadie miraba
// hasta que una petición fallaba: al caducar, el primer clic expulsaba a la
// portada y se perdía lo que se estuviera escribiendo; cerrar sesión en una
// pestaña dejaba las demás enseñando datos privados; y un token seguía
// sirviendo aunque se hubiera cerrado la sesión.
//
// Ahora:
//   · Se lee la caducidad del propio token y se avisa en el momento justo,
//     sin esperar a un 401.
//   · La sesión se renueva sola mientras se usa (ventana deslizante): quien
//     entra a diario no vuelve a ver Google; quien lleva siete días sin
//     entrar, sí.
//   · Las pestañas se enteran unas de otras (BroadcastChannel y, de
//     respaldo, el evento `storage`).
//   · Un 401 dentro del panel no redirige: se avisa encima de la pantalla y
//     lo escrito sigue ahí hasta volver a entrar.
//
// El servidor es quien manda (revoca tokens al cerrar sesión, al desactivar
// una cuenta o al pedir «cerrar en todos los dispositivos»). Esto solo evita
// que el asesorado se entere tarde y mal.

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const CLAVE = "token";
const EVENTO = "inspira:sesion";
// Se renueva cuando el token tiene más de esto: una vez al día como mucho.
const RENOVAR_TRAS_MS = 12 * 3600 * 1000;

let canal = null;
try { canal = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("inspira-sesion") : null; } catch { canal = null; }

export function leerToken() {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
}

/** Lo que dice el token de sí mismo. No verifica la firma: eso es del servidor. */
export function datosToken(token = leerToken()) {
  if (!token) return null;
  try {
    const parte = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(decodeURIComponent(escape(atob(parte))));
    return {
      id: json.id_cliente ?? null,
      exp: json.exp ? json.exp * 1000 : null,
      iat: json.iat ? json.iat * 1000 : null,
    };
  } catch {
    return null;
  }
}

export function caducado(token = leerToken()) {
  const d = datosToken(token);
  return !d || (d.exp != null && d.exp <= Date.now());
}

function anunciar(tipo) {
  try { canal?.postMessage({ tipo, t: Date.now() }); } catch { /* sin canal */ }
}

export function guardarToken(token) {
  try { localStorage.setItem(CLAVE, token); } catch { /* sin almacenamiento */ }
  anunciar("entrada");
}

/** Borra la sesión de este navegador y lo cuenta a las demás pestañas. */
export function borrarSesionLocal({ avisarPestanas = true } = {}) {
  try {
    localStorage.removeItem(CLAVE);
    localStorage.removeItem("user");
    localStorage.removeItem("last_pre_reserva_id");
  } catch { /* noop */ }
  if (avisarPestanas) anunciar("salida");
}

/**
 * La sesión terminó mientras se usaba. Dentro del panel lo pinta
 * `AvisoSesion`; fuera no hay nadie escuchando y quien llama decide.
 * @param motivo caducada | cerrada | inactiva | otra-cuenta | invalida
 */
export function avisarFinDeSesion(motivo = "caducada") {
  try {
    const aqui = window.location.pathname + window.location.search + window.location.hash;
    if (aqui.startsWith("/")) localStorage.setItem("post_login_redirect", aqui);
  } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { motivo } }));
}

export function alTerminarSesion(fn) {
  const h = (e) => fn(e.detail?.motivo || "caducada");
  window.addEventListener(EVENTO, h);
  return () => window.removeEventListener(EVENTO, h);
}

/** Pide un token nuevo si el actual ya tiene sus horas. Silencioso. */
let renovando = null;
export async function renovarSiToca({ forzar = false } = {}) {
  const token = leerToken();
  const d = datosToken(token);
  if (!token || !d || caducado(token)) return false;
  if (!forzar && d.iat && Date.now() - d.iat < RENOVAR_TRAS_MS) return false;
  if (renovando) return renovando;
  renovando = (async () => {
    try {
      const r = await fetch(`${API_URL}/auth/renovar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (r.status === 401) {
        const cuerpo = await r.json().catch(() => ({}));
        // Solo si sigue siendo el mismo token: otra pestaña pudo renovarlo ya.
        if (leerToken() === token) {
          borrarSesionLocal();
          avisarFinDeSesion(cuerpo.motivo || "caducada");
        }
        return false;
      }
      const data = await r.json().catch(() => null);
      // Un servidor sin /auth/renovar todavía (404) no es un fallo de sesión.
      if (data?.ok && data.token && leerToken() === token) {
        guardarToken(data.token);
        return true;
      }
      return false;
    } catch {
      return false; // sin red: ya se intentará al volver
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

/**
 * Vigila la sesión mientras el panel está abierto.
 * @param onFin (motivo) => void — la sesión terminó
 * @returns función para dejar de vigilar
 */
export function vigilarSesion(onFin) {
  let temporizador = 0;
  const idInicial = datosToken()?.id ?? null;

  const programar = () => {
    clearTimeout(temporizador);
    const d = datosToken();
    if (!d?.exp) return;
    // setTimeout no admite más de ~24,8 días; con 7 días sobra, pero se acota.
    const falta = Math.min(d.exp - Date.now(), 2 ** 31 - 1);
    if (falta <= 0) { borrarSesionLocal(); onFin("caducada"); return; }
    temporizador = setTimeout(() => { borrarSesionLocal(); onFin("caducada"); }, falta);
  };

  const revisar = () => {
    const token = leerToken();
    if (!token) { onFin("cerrada"); return; }
    const d = datosToken(token);
    if (idInicial != null && d?.id != null && d.id !== idInicial) { onFin("otra-cuenta"); return; }
    if (caducado(token)) { borrarSesionLocal(); onFin("caducada"); return; }
    programar();
  };

  // Otra pestaña entró, salió o renovó.
  const alMensaje = (e) => {
    const tipo = e?.data?.tipo;
    if (tipo === "salida" || tipo === "entrada") revisar();
  };
  const alStorage = (e) => { if (e.key === CLAVE || e.key === null) revisar(); };
  // Volver a la app tras horas en segundo plano: los temporizadores del
  // móvil se congelan, así que se comprueba a mano y se renueva si toca.
  const alVolver = () => {
    if (document.visibilityState !== "visible") return;
    revisar();
    renovarSiToca();
  };

  canal?.addEventListener("message", alMensaje);
  window.addEventListener("storage", alStorage);
  document.addEventListener("visibilitychange", alVolver);
  window.addEventListener("pageshow", alVolver);

  revisar();
  renovarSiToca();

  return () => {
    clearTimeout(temporizador);
    canal?.removeEventListener("message", alMensaje);
    window.removeEventListener("storage", alStorage);
    document.removeEventListener("visibilitychange", alVolver);
    window.removeEventListener("pageshow", alVolver);
  };
}

/** Cierra la sesión en el servidor (y, si se pide, en todos sus dispositivos). */
export async function cerrarSesionServidor({ todos = false } = {}) {
  const token = leerToken();
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ todos }),
      keepalive: true,
    });
  } catch { /* aunque falle, se limpia este navegador */ }
}

/** Para los `fetch` directos que no pasan por api.js. */
// Solo en el panel: hay componentes compartidos con Inspira Core, y un 401
// del token del asesor no puede cerrar la sesión de cliente del mismo
// navegador (quien prueba las dos cosas a la vez).
export async function comprobarRespuesta(r) {
  if (r?.status !== 401 || !leerToken()) return false;
  if (!window.location.pathname.startsWith("/panel")) return false;
  const cuerpo = await r.clone().json().catch(() => ({}));
  borrarSesionLocal();
  avisarFinDeSesion(cuerpo.motivo || "caducada");
  return true;
}
