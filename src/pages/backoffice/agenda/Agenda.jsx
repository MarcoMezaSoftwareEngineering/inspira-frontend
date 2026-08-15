import { useEffect, useState } from "react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const DAYS_OPTIONS = [
  { label: "Hoy + 7 días", value: 7 },
  { label: "14 días", value: 14 },
  { label: "30 días", value: 30 },
];

const WDAY_ES = {
  sunday: "Domingo", monday: "Lunes", tuesday: "Martes",
  wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado",
};
const WDAY_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

const TZ = "America/Lima";

function getUserRole() {
  try { return JSON.parse(localStorage.getItem("bo_user") || "{}").rol || ""; }
  catch { return ""; }
}

export default function Agenda() {
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

  const grouped = groupByDay(data?.events || []);
  const todayKey = toDateKey(new Date());

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Agenda</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Sincronizado con Calendly</p>
        </div>
        {/* Tabs */}
        <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm font-medium">
          <button
            onClick={() => setTab("micalendario")}
            className={`px-4 py-2 transition-colors ${tab === "micalendario" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
          >
            Mi calendario
          </button>
          <button
            onClick={() => setTab("reuniones")}
            className={`px-4 py-2 transition-colors ${tab === "reuniones" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
          >
            Reuniones (Calendly)
          </button>
          <button
            onClick={() => setTab("disponibilidad")}
            className={`px-4 py-2 transition-colors ${tab === "disponibilidad" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
          >
            Disponibilidad (Calendly)
          </button>
        </div>
      </div>

      {/* ===== TAB MI CALENDARIO (sistema propio) ===== */}
      {tab === "micalendario" && <MiCalendarioTab />}

      {/* ===== TAB REUNIONES ===== */}
      {tab === "reuniones" && (
        <>
          {/* Controles */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
              {DAYS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setDays(opt.value)}
                  className={`px-3 py-1.5 transition-colors ${days === opt.value ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {data?.booking_url && (
              <button onClick={copyBookingLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"}`}>
                {copied ? "✓ Copiado" : "Copiar link de reserva"}
              </button>
            )}
            <button onClick={() => loadEvents(days)}
              className="px-3 py-1.5 rounded-lg text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
              Actualizar
            </button>
          </div>

          {loading ? <LoadingSkeleton /> : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">Error: {error}</div>
          ) : Object.keys(grouped).length === 0 ? (
            <EmptyState bookingUrl={data?.booking_url} onCopy={copyBookingLink} copied={copied} />
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateKey, events]) => (
                <DaySection key={dateKey} dateKey={dateKey} isToday={dateKey === todayKey}
                  events={events} isAdmin={isAdmin} onCancel={openCancelModal} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== TAB DISPONIBILIDAD ===== */}
      {tab === "disponibilidad" && (
        <div className="space-y-5">
          {availLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 h-48 animate-pulse" />
              ))}
            </div>
          ) : availError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              Error: {availError}
            </div>
          ) : avail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Horario semanal */}
              <WeeklyScheduleCard schedule={avail.schedule} />
              {/* Slots disponibles */}
              <AvailableSlotsCard
                slots={avail.available_slots}
                copiedSlot={copiedSlot}
                onCopySlot={copySlotLink}
                onRefresh={() => { setAvail(null); loadAvailability(); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal cancelación — doble confirmación */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {cancelStep === 1 && (
              <>
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-lg">⚠️</span>
                    <h3 className="text-base font-semibold text-neutral-800">Cancelar reunión</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Cliente: <span className="font-medium text-neutral-700">{cancelModal.clientName}</span>
                  </p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <label className="text-xs font-medium text-neutral-600 block">Motivo de cancelación</label>
                  <textarea
                    className="w-full border border-neutral-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                    rows={3} placeholder="Ej: Reagendamiento solicitado por el equipo..."
                    value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} autoFocus />
                  <p className="text-xs text-neutral-400">Este mensaje se enviará automáticamente al cliente por email.</p>
                </div>
                <div className="flex gap-2 px-6 pb-5 justify-end">
                  <button onClick={closeCancelModal}
                    className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200">Volver</button>
                  <button onClick={() => setCancelStep(2)}
                    className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium">Continuar →</button>
                </div>
              </>
            )}
            {cancelStep === 2 && (
              <>
                <div className="bg-red-50 border-b border-red-100 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-lg">🚨</span>
                    <h3 className="text-base font-semibold text-neutral-800">Confirmación final</h3>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                    <p className="font-semibold mb-1">Esta acción no se puede deshacer.</p>
                    <p>Se cancelará la reunión con <span className="font-medium">{cancelModal.clientName}</span> y Calendly le enviará un aviso por email.</p>
                  </div>
                  {cancelReason.trim() && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-600">
                      <span className="text-xs font-medium text-neutral-400 block mb-1">Motivo que se enviará:</span>
                      {cancelReason}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-6 pb-5 justify-end">
                  <button onClick={() => setCancelStep(1)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200">← Atrás</button>
                  <button onClick={handleCancel} disabled={cancelling}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50">
                    {cancelling ? "Cancelando..." : "Sí, cancelar definitivamente"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mi calendario (sistema propio: AgendaSlot / ReservaCita) ──── */
/* Vista de calendario semanal estilo Calendly: columnas = días, filas = medias horas. */

const HOUR_START = 7;   // 07:00
const HOUR_END = 21;    // 21:00 (el último renglón es 20:30–21:00)
const ROWS = (HOUR_END - HOUR_START) * 2;
const ROW_H = 30; // px por cada media hora

const ESTADO_BLOCK_STYLE = {
  LIBRE:     "bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-red-100 hover:border-red-300 hover:text-red-700",
  RESERVADO: "bg-amber-100 border-amber-300 text-amber-800 cursor-default",
  OCUPADO:   "bg-primary text-white border-primary cursor-default",
  BLOQUEADO: "bg-neutral-200 border-neutral-300 text-neutral-500 hover:bg-primary/10 hover:border-primary hover:text-primary",
};
const ESTADO_DOT = { LIBRE: "bg-emerald-400", RESERVADO: "bg-amber-400", OCUPADO: "bg-primary", BLOQUEADO: "bg-neutral-300" };
const ESTADO_LABEL = { LIBRE: "Libre — clic para borrar", RESERVADO: "Reservado (pago en curso)", OCUPADO: "Ocupado — cita confirmada", BLOQUEADO: "Bloqueado — clic para liberar" };

const WEEKDAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function toISODate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); r.setHours(0, 0, 0, 0); return r; }
function startOfDay(d) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
function rowLabel(row) {
  const totalMin = HOUR_START * 60 + row * 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}
function rangeLabel(weekDays) {
  const a = weekDays[0], b = weekDays[6];
  const mesA = a.toLocaleDateString("es-ES", { month: "short" });
  const mesB = b.toLocaleDateString("es-ES", { month: "short" });
  const anio = b.getFullYear();
  return mesA === mesB
    ? `${a.getDate()} – ${b.getDate()} de ${mesB} ${anio}`
    : `${a.getDate()} ${mesA} – ${b.getDate()} ${mesB} ${anio}`;
}

function MiCalendarioTab() {
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const desde = toISODate(weekDays[0]);
  const hasta = toISODate(weekDays[6]);

  const [slotMap, setSlotMap] = useState(new Map()); // "fecha|hora" -> slot
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyCell, setBusyCell] = useState(null); // "fecha|hora" en vuelo (evita doble clic)

  // Toolbar "generar varios de una vez"
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFecha, setBulkFecha] = useState(toISODate(new Date()));
  const [bulkDesde, setBulkDesde] = useState("09:00");
  const [bulkHasta, setBulkHasta] = useState("18:00");
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const [resSlots, resReservas] = await Promise.all([
        boGET(`/backoffice/agenda/slots?desde=${desde}&hasta=${hasta}`),
        boGET(`/backoffice/agenda/reservas?desde=${desde}&hasta=${hasta}`),
      ]);
      if (resSlots?.ok === false) throw new Error(resSlots.msg || "Error al cargar horarios");
      if (resReservas?.ok === false) throw new Error(resReservas.msg || "Error al cargar citas");
      const map = new Map();
      for (const s of resSlots?.slots || []) map.set(`${s.fecha}|${s.hora_inicio}`, s);
      setSlotMap(map);
      setReservas(resReservas?.reservas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [desde, hasta]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayKey = toISODate(new Date());
  const nowMin = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();

  function esPasado(fecha, hora) {
    if (fecha < todayKey) return true;
    if (fecha > todayKey) return false;
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m <= nowMin;
  }

  // Clic en celda vacía -> crea al instante un horario libre de 30 min
  async function crearSlotRapido(fecha, hora) {
    const key = `${fecha}|${hora}`;
    setBusyCell(key);
    const res = await boPOST("/backoffice/agenda/slots", { fecha, horas: [hora] });
    setBusyCell(null);
    if (res?.ok === false) return dialog.toast(res.msg || "No se pudo crear el horario", "error");
    cargar();
  }

  async function onClickSlot(slot) {
    if (slot.estado === "LIBRE") {
      const ok = await dialog.confirm(`¿Borrar el horario libre de las ${slot.hora_inicio}?`, "Borrar horario");
      if (!ok) return;
      const res = await boDELETE(`/backoffice/agenda/slots/${slot.id_slot}`);
      if (res?.ok === false) return dialog.toast(res.msg || "No se pudo borrar", "error");
      cargar();
    } else if (slot.estado === "BLOQUEADO") {
      const res = await boPATCH(`/backoffice/agenda/slots/${slot.id_slot}`, { estado: "LIBRE" });
      if (res?.ok === false) return dialog.toast(res.msg || "No se pudo desbloquear", "error");
      cargar();
    }
  }

  async function bloquearSlot(slot, e) {
    e.stopPropagation();
    const res = await boPATCH(`/backoffice/agenda/slots/${slot.id_slot}`, { estado: "BLOQUEADO" });
    if (res?.ok === false) return dialog.toast(res.msg || "No se pudo bloquear", "error");
    cargar();
  }

  async function crearBulk(e) {
    e.preventDefault();
    setCreando(true);
    try {
      const res = await boPOST("/backoffice/agenda/slots", { fecha: bulkFecha, desde: bulkDesde, hasta: bulkHasta });
      if (res?.ok === false) throw new Error(res.msg || "No se pudo crear el horario");
      dialog.toast(`${res.creados} horario(s) de 30 min creados para ${bulkFecha}.`, "success");
      setShowBulk(false);
      cargar();
    } catch (err) {
      dialog.toast(err.message, "error");
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar: navegación de semana + acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary transition-colors">
            ‹
          </button>
          <div className="text-sm font-semibold text-neutral-800 capitalize min-w-[180px] text-center">
            {rangeLabel(weekDays)}
          </div>
          <button onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary transition-colors">
            ›
          </button>
          <button onClick={() => setWeekStart(startOfDay(new Date()))}
            className="ml-1 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
            Hoy
          </button>
        </div>
        <button onClick={() => setShowBulk((v) => !v)}
          className="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          + Generar varios horarios
        </button>
      </div>

      {/* Panel "generar varios de una vez" (colapsable) */}
      {showBulk && (
        <form onSubmit={crearBulk} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-neutral-500">
            Fecha
            <input type="date" value={bulkFecha} onChange={(e) => setBulkFecha(e.target.value)} required
              className="block mt-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </label>
          <label className="text-xs text-neutral-500">
            Desde
            <input type="time" step="1800" value={bulkDesde} onChange={(e) => setBulkDesde(e.target.value)} required
              className="block mt-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </label>
          <label className="text-xs text-neutral-500">
            Hasta
            <input type="time" step="1800" value={bulkHasta} onChange={(e) => setBulkHasta(e.target.value)} required
              className="block mt-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </label>
          <button type="submit" disabled={creando}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-colors">
            {creando ? "Creando…" : "Generar bloques de 30 min"}
          </button>
          <p className="basis-full text-[11px] text-neutral-400">
            También puedes hacer clic directo en una celda vacía del calendario para crear un solo horario de 30 min.
          </p>
        </form>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">Error: {error}</div>}

      {/* Calendario semanal */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700">Tu semana</h3>
          <div className="flex gap-3 text-[10px] text-neutral-500">
            {Object.entries(ESTADO_DOT).map(([k, dot]) => (
              <span key={k} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                {k === "LIBRE" ? "Libre" : k === "RESERVADO" ? "Reservado" : k === "OCUPADO" ? "Ocupado" : "Bloqueado"}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Encabezado de días */}
            <div className="grid sticky top-0 z-10 bg-white border-b border-neutral-100" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
              <div />
              {weekDays.map((d) => {
                const key = toISODate(d);
                const isToday = key === todayKey;
                return (
                  <div key={key} className="flex flex-col items-center py-2.5">
                    <span className="text-[10px] uppercase tracking-wide text-neutral-400">{WEEKDAY_SHORT[d.getDay()]}</span>
                    <span className={`mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-primary text-white" : "text-neutral-700"}`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid de horas × días */}
            {loading ? (
              <div className="p-10 text-center text-sm text-neutral-400">Cargando…</div>
            ) : (
              <div className="relative grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)` }}>
                {/* Líneas de hora + etiquetas */}
                {Array.from({ length: ROWS }, (_, row) => (
                  <div key={`label-${row}`}
                    className="text-[10px] text-neutral-400 text-right pr-2 border-t border-neutral-100 -translate-y-1/2"
                    style={{ gridColumn: 1, gridRow: row + 1 }}>
                    {row % 2 === 0 ? rowLabel(row) : ""}
                  </div>
                ))}

                {/* Celdas por día */}
                {weekDays.map((d, dayIdx) => {
                  const fecha = toISODate(d);
                  return Array.from({ length: ROWS }, (_, row) => {
                    const hora = rowLabel(row);
                    const key = `${fecha}|${hora}`;
                    const slot = slotMap.get(key);
                    const pasado = esPasado(fecha, hora);

                    if (!slot) {
                      return (
                        <button
                          key={key}
                          disabled={pasado || busyCell === key}
                          onClick={() => crearSlotRapido(fecha, hora)}
                          title={pasado ? "" : `Crear horario ${hora}`}
                          className={`border-t border-l border-neutral-100 transition-colors ${
                            pasado ? "bg-neutral-50/60 cursor-default" : "hover:bg-primary/5 cursor-pointer"
                          } ${busyCell === key ? "bg-primary/10" : ""}`}
                          style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}
                        />
                      );
                    }

                    return (
                      <div key={key} className="relative group border-t border-l border-neutral-100" style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}>
                        <button
                          onClick={() => onClickSlot(slot)}
                          title={ESTADO_LABEL[slot.estado]}
                          className={`absolute inset-0.5 rounded-md border text-[10px] font-semibold flex items-center justify-center transition-colors ${ESTADO_BLOCK_STYLE[slot.estado]}`}
                        >
                          {hora}
                        </button>
                        {slot.estado === "LIBRE" && (
                          <button
                            onClick={(e) => bloquearSlot(slot, e)}
                            title="Bloquear este horario"
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white border border-neutral-300 text-neutral-500 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-primary hover:text-primary transition-opacity"
                          >
                            🔒
                          </button>
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-neutral-400 px-4 py-3 border-t border-neutral-100">
          Clic en una celda vacía para crear un horario · clic en uno libre para borrarlo (🔒 para bloquearlo) · clic en uno bloqueado para liberarlo.
        </p>
      </div>

      {/* Citas confirmadas */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Citas confirmadas y pagadas esta semana</h3>
        {reservas.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">No hay citas en este rango.</p>
        ) : (
          <div className="space-y-3">
            {reservas.map((r) => (
              <ReservaCard key={r.id_reserva} reserva={r} onChanged={cargar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ tone, children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-neutral-100 text-neutral-500 border-neutral-200",
    primary: "bg-primary/10 text-primary border-primary/20",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tones[tone]}`}>{children}</span>;
}

function pagoTone(estado) {
  return { APROBADO: "green", PENDIENTE: "amber", RECHAZADO: "red", REEMBOLSADO: "neutral" }[estado] || "neutral";
}
function reservaTone(estado) {
  return { CONFIRMADA: "primary", COMPLETADA: "neutral", CANCELADA: "red", PENDIENTE_PAGO: "amber", EXPIRADA: "neutral" }[estado] || "neutral";
}

function ReservaCard({ reserva: r, onChanged }) {
  const [editando, setEditando] = useState(false);

  async function editarMeet() {
    const url = await dialog.prompt("Enlace de Google Meet:", r.meet_url || "", "Editar enlace de reunión");
    if (url === null) return;
    setEditando(true);
    const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { meet_url: url });
    setEditando(false);
    if (res?.ok === false) return dialog.toast(res.msg || "No se pudo actualizar", "error");
    onChanged();
  }

  async function cancelar() {
    const ok = await dialog.confirm(`¿Cancelar la cita de ${r.cliente?.nombre || r.cliente?.email_contacto}? Esto libera el horario.`, "Cancelar cita");
    if (!ok) return;
    const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { estado: "CANCELADA" });
    if (res?.ok === false) return dialog.toast(res.msg || "No se pudo cancelar", "error");
    onChanged();
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 border border-neutral-100 rounded-xl p-3 hover:border-neutral-200 transition-colors">
      <div className="w-24 flex-shrink-0">
        <div className="text-sm font-bold text-primary">{r.hora_inicio}</div>
        <div className="text-[10px] text-neutral-400">{r.fecha}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-neutral-800">{r.cliente?.nombre || "Sin nombre"}</div>
        <div className="text-xs text-neutral-500">{r.cliente?.email_contacto}{r.cliente?.telefono ? ` · ${r.cliente.telefono}` : ""}</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Pill tone="neutral">{r.monto} {r.moneda}</Pill>
          <Pill tone={pagoTone(r.pago_estado)}>Pago {r.pago_estado.toLowerCase()}</Pill>
          <Pill tone={reservaTone(r.estado)}>{r.estado.toLowerCase().replaceAll("_", " ")}</Pill>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {r.meet_url ? (
          <a href={r.meet_url} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100">
            Unirse
          </a>
        ) : (
          <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs">Sin Meet</span>
        )}
        <button onClick={editarMeet} disabled={editando}
          className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:border-neutral-300 disabled:opacity-50">
          Editar link
        </button>
        {r.estado !== "CANCELADA" && (
          <button onClick={cancelar}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Horario semanal ──────────────────────────────────────────── */
function WeeklyScheduleCard({ schedule }) {
  if (!schedule) return null;
  const rulesMap = Object.fromEntries(schedule.rules.map((r) => [r.wday, r.intervals]));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">Horario semanal</h3>
        <span className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded px-2 py-0.5">
          {schedule.timezone}
        </span>
      </div>
      <div className="space-y-2">
        {WDAY_ORDER.map((wday) => {
          const intervals = rulesMap[wday] || [];
          const isOpen = intervals.length > 0;
          return (
            <div key={wday} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isOpen ? "bg-green-50" : "bg-neutral-50"}`}>
              <span className={`text-sm font-medium ${isOpen ? "text-neutral-700" : "text-neutral-400"}`}>
                {WDAY_ES[wday]}
              </span>
              {isOpen ? (
                <div className="flex gap-2">
                  {intervals.map((iv, i) => (
                    <span key={i} className="text-xs font-semibold text-green-700 bg-green-100 border border-green-200 rounded px-2 py-0.5">
                      {iv.from} – {iv.to}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-neutral-400">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-400 mt-3">
        * Para modificar el horario, hazlo directamente en Calendly.
      </p>
    </div>
  );
}

/* ── Slots disponibles ────────────────────────────────────────── */
function AvailableSlotsCard({ slots, copiedSlot, onCopySlot, onRefresh }) {
  // Agrupar por día en zona horaria Lima
  const grouped = {};
  slots.forEach((s) => {
    const dayKey = new Date(s.start_time).toLocaleDateString("es-ES", {
      timeZone: TZ, weekday: "long", day: "numeric", month: "long",
    });
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(s);
  });

  const totalSlots = slots.length;
  const days = Object.keys(grouped).length;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-700">Slots disponibles</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Próximos 7 días · {totalSlots} huecos en {days} días</p>
        </div>
        <button onClick={onRefresh}
          className="text-xs text-neutral-500 hover:text-primary border border-neutral-200 rounded-lg px-2.5 py-1 hover:border-primary transition-colors">
          Actualizar
        </button>
      </div>

      {totalSlots === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
          Sin slots disponibles esta semana
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-80 pr-1">
          {Object.entries(grouped).map(([dayLabel, daySlots]) => (
            <div key={dayLabel}>
              <p className="text-xs font-semibold text-neutral-500 capitalize mb-1.5">{dayLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {daySlots.map((s) => {
                  const timeStr = new Date(s.start_time).toLocaleTimeString("es-ES", {
                    timeZone: TZ, hour: "2-digit", minute: "2-digit",
                  });
                  const slotKey = s.start_time;
                  const isCopied = copiedSlot === slotKey;
                  return (
                    <button
                      key={slotKey}
                      onClick={() => onCopySlot(s.scheduling_url, slotKey)}
                      title="Clic para copiar link de este slot"
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isCopied
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-primary hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {isCopied ? "✓" : "🔗"} {timeStr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
        Clic en un slot para copiar el link directo y mandárselo a un cliente.
      </p>
    </div>
  );
}

/* ── Day Section ──────────────────────────────────────────────── */
function DaySection({ dateKey, isToday, events, isAdmin, onCancel }) {
  const date = new Date(dateKey + "T12:00:00");
  const label = isToday ? "Hoy"
    : date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${isToday ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"}`}>
          {label}
        </div>
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">{events.length} reunión{events.length !== 1 ? "es" : ""}</span>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <EventCard key={event.uuid} event={event} isAdmin={isAdmin} onCancel={onCancel} />
        ))}
      </div>
    </div>
  );
}

/* ── Event Card ───────────────────────────────────────────────── */
function EventCard({ event, isAdmin, onCancel }) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const now = new Date();
  const isPast = end < now;
  const isNow = start <= now && now <= end;
  const invitee = event.invitees?.[0];
  const duration = Math.round((end - start) / 60000);
  const msUntil = start - now;
  const hoursUntil = Math.floor(msUntil / 3600000);
  const minutesUntil = Math.floor((msUntil % 3600000) / 60000);
  const countdown = msUntil > 0 && msUntil < 86400000
    ? hoursUntil > 0 ? `en ${hoursUntil}h ${minutesUntil}m` : `en ${minutesUntil} min`
    : null;
  const bookedAt = invitee?.created_at
    ? new Date(invitee.created_at).toLocaleDateString("es-ES", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${
      isNow ? "border-primary ring-2 ring-primary/20" : isPast ? "border-neutral-100 opacity-60" : "border-neutral-200 hover:border-neutral-300"
    }`}>
      {isNow && <div className="bg-primary text-white text-xs font-semibold text-center py-1 tracking-wide">EN CURSO AHORA</div>}
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Hora */}
        <div className="flex-shrink-0 w-28 text-center sm:text-left">
          <div className="text-2xl font-bold text-primary leading-tight">
            {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} – {end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-neutral-400">{duration} min</div>
          <StatusBadge status={event.status} past={isPast} isNow={isNow} />
          {countdown && <div className="mt-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 inline-block">{countdown}</div>}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-neutral-800">{invitee?.name || "Sin datos del cliente"}</span>
            <span className="text-xs text-neutral-400 bg-neutral-100 rounded px-2 py-0.5">{event.event_name}</span>
          </div>
          {invitee?.email && (
            <a href={`mailto:${invitee.email}`} className="text-xs text-primary hover:underline block">{invitee.email}</a>
          )}
          {(invitee?.questions || []).map((q, i) => (
            <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{q.question}</div>
              <div className="text-xs text-neutral-700">{q.answer}</div>
            </div>
          ))}
          {bookedAt && <div className="text-[10px] text-neutral-400 mt-1">Agendado el {bookedAt}</div>}
        </div>
        {/* Acciones */}
        <div className="flex sm:flex-col gap-2 flex-wrap items-start sm:items-end justify-end flex-shrink-0">
          {event.location && !isPast && (
            <a href={event.location} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 10l4.553-2.776A1 1 0 0121 8.175v7.65a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Unirse
            </a>
          )}
          {invitee?.reschedule_url && !isPast && (
            <a href={invitee.reschedule_url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:border-neutral-300 transition-colors">
              Reprogramar
            </a>
          )}
          {isAdmin && !isPast && event.status === "active" && (
            <button onClick={() => onCancel(event.uuid, invitee?.name || "cliente")}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */
function StatusBadge({ status, past, isNow }) {
  if (isNow) return null;
  if (past) return <span className="text-[10px] text-neutral-400 mt-1 block">Completada</span>;
  if (status === "canceled") return <span className="text-[10px] text-red-400 mt-1 block font-medium">Cancelada</span>;
  return <span className="text-[10px] text-green-600 mt-1 block font-medium">Confirmada</span>;
}

function EmptyState({ bookingUrl, onCopy, copied }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center">
      <div className="text-4xl mb-3">📅</div>
      <div className="text-base font-semibold text-neutral-700 mb-1">No hay reuniones programadas</div>
      <div className="text-sm text-neutral-400 mb-5">Para este período no tienes citas agendadas.</div>
      {bookingUrl && (
        <button onClick={onCopy}
          className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-primary text-white border-primary hover:opacity-90"}`}>
          {copied ? "✓ Link copiado" : "Copiar link de reserva para clientes"}
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, g) => (
        <div key={g}>
          <div className="h-6 w-32 bg-neutral-100 rounded-full mb-3 animate-pulse" />
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-xl p-4 flex gap-4 animate-pulse">
                <div className="w-24 space-y-2"><div className="h-7 bg-neutral-100 rounded" /><div className="h-3 bg-neutral-100 rounded w-2/3" /></div>
                <div className="flex-1 space-y-2"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-3 bg-neutral-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function toDateKey(date) { return date.toISOString().slice(0, 10); }
function groupByDay(events) {
  const groups = {};
  events.forEach((ev) => {
    const key = toDateKey(new Date(ev.start_time));
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}
