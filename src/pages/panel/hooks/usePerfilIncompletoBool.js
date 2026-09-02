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
export function usePerfilIncompletoBool(user, conAcademico = true) {
  return useMemo(() => {
    if (!user) return false;
    const checks = conAcademico ? [...GENERALES, ...ACADEMICOS] : GENERALES;
    return checks.some((fn) => {
      const v = fn(user);
      return !v || !String(v).trim();
    });
  }, [user, conAcademico]);
}
