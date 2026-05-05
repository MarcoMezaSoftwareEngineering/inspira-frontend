import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function AuthSuccess() {
  useEffect(() => {
    async function canjearToken() {
      try {
        const resp = await fetch(`${API_URL}/auth/claim-token`, {
          credentials: "include", // necesario para enviar la cookie __cb_token
        });

        if (!resp.ok) {
          // No hay token disponible → ir a home
          const fallback = localStorage.getItem("post_login_redirect") || "/";
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

        const redirect = localStorage.getItem("post_login_redirect") || "/";
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
