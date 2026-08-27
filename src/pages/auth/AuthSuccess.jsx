import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/**
 * Solo se admiten rutas internas de este sitio.
 *
 * El destino sale de localStorage y va derecho a `location.replace`. Hoy solo
 * lo escribe la propia aplicación, pero si alguna vez ese valor pudiera venir
 * de fuera sería un redirect abierto: el usuario acaba de autenticarse con
 * Google y se le podría enviar a un dominio ajeno con aspecto de "sesión
 * iniciada". Se exige "/" inicial y se descarta "//" y "/\", que el navegador
 * interpreta como URL absoluta a otro host.
 */
function destinoSeguro(valor) {
  if (typeof valor !== "string" || !valor.startsWith("/")) return "/";
  if (valor.startsWith("//") || valor.startsWith("/\\")) return "/";
  return valor;
}

export default function AuthSuccess() {
  useEffect(() => {
    async function canjearToken() {
      try {
        const resp = await fetch(`${API_URL}/auth/claim-token`, {
          credentials: "include", // necesario para enviar la cookie __cb_token
        });

        if (!resp.ok) {
          // No hay token disponible → ir a home
          const fallback = destinoSeguro(localStorage.getItem("post_login_redirect"));
          localStorage.removeItem("post_login_redirect");
          window.location.replace(fallback);
          return;
        }

        const data = await resp.json();

        if (!data.ok || !data.token) {
          window.location.replace("/");
          return;
        }

        localStorage.setItem("token", data.token);

        const redirect = destinoSeguro(localStorage.getItem("post_login_redirect"));
        localStorage.removeItem("post_login_redirect");
        window.location.replace(redirect);
      } catch {
        window.location.replace("/");
      }
    }

    canjearToken();
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
