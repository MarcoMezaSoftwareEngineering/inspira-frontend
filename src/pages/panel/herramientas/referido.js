// Lo que se apunta una vez en la cuenta al entrar (03/11/2026): si vino por
// «Crear mi cuenta gratis» (origen «App Inspira» en el backoffice) y si llegó
// con el enlace de un amigo (?ref=). Vive aparte para que el panel lo llame
// sin cargar las herramientas.
import { apiPOST } from "../../../services/api";

/** Si llegó con ?ref=, lo apunta una vez en su cuenta al cargar su perfil. */
export function registrarReferido() {
  try {
    const desdeUrl = new URLSearchParams(window.location.search).get("ref");
    if (desdeUrl) localStorage.setItem("inspira:ref", desdeUrl.slice(0, 20));
    const codigo = localStorage.getItem("inspira:ref");
    if (!codigo) return;
    apiPOST("/cliente/herramientas/referido", { codigo }).then((r) => { if (r?.ok) localStorage.removeItem("inspira:ref"); }).catch(() => {});
  } catch { /* sin almacenamiento */ }
}

/** «Crear mi cuenta gratis» lo deja anotado antes de ir a Google. */
export function marcarRegistroApp() {
  try { localStorage.setItem("inspira:registro", "app"); } catch { /* sin almacenamiento */ }
}

export function registrarOrigen() {
  try {
    if (localStorage.getItem("inspira:registro") !== "app") return;
    apiPOST("/cliente/herramientas/registro", { via: "app" }).then((r) => { if (r?.ok) localStorage.removeItem("inspira:registro"); }).catch(() => {});
  } catch { /* sin almacenamiento */ }
}
