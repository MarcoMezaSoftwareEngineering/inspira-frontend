// src/pages/landing/master2027/comunes.jsx
// Piezas compartidas por las secciones de la landing /master-2027-2028.
import { useEffect, useState } from "react";
import Icono from "../../../components/common/Icono";
import { CTA, WHATSAPP } from "../../../config/paqueteMaster2027";
import { URL_CALENDLY, evento, registrarCta, prefiereMenosMovimiento } from "./medicion";

// Entradas solo con transform: el contenido nunca depende de la animación.
// Las comparten la landing /master-2027-2028 y /servicios/master.
export const ESTILOS_M27 = `
@keyframes m27-sube { from { transform: translateY(18px); } to { transform: translateY(0); } }
@keyframes m27-emerge { from { transform: translateY(16px) scale(0.96); } to { transform: translateY(0) scale(1); } }
@keyframes m27-hoja { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes m27-pulso { 0% { transform: scale(1); opacity: 0.45; } 70%, 100% { transform: scale(1.05, 1.28); opacity: 0; } }
`;

/**
 * Botón a Calendly. Etiqueta única de 37 caracteres: en 390 px cabe en una
 * línea a 15 px con este relleno (medido con Montserrat 700: 292 px), y por
 * debajo de 380 px baja a 14 px. Nunca se parte en dos líneas.
 */
export function BotonReserva({
  ubicacion,
  children,
  pulso = false,
  ancho = false,
  grande = false,
  compacto = false,
  alPulsar,
  className = "",
}) {
  const tamano = compacto
    ? "px-4 py-2.5 text-sm"
    : grande
      ? "px-4 py-4 text-[14px] min-[380px]:text-[15px] sm:px-8 sm:py-5 sm:text-lg"
      : "px-4 py-3.5 text-[14px] min-[380px]:text-[15px] sm:px-7 sm:py-4 sm:text-base";
  return (
    <span className={`relative inline-flex ${ancho ? "w-full sm:w-auto" : ""} ${className}`}>
      {pulso && (
        // Halo decorativo detrás del botón (keyframes m27-pulso en la página).
        // Crece poco a propósito: a todo el ancho del móvil, un ping al doble
        // se veía como una franja naranja.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-accent motion-safe:animate-[m27-pulso_2.4s_ease-out_infinite] motion-reduce:hidden"
        />
      )}
      <a
        href={URL_CALENDLY}
        target="_blank"
        rel="noopener"
        onClick={() => {
          registrarCta(ubicacion);
          alPulsar?.();
        }}
        className={`relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent font-bold text-white shadow-[0_10px_30px_-10px_rgba(250,148,58,0.7)] transition-transform duration-200 ease-out hover:scale-[1.03] hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun active:scale-95 ${ancho ? "w-full sm:w-auto" : ""} ${tamano}`}
      >
        {children ?? CTA.principal}
      </a>
    </span>
  );
}

/** Línea de contexto que va encima del botón, nunca dentro. */
export function Contexto({ children, oscuro = false, className = "" }) {
  return (
    <p className={`mb-3 text-sm font-semibold ${oscuro ? "text-white/85" : "text-primary"} ${className}`}>
      {children}
    </p>
  );
}

/** Bloque de cierre de sección: contexto + botón. */
export function CierreCta({ contexto, ubicacion, oscuro = false, centrado = true }) {
  return (
    <div className={`mt-10 ${centrado ? "text-center" : ""}`}>
      {contexto && <Contexto oscuro={oscuro}>{contexto}</Contexto>}
      <BotonReserva ubicacion={ubicacion} ancho />
    </div>
  );
}

export function Eyebrow({ children, oscuro = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${oscuro ? "text-sky" : "text-primary-light"}`}
    >
      <span aria-hidden="true" className="h-[3px] w-5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function TituloSeccion({ eyebrow, titulo, intro, oscuro = false, centrado = true, id }) {
  return (
    <div className={`${centrado ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      {eyebrow && <Eyebrow oscuro={oscuro}>{eyebrow}</Eyebrow>}
      <h2
        id={id}
        className={`mt-3 font-fraunces text-[26px] font-bold leading-tight sm:text-4xl ${oscuro ? "text-white" : "text-primary"}`}
      >
        {titulo}
      </h2>
      {intro && (
        <p className={`mt-4 leading-relaxed ${oscuro ? "text-white/80" : "text-neutral-700"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

export function EnlaceWhatsapp({ ubicacion, oscuro = false }) {
  return (
    <a
      href={WHATSAPP.url}
      target="_blank"
      rel="noopener"
      onClick={() => evento("ads2027_whatsapp", { ubicacion })}
      className={`inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 ${oscuro ? "text-white/85 hover:text-white" : "text-primary-light hover:text-primary"}`}
    >
      <Icono nombre="chat" size={18} />
      {WHATSAPP.texto}
    </a>
  );
}

export function Descargo({ children, oscuro = false, className = "" }) {
  return (
    <p className={`text-xs leading-relaxed sm:text-[13px] ${oscuro ? "text-white/70" : "text-neutral-600"} ${className}`}>
      {children}
    </p>
  );
}

/**
 * Entrada solo con transform (nunca opacity) y sin IntersectionObserver: el
 * contenido es visible pase lo que pase con la animación.
 */
export function Entrada({ children, retraso = 0, className = "" }) {
  return (
    <div
      className={`motion-safe:animate-[m27-sube_0.6s_ease-out_both] ${className}`}
      style={retraso ? { animationDelay: `${retraso}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Cifra que sube desde cero al montar (con punto de miles). Va por pasos con
 * setTimeout y no con requestAnimationFrame: en una pestaña en segundo plano o
 * en una captura sin pintar, rAF se detiene y la cifra se quedaría a medias.
 */
const PASOS_CIFRA = 30;

export function CifraAnimada({ valor, prefijo = "", sufijo = "", duracion = 1200 }) {
  const [n, setN] = useState(() => (prefiereMenosMovimiento() ? valor : 0));
  useEffect(() => {
    if (prefiereMenosMovimiento()) return undefined;
    let paso = 0;
    let temporizador;
    const avanzar = () => {
      paso += 1;
      const p = paso / PASOS_CIFRA;
      setN(paso >= PASOS_CIFRA ? valor : Math.round(valor * (1 - Math.pow(1 - p, 3))));
      if (paso < PASOS_CIFRA) temporizador = setTimeout(avanzar, duracion / PASOS_CIFRA);
    };
    temporizador = setTimeout(avanzar, duracion / PASOS_CIFRA);
    return () => clearTimeout(temporizador);
  }, [valor, duracion]);
  const texto = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (
    <span className="tabular-nums">
      {prefijo}
      {texto}
      {sufijo}
    </span>
  );
}

export function Chip({ children, icono, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {icono && <Icono nombre={icono} size={14} />}
      {children}
    </span>
  );
}
