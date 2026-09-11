// src/pages/landing/master2027/BarraYModales.jsx
// Barra fija de reserva y ventana emergente. La página decide cuándo se
// muestran; aquí solo se pintan.
//
// Las dos se montan en document.body con un portal: App.jsx envuelve cada
// página en .v4-page-enter, cuya animación (fill-mode both) deja la propiedad
// transform animada, y un ancestro así convierte `position: fixed` en «fijo
// respecto a la página»: la barra acababa bajo el pie y el modal, fuera de la
// pantalla. Fuera de ese envoltorio no heredan ni la fuente ni la variable de
// alto de la barra, así que las declaran aquí.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icono from "../../../components/common/Icono";
import { BARRA, CTA, MODALES } from "../../../config/paqueteMaster2027";
import { BotonReserva } from "./comunes";

function Cruz() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Se esconde con transform (nunca opacity) y queda inerte mientras no se ve. */
export function BarraReserva({ oculta, onCerrar }) {
  return createPortal(
    <div
      role="region"
      aria-label={BARRA.titulo}
      inert={oculta}
      className={`fixed inset-x-0 bottom-0 z-40 h-[4.5rem] border-t border-white/10 bg-primary/95 px-3 font-sans shadow-[0_-6px_24px_rgba(1,52,70,0.25)] backdrop-blur-sm transition-transform duration-300 ease-out min-[380px]:px-4 ${
        oculta ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-white sm:hidden">{BARRA.tituloMovil}</p>
          <p className="hidden truncate text-sm font-bold text-white sm:block">{BARRA.titulo}</p>
          <p className="truncate text-xs text-white/80 sm:hidden">{BARRA.subtituloMovil}</p>
          <p className="hidden truncate text-xs text-white/80 sm:block">{BARRA.subtitulo}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <BotonReserva ubicacion="barra" compacto>
            {CTA.barra}
          </BotonReserva>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={BARRA.cerrar}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Cruz />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function VentanaModal({ tipo, onCerrar, onCta }) {
  const m = MODALES[tipo];
  const cerrarRef = useRef(null);
  const dialogoRef = useRef(null);

  useEffect(() => {
    const previo = document.activeElement;
    cerrarRef.current?.focus({ preventScroll: true });
    const alTeclear = (e) => {
      if (e.key === "Escape") {
        onCerrar();
        return;
      }
      // Trampa de foco: Tab y Mayús+Tab no salen del diálogo.
      if (e.key !== "Tab" || !dialogoRef.current) return;
      const focables = [...dialogoRef.current.querySelectorAll("a[href], button:not([disabled])")];
      if (!focables.length) return;
      const primero = focables[0];
      const ultimo = focables[focables.length - 1];
      const dentro = dialogoRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primero || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      if (previo instanceof HTMLElement) previo.focus({ preventScroll: true });
    };
  }, [onCerrar]);

  if (!m) return null;

  return createPortal(
    <div
      // Por encima del banner de cookies (z-[9999]), que sigue disponible al cerrar.
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-primary/70 p-4 font-sans backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="m27-modal-titulo"
        aria-describedby="m27-modal-texto"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl motion-safe:animate-[m27-emerge_0.3s_ease-out_both] sm:p-7"
      >
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label={MODALES.textoCerrar}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-primary"
        >
          <Cruz />
        </button>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-sun">
          <Icono nombre={m.icono} size={28} />
        </span>
        <h2 id="m27-modal-titulo" className="mt-4 font-fraunces text-xl font-bold leading-snug text-primary">
          {m.titulo}
        </h2>
        <p id="m27-modal-texto" className="mt-2 text-sm leading-relaxed text-neutral-700">
          {m.texto}
        </p>
        <div className="mt-6">
          <BotonReserva ubicacion={`modal_${tipo}`} alPulsar={onCta} className="w-full [&>a]:w-full">
            {CTA.modal}
          </BotonReserva>
        </div>
        {m.ahoraNo && (
          <button
            type="button"
            onClick={onCerrar}
            className="mt-3 text-sm font-semibold text-neutral-600 underline underline-offset-4 hover:text-primary"
          >
            {MODALES.textoAhoraNo}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
