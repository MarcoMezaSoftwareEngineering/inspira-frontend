// src/pages/reservar/tokenReserva.js
// Quien reservó sin cuenta entra a su reserva con el enlace del correo
// (…/reservar/pago?r=12&t=<token>). El token solo abre esa reserva; se guarda en
// el navegador y se quita de la barra de direcciones para no filtrarlo.
const CLAVE = (id) => `inspira:reserva-token:${id}`;

export function guardarToken(id, token) {
  try {
    localStorage.setItem(CLAVE(id), token);
  } catch { /* sin almacenamiento: queda en la URL */ }
}

export function tokenDe(id) {
  const delEnlace = new URLSearchParams(window.location.search).get("t");
  if (delEnlace) {
    guardarToken(id, delEnlace);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("t");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch { /* la URL se queda como está */ }
    return delEnlace;
  }
  try {
    return localStorage.getItem(CLAVE(id)) || null;
  } catch {
    return null;
  }
}

export const cabeceraReserva = (id) => {
  const t = tokenDe(id);
  return t ? { "X-Reserva-Token": t } : {};
};
