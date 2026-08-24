// src/components/common/AsesoriaCTA.jsx
// Invitación permanente a la asesoría: botón flotante, pestaña lateral y
// panel con las modalidades disponibles, que abre Calendly.
// El panel vuelve a aparecer en cada visita (solo se silencia dentro de la
// misma sesión de navegación, para no molestar mientras se lee).
import { useEffect, useState } from "react";
import { CALENDLY_URL, whatsappUrl } from "../../config/contacto";
import { OPCIONES_ASESORIA, promoVigente } from "../../config/asesorias";
import ReservaLateral from "./ReservaLateral";

const VISTO_KEY = "inspira_cta_asesoria_visto"; // sessionStorage: por sesión

export default function AsesoriaCTA() {
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);

  const promo = promoVigente();
  const opciones = OPCIONES_ASESORIA.filter((o) => !o.promo || promo);

  // El botón flotante aparece tras un breve scroll para no tapar el hero.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Se abre solo una vez por sesión, tras leer un poco de la página.
  useEffect(() => {
    if (sessionStorage.getItem(VISTO_KEY)) return;
    const t = setTimeout(() => {
      if (window.scrollY > 700) {
        setAbierto(true);
        sessionStorage.setItem(VISTO_KEY, "1");
      }
    }, 15000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cerrar = () => {
    setAbierto(false);
    sessionStorage.setItem(VISTO_KEY, "1");
  };

  return (
    <>
      {/* Pestaña lateral fija (escritorio) */}
      <ReservaLateral onAbrir={() => setAbierto(true)} />

      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Agendar asesoría"
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-105 ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ background: "linear-gradient(135deg, #FA943A, #E07A1C)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        {promo ? "Asesoría gratis" : "Agenda tu asesoría"}
      </button>

      {/* Panel */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cerrar}
          />
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
            >
              ✕
            </button>

            <div
              className="px-7 pb-6 pt-8 text-white"
              style={{ background: "linear-gradient(135deg, #013446, #02506B)" }}
            >
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                Reserva tu asesoría
              </span>
              <h2 className="mt-4 font-fraunces text-2xl font-bold leading-tight">
                Una asesoría de distancia para vivir en España 🇪🇸
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Reunión online con un especialista en extranjería. Sales con un
                diagnóstico de tu caso y un plan de acción.
              </p>
            </div>

            <div className="space-y-3 px-7 py-6">
              {opciones.map((o) => (
                <a
                  key={o.id}
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={cerrar}
                  className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                    o.destacada
                      ? "border-accent bg-accent/5"
                      : o.promo
                      ? "border-green-600 bg-green-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">
                      {o.duracion}
                    </p>
                    <p className="font-bold text-neutral-900">{o.nombre}</p>
                    {o.promo && (
                      <p className="mt-0.5 text-xs font-semibold text-green-700">
                        Solo hasta el 22 de septiembre
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-xl font-extrabold ${
                        o.promo ? "text-green-700" : "text-primary"
                      }`}
                    >
                      {o.precio}
                    </p>
                    {o.precioAlt && (
                      <p className="text-[11px] text-neutral-500">{o.precioAlt}</p>
                    )}
                  </div>
                </a>
              ))}

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cerrar}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-extrabold text-white transition hover:bg-accent-dark"
              >
                📅 Ver disponibilidad
              </a>
              <a
                href={whatsappUrl(
                  "Hola Inspira, quiero agendar una asesoría para migrar a España."
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cerrar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3 font-bold text-primary transition hover:bg-secondary"
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
