// Estado de "Mi calendario" (sistema propio: AgendaSlot / ReservaCita).
// Salió de MiCalendarioTab al partir Agenda.jsx en piezas (09/10/2026): las
// cargas, las acciones sobre horarios y los datos derivados que pintan la
// cuadrícula, las métricas y el panel lateral.
import { useEffect, useMemo, useState } from "react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { fechaConDiaSemana, numeroUnDecimalPE } from "../../../../lib/formatos";
import { HOUR_END, HOUR_START, ROW_H } from "../constantes";
import { addDays, getUserRole, rangeLabel, startOfDay, toISODate } from "../utilidades";

export default function useMiCalendario() {
  const esAdmin = getUserRole() === "admin";

  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  // Los 7 días solo cambian al moverse de semana, no en cada render.
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
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

  // "Hoy" y "ahora" no se memoizan: la línea roja y lo que cuenta como pasado
  // tienen que avanzar con el reloj mientras la pantalla siga abierta.
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
  // Memoizados: la pantalla se vuelve a pintar con cada clic (celda en vuelo,
  // panel de horarios, cita desplegada) y estos recorridos solo cambian cuando
  // llegan horarios o citas nuevos.
  const reservasActivas = useMemo(() => reservas.filter((r) => r.estado !== "CANCELADA"), [reservas]);
  const reservasOrdenadas = useMemo(() => [...reservasActivas].sort(
    (a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio)
  ), [reservasActivas]);

  const todosSlots = useMemo(() => Array.from(slotMap.values()).flat(), [slotMap]);
  const slotsLibres = useMemo(() => todosSlots.filter((s) => s.estado === "LIBRE"), [todosSlots]);
  const slotsOcupados = useMemo(() => todosSlots.filter((s) => s.estado === "OCUPADO" || s.estado === "RESERVADO"), [todosSlots]);
  const horasLibres = numeroUnDecimalPE(slotsLibres.length * 0.5);
  const ocupacionPct = todosSlots.length ? Math.round((slotsOcupados.length / todosSlots.length) * 100) : 0;
  const pagosPendientes = reservas.filter((r) => r.pago_estado === "PENDIENTE").length;

  // Cruce slot -> reserva, para mostrar el nombre del cliente dentro del bloque del calendario.
  const reservaPorClave = useMemo(() => {
    const reservaPorClave = new Map();
    for (const r of reservas) {
      const k = combinado && r.asesor ? `${r.fecha}|${r.hora_inicio}|${r.asesor.id_usuario}` : `${r.fecha}|${r.hora_inicio}`;
      reservaPorClave.set(k, r);
    }
    return reservaPorClave;
  }, [reservas, combinado]);
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
    return fechaConDiaSemana(d);
  }

  const tituloCalendario = combinado
    ? "Todo el equipo"
    : filtro === "yo"
      ? "Tu calendario"
      : asesores.find((a) => String(a.id_usuario) === String(filtro))?.nombre || "Tu calendario";

  return {
    esAdmin, setWeekStart, asesores, filtro, setFiltro, viewMode, setViewMode,
    slotMap, loading, error, busyCell,
    showBulk, setShowBulk, bulkFecha, setBulkFecha, bulkDesde, setBulkDesde, bulkHasta, setBulkHasta, creando,
    combinado, cargar, todayKey, esPasado, crearSlotRapido, onClickSlot, bloquearSlot, crearBulk,
    reservasActivas, reservasOrdenadas, horasLibres, ocupacionPct, pagosPendientes,
    reservaPorClave, claveDeSlot, displayedDays, stepDias, nowLineTop, mostrarNowLine,
    rangoTexto, tituloCalendario,
  };
}
