// Constantes del formulario académico: las opciones de cada pregunta, las
// comunidades, las universidades que se sugieren, los pasos del asistente y
// las secciones del panel. Salieron de FormularioDatosAcademicos.jsx al
// partirlo en piezas (09/10/2026); los valores son los mismos.

export const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho",                   label: "Derecho" },
  { value: "Ingeniería y Tecnología",   label: "Ingeniería / TI" },
  { value: "Ciencias Sociales",         label: "Ciencias Sociales" },
  { value: "Educación",                 label: "Educación" },
  { value: "Salud",                     label: "Salud" },
  { value: "Humanidades",               label: "Humanidades" },
  { value: "Medio Ambiente",            label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño",             label: "Arte y Diseño" },
  { value: "Otra",                      label: "Otra" },
];

// Temas que se sugieren según de dónde viene el asesorado. «¿En qué quieres
// profundizar?» en blanco se quedaba en blanco: la gente no sabe qué escribir
// hasta que ve un ejemplo de su campo. Se ofrecen como etiquetas para tocar;
// lo que no esté aquí se escribe a mano igual. La clave es el área de la
// carrera de origen; la rama del máster, si ya la marcó, añade las suyas.
export const SUGERENCIAS_TEMAS = {
  "Derecho": ["Cooperación internacional", "Gestión pública", "Derecho digital e IA", "Compliance",
    "Derechos humanos", "Derecho internacional", "Propiedad intelectual", "Fiscalidad", "Migraciones", "Derecho de empresa"],
  "Administración y Negocios": ["Finanzas corporativas", "Marketing digital", "Recursos humanos", "Logística y cadena de suministro",
    "Dirección de proyectos", "Emprendimiento", "Comercio internacional", "Análisis de datos", "Sostenibilidad"],
  "Ingeniería y Tecnología": ["Inteligencia artificial", "Ciberseguridad", "Ciencia de datos", "Energías renovables",
    "Industria 4.0", "Desarrollo de software", "Cloud", "Robótica", "BIM"],
  "Ciencias Sociales": ["Cooperación al desarrollo", "Políticas públicas", "Comunicación", "Relaciones internacionales",
    "Género e igualdad", "Intervención social", "Investigación social", "Migraciones"],
  "Educación": ["Educación inclusiva", "Tecnología educativa", "Enseñanza de español", "Psicopedagogía",
    "Dirección de centros", "Neuroeducación", "Formación del profesorado"],
  "Salud": ["Salud pública", "Nutrición", "Neurociencia", "Gestión sanitaria", "Psicología clínica",
    "Investigación biomédica", "Fisioterapia deportiva", "Epidemiología"],
  "Humanidades": ["Patrimonio", "Gestión cultural", "Traducción", "Estudios de género", "Historia",
    "Enseñanza de español", "Filosofía", "Comunicación"],
  "Medio Ambiente": ["Cambio climático", "Economía circular", "Gestión ambiental", "Energías renovables",
    "Sostenibilidad", "Gestión del agua", "Desarrollo sostenible"],
  "Arte y Diseño": ["Diseño UX", "Dirección de arte", "Animación", "Arquitectura", "Diseño de producto",
    "Gestión cultural", "Moda", "Diseño gráfico"],
  "Otra": ["Inteligencia artificial", "Sostenibilidad", "Gestión de proyectos", "Marketing digital",
    "Cooperación internacional", "Análisis de datos"],
};
export const SUGERENCIAS_POR_RAMA = {
  CIENCIAS_SOCIALES_JURIDICAS: ["Gestión pública", "Cooperación internacional", "Marketing digital", "Recursos humanos"],
  INGENIERIA_ARQUITECTURA:     ["Inteligencia artificial", "Ciberseguridad", "Energías renovables", "BIM"],
  CIENCIAS_SALUD:              ["Salud pública", "Nutrición", "Neurociencia", "Gestión sanitaria"],
  CIENCIAS:                    ["Ciencia de datos", "Biotecnología", "Cambio climático", "Investigación"],
  ARTES_HUMANIDADES:           ["Gestión cultural", "Patrimonio", "Traducción", "Enseñanza de español"],
};

// Para qué quiere el máster. Cada respuesta favorece másteres distintos
// (habilitantes y con prácticas para quedarse; de un año y oficiales para
// volver; de investigación para el doctorado). Los valores viejos —laboral,
// investigacion— se leen como sus equivalentes.
export const OBJETIVOS = [
  { val: "trabajar_espana", label: "Quedarme a trabajar en España" },
  { val: "volver_pais",     label: "Volver a mi país con el título" },
  { val: "doctorado",       label: "Seguir con investigación o doctorado" },
  { val: "cambiar_campo",   label: "Cambiar de campo profesional" },
  { val: "indiferente",     label: "No lo tengo claro todavía" },
];
export const OBJETIVO_LEGADO = { laboral: "trabajar_espana", investigacion: "doctorado" };
export const OBJETIVO_LABEL = Object.fromEntries(OBJETIVOS.map((o) => [o.val, o.label]));

