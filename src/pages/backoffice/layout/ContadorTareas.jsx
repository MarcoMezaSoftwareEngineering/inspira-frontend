// El número junto a «Tareas» en el menú: tus tareas abiertas, en rojo si
// alguna está vencida. Se pide al montar, cada 2 minutos y cuando cambia una
// tarea en esta pestaña (evento «inspira:tareas-cambio»). Si falla, no se
// enseña nada: es una ayuda, no un aviso.
//
// Una sola fuente (09/10/2026): el contador sale en el menú lateral, en la
// barra de abajo del móvil y en el cajón, y cada uno pedía lo suyo cada dos
// minutos —tres veces lo mismo—. Ahora pregunta ProveedorCuentaTareas, una
// vez, con useSondeo (nada con la pestaña oculta), y los tres lo leen.
import { createContext, useContext, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { useSondeo } from "../../../hooks/useSondeo";

const REFRESCO_MS = 2 * 60 * 1000;

const CuentaTareas = createContext(null);

export function ProveedorCuentaTareas({ children }) {
  const [cuenta, setCuenta] = useState(null);

  const refrescar = useSondeo(async () => {
    // Sin sesión no se pregunta: un 401 mandaría al login.
    if (!localStorage.getItem("bo_token")) return;
    const r = await boGET("/backoffice/tareas/cuenta");
    if (!r?.ok) throw new Error("Sin cuenta de tareas");
    setCuenta(r);
  }, REFRESCO_MS);

  useEffect(() => {
    const alCambiar = () => { refrescar().catch(() => { /* sin red: se queda como estaba */ }); };
    window.addEventListener("inspira:tareas-cambio", alCambiar);
    return () => window.removeEventListener("inspira:tareas-cambio", alCambiar);
  }, [refrescar]);

  return <CuentaTareas.Provider value={cuenta}>{children}</CuentaTareas.Provider>;
}

export default function ContadorTareas() {
  const cuenta = useContext(CuentaTareas);

  if (!cuenta?.total) return null;
  const titulo = [
    `${cuenta.total} abierta${cuenta.total === 1 ? "" : "s"}`,
    cuenta.vencidas ? `${cuenta.vencidas} vencida${cuenta.vencidas === 1 ? "" : "s"}` : null,
    cuenta.hoy ? `${cuenta.hoy} para hoy` : null,
  ].filter(Boolean).join(" · ");

  return (
    <span
      title={titulo}
      aria-label={titulo}
      className={`ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-bold leading-none flex items-center justify-center ${
        cuenta.vencidas ? "bg-[#e5533d] text-white" : "bg-white/15 text-white"
      }`}
    >
      {cuenta.total > 99 ? "99+" : cuenta.total}
    </span>
  );
}
