// src/pages/mapa/eventosMapa.js
// Interés anónimo en el mapa: POST /api/mapa/evento { tipo, id } al abrir una
// ficha, comparar, pedir recomendación o guardar una comparativa.
//
// - Sin datos personales: solo el tipo de gesto y el id público (comunidad o
//   universidad; en «recomendar» y «guardar», los ids separados por comas).
// - Solo con consentimiento de analítica (el mismo control que lib/analytics.js).
// - Con navigator.sendBeacon y como text/plain, igual que /api/leads/evento:
//   sin preflight CORS y sin bloquear la interfaz. Un fallo no se nota.
import { tieneConsentimiento } from "../../lib/consent";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const TIPOS = new Set(["ver_comunidad", "ver_universidad", "comparar", "recomendar", "guardar"]);

export function eventoMapa(tipo, id) {
  if (!TIPOS.has(tipo) || typeof navigator === "undefined") return;
  try {
    if (!tieneConsentimiento("analitica")) return;
    const cuerpo = JSON.stringify({ tipo, id: String(id ?? "").slice(0, 200) });
    const url = `${API_URL}/api/mapa/evento`;
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([cuerpo], { type: "text/plain;charset=UTF-8" }));
    } else {
      fetch(url, { method: "POST", body: cuerpo, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
    }
  } catch {
    /* la medición nunca rompe el mapa */
  }
}
