// Agenda del backoffice: tres pestañas (Mi calendario, Reuniones y
// Disponibilidad de Calendly) y el modal de cancelación de reuniones.
//
// 09/10/2026: el archivo tenía 1.205 líneas con todo dentro. Se partió sin
// cambiar el HTML (lo vigilan las instantáneas de Agenda.test.jsx):
//   useAgenda.js          estado de Reuniones/Disponibilidad y del modal
//   constantes.js         horarios, estados y tonos
//   utilidades.js         fechas, claves y estados de pago (puras)
//   mi-calendario/        el calendario propio (AgendaSlot / ReservaCita)
//   calendly/             reuniones, disponibilidad y modal de Calendly
import useAgenda from "./useAgenda";
import MiCalendarioTab from "./mi-calendario/MiCalendarioTab";
import ReunionesTab from "./calendly/ReunionesTab";
import DisponibilidadTab from "./calendly/DisponibilidadTab";
import ModalCancelacion from "./calendly/ModalCancelacion";

export default function Agenda() {
  const {
    tab, setTab,
    data, loading, days, setDays, error, copied, grouped, todayKey, isAdmin,
    loadEvents, copyBookingLink, openCancelModal,
    cancelModal, cancelStep, setCancelStep, cancelReason, setCancelReason, cancelling,
    closeCancelModal, handleCancel,
    avail, setAvail, availLoading, availError, copiedSlot, loadAvailability, copySlotLink,
  } = useAgenda();

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Topbar */}
      <header className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-200 bg-white/85 backdrop-blur-md z-20">
        <div className="min-w-[220px]">
          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[.16em] text-primary-light mb-0.5">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(34,201,131,.10)] animate-pulse" />
            Calendly sincronizado
          </div>
          <h1 className="font-fraunces text-[26px] leading-none font-bold text-primary-dark tracking-tight">Agenda</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">Citas, disponibilidad y carga del equipo en una sola vista.</p>
        </div>
        {/* Tabs */}
        <div className="flex gap-0.5 p-1 rounded-[14px] border border-neutral-200 bg-neutral-50 shadow-sm text-[11px] font-bold overflow-x-auto">
          <button
            onClick={() => setTab("micalendario")}
            className={`px-3.5 py-2.5 rounded-[10px] whitespace-nowrap transition-colors ${tab === "micalendario" ? "bg-primary-dark text-white shadow" : "text-neutral-500 hover:bg-white hover:text-primary-dark"}`}
          >
            Mi calendario
          </button>
          <button
            onClick={() => setTab("reuniones")}
            className={`px-3.5 py-2.5 rounded-[10px] whitespace-nowrap transition-colors ${tab === "reuniones" ? "bg-primary-dark text-white shadow" : "text-neutral-500 hover:bg-white hover:text-primary-dark"}`}
          >
            Reuniones (Calendly)
          </button>
          <button
            onClick={() => setTab("disponibilidad")}
            className={`px-3.5 py-2.5 rounded-[10px] whitespace-nowrap transition-colors ${tab === "disponibilidad" ? "bg-primary-dark text-white shadow" : "text-neutral-500 hover:bg-white hover:text-primary-dark"}`}
          >
            Disponibilidad (Calendly)
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* ===== TAB MI CALENDARIO (sistema propio) ===== */}
        {tab === "micalendario" && <MiCalendarioTab />}

        {/* ===== TAB REUNIONES ===== */}
        {tab === "reuniones" && (
          <ReunionesTab
            days={days} setDays={setDays} data={data} copied={copied}
            copyBookingLink={copyBookingLink} loadEvents={loadEvents}
            loading={loading} error={error} grouped={grouped} todayKey={todayKey}
            isAdmin={isAdmin} openCancelModal={openCancelModal}
          />
        )}

        {/* ===== TAB DISPONIBILIDAD ===== */}
        {tab === "disponibilidad" && (
          <DisponibilidadTab
            avail={avail} setAvail={setAvail} availLoading={availLoading} availError={availError}
            copiedSlot={copiedSlot} copySlotLink={copySlotLink} loadAvailability={loadAvailability}
          />
        )}
      </div>

      {/* Modal cancelación — doble confirmación */}
      {cancelModal && (
        <ModalCancelacion
          cancelModal={cancelModal} cancelStep={cancelStep} setCancelStep={setCancelStep}
          cancelReason={cancelReason} setCancelReason={setCancelReason} cancelling={cancelling}
          closeCancelModal={closeCancelModal} handleCancel={handleCancel}
        />
      )}
    </div>
  );
}
