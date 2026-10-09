// src/config/servicios.js
// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD del contenido largo de cada servicio de Inspira
// Legal: lo que pinta /servicios/<id> (ServicioDetalle) además de la ficha.
//
// Desde el 09/10/2026 el catálogo está partido en dos para que la portada no
// descargue lo que no pinta:
//   · config/serviciosIndice.js → nombres, resúmenes, enlaces y la ficha
//     (título y gancho). Lo leen el header, /servicios, la portada y App.
//   · este archivo → el `detalle` completo de cada servicio. Solo lo importa
//     ServicioDetalle (y scripts/sitemap.mjs, que necesita saber cuáles
//     tienen página propia).
// Exporta lo mismo que antes (CATEGORIAS, TODOS_SERVICIOS, getServicio…),
// con `detalle` dentro de cada servicio que tiene página.
//
// El contenido de cada `detalle` proviene del material comercial de la
// empresa (dosieres de servicios 2025/2026).
// ─────────────────────────────────────────────────────────────────────────────

import { CATEGORIAS as CATEGORIAS_INDICE } from "./serviciosIndice.js";

export { PRECIO_ASESORIA, DIFERENCIALES, hrefServicio } from "./serviciosIndice.js";

// Lo que no cabe en la ficha, por `id` de servicio. El título y el gancho
// están en la ficha del índice y se suman al montar el detalle.
const DETALLES = {
  "visa-estudios": {
    intro:
      "La vía clásica para estudiar en España: presentas tu solicitud ante el consulado español de tu país con la carta de admisión de tu centro de estudios. Viajas ya con el visado en el pasaporte y el estatus de estudiante resuelto.",
    bloques: [
      {
        titulo: "Qué incluye nuestro acompañamiento",
        items: [
          "Diagnóstico legal y estrategia personalizada para tu cita.",
          "Estrategia económica sólida: te ayudamos a demostrar tu solvencia según los requisitos del consulado.",
          "Asesoría en seguro médico internacional con la cobertura válida y obligatoria.",
          "Asesoría en formularios para completarlos correctamente, sin errores.",
          "Revisión y preparación de TODOS los documentos antes de tu presentación.",
          "Gestión de la cita consular: la agendamos, verificamos requisitos previos y te indicamos qué llevar.",
          "Guías y modelos oficiales con el paso a paso completo.",
          "Seguimiento hasta tu cita y resolución de cualquier observación.",
        ],
      },
    ],
    dirigidoA: [
      "Personas con carta de admisión de un centro en España.",
      "Quienes necesitan presentarse a cita consular.",
      "Casos con dudas sobre documentación o solvencia económica.",
    ],
    faq: [
      {
        q: "¿Cuánto tarda el consulado en resolver?",
        a: "Normalmente entre 1 y 2 meses, aunque varía según el consulado y la época del año. Por eso conviene iniciar el trámite con antelación: en la asesoría revisamos tu calendario académico y definimos cuándo presentar.",
      },
      {
        q: "¿Puedo trabajar con la visa de estudios?",
        a: "Sí. El permiso de estudios habilita a trabajar hasta 30 horas semanales, compatibilizando tu formación con una actividad laboral.",
      },
      {
        q: "¿Y si me deniegan el visado?",
        a: "Analizamos la resolución y evaluamos la viabilidad de un recurso de reposición. Si la apelación no es la mejor vía, te orientamos para continuar con una estancia por estudios.",
      },
    ],
  },
  "estancia-estudios": {
    intro:
      "Si entras a España como turista y quieres regularizar tu situación para estudiar, esta es tu vía: presentamos tu solicitud directamente ante Extranjería con firma digital del abogado. Todo el proceso es 100% online, sin citas, sin colas y sin desplazamientos.",
    bloques: [
      {
        titulo: "Nos encargamos de todo",
        items: [
          "Diagnóstico jurídico personalizado de tu caso.",
          "Revisión integral de tu documentación.",
          "Preparación y organización completa del expediente.",
          "Presentación telemática mediante MERCURIO con firma digital de abogado.",
          "Requerimientos y subsanaciones durante todo el procedimiento.",
          "Seguimiento constante de tu expediente.",
          "Acompañamiento hasta la resolución final.",
          "Modelos oficiales y guía para abrir cuenta bancaria, empadronarte y contratar el seguro médico válido.",
        ],
      },
      {
        titulo: "Incluye permiso de trabajo",
        items: [
          "Hasta 30 horas semanales, compatible con tus estudios y con una actividad laboral.",
        ],
      },
    ],
    dirigidoA: [
      "Personas con carta de admisión oficial reciente que ingresarán como turistas.",
      "Quienes no lograron el visado en su consulado y buscan una vía legal alternativa.",
      "Estudiantes que necesitan un proceso claro, rápido y sin trámites presenciales.",
    ],
    noIncluye: [
      "Tasa administrativa de 11 €, que se paga directamente a Extranjería.",
      "Recurso de reposición.",
      "Recursos contencioso-administrativos.",
    ],
    faq: [
      {
        q: "¿Necesito estar en España para tramitarla?",
        a: "Sí. La estancia por estudios se solicita estando en España en situación regular, dentro del plazo de tu estancia como turista. En la asesoría planificamos las fechas exactas de tu viaje y presentación.",
      },
      {
        q: "¿De verdad es todo online?",
        a: "Sí. Presentamos el expediente por vía telemática ante Extranjería con la firma digital del abogado a través de MERCURIO. No necesitas pedir cita ni acudir a ninguna oficina para presentar.",
      },
      {
        q: "¿Garantizan la aprobación?",
        a: "No. La resolución final depende siempre de Extranjería. Lo que sí garantizamos es un expediente completo, bien fundamentado y presentado en plazo — y solo asumimos casos que consideramos viables.",
      },
    ],
  },
  "visado-pac": {
    intro:
      "El permiso de Profesional Altamente Cualificado está pensado para quienes cuentan con una oferta de empleo cualificada en una empresa española. Es uno de los procedimientos más ágiles de la Ley de Startups: se resuelve en plazos cortos y permite traer a tu familia desde el inicio.",
    bloques: [
      {
        titulo: "Qué revisamos y gestionamos",
        items: [
          "Análisis de viabilidad del puesto y de la empresa contratante.",
          "Verificación de que la titulación o experiencia acredita la alta cualificación.",
          "Revisión del contrato y del umbral salarial exigido.",
          "Preparación y presentación telemática del expediente ante la UGE.",
          "Gestión de la autorización para familiares (cónyuge e hijos).",
          "Seguimiento y subsanaciones hasta la resolución.",
        ],
      },
    ],
    dirigidoA: [
      "Profesionales con oferta de trabajo cualificada en una empresa española.",
      "Titulados universitarios o con experiencia profesional acreditable equivalente.",
      "Empresas españolas que quieren incorporar talento latinoamericano.",
    ],
    faq: [
      {
        q: "¿Por qué se considera un proceso rápido?",
        a: "Se tramita ante la Unidad de Grandes Empresas y Colectivos Estratégicos, con plazos de resolución muy cortos y silencio administrativo positivo. Es de las vías más ágiles del sistema español.",
      },
      {
        q: "¿Puedo traer a mi familia?",
        a: "Sí. Una de las grandes ventajas de esta vía es que cónyuge e hijos pueden solicitar su autorización de forma conjunta con la tuya.",
      },
    ],
  },
  "nomada-digital": {
    intro:
      "La Ley de Startups permite a teletrabajadores de empresas extranjeras residir legalmente en España. Es un proceso rápido, pero con requisitos económicos y laborales exigentes: la mayoría de denegatorias que vemos vienen de documentación laboral mal armada, no de incumplir requisitos.",
    bloques: [
      {
        titulo: "Requisitos que verificamos contigo",
        items: [
          "Relación laboral o mercantil con empresa extranjera (o clientes mayoritariamente fuera de España).",
          "Antigüedad mínima de 3 meses con la empresa, y empresa con al menos 1 año de actividad.",
          "Ingresos equivalentes a, como mínimo, el 200 % del salario mínimo español.",
          "Titulación universitaria o 3 años de experiencia profesional.",
          "Seguro médico con cobertura completa y antecedentes penales sin cargas.",
        ],
      },
      {
        titulo: "Qué hacemos por ti",
        items: [
          "Auditoría previa de viabilidad antes de presentar nada.",
          "Redacción y revisión de los certificados y contratos que acreditan la relación laboral.",
          "Presentación telemática del expediente y seguimiento hasta la resolución.",
          "Autorización para cónyuge e hijos.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Cuánto dura la residencia?",
        a: "La autorización inicial puede llegar hasta 3 años y es renovable. Además computa para solicitar la nacionalidad española, que para latinoamericanos requiere solo 2 años de residencia legal.",
      },
      {
        q: "¿Sirve si soy freelance?",
        a: "Sí, siempre que la mayor parte de tus clientes estén fuera de España y puedas acreditar la relación y los ingresos. En la asesoría revisamos tu caso concreto antes de asumirlo.",
      },
    ],
  },
  "no-lucrativa": {
    intro:
      "Pensada para quienes cuentan con rentas, ahorros o pensiones suficientes para vivir en España sin trabajar. Es una vía consolidada y predecible, siempre que la acreditación económica esté impecable.",
    bloques: [
      {
        titulo: "Qué gestionamos",
        items: [
          "Cálculo y acreditación de los medios económicos exigidos (IPREM) para ti y tu familia.",
          "Revisión de extractos, certificados bancarios y documentación de rentas.",
          "Seguro médico privado con cobertura completa en España, sin copagos.",
          "Certificado médico y antecedentes penales apostillados.",
          "Preparación del expediente y presentación ante el consulado.",
          "Seguimiento y subsanaciones hasta la resolución.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Puedo trabajar con la no lucrativa?",
        a: "No con un empleo en España. Sí puedes mantener rentas pasivas. Pasado el primer año existe la posibilidad de modificar tu situación hacia una autorización que permita trabajar — y ese cambio también lo gestionamos.",
      },
    ],
  },
  "residencia-doctorado": {
    intro:
      "Es el cambio más relevante del año para investigadores latinoamericanos: la vía del doctorado dejó de ser una simple estancia por estudios y pasó a ser residencia. La diferencia es enorme, porque la estancia por estudios no computa para la nacionalidad y la residencia sí.",
    bloques: [
      {
        titulo: "Por qué es tan importante",
        items: [
          "El tiempo de tu doctorado computa como residencia legal en España.",
          "Ese cómputo cuenta para la nacionalidad española por residencia.",
          "Para latinoamericanos bastan 2 años de residencia legal, no 10.",
          "Mejores condiciones de permanencia y acceso al mercado laboral.",
          "Posibilidad de autorización para cónyuge e hijos.",
        ],
      },
      {
        titulo: "Qué gestionamos",
        items: [
          "Análisis de tu carta de admisión y del convenio con la universidad o centro investigador.",
          "Determinación de la vía correcta según tu financiación y tu programa.",
          "Preparación y presentación telemática del expediente.",
          "Autorización para familiares.",
          "Seguimiento hasta la resolución final.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Puedo pedir la nacionalidad al terminar el doctorado?",
        a: "Si tu programa dura tres o cuatro años, el propio doctorado puede cubrir de sobra los 2 años de residencia legal que se exigen a los iberoamericanos. Cumpliendo el resto de requisitos (CCSE, antecedentes, empadronamiento), puedes estar en condiciones de solicitarla al terminar.",
      },
      {
        q: "¿Qué pasa si ya tramité una estancia por estudios?",
        a: "Presentar la vía equivocada significa perder años de cómputo, y eso después no se recupera. Si ya estás en estancia, revisamos si procede una modificación — cuanto antes, mejor.",
      },
    ],
  },
  "recurso-reposicion": {
    intro:
      "Analizamos tu caso y te ayudamos a elegir la mejor estrategia para revertir la denegación. Solo asumimos casos viables: si tras el análisis vemos que el recurso no prospera, te lo decimos y buscamos la alternativa que sí funciona.",
    bloques: [
      {
        titulo: "Qué incluye nuestra asesoría",
        items: [
          "Análisis jurídico de la resolución de denegación.",
          "Elaboración del escrito de recurso de reposición.",
          "Revisión por abogados en España y Perú.",
          "Presentación del recurso ante el Consulado de España.",
          "Seguimiento del expediente hasta la resolución.",
        ],
      },
      {
        titulo: "¿Y si la apelación no prospera?",
        items: [
          "Te orientamos para continuar con una Estancia por Estudios, aplicando la estrategia más conveniente según tu caso.",
          "Las condiciones económicas de la continuidad se explican con transparencia desde el inicio.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Cuánto tiempo tengo para recurrir?",
        a: "Los plazos para recurrir son cortos y perentorios: se cuentan desde la notificación de la denegación. Por eso conviene agendar la asesoría diagnóstica en cuanto recibas la resolución.",
      },
      {
        q: "¿Qué necesito para la primera asesoría?",
        a: "La resolución de denegación completa y el expediente que presentaste. Con eso podemos darte un diagnóstico real de viabilidad en la misma sesión.",
      },
    ],
  },
  "modificatoria-residente": {
    intro:
      "La estancia por estudios no computa para la nacionalidad. La modificación a residencia sí: por eso este trámite es la pieza clave para quienes terminan su máster o su FP y quieren quedarse en España a largo plazo.",
    bloques: [
      {
        titulo: "Qué gestionamos",
        items: [
          "Análisis del momento óptimo para presentar la modificación.",
          "Revisión de la oferta de trabajo o del proyecto de cuenta propia.",
          "Verificación de que tus estudios y tu permanencia cumplen los requisitos.",
          "Preparación y presentación telemática del expediente.",
          "Seguimiento hasta la resolución y orientación para la TIE posterior.",
        ],
      },
    ],
  },
  "nacionalidad": {
    intro:
      "Los nacionales de países iberoamericanos tienen la mayor ventaja del sistema español: pueden solicitar la nacionalidad con 2 años de residencia legal continuada, frente a los 10 años de la regla general.",
    bloques: [
      {
        titulo: "Qué incluye el servicio",
        items: [
          "Verificación de que tu residencia computa (la estancia por estudios NO computa).",
          "Preparación del expediente: antecedentes penales apostillados, empadronamiento, TIE.",
          "Orientación e inscripción para la prueba CCSE del Instituto Cervantes.",
          "Presentación telemática ante el Ministerio de Justicia.",
          "Seguimiento hasta la concesión, jura y inscripción en el Registro Civil.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Necesito el examen DELE?",
        a: "No si el español es tu lengua materna. Los latinoamericanos hispanohablantes están exentos del DELE, pero sí deben aprobar la prueba CCSE de conocimientos constitucionales y socioculturales.",
      },
    ],
  },
  "arraigos": {
    intro:
      "Existen distintos tipos de arraigo y elegir el correcto lo cambia todo: cada uno exige un tiempo de permanencia, una prueba distinta y abre puertas diferentes. En la asesoría determinamos cuál encaja con tu situación real.",
    bloques: [
      {
        titulo: "Modalidades que gestionamos",
        items: [
          "Arraigo social: permanencia acreditada, vínculos familiares o informe de integración y medios de vida.",
          "Arraigo laboral: acreditación de relación laboral previa en España.",
          "Arraigo familiar: vínculo con ciudadano español o residente.",
          "Arraigo para la formación: regularización a través de una formación reglada.",
        ],
      },
    ],
  },
  "permiso-retorno": {
    intro:
      "Si tienes que salir de España mientras tu TIE está en trámite o caducada en renovación, el permiso de retorno es lo que te garantiza poder volver a entrar sin problemas en frontera.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Verificación de que tu situación permite solicitarlo.",
          "Gestión de la cita y preparación de la documentación.",
          "Llenado de formularios y tasa correspondiente.",
          "Indicaciones claras de plazos de salida y regreso.",
        ],
      },
    ],
  },
  "prorroga-estancia": {
    intro:
      "La renovación tiene ventanas concretas y requisitos de aprovechamiento académico. Presentarla tarde o incompleta es la causa más común de problemas evitables.",
    bloques: [
      {
        titulo: "Qué revisamos",
        items: [
          "Matrícula vigente y acreditación de aprovechamiento del curso anterior.",
          "Medios económicos y seguro médico actualizados.",
          "Cálculo del plazo exacto de presentación.",
          "Presentación telemática y seguimiento hasta la resolución.",
        ],
      },
    ],
  },
  "modificatorias": {
    intro:
      "Pasar de una autorización a otra —de estudios a trabajo, de no lucrativa a lucrativa, de un arraigo a una residencia estable— exige timing y una estrategia documental precisa. Eso es exactamente lo que diseñamos contigo.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Diagnóstico de la vía de destino más conveniente para tu perfil.",
          "Cálculo del momento óptimo de presentación.",
          "Preparación integral del expediente y presentación telemática.",
          "Seguimiento, requerimientos y subsanaciones.",
        ],
      },
    ],
  },
  "tie": {
    intro:
      "El servicio de gestión de TIE es adicional porque la disponibilidad de citas suele ser muy limitada y depende de cada comunidad o provincia. Ofrecemos dos niveles según cuánto quieras delegar.",
    bloques: [
      {
        titulo: "Servicio básico",
        items: [
          "Reserva de cita TIE — toma de huellas.",
          "Selección correcta de provincia y trámite.",
          "Envío de la confirmación de cita.",
        ],
      },
      {
        titulo: "Servicio completo",
        items: [
          "Asesoramiento personalizado según tu resolución.",
          "Revisión de plazos y requisitos.",
          "Reserva de cita TIE.",
          "Llenado del formulario EX-17.",
          "Llenado de la tasa 790 — código 012.",
          "Checklist y guía para el día de la cita.",
        ],
      },
    ],
  },
  "empadronamiento": {
    intro:
      "El certificado de empadronamiento es requisito para la TIE, la sanidad, la nacionalidad y buena parte de los trámites municipales. Gestionamos la cita y te decimos exactamente qué llevar según tu ayuntamiento.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Gestión de la cita en tu ayuntamiento.",
          "Checklist de documentos según tu tipo de alojamiento.",
          "Indicaciones para el día de la cita.",
        ],
      },
    ],
  },
  "certificado-ue": {
    intro:
      "Si eres ciudadano de la Unión Europea y vas a residir en España más de tres meses, debes inscribirte en el Registro Central de Extranjeros. Gestionamos la cita y la documentación.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Gestión de la cita en la oficina correspondiente.",
          "Llenado de formularios y tasa.",
          "Checklist de acreditación de medios o actividad.",
        ],
      },
    ],
  },
  "certificado-digital": {
    intro:
      "Con el certificado digital puedes presentar solicitudes, consultar expedientes y firmar documentos ante la administración española desde casa. Te guiamos en la solicitud, la acreditación y la instalación.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Solicitud del certificado ante la FNMT.",
          "Gestión de la cita de acreditación presencial.",
          "Guía de descarga, instalación y copia de seguridad.",
        ],
      },
    ],
  },
  "prueba-cervantes": {
    intro:
      "La prueba CCSE evalúa conocimientos constitucionales y socioculturales de España y es requisito para la nacionalidad por residencia. Gestionamos tu inscripción y te orientamos en la preparación.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Inscripción en la convocatoria que mejor encaje con tus plazos.",
          "Orientación sobre el temario oficial y los materiales de estudio.",
          "Seguimiento del resultado y su integración en tu expediente de nacionalidad.",
        ],
      },
    ],
  },
  "carta-invitacion": {
    intro:
      "La carta de invitación es el documento oficial que acredita el alojamiento de quien viene a visitarte. Se tramita ante la Policía Nacional y tiene requisitos concretos de acreditación.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Gestión de la cita en comisaría.",
          "Preparación de la documentación del invitante y del invitado.",
          "Llenado de formularios y tasa correspondiente.",
        ],
      },
    ],
  },
  "canje-dgt": {
    intro:
      "Varios países latinoamericanos tienen convenio de canje con España, lo que permite cambiar tu licencia sin repetir el examen. Verificamos si tu país aplica y gestionamos el trámite ante la DGT.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Verificación del convenio aplicable a tu país y tipo de permiso.",
          "Gestión de la cita en Jefatura de Tráfico.",
          "Preparación de documentación, psicotécnico y tasas.",
        ],
      },
    ],
  },
  "seguridad-social": {
    intro:
      "Sin número de la Seguridad Social no puedes firmar un contrato ni empezar prácticas. Gestionamos la asignación del número y te orientamos sobre el alta que corresponde a tu situación.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Solicitud del número de la Seguridad Social.",
          "Gestión de la cita si tu provincia la exige.",
          "Orientación sobre alta como trabajador o en prácticas.",
        ],
      },
    ],
  },
  "master-paises-bajos": {
    intro:
      "En Países Bajos ofrecemos asesoría de postulación: identificamos los programas que encajan con tu perfil y preparamos una aplicación competitiva ante universidades neerlandesas.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Análisis de perfil e informe de programas compatibles.",
          "Optimización de CV europeo y carta de motivación.",
          "Revisión de requisitos de admisión y plazos.",
          "Acompañamiento durante la postulación.",
        ],
      },
    ],
  },
  "master-italia": {
    intro:
      "Asesoría de postulación a programas de máster en Italia: selección de universidades, revisión de requisitos y preparación del expediente académico.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Informe de programas y universidades compatibles con tu perfil.",
          "Revisión documental y de requisitos de admisión.",
          "Orientación sobre becas regionales y tasas.",
          "Acompañamiento durante la postulación.",
        ],
      },
    ],
  },
  "master-francia": {
    intro:
      "Asesoría de postulación a másteres en Francia: elegimos programas afines a tu perfil y preparamos tu candidatura según los estándares franceses.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Informe de programas y universidades compatibles.",
          "Preparación de CV y carta de motivación al estándar francés.",
          "Revisión de requisitos de idioma y admisión.",
          "Acompañamiento durante la postulación.",
        ],
      },
    ],
  },
  "becas-espana": {
    intro:
      "Postular a becas no es cuestión de suerte: es cuestión de elegir bien las convocatorias, entrar en las primeras fases y presentar un expediente competitivo. Eso es lo que trabajamos contigo.",
    bloques: [
      {
        titulo: "Qué hacemos",
        items: [
          "Identificación de convocatorias compatibles con tu perfil y tu programa.",
          "Priorización de convocatorias exclusivas para extranjeros y primeras fases.",
          "Optimización de CV, carta de motivación y cartas de recomendación.",
          "Revisión de requisitos y control de plazos de cada convocatoria.",
          "Acompañamiento durante toda la postulación.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Cuándo debo empezar a preparar la beca?",
        a: "Antes de postular al máster. Las convocatorias más interesantes cierran meses antes del inicio de clases y muchas exigen tener ya la admisión o la postulación en marcha.",
      },
    ],
  },
  "homologacion-bachillerato": {
    intro:
      "Si quieres estudiar una carrera universitaria o una FP en España, tus estudios de secundaria deben estar homologados. El trámite se presenta ante el Ministerio de Educación y puede hacerse con o sin representación en España.",
    bloques: [
      {
        titulo: "Con representación — nos encargamos de todo",
        items: [
          "Recolección de documentos y envío internacional a España.",
          "Creación de tu usuario en la plataforma del Ministerio de Educación.",
          "Presentación telemática de la solicitud y obtención del volante.",
          "Gestión y pago de la tasa oficial en tu nombre.",
          "Apersonamiento ante el organismo público en España para validar los documentos.",
        ],
      },
      {
        titulo: "Sin representación — tú das el paso final",
        items: [
          "Revisión y asesoría documental completa.",
          "Envío internacional de documentos.",
          "Creación de usuario y presentación telemática de la solicitud.",
          "Emitimos tu cita: tú o un familiar autorizado acude a validar los documentos y recoger el volante sellado.",
        ],
      },
    ],
    noIncluye: ["La tasa oficial del procedimiento de homologación."],
    faq: [
      {
        q: "¿Cuánto tarda la homologación?",
        a: "Es el trámite que más conviene iniciar con antelación: la resolución puede tardar meses. Por eso, en el calendario que trabajamos contigo, la homologación arranca antes que cualquier postulación.",
      },
      {
        q: "¿Qué es el volante?",
        a: "Es el justificante de que has presentado la solicitud. Con el volante ya puedes matricularte en centros de Formación Profesional mientras la homologación definitiva se resuelve.",
      },
    ],
  },
  "homologacion-titulo": {
    intro:
      "La homologación equipara tu título a uno español que habilita para una profesión regulada. La equivalencia lo reconoce a nivel académico sin habilitar profesión. Elegir mal la vía es el error que más expedientes retrasa.",
    bloques: [
      {
        titulo: "Profesiones de salud",
        items: [
          "Médico, Odontólogo, Farmacéutico, Enfermero, Fisioterapeuta.",
          "Veterinario, Podólogo, Óptico-Optometrista.",
          "Logopeda, Terapeuta Ocupacional, Dietista-Nutricionista.",
        ],
      },
      {
        titulo: "Ingenierías y otras profesiones reguladas",
        items: [
          "Arquitecto y Arquitecto Técnico.",
          "Ingenierías industriales, de telecomunicación, aeronáutica, agrícola, forestal, de minas, naval y de caminos.",
          "Psicólogo General Sanitario y Derecho.",
        ],
      },
      {
        titulo: "Nuestra asesoría incluye",
        items: [
          "Análisis y evaluación personalizada de tu caso y de la vía correcta.",
          "Revisión y preparación completa de la documentación.",
          "Presentación del expediente y seguimiento del proceso.",
          "Acompañamiento profesional hasta la resolución final.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Necesito homologar para estudiar un máster?",
        a: "En la mayoría de casos no: las universidades españolas aceptan títulos latinoamericanos con una comprobación de equivalencia propia. La homologación se vuelve obligatoria para ejercer profesiones reguladas y para los másteres habilitantes.",
      },
    ],
  },
  "grado-espana": {
    intro:
      "El Grado es la carrera universitaria española, equivalente a la antigua licenciatura. Para acceder necesitas homologar tu bachillerato y elegir una vía: sin examen, con el bachillerato homologado, o con las pruebas PCE de la UNED.",
    bloques: [
      {
        titulo: "Cuatro servicios en uno",
        items: [
          "Búsqueda personalizada de universidades públicas y privadas, evaluando precios, notas de corte, calidad y ubicación.",
          "Homologación de tus estudios secundarios al Bachillerato español (la tasa oficial, 50 €, se paga aparte).",
          "Trámites y vía de acceso: sin examen o con las pruebas PCE de la UNED, que gestionamos (la preparación no está incluida).",
          "Preinscripción, gestión de admisión y formalización de matrícula.",
        ],
      },
      {
        titulo: "Calendario recomendado",
        items: [
          "Homologación del bachillerato: cuanto antes, es lo que más tarda.",
          "Inscripción a las pruebas PCE, si vas con examen: entre febrero y mayo.",
          "Pruebas PCE: junio.",
          "Preinscripción en la universidad: julio.",
          "Trámite del visado de estudios: tras la admisión.",
          "Inicio de clases: septiembre.",
        ],
      },
    ],
  },
  "formacion-profesional": {
    intro:
      "La FP española son estudios técnicos de 2 años que incluyen prácticas en empresas desde el primer año. Es una de las vías más eficientes para estudiar en España: matrícula subvencionada, acceso directo a la universidad después y permiso para trabajar 30 horas semanales.",
    bloques: [
      {
        titulo: "Beneficios",
        items: [
          "Costos de matrícula subvencionados en centros públicos.",
          "Acceso directo a la universidad al terminar.",
          "Válido para tu visa de estudios en España.",
          "Permiso para trabajar hasta 30 horas a la semana.",
          "Prácticas en empresas desde el primer año.",
        ],
      },
      {
        titulo: "Familias profesionales disponibles",
        items: [
          "Administración y gestión · Comercio y marketing · Artes gráficas.",
          "Informática y comunicaciones · Imagen y sonido · Vídeo y fotografía.",
          "Sanidad · Actividades físicas y deportivas · Imagen personal.",
          "Hostelería y turismo · Industrias alimentarias · Agraria.",
          "Electricidad y electrónica · Energía y agua · Fabricación mecánica.",
          "Edificación y obra civil · Instalación y mantenimiento · Madera y mueble.",
          "Transporte y mantenimiento de vehículos · Seguridad y medioambiente.",
          "Servicios a la comunidad · Idiomas, y más opciones.",
        ],
      },
      {
        titulo: "Cómo te acompañamos",
        items: [
          "Homologación escolar al Bachillerato español (con o sin representación).",
          "Búsqueda de centros oficiales: evaluación de precios, notas de corte y aptitud para el visado.",
          "Postulación y matrícula: solicitudes, revisión documental y seguimiento hasta la vacante.",
          "Guía y asesoría educativa con kit de bienvenida, modelos y tutoriales.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Cuáles son los requisitos?",
        a: "Terminar tus estudios secundarios y homologarlos al Bachillerato español. Ese es el paso previo obligatorio, y conviene iniciarlo con varios meses de antelación.",
      },
      {
        q: "¿Cuándo se postula?",
        a: "El grueso de las postulaciones se abre entre mayo y junio, con inicio de clases en octubre. La homologación debe estar en marcha desde principios de año.",
      },
    ],
  },
  "seguro-medico": {
    intro:
      "El consulado y Extranjería exigen una cobertura muy concreta: sin copagos, sin carencias, con repatriación y equivalente a la sanidad pública española. Te orientamos y gestionamos la contratación del seguro que sí cumple.",
    bloques: [
      {
        titulo: "Qué revisamos y gestionamos",
        items: [
          "Verificación de que la póliza cumple los requisitos de tu consulado o de Extranjería.",
          "Cobertura sin copagos ni periodos de carencia.",
          "Repatriación y cobertura equivalente a la sanidad pública española.",
          "Contratación y obtención del certificado en el formato que piden.",
          "Ajuste de fechas de vigencia al periodo exigido para tu trámite.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Me sirve el seguro de viaje que ya tengo?",
        a: "Casi nunca. Los seguros de viaje habituales tienen copagos, carencias o coberturas limitadas que no cumplen lo que exige la administración española. Lo revisamos antes de que pagues nada.",
      },
    ],
  },
  "apostillas": {
    intro:
      "Gestionamos el apostillado y la legalización de títulos, certificados y documentos oficiales para que tengan plena validez en España.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Gestión de documentos oficiales ante las entidades emisoras.",
          "Apostillado y legalización de títulos y certificados.",
          "Diligencia y validación de documentos académicos.",
          "Envío internacional cuando el trámite lo requiere.",
        ],
      },
    ],
  },
  "pasajes": {
    intro:
      "Facilitamos todo el proceso para que tu viaje sea seguro y económico, coordinado con las fechas reales de tu trámite migratorio.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Búsqueda de vuelos a los mejores precios.",
          "Recomendaciones para elegir fechas y aerolíneas.",
          "Asistencia en cambios o cancelaciones de vuelos.",
        ],
      },
    ],
  },
  "diligencias-peru": {
    intro:
      "Si no cuentas con tiempo o ya no estás en el país, nos encargamos de los trámites presenciales ante universidades, colegios e instituciones públicas del Perú.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Obtención de certificados de estudios y constancias.",
          "Legalización de documentos académicos.",
          "Trámites administrativos ante instituciones peruanas.",
          "Coordinación con el apostillado y el envío internacional.",
        ],
      },
    ],
  },
  "poderes": {
    intro:
      "Redactamos y gestionamos los poderes necesarios para representarte en trámites en España o en Perú, con la formalidad que cada procedimiento exige.",
    bloques: [
      {
        titulo: "Incluye",
        items: [
          "Redacción del poder ajustado al trámite concreto.",
          "Coordinación notarial y consular.",
          "Apostillado cuando el destino lo requiere.",
        ],
      },
    ],
  },
};

// ── Catálogo completo ───────────────────────────────────────────────────────
export const CATEGORIAS = CATEGORIAS_INDICE.map((cat) => ({
  ...cat,
  grupos: cat.grupos.map((g) => ({
    ...g,
    servicios: g.servicios.map((s) =>
      s.ficha ? { ...s, detalle: { ...s.ficha, ...DETALLES[s.id] } } : s
    ),
  })),
}));

// ── Utilidades ──────────────────────────────────────────────────────────────
export const TODOS_SERVICIOS = CATEGORIAS.flatMap((cat) =>
  cat.grupos.flatMap((g) =>
    g.servicios.map((s) => ({ ...s, categoriaId: cat.id, categoria: cat.titulo }))
  )
);

export const getServicio = (id) => TODOS_SERVICIOS.find((s) => s.id === id);
