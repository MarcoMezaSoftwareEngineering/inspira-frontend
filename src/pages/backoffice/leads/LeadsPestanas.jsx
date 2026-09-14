// Las dos vistas de «Leads»: la bandeja y las solicitudes que llegan del
// portal de presupuestos de la web («Solicitudes web», /backoffice/presupuestos).
//
// Hasta el 14/09/2026 «Solicitudes web» era una entrada propia del menú.
// Ahora es una pestaña de Leads, con la misma ruta de siempre.
import { useAuth } from "../context/AuthContext";
import PestanasEnlace from "../layout/PestanasEnlace";

const PESTANAS = [
  { id: "leads", label: "Bandeja de leads", href: "/backoffice/leads", perm: "leads.ver" },
  // Lo que se mira y se compara en el mapa público (desde el 14/09/2026).
  { id: "mapa-interes", label: "Interés del mapa", href: "/backoffice/leads/mapa", perm: "leads.ver" },
  // Nunca pidió permiso: sigue abierta a cualquier rol interno.
  { id: "solicitudes-web", label: "Solicitudes web", href: "/backoffice/presupuestos" },
];

export default function LeadsPestanas({ activa, className = "" }) {
  const { hasPermission } = useAuth();
  const visibles = PESTANAS.filter((p) => !p.perm || hasPermission(p.perm));
  return (
    <PestanasEnlace
      pestanas={visibles}
      activa={activa}
      etiqueta="Vistas de leads"
      className={className}
    />
  );
}
