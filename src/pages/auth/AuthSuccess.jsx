import { useEffect, useRef, useState } from "react";
import { guardarToken } from "../../services/sesion";
import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../services/navigate";
import { reportarError } from "../../lib/reportarError";
import PantallaError from "../../components/common/PantallaError";
import logo from "../../assets/images/logo.png";
import "../../styles/acceso.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/**
 * Vuelve a Google conservando a dónde se iba. Google pregunta la cuenta
 * (`prompt=select_account` en el backend), así que sirve también para
 * entrar con otra.
 */
function reintentar(destino) {
  localStorage.setItem("post_login_redirect", destino);
  window.location.href = `${API_URL}/auth/google`;
}

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
  // { referencia, destino }: el acceso no se completó. Se queda en pantalla
  // con reintento; antes se volvía a la portada sin decir nada y parecía que
  // el login no había hecho caso.
  const [fallo, setFallo] = useState(null);
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
      const params = new URLSearchParams(window.location.search);

      // El backend no pudo completar el login (Google, la BD…): ya lo
      // registró él, y manda el número de registro.
      const errorServidor = params.get("error");
      if (errorServidor) {
        if (montado.current) setFallo({ referencia: errorServidor === "1" ? "" : errorServidor, destino });
        return;
      }

      // Fallo de este lado: se avisa al servidor para que se vea en Core.
      const fallar = (mensaje) => {
        reportarError({ origen: "login", donde: "auth/success", mensaje });
        if (montado.current) setFallo({ referencia: "", destino });
      };

      try {
        // El código de un solo uso viene en la URL: es lo que hace que el login
        // funcione también en la aplicación instalada en iPhone, donde la
        // cookie del dominio de la API se queda en Safari y no llega aquí.
        const codigo = params.get("c");
        const url = `${API_URL}/auth/claim-token${codigo ? `?c=${encodeURIComponent(codigo)}` : ""}`;
        const resp = await fetch(url, {
          credentials: "include", // la cookie __cb_token, como respaldo
        });
        const data = resp.ok ? await resp.json() : null;

        if (!data?.ok || !data.token) {
          fallar(`claim-token ${resp.status}${codigo ? "" : " (sin código)"}`);
          return;
        }

        guardarToken(data.token);
        await refreshUser();
        if (montado.current) navigate(destino, { replace: true });
      } catch (e) {
        fallar(`claim-token: ${e?.message || e}`);
      }
    }

    canjearToken();
  }, [refreshUser]);

  if (fallo) {
    return (
      <PantallaError
        texto="No pudimos completar el inicio de sesión. Inténtelo de nuevo; si vuelve a pasar, escríbanos."
        referencia={fallo.referencia}
        paraWhatsApp="No pude entrar a mi panel."
        acciones={[{ etiqueta: "Volver a intentarlo", fuerte: true, onClick: () => reintentar(fallo.destino) }]}
      />
    );
  }

  return (
    <div className="acc">
      <div className="acc-caja">
        <div className="acc-logo"><img src={logo} alt="Inspira Legal" /></div>
        <div className="acc-spinner" />
        <p className="acc-texto">Entrando a tu panel…</p>
      </div>
    </div>
  );
}
