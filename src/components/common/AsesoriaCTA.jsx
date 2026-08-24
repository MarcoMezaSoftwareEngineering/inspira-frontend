// src/components/common/AsesoriaCTA.jsx
// Invitación permanente a la primera asesoría: botón flotante en todas las
// páginas públicas + panel que abre Calendly, igual que el Linktree de la marca.
import { useEffect, useState } from "react";
import { CALENDLY_URL, ASESORIA, whatsappUrl } from "../../config/contacto";

const VISTO_KEY = "inspira_cta_asesoria_cerrado";

export default function AsesoriaCTA() {
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);

  // El botón aparece tras un breve scroll para no tapar el hero de entrada.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Primera visita: el panel se abre solo una vez, y solo tras leer un poco.
  useEffect(() => {
    if (localStorage.getItem(VISTO_KEY)) return;
    const t = setTimeout(() => {
      if (window.scrollY > 900) {
        setAbierto(true);
        localStorage.setItem(VISTO_KEY, "1");
      }
    }, 18000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cerrar = () => {
    setAbierto(false);
    localStorage.setItem(VISTO_KEY, "1");
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Agendar primera asesoría"
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-105 ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ background: "linear-gradient(135deg, #F49E4B, #e07f22)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        Agenda tu asesoría
      </button>

      {/* Panel */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cerrar}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
            >
              ✕
            </button>

            <div
              className="px-7 pb-7 pt-8 text-white"
              style={{ background: "linear-gradient(135deg, #023A4B, #054A5E)" }}
            >
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                Primera asesoría diagnóstica
              </span>
              <h2 className="mt-4 font-fraunces text-2xl font-bold leading-tight">
                Sal de la sesión con una ruta clara para tu caso.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {ASESORIA.duracion} con un abogado especialista en extranjería.
                {" "}{ASESORIA.modalidad}.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-accent">
                  {ASESORIA.precioEur}
                </span>
                <span className="text-sm text-white/60">
                  o {ASESORIA.precioUsd} · {ASESORIA.precioPen}
                </span>
              </div>
            </div>

            <div className="px-7 py-6">
              <ul className="space-y-2.5 text-sm text-neutral-700">
                {[
                  "Diagnóstico de tu caso y análisis de viabilidad real.",
                  "Definimos tu mejor vía: visado, estancia, residencia o estudios.",
                  "Plan de acción con próximos pasos y documentos necesarios.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="font-bold text-primary" aria-hidden>
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cerrar}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-extrabold text-white transition hover:bg-accent-dark"
              >
                📅 Elegir día y hora
              </a>
              <a
                href={whatsappUrl(
                  "Hola Inspira, quiero agendar la primera asesoría de 30 minutos."
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cerrar}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3 font-bold text-primary transition hover:bg-secondary"
              >
                💬 Prefiero escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
