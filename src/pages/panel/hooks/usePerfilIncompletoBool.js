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
// El resto de la ficha. Para el paquete de máster el perfil entero es
// condición del servicio —lo pidió Carina el 04/09/2026—: con él se prepara
// el informe y la postulación, y sin teléfono no hay forma de avisarle.
const COMPLETO = [
  u => u?.datos_extra?.ciudad,
  u => u?.datos_extra?.nacionalidad,
  u => u?.telefono,
  u => u?.datos_extra?.whatsapp,
  u => u?.dni,
  u => u?.datos_extra?.dni_emision,
  u => u?.datos_extra?.dni_vencimiento,
  u => u?.datos_extra?.pasaporte_emision,
  u => u?.datos_extra?.area_carrera,
  u => u?.datos_extra?.fecha_titulo,
];

/**
 * Cuántos de esos datos faltan. Es lo que se le dice en el aviso.
 * @param conCompleto si se le exige la ficha entera (paquete de máster).
 */
export function datosQueFaltan(user, conAcademico = true, conCompleto = false) {
  if (!user) return 0;
  const checks = [
    ...GENERALES,
    ...(conAcademico ? ACADEMICOS : []),
    ...(conCompleto ? COMPLETO : []),
  ];
  return checks.filter((fn) => {
    const v = fn(user);
    return !v || !String(v).trim();
  }).length;
}

export function usePerfilIncompletoBool(user, conAcademico = true, conCompleto = false) {
  return useMemo(
    () => datosQueFaltan(user, conAcademico, conCompleto) > 0,
    [user, conAcademico, conCompleto],
  );
}
