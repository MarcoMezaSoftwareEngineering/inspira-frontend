// src/pages/reservar/HeroReserva.jsx
// Cabecera de /reservar, con el mismo lenguaje que los flyers de Inspira: fondo
// claro, titular grande en azul marino con una palabra en naranja, tarjetas
// blancas, tarjeta de precio dorada y un panel azul con la disponibilidad.
//   · Disponibilidad de los próximos 14 días de frente (servicio → día → hora).
//   · «Cupos limitados» con el recuento real de la agenda: sin cifras inventadas.
//   · «Aún lo estoy pensando»: deja su correo y recibe el acceso (lead).
// El movimiento no se apaga entero con «reducir movimiento»: solo lo grande
// (avión, formas flotantes); las entradas y transiciones cortas se mantienen.
import { useEffect, useRef, useState } from "react";
import { apiPOST } from "../../services/api";
import { whatsappUrl } from "../../config/contacto";
import { Icono } from "./iconos";
import { correoValido } from "./preguntas";

const TITULO = ["Reserva", "tu", "primera", "asesoría"];

// Cuenta hasta `valor` en ~0,6 s.
function useContador(valor) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!valor) return undefined;
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

// `claro`: sobre fondo claro (cabecera); sin él, sobre fondo azul (ventana de salida).
export function FormRecordarme({ servicioId, onListo, compacto = false, claro = false }) {
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

  const campo = claro
    ? "border-linea bg-white text-tinta placeholder:text-trazo focus:border-primary focus:ring-primary/20"
    : "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/60 focus:ring-white/20";

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
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" maxLength={120} placeholder="Tu nombre (opcional)" aria-label="Tu nombre (opcional)" className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${campo}`} />
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
          className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${campo}`}
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.97] disabled:opacity-60 ${claro ? "bg-primary text-white hover:bg-primary-light" : "bg-white text-primary hover:bg-sky-light"}`}
        >
          {estado === "enviando" ? "Enviando…" : "Enviarme el acceso"}
        </button>
      </div>
      {estado === "error" && (
        <p className={`text-xs ${claro ? "text-alto-ink" : "text-alto-soft"}`} role="alert">
          {msg}
        </p>
      )}
      <p className={`text-[11px] leading-snug ${claro ? "text-muted" : "text-white/60"}`}>Solo usamos tu correo para enviarte el acceso y, si lo necesitas, ayudarte con tu reserva.</p>
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

