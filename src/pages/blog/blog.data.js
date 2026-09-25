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
    // La guía para la búsqueda «estancia por estudios abogados españa»
    // (Marco, 25/09/2026). Regla del cliente: no es un manual. Cada sección
    // contesta lo justo para que Google la cite y remata en lo que se pierde
    // si se hace mal y en la sesión diagnóstico. Miedo verdadero (lo que de
    // verdad deniega) y seguridad verdadera (cifras y resoluciones reales).
    // Cifras de config (IPREM, plazos) y de casosEstancia.js.
    slug: "estancia-por-estudios-espana-requisitos-plazos",
    titulo: "Estancia por estudios en España en 2026: requisitos, plazos y por qué se deniega",
    extracto:
      "Lo que Extranjería exige para la estancia por estudios y los detalles por los que la deniega: el extracto, el seguro, el certificado médico y los 90 días. Con los plazos reales de expedientes resueltos en 2026 y cómo evitar jugártela.",
    fecha: "2026-09-25",
    actualizado: "2026-09-25",
    categoria: "Extranjería",
    minutos: 6,
    novedad: true,
    content: [
      { type: "p", text: "La estancia por estudios no se deniega por grandes motivos: se deniega por detalles. Un extracto sin sello, un seguro con copagos, un certificado médico sin la frase exacta, una solicitud presentada un día tarde. Y cuando se deniega, el curso no espera: pierdes meses, a veces la plaza, y el dinero que ya pagaste. Esta guía te dice lo que Extranjería exige y dónde se cae la gente. Si prefieres no jugártela, al final te contamos cómo lo llevamos nosotros." },
      { type: "nota", text: "Lo que aquí se dice sale de la Ley Orgánica 4/2000 y del Reglamento de Extranjería (Real Decreto 1155/2024, artículos 35, 53 y 57) y de las resoluciones que recibimos cada semana de las Delegaciones del Gobierno." },

      { type: "h2", text: "Qué es y quién puede pedirla desde España" },
      { type: "p", text: "Es la autorización para quedarte en España más de 90 días estudiando a tiempo completo en un centro autorizado: un máster oficial, un grado, formación profesional. Se pide desde España si entraste como turista y todavía estás en plazo, ante la Oficina de Extranjería de la provincia donde vas a estudiar. El permiso es el mismo que el del visado de estudios; cambia dónde se presenta y cómo se acredita el dinero, y eso es justo lo que decide si te conviene una vía u otra." },
      { type: "enlace", href: "/visa-o-estancia", texto: "¿Visado o estancia? Cinco preguntas y te lo decimos" },

      { type: "h2", text: "Requisitos: lo que piden, y el detalle que tumba cada uno" },
      { type: "ul", items: [
        "Carta de admisión de un centro autorizado, a tiempo completo. Lo que tumba: una carta condicional, antigua, de un título propio o de un centro no apto para la estancia.",
        "Medios económicos: el 100 % del IPREM por mes, 7.200 € para el curso, en una cuenta española a tu nombre. Lo que tumba: la captura de la app del banco, un PDF sin sello, una cuenta de otra persona.",
        "Seguro médico sin copagos ni carencias durante toda la estancia. Lo que tumba: un seguro de viaje o «con copagos pequeños».",
        "Certificado médico en impreso oficial con la fórmula del Reglamento Sanitario Internacional de 2005. Lo que tumba: el papel de la clínica que dice «apto».",
        "Antecedentes penales apostillados de los países donde viviste en los últimos cinco años. Lo que tumba: pedirlos demasiado pronto y que caduquen antes de presentar.",
        "Presentar dentro de tus 90 días como turista. Lo que tumba: presentar el día 91. No hay expediente que valga fuera de plazo.",
      ] },
      { type: "p", text: "Cualquiera de estos seis es motivo de denegación por sí solo. En los expedientes que nos llegan ya denegados, casi siempre hay uno." },

      { type: "h2", text: "Cuánto dinero hay que demostrar" },
      { type: "p", text: "600 € por cada mes de estancia; 7.200 € para un curso completo. Extranjería no pide los seis meses de historial ni el origen del dinero que exige el consulado: quiere ver el saldo en una cuenta abierta en España, a tu nombre, en un extracto emitido y sellado en la oficina, con fecha reciente. Si te quedas justo y el banco cobra una comisión, el extracto deja de valer." },

      { type: "h2", text: "Los plazos: aquí se pierden más expedientes que en ningún otro sitio" },
      { type: "p", text: "Desde que llegas tienes 90 días de estancia regular, y Extranjería quiere la solicitud con dos meses de antelación al inicio de clases. Entre abrir la cuenta, empadronarte, conseguir el certificado médico y el seguro y reunir el resto, se van las semanas sin darte cuenta. Quien llega tarde tiene dos salidas malas: presentar con un escrito de excepcionalidad que puede no aceptarse, o quedarse en situación irregular cuando venzan los 90 días. Ninguna de las dos se arregla después." },
      { type: "enlace", href: "/estancia", texto: "Pon tu fecha de entrada y te decimos tu último día para presentar" },

      { type: "h2", text: "Cuánto dura y cuánto tarda" },
      { type: "p", text: "Se concede por la duración de los estudios y se prorroga cada año mientras sigas matriculado. Con nuestros expedientes de 2026: autorizaciones iniciales en Sevilla (válida hasta noviembre de 2027), en Madrid (hasta septiembre de 2027) y en Valencia para un máster de dos años (hasta septiembre de 2028), y una prórroga en Alicante por un año más. Extranjería tarda entre uno y tres meses según la oficina: en esos mismos casos, dos días en Sevilla, veintiséis en Madrid, alrededor de un mes en Valencia. Mientras tanto ya estás en clase, y con permiso para trabajar hasta treinta horas a la semana." },

      { type: "h2", text: "Lo que pasa si te la deniegan" },
      { type: "p", text: "Una denegación no es un trámite más: es un recurso de reposición en el plazo de un mes, meses de espera con el curso ya empezado y, si los 90 días vencieron, una situación irregular que complica todo lo que venga después. La mayoría de las denegaciones que revisamos son de forma —el extracto, el seguro, el certificado— y se habrían evitado antes de presentar. En Inspira llevamos más de 350 resoluciones favorables de Extranjería y más de 200 apelaciones ganadas: sabemos exactamente dónde mira la oficina, porque lo leemos en cada resolución." },
      { type: "cta", titulo: "Antes de presentar, que lo mire un abogado", texto: "Sesión diagnóstico de 30 minutos por videollamada, con tu pasaporte y tu carta delante: te decimos si tu caso es viable, con qué fechas y qué te falta. Si no es viable hoy, te lo decimos ahí, antes de que gastes un euro más.", boton: "Reservar la sesión · 25 €", href: "/reservar" },

      { type: "h2", text: "Cómo lo hacemos en Inspira" },
      { type: "p", text: "Un abogado colegiado prepara, firma y presenta tu estancia por vía telemática (MERCURIO), sin cita ni colas, con registro de fecha y hora. Las notificaciones de Extranjería llegan a su casilla electrónica: si hay un requerimiento, lo contestamos nosotros dentro del plazo. Cada documento entra revisado, con su modelo de cómo debe quedar, y todo queda por escrito en tu expediente digital. Tú te ocupas de tus clases y de tus primeros días en España; del expediente nos ocupamos nosotros, hasta la resolución y la TIE." },
      { type: "enlace", href: "/estancia", texto: "Ver el paquete de estancia por estudios: qué incluye, resultados reales y las resoluciones de 2026" },

      { type: "h2", text: "Preguntas frecuentes" },
      { type: "faq", items: [
        { q: "¿Cuánto tiempo dura la estancia por estudios en España?", a: "Lo que duren los estudios: el curso, o los dos cursos de un máster de dos años, y se prorroga cada año mientras sigas matriculado. En 2026 hemos conseguido autorizaciones válidas hasta noviembre de 2027 y hasta septiembre de 2028." },
        { q: "¿Cómo conseguir la estancia por estudios en España?", a: "Con carta de admisión de un centro autorizado, entrando en situación regular, con el dinero en una cuenta española y presentando dentro de tus 90 días y con dos meses de antelación a las clases. El orden y los plazos importan tanto como los papeles: es lo que revisamos en la sesión diagnóstico." },
        { q: "¿Cuánto tarda Extranjería en resolver?", a: "Entre uno y tres meses según la oficina. En nuestros expedientes de 2026: dos días en Sevilla, veintiséis en Madrid, alrededor de un mes en Valencia." },
        { q: "¿Cuánto dinero hay que demostrar?", a: "El 100 % del IPREM por mes: 600 € al mes, 7.200 € para el curso, en una cuenta española a tu nombre con extracto sellado. Con menos, o con una captura de pantalla, se deniega." },
        { q: "¿Puedo trabajar con la estancia por estudios?", a: "Sí, hasta treinta horas semanales compatibles con los estudios. Viene con la autorización, sin trámite aparte." },
        { q: "¿Se puede pedir desde España sin visado?", a: "Sí, si entraste en situación regular y presentas dentro de tus 90 días. Fuera de ese plazo no hay expediente posible." },
        { q: "¿Qué pasa si presento tarde?", a: "Con menos de dos meses de antelación se presenta con un escrito de excepcionalidad, que la oficina puede no aceptar. Fuera de los 90 días, no se puede presentar." },
        { q: "¿Y si me la deniegan?", a: "Cabe recurso de reposición en un mes. La mayoría de las denegaciones son de forma y se habrían evitado antes: por eso recomendamos que un abogado revise el expediente antes de presentarlo." },
      ] },
      { type: "cta", titulo: "¿Ya estás en España y empiezan las clases?", texto: "Escríbenos con tu fecha de entrada y la de inicio de clases y te decimos hoy mismo si llegas y qué te falta.", boton: "Ver cómo lo hacemos y escribirnos", href: "/estancia" },
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
