// src/pages/backoffice/configuracion/ConfiguracionPanel.jsx
//
// «Configuración»: lo que se ajusta de vez en cuando, en un solo panel con
// pestañas. Cada pestaña es un enlace a su ruta de siempre (/backoffice/planes,
// /backoffice/documentos…): recargar, «atrás» o mandar el enlace abre la misma
// pestaña, y la ruta vieja sigue funcionando.
//
// Desde el 14/09/2026 también cuelgan de aquí Documentos, Checklist de
// servicios e Instructivos, que antes solo se abrían escribiendo la URL.
//
// Cada pestaña conserva su regla de acceso: `perm` (checklist de Roles y
// Permisos), `adminOnly`, o ninguna (cualquier rol interno, como Documentos,
// que nunca la tuvo). El usuario solo ve las pestañas a las que tiene acceso.
//
// Cada pestaña se descarga al abrirla (09/10/2026). La de Correos traía
// CodeMirror (más de 500 KB) y viajaba con todo Core aunque solo la abre
// quien administra.
import { Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { lazyConRecarga } from "../../../lib/cargaDiferida";
import PestanasEnlace from "../layout/PestanasEnlace";

const PlanesAdmin = lazyConRecarga(() => import("../planes/PlanesAdmin"));
const PreciosServicios = lazyConRecarga(() => import("../precios/PreciosServicios"));
const DocumentosBackoffice = lazyConRecarga(() => import("../documentos/DocumentosBackoffice"));
const ChecklistServicios = lazyConRecarga(() => import("../checklist/ChecklistServicios"));
const InstructivosServicios = lazyConRecarga(() => import("../instructivos/InstructivosServicios"));
const EmailTemplates = lazyConRecarga(() => import("../correos/EmailTemplates"));
const MediaPanel = lazyConRecarga(() => import("../media/MediaPanel"));
const CumplimientoLegal = lazyConRecarga(() => import("../legal/CumplimientoLegal"));
const UsuariosSettings = lazyConRecarga(() => import("../settings/UsuariosSettings"));
const Auditoria = lazyConRecarga(() => import("../auditoria/Auditoria"));
const Errores = lazyConRecarga(() => import("../errores/Errores"));

const TABS = [
  { id: "planes",       label: "Planes",              href: "/backoffice/planes",              perm: "planes.ver",       Component: PlanesAdmin },
  { id: "precios",      label: "Precios/Servicios",   href: "/backoffice/precios",             perm: "precios.ver",      Component: PreciosServicios },
  { id: "documentos",   label: "Documentos",          href: "/backoffice/documentos",                                    Component: DocumentosBackoffice },
  { id: "checklist",    label: "Checklist servicios", href: "/backoffice/checklist-servicios", perm: "checklist.ver",    Component: ChecklistServicios },
  { id: "instructivos", label: "Instructivos",        href: "/backoffice/instructivos",        perm: "instructivos.ver", Component: InstructivosServicios },
  { id: "correos",      label: "Correos",             href: "/backoffice/correos",             adminOnly: true,          Component: EmailTemplates },
  { id: "media",        label: "Media",               href: "/backoffice/media",               adminOnly: true,          Component: MediaPanel },
  { id: "legal",        label: "Cumplimiento legal",  href: "/backoffice/legal",               adminOnly: true,          Component: CumplimientoLegal },
  { id: "settings",     label: "Settings",            href: "/backoffice/settings",            adminOnly: true,          Component: UsuariosSettings },
  // Aquí y no en el menú principal: se consulta de vez en cuando.
  { id: "auditoria",    label: "Registro de cambios", href: "/backoffice/auditoria",           adminOnly: true,          Component: Auditoria },
  // Fallos de la web, la API y el login: lo que antes solo estaba en pm2.
  { id: "errores",      label: "Errores",             href: "/backoffice/errores",             adminOnly: true,          Component: Errores },
];

export default function ConfiguracionPanel({ tabId = "planes" }) {
  const { isAdmin, hasPermission } = useAuth();

  const visibles = TABS.filter((t) => (t.adminOnly ? isAdmin : !t.perm || hasPermission(t.perm)));

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

  // Una ruta a la que no tiene acceso abre la primera pestaña que sí ve.
  const activa = visibles.find((t) => t.id === tabId) || visibles[0];
  const { Component } = activa;

  return (
    <div className="flex flex-col h-full">
      <PestanasEnlace pestanas={visibles} activa={activa.id} etiqueta="Secciones de configuración" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Suspense fallback={<p className="text-[13px] text-neutral-400 py-10 text-center" aria-busy="true">Cargando…</p>}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
