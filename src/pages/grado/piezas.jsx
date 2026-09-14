// src/pages/grado/piezas.jsx
// Piezas comunes de /grado-en-espana: sección, títulos, botones y avisos.
import Icono from "../../components/common/Icono";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";

export function evento(nombre, datos = {}) {
  try {
    registrarEvento(nombre, datos);
  } catch {
    /* sin analítica: no pasa nada */
  }
}

export const WHATSAPP_GRADO = whatsappDesde(
  "grado-espana",
  "Quiero información del Paquete Grado para mi hijo o hija."
);

export function Seccion({ id, fondo = "bg-white", ancho = "max-w-6xl", children, etiqueta }) {
  return (
    <section
      id={id}
      aria-label={etiqueta}
      className={`scroll-mt-24 px-4 py-14 min-[380px]:px-5 sm:px-6 sm:py-20 ${fondo}`}
    >
      <div className={`mx-auto ${ancho}`}>{children}</div>
    </section>
  );
}

export function Titulo({ eyebrow, titulo, intro, oscuro = false, centrado = false }) {
  return (
    <div className={centrado ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
            oscuro ? "text-sky" : "text-primary-light"
          }`}
        >
          <span aria-hidden="true" className="h-[3px] w-5 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-3 font-fraunces text-[26px] font-bold leading-tight sm:text-4xl ${
          oscuro ? "text-white" : "text-primary"
        }`}
      >
        {titulo}
      </h2>
      {intro && (
        <p className={`mt-4 leading-relaxed ${oscuro ? "text-white/80" : "text-neutral-700"}`}>{intro}</p>
      )}
    </div>
  );
}

export function BotonSesion({ ubicacion, children = "Reservar la sesión diagnóstico", className = "" }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => evento("grado_cta_sesion", { ubicacion })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-accent/25 transition hover:scale-[1.02] hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun active:scale-95 ${className}`}
    >
      <Icono nombre="calendario" size={18} />
      {children}
    </a>
  );
}

export function EnlaceWhatsapp({ ubicacion, oscuro = false, children = "Escríbenos por WhatsApp" }) {
  return (
    <a
      href={WHATSAPP_GRADO}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => evento("grado_whatsapp", { ubicacion })}
      className={`inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 ${
        oscuro ? "text-white/90 hover:text-white" : "text-primary-light hover:text-primary"
      }`}
    >
      <Icono nombre="chat" size={18} />
      {children}
    </a>
  );
}

export function Orientativo({ oscuro = false, children = "Orientativo" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        oscuro ? "bg-white/10 text-white/85 ring-1 ring-white/20" : "bg-sun/25 text-primary"
      }`}
    >
      {children}
    </span>
  );
}

/** Botones de opción (una sola elegida), grandes y táctiles. */
export function Opciones({ nombre, opciones, valor, onCambio, columnas = "grid-cols-2" }) {
  return (
    <div role="radiogroup" aria-label={nombre} className={`grid gap-2 ${columnas}`}>
      {opciones.map((op) => {
        const activa = op.valor === valor;
        return (
          <button
            key={String(op.valor)}
            type="button"
            role="radio"
            aria-checked={activa}
            onClick={() => onCambio(op.valor)}
            className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-sm leading-snug transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky ${
              activa
                ? "border-primary bg-primary font-bold text-white"
                : "border-neutral-200 bg-white font-semibold text-primary hover:border-primary/50"
            }`}
          >
            {op.etiqueta}
            {op.nota && (
              <span className={`mt-0.5 block text-[11px] font-semibold ${activa ? "text-sky" : "text-neutral-500"}`}>
                {op.nota}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
