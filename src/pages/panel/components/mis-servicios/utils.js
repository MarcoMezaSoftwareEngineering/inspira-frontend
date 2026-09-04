// src/pages/panel/components/mis-servicios/utils.js

export function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  try {
    return new Date(fechaIso).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fechaIso;
  }
}

/**
 * Devuelve el rótulo del estado con DOS presentaciones:
 *   · `classes` — utilidades de Tailwind, que es lo que espera el encabezado
 *     del detalle y no se ha tocado.
 *   · `tono`    — el nombre del distintivo del panel rediseñado
 *     (`pnl-chip-ok`, `-aviso`, `-alto`, `-info`, `-tipo`).
 * Convivir es a propósito: el detalle de cada servicio son 15.000 líneas que
 * no entran en este rediseño, y romperle el estilo por unificar aquí habría
 * dejado la mitad del panel a medias.
 */
export function badgeEstadoSolicitud(nombreEstado, esFinal) {
  if (!nombreEstado) {
    return {
      text: "Sin estado",
      tono: "tipo",
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200",
    };
  }

  const n = nombreEstado.toLowerCase();

  if (esFinal || n.includes("complet") || n.includes("final") || n.includes("cerrad")) {
    return {
      text: nombreEstado,
      tono: "ok",
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }

  if (n.includes("observ") || n.includes("rechaz") || n.includes("deneg")) {
    return {
      text: nombreEstado,
      tono: "alto",
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200",
    };
  }

  if (n.includes("pend")) {
    return {
      text: nombreEstado,
      tono: "aviso",
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200",
    };
  }

  return {
    text: nombreEstado,
    tono: "info",
    classes:
      "text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200",
  };
}

export function badgeEstadoItemChecklist(estado) {
  const e = (estado || "pendiente").toLowerCase();

  if (e === "aprobado") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (e === "observado") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (e === "enviado") {
    return "bg-sky-50 text-sky-700 border border-sky-200";
  }
  if (e === "no_aplica") {
    return "bg-neutral-50 text-neutral-600 border border-neutral-200";
  }

  // pendiente
  return "bg-neutral-100 text-neutral-700 border border-neutral-200";
}

/**
 * El código de la solicitud, para leerlo en voz alta: los ocho primeros
 * caracteres en mayúsculas. El identificador entero es un UUID que al
 * asesorado no le dice nada y en la tarjeta parecía un error.
 */
export const refCorta = (c) => (c ? `Ref. ${String(c).slice(0, 8).toUpperCase()}` : "");
