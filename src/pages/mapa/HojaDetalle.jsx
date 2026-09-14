// src/pages/mapa/HojaDetalle.jsx
// Contenedor de la ficha: panel lateral fijo en escritorio y hoja inferior
// deslizable en móvil y tablet.
//
// La hoja se apoya encima de la barra de navegación inferior de la web
// (components/layout/BarraInferior, fija abajo y visible por debajo de
// 1100 px) y tiene dos alturas: media y completa. Se arrastra desde el asa;
// soltarla por debajo de la media la cierra. Tocar el asa alterna las alturas.
//
// Va en un portal sobre <body>: la página entra con una animación que usa
// `transform` (v4.css), y un antecesor transformado convierte `position: fixed`
// en relativo a él; sin el portal la hoja quedaba al final de la página.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { prefiereMenosMovimiento } from "./indice";

// Alto de la barra inferior (v4.css .barra-inferior), sin el área segura.
const BARRA_INFERIOR_PX = 62;

function IconoCerrar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function HojaDetalle({ esEscritorio, abierta, clave, titulo, onCerrar, children }) {
  const contenido = useRef(null);
  const [modo, setModo] = useState("media");
  const [claveVista, setClaveVista] = useState(clave);
  const [arrastre, setArrastre] = useState(null);
  const [altoVentana, setAltoVentana] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));

  // Cada ficha nueva abre a media altura (ajuste en el render, sin efecto).
  if (clave !== claveVista) {
    setClaveVista(clave);
    setModo("media");
  }

  // …y con el contenido arriba del todo.
  useEffect(() => {
    contenido.current?.scrollTo?.({ top: 0 });
  }, [clave]);

  useEffect(() => {
    const medir = () => setAltoVentana(window.innerHeight);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  if (esEscritorio) {
    return (
      <aside
        ref={contenido}
        aria-label="Detalle del mapa"
        className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_18px_40px_-24px_rgba(1,52,70,0.35)]"
      >
        <div aria-live="polite">{children}</div>
      </aside>
    );
  }

  if (!abierta || typeof document === "undefined") return null;

  const disponible = altoVentana - BARRA_INFERIOR_PX;
  const altoMedia = Math.round(disponible * 0.5);
  const altoCompleta = Math.round(disponible - 72);
  const alto = arrastre ? arrastre.alto : modo === "completa" ? altoCompleta : altoMedia;

  function empezar(e) {
    if (e.target instanceof Element && e.target.closest("button")) return;
    if (e.button != null && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setArrastre({ inicioY: e.clientY, inicioAlto: alto, alto, movido: false });
  }

  function mover(e) {
    if (!arrastre) return;
    const dy = e.clientY - arrastre.inicioY;
    setArrastre((a) =>
      a ? { ...a, alto: Math.max(96, Math.min(altoCompleta, a.inicioAlto - dy)), movido: a.movido || Math.abs(dy) > 6 } : a
    );
  }

  function soltar() {
    if (!arrastre) return;
    const { alto: final, movido } = arrastre;
    setArrastre(null);
    if (!movido) {
      setModo((m) => (m === "media" ? "completa" : "media"));
      return;
    }
    if (final < altoMedia * 0.6) {
      onCerrar();
      return;
    }
    setModo(Math.abs(final - altoCompleta) < Math.abs(final - altoMedia) ? "completa" : "media");
  }

  return createPortal(
    <section
      aria-label={titulo ? `Detalle: ${titulo}` : "Detalle del mapa"}
      className="fixed inset-x-0 z-[45] flex flex-col rounded-t-3xl border-t border-[#CFE6FD] bg-white shadow-[0_-18px_40px_-18px_rgba(0,54,72,0.45)]"
      style={{
        bottom: `calc(${BARRA_INFERIOR_PX}px + env(safe-area-inset-bottom, 0px))`,
        height: alto,
        transition: arrastre || prefiereMenosMovimiento() ? "none" : "height .28s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div
        className="cursor-grab touch-none select-none px-5 pb-2 pt-2"
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        <span aria-hidden="true" className="mx-auto block h-1.5 w-12 rounded-full bg-[#CFE6FD]" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setModo((m) => (m === "media" ? "completa" : "media"))}
            aria-expanded={modo === "completa"}
            className="mapa-titular min-w-0 truncate text-left text-sm font-bold text-[#003648]"
          >
            {titulo}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar la ficha"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6F2FE] text-[#003648] transition hover:bg-[#CFE6FD] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
          >
            <IconoCerrar />
          </button>
        </div>
      </div>
      <div ref={contenido} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        {children}
      </div>
    </section>,
    document.body
  );
}
