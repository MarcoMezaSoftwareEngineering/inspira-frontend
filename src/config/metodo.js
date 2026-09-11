// src/config/metodo.js
// ─────────────────────────────────────────────────────────────────────────────
// EL MÉTODO INSPIRA — fuente única de verdad del modelo comercial por etapas.
//
// La idea que lo ordena todo: nadie paga un proceso migratorio de golpe. Se
// paga por etapas, y cada etapa solo se abre cuando la anterior dio resultado.
// Admisión → Carta → Visado → Llegada.
//
// Los importes salen del material comercial de la empresa: propuesta "Máster
// en España 2027", dosier "Paquete Máster 2026/2027", flyer de asesoría para
// visa de estudios y flyer de estancia por estudios. Si cambia un precio,
// cambia AQUÍ: la landing /metodo-inspira y el simulador leen de este archivo.
// ─────────────────────────────────────────────────────────────────────────────

import { NOMBRE_PORTAL, NOMBRE_CORTO } from "./portalMarca";

// ── Las cuatro etapas del método ────────────────────────────────────────────
// El titular de marca: "Tu proceso, por etapas."
export const ETAPAS_METODO = [
  {
    id: "admision",
    n: "01",
    hito: "Admisión",
    icono: "birrete",
    tono: "primary",
    titulo: "Buscamos, postulamos y te matriculamos",
    resumen:
      "Diagnóstico de perfil, informe de viabilidad, centros oficiales aptos para visado, CV europeo, cartas de motivación y postulación directa a las universidades.",
    entregables: [
      "Análisis de perfil e informe de viabilidad académica",
      "Informe de centros oficiales, con precios y notas de corte",
      "CV europeo, carta de motivación y equivalencia de notas",
      "Postulación directa y seguimiento hasta la vacante",
      "Asesoría en la matrícula y en la carta de admisión",
    ],
    pagas: "50% al iniciar + 50% a los dos meses",
    duracion: "De 2 a 6 meses, según convocatoria",
  },
  {
    id: "carta",
    n: "02",
    hito: "Carta",
    icono: "documento",
    tono: "sky",
    titulo: "La carta de admisión cambia el tablero",
    resumen:
      "Con la carta en la mano decidimos tu vía migratoria: visado desde tu país o estancia por estudios ya en España. No antes: antes sería adivinar.",
    entregables: [
      "Revisión de la carta y de la matrícula antes de moverla",
      "Verificación de que el centro es apto para el visado",
      "Elección de vía según tu consulado, tus plazos y tu caso",
      "Calendario real de presentación, hacia atrás desde el día de clases",
    ],
    pagas: "Nada nuevo: es el punto de decisión",
    duracion: "La semana en que llega la carta",
  },
  {
    id: "visado",
    n: "03",
    hito: "Visado",
    icono: "pasaporte",
    tono: "accent",
    titulo: "Tu expediente migratorio, blindado",
    resumen:
      "Solvencia económica, seguro médico, antecedentes, formularios y declaraciones juradas. Presentamos ante el consulado o, si ya estás en España, ante Extranjería vía MERCURIO.",
    entregables: [
      "Diagnóstico legal y estrategia de solvencia según el IPREM",
      "Todas las declaraciones juradas que exija tu caso",
      "Revisión y preparación de todos los documentos",
      "Gestión de la cita consular y guía de qué llevar",
      "Subsanaciones y seguimiento hasta la resolución",
    ],
    pagas: "Al recibir la carta de admisión",
    duracion: "Entre 1 y 2 meses de resolución",
  },
  {
    id: "llegada",
    n: "04",
    hito: "Llegada",
    icono: "casa",
    tono: "sun",
    titulo: "Aterrizas y sigues acompañado",
    resumen:
      "El visado no es la meta. Al llegar hay que empadronarse y sacar la TIE en plazo — y las citas son el cuello de botella real de todo el proceso.",
    entregables: [
      "Cita de empadronamiento en tu ayuntamiento",
      "Cita de toma de huellas y tramitación de la TIE",
      "Guía para abrir cuenta bancaria y activar el seguro",
      "Checklist de qué llevar a cada cita",
    ],
    pagas: "Solo cuando la visa ya está aprobada",
    duracion: "Primeras semanas en España",
  },
];

