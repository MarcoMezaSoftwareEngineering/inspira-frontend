// src/context/AuthContext.jsx
import { createContext, startTransition, useCallback, useContext, useEffect, useState } from "react";
import { borrarSesionLocal, cerrarSesionServidor } from "../services/sesion";
import { desactivarAvisos } from "../services/push";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

// `arranqueSuave`: la página llegó prerenderizada y se está hidratando (Raiz.jsx).
export function AuthProvider({ children, arranqueSuave = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estable entre renders: AuthSuccess lo tiene como dependencia de su efecto,
  // y con una función nueva en cada render el canje del token se repetía.
  //
  // `suave`: en una página prerenderizada, la comprobación de la sesión al
  // arrancar aplica su resultado en una transición (09/10/2026). Si el trozo
  // de la ruta aún no ha bajado, React no ha hidratado ese Suspense; un cambio
  // urgente de este contexto le haría tirar el HTML del servidor y repintarlo
  // (el contenido parpadea y se pierde la ventaja). En una transición, React
  // espera a hidratarlo. En el resto de casos va como siempre, y también
  // cuando se llama a propósito (AuthSuccess, antes de navegar al panel): el
  // panel tiene que ver ya al usuario.
  const fetchMe = useCallback(async ({ suave = false } = {}) => {
    const aplicar = (usuario) => {
      const cambiar = () => {
        setUser(usuario);
        setLoading(false);
      };
      if (suave) startTransition(cambiar);
      else cambiar();
    };
    try {
      const token = localStorage.getItem("token");

      // Se mandan las dos credenciales: la cookie de sesión OAuth y el JWT.
      // La sesión de passport vive en memoria del backend y desaparece en cada
      // reinicio, así que sin el Bearer el usuario aparecía deslogueado en la
      // cabecera aunque su token siguiera siendo válido.
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        aplicar(null);
        return;
      }

      const data = await res.json();
      aplicar(data.ok ? data.user : null);
    } catch {
      aplicar(null);
    }
  }, []);

  useEffect(() => {
    // ✅ Si NO hay token, no tiene sentido llamar /auth/me
    const token = localStorage.getItem("token");
    if (!token) {
      const sinSesion = () => {
        setUser(null);
        setLoading(false);
      };
      // En transición por lo mismo que `suave` (ver fetchMe).
      if (arranqueSuave) startTransition(sinSesion);
      else sinSesion();
      return;
    }

    fetchMe({ suave: arranqueSuave });
  }, [fetchMe, arranqueSuave]);

  // Cerrar sesión la invalida también en el servidor —el token deja de valer
  // aunque alguien lo hubiera copiado— y avisa a las demás pestañas. Con
  // `todos` se cierran además las de sus otros dispositivos.
  const logout = async ({ todos = false } = {}) => {
    // Antes que el token: en un equipo compartido no pueden seguir llegando
    // los avisos del asesorado anterior.
    // Con tope: sin service worker (desarrollo) la consulta espera hasta 5 s.
    try { await Promise.race([desactivarAvisos(), new Promise((r) => setTimeout(r, 1500))]); } catch { /* sin avisos que quitar */ }
    await cerrarSesionServidor({ todos });
    borrarSesionLocal();
    try { localStorage.removeItem("post_login_redirect"); } catch { /* noop */ }
    setUser(null);

    // Se vuelve a la misma página donde estaba (solo rutas relativas); desde
    // el panel, a la portada.
    const actual = window.location.pathname + window.location.search + window.location.hash;
    let redirect = actual && actual.startsWith("/") ? actual : "/";
    if (redirect.startsWith("/panel")) redirect = "/";
    window.location.href = redirect;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
