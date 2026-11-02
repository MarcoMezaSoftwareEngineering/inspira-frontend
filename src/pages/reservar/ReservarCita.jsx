// src/pages/reservar/ReservarCita.jsx
// Reserva y pago de una asesoría: servicio -> día -> hora -> pago.
//
// Los servicios, precios y horarios los manda el backend (catálogo de precios y
// agenda): aquí no hay importes ni horas escritos. Online martes, jueves y
// sábado; presencial solo los sábados.
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../services/api";
import { useReservarCita } from "../../hooks/useReservarCita";
import AceptarTerminos from "../../components/legal/AceptarTerminos";
import { CALENDLY_URL } from "../../config/contacto";
import CalendarioReserva from "./CalendarioReserva";
import { fechaCompleta, fechaCorta } from "./fechas";
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

const modalidadLabel = (s) =>
  s.modalidad === "presencial" ? "presencial · sábados" : "online · Google Meet";

export default function ReservarCita() {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(SERVICIO_INICIAL);
  const [dias, setDias] = useState([]);
  const [lugar, setLugar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null); // { id_slot, hora_inicio, hora_fin }
  const [aceptado, setAceptado] = useState(false);

  const { separarHorario, loadingSlot, isLoggedIn } = useReservarCita();

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
  const horariosPorDia = useMemo(
    () => Object.fromEntries(dias.map((d) => [d.fecha, d.slots.length])),
    [dias]
  );
  const horasDelDia = useMemo(() => dias.find((d) => d.fecha === fecha)?.slots || [], [dias, fecha]);
  const precio = precioLabel(servicio);
  const enviando = hora && loadingSlot === hora.id_slot;
  const primero = dias[0] || null;

  // Paso actual para el indicador: 0 servicio, 1 día, 2 hora, 3 pago.
  const paso = !servicio ? 0 : !fecha ? 1 : !hora ? 2 : 3;

  const elegirServicio = (id) => {
    if (id !== servicioId) setServicioId(id);
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
  // Volver a un paso anterior desde el indicador.
  const irAPaso = (i) => {
    if (i < paso && i === 1) {
      setFecha(null);
      setHora(null);
    }
    if (i < paso && i === 2) setHora(null);
    setAceptado(false);
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header>
          <h1 className="font-fraunces text-3xl font-semibold text-primary md:text-4xl">
            Reserva tu asesoría
          </h1>
          <p className="mt-2 max-w-xl text-neutral-600">
            Elige el servicio, el día y la hora. La reserva se confirma con el pago seguro y
            recibirás los detalles por correo.
          </p>

          {/* Indicador de pasos: se puede volver a cualquiera ya recorrido */}
          <ol className="mt-6 flex items-center gap-2 text-xs sm:text-sm" aria-label="Progreso de la reserva">
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
                        hecho
                          ? "border-primary bg-primary text-white"
                          : actual
                          ? "border-accent bg-accent text-white"
                          : "border-neutral-300 bg-white text-neutral-400",
                      ].join(" ")}
                    >
                      {hecho ? "✓" : i + 1}
                    </span>
                    <span className={actual ? "font-semibold text-primary" : hecho ? "text-primary" : "text-neutral-400"}>
                      {nombre}
                    </span>
                  </button>
                  {i < PASOS.length - 1 && (
                    <span className="h-px flex-1 bg-neutral-200">
                      <span
                        className="block h-px bg-primary transition-all duration-300"
                        style={{ width: hecho ? "100%" : "0%" }}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          {/* Columna izquierda: servicios y resumen vivo */}
          <section aria-labelledby="titulo-servicios" className="lg:sticky lg:top-6 lg:self-start">
            <h2 id="titulo-servicios" className="text-sm font-medium text-neutral-500">
              ↓ elige tu servicio
            </h2>
            <div className="mt-3 space-y-3">
              {cargando && servicios.length === 0 &&
                [0, 1, 2].map((i) => (
                  <div key={i} className="rv-esqueleto h-[74px] rounded-2xl border border-neutral-200 bg-white" />
                ))}
              {servicios.map((s) => {
                const activo = s.id === servicioId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => elegirServicio(s.id)}
                    aria-pressed={activo}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left transition duration-200",
                      "hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0",
                      activo
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-neutral-200 hover:border-primary/40",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block font-semibold text-neutral-900">{s.titulo}</span>
                      <span className="mt-1 block text-sm text-neutral-500">
                        {duracionLabel(s.duracion_min)} · {modalidadLabel(s)} ·{" "}
                        <span className="font-semibold text-neutral-800">{precioLabel(s)}</span>
                      </span>
                    </span>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        activo ? "rv-pop border-primary bg-primary text-white" : "border-neutral-300 text-primary",
                      ].join(" ")}
                    >
                      {activo ? "elegida ✓" : "elegir"}
                    </span>
                  </button>
                );
              })}
            </div>

            {servicio?.modalidad === "presencial" && (
              <p className="rv-entrada mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-neutral-700">
                Esta asesoría es presencial{lugar ? <> en <strong>{lugar}</strong></> : ""}. Los
                horarios son a la hora en punto, en hora de Perú.
              </p>
            )}

            {/* Resumen: se arma solo a medida que eliges */}
            {servicio && (
              <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4" aria-live="polite">
                <p className="text-xs font-medium uppercase tracking-wide text-primary/70">Tu reserva</p>
                <dl className="mt-2 space-y-1 text-sm text-neutral-700">
                  <div className="flex justify-between gap-3">
                    <dt>Servicio</dt>
                    <dd className="text-right font-medium">{servicio.titulo}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Día</dt>
                    <dd className="text-right font-medium capitalize">{fecha ? fechaCompleta(fecha) : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Hora</dt>
                    <dd className="text-right font-medium">
                      {hora ? `${hora.hora_inicio} – ${hora.hora_fin}` : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-primary/15 pt-2 text-base">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold text-primary">{precio || "—"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>

          {/* Columna derecha: calendario y horas */}
          <section
            aria-labelledby="titulo-calendario"
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6"
          >
            <h2 id="titulo-calendario" className="sr-only">
              Día y hora
            </h2>

            {cargando && (
              <div className="space-y-3 py-2" aria-busy="true">
                <div className="rv-esqueleto h-6 w-40 rounded bg-neutral-100" />
                <div className="rv-esqueleto h-48 rounded-xl bg-neutral-100" />
                <p className="text-center text-sm text-neutral-500">Cargando disponibilidad…</p>
              </div>
            )}

            {/* Sin horarios (o sin conexión) nadie se queda sin reservar: la
                reserva oficial de la web sigue siendo Calendly (config/contacto.js). */}
            {!cargando && (error || diasConHorario.length === 0) && (
              <div className="rv-entrada py-8 text-center">
                <p className={error ? "text-red-600" : "text-neutral-700"}>
                  {error ||
                    (servicio?.modalidad === "presencial"
                      ? "Por ahora no hay sábados con horarios libres para la asesoría presencial."
                      : "Ahora mismo no hay horarios disponibles para este servicio.")}
                </p>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
                >
                  Reserva tu sesión en Calendly
                </a>
              </div>
            )}

            {!cargando && !error && diasConHorario.length > 0 && (
              <div className="rv-entrada">
                <button
                  type="button"
                  onClick={irAlPrimero}
                  className="mb-4 w-full rounded-xl border border-dashed border-accent/60 bg-accent/5 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-accent/15"
                >
                  ⚡ Primer horario libre:{" "}
                  <span className="capitalize">{fechaCompleta(primero.fecha)}</span> · {primero.slots[0].hora_inicio}
                </button>

                {/* key: al cambiar de servicio el calendario vuelve al primer mes con horarios */}
                <CalendarioReserva
                  key={servicioId}
                  diasConHorario={diasConHorario}
                  horariosPorDia={horariosPorDia}
                  seleccionado={fecha}
                  onElegir={elegirDia}
                />

                <div className="mt-6 border-t border-neutral-200 pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold capitalize text-neutral-900">
                      {fecha ? fechaCompleta(fecha) : "Elige un día marcado"}
                    </h3>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                      {fecha ? `${horasDelDia.length} libres · hora de Perú` : "hora de Perú"}
                    </span>
                  </div>

                  {/* key: al cambiar de día las horas entran de nuevo */}
                  <div key={fecha || "sin-dia"} className="rv-entrada mt-4 grid grid-cols-3 gap-2">
                    {horasDelDia.map((s) => {
                      const activa = hora?.id_slot === s.id_slot;
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
                            "rounded-full border px-3 py-2.5 text-sm font-medium transition active:scale-95 motion-reduce:active:scale-100",
                            activa
                              ? "rv-pop border-primary bg-primary text-white"
                              : "border-neutral-300 text-neutral-800 hover:border-primary hover:bg-primary/5",
                          ].join(" ")}
                        >
                          {s.hora_inicio}
                        </button>
                      );
                    })}
                  </div>

                  {hora && (
                    <div className="rv-entrada">
                      <AceptarTerminos
                        checked={aceptado}
                        onChange={setAceptado}
                        resumen={
                          isLoggedIn
                            ? "Separamos tu horario y eliges cómo pagar: tarjeta, transferencia con voucher o pagar después. La cita se confirma cuando recibimos el pago. Puedes reprogramar sin costo avisando con 24 horas de antelación."
                            : "Para reservar necesitas iniciar sesión con Google. Al continuar te llevaremos al inicio de sesión y luego podrás pagar. Puedes reprogramar sin costo avisando con 24 horas de antelación."
                        }
                      />
                    </div>
                  )}

                  {/* Separar el horario es inmediato; el pago se elige después. */}
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => separarHorario(hora.id_slot, servicioId, "ahora")}
                      disabled={!hora || !aceptado || enviando}
                      className="rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enviando
                        ? "Separando…"
                        : !hora
                        ? "Elige una hora"
                        : !aceptado
                        ? "Acepta los términos"
                        : `${isLoggedIn ? "Pagar ahora" : "Iniciar sesión y reservar"} · ${fechaCorta(fecha)} · ${hora.hora_inicio} →`}
                    </button>
                    <button
                      type="button"
                      onClick={() => separarHorario(hora.id_slot, servicioId, "despues")}
                      disabled={!hora || !aceptado || enviando || !isLoggedIn}
                      className="rounded-full border border-primary px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Pagar después
                    </button>
                  </div>
                  {hora && aceptado && isLoggedIn && (
                    <p className="rv-entrada mt-2 text-center text-xs text-neutral-500">
                      {precio ? `${precio} · ` : ""}Separamos el horario en el acto. Con «pagar después» lo
                      confirmas luego por WhatsApp.
                    </p>
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
