// src/config/diagnostico.js
// Árbol del diagnóstico guiado de /asistente. Cada nodo es una pregunta con
// opciones; una opción o lleva a otro nodo (`ir`) o cierra con un resultado
// (`res`). Los resultados no solo nombran la vía: entregan plan, documentos
// y plazos, que es lo que el visitante se lleva.

export const NODOS = {
  inicio: {
    titulo: "Empecemos por lo básico",
    pregunta: "¿Dónde estás ahora mismo?",
    ayuda: "De esto depende ante quién se presenta tu trámite.",
    opciones: [
      { txt: "En mi país de origen", desc: "Todavía no he viajado a España", icono: "mapa", ir: "objetivo" },
      { txt: "Ya estoy en España", desc: "Como turista, estudiante o residente", icono: "bandera", ir: "situacionEspana" },
      { txt: "En otro país de Europa", desc: "Fuera de España pero dentro del espacio europeo", icono: "avion", ir: "objetivo" },
    ],
  },

  objetivo: {
    titulo: "Tu objetivo",
    pregunta: "¿Qué quieres hacer en España?",
    ayuda: "No hay respuesta mala: cada objetivo tiene su vía.",
    opciones: [
      { txt: "Estudiar", desc: "Máster, grado o carrera técnica", icono: "birrete", ir: "queEstudiar" },
      { txt: "Trabajar para una empresa española", desc: "Tengo o busco una oferta de empleo", icono: "maletin", ir: "ofertaTrabajo" },
      { txt: "Trabajar en remoto desde España", desc: "Mi empresa o mis clientes están fuera", icono: "laptop", ir: "remotoIngresos" },
      { txt: "Vivir sin trabajar allí", desc: "Con rentas, ahorros o pensión propios", icono: "casa", res: "noLucrativa" },
      { txt: "Investigar o hacer un doctorado", desc: "Programa de doctorado o investigación", icono: "libro", res: "doctorado" },
    ],
  },

  queEstudiar: {
    titulo: "Tus estudios",
    pregunta: "¿Qué quieres estudiar?",
    ayuda: "El programa marca los requisitos previos y el calendario.",
    opciones: [
      { txt: "Un máster", desc: "Ya tengo título universitario", icono: "birrete", ir: "tieneAdmision" },
      { txt: "Una carrera universitaria (grado)", desc: "Vengo de la secundaria", icono: "libro", res: "grado" },
      { txt: "Formación Profesional", desc: "Carrera técnica de 2 años, muy empleable", icono: "maletin", res: "fp" },
      { txt: "Todavía no lo tengo claro", desc: "Quiero que me orienten", icono: "brujula", res: "asesoriaEducativa" },
    ],
  },

  tieneAdmision: {
    titulo: "Tu admisión",
    pregunta: "¿Ya tienes carta de admisión de un centro español?",
    ayuda: "Sin admisión no se puede iniciar el trámite migratorio.",
    opciones: [
      { txt: "Sí, ya estoy admitido", desc: "Tengo la carta en la mano", icono: "documento", ir: "comoTramitar" },
      { txt: "Todavía estoy postulando", desc: "En proceso de admisión", icono: "reloj", res: "asesoriaEducativa" },
      { txt: "No, aún no empiezo", desc: "Quiero saber por dónde arrancar", icono: "brujula", res: "asesoriaEducativa" },
      { txt: "Me denegaron el visado", desc: "Ya lo intenté y no salió", icono: "balanza", ir: "denegacionCuando" },
    ],
  },

  comoTramitar: {
    titulo: "La vía del permiso",
    pregunta: "¿Cómo prefieres tramitar tu permiso de estudios?",
    ayuda: "Es el mismo permiso: cambia dónde y cuándo se presenta.",
    opciones: [
      { txt: "Desde mi país, en el consulado", desc: "Viajar ya con el visado resuelto", icono: "pasaporte", res: "visaEstudios" },
      { txt: "Viajando primero a España", desc: "Entrar como turista y regularizar allá", icono: "avion", res: "estanciaEstudios" },
      { txt: "No sé cuál me conviene", desc: "Depende de mis fechas y mi consulado", icono: "brujula", res: "diagnosticoEstudios" },
    ],
  },

  ofertaTrabajo: {
    titulo: "Tu oferta",
    pregunta: "¿Cómo es el puesto que te ofrecen?",
    ayuda: "El nivel del puesto define por qué vía se tramita.",
    opciones: [
      { txt: "Puesto cualificado y bien pagado", desc: "Titulación o experiencia acreditable", icono: "maletin", res: "pac" },
      { txt: "Todavía no tengo oferta", desc: "La estoy buscando", icono: "reloj", res: "sinOferta" },
      { txt: "Es un puesto no cualificado", desc: "Sector servicios, hostelería, cuidados…", icono: "usuarios", res: "sinOferta" },
    ],
  },

  remotoIngresos: {
    titulo: "Tus ingresos",
    pregunta: "¿Cuánto ganas al mes trabajando en remoto?",
    ayuda: "La residencia de nómada digital exige un umbral económico alto.",
    opciones: [
      { txt: "Más de 2.800 € al mes", desc: "Con contrato o facturación estable", icono: "euro", res: "nomada" },
      { txt: "Entre 2.000 € y 2.800 €", desc: "Cerca del umbral, habría que revisarlo", icono: "euro", res: "nomadaLimite" },
      { txt: "Menos de 2.000 € al mes", desc: "Por debajo de lo que se exige hoy", icono: "reloj", res: "nomadaNoLlega" },
    ],
  },

  situacionEspana: {
    titulo: "Tu situación aquí",
    pregunta: "¿En qué situación estás en España?",
    ayuda: "De esto depende qué puedes solicitar y en qué plazo.",
    opciones: [
      { txt: "Con estancia por estudios", desc: "Estudiando con permiso vigente", icono: "birrete", ir: "estudianteQue" },
      { txt: "Con residencia (trabajo, familiar…)", desc: "Permiso de residencia vigente", icono: "documento", ir: "residenteQue" },
      { txt: "Como turista", desc: "Dentro de mis 90 días", icono: "avion", ir: "turistaQue" },
      { txt: "En situación irregular", desc: "Sin permiso vigente ahora mismo", icono: "escudo", res: "arraigos" },
    ],
  },

  estudianteQue: {
    titulo: "Tu siguiente paso",
    pregunta: "¿Qué necesitas hacer ahora?",
    opciones: [
      { txt: "Quedarme a trabajar al terminar", desc: "Pasar de estudiante a residente", icono: "maletin", res: "modificatoria" },
      { txt: "Renovar mi estancia", desc: "Sigo estudiando el año que viene", icono: "reloj", res: "prorroga" },
      { txt: "Hacer un trámite concreto", desc: "TIE, empadronamiento, seguridad social…", icono: "huella", res: "tramites" },
      { txt: "Salir y volver a entrar a España", desc: "Con la tarjeta en trámite", icono: "avion", res: "permisoRetorno" },
    ],
  },

  residenteQue: {
    titulo: "Tu siguiente paso",
    pregunta: "¿Qué quieres conseguir?",
    opciones: [
      { txt: "La nacionalidad española", desc: "Llevo tiempo residiendo aquí", icono: "bandera", ir: "cuantosAnos" },
      { txt: "Renovar o cambiar mi permiso", desc: "Modificar mi situación actual", icono: "documento", res: "modificatorias" },
      { txt: "Traer a mi familia", desc: "Reagrupación o carta de invitación", icono: "usuarios", res: "tramites" },
      { txt: "Un trámite del día a día", desc: "TIE, certificado digital, canje DGT…", icono: "huella", res: "tramites" },
    ],
  },

  turistaQue: {
    titulo: "Tu plan",
    pregunta: "¿Qué quieres hacer antes de que terminen tus 90 días?",
    ayuda: "El plazo corre: cuanto antes se prepare el expediente, mejor.",
    opciones: [
      { txt: "Quedarme a estudiar", desc: "Tengo o tendré carta de admisión", icono: "birrete", res: "estanciaEstudios" },
      { txt: "Quedarme a trabajar en remoto", desc: "Trabajo para una empresa de fuera", icono: "laptop", ir: "remotoIngresos" },
      { txt: "Aún no lo sé", desc: "Necesito que me orienten ya", icono: "brujula", res: "urgente" },
    ],
  },

  cuantosAnos: {
    titulo: "Tu tiempo de residencia",
    pregunta: "¿Cuánto llevas con residencia legal en España?",
    ayuda: "Ojo: la estancia por estudios no cuenta para la nacionalidad.",
    opciones: [
      { txt: "Dos años o más", desc: "Con residencia, no con estancia de estudios", icono: "bandera", res: "nacionalidad" },
      { txt: "Menos de dos años", desc: "Todavía sumando tiempo", icono: "reloj", res: "nacionalidadPronto" },
      { txt: "Solo he tenido estancia por estudios", desc: "Nunca he tenido residencia", icono: "birrete", res: "modificatoria" },
    ],
  },

  denegacionCuando: {
    titulo: "Tu denegación",
    pregunta: "¿Cuánto hace que recibiste la resolución?",
    ayuda: "Los plazos para recurrir son cortos y perentorios.",
    opciones: [
      { txt: "Menos de un mes", desc: "La tengo reciente", icono: "reloj", res: "recurso" },
      { txt: "Más de un mes", desc: "Ya pasó un tiempo", icono: "documento", res: "recursoTarde" },
      { txt: "No estoy seguro", desc: "Tendría que revisar la fecha", icono: "brujula", res: "recurso" },
    ],
  },
};

