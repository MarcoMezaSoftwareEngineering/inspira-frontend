// src/components/common/EnviarPlan.jsx
// Captura de correo al terminar el diagnóstico: el visitante se lleva su
// plan y nosotros nos quedamos el contacto de alguien interesado.
import { useState } from "react";
import Icono from "./Icono";
import { registrarEvento } from "../../lib/analytics";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EnviarPlan({ resultado, respuestas }) {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | ok | error
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Escribe un correo válido para poder enviártelo.");
      return;
    }

    setEstado("enviando");
    try {
      const r = await fetch(`${API_URL}/api/leads/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          nombre: nombre.trim(),
          via: resultado.via,
          titulo: resultado.titulo,
          resumen: resultado.resumen,
          plazo: resultado.plazo,
          empezar: resultado.empezar,
          documentos: resultado.documentos,
          respuestas: respuestas.map((h) => ({ p: h.pregunta, r: h.resp })),
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.msg || "No pudimos enviarlo.");
      setEstado("ok");
      registrarEvento("plan_enviado", { via: resultado.via });
    } catch (err) {
      setEstado("error");
      setError(err.message || "No pudimos enviarlo. Inténtalo de nuevo.");
    }
  };

  if (estado === "ok") {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-green-600 bg-green-50 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
          <Icono nombre="escudo" size={19} />
        </span>
        <div>
          <p className="text-sm font-bold text-green-800">
            Te enviamos tu plan a {email}
          </p>
          <p className="text-[12.5px] text-green-700">
            Si no lo ves en unos minutos, revisa la carpeta de spam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border-2 border-dashed border-sky-dark/40 bg-sky-light/40">
      {!abierto ? (
        <button
          type="button"
          onClick={() => {
            setAbierto(true);
            registrarEvento("plan_envio_abierto", { via: resultado.via });
          }}
          className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-sky-light/70"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-dark">
            <Icono nombre="documento" size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-[15px] font-bold text-primary">
              ¿Te enviamos este plan a tu correo?
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-neutral-600">
              Para que lo tengas a mano cuando lo necesites. Gratis y sin
              compromiso.
            </span>
          </span>
          <span className="shrink-0 font-bold text-accent" aria-hidden>
            →
          </span>
        </button>
      ) : (
        <form onSubmit={enviar} className="px-5 py-5">
          <p className="font-display text-[15px] font-bold text-primary">
            Te lo mandamos ahora mismo
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <input
              type="text"
              value={nombre}
              onChange={(ev) => setNombre(ev.target.value)}
              placeholder="Tu nombre (opcional)"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-dark"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-dark"
            />
          </div>

          {error && (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={estado === "enviando"}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-light disabled:opacity-60"
            >
              {estado === "enviando" ? "Enviando…" : "Enviarme el plan"}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-[13px] font-semibold text-neutral-500 hover:text-primary"
            >
              Ahora no
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
            Usamos tu correo solo para enviarte este plan y, si lo consientes,
            información sobre nuestros servicios. Puedes darte de baja cuando
            quieras.
          </p>
        </form>
      )}
    </div>
  );
}