// ── El punto de partida: la sesión diagnóstico ──────────────────────────────
// Es el único servicio que se contrata a ciegas. Todo lo demás se cotiza
// después, con el caso ya sobre la mesa.
export const SESION_DIAGNOSTICO = {
  nombre: "Sesión diagnóstico",
  duracion: "30 minutos",
  precio: 25,
  precioTexto: "25 €",
  precioAlt: "S/ 100 · 28 US$",
  icono: "balanza",
  gancho: "Antes de cobrarte un paquete, te decimos si tu caso es viable.",
  incluye: [
    "Diagnóstico jurídico de tu caso con un abogado especialista",
    "Requisitos, plazos y medios económicos de tu consulado",
    "Definimos tu vía: visado, estancia por estudios u otra",
    "Plan de acción escrito con próximos pasos y documentos",
  ],
};

// ── Etapa 1 · Paquete Máster ────────────────────────────────────────────────
// Todos los planes incluyen exactamente lo mismo; lo único que cambia es la
// cobertura geográfica y cuántos másteres se pueden postular.
export const MASTER_INCLUYE = [
  "Búsqueda personalizada de centros oficiales",
  "Evaluación de precios y notas de corte",
  "Filtramos los requisitos según tu perfil y el máster",
  "Garantizamos que el centro es apto para el visado de estudios",
  "Revisión y ajuste de los documentos requeridos",
  "Postulación directa a másteres por universidad",
  "Seguimiento personalizado hasta obtener la vacante",
  "Asesoría para la matrícula y la carta de admisión",
];

export const LISTAS_MASTER = [
  {
    id: "economicas",
    nombre: "Comunidades económicas",
    etiqueta: "Lista 1",
    tono: "primary",
    desde: 219,
    comunidades:
      "Andalucía, Cantabria, Asturias, Castilla-La Mancha, Galicia y Castilla y León",
    nota: "Las matrículas públicas más asequibles de España.",
    planes: [
      {
        id: "l1-a",
        nombre: "Plan A",
        precio: 219,
        alcance: "Solo Andalucía",
        detalle:
          "Hasta 6 másteres entre las 10 universidades públicas andaluzas: Almería, Cádiz, Córdoba, Granada, Huelva, Internacional de Andalucía, Jaén, Málaga, Pablo de Olavide y Sevilla.",
      },
      {
        id: "l1-basico",
        nombre: "Plan Básico",
        precio: 249,
        alcance: "Una de tres comunidades",
        detalle:
          "Sin límite de másteres ni universidades en Cantabria, Asturias o Castilla-La Mancha.",
      },
      {
        id: "l1-comfort",
        nombre: "Plan Comfort",
        precio: 279,
        alcance: "Galicia y/o Castilla y León",
        detalle:
          "Sin límite de másteres ni universidades en esas dos comunidades: 7 universidades.",
      },
      {
        id: "l1-full",
        nombre: "Plan Full Económico",
        precio: 359,
        alcance: "Las seis comunidades económicas",
        detalle:
          "Más de 20 universidades públicas: Andalucía, Cantabria, Asturias, Castilla-La Mancha, Galicia y Castilla y León.",
        destacado: true,
      },
    ],
  },
  {
    id: "intermedias",
    nombre: "Comunidades intermedias",
    etiqueta: "Lista 2",
    tono: "sky",
    desde: 219,
    comunidades:
      "La Rioja, País Vasco, Murcia, Extremadura, Aragón y Comunidad Valenciana",
    nota: "Universidades con mucha demanda internacional y buen equilibrio precio-ranking.",
    planes: [
      {
        id: "l2-a",
        nombre: "Plan A",
        precio: 219,
        alcance: "Una comunidad",
        detalle:
          "Sin límite de másteres en La Rioja, País Vasco, Murcia, Extremadura o Aragón.",
      },
      {
        id: "l2-basico",
        nombre: "Plan Básico Full",
        precio: 249,
        alcance: "Tres comunidades",
        detalle:
          "Sin límite de másteres ni universidades en tres comunidades a elegir de la lista.",
      },
      {
        id: "l2-comfort",
        nombre: "Plan Comfort",
        precio: 279,
        alcance: "Comunidad Valenciana",
        detalle:
          "Sin límite de másteres ni universidades: más de 6 universidades valencianas.",
      },
      {
        id: "l2-full",
        nombre: "Plan Full",
        precio: 349,
        alcance: "Las seis comunidades intermedias",
        detalle:
          "Más de 11 universidades públicas: La Rioja, País Vasco, Murcia, Extremadura, Aragón y Comunidad Valenciana.",
        destacado: true,
      },
    ],
  },
  {
    id: "premium",
    nombre: "Universidades premium",
    etiqueta: "Lista 3",
    tono: "accent",
    desde: 219,
    comunidades: "Cataluña y Madrid, públicas y privadas",
    nota: "Las universidades con mejor posición en los rankings internacionales.",
    planes: [
      {
        id: "l3-a",
        nombre: "Plan A",
        precio: 219,
        alcance: "Una universidad",
        detalle:
          "Sin límite de másteres dentro de una universidad de Cataluña o Madrid, pública o privada.",
      },
      {
        id: "l3-basico",
        nombre: "Plan Básico Full",
        precio: 249,
        alcance: "Cinco universidades",
        detalle: "Sin límite de másteres en 5 universidades de Cataluña y/o Madrid.",
      },
      {
        id: "l3-comfort",
        nombre: "Plan Comfort",
        precio: 310,
        alcance: "Madrid o Cataluña, completa",
        detalle:
          "Sin límite de másteres ni universidades en una de las dos comunidades.",
      },
      {
        id: "l3-full",
        nombre: "Plan Full",
        precio: 450,
        alcance: "Madrid y Cataluña",
        detalle:
          "Más de 16 universidades públicas: todas las de Madrid y todas las de Cataluña.",
        destacado: true,
      },
    ],
  },
];

