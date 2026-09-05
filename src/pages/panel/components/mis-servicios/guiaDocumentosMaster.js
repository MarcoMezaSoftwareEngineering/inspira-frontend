// La guía directa de documentos del paquete máster: qué es cada uno, por qué
// importa, qué hay que verificar antes de subirlo y cómo debe verse.
//
// El texto es el de la «Guía Máster» de Inspira (04.1 Documentos de
// postulación) y el de los mensajes que Carina manda a los asesorados para
// los dos pasos que se hacen a medias. Los modelos son documentos reales con
// los datos personales tapados; están en /guia-master/.

const IMG = (n) => `/guia-master/${n}.jpg`;

/** La cadena que casi todo documento académico peruano tiene que recorrer. */
export const CADENA_LEGALIZACION = [
  { titulo: "Sello del Secretario General",
    texto: "El documento sale de tu universidad como copia certificada, con el sello del Secretario General y su código de verificación. Sin ese sello, SUNEDU no lo verifica." },
  { titulo: "Verificación SUNEDU",
    texto: "SUNEDU emite la «Constancia de verificación de datos de autoridades»: confirma que quien firmó tu documento estaba inscrito como autoridad. Es la constancia la que se apostilla, no el documento original." },
  { titulo: "Apostilla de La Haya",
    texto: "El Ministerio de Relaciones Exteriores apostilla la constancia de SUNEDU. Con eso, el documento vale en España sin más trámites." },
];

