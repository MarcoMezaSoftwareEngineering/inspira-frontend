// Las horas, en las dos orillas.
//
// Los asesorados están en el Perú y los plazos y las oficinas en España: una
// hora sola siempre es la equivocada para alguien. Donde se enseña una hora
// se enseñan las dos, con su nombre delante, para que nadie tenga que
// convertir de cabeza. Lo pidió Carina el 04/09/2026.
//
// Perú no cambia de hora; España sí (CET/CEST). Lo resuelve Intl con la zona
// horaria, no una resta fija.

const ZONAS = [
  { etiqueta: "Perú", zona: "America/Lima" },
  { etiqueta: "España", zona: "Europe/Madrid" },
];

function valida(iso) {
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}

const hora = (d, zona) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

const dia = (d, zona) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: zona, day: "numeric", month: "short", year: "numeric" }).format(d);

/** «09:12 Perú · 16:12 España» */
export function horaDoble(iso) {
  const d = valida(iso);
  if (!d) return "";
  return ZONAS.map((z) => `${hora(d, z.zona)} ${z.etiqueta}`).join(" · ");
}

/**
 * «27 ago 2026, 09:12 Perú · 16:12 España».
 *
 * La fecha va en hora de Perú, que es la del asesorado; si en España ya es
 * otro día —pasa a última hora de la tarde peruana— se dice.
 */
export function fechaHoraDoble(iso) {
  const d = valida(iso);
  if (!d) return "";
  const diaPeru = dia(d, ZONAS[0].zona);
  const diaEspana = dia(d, ZONAS[1].zona);
  const horas = horaDoble(iso);
  return diaPeru === diaEspana
    ? `${diaPeru}, ${horas}`
    : `${diaPeru}, ${hora(d, ZONAS[0].zona)} Perú · ${diaEspana}, ${hora(d, ZONAS[1].zona)} España`;
}

/** Solo la fecha, en hora de Perú: «27 ago 2026». */
export function fechaCorta(iso) {
  const d = valida(iso);
  return d ? dia(d, ZONAS[0].zona) : "";
}
