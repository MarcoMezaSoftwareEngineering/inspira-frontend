// Estado de la pantalla Agenda: pestaña activa, reuniones y disponibilidad de
// Calendly y el modal de cancelación. Salió de Agenda.jsx al partirlo en
// piezas (09/10/2026); "Mi calendario" lleva su propio estado en
// mi-calendario/useMiCalendario.js.
import { useEffect, useMemo, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { getUserRole, groupByDay, toDateKey } from "./utilidades";

export default function useAgenda() {
  const [tab, setTab] = useState("micalendario"); // "micalendario" | "reuniones" | "disponibilidad"

  // --- Reuniones ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // --- Disponibilidad ---
  const [avail, setAvail] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState(null);
  const [copiedSlot, setCopiedSlot] = useState(null);

  const isAdmin = getUserRole() === "admin";

  function loadEvents(d = days) {
    setLoading(true);
    setError(null);
    boGET(`/backoffice/calendly/events?days=${d}`)
      .then((res) => { if (res.error) throw new Error(res.error); setData(res); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function loadAvailability() {
    if (avail) return; // ya cargado
    setAvailLoading(true);
    setAvailError(null);
    boGET("/backoffice/calendly/availability")
      .then((res) => { if (res.error) throw new Error(res.error); setAvail(res); })
      .catch((err) => setAvailError(err.message))
      .finally(() => setAvailLoading(false));
  }

  useEffect(() => { loadEvents(days); }, [days]);
  useEffect(() => { if (tab === "disponibilidad") loadAvailability(); }, [tab]);

  function openCancelModal(uuid, clientName) {
    setCancelModal({ uuid, clientName }); setCancelStep(1); setCancelReason("");
  }
  function closeCancelModal() {
    setCancelModal(null); setCancelStep(1); setCancelReason("");
  }
  async function handleCancel() {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const res = await boPOST(`/backoffice/calendly/events/${cancelModal.uuid}/cancel`, {
        reason: cancelReason.trim() || "Cancelado por el equipo de Inspira Legal",
      });
      if (res.error) throw new Error(res.error);
      closeCancelModal(); loadEvents(days);
    } catch (err) { dialog.toast("Error al cancelar: " + err.message, "error"); }
    finally { setCancelling(false); }
  }

  function copyBookingLink() {
    if (!data?.booking_url) return;
    navigator.clipboard.writeText(data.booking_url);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  function copySlotLink(url, key) {
    navigator.clipboard.writeText(url);
    setCopiedSlot(key); setTimeout(() => setCopiedSlot(null), 2000);
  }

  // Agrupar por día solo cuando llegan reuniones nuevas, no en cada render
  // (cada copia de enlace o tecla en el motivo de cancelación vuelve a pintar).
  const grouped = useMemo(() => groupByDay(data?.events || []), [data?.events]);
  // "Hoy" no se memoiza: tiene que cambiar si la pantalla sigue abierta pasada la medianoche.
  const todayKey = toDateKey(new Date());

  return {
    tab, setTab,
    data, loading, days, setDays, error, copied, grouped, todayKey, isAdmin,
    loadEvents, copyBookingLink, openCancelModal,
    cancelModal, cancelStep, setCancelStep, cancelReason, setCancelReason, cancelling,
    closeCancelModal, handleCancel,
    avail, setAvail, availLoading, availError, copiedSlot, loadAvailability, copySlotLink,
  };
}