export const GUIA_DOCUMENTOS = [
  {
    slug: "pasaporte",
    titulo: "Pasaporte",
    que_es: "La página de datos de tu pasaporte, completa y a color.",
    por_que: "Es tu identificación en todo el proceso: la universidad, el visado y la matrícula usan exactamente los nombres y el número que figuran ahí.",
    verifica: ["Vigente durante todo el proceso, incluido el visado.", "Que se lean bien la foto, la firma y las dos líneas de abajo (la zona de lectura mecánica).", "Un solo PDF: la página de datos y, si tiene, la de observaciones."],
    modelos: [],
  },
  {
    slug: "dni",
    titulo: "DNI",
    que_es: "Tu documento nacional de identidad, por las dos caras.",
    por_que: "Acompaña al pasaporte en trámites en Perú (SUNEDU, apostilla, notaría) y sirve para comprobar que los nombres coinciden en todos los documentos.",
    verifica: ["Las dos caras, legibles y sin recortes.", "Un solo PDF.", "Que los nombres y apellidos coincidan letra por letra con el pasaporte y el título."],
    modelos: [],
  },
  {
    slug: "titulo",
    titulo: "Título universitario (bachiller y título profesional)",
    que_es: "El diploma de bachiller y el de título profesional, por ambas caras, en copia certificada por tu universidad.",
    por_que: "Es lo que da acceso al máster. La universidad española comprueba el título, la fecha de expedición y que el nivel corresponde a un grado.",
    verifica: ["Verifica el sello del Secretario General, tanto para bachiller como para título profesional.", "Por ambas caras: la cara con el diploma y la cara con el registro (código de diploma, libro y folio).", "Después, verificación SUNEDU y apostilla, como en la cadena de más arriba."],
    modelos: [
      { src: IMG("titulo-1"), pie: "Cara principal del título profesional, copia certificada." },
      { src: IMG("titulo-2"), pie: "Reverso: código de diploma, registro y datos de emisión." },
    ],
  },
  {
    slug: "certificado_notas",
    titulo: "Constancia o certificado de notas",
    que_es: "El certificado de estudios con cada curso, su nota en letras y en números, los créditos y el periodo.",
    por_que: "Con él se calcula tu nota media y se compara tu plan de estudios con el del máster. Si falta un curso o una nota, la equivalencia sale mal.",
    verifica: ["No importa el nombre del documento, sino su contenido: recomendamos una constancia donde se vea cada uno de los cursos junto con las notas en letras y números.", "Verifica el sello del Secretario General en tu constancia de notas.", "Todas las páginas en un solo PDF, hasta la última con las firmas."],
    modelos: [
      { src: IMG("certificado-notas-1"), pie: "Primera página: identificación del alumno y primeros periodos." },
      { src: IMG("certificado-notas-2"), pie: "Cursos por periodo, con nota en número y en letras, créditos y acta." },
      { src: IMG("certificado-notas-3"), pie: "Última página: promedio, créditos aprobados y firmas." },
    ],
  },
  {
    slug: "carga_horaria",
    titulo: "Carga horaria y currícula",
    que_es: "Una constancia con cada curso, sus créditos y la cantidad de horas teóricas y prácticas.",
    por_que: "Las universidades españolas miden tu carrera en créditos y horas. Sin este documento no pueden comprobar que tu grado tiene la carga que exige el máster.",
    verifica: ["No importa el nombre del documento, sino su contenido: cada curso con créditos y horas teóricas y prácticas.", "Verifica el sello del Secretario General.", "Puede que tu centro no tenga el formato: se solicita formalmente al decanato o rectorado. Tu asesor te facilita el modelo de solicitud."],
    modelos: [],
  },
  {
    slug: "carta_acceso",
    titulo: "Carta de acceso al máster",
    que_es: "Una carta de tu universidad que certifica que tu título te habilita para estudios de posgrado.",
    por_que: "Es obligatoria para tu postulación, a menos que cuentes con resolución favorable de homologación. Es la prueba de que en tu país ese título abre la puerta a un máster.",
    verifica: ["Firmada por el decano o la autoridad que corresponda y con el sello del Secretario General.", "Puede que tu centro no tenga el formato: se solicita formalmente al decanato o rectorado. Tu asesor te facilita el modelo.", "Después, verificación SUNEDU y apostilla."],
    modelos: [
      { src: IMG("carta-acceso"), pie: "Carta del decano que acredita el grado, el título y la habilitación para posgrado." },
    ],
  },
  {
    slug: "rango_notas",
    titulo: "Rango de notas",
    que_es: "Una constancia con la forma de calificación de tu universidad: la nota mínima aprobatoria y la nota máxima.",
    por_que: "Sin la escala, España no puede convertir tus notas. Un 14 sobre 20 no es lo mismo que un 14 sobre 15.",
    verifica: ["Debe estar la nota mínima aprobatoria y la nota máxima.", "Verifica el sello del Secretario General.", "Puede que tu centro no tenga el formato: se solicita formalmente al decanato o rectorado."],
    modelos: [],
  },
  {
    slug: "promedio",
    titulo: "Promedio ponderado",
    que_es: "Tu promedio ponderado general acumulado, en la escala original de tu universidad.",
    por_que: "Es obligatorio para tu postulación y es el número que más pesa en la admisión. Debe estar en tu escala original, no en el equivalente.",
    verifica: ["En tu escala original (por ejemplo, sobre 20), no convertido.", "Verifica el sello del Secretario General.", "Vale una constancia de orden de mérito o el promedio que figura al final del certificado de estudios."],
    modelos: [
      { src: IMG("orden-merito"), pie: "Constancia de orden de mérito: promedio ponderado y puesto en la promoción." },
    ],
  },
  {
    slug: "sunedu_apostilla",
    titulo: "Verificación SUNEDU y apostilla",
    que_es: "La constancia de SUNEDU que verifica al firmante de tu documento, y la apostilla del Ministerio de Relaciones Exteriores sobre esa constancia.",
    por_que: "En Perú se apostilla el documento de verificación de SUNEDU. Es lo que hace que tu título y tus certificados valgan en España.",
    verifica: ["Ojo: SUNEDU solo verifica documentos sellados por el Secretario General.", "Una constancia y una apostilla por cada documento (título, certificado de notas, carta de acceso).", "Sube cada documento con su constancia y su apostilla en un solo PDF."],
    modelos: [
      { src: IMG("verificacion-sunedu"), pie: "Constancia de verificación de datos de autoridades (SUNEDU)." },
      { src: IMG("apostilla"), pie: "Apostilla de La Haya del Ministerio de Relaciones Exteriores." },
    ],
  },
  {
    slug: "equivalencia",
    titulo: "Equivalencia de nota media",
    que_es: "La declaración de equivalencia que genera el Ministerio de Educación de España con todas tus notas y créditos convertidos a la escala española.",
    por_que: "Es el documento con el que la universidad española lee tu expediente. Se genera por cada máster a presentar y se firma en todas las hojas y en la parte final.",
    conjunto: true,
    verifica: ["Se prepara entre los dos: tú creas el usuario y avanzas hasta el paso 5; nosotros continuamos desde ahí.", "Envíanos los usuarios que crees para poder continuar el proceso contigo.", "Hace falta el certificado de notas y el rango de notas ya subidos."],
    enlaces: [{ label: "Equivalencia de notas medias (sede electrónica)", url: "https://universidades.sede.gob.es/pagina/index/directorio/Equivalencia_notas_medias" }],
    modelos: [
      { src: IMG("equivalencia-1"), pie: "Página 1: datos de la titulación, escala de origen y tabla de equivalencia." },
      { src: IMG("equivalencia-2"), pie: "Asignaturas con créditos, calificación original y equivalente español." },
      { src: IMG("equivalencia-3"), pie: "Nota media en escala original y en escala española 0-10; declaración responsable." },
    ],
  },
  {
    slug: "cv_tradicional",
    titulo: "CV en formato tradicional, actualizado",
    que_es: "Tu currículum habitual, tal como lo tienes ahora, puesto al día.",
    por_que: "Es la base con la que preparamos el CV Europass y la carta de motivación: de aquí salen los datos, las fechas y los logros que después enfocamos al máster.",
    verifica: ["Actualizado: último trabajo, última formación, idiomas.", "Fechas de inicio y fin en cada experiencia y estudio.", "En PDF o Word, un solo archivo."],
    modelos: [],
  },
  {
    slug: "cv_europass",
    titulo: "CV Europass",
    que_es: "Tu currículum en el formato europeo estandarizado, Europass, reconocido en toda Europa.",
    por_que: "Facilita la comparación de perfiles: datos personales, formación y experiencia de manera clara y estructurada. Muchas universidades lo piden en este formato y no en otro.",
    conjunto: true,
    verifica: ["Crea tu CV utilizando la información de tu CV habitual, tal como lo tienes ahora; luego nosotros lo adaptamos y enfocamos al máster.", "Solo necesitas enviárnoslo en archivo: el formato permite que lo ajustemos de manera automática.", "Foto reciente, correo que revises y teléfono con prefijo."],
    enlaces: [{ label: "Editor de CV Europass", url: "https://europa.eu/europass/eportfolio/screen/cv-editor?lang=es" }],
    modelos: [
      { src: IMG("cv-europass-1"), pie: "Cabecera, perfil y experiencia laboral en formato Europass." },
      { src: IMG("cv-europass-2"), pie: "Educación y formación, idiomas." },
    ],
  },
  {
    slug: "investigacion",
    titulo: "Artículos y proyectos de investigación",
    que_es: "Tus artículos publicados y las constancias de participación en proyectos de investigación.",
    por_que: "Si tu máster es de investigación, adjunta constancias de participación e investigaciones: en esos programas pesan tanto como el promedio.",
    verifica: ["Todo junto en un solo PDF: portada o primera página de cada artículo y las constancias.", "Que se lea la revista o la institución, el año y tu nombre como autor o participante."],
    modelos: [],
  },
  {
    slug: "otros_meritos",
    titulo: "Otros: cartas de referencia, carta de motivación, becas, premios",
    que_es: "Lo que suma y no cabe en las otras casillas: cartas de referencia, tu carta de motivación, becas obtenidas y premios.",
    por_que: "Algunos másteres los piden y en el resto suman puntos. La carta de motivación es lo único del expediente que habla con tu voz; tu asesor la revisa antes de presentarla.",
    verifica: ["Todo junto en un solo PDF, en este orden: carta de motivación, cartas de referencia, becas, premios.", "Cartas de referencia firmadas, con cargo y contacto de quien firma.", "Una carta de motivación específica para cada máster, no una genérica."],
    modelos: [],
  },
  {
    slug: "carta_motivacion",
    titulo: "Carta de motivación",
    que_es: "Una carta personalizada que explica cómo tu trayectoria profesional y académica se relaciona con el máster al que aspiras.",
    por_que: "Es lo único del expediente que habla con tu voz. Destaca tus metas personales y profesionales y el impacto que el programa tendrá en tu desarrollo.",
    verifica: ["Una carta específica para cada máster, no una genérica.", "Estructurada como una narrativa que cuente tu historia de manera convincente.", "Utiliza el diseño estándar como guía; tu asesor la revisa antes de presentarla."],
    modelos: [],
  },
  {
    slug: "idiomas",
    titulo: "Certificados de idiomas",
    que_es: "Tu certificado de inglés u otro idioma, si lo tienes.",
    por_que: "En algunos másteres es obligatorio tener al menos inglés B1. Te recomendamos adjuntarlo aunque el tuyo no lo exija.",
    verifica: ["Certificado oficial con nivel (B1, B2…) y fecha.", "Un solo PDF por certificado."],
    modelos: [],
  },
  {
    slug: "experiencia",
    titulo: "Certificados de trabajo (experiencia profesional)",
    que_es: "Las constancias que acreditan tu trayectoria profesional.",
    por_que: "Algunos programas, como los MBA, exigen experiencia laboral; en el resto suma puntos en la admisión.",
    verifica: ["Emite tus constancias en la empresa: cargo, fechas y funciones.", "Aquí sí puedes subir varios archivos, uno por empresa.", "Si tu máster es de investigación, adjunta también constancias de participación e investigaciones."],
    modelos: [],
  },
  {
    slug: "formacion_complementaria",
    titulo: "Formación complementaria y otros méritos",
    que_es: "Diplomados, cursos, actividades extracurriculares y cualquier otro mérito.",
    por_que: "Algunos másteres solicitan actividades extracurriculares. Si tienes otros méritos, es importante reflejarlos en tu CV y adjuntar los documentos.",
    verifica: ["Aquí sí puedes subir varios archivos, uno por certificado.", "Que en cada uno se lea la institución, el nombre del curso y la fecha."],
    modelos: [],
  },
];