export const DESCARTES = [
  { value: "semipresencial",     label: "Nada semipresencial" },
  { value: "sin_practicas",      label: "Nada sin prácticas" },
  { value: "investigacion",      label: "Nada de investigación" },
  { value: "interuniversitario", label: "Nada interuniversitario" },
  { value: "titulo_propio",      label: "Ningún título propio" },
  { value: "mas_de_un_anio",     label: "Nada de más de un año" },
  { value: "en_ingles",          label: "Nada en inglés" },
];
export const DESCARTE_LABEL = Object.fromEntries(DESCARTES.map((d) => [d.value, d.label]));

// Fallback estático (nombres exactos del seed) — solo si la API falla
export const TODAS_COMUNIDADES_FALLBACK = [
  "Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla-La Mancha",
  "Castilla y León", "Cataluña", "Comunidad de Madrid", "Comunidad Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Murcia", "Navarra", "País Vasco",
];
export const COMUNIDAD_INDIFERENTE = "Me da igual / No tengo preferencia";

export const UNIS_SUGERENCIAS = [
  "Universidad Nacional Mayor de San Marcos","Pontificia Universidad Católica del Perú",
  "Universidad de Lima","Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia","Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico","Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas","Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal","Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia","Universidad de los Andes",
  "Universidad de Antioquia","Pontificia Universidad Javeriana",
  "Universidad del Rosario","Universidad del Valle","Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México","Instituto Politécnico Nacional",
  "Universidad de Guadalajara","Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla","Tecnológico de Monterrey",
  "Universidad de Buenos Aires","Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata","Universidad Nacional de Rosario",
  "Universidad de Chile","Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo","Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador","ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela","Universidad del Zulia",
  "Universidad Mayor de San Andrés","Universidad Nacional de Asunción",
  "Universidad de la República","Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala","Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa","Universidade do Porto",
];

export const AUIP_KEYS = [
  "universidad de lima","universidad lima","universidad nacional mayor de san marcos","san marcos","unmsm",
  "pontificia universidad católica del perú","pucp","católica del perú","universidad nacional de ingeniería","uni peru",
  "universidad peruana cayetano heredia","cayetano heredia","universidad nacional agraria la molina","la molina",
  "universidad de buenos aires","uba","universidad nacional de córdoba","unc argentina","universidad nacional de la plata","unlp",
  "universidad nacional de rosario","universidad de chile","pontificia universidad católica de chile","puc chile",
  "universidad nacional de colombia","unal","universidad de antioquia","universidad del valle","univalle",
  "universidad industrial de santander","uis","universidad de los andes colombia","universidad de costa rica","ucr",
  "universidad central del ecuador","espol","politécnica del litoral","universidad de cuenca",
  "universidad de san carlos","usac","universidad nacional autónoma de méxico","unam",
  "instituto politécnico nacional","ipn","universidad de guadalajara","udg","universidad autónoma de nuevo león","uanl",
  "benemérita universidad autónoma de puebla","buap","universidad de panamá","universidad nacional de asunción","una paraguay",
  "universidad autónoma de santo domingo","uasd","universidad de la república","udelar",
  "universidad central de venezuela","ucv","universidad del zulia","luz",
  "universidade de são paulo","usp","universidade federal do rio de janeiro","ufrj","universidade estadual de campinas","unicamp",
  "universidade de lisboa","universidade do porto",
];

export const STEPS = [
  { label: "Carrera",       title: "Tu carrera universitaria",         icon: "🎓" },
  { label: "Universidad",   title: "Tu universidad y promedio",         icon: "🏛️" },
  { label: "Experiencia",   title: "Experiencia profesional",           icon: "💼" },
  { label: "Investigación", title: "Investigación y formación",         icon: "🔬" },
  { label: "Inglés",        title: "Certificación de inglés",           icon: "🗣️" },
  { label: "Idioma/Becas",  title: "Idioma del máster y becas",         icon: "💸" },
  { label: "Tipo máster",   title: "¿Qué tipo de máster?",             icon: "🎯" },
  { label: "Detalles",      title: "Duración, prácticas y presupuesto", icon: "📋" },
  { label: "Final",         title: "Región y fechas",                  icon: "📍" },
];

export const PRES_MIN = 500, PRES_MAX = 15000;

// Las secciones plegables del panel: cada una agrupa pasos del asistente, con
// las mismas preguntas y la misma validación. La última es el repaso.
export const SECCIONES = [
  { t: "Tu formación",                  s: "Carrera, universidad y promedio",        ico: "cap",       pasos: [0, 1] },
  { t: "Experiencia e investigación",   s: "Lo que puntúa además de las notas",      ico: "briefcase", pasos: [2, 3] },
  { t: "Idiomas y becas",               s: "Inglés, idioma del máster y ayudas",     ico: "language",  pasos: [4, 5] },
  { t: "Qué quieres estudiar",          s: "Temas, enlaces y para qué lo quieres",   ico: "sparkles",  pasos: [6] },
  { t: "Duración, prácticas y presupuesto", s: "Cuánto dura y cuánto puedes pagar",  ico: "coins",     pasos: [7] },
  { t: "Dónde y cuándo",                s: "Comunidades y fecha de inicio",          ico: "pin",       pasos: [8] },
  { t: "Revisar y enviar",              s: "Un vistazo antes de enviarlo",           ico: "send",      pasos: [], resumen: true },
];
