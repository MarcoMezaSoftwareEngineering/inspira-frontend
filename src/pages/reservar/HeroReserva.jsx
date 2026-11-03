// src/pages/reservar/HeroReserva.jsx
// Cabecera de /reservar. Está pensada para quien llega con prisa, con dudas o
// con ganas de pensarlo: tres caminos visibles desde el primer pantallazo.
//   · «Reservar ya»          → baja directo al primer horario libre.
//   · «Escribir primero»     → WhatsApp.
//   · «Lo estoy pensando»    → deja su correo y le llega el acceso a la agenda (lead).
// Las cifras (horarios libres, primer horario) salen de la agenda real; no hay
// números inventados. El movimiento se apaga con «reducir movimiento».
import { useEffect, useRef, useState } from "react";
import { apiPOST } from "../../services/api";
import { whatsappUrl } from "../../config/contacto";
import { Icono } from "./iconos";
import { correoValido } from "./preguntas";

// Cuenta hasta `valor` en ~0,6 s (sin animar si se pidió menos movimiento).
function useContador(valor) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!valor) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setN(valor), 0);
      return () => clearTimeout(t);
    }
    let raf;
    const inicio = performance.now();
    const paso = (ahora) => {
      const p = Math.min(1, (ahora - inicio) / 600);
      setN(Math.round(valor * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return n;
}

const TITULO = ["Tu", "camino", "a", "España", "empieza", "con", "una", "conversación."];

export function FormRecordarme({ servicioId, onListo, compacto = false }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [trampa, setTrampa] = useState("");
  const [estado, setEstado] = useState("quieto"); // quieto | enviando | listo | error
  const [msg, setMsg] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    if (!correoValido(email)) {
      setEstado("error");
      setMsg("Revisa tu correo: parece incompleto.");
      return;
    }
    setEstado("enviando");
    try {
      const res = await apiPOST("/api/reservas/invitado/recordarme", { email: email.trim(), nombre: nombre.trim(), servicio_id: servicioId, web: trampa });
      if (res?.ok) {
        setEstado("listo");
        onListo?.();
      } else {
        setEstado("error");
        setMsg(res?.msg || "No pudimos guardar tu correo. Intenta de nuevo.");
      }
    } catch {
      setEstado("error");
      setMsg("Error de conexión. Intenta de nuevo.");
    }
  };

  if (estado === "listo") {
    return (
      <p className="rv-entrada flex items-start gap-2 rounded-xl bg-verde-soft px-3.5 py-3 text-sm text-verde-ink" role="status">
        <Icono nombre="check" className="mt-0.5 h-4 w-4 shrink-0" />
        Listo. Te enviamos el acceso a la agenda y el próximo horario libre. Revisa tu bandeja (y el spam, por si acaso).
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-2.5" noValidate>
      {/* Trampa para bots: una persona nunca la ve ni la llena. */}
      <input type="text" name="web" value={trampa} onChange={(e) => setTrampa(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {!compacto && (
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
          maxLength={120}
          placeholder="Tu nombre (opcional)"
          aria-label="Tu nombre (opcional)"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (estado === "error") setEstado("quieto");
          }}
          autoComplete="email"
          maxLength={254}
          placeholder="tucorreo@ejemplo.com"
          aria-label="Tu correo"
          aria-invalid={estado === "error"}
          className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-sky-light active:scale-[0.98] disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando…" : "Enviarme el acceso"}
        </button>
      </div>
      {estado === "error" && (
        <p className="text-xs text-alto-soft" role="alert">
          {msg}
        </p>
      )}
      <p className="text-[11px] leading-snug text-white/60">Solo usamos tu correo para enviarte el acceso y, si lo necesitas, ayudarte con tu reserva.</p>
    </form>
  );
}

const DIA = (f) => {
  const d = new Date(`${f}T12:00:00Z`);
  return {
    semana: d.toLocaleDateString("es", { weekday: "short", timeZone: "UTC" }).replace(".", ""),
    num: d.getUTCDate(),
    mes: d.toLocaleDateString("es", { month: "short", timeZone: "UTC" }).replace(".", ""),
  };
};

const precioCorto = (s) => (s?.precio ? `${s.moneda === "PEN" ? "S/ " : ""}${s.precio}` : "");

// La disponibilidad de los próximos 14 días, de frente, como en Calendly:
// servicio → día → hora. Elegir una hora separa la selección y baja al formulario.
function Disponibilidad({ cargando, servicios, servicioId, onServicio, dias, horaVista, hora, onElegir, libres }) {
  const [diaVista, setDiaVista] = useState(null);
  const fechaActiva = diaVista && dias.some((d) => d.fecha === diaVista) ? diaVista : dias[0]?.fecha;
  const horas = dias.find((d) => d.fecha === fechaActiva)?.slots || [];
  const contador = useContador(libres);

  return (
    <section aria-label="Disponibilidad de los próximos 14 días" className="rv-sube rounded-3xl bg-white p-4 text-tinta shadow-[0_30px_70px_-30px_rgba(0,0,0,.75)] ring-1 ring-white/60 md:p-5" style={{ animationDelay: "180ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rv-flota inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          <span className="relative flex h-2 w-2">
            <span className="rv-pulso absolute inline-flex h-full w-full rounded-full bg-white" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Cupos limitados
        </span>
        {!cargando && libres > 0 && (
          <span className="text-xs text-muted">
            Quedan <strong className="tabular-nums text-tinta">{contador}</strong> horarios en las próximas 2 semanas
          </span>
        )}
      </div>

      {/* Servicio */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Servicio">
        {servicios.length === 0 && cargando && [0, 1, 2].map((i) => <span key={i} className="rv-esqueleto h-11 w-36 shrink-0 rounded-xl bg-linea" />)}
        {servicios.map((sv) => {
          const activo = sv.id === servicioId;
          return (
            <button
              key={sv.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onServicio(sv.id)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-left text-[13px] transition active:scale-[0.98] ${activo ? "border-primary bg-primary text-white" : "border-linea bg-white text-tinta hover:border-primary"}`}
            >
              <span className="block font-semibold leading-tight">{sv.titulo}</span>
              <span className={`block text-[11px] ${activo ? "text-white/75" : "text-muted"}`}>
                {sv.duracion_min === 60 ? "1 hora" : `${sv.duracion_min} min`} · {precioCorto(sv)}
              </span>
            </button>
          );
        })}
      </div>

      {cargando && dias.length === 0 ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          <span className="rv-esqueleto block h-16 rounded-xl bg-linea" />
          <span className="rv-esqueleto block h-24 rounded-xl bg-linea" />
        </div>
      ) : dias.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-fondo p-4 text-sm text-tinta-2">
          <p>Por ahora no hay horarios libres para este servicio en las próximas 2 semanas.</p>
          <p className="mt-1">Déjanos tu correo abajo y te avisamos cuando se abran nuevos cupos.</p>
        </div>
      ) : (
        <>
          {/* Días */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="listbox" aria-label="Día">
            {dias.map((d, i) => {
              const { semana, num, mes } = DIA(d.fecha);
              const activo = d.fecha === fechaActiva;
              return (
                <button
                  key={d.fecha}
                  type="button"
                  role="option"
                  aria-selected={activo}
                  onClick={() => setDiaVista(d.fecha)}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={`rv-desliza rv-dia flex w-[68px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2 transition active:scale-95 ${activo ? "border-primary bg-primary text-white shadow-md" : "border-linea bg-white hover:border-primary hover:bg-secondary-light"}`}
                >
                  <span className={`text-[11px] font-medium uppercase ${activo ? "text-sky" : "text-muted"}`}>{semana}</span>
                  <span className="font-fraunces text-xl font-semibold leading-none">{num}</span>
                  <span className={`text-[11px] ${activo ? "text-white/80" : "text-muted"}`}>{mes}</span>
                  <span className={`mt-1 rounded-full px-1.5 text-[10px] font-semibold ${activo ? "bg-white/15 text-white" : "bg-accent/10 text-accent-dark"}`}>
                    {d.slots.length} {d.slots.length === 1 ? "libre" : "libres"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Horas del día */}
          <div key={fechaActiva} className="rv-entrada mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {horas.map((sl, i) => {
              const activa = hora?.id_slot === sl.id_slot;
              return (
                <button
                  key={sl.id_slot}
                  type="button"
                  onClick={() => onElegir(fechaActiva, sl)}
                  aria-pressed={activa}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={`rv-aparece rv-hora rounded-xl border px-2 py-2.5 text-sm font-semibold active:scale-95 ${activa ? "rv-latido border-accent bg-accent text-white" : "border-linea bg-white text-tinta hover:border-accent hover:bg-accent/5"}`}
                >
                  {horaVista(sl)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">Elige una hora y completa tus datos en el siguiente paso. Pagas después de separar el horario.</p>
        </>
      )}
    </section>
  );
}

export default function HeroReserva({ cargando, servicios, servicioId, onServicio, dias, horaVista, hora, onElegir, libres }) {
  const [pensando, setPensando] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (pensando) formRef.current?.querySelector("input[type=email]")?.focus();
  }, [pensando]);

  return (
    <header className="rv-hero relative overflow-hidden bg-primary text-white">
      {/* Aurora: tres manchas de color que se desplazan despacio. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="rv-aurora rv-aurora-a" />
        <span className="rv-aurora rv-aurora-b" />
        <span className="rv-aurora rv-aurora-c" />
        {[[8, 5, 6, "0s", 30], [22, 3, 7, "1.4s", -24], [41, 4, 5, "2.6s", 18], [58, 6, 8, "0.7s", -30], [73, 3, 6, "3.3s", 26], [88, 5, 7, "2s", -18]].map(([x, t, d, delay, dx], i) => (
          <span key={i} className="rv-particula" style={{ left: `${x}%`, width: t * 2, height: t * 2, animationDuration: `${d}s`, animationDelay: delay, "--dx": `${dx}px` }} />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-8 px-4 pb-24 pt-9 md:pb-28 md:pt-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-10">
        <div>
          <p className="rv-sube inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-sky ring-1 ring-white/15">
            <Icono nombre="escudo" className="h-3.5 w-3.5" />
            Abogados especialistas en extranjería española
          </p>

          <h1 className="mt-4 font-fraunces text-[2.3rem] font-semibold leading-[1.08] md:text-5xl" aria-label={TITULO.join(" ")}>
            {TITULO.map((p, i) => (
              <span key={i} className="rv-palabra mr-[0.26em]" style={{ animationDelay: `${i * 40}ms` }} aria-hidden="true">
                {p === "conversación." ? <span className="rv-brillo-texto">{p}</span> : p}
              </span>
            ))}
          </h1>

          <p className="rv-sube mt-4 text-[15px] leading-relaxed text-white/80" style={{ animationDelay: "320ms" }}>
            En una sesión, un abogado revisa tu caso y te dice qué camino te conviene: máster, visado, estancia o becas. Pagas solo la sesión y sales con un plan claro.
          </p>

          <ul className="rv-sube mt-5 grid gap-2 text-[13px] text-white/85 sm:grid-cols-2 lg:grid-cols-1" style={{ animationDelay: "420ms" }}>
            {[
              ["escudo", "Pago seguro"],
              ["usuario", "Puedes reservar sin crear cuenta"],
              ["ciclo", "Reprograma sin costo (24 h antes)"],
              ["video", "Reunión por Google Meet"],
            ].map(([ic, t]) => (
              <li key={t} className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-sky ring-1 ring-white/15">
                  <Icono nombre={ic} className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* Para quien no se decide todavía */}
          <div className="rv-sube mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm" style={{ animationDelay: "520ms" }}>
            <p className="text-sm font-semibold">¿Aún lo estás pensando?</p>
            <p className="mt-0.5 text-[13px] text-white/75">Te enviamos el acceso a la agenda por correo, sin compromiso.</p>
            {pensando ? (
              <div ref={formRef} className="rv-entrada mt-3">
                <FormRecordarme servicioId={servicioId} compacto />
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPensando(true)} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[13px] font-semibold transition hover:bg-white/10 active:scale-[0.98]">
                  <Icono nombre="sobre" className="h-4 w-4" /> Enviármelo al correo
                </button>
                <a href={whatsappUrl("Hola Inspira, tengo dudas antes de reservar mi asesoría.")} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[13px] font-semibold transition hover:bg-white/10 active:scale-[0.98]">
                  <Icono nombre="whatsapp" className="h-4 w-4" /> Escribir por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <Disponibilidad cargando={cargando} servicios={servicios} servicioId={servicioId} onServicio={onServicio} dias={dias} horaVista={horaVista} hora={hora} onElegir={onElegir} libres={libres} />
      </div>
    </header>
  );
}
