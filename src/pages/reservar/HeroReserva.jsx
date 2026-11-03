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

const TITULO = ["Tu", "camino", "a", "España", "empieza", "con", "una", "conversación."];

// Cuenta de 0 a `valor` en ~0,9 s (sin animar si el usuario pidió menos movimiento).
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
      const p = Math.min(1, (ahora - inicio) / 900);
      setN(Math.round(valor * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return n;
}

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

function Camino({ icono, titulo, texto, children, destacado = false }) {
  return (
    <li
      className={[
        "rv-camino flex flex-col rounded-2xl p-4 text-left ring-1 backdrop-blur-sm",
        destacado ? "bg-white text-tinta ring-white/60 shadow-[0_22px_50px_-24px_rgba(0,0,0,.7)]" : "bg-white/10 text-white ring-white/15",
      ].join(" ")}
    >
      <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${destacado ? "bg-accent text-white" : "bg-white/15 text-sky"}`}>
        <Icono nombre={icono} />
      </span>
      <h3 className={`font-semibold ${destacado ? "text-primary" : "text-white"}`}>{titulo}</h3>
      <p className={`mt-1 text-[13px] leading-relaxed ${destacado ? "text-tinta-2" : "text-white/75"}`}>{texto}</p>
      <div className="mt-4 flex-1 content-end">{children}</div>
    </li>
  );
}

export default function HeroReserva({ cargando, primeroTexto, libres7, servicioId, onReservarYa }) {
  const [pensando, setPensando] = useState(false);
  const formRef = useRef(null);
  const contador = useContador(libres7);

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
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-10 md:pb-32 md:pt-14">
        <p className="rv-sube inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-sky ring-1 ring-white/15" style={{ animationDelay: "0ms" }}>
          <Icono nombre="escudo" className="h-3.5 w-3.5" />
          Abogados especialistas en extranjería española
        </p>

        <h1 className="mt-4 max-w-3xl font-fraunces text-[2.4rem] font-semibold leading-[1.08] md:text-6xl" aria-label={TITULO.join(" ")}>
          {TITULO.map((p, i) => (
            <span key={i} className="rv-palabra" style={{ animationDelay: `${120 + i * 70}ms` }} aria-hidden="true">
              {p === "conversación." ? <span className="text-accent">{p}</span> : p}{" "}
            </span>
          ))}
        </h1>

        <p className="rv-sube mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 md:text-base" style={{ animationDelay: "700ms" }}>
          En una sesión, un abogado revisa tu caso y te dice qué camino te conviene: máster, visado, estancia o becas. Pagas solo la sesión y sales con un plan claro.
        </p>

        {/* Dato vivo de la agenda */}
        <div className="rv-sube mt-5 flex flex-wrap items-center gap-2.5 text-[13px]" style={{ animationDelay: "820ms" }} aria-live="polite">
          {cargando ? (
            <span className="rv-esqueleto h-8 w-64 rounded-full bg-white/10" />
          ) : primeroTexto ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="rv-pulso absolute inline-flex h-full w-full rounded-full bg-verde" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-verde" />
                </span>
                Próximo horario libre: <strong className="font-semibold capitalize">{primeroTexto}</strong>
              </span>
              {libres7 > 0 && (
                <span className="rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15">
                  <strong className="font-semibold tabular-nums">{contador}</strong> horarios libres en los próximos 7 días
                </span>
              )}
            </>
          ) : (
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15">Los horarios nuevos se abren cada semana: déjanos tu correo y te avisamos.</span>
          )}
        </div>

        {/* Tres maneras de empezar */}
        <ul className="mt-7 grid gap-3 md:grid-cols-3">
          <Camino icono="rayo" titulo="Quiero reservar ya" texto="Elige el servicio, el día y la hora. En un minuto tu horario queda separado." destacado>
            <button
              type="button"
              onClick={onReservarYa}
              disabled={cargando}
              className="rv-cta group relative w-full overflow-hidden rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
            >
              <span className="relative inline-flex items-center justify-center gap-2">
                {primeroTexto ? "Reservar el primer horario libre" : "Ver horarios"}
                <Icono nombre="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </Camino>

          <Camino icono="whatsapp" titulo="Prefiero escribir primero" texto="¿Dudas antes de pagar? Cuéntanos tu caso por WhatsApp y te orientamos.">
            <a
              href={whatsappUrl("Hola Inspira, tengo dudas antes de reservar mi asesoría.")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              <Icono nombre="whatsapp" className="h-4 w-4" /> Escribir por WhatsApp
            </a>
          </Camino>

          <Camino icono="sobre" titulo="Aún lo estoy pensando" texto="Te enviamos el acceso a la agenda por correo, sin compromiso.">
            {pensando ? (
              <div ref={formRef} className="rv-entrada">
                <FormRecordarme servicioId={servicioId} compacto />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPensando(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                <Icono nombre="sobre" className="h-4 w-4" /> Enviármelo al correo
              </button>
            )}
          </Camino>
        </ul>

        <ul className="rv-sube mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/80" style={{ animationDelay: "1000ms" }}>
          {[
            ["escudo", "Pago seguro"],
            ["usuario", "Puedes reservar sin crear cuenta"],
            ["ciclo", "Reprograma sin costo (24 h antes)"],
            ["video", "Reunión por Google Meet"],
          ].map(([ic, t]) => (
            <li key={t} className="inline-flex items-center gap-2">
              <Icono nombre={ic} className="h-4 w-4 text-sky" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