// Planes avanzados: cruzan listas. Se venden por cobertura, no por región.
export const PLANES_AVANZADOS = [
  {
    id: "premium-700",
    nombre: "Paquete Premium",
    precio: 700,
    icono: "estrella",
    tono: "primary",
    resumen: "El punto medio entre libertad y eficiencia.",
    alcance: [
      "Hasta 6 comunidades autónomas a elegir",
      "Hasta más de 45 universidades a postular",
      "Sin límite de listas: mezclas económicas y premium",
      "Públicas y privadas",
    ],
    para: [
      "Quieres postular a másteres muy específicos, no a una lista fija",
      "Necesitas plaza sí o sí para cumplir plazos de visado o beca",
      "Buscas combinar regiones económicas con universidades de prestigio",
    ],
  },
  {
    id: "infinity-1100",
    nombre: "Paquete Infinity",
    precio: 1100,
    icono: "destello",
    tono: "accent",
    resumen: "Para quienes no quieren límites ni margen de error.",
    alcance: [
      "Las 17 comunidades españolas",
      "Sin límite de universidades ni de másteres",
      "Públicas y privadas, incluidas las de mejor ranking",
      "Máxima cobertura: Cataluña, Madrid, Valencia y el resto",
    ],
    para: [
      "Sí o sí necesitas migrar pronto: visado, familia o urgencia laboral",
      "No puedes arriesgarte a quedarte sin plaza y quieres planes de respaldo",
      "Postulas a convocatorias exigentes: Fundación Carolina, AUIP, Erasmus+ o Generación Bicentenario",
      "Necesitas una estrategia acelerada para tener carta cuanto antes",
    ],
  },
];

// ── Etapa 3 · Vía migratoria ────────────────────────────────────────────────
// Dos caminos que llevan al mismo permiso. El que te toque depende de dónde
// empieces el trámite, no de cuánto quieras gastar.
export const PLANES_VISADO = [
  {
    id: "visado-base",
    nombre: "Asesoría Base",
    subtitulo: "Validación económica",
    precio: 109,
    icono: "euro",
    tono: "sky",
    incluye: [
      "Validación de tu solvencia económica",
      "Declaración Jurada de Solvencia Económica",
    ],
    para: "Ya preparas tú el expediente y solo necesitas asegurar la parte que más se deniega.",
  },
  {
    id: "visado-parcial",
    nombre: "Asesoría Parcial",
    subtitulo: "Acompañamiento completo, sin cita ni recurso",
    precio: 180,
    icono: "escudo",
    tono: "primary",
    incluye: [
      "Todas las declaraciones juradas que necesite tu expediente",
      "Diagnóstico legal y estrategia personalizada",
      "Revisión y preparación de TODOS tus documentos",
      "Asesoría en formularios y diligenciamiento",
      "Asesoría en seguro médico internacional",
      "Revisión general final antes de presentar",
    ],
    para: "Te mueves bien con las citas de tu consulado, pero no quieres jugártela con el expediente.",
  },
  {
    id: "visado-integral",
    nombre: "Asesoría Integral",
    subtitulo: "Acompañamiento total, de principio a fin",
    precio: 250,
    icono: "estrella",
    tono: "accent",
    destacado: true,
    incluye: [
      "Todo lo del paquete Parcial",
      "Cita consular: gestión y agendamiento",
      "Recurso de reposición en caso de denegación",
      "Subsanaciones y apelaciones durante todo el proceso",
    ],
    para: "Es el que recomendamos: cubre la cita y también el escenario que nadie quiere nombrar.",
  },
];

