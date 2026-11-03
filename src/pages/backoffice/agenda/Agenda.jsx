// Agenda del backoffice: el calendario propio (Mi calendario) y la lista de Reservas.
// Calendly se retiró el 03/11/2026: las reuniones, la disponibilidad y la cancelación
// de Calendly salieron de aquí junto con su estado (useAgenda) y las pestañas.
//   mi-calendario/        el calendario propio (AgendaSlot / ReservaCita)
//   ReservasTab.jsx       por pagar, próximas e informes, con los botones de aviso
import { useState } from "react";
import MiCalendarioTab from "./mi-calendario/MiCalendarioTab";
import ReservasTab from "./ReservasTab";
import { Segmentado } from "../crm/kit";

const TABS = [
  { id: "reservas", texto: "Reservas" },
  { id: "micalendario", texto: "Horarios disponibles" },
];

export default function Agenda() {
  const [tab, setTab] = useState("reservas");

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#F2F6FA]">
      {/* Cabecera compacta: en el celular el espacio es para las citas. */}
      <header className="flex-none border-b border-neutral-200 bg-white/90 px-4 pb-3 pt-3 backdrop-blur-md sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#4f6672]">Calendario propio</p>
            <h1 className="font-fraunces text-[24px] font-bold leading-none text-primary-dark sm:text-[26px]">Agenda</h1>
            <p className="mt-1 hidden text-[12.5px] text-[#4f6672] sm:block">Citas, pagos y disponibilidad del equipo en una sola vista.</p>
          </div>
          <div className="w-full sm:w-auto">
            <Segmentado etiqueta="Secciones de la agenda" valor={tab} onCambio={setTab} opciones={TABS} />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "micalendario" && <MiCalendarioTab />}
        {tab === "reservas" && <ReservasTab />}
      </div>
    </div>
  );
}
