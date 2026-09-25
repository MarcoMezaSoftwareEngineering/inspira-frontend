// src/pages/blog/blog.data.js
// Entradas del blog. Cada post es contenido estático versionado en el repo:
// para publicar una entrada nueva basta con añadir un objeto aquí.
// `content` es una lista de bloques: h2 (subtítulo), p (párrafo), ul (lista).

// Firma por defecto de las entradas. Para firmar una entrada con otra
// persona, añade `autor: { ... }` en ese post concreto.
export const AUTOR_POR_DEFECTO = {
  nombre: "Carina Meza",
  cargo: "Abogada asociada · Extranjería española",
  iniciales: "CM",
};

export const POSTS = [
  {
    // La guía que Google no encontraba (Marco, 25/09/2026): la búsqueda
    // «estancia por estudios abogados españa» citaba a otros despachos porque
    // Inspira no tenía una página que respondiera, punto por punto, a lo que se
    // pregunta. Cada cifra sale de config (IPREM, plazos, tasas) o de las
    // resoluciones reales de 2026 (config/casosEstancia.js). Referencias
    // legales: las que citan esas mismas resoluciones.
    slug: "estancia-por-estudios-espana-requisitos-plazos",
    titulo: "Estancia por estudios en España en 2026: requisitos, plazos, cuánto tarda y cómo se presenta",
    extracto:
      "La guía completa de la autorización de estancia por estudios: quién puede pedirla desde España, los documentos, el dinero (IPREM), los 90 días, cuánto tarda Extranjería, el permiso de trabajo de 30 horas, la TIE y la prórroga. Con datos de expedientes resueltos en 2026.",
    fecha: "2026-09-25",
    actualizado: "2026-09-25",
    categoria: "Extranjería",
    minutos: 9,
    novedad: true,
    content: [
      { type: "p", text: "Si vas a estudiar en España más de 90 días necesitas una autorización de estancia por estudios. Se puede pedir de dos maneras: con un visado desde el consulado de tu país, o directamente en España, ante la Oficina de Extranjería, si has entrado como turista y todavía estás en plazo. Esta guía explica la segunda vía —la estancia por estudios presentada desde España— con lo que exige la normativa y con lo que vemos en los expedientes que presentamos cada semana." },
      { type: "nota", text: "Normativa que la regula: Ley Orgánica 4/2000, de 11 de enero, y su Reglamento, el Real Decreto 1155/2024, de 19 de noviembre (artículos 35 y 53 para los requisitos, 57 para el trabajo, 193 para la competencia y 197.2.a para la prórroga). Son los artículos que citan las propias resoluciones de las Delegaciones del Gobierno." },

      { type: "h2", text: "Qué es la estancia por estudios y para quién es" },
      { type: "p", text: "Es la autorización que permite a un extranjero no comunitario permanecer en España para cursar estudios a tiempo completo en un centro autorizado: un máster oficial, un grado, formación profesional o un programa de investigación. No es una residencia —no computa para la nacionalidad— pero sí permite trabajar y, al terminar, pasar a residente." },
      { type: "p", text: "Puede pedirla desde España quien ya está aquí en situación regular (normalmente como turista, con los 90 días del espacio Schengen) y tiene una carta de admisión de un centro reconocido. Si todavía estás en tu país, la vía es el visado de estudios en el consulado; el permiso es el mismo, cambia dónde se presenta y cómo se acredita el dinero." },

      { type: "h2", text: "Requisitos principales" },
      { type: "ul", items: [
        "Admisión en un centro de enseñanza autorizado, a tiempo completo, en un programa oficial o reconocido (carta de admisión o matrícula reciente).",
        "Medios económicos: el 100 % del IPREM por cada mes de estancia, es decir, 600 € al mes y 7.200 € para un curso completo, acreditados con un extracto sellado de una cuenta a tu nombre.",
        "Seguro médico con cobertura equivalente a la sanidad pública española durante toda la estancia: sin copagos ni periodos de carencia.",
        "Pasaporte en vigor y, si entraste como turista, estar todavía en plazo: la solicitud se presenta dentro de esos 90 días.",
        "Certificado de antecedentes penales de los países donde hayas residido en los últimos cinco años, apostillado (para estancias de más de seis meses).",
        "Certificado médico en impreso oficial, con la fórmula sobre el Reglamento Sanitario Internacional de 2005 (para estancias de más de seis meses).",
        "Formulario oficial y pago de la tasa de la solicitud (11 €).",
      ] },

      { type: "h2", text: "Cuánto dinero hay que demostrar" },
      { type: "p", text: "La regla es el 100 % del IPREM mensual por cada mes que dure la estancia: 600 € al mes en 2026, 7.200 € para un curso de doce meses. Extranjería no exige el historial de seis meses ni justificar el origen del dinero, que es lo que piden los consulados; lo que quiere ver es el saldo en una cuenta abierta en España a tu nombre, en un extracto emitido y sellado por la oficina, con fecha reciente. Una captura de la app del banco no vale." },

      { type: "h2", text: "Cuánto tiempo dura la estancia por estudios" },
      { type: "p", text: "La autorización se concede por la duración de los estudios: normalmente el curso académico completo y, en los másteres de dos años, hasta el final del segundo curso. Después se prorroga cada año mientras sigas matriculado y cumpliendo los requisitos. Ejemplos de resoluciones de 2026 de nuestros asesorados: una autorización inicial en Sevilla válida hasta el 30 de noviembre de 2027; dos en Valencia, para un máster de dos años en la Universitat Politècnica, válidas hasta el 15 de septiembre de 2028; una prórroga en Alicante por un año más, hasta el 15 de julio de 2027." },
      { type: "p", text: "La prórroga se pide antes de que caduque la autorización, con la matrícula del curso siguiente y el aprovechamiento de los estudios, y solo puede presentarse por vía telemática (sede MERCURIO), como recuerdan las propias resoluciones al citar el artículo 197.2.a del Reglamento." },

      { type: "h2", text: "Cuánto tarda Extranjería en resolver" },
      { type: "p", text: "El plazo habitual va de uno a tres meses desde la presentación, y depende de la oficina y de la época. Con nuestros expedientes de 2026: dos días en Sevilla, veintiséis días en Madrid, alrededor de un mes en Valencia y sesenta y nueve días una prórroga en Alicante. Son datos de casos reales, no una promesa: cada oficina lleva su ritmo, y por eso conviene presentar con margen." },

      { type: "h2", text: "Plazos: los 90 días y los dos meses de antelación" },
      { type: "p", text: "Si entraste como turista tienes 90 días de estancia regular, y la solicitud tiene que presentarse dentro de ellos. Además, Extranjería la quiere con dos meses de antelación al inicio de las clases; con menos margen se presenta igual, pero acompañada de un escrito de excepcionalidad que explique por qué. La cuenta práctica es: fecha de llegada + 90 días − dos meses = tu último día para presentar con tranquilidad. Entre abrir la cuenta, empadronarte, reunir los documentos y presentar suelen pasar semanas, así que lo sensato es llegar con casi todo listo." },
      { type: "enlace", href: "/estancia", texto: "Calcula tu último día para presentar con tu fecha de entrada" },

      { type: "h2", text: "Cómo se presenta: paso a paso" },
      { type: "ol", items: [
        "Diagnóstico: comprobar que tu centro y tu carta sirven para la estancia y que llegas en plazo.",
        "Cuenta bancaria en España a tu nombre con el importe del IPREM, y extracto sellado en la oficina.",
        "Empadronamiento y seguro médico sin copagos ni carencias.",
        "Antecedentes penales apostillados y certificado médico en impreso oficial.",
        "Presentación telemática: si te representa un abogado, se presenta en la sede electrónica MERCURIO con su firma digital, sin cita ni colas. El sistema devuelve un justificante con el número de registro (empieza por I…) y la fecha de entrada.",
        "Seguimiento: el estado se consulta en la sede electrónica con el número de registro, el año de nacimiento y la fecha de entrada; cuando la oficina asigna el número de expediente, se sigue con él. Si Extranjería pide algo (requerimiento), hay un plazo corto para contestar.",
        "Resolución y TIE: concedida la estancia, hay que pedir la Tarjeta de Identidad de Extranjero en el plazo de un mes (artículo 4.2 de la LO 4/2000), con cita en la Policía Nacional, la tasa 790 código 012 (16,08 €), una fotografía y el certificado de empadronamiento.",
      ] },

      { type: "h2", text: "¿Se puede trabajar con la estancia por estudios?" },
      { type: "p", text: "Sí. El artículo 57 del Reglamento permite trabajar por cuenta propia o ajena mientras la actividad sea compatible con los estudios, sin superar las treinta horas semanales y, durante el periodo lectivo, dentro de la provincia donde estudias. No hace falta pedir un permiso aparte: viene con la autorización, y las resoluciones lo dicen expresamente («Autoriza a trabajar»)." },

      { type: "h2", text: "Por qué se deniega, y cómo se evita" },
      { type: "ul", items: [
        "Extracto que no vale: captura de pantalla, PDF sin sello, cuenta que no es española o saldo por debajo de 7.200 €.",
        "Certificado médico en papel de la clínica, sin el impreso oficial ni la frase del Reglamento Sanitario Internacional.",
        "Presentar fuera de los 90 días, o con menos de dos meses de antelación y sin escrito de excepcionalidad.",
        "Carta de admisión condicional, antigua, de un título propio o de un centro no apto.",
        "Seguro de viaje o con copagos.",
        "Requerimiento sin contestar en plazo: el expediente se archiva.",
      ] },
      { type: "p", text: "Si la resolución es desfavorable, cabe recurso potestativo de reposición en el plazo de un mes ante el mismo órgano, o recurso contencioso-administrativo en dos meses ante el Juzgado de lo Contencioso-Administrativo de la provincia. El plazo se cuenta desde el día siguiente a la notificación." },

      { type: "h2", text: "¿Hace falta un abogado?" },
      { type: "p", text: "No es obligatorio: la solicitud puede presentarla la propia persona. Lo que aporta un abogado que te representa es presentar por vía telemática con su firma digital —sin cita, con registro de fecha y hora—, recibir las notificaciones de Extranjería en su casilla electrónica y contestar los requerimientos dentro del plazo, y sobre todo que el expediente entre completo y bien fundamentado a la primera. En un procedimiento donde los plazos son cortos y los errores de forma se pagan con una denegación, es la diferencia entre presentar y presentar bien." },
      { type: "enlace", href: "/estancia", texto: "Cómo lo hacemos en Inspira: presentación con firma digital vía MERCURIO, 350 €" },

      { type: "h2", text: "Estancia por estudios o visado de estudios: cuál te conviene" },
      { type: "p", text: "Las dos vías llevan al mismo permiso. El visado se pide en el consulado de tu país, exige extractos de los últimos seis meses y el origen lícito del dinero, y llegas a España con todo resuelto. La estancia se pide desde España, dentro de tus 90 días, y Extranjería se conforma con el saldo en una cuenta española. Si aún estás en tu país y puedes acreditar el dinero como lo pide el consulado, el visado te ahorra vivir el trámite a contrarreloj; si ya estás aquí o tu dinero entró hace poco, la estancia encaja mejor." },
      { type: "enlace", href: "/visa-o-estancia", texto: "Test de cinco preguntas: ¿visado o estancia?" },

      { type: "h2", text: "Preguntas frecuentes" },
      { type: "faq", items: [
        { q: "¿Cuánto tiempo dura la estancia por estudios en España?", a: "Lo que duren los estudios: se concede por el curso (o por los dos cursos de un máster de dos años) y se prorroga cada año mientras sigas matriculado. En 2026 hemos visto autorizaciones iniciales válidas hasta noviembre de 2027 y hasta septiembre de 2028, y prórrogas de un año." },
        { q: "¿Cómo conseguir la estancia por estudios en España?", a: "Con una carta de admisión de un centro autorizado, entrando a España en situación regular (por ejemplo como turista), abriendo una cuenta con el importe del IPREM y presentando la solicitud dentro de los 90 días y con dos meses de antelación al inicio de clases. Se presenta ante la Oficina de Extranjería de la provincia donde vas a estudiar; con un abogado, por vía telemática." },
        { q: "¿Cuánto tarda Extranjería en resolver una estancia por estudios?", a: "Entre uno y tres meses, según la oficina y la época. En nuestros expedientes de 2026: dos días en Sevilla, veintiséis días en Madrid, alrededor de un mes en Valencia y sesenta y nueve días una prórroga en Alicante." },
        { q: "¿Cuánto dinero hay que demostrar para la estancia por estudios?", a: "El 100 % del IPREM por mes de estancia: 600 € al mes, 7.200 € para un curso completo, en una cuenta española a tu nombre acreditada con un extracto sellado. No se exige el historial de seis meses ni el origen del dinero que piden los consulados." },
        { q: "¿Puedo trabajar con la estancia por estudios?", a: "Sí: hasta treinta horas semanales, por cuenta propia o ajena, mientras sea compatible con los estudios (artículo 57 del Reglamento de Extranjería). Viene con la autorización, sin trámite aparte." },
        { q: "¿Se puede pedir la estancia por estudios desde España sin visado?", a: "Sí, si has entrado en situación regular —como turista, con tus 90 días— y presentas la solicitud dentro de ese plazo con la carta de admisión y el resto de requisitos." },
        { q: "¿Qué pasa si presento con menos de dos meses de antelación?", a: "Se puede presentar igual, adjuntando un escrito de excepcionalidad que explique por qué se hace con menos margen. Lo que no se puede es presentar fuera de los 90 días de estancia regular." },
        { q: "¿Qué hago si me deniegan la estancia por estudios?", a: "Cabe recurso de reposición en un mes ante el mismo órgano o recurso contencioso-administrativo en dos meses. Conviene revisar el motivo concreto de la denegación: la mayoría son de forma (extracto, seguro, certificado médico) y se pueden corregir." },
        { q: "¿La estancia por estudios cuenta para la nacionalidad española?", a: "No: la estancia por estudios no computa como residencia. Al terminar los estudios puedes pasar de estudiante a residente, y es desde ese momento cuando empieza a contar el tiempo para la nacionalidad. El doctorado es la excepción: desde 2025 se tramita como residencia." },
        { q: "¿Necesito un abogado para la estancia por estudios?", a: "No es obligatorio. Con un abogado que te representa, la solicitud se presenta por vía telemática (MERCURIO) con su firma digital, sin cita, y las notificaciones y requerimientos llegan a su casilla electrónica para contestarlos en plazo." },
      ] },
    ],
  },
  {
    slug: "residencia-doctorado-espana-nacionalidad",
    titulo: "Nuevo: el doctorado en España ya es residencia — y cuenta para la nacionalidad",
    extracto:
      "Cambio importante para investigadores latinoamericanos: la vía del doctorado dejó de ser una simple estancia por estudios y pasó a ser residencia, con todo lo que eso implica.",
    fecha: "2026-08-24",
    categoria: "Extranjería",
    minutos: 5,
    novedad: true,
    content: [
      { type: "p", text: "Es una de las noticias más relevantes del año para quienes vienen a investigar a España, y sorprendentemente poca gente la conoce todavía: cursar un doctorado en España ya no te deja en una simple estancia por estudios. Ahora califica como residencia." },
      { type: "h2", text: "¿Por qué importa tanto esta diferencia?" },
      { type: "p", text: "Durante años, el gran problema de estudiar en España era que el tiempo no contaba. La estancia por estudios NO computa para solicitar la nacionalidad española: podías pasar cinco años estudiando y llegar al final con el contador en cero. Por eso muchos estudiantes hacían primero la modificación a residencia, y solo desde ahí empezaban a sumar." },
      { type: "h2", text: "Qué cambia con la residencia para doctorado" },
      { type: "ul", items: [
        "El tiempo de tu doctorado computa como residencia legal en España.",
        "Ese cómputo cuenta para la nacionalidad española por residencia.",
        "Para latinoamericanos, el plazo de nacionalidad es de solo 2 años, no 10.",
        "Mejores condiciones de permanencia y de acceso al mercado laboral que la estancia ordinaria.",
        "Posibilidad de autorización para cónyuge e hijos.",
      ] },
      { type: "h2", text: "La cuenta que conviene hacer" },
      { type: "p", text: "Si eres latinoamericano y tu doctorado dura tres o cuatro años, el propio programa puede cubrir de sobra los dos años de residencia legal que la ley exige a los iberoamericanos para pedir la nacionalidad. Es decir: terminas tu doctorado y, cumpliendo el resto de requisitos, puedes estar en condiciones de solicitar el pasaporte español." },
      { type: "h2", text: "Qué hay que hacer bien desde el principio" },
      { type: "p", text: "La clave está en tramitar la vía correcta desde el inicio. Presentar el expediente como estancia por estudios cuando podrías haber accedido a la residencia para doctorado significa perder años de cómputo — y eso, después, no se recupera. En la asesoría diagnóstica revisamos tu carta de admisión, tu programa y tu financiación para determinar exactamente qué vía te corresponde." },
      { type: "p", text: "Si estás admitido a un programa de doctorado en España, o lo estás considerando, conviene revisar tu caso antes de presentar nada." },
    ],
  },
  {
    slug: "visa-estudios-vs-estancia-por-estudios",
    titulo: "Visa de Estudios vs. Estancia por Estudios: mismo permiso, distinto proceso",
    extracto:
      "Las dos vías llevan al mismo permiso para estudiar en España, pero se tramitan en lugares distintos y con tiempos distintos. Te explicamos cuál conviene según tu situación.",
    fecha: "2026-08-24",
    categoria: "Extranjería",
    minutos: 6,
    content: [
      { type: "p", text: "Si quieres estudiar en España más de 90 días necesitas una autorización de estancia por estudios. Lo que casi nadie te explica es que hay dos caminos para conseguirla, y elegir bien puede ahorrarte meses y mucho estrés." },
      { type: "h2", text: "Opción 1: Visa de Estudios (desde tu país)" },
      { type: "p", text: "Es la vía clásica: presentas tu solicitud ante el consulado español de tu país con la carta de admisión de tu centro de estudios, seguro médico, medios económicos y antecedentes penales apostillados. El consulado resuelve normalmente en 1 a 2 meses y viajas a España ya con tu visado pegado en el pasaporte." },
      { type: "ul", items: [
        "Se tramita ante el consulado español de tu país de residencia.",
        "Necesitas antecedentes penales y certificado médico apostillados.",
        "Entras a España con el estatus de estudiante ya resuelto.",
      ] },
      { type: "h2", text: "Opción 2: Estancia por Estudios (ya en España)" },
      { type: "p", text: "La segunda vía consiste en entrar a España como turista (los latinoamericanos de la mayoría de países no necesitan visado para estancias cortas) y, estando en situación regular, presentar la solicitud de estancia por estudios ante la Oficina de Extranjería. Debes presentarla con suficiente antelación y cumplir requisitos equivalentes." },
      { type: "ul", items: [
        "Se tramita ante extranjería, ya estando en España.",
        "Evitas la cita consular, que en algunos países tarda meses.",
        "Requiere planificar bien los plazos: hay ventanas concretas para presentar.",
      ] },
      { type: "h2", text: "¿Cuál te conviene?" },
      { type: "p", text: "Depende de tus tiempos, de la carga de tu consulado y de cuándo empieza tu programa. En una primera asesoría revisamos tu calendario académico, tu situación documental y te decimos con claridad cuál de los dos procesos maximiza tus probabilidades." },
    ],
  },
  {
    slug: "residencia-nomada-digital-espana",
    titulo: "Residencia de Nómada Digital en España: requisitos reales en 2026",
    extracto:
      "Trabajar en remoto desde España legalmente es posible con la residencia de nómada digital. Es un proceso rápido, pero con requisitos exigentes. Esto es lo que de verdad piden.",
    fecha: "2026-08-24",
    categoria: "Extranjería",
    minutos: 5,
    content: [
      { type: "p", text: "La Ley de Startups abrió la puerta a que teletrabajadores de empresas extranjeras vivan legalmente en España. La residencia de nómada digital es de los procesos más rápidos de extranjería, pero no es para todos: los requisitos económicos y laborales son altos." },
      { type: "h2", text: "Los requisitos que sí o sí debes cumplir" },
      { type: "ul", items: [
        "Trabajar para una empresa extranjera (o tener clientes mayoritariamente fuera de España si eres freelance).",
        "Antigüedad mínima de 3 meses con esa empresa y que la empresa lleve al menos 1 año operando.",
        "Ingresos de al menos el 200% del salario mínimo interprofesional español.",
        "Titulación universitaria o experiencia profesional mínima de 3 años.",
        "Seguro médico y antecedentes penales limpios.",
      ] },
      { type: "h2", text: "¿Por qué se considera un proceso rápido?" },
      { type: "p", text: "Si la solicitud se presenta en España, la administración debe resolver en unos 20 días hábiles, y aplica el silencio administrativo positivo: si no responden en plazo, se entiende concedida. Además la residencia inicial es de hasta 3 años, renovable, y computa para la nacionalidad." },
      { type: "h2", text: "El error más común" },
      { type: "p", text: "Presentar contratos o certificados laborales que no acreditan bien la relación con la empresa extranjera. La mayoría de denegatorias que vemos vienen de documentación laboral mal armada, no de incumplir requisitos. Una revisión profesional del expediente antes de presentar marca la diferencia." },
    ],
  },
  {
    slug: "nacionalidad-espanola-latinoamericanos-2-anos",
    titulo: "Nacionalidad española para latinoamericanos: la vía de los 2 años",
    extracto:
      "Los ciudadanos de países iberoamericanos pueden pedir la nacionalidad española con solo 2 años de residencia legal. Te contamos cómo funciona el proceso completo.",
    fecha: "2026-08-24",
    categoria: "Nacionalidad",
    minutos: 6,
    content: [
      { type: "p", text: "Mientras la regla general exige 10 años de residencia legal en España para pedir la nacionalidad, los nacionales de países iberoamericanos —incluido todo Latinoamérica— solo necesitan 2 años. Es una de las mayores ventajas migratorias que tenemos como latinoamericanos." },
      { type: "h2", text: "Qué cuenta (y qué no) como residencia legal" },
      { type: "p", text: "Los 2 años deben ser de residencia legal, continuada e inmediatamente anterior a la solicitud. Ojo: la estancia por estudios NO computa como residencia a estos efectos — por eso muchos estudiantes hacen primero la modificatoria de estudiante a residente, y desde ahí empiezan a contar sus 2 años." },
      { type: "h2", text: "Los exámenes: CCSE y DELE" },
      { type: "ul", items: [
        "CCSE (Prueba Cervantes): examen de conocimientos constitucionales y socioculturales de España.",
        "DELE A2 o superior: solo para quienes no tienen el español como lengua materna — los latinoamericanos hispanohablantes están exentos.",
      ] },
      { type: "h2", text: "El proceso paso a paso" },
      { type: "ul", items: [
        "Reunir certificados: antecedentes penales del país de origen apostillados, empadronamiento, TIE vigente.",
        "Aprobar la prueba CCSE del Instituto Cervantes.",
        "Presentar la solicitud telemática ante el Ministerio de Justicia.",
        "Jura o promesa de la nacionalidad una vez concedida, e inscripción en el Registro Civil.",
      ] },
      { type: "p", text: "Los plazos de resolución varían, pero un expediente bien presentado desde el inicio evita los requerimientos que suelen añadir meses al proceso." },
    ],
  },
  {
    slug: "master-en-espana-guia-de-pasos",
    titulo: "Estudiar un Máster en España: la guía de pasos completa",
    extracto:
      "Desde elegir universidad hasta aterrizar en España: el orden correcto de los pasos, los plazos reales y los errores que retrasan la admisión.",
    fecha: "2026-08-24",
    categoria: "Asesoría educativa",
    minutos: 7,
    content: [
      { type: "p", text: "Cada año acompañamos a decenas de latinoamericanos a estudiar su máster en España. El proceso es totalmente alcanzable, pero tiene un orden y unos plazos que conviene respetar. Esta es la ruta completa." },
      { type: "h2", text: "1. Elige programa con estrategia (12-9 meses antes)" },
      { type: "p", text: "España tiene más de 1,100 másteres oficiales entre universidades públicas y privadas. La clave no es postular a muchos, sino a los correctos: los que aceptan tu titulación, encajan con tu perfil y tienen costos que puedes asumir. Las públicas pueden costar desde 1,500 € el año para extranjeros en algunas comunidades." },
      { type: "h2", text: "2. Prepara la documentación académica (9-6 meses antes)" },
      { type: "ul", items: [
        "Título y certificado de notas apostillados.",
        "En algunos casos, equivalencia de notas medias del Ministerio de Universidades.",
        "CV académico y carta de motivación adaptados al programa.",
      ] },
      { type: "h2", text: "3. Postula y asegura tu plaza (6-4 meses antes)" },
      { type: "p", text: "Cada universidad tiene su propio calendario de admisión, y muchas abren varios periodos. Postular en el primer periodo aumenta tus opciones de plaza y de beca. Al ser admitido, la mayoría pide una reserva de plaza para emitir tu carta de admisión." },
      { type: "h2", text: "4. Tramita tu visado (4-2 meses antes)" },
      { type: "p", text: "Con la carta de admisión inicias el visado de estudios en tu consulado, o planificas la estancia por estudios desde España. Aquí entran el seguro médico, los medios económicos y los antecedentes penales apostillados." },
      { type: "h2", text: "5. Aterriza con todo en orden" },
      { type: "p", text: "Ya en España: TIE (toma de huellas), empadronamiento y, si vas a trabajar en prácticas, alta en la seguridad social. Nada de esto es difícil si llega en el orden correcto — y para eso estamos." },
    ],
  },
  {
    slug: "homologacion-titulo-universitario-espana",
    titulo: "Homologación y equivalencia de tu título universitario en España",
    extracto:
      "¿Necesitas homologar tu título para estudiar o trabajar en España? No siempre. Te explicamos cuándo hace falta, qué vía elegir y cuánto tarda de verdad.",
    fecha: "2026-08-24",
    categoria: "Asesoría educativa",
    minutos: 5,
    content: [
      { type: "p", text: "Una de las dudas más frecuentes de quienes migran a España con estudios terminados: ¿tengo que homologar mi título? La respuesta corta: depende de para qué lo quieras usar." },
      { type: "h2", text: "¿Cuándo NO necesitas homologar?" },
      { type: "p", text: "Para estudiar un máster oficial, la mayoría de universidades españolas aceptan títulos latinoamericanos sin homologar: basta una comprobación de equivalencia que hace la propia universidad. Si tu objetivo es solo estudiar un postgrado, probablemente no necesites homologación." },
      { type: "h2", text: "¿Cuándo SÍ la necesitas?" },
      { type: "ul", items: [
        "Para ejercer una profesión regulada (medicina, enfermería, abogacía, arquitectura, etc.).",
        "Para oposiciones y empleo público.",
        "Cuando un empleador exige el título homologado o la equivalencia oficial.",
      ] },
      { type: "h2", text: "Homologación vs. Equivalencia" },
      { type: "p", text: "La homologación equipara tu título a uno español concreto que habilita para una profesión regulada. La equivalencia lo reconoce a nivel académico (área y nivel de grado) sin habilitar profesión. Elegir mal la vía es el error que más expedientes retrasa." },
      { type: "h2", text: "Plazos reales" },
      { type: "p", text: "Los expedientes ante el Ministerio pueden tardar bastantes meses, y cualquier defecto documental (apostillas, traducciones, certificados de plan de estudios) genera requerimientos que suman más tiempo. Presentar el expediente completo y bien armado desde el día uno es la mejor inversión." },
      { type: "h2", text: "¿Y la secundaria?" },
      { type: "p", text: "Si lo que necesitas es homologar tus estudios de secundaria al Bachillerato español (por ejemplo para estudiar un grado o una FP), el trámite es distinto y también lo gestionamos." },
    ],
  },
  {
    slug: "formacion-profesional-espana-carrera-tecnica",
    titulo: "Formación Profesional en España: la vía rápida que casi nadie mira",
    extracto:
      "Dos años, prácticas en empresas desde el primer año, matrícula subvencionada y permiso para trabajar 30 horas semanales. La FP española es una de las mejores puertas de entrada.",
    fecha: "2026-08-24",
    categoria: "Asesoría educativa",
    minutos: 6,
    content: [
      { type: "p", text: "Cuando alguien piensa en estudiar en España, piensa en un máster. Pero hay una vía que suele encajar mejor con muchos perfiles y que pasa desapercibida: la Formación Profesional. Son estudios técnicos de dos años, con prácticas en empresas desde el primer año y una empleabilidad altísima." },
      { type: "h2", text: "Por qué la FP es tan interesante" },
      { type: "ul", items: [
        "Costos de matrícula subvencionados en centros públicos.",
        "Prácticas en empresas desde el primer año.",
        "Acceso directo a la universidad al terminar.",
        "Válida para tu visa de estudios en España.",
        "Permiso para trabajar hasta 30 horas a la semana.",
      ] },
      { type: "h2", text: "Qué puedes estudiar" },
      { type: "p", text: "La oferta cubre prácticamente todos los sectores: administración y gestión, comercio y marketing, informática y comunicaciones, sanidad, imagen personal, hostelería y turismo, electricidad y electrónica, energía y agua, fabricación mecánica, edificación y obra civil, industrias alimentarias, actividades físicas y deportivas, artes gráficas, vídeo y fotografía, transporte y mantenimiento de vehículos, y varias más." },
      { type: "h2", text: "El requisito que marca el calendario" },
      { type: "p", text: "Para acceder necesitas haber terminado la secundaria y homologar tus estudios al Bachillerato español. Este es el paso que más tarda, así que es el que debe arrancar primero: mientras la homologación se resuelve, el volante de presentación ya te permite matricularte en centros de FP." },
      { type: "h2", text: "Calendario orientativo" },
      { type: "ul", items: [
        "Trámite de constancia de estudios legalizada: al cierre del año anterior.",
        "Inicio de la homologación escolar: enero–febrero.",
        "Resolución de la homologación: marzo–abril.",
        "Postulación a centros: mayo–junio.",
        "Respuesta de los centros: junio–julio.",
        "Inicio del trámite de visa: julio–agosto.",
        "Inicio de clases: septiembre–octubre.",
      ] },
      { type: "p", text: "Si tu objetivo es llegar a España con una formación práctica, empleable y económicamente accesible, la FP merece estar sobre la mesa antes de descartarla." },
    ],
  },
  {
    slug: "denegacion-visa-estudios-recurso-reposicion",
    titulo: "Te denegaron la visa de estudios: qué hacer (y qué no) desde el día uno",
    extracto:
      "Una denegación no es el final del camino, pero los plazos para recurrir son cortos. Esto es lo que hay que revisar antes de decidir entre apelar o cambiar de estrategia.",
    fecha: "2026-08-24",
    categoria: "Extranjería",
    minutos: 5,
    content: [
      { type: "p", text: "Recibir una resolución de denegación es un golpe duro, sobre todo cuando ya tienes la carta de admisión y las clases empiezan en pocas semanas. La buena noticia: no todo está perdido. La mala: los plazos para reaccionar son cortos y perentorios." },
      { type: "h2", text: "Lo primero: leer la causa real de la denegación" },
      { type: "p", text: "Las denegaciones no son todas iguales. Puede tratarse de una acreditación económica insuficiente, de un seguro médico que no cumple la cobertura exigida, de dudas sobre el propósito de la estancia o de un defecto formal en la documentación. La causa determina si el recurso tiene recorrido o no." },
      { type: "h2", text: "Qué implica un recurso de reposición bien hecho" },
      { type: "ul", items: [
        "Análisis jurídico de la resolución de denegación.",
        "Elaboración del escrito de recurso, argumentando sobre la causa concreta.",
        "Revisión por abogados con conocimiento del consulado que resolvió.",
        "Presentación del recurso en plazo ante el Consulado de España.",
        "Seguimiento del expediente hasta la resolución.",
      ] },
      { type: "h2", text: "Cuándo el recurso NO es el mejor camino" },
      { type: "p", text: "A veces la vía más rápida y segura no es insistir ante el consulado, sino reconducir el caso hacia una estancia por estudios solicitada ya en España. Es una decisión estratégica que depende de tus fechas de clase, de la causa de la denegación y de tu situación documental." },
      { type: "h2", text: "El principio que aplicamos" },
      { type: "p", text: "Solo asumimos casos viables. Si tras analizar tu resolución vemos que el recurso no prospera, te lo decimos y trabajamos la alternativa que sí tiene posibilidades reales. Preferimos una conversación honesta a un expediente condenado desde el inicio." },
    ],
  },
  {
    slug: "calendario-estudiar-espana-2026-2027",
    titulo: "Calendario para estudiar en España 2026/2027: cuándo hacer cada cosa",
    extracto:
      "El error más caro no es elegir mal la universidad: es empezar tarde. Este es el calendario real de un proceso de máster, grado o FP, mes a mes.",
    fecha: "2026-08-24",
    categoria: "Asesoría educativa",
    minutos: 6,
    content: [
      { type: "p", text: "Casi todos los procesos que se complican tienen la misma causa de fondo: arrancaron tarde. Los trámites académicos y migratorios españoles tienen ventanas concretas, y perder una puede significar esperar un año entero. Este es el orden real de las cosas." },
      { type: "h2", text: "Máster oficial" },
      { type: "ul", items: [
        "Trámite de documentación universitaria: entre noviembre y enero.",
        "Postulación: noviembre–enero, con nuevas fases en junio y septiembre.",
        "Resultados de admisión: entre marzo y agosto según la fase.",
        "Preinscripción: de junio a septiembre.",
        "Inicio del trámite de visa: julio–agosto.",
        "Inicio de clases: septiembre–octubre.",
      ] },
      { type: "h2", text: "Grado universitario" },
      { type: "p", text: "El grado añade dos pasos que alargan mucho el calendario: la homologación del bachillerato y las pruebas de acceso PCE/EBAU de la UNED. La homologación se inicia lo antes posible; las pruebas se inscriben entre febrero y mayo, se rinden en junio y en julio se hace la preinscripción universitaria." },
      { type: "h2", text: "Formación Profesional" },
      { type: "p", text: "La homologación escolar arranca en enero o febrero y se resuelve entre marzo y abril. Las postulaciones a centros van de mayo a junio, la respuesta llega entre junio y julio, la visa se inicia en julio o agosto y las clases empiezan en octubre." },
      { type: "h2", text: "El consejo que damos siempre" },
      { type: "p", text: "Reúne y legaliza tus documentos académicos antes de saber a dónde vas a postular. Título, certificado de notas y carga horaria apostillados sirven para la postulación, para la homologación y para el visado. Tenerlos listos con antelación es lo que convierte un proceso apretado en uno cómodo." },
      { type: "p", text: "Y si vas a intentar una beca, postula en las primeras fases: las convocatorias más interesantes, incluidas las exclusivas para extranjeros, cierran mucho antes del inicio de clases." },
    ],
  },
];

/** Portada de la entrada: public/blog/<slug>.jpg (las genera scripts/blogimg.py). */
export const portadaDe = (post) => `/blog/${post.slug}.jpg`;

export const autorDe = (post) => post?.autor || AUTOR_POR_DEFECTO;

export const getPost = (slug) => POSTS.find((p) => p.slug === slug);
