// El número junto a «Tareas» en el menú: tus tareas abiertas, en rojo si
// alguna está vencida. Se pide al montar, cada 2 minutos y cuando cambia una
// tarea en esta pestaña (evento «inspira:tareas-cambio»). Si falla, no se
// enseña nada: es una ayuda, no un aviso.
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const REFRESCO_MS = 2 * 60 * 1000;

export default function ContadorTareas() {
  const [cuenta, setCuenta] = useState(null);

  useEffect(() => {
    let vivo = true;
    const pedir = () => {
      // Sin sesión no se pregunta: un 401 mandaría al login.
      if (!localStorage.getItem("bo_token")) return;
      boGET("/backoffice/tareas/cuenta")
        .then((r) => { if (vivo && r?.ok) setCuenta(r); })
        .catch(() => { /* sin red: se queda como estaba */ });
    };
    pedir();
    const t = setInterval(pedir, REFRESCO_MS);
    window.addEventListener("inspira:tareas-cambio", pedir);
    return () => {
      vivo = false;
      clearInterval(t);
      window.removeEventListener("inspira:tareas-cambio", pedir);
    };
  }, []);

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
