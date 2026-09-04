import { useMemo } from "react";

// Datos que se le piden a cualquiera que entre al panel: quién es, cómo
// contactarle y con qué documento viaja.
const GENERALES = [
  u => u?.nombre,
  u => u?.pais_origen,
  u => u?.datos_extra?.fecha_nacimiento,
  u => u?.pasaporte,
  u => u?.datos_extra?.pasaporte_vencimiento,
];

// Su historial académico y su plan de estudios. Solo significan algo en los
// servicios de estudios: a quien viene por una modificatoria o por un visado
// no se le pregunta en qué universidad estudió.
const ACADEMICOS = [
  u => u?.datos_extra?.carrera_titulo,
  u => u?.datos_extra?.universidad_origen,
  u => u?.datos_extra?.inicio_estudios,
  u => u?.datos_extra?.fin_estudios,
  u => u?.datos_extra?.inicio_previsto,
  u => u?.datos_extra?.presupuesto_hasta,
];

/**
 * @param conAcademico si además de los datos generales hay que exigirle el
 *                     perfil académico.
 */
/** Cuántos de esos datos faltan. Es lo que se le dice en el aviso. */
export function datosQueFaltan(user, conAcademico = true) {
  if (!user) return 0;
  const checks = conAcademico ? [...GENERALES, ...ACADEMICOS] : GENERALES;
  return checks.filter((fn) => {
    const v = fn(user);
    return !v || !String(v).trim();
  }).length;
}

export function usePerfilIncompletoBool(user, conAcademico = true) {
  return useMemo(() => datosQueFaltan(user, conAcademico) > 0, [user, conAcademico]);
}
