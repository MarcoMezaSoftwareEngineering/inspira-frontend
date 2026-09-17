import { useEffect, useRef, useState } from "react";
import { guardarToken } from "../../services/sesion";
import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../services/navigate";
import logo from "../../assets/images/logo.png";
import "../../styles/acceso.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/**
 * Solo se admiten rutas internas de este sitio.
 *
 * El destino sale de localStorage y va derecho a la barra de direcciones. Hoy
 * solo lo escribe la propia aplicación, pero si alguna vez ese valor pudiera
 * venir de fuera sería un redirect abierto: el usuario acaba de autenticarse
 * con Google y se le podría enviar a un dominio ajeno con aspecto de "sesión
 * iniciada". Se exige "/" inicial y se descarta "//" y "/\", que el navegador
 * interpreta como URL absoluta a otro host.
 */
function destinoSeguro(valor) {
  if (typeof valor !== "string" || !valor.startsWith("/")) return "/panel";
  if (valor.startsWith("//") || valor.startsWith("/\\")) return "/panel";
  return valor;
}

/**
 * El instante entre Google y el panel.
 *
 * Antes era un texto suelto sin marca, y al terminar recargaba la aplicación
 * entera por tercera vez. Ahora canjea el token, refresca la sesión en
 * memoria y navega dentro de la aplicación ya cargada: una descarga menos y
 * ninguna pantalla en blanco.
 */
export default function AuthSuccess() {
  const { refreshUser } = useAuth();
  const [fallo, setFallo] = useState("");
  // El código de Google es de un solo uso. Si el efecto corre dos veces (modo
  // estricto, o un `refreshUser` que cambia), la segunda vuelta ya no
  // encuentra el destino ni el código, recibe un 401 y mandaba a la portada a
  // alguien que acababa de entrar bien. Se canjea una vez y punto.
  const canjeado = useRef(false);
  // «Sigue en pantalla» va aparte: si lo llevara el efecto del canje, su
  // limpieza lo apagaría al repetirse y nunca se navegaría.
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  useEffect(() => {
    if (canjeado.current) return;
    canjeado.current = true;

    async function canjearToken() {
      const destino = destinoSeguro(localStorage.getItem("post_login_redirect"));
      localStorage.removeItem("post_login_redirect");

      try {
        // El código de un solo uso viene en la URL: es lo que hace que el login
        // funcione también en la aplicación instalada en iPhone, donde la
        // cookie del dominio de la API se queda en Safari y no llega aquí.
        const codigo = new URLSearchParams(window.location.search).get("c");
        const url = `${API_URL}/auth/claim-token${codigo ? `?c=${encodeURIComponent(codigo)}` : ""}`;
        const resp = await fetch(url, {
          credentials: "include", // la cookie __cb_token, como respaldo
        });
        const data = resp.ok ? await resp.json() : null;

        if (!data?.ok || !data.token) {
          // Sin token no hay sesión: se vuelve a donde se iba, y si era el
          // panel, este le pedirá entrar otra vez.
          if (montado.current) navigate(destino.startsWith("/panel") ? "/" : destino, { replace: true });
          return;
        }

        guardarToken(data.token);
        await refreshUser();
        if (montado.current) navigate(destino, { replace: true });
      } catch {
        if (montado.current) setFallo("No hemos podido completar el acceso. Vuelve a intentarlo.");
      }
    }

    canjearToken();
  }, [refreshUser]);

  return (
    <div className="acc">
      <div className="acc-caja">
        <div className="acc-logo"><img src={logo} alt="Inspira Legal" /></div>
        {fallo ? (
          <>
            <p className="acc-texto">{fallo}</p>
            <a href="/" className="acc-btn">Volver al inicio</a>
          </>
        ) : (
          <>
            <div className="acc-spinner" />
            <p className="acc-texto">Entrando a tu panel…</p>
          </>
        )}
      </div>
    </div>
  );
}
