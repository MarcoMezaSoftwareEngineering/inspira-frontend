import { SERVICIO } from "../servicios";

// Cada servicio pide SUS datos. Al entrar al panel no se exige ningún
// formulario: los datos se piden dentro de cada expediente, y solo los que ese
// servicio necesita (04/11/2026). Antes un único juego de datos generales
// (más los académicos) se avisaba en toda la portada.

const campo = (etiqueta, fn) => ({ etiqueta, fn });

const NOMBRE      = campo("Nombre completo", u => u?.nombre);
const PAIS        = campo("País de origen", u => u?.pais_origen);
const NACIMIENTO  = campo("Fecha de nacimiento", u => u?.datos_extra?.fecha_nacimiento);
const PASAPORTE   = campo("Número de pasaporte", u => u?.pasaporte);
const PASAP_VENC  = campo("Vencimiento del pasaporte", u => u?.datos_extra?.pasaporte_vencimiento);
const TELEFONO    = campo("Teléfono", u => u?.telefono);

// Su historial académico y su plan de estudios. Solo significan algo en los
// servicios de estudios: a quien viene por una modificatoria o por un visado
// no se le pregunta en qué universidad estudió.
const ACADEMICOS = [
  campo("Título universitario", u => u?.datos_extra?.carrera_titulo),
  campo("Universidad de origen", u => u?.datos_extra?.universidad_origen),
  campo("Año de inicio de estudios", u => u?.datos_extra?.inicio_estudios),
  campo("Año de fin de estudios", u => u?.datos_extra?.fin_estudios),
  campo("Inicio previsto en España", u => u?.datos_extra?.inicio_previsto),
  campo("Presupuesto máximo", u => u?.datos_extra?.presupuesto_hasta),
];

// El resto de la ficha. Para el paquete de máster el perfil entero es
// condición del servicio —lo pidió Carina el 04/09/2026—: con él se prepara
// el informe y la postulación, y sin teléfono no hay forma de avisarle.
const COMPLETO = [
  TELEFONO,
  campo("Ciudad de residencia", u => u?.datos_extra?.ciudad),
  campo("Nacionalidad", u => u?.datos_extra?.nacionalidad),
  campo("WhatsApp", u => u?.datos_extra?.whatsapp),
  campo("DNI o documento de identidad", u => u?.dni),
  campo("Emisión del DNI", u => u?.datos_extra?.dni_emision),
  campo("Vencimiento del DNI", u => u?.datos_extra?.dni_vencimiento),
  campo("Emisión del pasaporte", u => u?.datos_extra?.pasaporte_emision),
  campo("Área de la carrera", u => u?.datos_extra?.area_carrera),
  campo("Fecha del título", u => u?.datos_extra?.fecha_titulo),
];

const VIAJE = [NOMBRE, PAIS, NACIMIENTO, PASAPORTE, PASAP_VENC];

/**
 * Los datos del perfil que exige CADA servicio. Los trámites por pasos
 * (grado, FP, homologaciones, recursos) y el resto preguntan lo suyo en su
 * propio formulario del expediente: del perfil solo necesitan quién es.
 */
const REQUISITOS = {
  [SERVICIO.MASTER]:        [...VIAJE, ...ACADEMICOS, ...COMPLETO],
  [SERVICIO.DOCTORADO]:     [...VIAJE, ...ACADEMICOS],
  [SERVICIO.VISADO]:        [...VIAJE, TELEFONO],
  [SERVICIO.ESTANCIA]:      VIAJE,
  [SERVICIO.MODIFICATORIA]: VIAJE,
  [SERVICIO.PAC]:           VIAJE,
};
const BASICOS = [NOMBRE, PAIS];

const sinValor = (fn, user) => {
  const v = fn(user);
  return !v || !String(v).trim();
};

/**
 * Los datos del perfil que le faltan para ESE servicio, con su nombre para
 * decírselos. `tipo` es una clave de SERVICIO.
 */
export function camposQueFaltan(user, tipo) {
  if (!user) return [];
  const requisitos = REQUISITOS[tipo] || BASICOS;
  return requisitos.filter((c) => sinValor(c.fn, user)).map((c) => c.etiqueta);
}

/** Cuántos datos le faltan para ese servicio. */
export function datosQueFaltanDe(user, tipo) {
  return camposQueFaltan(user, tipo).length;
}
