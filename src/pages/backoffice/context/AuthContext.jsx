// src/pages/backoffice/context/AuthContext.jsx
//
// Fuente única de verdad del usuario logueado y sus permisos en el
// backoffice. Reemplaza los checks sueltos `user?.rol === "admin"`
// repetidos en varias pantallas por un solo `hasPermission(clave)`.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

function guardarPermisos(permisos) {
  try { localStorage.setItem("bo_perms", JSON.stringify(permisos)); } catch { /* sin almacenamiento */ }
}

export function AuthProvider({ user, onLogout, children }) {
  const [permisos, setPermisos] = useState(readPermisosCache);
  const conUsuario = Boolean(user);
  const idUsuario = user?.id_usuario;

  // Los permisos ya salieron al arrancar (BackofficeApp), a la vez que la
  // sesión: esta petición recoge esa misma promesa (backofficeApi la recuerda).
  useEffect(() => {
    if (!conUsuario) return undefined;
    let vivo = true;
    boGET("/backoffice/permisos/mine").then((r) => {
      if (!vivo || !r?.ok) return;
      setPermisos(r.permisos || {});
      guardarPermisos(r.permisos || {});
    });
    return () => { vivo = false; };
  }, [conUsuario, idUsuario]);

  // Tras cambiar roles o permisos. La escritura que lo precede ya vació la
  // memoria de backofficeApi, así que esto pregunta de verdad al servidor.
  const reloadPermisos = useCallback(async () => {
    if (!conUsuario) return;
    const r = await boGET("/backoffice/permisos/mine");
    if (r?.ok) {
      setPermisos(r.permisos || {});
      guardarPermisos(r.permisos || {});
    }
  }, [conUsuario]);

  const isAdmin = user?.rol === "admin";

  // Un objeto nuevo en cada render hacía repintar a todo lo que lee el
  // contexto (menú, cajón, barra de abajo, cada ModuleGate) aunque no hubiera
  // cambiado nada (09/10/2026).
  const value = useMemo(() => ({
    user,
    isAdmin,
    permisos,
    hasPermission: (clave) => (isAdmin ? true : !!permisos[clave]),
    reloadPermisos,
    logout: onLogout,
  }), [user, isAdmin, permisos, reloadPermisos, onLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}
