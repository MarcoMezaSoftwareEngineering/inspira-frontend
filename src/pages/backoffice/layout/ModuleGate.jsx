// src/pages/backoffice/layout/ModuleGate.jsx
//
// Bloquea el render de un módulo del backoffice si el usuario logueado no
// tiene el permiso (o el rol admin) requerido. Cierra el hueco de que hoy
// cualquiera con URL directa ve el formulario completo aunque el sidebar
// no muestre el ítem.
import { useAuth } from "../context/AuthContext";

export default function ModuleGate({ perm, adminOnly = false, children }) {
  const { hasPermission, isAdmin } = useAuth();

  const permitido = adminOnly ? isAdmin : !perm || hasPermission(perm);
  if (permitido) return children;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary">Acceso restringido</h1>
      <p className="mt-2 text-neutral-700">
        No tienes permiso para ver esta sección. Si crees que deberías tenerlo,
        pídele a un administrador que lo active desde{" "}
        <span className="font-semibold">Settings → Roles y Permisos</span>.
      </p>
    </div>
  );
}
