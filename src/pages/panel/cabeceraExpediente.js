// Lo que un expediente abierto cuenta a la barra de arriba del panel.
//
// Hasta el 17/09/2026 la barra decía «Mis servicios» dentro de cualquier
// expediente, y cada uno repetía debajo su propio botón de volver y una
// tarjeta con su nombre y su avance: en el teléfono, media pantalla de
// cabeceras antes del contenido. Ahora el expediente publica aquí su nombre y
// su avance, la barra los enseña con la flecha de volver, y las cabeceras
// propias quedan solo en pantalla grande.
import { createContext, useContext, useEffect } from "react";

export const CabeceraExpedienteCtx = createContext(null);

/**
 * @param {{ eyebrow?: string, titulo?: string, pct?: number|null }} datos
 * Se publica al montar y cada vez que cambia; se retira al salir.
 */
export function usePublicarCabecera({ eyebrow = null, titulo = null, pct = null } = {}) {
  const publicar = useContext(CabeceraExpedienteCtx);
  useEffect(() => {
    if (!publicar) return undefined;
    publicar({ eyebrow, titulo, pct: pct == null || Number.isNaN(Number(pct)) ? null : Math.max(0, Math.min(100, Math.round(pct))) });
    return undefined;
  }, [publicar, eyebrow, titulo, pct]);
  useEffect(() => () => publicar?.(null), [publicar]);
}

/** Avance del recorrido de Extranjería, para la barra de arriba (0-100). */
export function avanceDeRevision(revision) {
  const r = revision?.recorrido || [];
  if (!r.length) return null;
  const i = r.findIndex((e) => e.actual);
  const hechas = i >= 0 ? i + 1 : r.filter((e) => e.pasada).length;
  return (hechas / r.length) * 100;
}
