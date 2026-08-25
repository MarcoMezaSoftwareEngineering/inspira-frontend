// src/config/calendario.js
// Calendario del máster rumbo a 2027, con las fechas reales que maneja el
// equipo. Cada etapa sabe en qué meses ocurre para poder resaltar la que
// corresponde al momento en que se visita la web.

export const CALENDARIO_MASTER = {
  titulo: "Rumbo a septiembre 2027",
  subtitulo:
    "Estas son las ventanas reales de un proceso de máster en España. Llegar tarde a una significa esperar un año entero.",
  etapas: [
    {
      id: "postulaciones",
      etiqueta: "Inicio de postulaciones",
      periodo: "Noviembre 2026 → abril 2027",
      // Meses en formato AAAA-MM que abarca la etapa.
      desde: "2026-11",
      hasta: "2027-04",
      icono: "documento",
      texto:
        "Se abren las primeras convocatorias. Es cuando hay más plazas libres y más becas disponibles.",
      consejo: "Prepara título, notas y apostillas antes de que abran.",
    },
    {
      id: "fase1",
      etiqueta: "Fase 1 · la normal",
      periodo: "Mayo → julio 2027",
      desde: "2027-05",
      hasta: "2027-07",
      icono: "birrete",
      texto:
        "La fase principal de admisión, donde postula la mayoría. Aquí se resuelve el grueso de las plazas.",
      consejo: "Postula en paralelo a varias universidades, no a una sola.",
    },
    {
      id: "ultima",
      etiqueta: "Última oportunidad",
      periodo: "Agosto → septiembre 2027",
      desde: "2027-08",
      hasta: "2027-09",
      icono: "reloj",
      texto:
        "Fases finales con las plazas que quedaron libres. Menos oferta y con el visado muy justo de tiempo.",
      consejo: "Si llegas aquí, el trámite migratorio va contrarreloj.",
      urgente: true,
    },
    {
      id: "visado",
      etiqueta: "Trámite del visado",
      periodo: "Mayo → septiembre 2027",
      desde: "2027-05",
      hasta: "2027-09",
      icono: "pasaporte",
      texto:
        "Con la carta de admisión en la mano se inicia la visa de estudios o la estancia por estudios.",
      consejo: "El consulado puede tardar entre 1 y 2 meses en resolver.",
      paralelo: true,
    },
  ],
};

/** Devuelve el id de la etapa que corresponde a hoy, o null si aún no empieza. */
export function etapaActual(hoy = new Date()) {
  const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const dentro = CALENDARIO_MASTER.etapas.filter(
    (e) => clave >= e.desde && clave <= e.hasta && !e.paralelo
  );
  return dentro.length ? dentro[0].id : null;
}

/** Etapa que viene a continuación, para orientar a quien llega antes de tiempo. */
export function proximaEtapa(hoy = new Date()) {
  const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  return CALENDARIO_MASTER.etapas.find((e) => clave < e.desde && !e.paralelo) || null;
}
