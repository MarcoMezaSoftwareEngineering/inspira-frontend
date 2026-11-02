// src/pages/reservar/ReservarCita.jsx
// Reserva de una asesoría: servicio -> día -> hora -> pago.
//
// Los servicios, descripciones, precios y horarios los manda el backend
// (catálogo de precios y agenda): aquí no hay importes ni horas escritos. Online
// martes, jueves y sábado; presencial solo los sábados. Las horas se ven en la
// zona horaria de cada persona (como en Calendly).
//
// Modos de entrada (query):
//   ?servicio=<id>      abre con ese servicio elegido
//   ?reprogramar=<id>   mueve una cita ya confirmada a otro horario
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../services/api";
import { useReservarCita } from "../../hooks/useReservarCita";
import { loginGoogle } from "../../components/layout/Header/LoginButton";
import { dialog } from "../../services/dialogService";
import AceptarTerminos from "../../components/legal/AceptarTerminos";
import { whatsappUrl } from "../../config/contacto";
import CalendarioReserva from "./CalendarioReserva";
import { fechaCompleta, fechaCorta } from "./fechas";
import { ZONA_AGENDA, desfaseDias, horaEn, zonaDetectada, zonasDisponibles } from "./zonas";
import "./reservar.css";

const SERVICIO_INICIAL = "sesion-diagnostico";
const PASOS = ["Servicio", "Día", "Hora", "Pago"];

function precioLabel(servicio) {
  if (!servicio || !servicio.precio) return "";
  const simbolo = servicio.moneda === "PEN" ? "S/ " : "";
  const sufijo = servicio.moneda && servicio.moneda !== "PEN" ? ` ${servicio.moneda}` : "";
  return `${simbolo}${servicio.precio}${sufijo}`;
}

function duracionLabel(min) {
  if (min === 60) return "1 hora";
  if (min > 60 && min % 60 === 0) return `${min / 60} horas`;
  return `${min} min`;
}

const modalidadLabel = (s) => (s.modalidad === "presencial" ? "Presencial · San Isidro" : "Online · Google Meet");

/* ── Iconos (trazo, heredan el color) ───────────────────────────────── */
function Icono({ nombre, className = "h-5 w-5" }) {
  const rutas = {
    video: <path d="M15 10l4.5-3v10L15 14M5 7h8a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />,
    oficina: <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2M3 21h18" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    escudo: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
    campana: <path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20a2 2 0 004 0" />,
    ciclo: <path d="M4 12a8 8 0 0113.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.6L4 16M4 20v-4h4" />,
    reloj: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    whatsapp: <path d="M20 12a8 8 0 01-11.9 7L4 20l1.1-4A8 8 0 1120 12z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {rutas[nombre]}
    </svg>
  );
}

const ICONO_SERVICIO = { "sesion-diagnostico": "video", "asesoria-ampliada": "video", "sesion-presencial": "oficina" };

function Garantia({ icono, children }) {
  return (
    <li className="flex items-center gap-2 text-[13px] text-white/85">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-sky ring-1 ring-white/15">
        <Icono nombre={icono} className="h-4 w-4" />
      </span>
      {children}
    </li>
  );
}

