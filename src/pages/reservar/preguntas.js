// src/pages/reservar/preguntas.js
// Preguntas previas a la reunión (como las de Calendly, pero obligatorias las
// que el abogado necesita para preparar la sesión). Deben coincidir con las
// listas de reservas.invitado.js en el backend.
export const INTERESES = ["Máster", "Grado", "Formación profesional", "Doctorado", "Visado o estancia", "Homologación de título", "Otro"];
export const INICIOS = ["Lo antes posible", "Septiembre de 2027", "2028 o después", "Aún no lo sé"];

export const celularValido = (v) => String(v || "").replace(/\D/g, "").length >= 8;
export const correoValido = (v) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(String(v || "").trim());
export const nombreCompletoValido = (v) => String(v || "").trim().split(/\s+/).filter((p) => p.length >= 2).length >= 2;

// El mismo resumen que arma el backend para quien reserva sin cuenta.
export function componerMotivo({ interes, inicio, detalle }) {
  return [interes && `Interés: ${interes}`, inicio && `Inicio: ${inicio}`, detalle?.trim() && `Detalle: ${detalle.trim()}`].filter(Boolean).join(" · ");
}

// La elección (servicio, día, hora y lo ya escrito) sobrevive a recargas y al
// inicio de sesión con Google, que saca al usuario de la página y lo devuelve.
const CLAVE_BORRADOR = "inspira:reserva-borrador";
export function guardarBorrador(datos) {
  try {
    const previo = leerBorrador() || {};
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ ...previo, ...datos, ts: Date.now() }));
  } catch { /* sin almacenamiento: se pierde, como antes */ }
}
export function leerBorrador() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || "null");
    return d && Date.now() - d.ts < 30 * 60e3 ? d : null;
  } catch {
    return null;
  }
}
export function borrarBorrador() {
  try {
    localStorage.removeItem(CLAVE_BORRADOR);
  } catch { /* ignorado */ }
}
