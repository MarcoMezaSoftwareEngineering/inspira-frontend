// Pestañas que son enlaces: cada una lleva a su ruta.
//
// Las usan Configuración y Leads, que reúnen varias pantallas con URL propia
// sin cambiarles la ruta: recargar, «atrás» o mandar el enlace abre la misma
// pestaña. Mismo aspecto que TabView (que guarda la pestaña en memoria).
import { navigate } from "../../../services/navigate";

/**
 * @param pestanas  [{ id, label, href }], ya filtradas por permisos
 * @param activa    id de la pestaña abierta
 * @param etiqueta  nombre del grupo para lectores de pantalla
 */
export default function PestanasEnlace({ pestanas = [], activa, etiqueta, className = "" }) {
  if (!pestanas.length) return null;

  return (
    <nav
      aria-label={etiqueta}
      className={`flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 sm:px-6 pt-4 shrink-0 ${className}`}
    >
      {pestanas.map((p) => {
        const on = p.id === activa;
        return (
          <a
            key={p.id}
            href={p.href}
            aria-current={on ? "page" : undefined}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey) return;
              e.preventDefault();
              if (!on) navigate(p.href);
            }}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap no-underline transition-colors",
              on
                ? "bg-primary text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            {p.label}
          </a>
        );
      })}
    </nav>
  );
}
