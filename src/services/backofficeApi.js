// src/services/backofficeApi.js
const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/* === Token almacenado en BackOffice === */
function getToken() {
  return localStorage.getItem("bo_token");
}

/* === Headers comunes con Auth === */
function baseHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* === Logout automático si el token expira === */
function handleUnauthorized() {
  localStorage.removeItem("bo_token");
  window.location.href = "/backoffice/login";
}

/* === Helper central: detecta 401 y parsea JSON con seguridad === */
async function makeRequest(method, path, body, extraHeaders = {}) {
  const isJson = body !== undefined && !(body instanceof FormData);
  const headers = {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...baseHeaders(),
    ...extraHeaders,
  };

  const r = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isJson ? JSON.stringify(body) : body,
  });

  if (r.status === 401) {
    handleUnauthorized();
    return {};
  }

  try {
    return await r.json();
  } catch {
    return {};
  }
}

/* ====================================================================== */
/* =========================  MÉTODOS HTTP  ============================= */
/* ====================================================================== */

export function boGET(path) {
  return makeRequest("GET", path);
}

export function boPOST(path, body = {}) {
  return makeRequest("POST", path, body);
}

export function boPATCH(path, body = {}) {
  return makeRequest("PATCH", path, body);
}

export function boPUT(path, body = {}) {
  return makeRequest("PUT", path, body);
}

export function boDELETE(path) {
  return makeRequest("DELETE", path);
}

// Para subir archivos (sin Content-Type manual — el browser lo pone con boundary)
export async function boUpload(path, file) {
  const formData = new FormData();
  formData.append("archivo", file);
  return makeRequest("POST", path, formData);
}

// Para respuestas que NO son JSON (PDFs, streams, blobs)
export async function boFetch(path, options = {}) {
  const r = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...baseHeaders(), ...(options.headers || {}) },
  });
  if (r.status === 401) {
    handleUnauthorized();
    return null;
  }
  return r;
}


