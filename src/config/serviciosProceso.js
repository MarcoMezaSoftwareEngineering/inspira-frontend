// src/config/serviciosProceso.js
// Etapas del proceso, específicas de cada servicio. Se muestran en la página
// del servicio (/servicios/<id>) — no en el home, porque el proceso de una
// visa no se parece al de una homologación.
// Los servicios sin entrada aquí usan PROCESO_GENERICO.

export const PROCESO_GENERICO = [
  {
    titulo: "Asesoría diagnóstica",
    texto:
      "Analizamos tu caso, verificamos requisitos y definimos si el trámite es viable y cuál es tu mejor vía.",
    icono: "balanza",
  },
  {
    titulo: "Propuesta a medida",
    texto:
      "Te enviamos el paquete con exactamente los servicios que necesitas y su costo, sin sorpresas.",
    icono: "documento",
  },
  {
    titulo: "Preparación del expediente",
    texto:
      "Reunimos, revisamos y ordenamos toda la documentación según lo que exige el organismo competente.",
    icono: "maletin",
  },
  {
    titulo: "Presentación y seguimiento",
    texto:
      "Presentamos el expediente y hacemos seguimiento, incluidas subsanaciones, hasta la resolución.",
    icono: "escudo",
  },
];

export const PROCESOS = {
  "visa-estudios": [
    { titulo: "Asesoría diagnóstica", texto: "Revisamos tu carta de admisión, tu consulado y tus plazos. Definimos si te conviene visado o estancia por estudios.", icono: "balanza" },
    { titulo: "Estrategia económica", texto: "Calculamos y preparamos cómo acreditar tu solvencia según el IPREM y los criterios de tu consulado.", icono: "euro" },
    { titulo: "Documentación y seguro", texto: "Antecedentes penales, certificado médico, apostillas y seguro médico internacional con cobertura válida.", icono: "documento" },
    { titulo: "Formularios y modelos", texto: "Completamos los formularios oficiales y te entregamos los modelos listos, sin errores.", icono: "maletin" },
    { titulo: "Cita consular", texto: "Agendamos tu cita, verificamos requisitos previos y te indicamos exactamente qué llevar.", icono: "calendario" },
    { titulo: "Seguimiento hasta la resolución", texto: "Acompañamiento hasta tu cita y resolución de cualquier observación o subsanación.", icono: "escudo" },
  ],
  "estancia-estudios": [
    { titulo: "Diagnóstico jurídico", texto: "Verificamos que tu ingreso como turista y tus plazos permiten solicitar la estancia sin riesgos.", icono: "balanza" },
    { titulo: "Revisión documental integral", texto: "Comprobamos cada documento contra lo que exige Extranjería antes de preparar nada.", icono: "documento" },
    { titulo: "Preparación del expediente", texto: "Organizamos el expediente completo, con los modelos oficiales y las declaraciones necesarias.", icono: "maletin" },
    { titulo: "Presentación vía MERCURIO", texto: "Presentación telemática ante Extranjería con firma digital del abogado. Sin citas ni colas.", icono: "laptop" },
    { titulo: "Requerimientos y subsanaciones", texto: "Si Extranjería pide algo más, lo resolvemos nosotros dentro del plazo.", icono: "escudo" },
    { titulo: "Resolución y siguientes pasos", texto: "Al resolverse, te guiamos con la TIE, el empadronamiento y el seguro médico.", icono: "huella" },
  ],
  "nomada-digital": [
    { titulo: "Auditoría de viabilidad", texto: "Antes de presentar nada revisamos ingresos, antigüedad, titulación y la empresa contratante.", icono: "balanza" },
    { titulo: "Blindaje de la relación laboral", texto: "Redactamos y revisamos los certificados y contratos que acreditan tu vínculo con la empresa extranjera.", icono: "documento" },
    { titulo: "Expediente económico", texto: "Acreditación de ingresos por encima del umbral exigido, con la documentación que la UGE acepta.", icono: "euro" },
    { titulo: "Presentación telemática", texto: "Presentamos ante la Unidad de Grandes Empresas, con firma digital del abogado.", icono: "laptop" },
    { titulo: "Familia y resolución", texto: "Tramitamos la autorización de cónyuge e hijos y seguimos el expediente hasta la resolución.", icono: "usuarios" },
  ],
  "visado-pac": [
    { titulo: "Análisis del puesto", texto: "Verificamos que el puesto y la empresa cumplen los criterios de alta cualificación.", icono: "maletin" },
    { titulo: "Acreditación del perfil", texto: "Comprobamos que tu titulación o experiencia acredita la cualificación exigida.", icono: "birrete" },
    { titulo: "Contrato y umbral salarial", texto: "Revisamos el contrato y el salario frente a los umbrales legales vigentes.", icono: "euro" },
    { titulo: "Presentación ante la UGE", texto: "Expediente telemático ante la Unidad de Grandes Empresas, con plazos de resolución cortos.", icono: "laptop" },
    { titulo: "Familia y resolución", texto: "Autorización conjunta para cónyuge e hijos y seguimiento hasta la resolución.", icono: "usuarios" },
  ],
  "recurso-reposicion": [
    { titulo: "Lectura de la denegación", texto: "Analizamos la resolución para identificar la causa real y si el recurso tiene recorrido.", icono: "documento" },
    { titulo: "Dictamen de viabilidad", texto: "Te decimos con honestidad si asumimos el caso. Solo tomamos expedientes viables.", icono: "balanza" },
    { titulo: "Elaboración del recurso", texto: "Redactamos el escrito de reposición argumentando sobre la causa concreta de la denegación.", icono: "libro" },
    { titulo: "Revisión por abogados", texto: "Doble revisión por abogados en España y Perú antes de presentar.", icono: "escudo" },
    { titulo: "Presentación y seguimiento", texto: "Presentamos ante el Consulado y seguimos el expediente hasta la resolución.", icono: "calendario" },
    { titulo: "Plan B si no prospera", texto: "Si la apelación no funciona, reconducimos tu caso hacia una estancia por estudios.", icono: "brujula" },
  ],
  nacionalidad: [
    { titulo: "Verificación del cómputo", texto: "Comprobamos qué años de tu permanencia cuentan como residencia legal (la estancia por estudios no computa).", icono: "reloj" },
    { titulo: "Prueba CCSE", texto: "Te inscribimos en la convocatoria del Instituto Cervantes y te orientamos con el temario oficial.", icono: "libro" },
    { titulo: "Expediente documental", texto: "Antecedentes penales apostillados, empadronamiento histórico, TIE y certificados de residencia.", icono: "documento" },
    { titulo: "Presentación telemática", texto: "Solicitud ante el Ministerio de Justicia con firma digital del abogado.", icono: "laptop" },
    { titulo: "Jura e inscripción", texto: "Al concederse, te acompañamos en la jura y en la inscripción en el Registro Civil.", icono: "bandera" },
  ],
  "homologacion-bachillerato": [
    { titulo: "Revisión documental", texto: "Comprobamos que tu certificado de estudios y su legalización cumplen lo exigido.", icono: "documento" },
    { titulo: "Envío internacional", texto: "Enviamos tus documentos originales a España para su tramitación.", icono: "avion" },
    { titulo: "Alta en el Ministerio", texto: "Creamos tu usuario en la plataforma del Ministerio de Educación español.", icono: "casa" },
    { titulo: "Presentación y volante", texto: "Presentamos la solicitud y obtenemos el volante que ya te permite matricularte en FP.", icono: "laptop" },
    { titulo: "Tasa y validación", texto: "Gestionamos la tasa oficial y el apersonamiento para validar la autenticidad de los documentos.", icono: "euro" },
  ],
  "homologacion-titulo": [
    { titulo: "Elección de la vía", texto: "Determinamos si te corresponde homologación (profesión regulada) o equivalencia académica.", icono: "brujula" },
    { titulo: "Expediente académico", texto: "Reunimos título, notas, plan de estudios y carga horaria, apostillados y traducidos si procede.", icono: "birrete" },
    { titulo: "Preparación completa", texto: "Revisamos cada requisito antes de presentar: los defectos documentales son la causa nº1 de retrasos.", icono: "documento" },
    { titulo: "Presentación y seguimiento", texto: "Presentamos el expediente ante el Ministerio y respondemos los requerimientos que lleguen.", icono: "laptop" },
    { titulo: "Resolución final", texto: "Acompañamiento hasta la credencial de homologación o el certificado de equivalencia.", icono: "escudo" },
  ],
  "formacion-profesional": [
    { titulo: "Homologación escolar", texto: "El paso que más tarda, y por eso el primero: homologamos tu secundaria al Bachillerato español.", icono: "documento" },
    { titulo: "Búsqueda de centros oficiales", texto: "Evaluamos precios, notas de corte y que el centro sea apto para el visado de estudios.", icono: "mapa" },
    { titulo: "Guía y asesoría educativa", texto: "Kit de bienvenida, modelos y tutoriales para preparar una postulación competitiva.", icono: "libro" },
    { titulo: "Postulación", texto: "Presentamos tus solicitudes y hacemos seguimiento hasta obtener la vacante.", icono: "birrete" },
    { titulo: "Matrícula", texto: "Te asistimos en la aceptación de plaza, pagos y trámites administrativos del centro.", icono: "escudo" },
    { titulo: "Visa de estudios", texto: "Con la matrícula lista, arrancamos tu trámite migratorio.", icono: "pasaporte" },
  ],
  "grado-espana": [
    { titulo: "Homologación del bachillerato", texto: "Requisito obligatorio y el trámite más lento: se inicia lo antes posible.", icono: "documento" },
    { titulo: "Búsqueda de universidades", texto: "Evaluamos precios, notas de corte, calidad y ubicación para armar tu shortlist.", icono: "mapa" },
    { titulo: "Pruebas PCE / EBAU (UNED)", texto: "Te inscribimos en las pruebas de acceso y te orientamos en la preparación.", icono: "libro" },
    { titulo: "Preinscripción", texto: "Gestionamos tu preinscripción en las universidades seleccionadas.", icono: "birrete" },
    { titulo: "Matrícula y visado", texto: "Formalizamos tu matrícula y comenzamos el trámite de visa de estudios.", icono: "pasaporte" },
  ],
  "becas-espana": [
    { titulo: "Análisis de tu perfil", texto: "Estudiamos tu trayectoria para identificar en qué convocatorias eres competitivo.", icono: "brujula" },
    { titulo: "Mapa de convocatorias", texto: "Priorizamos becas compatibles, con foco en las exclusivas para extranjeros y en las primeras fases.", icono: "mapa" },
    { titulo: "Perfil competitivo", texto: "Optimizamos CV europeo, carta de motivación y cartas de recomendación.", icono: "documento" },
    { titulo: "Postulación y plazos", texto: "Controlamos requisitos y fechas de cada convocatoria para que no se escape ninguna.", icono: "calendario" },
    { titulo: "Seguimiento", texto: "Acompañamiento durante toda la postulación y en las fases de resolución.", icono: "estrella" },
  ],
  tie: [
    { titulo: "Revisión de tu resolución", texto: "Verificamos tu resolución favorable y qué trámite exacto te corresponde.", icono: "documento" },
    { titulo: "Selección de provincia", texto: "Elegimos la oficina y el tipo de cita correctos: es donde más gente se equivoca.", icono: "mapa" },
    { titulo: "Reserva de cita", texto: "Conseguimos la cita de toma de huellas, que suele tener disponibilidad muy limitada.", icono: "calendario" },
    { titulo: "Formularios y tasa", texto: "Completamos el EX-17 y la tasa 790 código 012.", icono: "euro" },
    { titulo: "Guía para el día de la cita", texto: "Checklist de qué llevar y cómo presentarte, para que no vuelvas dos veces.", icono: "escudo" },
  ],
};

export const procesoDe = (id) => PROCESOS[id] || PROCESO_GENERICO;
