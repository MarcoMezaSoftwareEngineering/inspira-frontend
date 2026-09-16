// Botón «+» del móvil: las acciones rápidas que se repiten a diario, a mano
// del pulgar. Nuevo cliente, nueva tarea y registrar un cobro. Cada una lleva
// a su pantalla con el formulario ya abierto (?alta=1 / ?nueva=1).
import { useState } from "react";
import { Plus, X, UserPlus, ListPlus, Wallet } from "lucide-react";
import { navigate } from "../../../services/navigate";

const ACCIONES = [
  { t: "Nuevo cliente", icono: UserPlus, href: "/backoffice/clientes?alta=1" },
  { t: "Nueva tarea", icono: ListPlus, href: "/backoffice/tareas?nueva=1" },
  { t: "Registrar cobro", icono: Wallet, href: "/backoffice/pagos" },
];

export default function BotonRapido() {
  const [abierto, setAbierto] = useState(false);

  function ir(href) {
    setAbierto(false);
    const destino = href.split("?")[0];
    navigate(href);
    // Misma pantalla: remontar para que lea el parámetro.
    if (window.location.pathname === destino) window.location.reload();
  }

  return (
    <div className="md:hidden">
      {abierto && <div className="fixed inset-0 z-[46] bg-[#011c26]/40 backdrop-blur-[2px]" onClick={() => setAbierto(false)} role="presentation" />}
      <div className="fixed right-4 z-[47] flex flex-col items-end gap-2" style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}>
        {abierto && ACCIONES.map((a, i) => {
          const Icono = a.icono;
          return (
            <button key={a.t} type="button" onClick={() => ir(a.href)}
              className="flex items-center gap-2.5 bg-white text-[#013446] rounded-full pl-4 pr-2 py-2 text-[13.5px] font-semibold shadow-[0_10px_24px_rgba(1,52,70,.22)] ase-anim"
              style={{ animationDelay: `${(ACCIONES.length - i) * 30}ms` }}>
              {a.t}
              <span className="w-9 h-9 rounded-full grid place-items-center bg-[#e3f0fe]"><Icono size={18} strokeWidth={2.1} /></span>
            </button>
          );
        })}
        <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}
          aria-label={abierto ? "Cerrar acciones rápidas" : "Acciones rápidas"}
          className="w-14 h-14 rounded-full grid place-items-center text-white shadow-[0_12px_26px_-6px_rgba(250,148,58,.75)] active:scale-95 transition"
          style={{ background: "linear-gradient(135deg, #ffb066, #fa943a 60%, #e07a1c)" }}>
          {abierto ? <X size={24} strokeWidth={2.4} /> : <Plus size={26} strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  );
}
