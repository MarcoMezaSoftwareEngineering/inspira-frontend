// src/services/backofficeApi.js
import { dialog } from "./dialogService";
import { copiar, olvidar, precargar, recordar, tomarPrecarga } from "./memoria";

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
  olvidarPeticiones();
  localStorage.removeItem("bo_token");
  window.location.href = "/backoffice/login";
}

/* ====================================================================== */
/* ====================  MEMORIA DE LECTURAS (09/10/2026)  =============== */
/* ====================================================================== */
//
// Antes cada pantalla pedía lo suyo aunque la de al lado acabara de pedir lo
// mismo: el equipo, las universidades o la sesión salían del servidor una y
// otra vez al moverse por Core. Ahora:
//
//  · Dos GET iguales a la vez comparten la misma petición (siempre).
//  · Lo de RECORDAR, que cambia poco y piden varias pantallas, se recuerda un
//    rato (ver services/memoria.js).
//  · Cualquier escritura (POST, PATCH, PUT, DELETE) olvida todo lo recordado,
//    antes de salir y al volver: la pantalla que se recarga tras guardar ve
//    lo recién guardado, nunca la copia de antes. También en las demás
//    pestañas de Core abiertas en este navegador.
//
// La memoria es por sesión: la clave lleva el final del token, así que otra
// cuenta en la misma pestaña nunca ve lo de la anterior.
const RECORDAR = [
  // Quién puede llevar un servicio (Clientes, ficha, correo).
  [/^\/backoffice\/solicitudes\/equipo$/, 5 * 60 * 1000],
  // El equipo interno (agenda, asignaciones).
  [/^\/backoffice\/usuarios-internos(\?|$)/, 5 * 60 * 1000],
  // La ficha de universidades (buscador, herramientas, sistematizador y la
  // propia lista). Lleva el estado de la vigilancia de cada web: dos minutos.
  [/^\/backoffice\/universidades$/, 2 * 60 * 1000],
  // La sesión y los permisos: se piden al arrancar, a la vez (BackofficeApp).
  [/^\/backoffice\/me$/, 60 * 1000],
  [/^\/backoffice\/permisos\/mine$/, 60 * 1000],
];

const enVuelo = new Map(); // clave → promesa del GET en curso

function huella() {
  return (getToken() || "").slice(-16);
}

/** Olvida todo lo recordado y lo que está en vuelo (tras escribir, al salir). */
export function olvidarPeticiones() {
  enVuelo.clear();
  olvidar();
}

// Las otras pestañas de Core de este navegador también olvidan al escribir.
let canal = null;
try {
  canal = typeof BroadcastChannel === "function" ? new BroadcastChannel("inspira-core-memoria") : null;
  if (canal) canal.onmessage = () => olvidarPeticiones();
  // En Node (pruebas) un canal abierto no deja terminar el proceso.
  canal?.unref?.();
} catch { canal = null; }

function alEscribir() {
  olvidarPeticiones();
  try { canal?.postMessage("escrito"); } catch { /* sin canal: solo esta pestaña */ }
}

function pedirGET(clave, path) {
  const actual = enVuelo.get(clave);
  // Quien llega segundo recibe su copia: la copia se hace antes de que el
  // primero pueda tocar la respuesta (ver memoria.js).
  if (actual) return actual.then(copiar);
  const base = makeRequest("GET", path);
  enVuelo.set(clave, base);
  const fin = () => { if (enVuelo.get(clave) === base) enVuelo.delete(clave); };
  base.then(fin, fin);
  return base.then((r) => r);
}

/* === Helper central: detecta 401 y parsea JSON con seguridad === */
async function makeRequest(method, path, body, extraHeaders = {}) {
  const escribe = method !== "GET";
  if (escribe) alEscribir();
  try {
    return await peticion(method, path, body, extraHeaders);
  } finally {
    // Otra vez al terminar: lo que se pidió mientras se guardaba ya es viejo.
    if (escribe) alEscribir();
  }
}

async function peticion(method, path, body, extraHeaders) {
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

  if (r.status === 403) {
    let msg = "No tienes permiso para esta acción";
    try {
      const data = await r.json();
      msg = data.msg || data.message || msg;
      dialog.toast(msg, "error");
      return data;
    } catch {
      dialog.toast(msg, "error");
      return { ok: false, msg };
    }
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
  const clave = `${huella()}|${path}`;
  const adelantada = tomarPrecarga(clave);
  if (adelantada) return adelantada;
  const regla = RECORDAR.find(([re]) => re.test(path));
  if (regla) return recordar(`bo:${clave}`, () => pedirGET(clave, path), { ms: regla[1] });
  return pedirGET(clave, path);
}

/**
 * Adelanta GETs que una pantalla va a hacer en cuanto se monte, para que
 * salgan a la vez que la comprobación de la sesión y no detrás. No pinta
 * nada: la respuesta espera a quien la pida (una sola vez, 15 s como mucho).
 */
export function boPrecargar(paths) {
  if (!getToken()) return;
  for (const path of paths) {
    const clave = `${huella()}|${path}`;
    if (RECORDAR.some(([re]) => re.test(path))) boGET(path).catch(() => {});
    else precargar(clave, () => pedirGET(clave, path));
  }
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
  const escribe = (options.method || "GET").toUpperCase() !== "GET";
  if (escribe) alEscribir();
  try {
    const r = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...baseHeaders(), ...(options.headers || {}) },
    });
    if (r.status === 401) {
      handleUnauthorized();
      return null;
    }
    return r;
  } finally {
    if (escribe) alEscribir();
  }
}
