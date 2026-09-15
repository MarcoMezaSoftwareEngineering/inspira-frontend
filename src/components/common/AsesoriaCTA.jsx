// src/components/common/AsesoriaCTA.jsx
// Invitación permanente a la sesión diagnóstico: botón flotante y pestaña
// lateral, que abren Calendly directamente —el único destino de reserva de la
// web (config/contacto.js)—, y una ventana con las modalidades que sale sola
// una vez por sesión tras leer un poco. Hasta el 14/09/2026 el botón, la
// pestaña y la barra inferior abrían esa ventana como paso intermedio.
// La ventana vuelve a aparecer en cada visita (solo se silencia dentro de la
// misma sesión de navegación, para no molestar mientras se lee).
import { useEffect, useState } from "react";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { OPCIONES_ASESORIA, promoVigente } from "../../config/asesorias";
import ReservaLateral from "./ReservaLateral";

const VISTO_KEY = "inspira_cta_asesoria_visto"; // sessionStorage: por sesión

// Páginas con su propia barra de acción fija: la ventana no se abre sola ahí.
const SIN_VENTANA = ["/beca-generacion-bicentenario-2026", "/mapa-estudiar-en-espana", "/enlaces"];

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

  // Se abre sola una vez por sesión, tras leer un poco de la página. En el
  // móvil tapaba la lectura (clienta, 15/09/2026): allí espera más y sale como
  // hoja compacta. La ruta se mira al disparar, porque se navega sin recargar.
  useEffect(() => {
    if (sessionStorage.getItem(VISTO_KEY)) return;
    const movil = window.matchMedia("(max-width: 639px)").matches;
    const t = setTimeout(() => {
      if (SIN_VENTANA.some((p) => window.location.pathname.startsWith(p))) return;
      if (window.scrollY > (movil ? 1400 : 700)) {
        setAbierto(true);
        sessionStorage.setItem(VISTO_KEY, "1");
      }
    }, movil ? 45000 : 15000);
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
      {/* Pestaña lateral fija (escritorio): directa a Calendly */}
      <ReservaLateral visible={visible} />

      {/* Botón flotante: directo a Calendly, como la cabecera */}
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reserva tu sesión diagnóstico"
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
        {promo ? "Asesoría gratis" : "Reserva tu sesión"}
      </a>

      {/* Panel */}
      {abierto && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reserva tu asesoría"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cerrar}
          />
          {/* Móvil: hoja compacta desde abajo; el ✕ queda fuera del scroll. */}
          <div className="relative flex max-h-[78dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-primary shadow-lg ring-1 ring-black/10 transition hover:bg-neutral-100"
            >
              ✕
            </button>

            <div
              className="shrink-0 px-5 pb-4 pt-4 text-white sm:px-7 sm:pb-6 sm:pt-8"
              style={{ background: "linear-gradient(135deg, #013446, #02506B)" }}
            >
              <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-white/30 sm:hidden" aria-hidden="true" />
              <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold sm:inline-block">
                Reserva tu asesoría
              </span>
              <h2 className="pr-12 font-fraunces text-xl font-bold leading-tight sm:mt-4 sm:text-2xl">
                Una asesoría a distancia para vivir en España 🇪🇸
              </h2>
              <p className="mt-2 hidden text-sm leading-relaxed text-white/70 sm:block">
                Reunión online con un especialista en extranjería. Sales con un
                diagnóstico de tu caso y un plan de acción.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6">
              {opciones.map((o) => (
                <a
                  key={o.id}
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={cerrar}
                  className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-3 transition sm:p-4 hover:-translate-y-0.5 hover:shadow-md ${
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
                href={whatsappDesde(
                  window.location.pathname,
                  "Quiero agendar una asesoría para migrar a España."
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cerrar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3 font-bold text-primary transition hover:bg-secondary"
              >
                💬 Prefiero escribir por WhatsApp
              </a>
              <button
                type="button"
                onClick={cerrar}
                className="w-full py-2 text-sm font-bold text-neutral-600 underline underline-offset-4 hover:text-primary"
              >
                Ahora no, seguir leyendo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
