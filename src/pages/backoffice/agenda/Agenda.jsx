// Agenda del backoffice: el calendario propio (Mi calendario) y la lista de Reservas.
// Calendly se retiró el 03/11/2026: las reuniones, la disponibilidad y la cancelación
// de Calendly salieron de aquí junto con su estado (useAgenda) y las pestañas.
//   mi-calendario/        el calendario propio (AgendaSlot / ReservaCita)
//   ReservasTab.jsx       por pagar, próximas e informes, con los botones de aviso
import { useState } from "react";
import MiCalendarioTab from "./mi-calendario/MiCalendarioTab";
import ReservasTab from "./ReservasTab";

const TABS = [
  { id: "reservas", texto: "Reservas" },
  { id: "micalendario", texto: "Mi calendario" },
];

export default function Agenda() {
  const [tab, setTab] = useState("reservas");

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Topbar */}
      <header className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-200 bg-white/85 backdrop-blur-md z-20">
        <div className="min-w-[220px]">
          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[.16em] text-primary-light mb-0.5">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(34,201,131,.10)] animate-pulse" />
            Calendario propio
          </div>
          <h1 className="font-fraunces text-[26px] leading-none font-bold text-primary-dark tracking-tight">Agenda</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">Citas, pagos y disponibilidad del equipo en una sola vista.</p>
        </div>
        {/* Tabs */}
        <div className="flex gap-0.5 p-1 rounded-[14px] border border-neutral-200 bg-neutral-50 shadow-sm text-[11px] font-bold overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2.5 rounded-[10px] whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary-dark text-white shadow" : "text-neutral-500 hover:bg-white hover:text-primary-dark"}`}
            >
              {t.texto}
            </button>
          ))}
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "micalendario" && <MiCalendarioTab />}
        {tab === "reservas" && <ReservasTab />}
      </div>
    </div>
  );
}
