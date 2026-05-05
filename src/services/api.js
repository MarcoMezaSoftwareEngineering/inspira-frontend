// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* === Logout automático si el token del panel expira === */
function handleUnauthorized() {
  localStorage.removeItem("token");
  window.location.href = "/";
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

  if (r.status === 401) {
    handleUnauthorized();
    return {};
  }

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

export async function apiUpload(path, formData) {
  const r = await fetch(API_URL + path, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
    cache: "no-store",
  });

  if (r.status === 401) {
    handleUnauthorized();
    return {};
  }

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

  if (r.status === 401) {
    handleUnauthorized();
    return {};
  }

  const data = await parseJsonSafe(r);
  if (!r.ok || data.ok === false) {
    throw new Error(data.msg || data.message || "Error al eliminar");
  }
  return data;
}
