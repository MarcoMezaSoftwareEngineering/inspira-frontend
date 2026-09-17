// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { borrarSesionLocal, cerrarSesionServidor } from "../services/sesion";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estable entre renders: AuthSuccess lo tiene como dependencia de su efecto,
  // y con una función nueva en cada render el canje del token se repetía.
  const fetchMe = useCallback(async () => {
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
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.ok ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ Si NO hay token, no tiene sentido llamar /auth/me
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetchMe();
  }, [fetchMe]);

  // Cerrar sesión la invalida también en el servidor —el token deja de valer
  // aunque alguien lo hubiera copiado— y avisa a las demás pestañas. Con
  // `todos` se cierran además las de sus otros dispositivos.
  const logout = async ({ todos = false } = {}) => {
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
