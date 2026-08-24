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
          <div className="h-full overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Controles */}
            <div className="flex items-center gap-2 flex-wrap bg-white/80 border border-neutral-200 rounded-2xl shadow-sm p-3">
              <div className="flex p-0.5 rounded-xl border border-neutral-200 overflow-hidden text-xs bg-white">
                {DAYS_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setDays(opt.value)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${days === opt.value ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {data?.booking_url && (
                <button onClick={copyBookingLink}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"}`}>
                  {copied ? "✓ Copiado" : "Copiar link de reserva"}
                </button>
              )}
              <button onClick={() => loadEvents(days)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
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
          </div>
        )}

        {/* ===== TAB DISPONIBILIDAD ===== */}
        {tab === "disponibilidad" && (
          <div className="h-full overflow-y-auto p-4 sm:p-5 space-y-5">
            {availLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 h-48 animate-pulse" />
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
      </div>

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
const ROW_H = 29; // px por cada media hora

const ESTADO_DOT = { LIBRE: "bg-emerald-400", RESERVADO: "bg-amber-400", OCUPADO: "bg-primary", BLOQUEADO: "bg-neutral-300" };
const ESTADO_LABEL = { LIBRE: "Libre — clic para borrar", RESERVADO: "Reservado (pago en curso)", OCUPADO: "Ocupado — cita confirmada", BLOQUEADO: "Bloqueado — clic para liberar" };
const ESTADO_NOMBRE = { LIBRE: "Libre", RESERVADO: "Reservado", OCUPADO: "Ocupado", BLOQUEADO: "Bloqueado" };
// Tonos de evento inspirados en el mock: verde=libre, ámbar=reservado, verde sólido=ocupado, gris=bloqueado.
const EVENT_TONE = {
  LIBRE:     "bg-[#dff7eb] text-[#0c6545] border-[#bce8d2]",
  RESERVADO: "bg-[#fff0e4] text-[#a75928] border-[#f7d5bd]",
  OCUPADO:   "bg-[#145f43] text-white border-[#145f43]",
  BLOQUEADO: "bg-neutral-100 text-neutral-500 border-neutral-300",
};

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

function iniciales(nombre) {
  if (!nombre) return "?";
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] || "") + (partes[1]?.[0] || "")).toUpperCase();
}

function MiCalendarioTab() {
  const esAdmin = getUserRole() === "admin";

  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const desde = toISODate(weekDays[0]);
  const hasta = toISODate(weekDays[6]);

  const [asesores, setAsesores] = useState([]);
  const [filtro, setFiltro] = useState(esAdmin ? "todos" : "yo"); // "todos" | "yo" | id_usuario
  const [viewMode, setViewMode] = useState("semana"); // "semana" | "dia"

  const [slotMap, setSlotMap] = useState(new Map()); // "fecha|hora" -> slot[]
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

  // Solo admin: cargar el combo de asesores una vez
  useEffect(() => {
    if (!esAdmin) return;
    boGET("/backoffice/usuarios-internos").then((res) => {
      if (res?.ok) setAsesores(res.usuarios || []);
    });
  }, [esAdmin]);

  const combinado = esAdmin && filtro === "todos"; // vista de todo el equipo a la vez
  const idUsuarioObjetivo = esAdmin && filtro !== "todos" && filtro !== "yo" ? Number(filtro) : null;

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const qs = `desde=${desde}&hasta=${hasta}${idUsuarioObjetivo ? `&id_usuario=${idUsuarioObjetivo}` : ""}`;
      const [resSlots, resReservas] = await Promise.all([
        boGET(`/backoffice/agenda/slots?${qs}`),
        boGET(`/backoffice/agenda/reservas?${qs}`),
      ]);
      if (resSlots?.ok === false) throw new Error(resSlots.msg || "Error al cargar horarios");
      if (resReservas?.ok === false) throw new Error(resReservas.msg || "Error al cargar citas");
      const map = new Map();
      for (const s of resSlots?.slots || []) {
        const k = `${s.fecha}|${s.hora_inicio}`;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(s);
      }
      setSlotMap(map);
      setReservas(resReservas?.reservas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [desde, hasta, filtro]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (combinado) return; // ambiguo a quién pertenecería: hay que elegir un asesor primero
    const key = `${fecha}|${hora}`;
    setBusyCell(key);
    const body = { fecha, horas: [hora] };
    if (idUsuarioObjetivo) body.id_usuario = idUsuarioObjetivo;
    const res = await boPOST("/backoffice/agenda/slots", body);
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
      const body = { fecha: bulkFecha, desde: bulkDesde, hasta: bulkHasta };
      if (idUsuarioObjetivo) body.id_usuario = idUsuarioObjetivo;
      const res = await boPOST("/backoffice/agenda/slots", body);
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

  // ── Datos derivados para las métricas, capacidad y panel lateral ──
  const reservasActivas = reservas.filter((r) => r.estado !== "CANCELADA");
  const reservasOrdenadas = [...reservasActivas].sort(
    (a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio)
  );

  const todosSlots = Array.from(slotMap.values()).flat();
  const slotsLibres = todosSlots.filter((s) => s.estado === "LIBRE");
  const slotsOcupados = todosSlots.filter((s) => s.estado === "OCUPADO" || s.estado === "RESERVADO");
  const horasLibres = (slotsLibres.length * 0.5).toLocaleString("es-PE", { maximumFractionDigits: 1 });
  const ocupacionPct = todosSlots.length ? Math.round((slotsOcupados.length / todosSlots.length) * 100) : 0;
  const pagosPendientes = reservas.filter((r) => r.pago_estado === "PENDIENTE").length;

  // Cruce slot -> reserva, para mostrar el nombre del cliente dentro del bloque del calendario.
  const reservaPorClave = new Map();
  for (const r of reservas) {
    const k = combinado && r.asesor ? `${r.fecha}|${r.hora_inicio}|${r.asesor.id_usuario}` : `${r.fecha}|${r.hora_inicio}`;
    reservaPorClave.set(k, r);
  }
  function claveDeSlot(slot) {
    return combinado && slot.asesor ? `${slot.fecha}|${slot.hora_inicio}|${slot.asesor.id_usuario}` : `${slot.fecha}|${slot.hora_inicio}`;
  }

  // Días a mostrar en el grid: semana completa o solo el primer día del rango (vista "Día")
  const displayedDays = viewMode === "dia" ? weekDays.slice(0, 1) : weekDays;
  const stepDias = viewMode === "dia" ? 1 : 7;
  const hoyEnRango = displayedDays.some((d) => toISODate(d) === todayKey);
  const nowLineTop = ((nowMin - HOUR_START * 60) / 30) * ROW_H;
  const mostrarNowLine = hoyEnRango && nowMin >= HOUR_START * 60 && nowMin <= HOUR_END * 60;

  function rangoTexto() {
    if (viewMode === "semana") return rangeLabel(weekDays);
    const d = weekDays[0];
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  }

  const tituloCalendario = combinado
    ? "Todo el equipo"
    : filtro === "yo"
      ? "Tu calendario"
      : asesores.find((a) => String(a.id_usuario) === String(filtro))?.nombre || "Tu calendario";

  return (
    <div className="h-full flex flex-col min-h-0 p-3 sm:p-4 gap-3">
      {/* Toolbar: navegación + filtro + vista + acciones */}
      <div className="flex-none grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-2.5 items-stretch">
        <div className="flex items-center gap-1.5 flex-wrap bg-white border border-neutral-200 rounded-2xl shadow-sm px-2 py-1.5 min-h-[46px]">
          <button onClick={() => setWeekStart((d) => addDays(d, -stepDias))}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] border border-neutral-200 text-neutral-500 font-extrabold hover:border-primary hover:text-primary transition-colors bg-white flex-shrink-0">
            ‹
          </button>
          <div className="text-[11.5px] font-extrabold text-neutral-800 capitalize min-w-[150px] text-center">
            {rangoTexto()}
          </div>
          <button onClick={() => setWeekStart((d) => addDays(d, stepDias))}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] border border-neutral-200 text-neutral-500 font-extrabold hover:border-primary hover:text-primary transition-colors bg-white flex-shrink-0">
            ›
          </button>
          <button onClick={() => setWeekStart(startOfDay(new Date()))}
            className="h-[34px] px-3 rounded-[10px] text-[11px] font-extrabold border border-neutral-200 text-neutral-600 hover:bg-secondary-light hover:text-primary hover:border-primary/30 bg-white flex-shrink-0">
            Hoy
          </button>
          {esAdmin && (
            <div className="relative min-w-[170px] max-w-[240px] flex-1">
              <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
                className="w-full h-[34px] border border-neutral-200 rounded-[10px] px-3 text-[11px] font-bold text-neutral-700 focus:outline-none focus:border-primary bg-white appearance-none">
                <option value="todos">Todo el equipo</option>
                <option value="yo">Yo</option>
                {asesores.map((a) => (
                  <option key={a.id_usuario} value={a.id_usuario}>{a.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center bg-white border border-neutral-200 rounded-2xl shadow-sm px-1.5 min-h-[46px]">
          <div className="flex gap-0.5 bg-neutral-100 p-[3px] rounded-[10px]">
            <button onClick={() => setViewMode("semana")}
              className={`px-2.5 py-[7px] rounded-[8px] text-[10.5px] font-extrabold transition-colors ${viewMode === "semana" ? "bg-white text-primary-dark shadow-sm" : "text-neutral-500"}`}>
              Semana
            </button>
            <button onClick={() => setViewMode("dia")}
              className={`px-2.5 py-[7px] rounded-[8px] text-[10.5px] font-extrabold transition-colors ${viewMode === "dia" ? "bg-white text-primary-dark shadow-sm" : "text-neutral-500"}`}>
              Día
            </button>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowBulk((v) => !v)} disabled={combinado}
            title={combinado ? "Elige un asesor específico para crear horarios" : undefined}
            className="w-full lg:w-auto h-full min-h-[46px] flex items-center justify-center gap-1.5 px-[17px] rounded-2xl text-white text-[11px] font-extrabold shadow-[0_10px_24px_rgba(229,147,87,.22)] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
            style={{ background: "radial-gradient(circle at 85% 15%,rgba(255,255,255,.28),transparent 30%), linear-gradient(135deg,#efaa73,#f5c49e)" }}>
            + Generar horarios
          </button>

          {/* Panel "generar varios de una vez" — popover anclado al botón */}
          {showBulk && !combinado && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowBulk(false)} />
              <form onSubmit={crearBulk}
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-[290px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3">
                <label className="text-xs text-neutral-500">
                  Fecha
                  <input type="date" value={bulkFecha} onChange={(e) => setBulkFecha(e.target.value)} required
                    className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </label>
                <div className="flex gap-2">
                  <label className="text-xs text-neutral-500 flex-1">
                    Desde
                    <input type="time" step="1800" value={bulkDesde} onChange={(e) => setBulkDesde(e.target.value)} required
                      className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </label>
                  <label className="text-xs text-neutral-500 flex-1">
                    Hasta
                    <input type="time" step="1800" value={bulkHasta} onChange={(e) => setBulkHasta(e.target.value)} required
                      className="block mt-1 w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </label>
                </div>
                <button type="submit" disabled={creando}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-light disabled:opacity-50 transition-colors">
                  {creando ? "Creando…" : "Generar bloques de 30 min"}
                </button>
                <p className="text-[10.5px] text-neutral-400">
                  También puedes hacer clic directo en una celda vacía del calendario para crear un solo horario de 30 min.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {error && <div className="flex-none bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">Error: {error}</div>}

      {/* ===== Calendario + panel lateral ===== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_336px] gap-3">
        {/* Calendario */}
        <section className="min-w-0 min-h-0 flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex-none flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-neutral-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-[34px] h-[34px] rounded-[11px] bg-secondary text-primary grid place-items-center flex-shrink-0 text-base">📅</div>
              <div className="min-w-0">
                <strong className="block text-[12.5px] text-neutral-800 truncate">{tituloCalendario}</strong>
                <span className="block text-[9.5px] text-neutral-400 mt-0.5">{viewMode === "dia" ? "Vista diaria" : "Semana actual"} · hora local</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              {Object.entries(ESTADO_DOT).map(([k, dot]) => (
                <span key={k} className="flex items-center gap-1 text-[9.5px] text-neutral-500">
                  <span className={`w-[7px] h-[7px] rounded-full ${dot}`} />
                  {ESTADO_NOMBRE[k]}
                </span>
              ))}
            </div>
          </div>
          {combinado && (
            <p className="flex-none text-[10.5px] text-neutral-400 px-3.5 pt-1.5">
              Cuando dos asesores tienen horario a la misma hora, verás varios bloques juntos en esa celda.
            </p>
          )}

          <div className="flex-1 min-h-0 overflow-auto">
            <div style={{ minWidth: displayedDays.length > 1 ? 700 : 260 }}>
              {/* Encabezado de días */}
              <div className="grid sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-neutral-100" style={{ gridTemplateColumns: `52px repeat(${displayedDays.length}, minmax(90px,1fr))` }}>
                <div className="sticky left-0 bg-white z-10" />
                {displayedDays.map((d) => {
                  const key = toISODate(d);
                  const isToday = key === todayKey;
                  return (
                    <div key={key} className={`flex flex-col items-center gap-1 py-2.5 ${isToday ? "bg-gradient-to-b from-secondary-light to-transparent" : ""}`}>
                      <span className="text-[9px] uppercase tracking-[.12em] text-neutral-400 font-extrabold">{WEEKDAY_SHORT[d.getDay()]}</span>
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-extrabold ${isToday ? "bg-primary-dark text-white shadow" : "text-neutral-700"}`}>
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
                <div className="relative grid" style={{ gridTemplateColumns: `52px repeat(${displayedDays.length}, minmax(90px,1fr))`, gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)` }}>
                  {mostrarNowLine && (
                    <div className="absolute right-0 h-px bg-[#f17860] z-[6] pointer-events-none" style={{ left: 52, top: nowLineTop }}>
                      <span className="absolute -left-[4px] -top-[3px] w-[7px] h-[7px] rounded-full bg-[#f17860]" />
                    </div>
                  )}
                  {/* Líneas de hora + etiquetas (columna fija al hacer scroll horizontal) */}
                  {Array.from({ length: ROWS }, (_, row) => (
                    <div key={`label-${row}`}
                      className="sticky left-0 z-10 bg-white text-[9px] text-neutral-400 font-semibold text-right pr-2 border-t border-neutral-100 -translate-y-1/2"
                      style={{ gridColumn: 1, gridRow: row + 1 }}>
                      {row % 2 === 0 ? rowLabel(row) : ""}
                    </div>
                  ))}

                  {/* Celdas por día */}
                  {displayedDays.map((d, dayIdx) => {
                    const fecha = toISODate(d);
                    return Array.from({ length: ROWS }, (_, row) => {
                      const hora = rowLabel(row);
                      const key = `${fecha}|${hora}`;
                      const arr = slotMap.get(key) || [];
                      const pasado = esPasado(fecha, hora);

                      if (arr.length === 0) {
                        return (
                          <button
                            key={key}
                            disabled={pasado || busyCell === key || combinado}
                            onClick={() => crearSlotRapido(fecha, hora)}
                            title={pasado || combinado ? "" : `Crear horario ${hora}`}
                            className={`border-t border-l border-neutral-100 transition-colors ${
                              pasado || combinado ? "bg-neutral-50/60 cursor-default" : "hover:bg-secondary-light cursor-pointer"
                            } ${busyCell === key ? "bg-primary/10" : ""}`}
                            style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}
                          />
                        );
                      }

                      if (arr.length === 1) {
                        const slot = arr[0];
                        const reservaDelSlot = (slot.estado === "RESERVADO" || slot.estado === "OCUPADO")
                          ? reservaPorClave.get(claveDeSlot(slot)) : null;
                        const titulo = reservaDelSlot?.cliente?.nombre || ESTADO_NOMBRE[slot.estado];
                        const subtitulo = combinado && slot.asesor ? `${hora} · ${slot.asesor.nombre}` : hora;
                        return (
                          <div key={key} className="relative group border-t border-l border-neutral-100 p-[3px]" style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}>
                            <button
                              onClick={() => onClickSlot(slot)}
                              title={`${ESTADO_LABEL[slot.estado]}${slot.asesor ? ` — ${slot.asesor.nombre}` : ""}`}
                              className={`w-full h-full rounded-[9px] border px-1.5 flex flex-col justify-center overflow-hidden text-left shadow-sm transition-transform hover:-translate-y-px ${EVENT_TONE[slot.estado]} ${slot.estado === "LIBRE" || slot.estado === "BLOQUEADO" ? "cursor-pointer" : "cursor-default"}`}
                            >
                              <b className="block text-[9px] font-extrabold leading-tight truncate">{titulo}</b>
                              <small className="block text-[8px] opacity-75 leading-tight truncate">{subtitulo}</small>
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
                      }

                      // Varios asesores con horario a la misma hora -> mini bloques lado a lado (cruce visible)
                      return (
                        <div key={key} className="flex gap-0.5 p-[3px] border-t border-l border-neutral-100" style={{ gridColumn: dayIdx + 2, gridRow: row + 1 }}>
                          {arr.map((slot) => (
                            <button
                              key={slot.id_slot}
                              onClick={() => onClickSlot(slot)}
                              title={`${slot.asesor?.nombre || ""} — ${ESTADO_LABEL[slot.estado]}`}
                              className={`flex-1 rounded-[7px] border text-[8px] font-extrabold flex items-center justify-center transition-colors ${EVENT_TONE[slot.estado]}`}
                            >
                              {iniciales(slot.asesor?.nombre)}
                            </button>
                          ))}
                        </div>
                      );
                    });
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-none px-3.5 py-2 border-t border-neutral-100 text-[9.5px] text-neutral-400">
            {combinado
              ? "Elige un asesor en el selector de arriba para crear o modificar horarios."
              : "Clic en una celda vacía para crear un horario · clic en uno libre para borrarlo (🔒 para bloquearlo) · clic en uno bloqueado para liberarlo."}
          </div>
        </section>

        {/* Panel lateral */}
        <aside className="min-w-0 min-h-0 grid grid-rows-[auto_auto_minmax(0,1fr)] gap-2.5 overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            <StatTile k="Citas esta semana" value={reservasActivas.length} note={combinado ? "en todo el equipo" : "tuyas"} />
            <StatTile k="Disponibilidad libre" value={`${horasLibres} h`} note={combinado ? "en todo el equipo" : "tuya"} />
            <StatTile k="Pagos pendientes" value={pagosPendientes} note="requieren revisión" />
            <StatTile k="Ocupación semanal" value={`${ocupacionPct}%`} note="objetivo 70%" />
          </div>

          <div className="relative overflow-hidden rounded-2xl p-4 text-white"
            style={{ background: "radial-gradient(circle at 95% 0%,rgba(122,232,174,.32),transparent 35%), linear-gradient(145deg,#125a40,#0b432f)" }}>
            <div className="flex items-center justify-between gap-2">
              <b className="text-xs">Capacidad semanal</b>
              <span className="text-[8.5px] text-emerald-200 bg-white/10 border border-white/10 rounded-full px-2 py-1">Objetivo 70%</span>
            </div>
            <div className="h-[7px] bg-white/15 rounded-full overflow-hidden my-2.5">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, ocupacionPct)}%`, background: "linear-gradient(90deg,#6ee0aa,#b9f1d2)" }} />
            </div>
            <div className="flex justify-between text-white/60 text-[8.5px]">
              <span>{ocupacionPct}% ocupado</span>
              <span>{horasLibres} h libres</span>
            </div>
          </div>

          <section className="min-h-0 flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex-none flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-neutral-100">
              <div>
                <span className="block text-[8.5px] uppercase tracking-[.12em] text-neutral-400 font-extrabold mb-0.5">Prioridad</span>
                <b className="text-[12px] text-neutral-800">Próximas citas</b>
              </div>
              <span className="min-w-[24px] h-6 px-2 rounded-full grid place-items-center bg-secondary text-primary text-[10px] font-extrabold">
                {reservasOrdenadas.length}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
              {reservasOrdenadas.length === 0 ? (
                <p className="text-[10px] text-neutral-400 text-center py-6">No hay citas en este rango.</p>
              ) : (
                reservasOrdenadas.map((r) => (
                  <ApptRow key={r.id_reserva} reserva={r} onChanged={cargar} mostrarAsesor={combinado}
                    pasada={esPasado(r.fecha, r.hora_inicio)} />
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatTile({ k, value, note }) {
  return (
    <div className="relative min-h-[68px] bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 overflow-hidden">
      <div className="absolute w-16 h-16 rounded-full -right-5 -top-5 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(111,224,171,.14),transparent 70%)" }} />
      <span className="relative block text-[9px] font-bold text-neutral-400">{k}</span>
      <strong className="relative block text-lg font-extrabold text-neutral-800 leading-tight mt-1 tracking-tight">{value}</strong>
      <em className="relative block not-italic text-[8.5px] text-neutral-400 mt-0.5 truncate">{note}</em>
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
// El estado de la reserva ya implica un pago_estado la mayoría de las veces
// (PENDIENTE_PAGO/EXPIRADA -> PENDIENTE, CONFIRMADA/COMPLETADA -> APROBADO).
// Repetirlo en un segundo pill no suma nada; solo vale mostrarlo cuando el
// pago cuenta algo que el estado de la reserva no dice por sí solo (p.ej.
// una cita CANCELADA cuyo pago fue REEMBOLSADO, o una EXPIRADA cuyo pago fue
// RECHAZADO en vez de simplemente nunca completado).
const PAGO_IMPLICITO_POR_ESTADO = {
  PENDIENTE_PAGO: "PENDIENTE",
  EXPIRADA: "PENDIENTE",
  // Una cita cancelada que nunca se pagó no necesita el pill "Pago pendiente";
  // si en cambio se pagó y se devolvió, pago_estado será REEMBOLSADO y sí se
  // muestra, que es justo el caso en que aporta información.
  CANCELADA: "PENDIENTE",
  CONFIRMADA: "APROBADO",
  COMPLETADA: "APROBADO",
};
function pagoEsRedundante(estadoReserva, pagoEstado) {
  return PAGO_IMPLICITO_POR_ESTADO[estadoReserva] === pagoEstado;
}

async function editarMeetReserva(r, onChanged, setEditando) {
  const url = await dialog.prompt("Enlace de Google Meet:", r.meet_url || "", "Editar enlace de reunión");
  if (url === null) return;
  setEditando?.(true);
  const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { meet_url: url });
  setEditando?.(false);
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo actualizar", "error");
  onChanged();
}

async function cancelarReserva(r, onChanged) {
  const ok = await dialog.confirm(`¿Cancelar la cita de ${r.cliente?.nombre || r.cliente?.email_contacto}? Esto libera el horario.`, "Cancelar cita");
  if (!ok) return;
  const res = await boPATCH(`/backoffice/agenda/reservas/${r.id_reserva}`, { estado: "CANCELADA" });
  if (res?.ok === false) return dialog.toast(res.msg || "No se pudo cancelar", "error");
  onChanged();
}

function EditMeetBtn({ reserva, onChanged, className }) {
  const [editando, setEditando] = useState(false);
  return (
    <button onClick={() => editarMeetReserva(reserva, onChanged, setEditando)} disabled={editando}
      className={className || "px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold hover:bg-amber-100 disabled:opacity-50"}>
      {editando ? "Guardando…" : "Añadir Meet"}
    </button>
  );
}

function CancelBtn({ reserva, onChanged, className }) {
  if (reserva.estado === "CANCELADA") return null;
  return (
    <button onClick={() => cancelarReserva(reserva, onChanged)}
      className={className || "px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-50"}>
      Cancelar
    </button>
  );
}

// Fila compacta de cita (estilo ".appt" del mock). Clic para expandir y ver
// chips + acciones reales (Unirse / Editar Meet / Cancelar) sin salir de la lista.
function ApptRow({ reserva: r, onChanged, mostrarAsesor, pasada }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <article className={`rounded-xl transition-colors ${abierta ? "bg-neutral-50" : "hover:bg-neutral-50"} ${pasada ? "opacity-55" : ""}`}>
      <button onClick={() => setAbierta((v) => !v)}
        className="w-full grid grid-cols-[52px_minmax(0,1fr)] gap-2.5 items-center p-2.5 text-left">
        <div>
          <b className="block text-[11px] text-neutral-800">{r.hora_inicio}</b>
          <span className="block text-[8.5px] text-neutral-400">{r.fecha.slice(5)}</span>
        </div>
        <div className="min-w-0">
          <b className="block text-[10.5px] text-neutral-800 truncate">{r.cliente?.nombre || "Sin nombre"}</b>
          <span className="block text-[9px] text-neutral-400 truncate mt-0.5">
            {r.hora_inicio}{mostrarAsesor && r.asesor ? ` · ${r.asesor.nombre}` : ""}
          </span>
          <span className={`inline-flex items-center mt-[5px] px-1.5 py-[3px] rounded-full text-[8px] font-extrabold ${
            r.estado === "CANCELADA" ? "bg-red-50 text-red-500"
              : !pagoEsRedundante(r.estado, r.pago_estado) && r.pago_estado === "PENDIENTE" ? "bg-[#fff2e7] text-[#b46a37]"
              : "bg-[#edf8f2] text-[#277553]"
          }`}>
            {r.estado === "CANCELADA" ? "Cancelada" : r.estado === "CONFIRMADA" || r.estado === "COMPLETADA" ? "Confirmada" : "Pago pendiente"}
          </span>
        </div>
      </button>

      {abierta && (
        <div className="px-2.5 pb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Pill tone="neutral">{r.monto} {r.moneda}</Pill>
            {!pagoEsRedundante(r.estado, r.pago_estado) && (
              <Pill tone={pagoTone(r.pago_estado)}>Pago {r.pago_estado.toLowerCase()}</Pill>
            )}
            {r.estado === "PENDIENTE_PAGO" && r.hold_expira_en && (
              <Pill tone="amber">vence {new Date(r.hold_expira_en).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" })}</Pill>
            )}
          </div>
          {r.cliente?.email_contacto && (
            <p className="text-[10px] text-neutral-500 mb-2 truncate">
              {r.cliente.email_contacto}{r.cliente?.telefono ? ` · ${r.cliente.telefono}` : ""}
            </p>
          )}
          <div className="flex gap-1.5 flex-wrap">
            {r.meet_url ? (
              <a href={r.meet_url} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-primary text-white rounded-lg text-[10.5px] font-bold hover:opacity-90">
                Unirse
              </a>
            ) : (
              <EditMeetBtn reserva={r} onChanged={onChanged}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10.5px] font-bold hover:bg-amber-100" />
            )}
            <CancelBtn reserva={r} onChanged={onChanged}
              className="px-2.5 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-[10.5px] font-bold hover:bg-red-50" />
          </div>
        </div>
      )}
    </article>
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
