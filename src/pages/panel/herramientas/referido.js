// «Invita a un amigo»: si entró con ?ref=, se apunta una vez en su cuenta.
// Vive aparte para que el panel lo llame sin cargar las herramientas.
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