// Panel azul con la disponibilidad de los próximos 14 días: servicio → día → hora.
// Elegir una hora separa la selección y baja al formulario.
function Disponibilidad({ cargando, servicios, servicioId, onServicio, dias, horaVista, hora, onElegir, libres }) {
  const [diaVista, setDiaVista] = useState(null);
  const fechaActiva = diaVista && dias.some((d) => d.fecha === diaVista) ? diaVista : dias[0]?.fecha;
  const horas = dias.find((d) => d.fecha === fechaActiva)?.slots || [];
  const contador = useContador(libres);

  return (
    <section aria-label="Disponibilidad de los próximos 14 días" className="rv-entra-der rounded-[28px] bg-primary p-4 text-white shadow-[0_30px_60px_-28px_rgba(1,52,70,.85)] md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rv-flota inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
          <span className="relative flex h-2 w-2">
            <span className="rv-pulso absolute inline-flex h-full w-full rounded-full bg-white" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Cupos limitados
        </span>
        {!cargando && libres > 0 && (
          <span className="text-xs text-white/75">
            Quedan <strong className="tabular-nums text-white">{contador}</strong> horarios en 2 semanas
          </span>
        )}
      </div>

      <h2 className="mt-3 text-center text-sm font-extrabold uppercase tracking-wide">Elige tu servicio, día y hora</h2>
      <span className="mx-auto mt-1.5 block h-0.5 w-12 rounded bg-accent" />

      {/* Servicio */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Servicio">
        {servicios.length === 0 && cargando && [0, 1, 2].map((i) => <span key={i} className="rv-esqueleto h-11 w-36 shrink-0 rounded-xl bg-white/15" />)}
        {servicios.map((sv) => {
          const activo = sv.id === servicioId;
          return (
            <button
              key={sv.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onServicio(sv.id)}
              className={`rv-dia shrink-0 rounded-xl border px-3.5 py-2 text-left text-[13px] active:scale-[0.98] ${activo ? "border-accent bg-accent text-white" : "border-white/25 bg-white/10 text-white hover:bg-white/20"}`}
            >
              <span className="block font-bold leading-tight">{sv.titulo}</span>
              <span className={`block text-[11px] ${activo ? "text-white/90" : "text-white/65"}`}>
                {sv.duracion_min === 60 ? "1 hora" : `${sv.duracion_min} min`} · {precioCorto(sv)}
              </span>
            </button>
          );
        })}
      </div>

      {cargando && dias.length === 0 ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          <span className="rv-esqueleto block h-16 rounded-xl bg-white/15" />
          <span className="rv-esqueleto block h-24 rounded-xl bg-white/15" />
        </div>
      ) : dias.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/85">
          <p>Por ahora no hay horarios libres para este servicio en las próximas 2 semanas.</p>
          <p className="mt-1">Déjanos tu correo y te avisamos cuando se abran nuevos cupos.</p>
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
                  className={`rv-desliza rv-dia flex w-[68px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2 active:scale-95 ${activo ? "border-white bg-white text-primary shadow-lg" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`}
                >
                  <span className={`text-[11px] font-bold uppercase ${activo ? "text-accent-dark" : "text-white/70"}`}>{semana}</span>
                  <span className="text-xl font-extrabold leading-none">{num}</span>
                  <span className={`text-[11px] ${activo ? "text-tinta-2" : "text-white/70"}`}>{mes}</span>
                  <span className={`mt-1 rounded-full px-1.5 text-[10px] font-bold ${activo ? "bg-accent/15 text-accent-dark" : "bg-white/15 text-white"}`}>
                    {d.slots.length} {d.slots.length === 1 ? "libre" : "libres"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Horas del día */}
          <div key={fechaActiva} className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {horas.map((sl, i) => {
              const activa = hora?.id_slot === sl.id_slot;
              return (
                <button
                  key={sl.id_slot}
                  type="button"
                  onClick={() => onElegir(fechaActiva, sl)}
                  aria-pressed={activa}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={`rv-aparece rv-hora rounded-xl border px-2 py-2.5 text-sm font-bold active:scale-95 ${activa ? "rv-latido border-accent bg-accent text-white" : "border-white/25 bg-white/10 text-white hover:border-accent hover:bg-accent"}`}
                >
                  {horaVista(sl)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-white/65">Elige una hora y completa tus datos en el siguiente paso. Pagas después de separar el horario.</p>
        </>
      )}
    </section>
  );
}

const TARJETAS = [
  ["reloj", "Sesión de 30 minutos", "Clara, rápida y profesional"],
  ["usuario", "Atención personalizada", "Te escuchamos y te entendemos"],
  ["escudo", "100 % confidencial", "Tu información está segura con nosotros"],
];

export default function HeroReserva({ cargando, servicios, servicioId, onServicio, dias, horaVista, hora, onElegir, libres }) {
  const [pensando, setPensando] = useState(false);
  const formRef = useRef(null);
  const servicio = servicios.find((s) => s.id === servicioId) || servicios[0];

  useEffect(() => {
    if (pensando) formRef.current?.querySelector("input[type=email]")?.focus();
  }, [pensando]);

  return (
    <header className="rv-hero-claro relative overflow-hidden text-primary">
      {/* Fondo líquido: manchas que mutan, aviones que cruzan y una ola que cierra la cabecera. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="rv-liquido rv-liquido-a" />
        <span className="rv-liquido rv-liquido-b" />
        <span className="rv-liquido rv-liquido-c" />
        {[["", ""], ["rv-avion-ruta-2", ""]].map(([extra], i) => (
          <div key={i} className={`rv-avion-ruta ${extra}`}>
            <span className="rv-avion-rastro" />
            <svg className="rv-avion-cuerpo" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
          </div>
        ))}
        <div className="rv-ola-caja text-fondo">
          <svg className="rv-ola-capa rv-ola-capa-2 text-sky-light" viewBox="0 0 1200 64" preserveAspectRatio="none" fill="currentColor"><path d="M0 34 C 150 6, 300 62, 450 34 S 750 6, 900 34 S 1050 60, 1200 34 V64 H0 Z" /></svg>
          <svg className="rv-ola-capa" viewBox="0 0 1200 64" preserveAspectRatio="none" fill="currentColor"><path d="M0 44 C 150 18, 300 62, 450 40 S 750 14, 900 42 S 1050 58, 1200 44 V64 H0 Z" /></svg>
        </div>
      </div>

      {/* min-w-0: sin esto, las filas con scroll horizontal ensanchan la cuadrícula y en el celular se corta el texto. */}
      <div className="relative mx-auto grid max-w-5xl gap-x-10 gap-y-6 px-4 pb-24 pt-7 md:pb-28 md:pt-10 lg:grid-cols-[1fr_1.05fr]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="rv-entra-izq inline-flex items-center gap-2.5 rounded-2xl bg-primary px-4 py-2.5 text-white">
            <Icono nombre="escudo" className="h-6 w-6 text-accent" />
            <span className="text-[11px] font-extrabold uppercase leading-tight tracking-wide">
              Abogados <span className="text-accent">especialistas</span>
              <br />
              en extranjería
            </span>
          </div>

          <h1 className="mt-4 text-[2.3rem] font-black uppercase leading-[1.02] tracking-tight md:text-[3.4rem]" aria-label={TITULO.join(" ")}>
            {TITULO.map((p, i) => (
              <span key={i} className="rv-palabra mr-[0.22em]" style={{ animationDelay: `${i * 70}ms` }} aria-hidden="true">
                {p === "asesoría" ? <span className="text-accent">{p}</span> : p}
              </span>
            ))}
          </h1>
          <p className="rv-entra-izq mt-3 inline-block rounded-full bg-primary px-5 py-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-white" style={{ animationDelay: "260ms" }}>
            Diagnóstico
          </p>

          <p className="rv-sube mt-5 text-[17px] leading-relaxed text-tinta-2 md:text-lg" style={{ animationDelay: "320ms" }}>
            En <strong className="text-primary">30 minutos</strong>, una especialista en <strong className="text-primary">Derecho Internacional y movilidad académica</strong> analiza tu perfil y te explica, paso a paso, el camino que te conviene seguir.
          </p>
          <ul className="mt-4 space-y-2 text-[15px] font-semibold text-primary">
            {["Orientación clara y estratégica, a tu medida", "Una persona real, con experiencia en trámites hacia España", "Reunión por Google Meet y pago seguro"].map((t, i) => (
              <li key={t} className="rv-desliza flex items-start gap-2.5" style={{ animationDelay: `${420 + i * 90}ms` }}>
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                  <Icono nombre="check" className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Disponibilidad cargando={cargando} servicios={servicios} servicioId={servicioId} onServicio={onServicio} dias={dias} horaVista={horaVista} hora={hora} onElegir={onElegir} libres={libres} />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {/* Precio dorado, como en los flyers */}
          {servicio?.precio > 0 && (
            <div className="rv-pop-grande flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#FFEBB5] to-[#FFC857] p-4 shadow-[0_18px_36px_-22px_rgba(224,122,28,.9)]">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-accent">
                <Icono nombre="rayo" className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary/80">Primera asesoría por solo</p>
                <p className="text-4xl font-black leading-none text-primary">{precioCorto(servicio)}</p>
              </div>
              <ul className="ml-auto hidden text-[12px] font-semibold text-primary sm:block">
                <li>✓ Pago seguro</li>
                <li>✓ Reprograma sin costo</li>
                <li>✓ Reunión por Google Meet</li>
              </ul>
            </div>
          )}

          <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {TARJETAS.map(([ic, t, d], i) => (
              <li key={t} className="rv-sube flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-linea sm:flex-col" style={{ animationDelay: `${420 + i * 80}ms` }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-accent">
                  <Icono nombre={ic} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[13px] font-extrabold uppercase leading-tight text-primary">{t}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Para quien no se decide todavía */}
          <div className="rv-sube mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-linea" style={{ animationDelay: "700ms" }}>
            <p className="text-sm font-extrabold text-primary">¿Aún lo estás pensando?</p>
            <p className="mt-0.5 text-[13px] text-muted">Te enviamos el acceso a la agenda por correo, sin compromiso.</p>
            {pensando ? (
              <div ref={formRef} className="rv-entrada mt-3">
                <FormRecordarme servicioId={servicioId} compacto claro />
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPensando(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white transition hover:bg-primary-light active:scale-[0.97]">
                  <Icono nombre="sobre" className="h-4 w-4" /> Enviármelo al correo
                </button>
                <a href={whatsappUrl("Hola Inspira, tengo dudas antes de reservar mi asesoría.")} className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-[13px] font-bold text-primary transition hover:bg-primary/5 active:scale-[0.97]">
                  <Icono nombre="whatsapp" className="h-4 w-4" /> Escribir por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
