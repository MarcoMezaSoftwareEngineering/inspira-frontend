// El recorrido de cada servicio, paso a paso, tal como se trabaja.
//
// Es la guía del asesor: quién mueve en cada punto, qué tiene que hacer, cómo
// se sabe que está hecho y cuánto puede tardar. `etapas` son las etapas de
// Procesos que caen en ese paso: con ellas la pantalla cuenta cuántos clientes
// hay ahora mismo en cada uno.
//
// actor: "asesor" · "asesorado" · "tercero" (universidad, consulado,
// extranjería) · "ambos".

export const ACTORES = {
  asesor:    { t: "Asesor",     color: "#1A3557", suave: "#EEF2F8" },
  asesorado: { t: "Asesorado",  color: "#B45309", suave: "#FEF3E7" },
  tercero:   { t: "Organismo",  color: "#7D3C98", suave: "#F5EEF8" },
  ambos:     { t: "Asesor y asesorado", color: "#1D6A4A", suave: "#E8F5EE" },
};

export const FLUJOS = [
  {
    servicio: "master",
    titulo: "Postulación a Máster",
    resumen: "Seis pasos, los mismos que ve el asesorado en su panel.",
    pasos: [
      {
        titulo: "Alta y bienvenida",
        actor: "asesor",
        hacer: [
          "Abrir la ficha en las primeras 48 h (te llega un correo al asignarte)",
          "Revisar paquete y comunidades contratadas",
          "Escribir al asesorado para presentarte",
        ],
        hecho: "Abriste el proceso: deja de salir «sin abrir».",
        plazo: "48 horas",
        etapas: ["Nuevo"],
      },
      {
        titulo: "1 · Documentos",
        actor: "ambos",
        hacer: [
          "Asesorado: subir cada documento de su lista",
          "Asesor: aprobar lo correcto o devolver con el motivo",
        ],
        hecho: "Todos los documentos de la lista están aprobados.",
        plazo: "Revisar en 2 días desde que sube",
        etapas: ["Documentación"],
      },
      {
        titulo: "2 · Formulario académico",
        actor: "asesorado",
        hacer: ["Completar las secciones: estudios, notas, experiencia, preferencias"],
        hecho: "El formulario está completo y enviado.",
        plazo: "Recordar a los 5 días sin avance",
        etapas: [],
      },
      {
        titulo: "3 · Informe de másteres",
        actor: "asesor",
        hacer: [
          "Generar el informe con el motor",
          "Curar la lista y mandarlo a revisión",
          "Publicarlo al asesorado",
        ],
        hecho: "Informe publicado en el panel del asesorado.",
        plazo: "5 días desde el formulario",
        etapas: ["Búsqueda"],
      },
      {
        titulo: "4 · Elección",
        actor: "ambos",
        hacer: [
          "Asesorado: elegir sus másteres del informe",
          "Asesor: responder Sí o No a cada uno",
        ],
        hecho: "Cada máster elegido tiene respuesta del asesor.",
        plazo: "Responder en 2 días",
        etapas: [],
      },
      {
        titulo: "5 · Postulaciones",
        actor: "asesor",
        hacer: [
          "Postular en cada portal cuando abre el plazo (Andalucía: una vez por Distrito Único)",
          "Subir el justificante de cada postulación",
          "Revisar los portales y registrar requerimientos",
        ],
        hecho: "Postulado con justificante subido. Sin justificante no cuenta.",
        plazo: "Antes del cierre de cada portal · revisar portales cada 7 días",
        etapas: ["Postulado", "Esperando resultado", "Lista de espera"],
        donde: "Procesos › Postulación a Máster (filtros «Abiertos sin postular» y «Sin justificante»)",
      },
      {
        titulo: "6 · Cierre",
        actor: "ambos",
        hacer: [
          "Registrar la admisión y la carta",
          "Acompañar la reserva de plaza y la matrícula",
          "Pasar a visado si lo contrató",
        ],
        hecho: "Matriculado o proceso finalizado con resultado.",
        plazo: "Según el plazo de reserva de la universidad",
        etapas: ["Admitido", "Matrícula", "No admitido"],
      },
    ],
  },
  {
    servicio: "ee",
    titulo: "Estancia por estudios",
    resumen: "Se presenta en extranjería desde España. El plazo de presentar manda sobre todo lo demás.",
    pasos: [
      {
        titulo: "Recogida de datos",
        actor: "asesorado",
        hacer: [
          "Completar sus datos del EX-00",
          "Indicar fecha de llegada a España e inicio de clases",
        ],
        hecho: "Datos completos: el sistema calcula la fecha para presentar.",
        plazo: "Sin fechas no hay plazo: recordar en 3 días",
        etapas: ["Nuevo"],
        clave: ["DATOS"],
      },
      {
        titulo: "Documentos",
        actor: "ambos",
        hacer: [
          "Asesorado: subir los documentos de la guía",
          "Asesor: aprobar o devolver con observaciones",
        ],
        hecho: "Todos los documentos aprobados.",
        plazo: "Revisar en 2 días · todo listo antes de la fecha para presentar",
        etapas: ["Documentación"],
        clave: ["DOCUMENTOS", "REVISION"],
      },
      {
        titulo: "Presentación",
        actor: "asesor",
        hacer: [
          "Preparar la carpeta y avisar a la abogada",
          "Presentar en sede y guardar el justificante",
          "Anotar nº de expediente",
        ],
        hecho: "Estado «Presentado» con número de expediente.",
        plazo: "Antes de la fecha recomendada (sale en Procesos)",
        etapas: ["Presentado"],
        clave: ["PRESENTADO"],
      },
      {
        titulo: "Requerimiento",
        actor: "asesor",
        hacer: [
          "Registrar el requerimiento con su plazo",
          "Pedir al asesorado lo que falte",
          "Responder antes del plazo",
        ],
        hecho: "Requerimiento respondido.",
        plazo: "El que marque extranjería (suele ser 10 días)",
        etapas: ["En trámite"],
        clave: ["REQUERIDO"],
      },
      {
        titulo: "Resolución",
        actor: "tercero",
        hacer: [
          "Vigilar la notificación",
          "Avisar al asesorado del resultado",
          "Favorable: guiar empadronamiento y TIE",
        ],
        hecho: "Resolución registrada y asesorado avisado.",
        plazo: "Extranjería suele tardar 1 a 3 meses",
        etapas: ["Resuelto"],
        clave: ["FAVORABLE", "DESFAVORABLE"],
      },
    ],
  },
  {
    servicio: "visa",
    titulo: "Visado de estudios",
    resumen: "Se tramita desde Perú. La cita en BLS marca el ritmo.",
    pasos: [
      {
        titulo: "Alta y bienvenida",
        actor: "asesor",
        hacer: ["Abrir la ficha en 48 h", "Explicar requisitos y solvencia (6 meses, origen lícito)"],
        hecho: "Proceso abierto y asesorado informado.",
        plazo: "48 horas",
        etapas: ["Nuevo"],
      },
      {
        titulo: "Documentos",
        actor: "ambos",
        hacer: ["Asesorado: subir documentos", "Asesor: aprobar o devolver"],
        hecho: "Documentos aprobados.",
        plazo: "Revisar en 2 días",
        etapas: ["Documentación"],
      },
      {
        titulo: "Preparación y solvencia",
        actor: "ambos",
        hacer: ["Definir el tipo de solvencia", "Reunir extractos y cartas", "Pedir la cita en BLS"],
        hecho: "Cita pedida con fecha.",
        plazo: "Pedir cita en cuanto la carpeta esté lista",
        etapas: ["Preparación"],
      },
      {
        titulo: "Cita en BLS",
        actor: "asesorado",
        hacer: ["Asesor: repasar la carpeta 3 días antes", "Asesorado: acudir a la cita"],
        hecho: "Cita marcada como completada.",
        plazo: "Fecha de la cita",
        etapas: ["Cita programada", "Cita completada"],
      },
      {
        titulo: "Trámite y requerimientos",
        actor: "tercero",
        hacer: ["Seguir el estado", "Si hay requerimiento: responder antes del plazo"],
        hecho: "Resolución del consulado.",
        plazo: "Requerimiento: el que indique el consulado",
        etapas: ["En trámite", "Requerimiento"],
      },
      {
        titulo: "Resultado",
        actor: "asesor",
        hacer: ["Registrar resultado", "Aprobada: preparar el viaje", "Denegada: explicar recurso"],
        hecho: "Proceso finalizado con resultado.",
        plazo: "—",
        etapas: ["Visa aprobada", "Denegada"],
      },
    ],
  },
];