export default function ReservarCita() {
  const parametros = useMemo(() => new URLSearchParams(window.location.search), []);
  const idReprogramar = Number(parametros.get("reprogramar")) || null;

  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(parametros.get("servicio") || SERVICIO_INICIAL);
  const [dias, setDias] = useState([]);
  const [lugar, setLugar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null); // { id_slot, hora_inicio, hora_fin, inicio_utc }
  const [aceptado, setAceptado] = useState(false);
  const [zona, setZona] = useState(zonaDetectada);
  const [motivo, setMotivo] = useState("");
  const [celular, setCelular] = useState("");
  const [reprog, setReprog] = useState(null); // la cita que se mueve
  const [reprogError, setReprogError] = useState(null);
  const [moviendo, setMoviendo] = useState(false);

  const { separarHorario, loadingSlot, isLoggedIn } = useReservarCita();
  const zonas = useMemo(() => zonasDisponibles(zonaDetectada()), []);

  // Reprogramar: se carga la cita y se fija su servicio.
  useEffect(() => {
    if (!idReprogramar || !isLoggedIn) return;
    let vivo = true;
    (async () => {
      try {
        const res = await apiGET(`/api/reservas/cliente/${idReprogramar}`);
        if (!vivo) return;
        if (!res?.ok) return setReprogError(res?.msg || "No encontramos esa reserva.");
        const r = res.reserva;
        if (r.estado !== "CONFIRMADA") return setReprogError("Solo se pueden reprogramar las citas confirmadas.");
        if (!r.puede_gestionar) {
          return setReprogError("Faltan menos de 24 horas para la cita: escríbanos por WhatsApp y lo resolvemos.");
        }
        setReprog(r);
        setServicioId(r.servicio_id);
      } catch {
        if (vivo) setReprogError("No pudimos cargar su reserva. Intente de nuevo.");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [idReprogramar, isLoggedIn]);

  // Cada servicio tiene sus propios días y horas (online vs presencial, 1 o 2 cupos).
  useEffect(() => {
    let vivo = true;
    setCargando(true);
    (async () => {
      try {
        const res = await apiGET(`/api/reservas/disponibilidad?servicio=${servicioId}`);
        if (!vivo) return;
        if (res?.ok) {
          setError(null);
          setDias(res.dias || []);
          setLugar(res.lugar || null);
          if (res.servicios?.length) setServicios(res.servicios);
          setFecha(null);
          setHora(null);
          setAceptado(false);
        } else {
          setError(res?.msg || "No se pudo cargar la disponibilidad.");
        }
      } catch {
        if (vivo) setError("Error de conexión al cargar la disponibilidad.");
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [servicioId]);

  const servicio = servicios.find((s) => s.id === servicioId) || null;
  const diasConHorario = useMemo(() => dias.map((d) => d.fecha), [dias]);
  const horariosPorDia = useMemo(() => Object.fromEntries(dias.map((d) => [d.fecha, d.slots.length])), [dias]);
  const horasDelDia = useMemo(() => dias.find((d) => d.fecha === fecha)?.slots || [], [dias, fecha]);
  const precio = precioLabel(servicio);
  const enviando = !!hora && loadingSlot === hora.id_slot;
  const primero = dias[0] || null;
  const otraZona = zona !== ZONA_AGENDA;

  // Paso actual para el indicador: 0 servicio, 1 día, 2 hora, 3 pago.
  const paso = !servicio ? 0 : !fecha ? 1 : !hora ? 2 : 3;

  // Hora de una franja en la zona elegida (y fin, según la duración del servicio).
  const horaVista = (s) => horaEn(s.inicio_utc, zona);
  const finVista = (s) =>
    horaEn(new Date(new Date(s.inicio_utc).getTime() + (servicio?.duracion_min || 30) * 60000).toISOString(), zona);

  const elegirServicio = (id) => {
    if (!reprog && id !== servicioId) setServicioId(id);
  };
  const elegirDia = (f) => {
    setFecha(f);
    setHora(null);
    setAceptado(false);
  };
  const irAlPrimero = () => {
    if (!primero) return;
    setFecha(primero.fecha);
    setHora(primero.slots[0]);
    setAceptado(false);
  };
  const irAPaso = (i) => {
    if (i < paso && i === 1) {
      setFecha(null);
      setHora(null);
    }
    if (i < paso && i === 2) setHora(null);
    setAceptado(false);
  };

  const extra = { motivo: motivo.trim(), celular: celular.trim() };

  const reprogramar = async () => {
    setMoviendo(true);
    try {
      const res = await apiPOST(`/api/reservas/cliente/${idReprogramar}/reprogramar`, { id_slot: hora.id_slot });
      if (res?.ok) {
        window.location.assign(`/reservar/pago?r=${idReprogramar}`);
        return;
      }
      dialog.toast(res?.msg || "No se pudo reprogramar la cita.", "error");
    } catch {
      dialog.toast("Error de conexión. Intente de nuevo.", "error");
    }
    setMoviendo(false);
  };

  return (
    <main className="min-h-screen bg-fondo pb-16">
      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden bg-primary text-white"
        style={{
          backgroundImage:
            "radial-gradient(60% 90% at 88% 0%, rgba(136,196,252,.30), transparent 62%), radial-gradient(45% 70% at 0% 100%, rgba(250,148,58,.22), transparent 60%)",
        }}
      >
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 md:pb-28 md:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-sky ring-1 ring-white/15">
            <Icono nombre="reloj" className="h-3.5 w-3.5" />
            {reprog ? "Reprogramar cita" : "Agenda tu asesoría"}
          </p>
          <h1 className="mt-4 font-fraunces text-4xl font-semibold leading-tight md:text-5xl">
            {reprog ? "Elige un nuevo horario" : "Reserva tu asesoría"}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
            {reprog
              ? `Tu cita actual es el ${fechaCompleta(reprog.fecha)} a las ${reprog.hora_inicio} (hora de Perú). Al elegir otro horario, el enlace de la reunión sigue siendo el mismo.`
              : "Con abogados especialistas en extranjería española. Elige el servicio, el día y la hora: tu cita se confirma al pagar y recibes todo por correo."}
          </p>
          {!reprog && (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <Garantia icono="escudo">Pago seguro</Garantia>
              <Garantia icono="campana">Recordatorios por correo</Garantia>
              <Garantia icono="ciclo">Reprograma sin costo (24 h antes)</Garantia>
              <Garantia icono="video">Reunión por Google Meet</Garantia>
            </ul>
          )}
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-5xl px-4 md:-mt-20">
        {/* ── Indicador de pasos ─────────────────────────────────── */}
        {!reprog && (
          <ol
            className="mb-5 flex items-center gap-2 rounded-2xl bg-white p-3.5 text-xs shadow-[0_10px_40px_-18px_rgba(1,52,70,.45)] ring-1 ring-linea sm:text-sm"
            aria-label="Progreso de la reserva"
          >
            {PASOS.map((nombre, i) => {
              const hecho = i < paso;
              const actual = i === paso;
              return (
                <li key={nombre} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => irAPaso(i)}
                    disabled={!hecho || i === 0}
                    aria-current={actual ? "step" : undefined}
                    className="flex items-center gap-2 disabled:cursor-default"
                  >
                    <span
                      className={[
                        "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold transition-colors",
                        hecho ? "border-primary bg-primary text-white" : actual ? "border-accent bg-accent text-white" : "border-linea bg-white text-trazo",
                      ].join(" ")}
                    >
                      {hecho ? <Icono nombre="check" className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={actual ? "font-semibold text-primary" : hecho ? "text-primary" : "text-trazo"}>{nombre}</span>
                  </button>
                  {i < PASOS.length - 1 && (
                    <span className="h-px flex-1 bg-linea">
                      <span className="block h-px bg-primary transition-all duration-300" style={{ width: hecho ? "100%" : "0%" }} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {reprogError && (
          <div className="rv-entrada mb-5 rounded-2xl bg-alto-soft px-4 py-3 text-sm text-alto-ink">
            {reprogError}{" "}
            <a className="font-semibold underline" href={whatsappUrl("Hola Inspira, necesito reprogramar mi cita.")}>
              Escribir por WhatsApp
            </a>
          </div>
        )}
        {idReprogramar && !isLoggedIn && (
          <div className="rv-entrada mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-linea">
            <p className="text-tinta">Inicie sesión con la cuenta con la que reservó para reprogramar su cita.</p>
            <button
              type="button"
              onClick={() => loginGoogle({ volverAqui: true })}
              className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
            >
              Iniciar sesión con Google
            </button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          {/* ── Columna izquierda: servicios y resumen ───────────── */}
          <section aria-labelledby="titulo-servicios" className="lg:sticky lg:top-6 lg:self-start">
            <h2 id="titulo-servicios" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {reprog ? "Tu servicio" : "1 · Elige tu servicio"}
            </h2>
            <div className="space-y-3">
              {cargando &&
                servicios.length === 0 &&
                [0, 1, 2].map((i) => <div key={i} className="rv-esqueleto h-[92px] rounded-2xl bg-white ring-1 ring-linea" />)}
              {servicios
                .filter((s) => !reprog || s.id === servicioId)
                .map((s) => {
                  const activo = s.id === servicioId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => elegirServicio(s.id)}
                      aria-pressed={activo}
                      className={[
                        "group w-full rounded-2xl bg-white p-4 text-left ring-1 transition duration-200 motion-reduce:transition-none",
                        activo
                          ? "ring-2 ring-primary shadow-[0_18px_40px_-22px_rgba(1,52,70,.55)]"
                          : "ring-linea hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40 motion-reduce:hover:translate-y-0",
                      ].join(" ")}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={[
                            "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors",
                            activo ? "bg-primary text-white" : "bg-secondary text-primary group-hover:bg-sky-light",
                          ].join(" ")}
                        >
                          <Icono nombre={ICONO_SERVICIO[s.id] || "video"} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-tinta">{s.titulo}</span>
                            <span className="shrink-0 font-fraunces text-xl font-semibold text-primary">{precioLabel(s)}</span>
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1.5 text-xs">
                            <span className="rounded-full bg-neutro-soft px-2 py-0.5 text-neutro-ink">{duracionLabel(s.duracion_min)}</span>
                            <span className="rounded-full bg-neutro-soft px-2 py-0.5 text-neutro-ink">{modalidadLabel(s)}</span>
                          </span>
                          {s.descripcion && (
                            <span className={`mt-2 block text-[13px] leading-relaxed text-tinta-2 ${activo ? "" : "line-clamp-2"}`}>{s.descripcion}</span>
                          )}
                          {activo && s.incluye?.length > 0 && (
                            <span className="rv-entrada mt-3 block space-y-1.5">
                              {s.incluye.map((t) => (
                                <span key={t} className="flex items-start gap-2 text-[13px] text-tinta">
                                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-verde-soft text-verde">
                                    <Icono nombre="check" className="h-3 w-3" />
                                  </span>
                                  {t}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>

            {servicio?.modalidad === "presencial" && (
              <p className="rv-entrada mt-4 rounded-2xl bg-aviso-soft px-4 py-3 text-sm text-aviso-ink">
                Esta asesoría es presencial
                {lugar ? <> en <strong>{lugar}</strong></> : " en nuestra oficina de San Isidro, Lima"}. Los horarios son a la hora en punto, en hora de Perú.
              </p>
            )}

            {/* Resumen: se arma solo a medida que eliges */}
            {servicio && (
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-linea" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tu reserva</p>
                <dl className="mt-2 space-y-1.5 text-sm text-tinta-2">
                  <div className="flex justify-between gap-3">
                    <dt>Servicio</dt>
                    <dd className="text-right font-medium text-tinta">{servicio.titulo}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Día</dt>
                    <dd className="text-right font-medium capitalize text-tinta">{fecha ? fechaCompleta(fecha) : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Hora</dt>
                    <dd className="text-right font-medium text-tinta">
                      {hora ? `${horaVista(hora)} – ${finVista(hora)}` : "—"}
                      {hora && otraZona && <span className="block text-xs font-normal text-muted">{hora.hora_inicio} en Lima</span>}
                    </dd>
                  </div>
                  {!reprog && (
                    <div className="flex justify-between gap-3 border-t border-linea pt-2 text-base">
                      <dt className="font-semibold text-tinta">Total</dt>
                      <dd className="font-fraunces text-xl font-semibold text-primary">{precio || "—"}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </section>

          {/* ── Columna derecha: calendario y horas ──────────────── */}
          <section
            aria-labelledby="titulo-calendario"
            className="rounded-3xl bg-white p-5 shadow-[0_24px_60px_-30px_rgba(1,52,70,.5)] ring-1 ring-linea md:p-6"
          >
            <h2 id="titulo-calendario" className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              {reprog ? "Nuevo día y hora" : "2 · Día y hora"}
            </h2>

            {cargando && (
              <div className="space-y-3 py-2" aria-busy="true">
                <div className="rv-esqueleto h-6 w-40 rounded bg-linea" />
                <div className="rv-esqueleto h-48 rounded-xl bg-linea" />
                <p className="text-center text-sm text-muted">Cargando disponibilidad…</p>
              </div>
            )}

            {/* Sin horarios (o sin conexión): se escribe al equipo por WhatsApp. */}
            {!cargando && (error || diasConHorario.length === 0) && (
              <div className="rv-entrada py-8 text-center">
                <p className={error ? "text-alto-ink" : "text-tinta"}>
                  {error ||
                    (servicio?.modalidad === "presencial"
                      ? "Por ahora no hay sábados con horarios libres para la asesoría presencial."
                      : "Ahora mismo no hay horarios disponibles para este servicio.")}
                </p>
                <a
                  href={whatsappUrl("Hola Inspira, quiero reservar una asesoría y no veo horarios disponibles.")}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
                >
                  <Icono nombre="whatsapp" className="h-4 w-4" /> Escribir al equipo por WhatsApp
                </a>
              </div>
            )}

            {!cargando && !error && diasConHorario.length > 0 && (
              <div className="rv-entrada">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={irAlPrimero}
                    className="rounded-full border border-dashed border-accent/60 bg-accent/5 px-4 py-2 text-[13px] font-medium text-primary transition hover:bg-accent/15"
                  >
                    ⚡ Primer horario libre: <span className="capitalize">{fechaCorta(primero.fecha)}</span> · {horaVista(primero.slots[0])}
                  </button>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <span className="sr-only sm:not-sr-only">Zona horaria</span>
                    <select
                      value={zona}
                      onChange={(e) => setZona(e.target.value)}
                      className="max-w-[190px] rounded-full border border-linea bg-fondo px-3 py-1.5 text-xs font-medium text-tinta focus:outline-none focus:ring-2 focus:ring-primary/30"
                      aria-label="Zona horaria"
                    >
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.etiqueta}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* key: al cambiar de servicio el calendario vuelve al primer mes con horarios */}
                <CalendarioReserva
                  key={servicioId}
                  diasConHorario={diasConHorario}
                  horariosPorDia={horariosPorDia}
                  seleccionado={fecha}
                  onElegir={elegirDia}
                />

                <div className="mt-6 border-t border-linea pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold capitalize text-tinta">{fecha ? fechaCompleta(fecha) : "Elige un día marcado"}</h3>
                    <span className="rounded-full bg-neutro-soft px-3 py-1 text-xs text-neutro-ink">
                      {fecha ? `${horasDelDia.length} libres` : "sin elegir"} · {otraZona ? "tu hora" : "hora de Perú"}
                    </span>
                  </div>
                  {fecha && otraZona && (
                    <p className="mt-1 text-xs text-muted">Los horarios son del día de Perú; se muestran en tu zona. «+1» es el día siguiente.</p>
                  )}

                  {/* key: al cambiar de día las horas entran de nuevo */}
                  <div key={`${fecha || "sin-dia"}-${zona}`} className="rv-entrada mt-4 grid grid-cols-3 gap-2">
                    {horasDelDia.map((s) => {
                      const activa = hora?.id_slot === s.id_slot;
                      const desfase = desfaseDias(s.inicio_utc, zona);
                      return (
                        <button
                          key={s.id_slot}
                          type="button"
                          aria-pressed={activa}
                          onClick={() => {
                            setHora(s);
                            setAceptado(false);
                          }}
                          className={[
                            "rounded-xl border px-3 py-3 text-sm font-semibold transition active:scale-95 motion-reduce:active:scale-100",
                            activa
                              ? "rv-pop border-primary bg-primary text-white shadow-md"
                              : "border-linea bg-white text-tinta hover:border-primary hover:bg-secondary-light",
                          ].join(" ")}
                        >
                          {horaVista(s)}
                          {desfase !== 0 && (
                            <sup className="ml-0.5 text-[10px] font-medium opacity-80">{desfase > 0 ? `+${desfase}` : desfase}</sup>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reprogramar: confirmar el cambio */}
                  {reprog && hora && (
                    <div className="rv-entrada mt-5">
                      <button
                        type="button"
                        onClick={reprogramar}
                        disabled={moviendo}
                        className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.99] disabled:opacity-50"
                      >
                        {moviendo ? "Reprogramando…" : `Reprogramar a ${fechaCorta(fecha)} · ${horaVista(hora)} →`}
                      </button>
                      <p className="mt-2 text-center text-xs text-muted">Sin costo. Te enviamos la confirmación por correo.</p>
                    </div>
                  )}

                  {/* Reservar: preguntas como en Calendly + términos + pagar */}
                  {!reprog && hora && (
                    <div className="rv-entrada mt-5 space-y-3">
                      <div>
                        <label htmlFor="rv-motivo" className="text-sm font-medium text-tinta">
                          Cuéntanos algo que nos ayude a prepararnos <span className="font-normal text-muted">(opcional)</span>
                        </label>
                        <textarea
                          id="rv-motivo"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          maxLength={600}
                          rows={3}
                          placeholder="Ej.: mi país de residencia, el máster que me interesa, si ya tuve una denegatoria…"
                          className="mt-1.5 w-full resize-y rounded-xl border border-linea bg-fondo px-3 py-2.5 text-sm text-tinta placeholder:text-trazo focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="rv-celular" className="text-sm font-medium text-tinta">
                          Celular o WhatsApp <span className="font-normal text-muted">(opcional)</span>
                        </label>
                        <input
                          id="rv-celular"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={celular}
                          onChange={(e) => setCelular(e.target.value)}
                          maxLength={30}
                          placeholder="+51 999 999 999"
                          className="mt-1.5 w-full rounded-xl border border-linea bg-fondo px-3 py-2.5 text-sm text-tinta placeholder:text-trazo focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <AceptarTerminos
                        checked={aceptado}
                        onChange={setAceptado}
                        resumen={
                          isLoggedIn
                            ? "Separamos tu horario y eliges cómo pagar: tarjeta, transferencia con voucher o pagar después. La cita se confirma cuando recibimos el pago. Puedes reprogramar o cancelar sin costo avisando con 24 horas de antelación."
                            : "Para reservar necesitas iniciar sesión con Google. Al continuar te llevaremos al inicio de sesión y luego podrás pagar. Puedes reprogramar o cancelar sin costo avisando con 24 horas de antelación."
                        }
                      />

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => separarHorario(hora.id_slot, servicioId, "ahora", extra)}
                          disabled={!aceptado || enviando}
                          className="rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(1,52,70,.9)] transition hover:bg-primary-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                          {enviando
                            ? "Separando…"
                            : !aceptado
                            ? "Acepta los términos"
                            : `${isLoggedIn ? "Pagar ahora" : "Iniciar sesión y reservar"} · ${precio} →`}
                        </button>
                        <button
                          type="button"
                          onClick={() => separarHorario(hora.id_slot, servicioId, "despues", extra)}
                          disabled={!aceptado || enviando || !isLoggedIn}
                          className="rounded-full border border-primary px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Pagar después
                        </button>
                      </div>
                      {aceptado && isLoggedIn && (
                        <p className="text-center text-xs text-muted">
                          Separamos el horario en el acto. Con «pagar después» lo confirmas luego por WhatsApp.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
