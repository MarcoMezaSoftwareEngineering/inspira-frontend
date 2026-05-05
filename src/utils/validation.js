// src/utils/validation.js — Reglas de negocio compartidas entre panel y backoffice

// ── Formulario de datos académicos ────────────────────────────────────────────

// Campos obligatorios del formulario académico del cliente (mismo modelo en
// DetalleSolicitud (panel) y SolicitudDetalleBackoffice (admin))
export const CAMPOS_REQUERIDOS_FORMULARIO = [
  "promedio_peru",
  "ubicacion_grupo",
  "otra_maestria_tiene",
  "experiencia_anios",
  "ingles_situacion",
  "beca_desea",
  "duracion_preferida",
  "practicas_preferencia",
];

// Retorna true si todos los campos requeridos están completos
export function formCompleto(datos) {
  if (!datos) return false;
  const base = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (c) => datos[c] !== undefined && datos[c] !== null && datos[c] !== ""
  );
  if (!base) return false;
  // Si tiene experiencia laboral real, también debe declarar si es vinculada
  if (datos.experiencia_anios && datos.experiencia_anios !== "sin") {
    if (!datos.experiencia_vinculada) return false;
  }
  return true;
}