export const ESTANCIA_ESTUDIOS = {
  id: "estancia",
  nombre: "Estancia por Estudios",
  subtitulo: "Ya estás en España o vas a entrar como turista",
  precio: 350,
  icono: "laptop",
  incluye: [
    "Asesoría jurídica personalizada para entrar como turista y modificar tu situación",
    "Presentación del expediente vía MERCURIO, con firma digital del abogado",
    "100 % online: sin citas presenciales, sin colas",
    "Modelos oficiales: formulario, declaraciones juradas y cartas",
    "Guía para abrir cuenta bancaria, empadronarte y contratar el seguro médico válido",
    "Requerimientos y subsanaciones hasta la resolución",
  ],
  para: [
    "Tienes carta de admisión oficial reciente y entrarás como turista",
    "No lograste el visado en tu consulado y buscas una vía legal alternativa",
  ],
  noIncluye: [
    "Tasa administrativa de 11 €, que se paga directamente a Extranjería",
    "Recurso de reposición y recursos contencioso-administrativos",
  ],
  permiso: "Incluye permiso para trabajar hasta 30 horas semanales.",
};

// ── Etapa 4 · Citas en España ───────────────────────────────────────────────
export const CITAS_ESPANA = [
  {
    id: "empadronamiento",
    nombre: "Cita de empadronamiento",
    precio: 25,
    icono: "casa",
    detalle:
      "Gestión y reserva de la cita en tu ayuntamiento. Es el papel del que cuelgan casi todos los demás trámites.",
  },
  {
    id: "tie",
    nombre: "Cita de huellas / TIE",
    precio: 50,
    icono: "huella",
    detalle:
      "Gestión y reserva de la cita de toma de huellas, con el EX-17 y la tasa 790-012. La disponibilidad es el cuello de botella real del proceso.",
  },
];

// ── Lo que no cobramos nosotros ─────────────────────────────────────────────
// Va en la landing a propósito: quien conoce el costo total no se echa atrás
// a mitad del proceso.
export const GASTOS_EXTERNOS = [
  {
    icono: "birrete",
    nombre: "Matrícula del máster",
    importe: "Desde 730 € / año",
    nota: "Depende del programa y de la universidad.",
  },
  {
    icono: "documento",
    nombre: "Apostillas",
    importe: "75 € aprox.",
    nota: "Según tu país y el número de documentos.",
  },
  {
    icono: "bandera",
    nombre: "Tasa consular",
    importe: "100 € aprox.",
    nota: "La fija cada consulado; se paga el día de la cita.",
  },
  {
    icono: "escudo",
    nombre: "Seguro médico",
    importe: "560 € aprox.",
    nota: "Cobertura anual sin copagos, obligatoria para el visado.",
  },
  {
    icono: "maletin",
    nombre: "Certificados médicos y de antecedentes",
    importe: "100 € aprox.",
    nota: "Certificado médico, antecedentes penales y otros documentos.",
  },
  {
    icono: "casa",
    nombre: "Alquiler de piso o habitación",
    importe: "Desde 200 € / mes",
    nota: "Sujeto a la ciudad y a las condiciones del contrato.",
  },
];