// ── Resultados ──────────────────────────────────────────────────────────────
export const RESULTADOS = {
  visaEstudios: {
    icono: "pasaporte",
    via: "Visa de Estudios",
    titulo: "Tu vía es la Visa de Estudios",
    resumen:
      "Tramitas desde tu país ante el consulado español y viajas con el visado ya resuelto en el pasaporte.",
    porQue: [
      "Llegas a España con tu situación regularizada desde el primer día.",
      "Puedes trabajar hasta 30 horas semanales.",
      "Evitas el riesgo de que se te agoten los 90 días de turista.",
    ],
    plazo: "1 a 2 meses de resolución consular",
    empezar: "3 a 4 meses antes del inicio de clases",
    documentos: [
      "Carta de admisión del centro español",
      "Antecedentes penales apostillados",
      "Certificado médico",
      "Seguro médico con cobertura completa",
      "Acreditación de medios económicos",
    ],
    servicios: ["visa-estudios", "seguro-medico", "apostillas"],
    href: "/servicios/visa-estudios",
  },
  estanciaEstudios: {
    icono: "bandera",
    via: "Estancia por Estudios",
    titulo: "Tu vía es la Estancia por Estudios",
    resumen:
      "Entras a España como turista y regularizas tu situación ante Extranjería, con presentación telemática y firma digital del abogado.",
    porQue: [
      "Evitas la cita consular, que en algunos países tarda meses.",
      "Todo el proceso es 100% digital: sin citas, sin colas.",
      "Incluye permiso para trabajar hasta 30 horas semanales.",
    ],
    plazo: "Se presenta estando en España, dentro de tus 90 días",
    empezar: "Antes de viajar, para llegar con el expediente listo",
    documentos: [
      "Carta de admisión oficial reciente",
      "Pasaporte con entrada sellada",
      "Seguro médico válido",
      "Medios económicos acreditados",
      "Empadronamiento",
    ],
    servicios: ["estancia-estudios", "seguro-medico", "empadronamiento"],
    href: "/servicios/estancia-estudios",
  },
  diagnosticoEstudios: {
    icono: "balanza",
    via: "Diagnóstico previo",
    titulo: "Necesitas decidir entre dos vías",
    resumen:
      "Visa de Estudios y Estancia por Estudios llevan al mismo permiso, pero elegir mal cuesta meses. Depende de tus fechas de clase, de la carga de tu consulado y de tu situación documental.",
    porQue: [
      "Si tu consulado va rápido, la visa es la vía más cómoda.",
      "Si las citas están saturadas, la estancia te salva el curso.",
      "Con las clases encima, el orden de los pasos lo cambia todo.",
    ],
    plazo: "Conviene resolverlo cuanto antes",
    empezar: "Ahora: la decisión condiciona todo el calendario",
    documentos: ["Carta de admisión", "Fechas de inicio de clases", "Tu ciudad de consulado"],
    servicios: ["visa-estudios", "estancia-estudios"],
    href: "/ruta/estudios",
  },
  grado: {
    icono: "libro",
    via: "Grado universitario",
    titulo: "Vas a por un Grado en España",
    resumen:
      "La carrera universitaria española dura 4 años. Antes hay dos pasos obligatorios: homologar tu bachillerato y rendir las pruebas de acceso PCE/EBAU de la UNED.",
    porQue: [
      "La homologación del bachillerato es requisito y tarda meses.",
      "Las pruebas de acceso tienen fechas fijas entre febrero y junio.",
      "Con el grado también puedes trabajar 30 horas semanales.",
    ],
    plazo: "El curso empieza en septiembre",
    empezar: "Un año antes: la homologación es lo que más tarda",
    documentos: [
      "Certificado de estudios secundarios legalizado",
      "Pasaporte vigente",
      "Homologación al Bachillerato español",
      "Inscripción a pruebas PCE / EBAU",
    ],
    servicios: ["grado-espana", "homologacion-bachillerato", "apostillas"],
    href: "/servicios/grado-espana",
  },
  fp: {
    icono: "maletin",
    via: "Formación Profesional",
    titulo: "La FP puede ser tu mejor entrada",
    resumen:
      "Dos años, prácticas en empresas desde el primer año y matrícula subvencionada en centros públicos. Es de las vías más eficientes y menos conocidas.",
    porQue: [
      "Alta empleabilidad y costos de matrícula muy bajos.",
      "Da acceso directo a la universidad al terminar.",
      "Válida para tu visa de estudios, con 30 horas de trabajo semanal.",
    ],
    plazo: "Postulaciones entre mayo y junio; clases en octubre",
    empezar: "En enero: primero la homologación escolar",
    documentos: [
      "Certificado de estudios secundarios legalizado",
      "Homologación al Bachillerato español",
      "Pasaporte vigente",
    ],
    servicios: ["formacion-profesional", "homologacion-bachillerato"],
    href: "/servicios/formacion-profesional",
  },
  asesoriaEducativa: {
    icono: "birrete",
    via: "Asesoría educativa",
    titulo: "Primero hay que elegir bien el programa",
    resumen:
      "El permiso migratorio viene después. Analizamos tu perfil, tu presupuesto y tus plazos para armar una shortlist donde de verdad seas competitivo, con las becas trabajadas en paralelo.",
    porQue: [
      "Hay más de 1.100 másteres oficiales: postular a los correctos importa más que postular a muchos.",
      "En universidades públicas hay másteres desde unos 700 € el curso.",
      "Las mejores becas cierran meses antes del inicio de clases.",
    ],
    plazo: "Las fases de admisión se abren de noviembre a septiembre",
    empezar: "9 a 12 meses antes del inicio de clases",
    documentos: [
      "Título universitario y certificado de notas",
      "CV actualizado",
      "Carta de motivación",
      "Cartas de recomendación",
    ],
    servicios: ["master-espana", "becas-espana", "homologacion-titulo"],
    href: "/ruta/estudios",
  },
  pac: {
    icono: "maletin",
    via: "Visado PAC",
    titulo: "Te corresponde el Visado PAC",
    resumen:
      "El permiso de Profesional Altamente Cualificado es de los más ágiles del sistema español, y permite traer a tu familia desde el inicio.",
    porQue: [
      "Se resuelve en plazos cortos, con silencio administrativo positivo.",
      "Autorización conjunta para cónyuge e hijos.",
      "Computa para la nacionalidad desde el primer día.",
    ],
    plazo: "Alrededor de 20 días hábiles de resolución",
    empezar: "En cuanto tengas la oferta firmada",
    documentos: [
      "Contrato u oferta de trabajo cualificada",
      "Titulación universitaria o experiencia acreditable",
      "Documentación de la empresa contratante",
      "Antecedentes penales y seguro médico",
    ],
    servicios: ["visado-pac"],
    href: "/servicios/visado-pac",
  },
  sinOferta: {
    icono: "brujula",
    via: "Estrategia previa",
    titulo: "Sin oferta cualificada, hay otro camino",
    resumen:
      "Para trabajar en España partiendo de cero, la vía más realista suele ser entrar por estudios: el permiso te deja trabajar 30 horas semanales y después modificar a residencia.",
    porQue: [
      "Estudiando entras legalmente y puedes trabajar desde el primer día.",
      "Al terminar, la modificación a residente abre el mercado laboral completo.",
      "La residencia sí computa para la nacionalidad; la estancia no.",
    ],
    plazo: "Depende del programa que elijas",
    empezar: "Con la elección del programa",
    documentos: ["Título o certificado de estudios", "Pasaporte vigente", "CV actualizado"],
    servicios: ["master-espana", "formacion-profesional", "modificatoria-residente"],
    href: "/ruta/estudios",
  },
  nomada: {
    icono: "laptop",
    via: "Residencia de Nómada Digital",
    titulo: "Cumples el perfil de Nómada Digital",
    resumen:
      "Con esos ingresos entras en el umbral que exige la Ley de Startups para teletrabajadores de empresas extranjeras.",
    porQue: [
      "Residencia inicial de hasta 3 años, renovable.",
      "Computa para la nacionalidad desde el primer día.",
      "Autorización para cónyuge e hijos.",
    ],
    plazo: "Alrededor de 20 días hábiles si se presenta en España",
    empezar: "Cuando tengas 3 meses de antigüedad con tu empresa",
    documentos: [
      "Contrato o acuerdo con la empresa extranjera",
      "Certificado de antigüedad (mínimo 3 meses)",
      "Acreditación de ingresos",
      "Titulación o 3 años de experiencia",
      "Seguro médico y antecedentes penales",
    ],
    servicios: ["nomada-digital"],
    href: "/servicios/nomada-digital",
  },
  nomadaLimite: {
    icono: "balanza",
    via: "Nómada Digital · caso a revisar",
    titulo: "Estás en el límite: hay que revisarlo",
    resumen:
      "Con esos ingresos puedes estar justo en el umbral. La forma de acreditarlos (contrato, facturación, promedios) cambia el resultado más de lo que parece.",
    porQue: [
      "El umbral se calcula sobre el salario mínimo español, que se actualiza.",
      "Muchas denegatorias vienen de documentación mal armada, no de ingresos bajos.",
      "Si no llegas, la no lucrativa o la vía de estudios pueden encajar.",
    ],
    plazo: "Conviene revisarlo antes de presentar nada",
    empezar: "Con una revisión de tu documentación laboral",
    documentos: ["Contratos y facturas de los últimos meses", "Extractos bancarios", "Certificado de la empresa"],
    servicios: ["nomada-digital", "no-lucrativa"],
    href: "/servicios/nomada-digital",
  },
  nomadaNoLlega: {
    icono: "brujula",
    via: "Otras vías",
    titulo: "Por ingresos, hoy no llegas al umbral",
    resumen:
      "La residencia de nómada digital exige acreditar bastante más. Pero hay otros caminos, y el de estudios es el que mejor funciona para la mayoría.",
    porQue: [
      "Con el permiso de estudios puedes trabajar 30 horas semanales.",
      "Después puedes modificar a residencia y quedarte.",
      "Si tienes ahorros o rentas, la no lucrativa es otra opción.",
    ],
    plazo: "Según la vía que elijas",
    empezar: "Con un diagnóstico honesto de tu caso",
    documentos: ["Justificantes de ingresos", "Ahorros o rentas", "Formación previa"],
    servicios: ["no-lucrativa", "master-espana", "formacion-profesional"],
    href: "/servicios",
  },
  noLucrativa: {
    icono: "casa",
    via: "Residencia No Lucrativa",
    titulo: "Tu vía es la Residencia No Lucrativa",
    resumen:
      "Vives en España con tus propios medios económicos, sin ejercer actividad laboral allí. Vía predecible si la acreditación económica está impecable.",
    porQue: [
      "No necesitas contrato ni oferta en España.",
      "Computa para la nacionalidad.",
      "Pasado el primer año puedes modificar a una autorización que permita trabajar.",
    ],
    plazo: "Se solicita en el consulado de tu país",
    empezar: "3 meses antes de tu fecha prevista de viaje",
    documentos: [
      "Acreditación de medios económicos (IPREM)",
      "Certificados bancarios y de rentas",
      "Seguro médico privado sin copagos",
      "Certificado médico y antecedentes penales",
    ],
    servicios: ["no-lucrativa", "seguro-medico"],
    href: "/servicios/no-lucrativa",
  },
  doctorado: {
    icono: "libro",
    via: "Residencia para Doctorado",
    titulo: "El doctorado ahora es residencia",
    resumen:
      "Es la novedad más relevante para investigadores latinoamericanos: la vía del doctorado dejó de ser estancia y pasó a ser residencia. La diferencia es enorme.",
    porQue: [
      "El tiempo de tu doctorado computa para la nacionalidad.",
      "Como latinoamericano, bastan 2 años de residencia legal.",
      "Mejores condiciones de permanencia y acceso al mercado laboral.",
    ],
    plazo: "Según tu programa y financiación",
    empezar: "Antes de presentar nada: la vía correcta lo cambia todo",
    documentos: [
      "Carta de admisión al programa de doctorado",
      "Convenio con la universidad o centro investigador",
      "Acreditación de financiación",
      "Seguro médico y antecedentes penales",
    ],
    servicios: ["residencia-doctorado", "nacionalidad"],
    href: "/servicios/residencia-doctorado",
  },
  modificatoria: {
    icono: "brujula",
    via: "Modificatoria a Residente",
    titulo: "Tu paso clave: pasar a residente",
    resumen:
      "La estancia por estudios NO computa para la nacionalidad; la residencia sí. Este trámite convierte tus años de estudio en el punto de partida real.",
    porQue: [
      "Arranca el reloj de los 2 años para la nacionalidad.",
      "Te abre el mercado laboral completo, sin el límite de 30 horas.",
      "Es el momento en que muchos pierden años por no hacerlo a tiempo.",
    ],
    plazo: "Hay un momento óptimo para presentar",
    empezar: "Antes de que termine tu estancia actual",
    documentos: [
      "Título o certificado de tus estudios en España",
      "Oferta de trabajo o proyecto de cuenta propia",
      "TIE vigente y empadronamiento",
    ],
    servicios: ["modificatoria-residente", "nacionalidad"],
    href: "/servicios/modificatoria-residente",
  },
  nacionalidad: {
    icono: "bandera",
    via: "Nacionalidad española",
    titulo: "Puedes solicitar la nacionalidad",
    resumen:
      "Con dos años de residencia legal como latinoamericano ya cumples el requisito temporal. El resto del mundo necesita diez.",
    porQue: [
      "Solo 2 años de residencia legal frente a 10 de la regla general.",
      "Los hispanohablantes están exentos del examen DELE.",
      "Pasaporte europeo y libertad de movimiento en la UE.",
    ],
    plazo: "La resolución del Ministerio puede tardar meses",
    empezar: "Ahora: el expediente completo evita requerimientos",
    documentos: [
      "Certificado de antecedentes penales del país de origen, apostillado",
      "Empadronamiento histórico",
      "TIE vigente",
      "Prueba CCSE del Instituto Cervantes aprobada",
    ],
    servicios: ["nacionalidad", "prueba-cervantes"],
    href: "/servicios/nacionalidad",
  },
  nacionalidadPronto: {
    icono: "reloj",
    via: "Preparación de nacionalidad",
    titulo: "Aún no, pero conviene ir preparando",
    resumen:
      "Te faltan meses de residencia legal, y ese tiempo es justo el bueno para dejar listo el expediente y aprobar la prueba CCSE.",
    porQue: [
      "La prueba CCSE tiene convocatorias con fechas fijas.",
      "Los antecedentes penales apostillados tardan en llegar.",
      "Cualquier hueco en tu empadronamiento hay que resolverlo antes.",
    ],
    plazo: "Cuando cumplas los 2 años de residencia legal",
    empezar: "Ya: la preparación tarda más que la solicitud",
    documentos: [
      "Empadronamiento histórico",
      "TIE y renovaciones al día",
      "Antecedentes penales apostillados",
    ],
    servicios: ["nacionalidad", "prueba-cervantes"],
    href: "/servicios/nacionalidad",
  },
  arraigos: {
    icono: "escudo",
    via: "Arraigos",
    titulo: "Tu vía es un arraigo",
    resumen:
      "Hay varios tipos de arraigo y elegir el correcto lo cambia todo: social, laboral, familiar o para la formación. Cada uno exige un tiempo de permanencia y una prueba distinta.",
    porQue: [
      "Es la vía de regularización para quien ya lleva tiempo en España.",
      "El arraigo para la formación permite regularizar estudiando.",
      "Acreditar bien la permanencia continuada es lo que decide el caso.",
    ],
    plazo: "Según el tipo de arraigo y tu tiempo de permanencia",
    empezar: "Con una revisión honesta de tu situación",
    documentos: [
      "Empadronamiento continuado",
      "Pasaporte y sellos de entrada",
      "Justificantes de permanencia (médicos, escolares, laborales)",
    ],
    servicios: ["arraigos"],
    href: "/servicios/arraigos",
  },
  prorroga: {
    icono: "reloj",
    via: "Prórroga de estancia",
    titulo: "Toca renovar tu estancia",
    resumen:
      "La renovación tiene ventanas concretas y exige acreditar aprovechamiento académico. Presentarla tarde o incompleta es la causa nº1 de problemas evitables.",
    porQue: [
      "Hay un plazo exacto de presentación que conviene calcular bien.",
      "Debes acreditar que aprovechaste el curso anterior.",
      "Se presenta de forma telemática, sin salir de España.",
    ],
    plazo: "Ventana concreta antes del vencimiento",
    empezar: "Con al menos 2 meses de antelación",
    documentos: [
      "Matrícula del nuevo curso",
      "Certificado de aprovechamiento del curso anterior",
      "Medios económicos y seguro médico actualizados",
    ],
    servicios: ["prorroga-estancia"],
    href: "/servicios/prorroga-estancia",
  },
  modificatorias: {
    icono: "documento",
    via: "Modificación de situación",
    titulo: "Necesitas modificar tu situación",
    resumen:
      "Pasar de una autorización a otra exige timing y una estrategia documental precisa para no romper tu continuidad legal.",
    porQue: [
      "El momento de presentación condiciona el resultado.",
      "Una continuidad rota cuesta años de cómputo para la nacionalidad.",
      "Cada vía de destino tiene requisitos distintos.",
    ],
    plazo: "Depende de tu permiso actual y del de destino",
    empezar: "Antes del vencimiento de tu permiso actual",
    documentos: ["TIE vigente", "Documentación de la nueva situación", "Empadronamiento"],
    servicios: ["modificatorias", "modificatoria-residente"],
    href: "/servicios/modificatorias",
  },
  permisoRetorno: {
    icono: "avion",
    via: "Permiso de retorno",
    titulo: "Necesitas un permiso de retorno",
    resumen:
      "Si sales de España con la TIE en trámite o en renovación, esto es lo que te garantiza poder volver a entrar sin problemas en frontera.",
    porQue: [
      "Sin él puedes tener problemas para reingresar.",
      "Se tramita en comisaría con cita previa.",
      "Tiene plazos concretos de salida y regreso.",
    ],
    plazo: "Se gestiona antes de viajar",
    empezar: "Con varias semanas de antelación al viaje",
    documentos: ["Pasaporte vigente", "Resguardo de la TIE en trámite", "Tasa correspondiente"],
    servicios: ["permiso-retorno"],
    href: "/servicios/permiso-retorno",
  },
  tramites: {
    icono: "huella",
    via: "Trámites en España",
    titulo: "Es una gestión del día a día",
    resumen:
      "TIE, empadronamiento, certificado digital, seguridad social, canje de licencia o carta de invitación. Cada uno con su cita, su formulario y su tasa.",
    porQue: [
      "Las citas de TIE tienen disponibilidad muy limitada por provincia.",
      "El empadronamiento es requisito para casi todo lo demás.",
      "El certificado digital te ahorra desplazamientos futuros.",
    ],
    plazo: "Según el trámite y tu provincia",
    empezar: "Cuanto antes: las citas vuelan",
    documentos: ["Pasaporte", "Resolución favorable si la tienes", "Justificante de domicilio"],
    servicios: ["tie", "empadronamiento", "certificado-digital", "seguridad-social"],
    href: "/ruta/en-espana",
  },
  recurso: {
    icono: "balanza",
    via: "Recurso de Reposición",
    titulo: "Estás a tiempo de recurrir",
    resumen:
      "Analizamos la resolución y te decimos con honestidad si el recurso es viable. Solo asumimos casos con posibilidades reales.",
    porQue: [
      "Los plazos para recurrir son cortos: la reciente juega a tu favor.",
      "Muchas denegatorias vienen de documentación mal armada, no de incumplir requisitos.",
      "Si el recurso no procede, reconducimos hacia la estancia por estudios.",
    ],
    plazo: "Plazo corto desde la notificación",
    empezar: "Inmediatamente",
    documentos: [
      "Resolución de denegación completa",
      "Expediente que presentaste",
      "Pasaporte y carta de admisión",
    ],
    servicios: ["recurso-reposicion", "estancia-estudios"],
    href: "/servicios/recurso-reposicion",
  },
  recursoTarde: {
    icono: "reloj",
    via: "Plan alternativo",
    titulo: "Puede que el plazo haya vencido",
    resumen:
      "Si pasó el plazo de recurso, la vía realista es reconducir el caso: normalmente hacia una estancia por estudios, corrigiendo lo que falló la primera vez.",
    porQue: [
      "Insistir fuera de plazo no lleva a ningún sitio.",
      "La estancia por estudios se presenta ya en España, ante Extranjería.",
      "Saber por qué te denegaron evita repetir el error.",
    ],
    plazo: "Depende de tus fechas de clase",
    empezar: "Con la lectura de tu resolución anterior",
    documentos: ["Resolución de denegación", "Carta de admisión vigente", "Pasaporte"],
    servicios: ["estancia-estudios", "recurso-reposicion"],
    href: "/ruta/denegado",
  },
  urgente: {
    icono: "reloj",
    via: "Diagnóstico urgente",
    titulo: "Tu plazo corre: hay que decidir ya",
    resumen:
      "Estando en España como turista, cada semana cuenta. Lo primero es determinar qué vía es viable en el tiempo que te queda.",
    porQue: [
      "Los 90 días de turista no se prorrogan.",
      "Algunas vías solo pueden presentarse estando en situación regular.",
      "Con las fechas justas, el orden de los pasos es lo que salva el caso.",
    ],
    plazo: "Dentro de tus 90 días de estancia como turista",
    empezar: "Esta semana",
    documentos: ["Pasaporte con sello de entrada", "Cualquier documento académico o laboral que tengas"],
    servicios: ["estancia-estudios", "nomada-digital", "arraigos"],
    href: "/servicios",
  },
};

export const getNodo = (id) => NODOS[id];
export const getResultado = (id) => RESULTADOS[id];
