// src/pages/backoffice/context/AuthContext.jsx
//
// Fuente única de verdad del usuario logueado y sus permisos en el
// backoffice. Reemplaza los checks sueltos `user?.rol === "admin"`
// repetidos en varias pantallas por un solo `hasPermission(clave)`.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const AuthContext = createContext(null);

function readPermisosCache() {
  try {
    const p = localStorage.getItem("bo_perms");
    return p ? JSON.parse(p) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ user, onLogout, children }) {
  const [permisos, setPermisos] = useState(readPermisosCache);

  const reloadPermisos = useCallback(async () => {
    if (!user) return;
    const r = await boGET("/backoffice/permisos/mine");
    if (r.ok) {
      setPermisos(r.permisos || {});
      localStorage.setItem("bo_perms", JSON.stringify(r.permisos || {}));
    }
  }, [user?.id_usuario]);

  useEffect(() => {
    reloadPermisos();
  }, [reloadPermisos]);

  const isAdmin = user?.rol === "admin";

  function hasPermission(clave) {
    if (isAdmin) return true;
    return !!permisos[clave];
  }

  const value = { user, isAdmin, permisos, hasPermission, reloadPermisos, logout: onLogout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}
