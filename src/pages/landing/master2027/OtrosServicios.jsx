// src/pages/landing/master2027/OtrosServicios.jsx
// A6c: paquetes parciales, servicios individuales y asesorías puntuales, con
// los datos del portal /servicios/master. En la página solo va una tarjeta
// compacta; las pestañas viven en una ventana que abre el usuario (modal
// centrado en escritorio, hoja desde abajo en móvil). Se abre también con
// #otros-servicios en la URL (lo enlaza el PDF). No es una ventana emergente.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../../../components/common/Icono";
import { OTROS_SERVICIOS, eur } from "../../../config/paqueteMaster2027";
import { BotonReserva, Contexto } from "./comunes";
import { evento } from "./medicion";

const PESTANAS = OTROS_SERVICIOS.pestanas;
export const HASH_OTROS = "#otros-servicios";

function TarjetaServicio({ s }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 font-fraunces text-base font-bold leading-snug text-primary">{s.nombre}</h4>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">
          {s.desde && <span className="mr-1 text-xs font-semibold text-white/80">{OTROS_SERVICIOS.desde}</span>}
          {eur(s.precio)}
        </span>
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary-light">{s.lema}</p>
      <p className="mt-3 text-sm italic leading-snug text-neutral-600">{s.para}</p>
      <ul className="mt-3 flex-1 space-y-1.5">
        {s.incluye.map((x) => (
          <li key={x} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
            <span className="mt-0.5 shrink-0 text-accent-dark">
              <Icono nombre="escudo" size={14} />
            </span>
            {x}
          </li>
        ))}
      </ul>
      {s.nota && <p className="mt-3 rounded-lg bg-secondary-light px-3 py-2 text-xs leading-snug text-primary">{s.nota}</p>}
    </article>
  );
}

/** Tarjeta de una fila que abre la ventana. */
export function TarjetaOtrosServicios({ onAbrir }) {
  return (
    <div className="mx-auto mt-6 flex max-w-[1100px] flex-col gap-4 rounded-2xl border border-primary/15 bg-secondary-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sun">
          <Icono nombre="maletin" size={20} />
        </span>
        <p className="min-w-0 text-sm leading-snug text-neutral-700">
          <span className="block font-fraunces text-base font-bold text-primary">{OTROS_SERVICIOS.tarjeta.pregunta}</span>
          {OTROS_SERVICIOS.tarjeta.texto}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => onAbrir(e.currentTarget, "tarjeta")}
        aria-haspopup="dialog"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
      >
        {OTROS_SERVICIOS.tarjeta.boton}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/** Ventana con las pestañas: foco retenido, Esc, cerrar y foco devuelto (lo hace la página). */
export function VentanaOtrosServicios({ onCerrar }) {
  const [activa, setActiva] = useState(PESTANAS[0].id);
  const botones = useRef({});
  const dialogoRef = useRef(null);
  const cerrarRef = useRef(null);

  useEffect(() => {
    cerrarRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alTeclear = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCerrar();
        return;
      }
      if (e.key !== "Tab" || !dialogoRef.current) return;
      const focables = [
        ...dialogoRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ];
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
      document.body.style.overflow = overflow;
    };
  }, [onCerrar]);

  function elegir(id, foco = false) {
    setActiva(id);
    evento("ads2027_servicios_pestana", { pestana: id });
    if (foco) botones.current[id]?.focus();
  }

  function alTeclearPestana(e, indice) {
    const ultimo = PESTANAS.length - 1;
    const destino = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    elegir(PESTANAS[destino].id, true);
  }

  const pestana = PESTANAS.find((p) => p.id === activa);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-primary/70 font-sans backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onCerrar}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="m27-otros-titulo"
        data-m27-zona="otros-servicios"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl motion-safe:animate-[m27-hoja_0.3s_ease-out_both] sm:max-h-[88vh] sm:max-w-5xl sm:rounded-3xl sm:motion-safe:animate-[m27-emerge_0.3s_ease-out_both]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 pb-4 pt-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{OTROS_SERVICIOS.eyebrow}</p>
            <h2 id="m27-otros-titulo" className="mt-1 font-fraunces text-xl font-bold leading-snug text-primary sm:text-2xl">
              {OTROS_SERVICIOS.titulo}
            </h2>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label={OTROS_SERVICIOS.cerrar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain bg-secondary-light px-5 pb-8 pt-5 sm:px-8">
          <p className="text-sm text-neutral-700">{OTROS_SERVICIOS.intro}</p>

          <div
            role="tablist"
            aria-label={OTROS_SERVICIOS.ariaPestanas}
            className="mt-4 grid max-w-xl grid-cols-4 gap-1 rounded-2xl border border-primary/10 bg-white p-1"
          >
            {PESTANAS.map((p, i) => {
              const sel = p.id === activa;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    botones.current[p.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`servicios-tab-${p.id}`}
                  aria-selected={sel}
                  aria-controls={`servicios-panel-${p.id}`}
                  tabIndex={sel ? 0 : -1}
                  onClick={() => elegir(p.id)}
                  onKeyDown={(e) => alTeclearPestana(e, i)}
                  className={`rounded-xl px-1 py-2.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky sm:text-sm ${
                    sel ? "bg-primary text-white" : "text-primary hover:bg-secondary-light"
                  }`}
                >
                  {p.etiqueta}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`servicios-panel-${pestana.id}`}
            aria-labelledby={`servicios-tab-${pestana.id}`}
            tabIndex={0}
            className="mt-5 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
          >
            <p className="flex items-start gap-2 text-sm font-semibold text-primary">
              <span className="mt-0.5 shrink-0 text-accent-dark">
                <Icono nombre="brujula" size={16} />
              </span>
              {pestana.aviso}
            </p>
            <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
              {pestana.servicios.map((s) => (
                <div key={s.id} className="w-[84%] shrink-0 snap-start sm:w-auto">
                  <TarjetaServicio s={s} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/10 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-light">{OTROS_SERVICIOS.condicionesTitulo}</p>
            <ul className="mt-2 space-y-1.5">
              {OTROS_SERVICIOS.condiciones.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
                  <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-center">
            <Contexto>{OTROS_SERVICIOS.contexto}</Contexto>
            <BotonReserva ubicacion="otros_servicios" ancho />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
