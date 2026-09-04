// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* === Logout automático si el token del panel expira ===
   Solo tiene sentido cuando el usuario venía con sesión: un 401 en una página
   pública (Libro de Reclamaciones, formulario de derechos ARCO) no es una
   sesión caducada, y expulsar a la home hacía que el consumidor perdiera el
   formulario que estaba rellenando sin explicación alguna. */
function handleUnauthorized() {
  if (!localStorage.getItem("token")) return false; // no había sesión que cerrar
  localStorage.removeItem("token");
  // Se guarda dónde estaba: al volver a entrar aterriza en el mismo sitio, no
  // en la portada. Y se deja una marca para explicárselo, que sin ella el
  // asesorado veía la portada de golpe y pensaba que la web se había roto.
  try {
    const aqui = window.location.pathname + window.location.search + window.location.hash;
    localStorage.setItem("post_login_redirect", aqui.startsWith("/") ? aqui : "/panel");
    sessionStorage.setItem("inspira:sesion-caducada", "1");
  } catch { /* sin almacenamiento, sin memoria: se sigue igual */ }
  window.location.href = "/";
  return true;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/* === Helper central: detecta 401 y parsea JSON con seguridad === */
async function makeRequest(method, url, body, extraHeaders = {}) {
  const isJson = body !== undefined && !(body instanceof FormData);
  const r = await fetch(API_URL + url, {
    method,
    headers: {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...extraHeaders,
    },
    body: isJson ? JSON.stringify(body) : body,
    cache: "no-store",
  });

  // Si había sesión, `handleUnauthorized` ya redirige y no hay nada más que
  // hacer. Si no la había (página pública), se sigue el flujo normal para que
  // la vista pueda mostrar el mensaje real que devolvió el servidor.
  if (r.status === 401 && handleUnauthorized()) return {};

  const data = await parseJsonSafe(r);

  // si la API no envía `ok`, lo inferimos de response.ok
  if (typeof data.ok === "undefined") {
    data.ok = r.ok;
  }

  return data;
}

export function apiGET(url) {
  return makeRequest("GET", url);
}

export function apiPOST(url, body) {
  return makeRequest("POST", url, body);
}

export function apiPATCH(url, body) {
  return makeRequest("PATCH", url, body);
}

export function apiPUT(url, body) {
  return makeRequest("PUT", url, body);
}

export async function apiUpload(path, formData) {
  const r = await fetch(API_URL + path, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
    cache: "no-store",
  });

  // Si había sesión, `handleUnauthorized` ya redirige y no hay nada más que
  // hacer. Si no la había (página pública), se sigue el flujo normal para que
  // la vista pueda mostrar el mensaje real que devolvió el servidor.
  if (r.status === 401 && handleUnauthorized()) return {};

  let data = {};
  try {
    data = await r.json();
  } catch {
    // backend puede devolver vacío
  }

  if (!r.ok || data.ok === false) {
    throw new Error(data.msg || data.message || "Error al subir archivo");
  }

  return data;
}

export async function apiDELETE(url) {
  const r = await fetch(API_URL + url, {
    method: "DELETE",
    headers: { ...authHeaders() },
    cache: "no-store",
  });

  // Si había sesión, `handleUnauthorized` ya redirige y no hay nada más que
  // hacer. Si no la había (página pública), se sigue el flujo normal para que
  // la vista pueda mostrar el mensaje real que devolvió el servidor.
  if (r.status === 401 && handleUnauthorized()) return {};

  const data = await parseJsonSafe(r);
  if (!r.ok || data.ok === false) {
    throw new Error(data.msg || data.message || "Error al eliminar");
  }
  return data;
}
