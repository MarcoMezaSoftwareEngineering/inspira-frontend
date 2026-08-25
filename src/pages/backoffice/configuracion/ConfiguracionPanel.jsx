// src/pages/backoffice/configuracion/ConfiguracionPanel.jsx
//
// Fusiona los antiguos módulos de configuración (Planes, Precios/Servicios,
// Correos, Media, Cumplimiento legal y Settings) en un solo panel con
// pestañas. Cada pestaña conserva su regla de acceso original: `perm`
// (checklist de Roles y Permisos) o solo-admin; el usuario solo ve las
// pestañas a las que tiene acceso.
import { useAuth } from "../context/AuthContext";
import TabView from "../layout/TabView";
import PlanesAdmin from "../planes/PlanesAdmin";
import PreciosServicios from "../precios/PreciosServicios";
import EmailTemplates from "../correos/EmailTemplates";
import MediaPanel from "../media/MediaPanel";
import CumplimientoLegal from "../legal/CumplimientoLegal";
import UsuariosSettings from "../settings/UsuariosSettings";
import Auditoria from "../auditoria/Auditoria";

const TABS = [
  { id: "planes",   label: "Planes",             perm: "planes.ver",  Component: PlanesAdmin },
  { id: "precios",  label: "Precios/Servicios",  perm: "precios.ver", Component: PreciosServicios },
  { id: "correos",  label: "Correos",            adminOnly: true,     Component: EmailTemplates },
  { id: "media",    label: "Media",              adminOnly: true,     Component: MediaPanel },
  { id: "legal",    label: "Cumplimiento legal", adminOnly: true,     Component: CumplimientoLegal },
  { id: "settings", label: "Settings",           adminOnly: true,     Component: UsuariosSettings },
  // Aquí y no en el menú principal: son ocho destinos y añadir un noveno por
  // algo que se consulta de vez en cuando dispersaría la navegación otra vez.
  { id: "auditoria", label: "Registro de cambios", adminOnly: true,    Component: Auditoria },
];

export default function ConfiguracionPanel({ initialTabId = "planes" }) {
  const { isAdmin, hasPermission } = useAuth();

  const visibles = TABS.filter((t) => (t.adminOnly ? isAdmin : hasPermission(t.perm)));

  if (visibles.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-primary">Acceso restringido</h1>
        <p className="mt-2 text-neutral-700">
          No tienes permiso para ver esta sección. Si crees que deberías tenerlo,
          pídele a un administrador que lo active desde{" "}
          <span className="font-semibold">Configuración → Settings → Roles y Permisos</span>.
        </p>
      </div>
    );
  }

  const idx = Math.max(0, visibles.findIndex((t) => t.id === initialTabId));

  return (
    <TabView
      key={initialTabId}
      initialTab={idx}
      tabs={visibles.map(({ label, Component }) => ({ label, content: <Component /> }))}
    />
  );
}