export function guiaDe(slug) {
  return GUIA_DOCUMENTOS.find((g) => g.slug === slug) || null;
}

// Cada ítem del checklist se une a su ficha por palabras de su nombre. El
// orden importa: «Título apostillado» es el título, no la apostilla; «CV» solo
// cuenta como palabra entera.
const CLAVES = [
  ["equivalencia", /equivalencia|nota media/i],
  ["cv_tradicional", /tradicional|formato actualizado/i],
  ["cv_europass", /europass|\bcv\b|curr[ií]cul|hoja de vida/i],
  ["investigacion", /investigaci/i],
  ["otros_meritos", /^otros|re(f|r)erencia|becas|premios/i],
  ["carta_motivacion", /motivaci/i],
  ["carta_acceso", /carta de (acceso|presentaci)|acceso al m[aá]ster/i],
  ["carga_horaria", /carga horaria|s[ií]labo|plan de estudios|malla/i],
  ["experiencia", /experiencia|trabajo|laboral/i],
  ["formacion_complementaria", /complementari|cursos|diplomados|extracurricular/i],
  ["idiomas", /idioma|ingl[eé]s|\bb[12]\b|toefl|ielts|cambridge/i],
  ["rango_notas", /rango|escala de (notas|calificaci)/i],
  ["promedio", /promedio|ponderado|m[eé]rito/i],
  ["certificado_notas", /notas|calificaciones|certificado de estudios|r[eé]cord/i],
  ["titulo", /t[ií]tulo|bachiller|\bdiploma\b|\bgrado\b/i],
  ["dni", /\bdni\b|documento nacional/i],
  ["pasaporte", /pasaporte|identidad/i],
  ["sunedu_apostilla", /sunedu|apostilla|legalizaci/i],
];

/** La ficha de la guía que corresponde a un ítem del checklist, o null. */
export function guiaParaItem(nombreItem) {
  const n = String(nombreItem || "");
  if (!n) return null;
  const par = CLAVES.find(([, rx]) => rx.test(n));
  return par ? guiaDe(par[0]) : null;
}