// ── Por qué el método aguanta ───────────────────────────────────────────────
export const RAZONES_METODO = [
  {
    icono: "brujula",
    titulo: "Solo asumimos casos viables",
    texto:
      "Si tu vía no es la correcta te lo decimos en la sesión diagnóstico, antes de que pagues un paquete.",
  },
  {
    icono: "balanza",
    titulo: "Abogados colegiados, no gestores",
    texto:
      "Tu expediente lo firma un abogado especializado en extranjería española.",
  },
  {
    icono: "laptop",
    titulo: `${NOMBRE_CORTO} y app propios, no un chat`,
    texto:
      `Tu expediente vive en el ${NOMBRE_PORTAL}: checklist de documentos revisado por tu asesor, tus plazos a la vista y mensajes con constancia de lectura.`,
  },
  {
    icono: "destello",
    titulo: "Procesos 100 % digitales",
    texto:
      "Presentación telemática con firma digital vía MERCURIO: sin colas ni desplazamientos.",
  },
];

export const CIFRAS_METODO = [
  { valor: 98, sufijo: " %", etiqueta: "admitidos a másteres oficiales" },
  { valor: 45, prefijo: "+", etiqueta: "universidades públicas españolas" },
  { valor: 4, etiqueta: "etapas, cada una con su propio pago" },
];

// ── Utilidades ──────────────────────────────────────────────────────────────
export const eur = (n) =>
  `${Number(n).toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;

/** Todos los planes de máster en una sola lista, para el simulador. */
export const TODOS_PLANES_MASTER = [
  ...LISTAS_MASTER.flatMap((l) =>
    l.planes.map((p) => ({ ...p, lista: l.nombre, etiquetaLista: l.etiqueta }))
  ),
  ...PLANES_AVANZADOS.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    alcance: p.resumen,
    detalle: p.alcance.join(" · "),
    lista: "Planes avanzados",
    etiquetaLista: "Avanzado",
  })),
];

/** Vías migratorias en una sola lista, para el simulador. */
export const TODAS_VIAS = [
  ...PLANES_VISADO.map((v) => ({
    id: v.id,
    nombre: `Visado · ${v.nombre}`,
    precio: v.precio,
    detalle: v.subtitulo,
  })),
  {
    id: ESTANCIA_ESTUDIOS.id,
    nombre: `Estancia por estudios`,
    precio: ESTANCIA_ESTUDIOS.precio,
    detalle: ESTANCIA_ESTUDIOS.subtitulo,
  },
];

// ── Preguntas que llegan siempre ────────────────────────────────────────────
export const FAQ_METODO = [
  {
    q: "¿Tengo que pagarlo todo de una vez?",
    a: "No, y ese es justamente el método. El paquete de máster se divide en dos pagos: el 50 % al iniciar y el otro 50 % a los dos meses. La asesoría de visado o estancia se paga cuando ya tienes la carta de admisión en la mano. Y las citas de empadronamiento y TIE, solo cuando tu visa ya está aprobada.",
  },
  {
    q: "¿Y si no consigo la admisión?",
    a: "No garantizamos la admisión: la decide la universidad, no nosotros. Lo que sí hacemos es no abrir la siguiente etapa hasta que la anterior dio resultado — si no hay carta, no pagas la asesoría de visado. Por eso los planes con más cobertura existen: más universidades postuladas, más planes de respaldo.",
  },
  {
    q: "¿Por qué la sesión diagnóstico se paga aparte?",
    a: "Porque es lo único que se contrata sin conocer tu caso. En esos 30 minutos un abogado revisa tu perfil, tus plazos y tu consulado, y sale de ahí un plan de acción concreto. Si tu caso no es viable, te lo decimos ahí y no te vendemos un paquete.",
  },
  {
    q: "¿Cuál es la diferencia entre visado y estancia por estudios?",
    a: "Llevan al mismo permiso de estudiante, pero se piden desde sitios distintos. El visado se solicita en el consulado de tu país y viajas con él ya en el pasaporte. La estancia por estudios se solicita estando en España, dentro de tu plazo como turista, y se presenta telemáticamente ante Extranjería. Cuál te toca lo definimos en la sesión diagnóstico.",
  },
  {
    q: "¿Los precios de los planes incluyen las tasas?",
    a: "No. Los planes cubren nuestro trabajo de asesoría y gestión. Las tasas de postulación, la matrícula, las apostillas, la tasa consular, el seguro médico y los certificados se pagan aparte y directamente a cada organismo. Los tienes listados arriba con importes referenciales para que hagas tus cuentas completas.",
  },
  {
    q: "¿Puedo trabajar mientras estudio?",
    a: "Sí. El permiso de estudios habilita a trabajar hasta 30 horas semanales, compatibilizando la formación con una actividad laboral.",
  },
];
